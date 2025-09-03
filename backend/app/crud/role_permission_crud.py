# app/crud/role_permission_crud.py
from sqlmodel import Session, select
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.role_permission import RolePermission
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.role_permission_schema import RolePermissionCreate, RolePermissionUpdate
from sqlalchemy.orm import selectinload

def create_role_permission(db: Session, rp_in: RolePermissionCreate) -> RolePermission:
    """Create a new role-permission assignment"""
    try:
        # Verify that role and permission exist
        role = db.get(Role, rp_in.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        permission = db.get(Permission, rp_in.permission_id)
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found"
            )
        
        # Check if this specific role-permission combination already exists
        existing_rp = db.exec(
            select(RolePermission)
            .where(RolePermission.role_id == rp_in.role_id)
            .where(RolePermission.permission_id == rp_in.permission_id)
        ).first()
        
        if existing_rp:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This role-permission assignment already exists"
            )

        # Create role-permission instance
        db_rp = RolePermission(
            role_id=rp_in.role_id,
            permission_id=rp_in.permission_id
        )
        
        db.add(db_rp)
        db.commit()
        db.refresh(db_rp)
        return db_rp
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create role-permission assignment: {str(e)}"
        )

def get_role_permission(db: Session, role_id: str, permission_id: str) -> Optional[RolePermission]:  # Fixed: Changed from int to str (UUID)
    """Get a specific role-permission assignment"""
    try:
        return db.exec(
            select(RolePermission)
            .where(RolePermission.role_id == role_id)
            .where(RolePermission.permission_id == permission_id)
        ).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching role-permission assignment: {str(e)}"
        )

def get_permissions_for_role(db: Session, role_id: str) -> List[RolePermission]:  # Fixed: Changed from int to str (UUID)
    """Get all permissions assigned to a specific role"""
    try:
        return db.exec(
            select(RolePermission)
            .where(RolePermission.role_id == role_id)
            .options(selectinload(RolePermission.permission))
        ).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching permissions for role: {str(e)}"
        )

def get_roles_for_permission(db: Session, permission_id: str) -> List[RolePermission]:  # Fixed: Changed from int to str (UUID)
    """Get all roles that have a specific permission"""
    try:
        return db.exec(
            select(RolePermission)
            .where(RolePermission.permission_id == permission_id)
            .options(selectinload(RolePermission.role))
        ).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching roles for permission: {str(e)}"
        )

def get_all_role_permissions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    role_id_filter: Optional[str] = None,
    permission_id_filter: Optional[str] = None
) -> List[RolePermission]:
    """Get all role-permission assignments with optional filtering"""
    try:
        query = select(RolePermission).options(
            selectinload(RolePermission.role),
            selectinload(RolePermission.permission)
        )
        
        if role_id_filter:
            query = query.where(RolePermission.role_id == role_id_filter)
        
        if permission_id_filter:
            query = query.where(RolePermission.permission_id == permission_id_filter)
        
        return db.exec(query.offset(skip).limit(limit)).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching role-permission assignments: {str(e)}"
        )

def update_role_permission(
    db: Session, 
    role_id: str, 
    permission_id: str, 
    rp_update: RolePermissionUpdate
) -> Optional[RolePermission]:  # Fixed: Changed from int to str (UUID)
    """Update a role-permission assignment"""
    try:
        db_rp = get_role_permission(db, role_id, permission_id)
        if not db_rp:
            return None
        
        # Check for conflicts if updating
        update_data = rp_update.model_dump(exclude_unset=True)
        
        if "role_id" in update_data or "permission_id" in update_data:
            new_role_id = update_data.get("role_id", role_id)
            new_permission_id = update_data.get("permission_id", permission_id)
            
            # Check if new combination already exists
            existing_rp = db.exec(
                select(RolePermission)
                .where(RolePermission.role_id == new_role_id)
                .where(RolePermission.permission_id == new_permission_id)
            ).first()
            
            if existing_rp and (existing_rp.role_id != role_id or existing_rp.permission_id != permission_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This role-permission assignment already exists"
                )
        
        # Apply updates
        for key, value in update_data.items():
            setattr(db_rp, key, value)
        
        db.add(db_rp)
        db.commit()
        db.refresh(db_rp)
        return db_rp
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating role-permission assignment: {str(e)}"
        )

def delete_role_permission(db: Session, role_id: str, permission_id: str) -> bool:  # Fixed: Changed from int to str (UUID)
    """Delete a role-permission assignment"""
    try:
        db_rp = get_role_permission(db, role_id, permission_id)
        if not db_rp:
            return False
        
        db.delete(db_rp)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting role-permission assignment: {str(e)}"
        )

def bulk_assign_permissions_to_role(
    db: Session, 
    role_id: str, 
    permission_ids: List[str]
) -> List[RolePermission]:
    """Assign multiple permissions to a role"""
    try:
        # Verify role exists
        role = db.get(Role, role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # Verify all permissions exist
        for permission_id in permission_ids:
            permission = db.get(Permission, permission_id)
            if not permission:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Permission {permission_id} not found"
                )
        
        created_assignments = []
        for permission_id in permission_ids:
            # Check if assignment already exists
            existing_rp = db.exec(
                select(RolePermission)
                .where(RolePermission.role_id == role_id)
                .where(RolePermission.permission_id == permission_id)
            ).first()
            
            if not existing_rp:
                db_rp = RolePermission(
                    role_id=role_id,
                    permission_id=permission_id
                )
                db.add(db_rp)
                created_assignments.append(db_rp)
        
        db.commit()
        
        # Refresh all created assignments
        for assignment in created_assignments:
            db.refresh(assignment)
        
        return created_assignments
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error bulk assigning permissions: {str(e)}"
        )