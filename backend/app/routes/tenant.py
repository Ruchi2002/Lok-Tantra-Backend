from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session
from typing import Optional
from database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.models.tenant import Tenant, TenantStatus
from app.schemas.tenant_schema import TenantCreate, TenantRead, TenantUpdate, TenantLogin
from app.crud.tenant_crud import (
    create_tenant, get_tenant, get_all_tenants, update_tenant, 
    update_tenant_status, delete_tenant, permanent_delete_tenant, authenticate_tenant
)

router = APIRouter(prefix="/tenants", tags=["Tenants"])

# Create Tenant
@router.post("/", response_model=TenantRead, status_code=status.HTTP_201_CREATED)
def create_tenant_route(tenant: TenantCreate, db: Session = Depends(get_session)):
    """
    Create a new tenant organization
    
    - **name**: Organization name (must be unique)
    - **email**: Contact email (must be unique)
    - **phone**: Contact phone number (optional)
    - **password**: Admin password (min 8 characters)
    - **status**: Account status (active/inactive)
    """
    return create_tenant(db, tenant)

# Get all Tenants
@router.get("/", response_model=list[TenantRead])
def get_all_tenants_route(
    skip: int = 0, 
    limit: int = 100, 
    status_filter: Optional[TenantStatus] = None,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all tenants with optional filtering
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **status_filter**: Filter by tenant status (active/inactive)
    """
    return get_all_tenants(db, skip, limit, status_filter)

# Get Tenant by ID
@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant_by_id_route(tenant_id: str, db: Session = Depends(get_session)):
    """Get a specific tenant by ID"""
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant not found"
        )
    return tenant

# Update Tenant
@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant_route(
    tenant_id: str,
    tenant_update: TenantUpdate, 
    db: Session = Depends(get_session)
):
    """
    Update tenant information
    
    - Only provided fields will be updated
    - Password will be hashed if provided
    """
    updated_tenant = update_tenant(db, tenant_id, tenant_update)
    if not updated_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant not found"
        )
    return updated_tenant

# Deactivate/Activate Tenant
@router.patch("/{tenant_id}/status", response_model=TenantRead)
def update_tenant_status_route(
    tenant_id: str,
    new_status: TenantStatus, 
    db: Session = Depends(get_session)
):
    """Update tenant status (activate/deactivate)"""
    updated_tenant = update_tenant_status(db, tenant_id, new_status)
    if not updated_tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant not found"
        )
    return updated_tenant

# Delete Tenant (Soft delete by setting status to inactive)
@router.delete("/{tenant_id}")
def delete_tenant_route(tenant_id: str, db: Session = Depends(get_session)):
    """
    Soft delete tenant by setting status to inactive
    Use force=true query parameter for hard delete (permanent)
    """
    success = delete_tenant(db, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant not found"
        )
    return {"detail": "Tenant deactivated successfully"}

# Hard Delete Tenant (Permanent deletion)
@router.delete("/{tenant_id}/permanent")
def permanent_delete_tenant_route(tenant_id: str, db: Session = Depends(get_session)):
    """Permanently delete tenant and all related data"""
    success = permanent_delete_tenant(db, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Tenant not found"
        )
    return {"detail": "Tenant permanently deleted"}

# Tenant Login
@router.post("/login")
def tenant_login_route(login_data: TenantLogin, db: Session = Depends(get_session)):
    """Authenticate tenant using email and password"""
    tenant = authenticate_tenant(db, login_data.email, login_data.password)
    
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    return {
        "message": "Login successful",
        "tenant_id": tenant.id,
        "tenant_name": tenant.name,
        "status": tenant.status
    }