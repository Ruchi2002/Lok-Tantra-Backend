# app/routes/super_admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload # For loading relationships
from typing import List

from app.schemas.superadmin_schema import SuperAdminCreate, SuperAdminRead, SuperAdminUpdate, SuperAdminPasswordUpdate, UserReadForSuperAdmin
from app.crud.superadmin import (
    create_super_admin, get_super_admin, get_all_super_admins, update_super_admin, delete_super_admin,
    update_super_admin_password
)
from database import get_db # Using get_db as per your preference
from app.models.superadmin import SuperAdmin # Import the model for select()
from app.models.user import User # Import User model for selectinload if needed

# MISSING IMPORT - Add this
from app.utils.password_utils import verify_password  # Or wherever your verify_password function is located

router = APIRouter(prefix="/super-admins", tags=["Super Admin"])

@router.post("/", response_model=SuperAdminRead, status_code=status.HTTP_201_CREATED)
def create_super_admin_route(super_admin: SuperAdminCreate, db: Session = Depends(get_db)):
    try:
        # Optional: Verify if created_by user exists
        # from app.crud.user_crud import get_user
        # if super_admin.created_by and not get_user(db, super_admin.created_by):
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator user not found.")
        
        return create_super_admin(db, super_admin)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.get("/{super_admin_id}", response_model=SuperAdminRead)
def read_super_admin_route(super_admin_id: int, db: Session = Depends(get_db)):
    db_super_admin = db.exec(
        select(SuperAdmin)
        .where(SuperAdmin.id == super_admin_id)
        .options(selectinload(SuperAdmin.creator)) # Eager load the creator user
    ).first()
    
    if not db_super_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SuperAdmin not found")
    return db_super_admin

@router.get("/", response_model=List[SuperAdminRead])
def read_all_super_admins_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    super_admins = db.exec(
        select(SuperAdmin)
        .offset(skip)
        .limit(limit)
        .options(selectinload(SuperAdmin.creator)) # Eager load the creator user
    ).all()
    return super_admins

@router.put("/{super_admin_id}", response_model=SuperAdminRead)
def update_super_admin_route(super_admin_id: int, super_admin_update: SuperAdminUpdate, db: Session = Depends(get_db)):
    try:
        updated_super_admin = update_super_admin(db, super_admin_id, super_admin_update)
        if not updated_super_admin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SuperAdmin not found")
        
        # Re-fetch with relationships for the response
        updated_super_admin_with_rels = db.exec(
            select(SuperAdmin)
            .where(SuperAdmin.id == updated_super_admin.id)
            .options(selectinload(SuperAdmin.creator))
        ).first()
        if not updated_super_admin_with_rels:  # FIXED: Corrected variable name
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated SuperAdmin with relationships.")
        
        return updated_super_admin_with_rels
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.patch("/{super_admin_id}/password", response_model=SuperAdminRead)
def update_super_admin_password_route(super_admin_id: int, password_update: SuperAdminPasswordUpdate, db: Session = Depends(get_db)):
    db_super_admin = get_super_admin(db, super_admin_id)
    if not db_super_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SuperAdmin not found")
    
    # Verify old password (optional, but good practice for security)
    if not verify_password(password_update.old_password, db_super_admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid old password.")

    updated_super_admin = update_super_admin_password(db, super_admin_id, password_update.new_password)
    if not updated_super_admin: # Should not happen if get_super_admin passed
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update password.")
    
    # Re-fetch with relationships for the response
    updated_super_admin_with_rels = db.exec(
        select(SuperAdmin)
        .where(SuperAdmin.id == updated_super_admin.id)
        .options(selectinload(SuperAdmin.creator))
    ).first()
    if not updated_super_admin_with_rels:  # FIXED: Corrected variable name
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve updated SuperAdmin with relationships.")
    
    return updated_super_admin_with_rels


@router.delete("/{super_admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_super_admin_route(super_admin_id: int, db: Session = Depends(get_db)):
    success = delete_super_admin(db, super_admin_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SuperAdmin not found")
    # No content returned for 204