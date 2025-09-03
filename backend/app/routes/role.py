# app/routes/role_routes.py (Updated)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select # 'select' is used, so it's good to include it
from sqlalchemy.orm import selectinload # For loading relationships
from typing import List # <--- ADDED: For List type hint

# --- ADDED IMPORTS FOR MODELS AND SCHEMAS ---
from app.models.role import Role # <--- ADDED: Required for select(Role)
from app.models.role_permission import RolePermission # <--- ADDED: Required for selectinload(RolePermission.permission)
from app.schemas.role_schema import RoleCreate, RoleRead, RoleUpdate
from app.schemas.role_schema import UserReadForRole, PermissionReadForRole # <--- ADDED: Required for populating RoleRead.users/permissions
# --- END ADDED IMPORTS ---

from app.crud.role_crud import (
    create_role, get_role, get_all_roles, update_role, delete_role
)
from database import get_session

router = APIRouter(prefix="/roles", tags=["Roles"])

@router.post("/", response_model=RoleRead, status_code=status.HTTP_201_CREATED)
def create_role_route(role: RoleCreate, db: Session = Depends(get_session)):
    try:
        return create_role(db, role)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.get("/{role_id}", response_model=RoleRead)
def read_role_route(role_id: int, db: Session = Depends(get_session)):
    # To load users and permissions eagerly for RoleRead response
    db_role = db.exec(
        select(Role)
        .where(Role.id == role_id)
        .options(
            selectinload(Role.users), # Load users linked to this role
            selectinload(Role.role_permissions_link).selectinload(RolePermission.permission) # Load permissions via the link table
        )
    ).first()

    if not db_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    
    # Manually populate permissions list in the RoleRead schema for the response
    # This is because 'permissions' in RoleRead is not a direct SQLModel Relationship
    # but a derived list from role_permissions_link.
    role_read_schema = RoleRead.model_validate(db_role)
    role_read_schema.permissions = [
        PermissionReadForRole.model_validate(rp.permission)
        for rp in db_role.role_permissions_link
    ]
    # Although UserReadForRole is in the schema, it will be populated by model_validate
    # if Role.users is loaded, as 'users' is a direct SQLModel Relationship.
    # No explicit loop needed here for users if the schema is correctly set up with from_attributes=True

    return role_read_schema


@router.get("/", response_model=List[RoleRead]) # Changed to List from list for explicit typing
def read_all_roles_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    # For listing all roles, eager loading might be heavy. Consider a lighter schema.
    # For now, let's include it for consistency, but be aware of performance implications.
    roles = db.exec(
        select(Role)
        .offset(skip)
        .limit(limit)
        .options(
            selectinload(Role.users),
            selectinload(Role.role_permissions_link).selectinload(RolePermission.permission)
        )
    ).all()
    
    # Manually populate permissions list for each role
    result_roles = []
    for role_obj in roles: # Renamed 'role' to 'role_obj' to avoid conflict with the 'role' model import
        role_read_schema = RoleRead.model_validate(role_obj)
        role_read_schema.permissions = [
            PermissionReadForRole.model_validate(rp.permission)
            for rp in role_obj.role_permissions_link
        ]
        result_roles.append(role_read_schema)
    
    return result_roles


@router.put("/{role_id}", response_model=RoleRead)
def update_role_route(role_id: int, role_update: RoleUpdate, db: Session = Depends(get_session)):
    try:
        updated_role = update_role(db, role_id, role_update)
        if not updated_role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
        # For the response, you might need to re-fetch with relationships or populate manually
        # as update_role typically doesn't return relationships by default
        updated_role_with_rels = db.exec(
            select(Role)
            .where(Role.id == updated_role.id)
            .options(
                selectinload(Role.users),
                selectinload(Role.role_permissions_link).selectinload(RolePermission.permission)
            )
        ).first()
        if not updated_role_with_rels: # Safety check
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated role with relationships.")

        role_read_schema = RoleRead.model_validate(updated_role_with_rels)
        role_read_schema.permissions = [
            PermissionReadForRole.model_validate(rp.permission)
            for rp in updated_role_with_rels.role_permissions_link
        ]
        return role_read_schema
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role_route(role_id: int, db: Session = Depends(get_session)):
    success = delete_role(db, role_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    # No content returned for 204