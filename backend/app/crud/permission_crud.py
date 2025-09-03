# app/crud/permission_crud.py
from sqlmodel import Session, select
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.permission import Permission, PermissionCategory
from app.schemas.permission_schema import PermissionCreate, PermissionUpdate

def create_permission(db: Session, permission_in: PermissionCreate) -> Permission:
    """Create a new permission"""
    try:
        # Check for existing permission name
        existing_permission = db.exec(
            select(Permission).where(Permission.name == permission_in.name)
        ).first()
        
        if existing_permission:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Permission with this name already exists"
            )

        # Create permission instance
        db_permission = Permission(
            name=permission_in.name,
            display_name=permission_in.display_name,
            category=permission_in.category,
            description=permission_in.description,
            is_active=permission_in.is_active,
            is_system_permission=permission_in.is_system_permission,
            scope=permission_in.scope
        )
        
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create permission: {str(e)}"
        )

def get_permission(db: Session, permission_id: str) -> Optional[Permission]:  # Fixed: Changed from int to str (UUID)
    """Get a permission by ID"""
    try:
        return db.get(Permission, permission_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching permission: {str(e)}"
        )

def get_permission_by_name(db: Session, permission_name: str) -> Optional[Permission]:
    """Get a permission by name"""
    try:
        return db.exec(select(Permission).where(Permission.name == permission_name)).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching permission by name: {str(e)}"
        )

def get_all_permissions(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    category_filter: Optional[PermissionCategory] = None,
    is_active_filter: Optional[bool] = None
) -> List[Permission]:
    """Get all permissions with optional filtering"""
    try:
        query = select(Permission)
        
        if category_filter:
            query = query.where(Permission.category == category_filter)
        
        if is_active_filter is not None:
            query = query.where(Permission.is_active == is_active_filter)
        
        return db.exec(query.offset(skip).limit(limit)).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching permissions: {str(e)}"
        )

def update_permission(db: Session, permission_id: str, permission_update: PermissionUpdate) -> Optional[Permission]:  # Fixed: Changed from int to str (UUID)
    """Update a permission"""
    try:
        db_permission = db.get(Permission, permission_id)
        if not db_permission:
            return None

        # Check for name conflicts if updating
        update_data = permission_update.model_dump(exclude_unset=True)
        
        if "name" in update_data and update_data["name"] != db_permission.name:
            existing_permission = get_permission_by_name(db, update_data["name"])
            if existing_permission and existing_permission.id != permission_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Permission with this name already exists"
                )

        # Apply updates
        for key, value in update_data.items():
            setattr(db_permission, key, value)
        
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating permission: {str(e)}"
        )

def delete_permission(db: Session, permission_id: str) -> bool:  # Fixed: Changed from int to str (UUID)
    """Delete a permission"""
    try:
        db_permission = db.get(Permission, permission_id)
        if not db_permission:
            return False
        
        # Prevent deletion of system permissions
        if db_permission.is_system_permission:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete system permissions"
            )
        
        db.delete(db_permission)
        db.commit()
        return True
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting permission: {str(e)}"
        )

def get_permissions_by_category(db: Session, category: PermissionCategory) -> List[Permission]:
    """Get all permissions for a specific category"""
    try:
        return db.exec(select(Permission).where(Permission.category == category)).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching permissions by category: {str(e)}"
        )