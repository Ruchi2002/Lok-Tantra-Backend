# app/routes/permission_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import Optional

from app.schemas.permission_schema import PermissionCreate, PermissionRead, PermissionUpdate
from app.crud.permission_crud import (
    create_permission, get_permission, get_all_permissions, update_permission, 
    delete_permission, get_permissions_by_category, get_permission_by_name
)
from app.models.permission import PermissionCategory
from database import get_session

router = APIRouter(prefix="/permissions", tags=["Permissions"])

@router.post("/", response_model=PermissionRead, status_code=status.HTTP_201_CREATED)
def create_permission_route(permission: PermissionCreate, db: Session = Depends(get_session)):
    """
    Create a new permission
    
    - **name**: Unique permission name
    - **display_name**: Human-readable name
    - **category**: Permission category (system, tenant, user, issue, visit, area, report, settings)
    - **description**: Optional description
    - **scope**: Permission scope (global, tenant, area)
    """
    return create_permission(db, permission)

@router.get("/{permission_id}", response_model=PermissionRead)
def read_permission_route(permission_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    """Get a specific permission by ID"""
    db_permission = get_permission(db, permission_id)
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Permission not found"
        )
    return db_permission

@router.get("/name/{permission_name}", response_model=PermissionRead)
def read_permission_by_name_route(permission_name: str, db: Session = Depends(get_session)):
    """Get a specific permission by name"""
    db_permission = get_permission_by_name(db, permission_name)
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Permission not found"
        )
    return db_permission

@router.get("/", response_model=list[PermissionRead])
def read_all_permissions_route(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    category: Optional[PermissionCategory] = Query(None, description="Filter by permission category"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_session)
):
    """
    Get all permissions with optional filtering
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **category**: Filter by permission category
    - **is_active**: Filter by active status
    """
    return get_all_permissions(db, skip, limit, category, is_active)

@router.get("/category/{category}", response_model=list[PermissionRead])
def read_permissions_by_category_route(category: PermissionCategory, db: Session = Depends(get_session)):
    """Get all permissions for a specific category"""
    return get_permissions_by_category(db, category)

@router.put("/{permission_id}", response_model=PermissionRead)
def update_permission_route(
    permission_id: str,  # Fixed: Changed from int to str (UUID)
    permission_update: PermissionUpdate, 
    db: Session = Depends(get_session)
):
    """
    Update permission information
    
    - Only provided fields will be updated
    - Cannot update system permissions
    """
    updated_permission = update_permission(db, permission_id, permission_update)
    if not updated_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Permission not found"
        )
    return updated_permission

@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_permission_route(permission_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    """
    Delete a permission
    
    - Cannot delete system permissions
    - Returns 204 No Content on success
    """
    success = delete_permission(db, permission_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Permission not found"
        )
    # No content returned for 204