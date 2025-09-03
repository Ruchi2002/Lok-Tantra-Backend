# app/routes/role_permission_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.schemas.role_permission_schema import RolePermissionCreate, RolePermissionRead, RolePermissionUpdate
from app.crud.role_permission_crud import (
    create_role_permission, get_role_permission, delete_role_permission,
    get_permissions_for_role, get_roles_for_permission, get_all_role_permissions,
    update_role_permission, bulk_assign_permissions_to_role
)
from app.models.role_permission import RolePermission
from database import get_session

router = APIRouter(prefix="/role-permissions", tags=["Role Permissions"])

@router.post("/", response_model=RolePermissionRead, status_code=status.HTTP_201_CREATED)
def assign_role_permission(rp: RolePermissionCreate, db: Session = Depends(get_session)):
    """
    Assign a permission to a role
    
    - **role_id**: UUID of the role
    - **permission_id**: UUID of the permission
    """
    return create_role_permission(db, rp)

@router.post("/bulk-assign/{role_id}", response_model=List[RolePermissionRead], status_code=status.HTTP_201_CREATED)
def bulk_assign_permissions_route(
    role_id: str,  # Fixed: Changed from int to str (UUID)
    permission_ids: List[str],  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """
    Assign multiple permissions to a role
    
    - **role_id**: UUID of the role
    - **permission_ids**: List of permission UUIDs to assign
    """
    return bulk_assign_permissions_to_role(db, role_id, permission_ids)

@router.get("/", response_model=List[RolePermissionRead])
def read_all_role_permissions_route(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    role_id: Optional[str] = Query(None, description="Filter by role ID"),  # Fixed: Changed from int to str (UUID)
    permission_id: Optional[str] = Query(None, description="Filter by permission ID"),  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """
    Get all role-permission assignments with optional filtering
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **role_id**: Filter by specific role ID
    - **permission_id**: Filter by specific permission ID
    """
    return get_all_role_permissions(db, skip, limit, role_id, permission_id)

# IMPORTANT: More specific routes must come before general ones
@router.get("/by-role/{role_id}", response_model=List[RolePermissionRead])
def read_permissions_for_role_route(
    role_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """Get all permissions assigned to a specific role"""
    db_rps = get_permissions_for_role(db, role_id)
    return db_rps

@router.get("/by-permission/{permission_id}", response_model=List[RolePermissionRead])
def read_roles_for_permission_route(
    permission_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """Get all roles that have a specific permission"""
    db_rps = get_roles_for_permission(db, permission_id)
    return db_rps

# This route must come AFTER the more specific routes above
@router.get("/{role_id}/{permission_id}", response_model=RolePermissionRead)
def read_role_permission_route(
    role_id: str,  # Fixed: Changed from int to str (UUID)
    permission_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """Get a specific role-permission assignment"""
    # To eager load the related Role and Permission objects for response
    db_rp = db.exec(
        select(RolePermission)
        .where(RolePermission.role_id == role_id)
        .where(RolePermission.permission_id == permission_id)
        .options(selectinload(RolePermission.role), selectinload(RolePermission.permission))
    ).first()

    if not db_rp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Role-Permission assignment not found"
        )
    return db_rp

@router.put("/{role_id}/{permission_id}", response_model=RolePermissionRead)
def update_role_permission_route(
    role_id: str,  # Fixed: Changed from int to str (UUID)
    permission_id: str,  # Fixed: Changed from int to str (UUID)
    rp_update: RolePermissionUpdate,
    db: Session = Depends(get_session)
):
    """
    Update a role-permission assignment
    
    - Only provided fields will be updated
    - Cannot create duplicate assignments
    """
    updated_rp = update_role_permission(db, role_id, permission_id, rp_update)
    if not updated_rp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Role-Permission assignment not found"
        )
    return updated_rp

@router.delete("/{role_id}/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def unassign_role_permission(
    role_id: str,  # Fixed: Changed from int to str (UUID)
    permission_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """
    Remove a permission from a role
    
    - Returns 204 No Content on success
    """
    success = delete_role_permission(db, role_id, permission_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Role-Permission assignment not found"
        )
    # No content returned for 204