# 📂 backend/app/crud/tenant_crud.py
from sqlmodel import Session, select
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.tenant import Tenant, TenantStatus
from app.schemas.tenant_schema import TenantCreate, TenantUpdate
from app.core.auth import hash_password, verify_password

def create_tenant(db: Session, tenant: TenantCreate) -> Tenant:
    """Create a new tenant with password hashing"""
    try:
        # Check if tenant with same name or email already exists
        existing_tenant = db.exec(
            select(Tenant).where(
                (Tenant.name == tenant.name) | (Tenant.email == tenant.email)
            )
        ).first()
        
        if existing_tenant:
            if existing_tenant.name == tenant.name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tenant name already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Hash the password
        hashed_password = hash_password(tenant.password)
        
        # Create tenant instance
        db_tenant = Tenant(
            name=tenant.name,
            email=tenant.email,
            phone=tenant.phone,
            password=hashed_password,
            status=tenant.status
        )
        
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tenant: {str(e)}"
        )

def get_tenant(db: Session, tenant_id: str) -> Optional[Tenant]:
    """Get a tenant by ID"""
    try:
        return db.get(Tenant, tenant_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tenant: {str(e)}"
        )

def get_tenant_by_email(db: Session, email: str) -> Optional[Tenant]:
    """Get a tenant by email"""
    try:
        statement = select(Tenant).where(Tenant.email == email)
        return db.exec(statement).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tenant by email: {str(e)}"
        )

def get_all_tenants(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status_filter: Optional[TenantStatus] = None
) -> List[Tenant]:
    """Get all tenants with optional filtering"""
    try:
        query = select(Tenant)
        
        if status_filter:
            query = query.where(Tenant.status == status_filter)
        
        return db.exec(query.offset(skip).limit(limit)).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching tenants: {str(e)}"
        )

def update_tenant(db: Session, tenant_id: str, tenant_update: TenantUpdate) -> Optional[Tenant]:
    """Update a tenant"""
    try:
        db_tenant = db.get(Tenant, tenant_id)
        if not db_tenant:
            return None
        
        # Check for name/email conflicts if updating
        update_data = tenant_update.model_dump(exclude_unset=True)
        
        if "name" in update_data or "email" in update_data:
            existing_tenant = db.exec(
                select(Tenant).where(
                    (Tenant.name == update_data.get("name", db_tenant.name)) | 
                    (Tenant.email == update_data.get("email", db_tenant.email))
                ).where(Tenant.id != tenant_id)
            ).first()
            
            if existing_tenant:
                if existing_tenant.name == update_data.get("name", db_tenant.name):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Tenant name already exists"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already exists"
                    )
        
        # Hash password if provided
        if "password" in update_data and update_data["password"]:
            update_data["password"] = hash_password(update_data["password"])
        
        # Apply updates
        for key, value in update_data.items():
            setattr(db_tenant, key, value)
        
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating tenant: {str(e)}"
        )

def update_tenant_status(db: Session, tenant_id: str, new_status: TenantStatus) -> Optional[Tenant]:
    """Update tenant status"""
    try:
        db_tenant = db.get(Tenant, tenant_id)
        if not db_tenant:
            return None
        
        db_tenant.status = new_status
        db.add(db_tenant)
        db.commit()
        db.refresh(db_tenant)
        return db_tenant
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating tenant status: {str(e)}"
        )

def delete_tenant(db: Session, tenant_id: str) -> bool:
    """Soft delete tenant by setting status to inactive"""
    try:
        db_tenant = db.get(Tenant, tenant_id)
        if not db_tenant:
            return False
        
        db_tenant.status = TenantStatus.INACTIVE
        db.add(db_tenant)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting tenant: {str(e)}"
        )

def permanent_delete_tenant(db: Session, tenant_id: str) -> bool:
    """Permanently delete tenant"""
    try:
        db_tenant = db.get(Tenant, tenant_id)
        if not db_tenant:
            return False
        
        db.delete(db_tenant)
        db.commit()
        return True
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error permanently deleting tenant: {str(e)}"
        )

def authenticate_tenant(db: Session, email: str, password: str) -> Optional[Tenant]:
    """Authenticate tenant using email and password"""
    try:
        tenant = get_tenant_by_email(db, email)
        if not tenant:
            return None
        
        if tenant.status == TenantStatus.INACTIVE:
            return None
        
        if not verify_password(password, tenant.password):
            return None
        
        return tenant
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error authenticating tenant: {str(e)}"
        )
