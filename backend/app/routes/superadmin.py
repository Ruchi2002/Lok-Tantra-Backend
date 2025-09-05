# app/routes/super_admin_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload # For loading relationships
from typing import List

from app.schemas.superadmin_schema import SuperAdminCreate, SuperAdminRead, SuperAdminUpdate, SuperAdminPasswordUpdate, UserReadForSuperAdmin
from app.schemas.user_schema import UserCreate, UserRead, UserReadWithPassword
from app.schemas.tenant_schema import TenantCreate, TenantRead, TenantReadWithPassword
from app.crud.superadmin import (
    create_super_admin, get_super_admin, get_all_super_admins, update_super_admin, delete_super_admin,
    update_super_admin_password
)
from app.crud import user_crud as crud_user
from app.crud.tenant_crud import create_tenant, get_all_tenants
from database import get_db # Using get_db as per your preference
from app.models.superadmin import SuperAdmin # Import the model for select()
from app.models.user import User # Import User model for selectinload if needed
from app.models.role import Role
from app.models.tenant import Tenant

# MISSING IMPORT - Add this
from app.utils.password_utils import verify_password  # Or wherever your verify_password function is located
from app.core.auth import get_current_user
from app.models.user import User
from app.models.tenant import Tenant
from app.models.superadmin import SuperAdmin

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

def get_user_role_name(current_user):
    """Get role name from current user (handles User, Tenant, and SuperAdmin objects)"""
    if isinstance(current_user, SuperAdmin):
        return "super_admin"
    elif isinstance(current_user, Tenant):
        return "tenant"
    elif isinstance(current_user, User):
        if hasattr(current_user, 'role') and current_user.role:
            return current_user.role.name.lower()
        return "user"
    return "unknown"

def require_super_admin_or_admin_access(current_user):
    """Check if user has super admin or admin access"""
    role_name = get_user_role_name(current_user)
    allowed_roles = ["super_admin", "admin", "tenant"]
    
    if role_name not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Super admin or admin privileges required."
        )
    return True

# ===== SPECIFIC ROUTES (must come before parameterized routes) =====

@router.get("/all-tenants", response_model=List[TenantRead])
def get_all_tenants_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all tenants - Super Admin, Admin, or Tenant access
    """
    try:
        # Check access permissions
        require_super_admin_or_admin_access(current_user)
        return get_all_tenants(db, skip, limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tenants: {str(e)}"
        )

@router.get("/all-tenants-with-passwords", response_model=List[TenantReadWithPassword])
def get_all_tenants_with_passwords_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all tenants with plain passwords - Super Admin access only
    """
    try:
        # Check if user is super admin
        if not isinstance(current_user, SuperAdmin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admins can view passwords"
            )
        
        # Get all tenants with passwords
        tenants = db.exec(
            select(Tenant)
            .offset(skip)
            .limit(limit)
        ).all()
        
        return tenants
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tenants with passwords: {str(e)}"
        )

@router.get("/all-admins", response_model=List[UserRead])
def get_all_admins_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all Admin users - Super Admin, Admin, or Tenant access
    """
    try:
        # Check access permissions
        require_super_admin_or_admin_access(current_user)
        # Get Admin role
        admin_role = db.exec(select(Role).where(Role.name == "Admin")).first()
        if not admin_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admin role not found in system"
            )
        
        # Get all users with Admin role
        admins = db.exec(
            select(User)
            .where(User.role_id == admin_role.id)
            .offset(skip)
            .limit(limit)
        ).all()
        
        return admins
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admins: {str(e)}"
        )

@router.get("/all-admins-with-passwords", response_model=List[UserReadWithPassword])
def get_all_admins_with_passwords_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all Admin users with plain passwords - Super Admin access only
    """
    try:
        # Check if user is super admin
        if not isinstance(current_user, SuperAdmin):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only Super Admins can view passwords"
            )
        
        # Get Admin role
        admin_role = db.exec(select(Role).where(Role.name == "Admin")).first()
        if not admin_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admin role not found in system"
            )
        
        # Get all users with Admin role
        admins = db.exec(
            select(User)
            .where(User.role_id == admin_role.id)
            .offset(skip)
            .limit(limit)
        ).all()
        
        return admins
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admins with passwords: {str(e)}"
        )

@router.post("/create-tenant", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
def create_tenant_route(
    tenant_data: TenantCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new Tenant organization - Super Admin, Admin, or Tenant access
    
    - **name**: Organization name (must be unique)
    - **email**: Contact email (must be unique)
    - **phone**: Contact phone number (optional)
    - **password**: Admin password (min 8 characters)
    - **status**: Account status (active/inactive)
    """
    try:
        # Check access permissions
        require_super_admin_or_admin_access(current_user)
        return create_tenant(db, tenant_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Tenant: {str(e)}"
        )

@router.post("/create-admin", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_admin_route(
    admin_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new Admin user - Super Admin, Admin, or Tenant access
    
    - **name**: Admin's full name
    - **email**: Admin's email (must be unique)
    - **password**: Admin's password
    - **phone**: Admin's phone number (optional)
    - **tenant_id**: Tenant ID to assign the admin to (optional)
    """
    try:
        # Check access permissions
        require_super_admin_or_admin_access(current_user)
        # Check if email already exists
        existing_user = crud_user.get_user_by_email(db, admin_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Get Admin role
        admin_role = db.exec(select(Role).where(Role.name == "Admin")).first()
        if not admin_role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Admin role not found in system"
            )
        
        # Create user data with Admin role
        user_data = UserCreate(
            name=admin_data.name,
            email=admin_data.email,
            password=admin_data.password,
            phone=admin_data.phone,
            role_id=admin_role.id,
            tenant_id=admin_data.tenant_id,
            status="active"
        )
        
        # Create the admin user
        new_admin = crud_user.create_user(db, user_data)
        
        return new_admin
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create Admin: {str(e)}"
        )

# ===== ORIGINAL SUPER ADMIN ROUTES =====

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
