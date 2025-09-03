# app/crud/super_admin_crud.py
from sqlmodel import Session, select
from typing import List, Optional
from app.models.superadmin import SuperAdmin
from app.schemas.superadmin_schema import SuperAdminCreate, SuperAdminUpdate
from app.core.auth import hash_password, verify_password

def create_super_admin(db: Session, super_admin_in: SuperAdminCreate) -> SuperAdmin:
    # Check for existing email
    existing_super_admin = db.exec(
        select(SuperAdmin).where(SuperAdmin.email == super_admin_in.email)
    ).first()
    if existing_super_admin:
        raise ValueError("SuperAdmin with this email already exists.")

    # Hash the password
    hashed_password = hash_password(super_admin_in.password)

    db_super_admin = SuperAdmin(
        name=super_admin_in.name,
        email=super_admin_in.email,
        password_hash=hashed_password, # Store the hashed password
        is_active=super_admin_in.is_active,
        created_by=super_admin_in.created_by
    )
    db.add(db_super_admin)
    db.commit()
    db.refresh(db_super_admin)
    return db_super_admin

def get_super_admin(db: Session, super_admin_id: int) -> Optional[SuperAdmin]:
    return db.get(SuperAdmin, super_admin_id)

def get_super_admin_by_email(db: Session, email: str) -> Optional[SuperAdmin]:
    return db.exec(select(SuperAdmin).where(SuperAdmin.email == email)).first()

def get_all_super_admins(db: Session, skip: int = 0, limit: int = 100) -> List[SuperAdmin]:
    return db.exec(select(SuperAdmin)).offset(skip).limit(limit).all()

def update_super_admin(db: Session, super_admin_id: int, super_admin_update: SuperAdminUpdate) -> Optional[SuperAdmin]:
    db_super_admin = db.get(SuperAdmin, super_admin_id)
    if not db_super_admin:
        return None

    super_admin_data = super_admin_update.model_dump(exclude_unset=True)
    for key, value in super_admin_data.items():
        setattr(db_super_admin, key, value)
    
    # Check for uniqueness if email is updated
    if "email" in super_admin_data and super_admin_data["email"] != db_super_admin.email:
        existing_super_admin = get_super_admin_by_email(db, super_admin_data["email"])
        if existing_super_admin and existing_super_admin.id != db_super_admin.id:
            raise ValueError("SuperAdmin with this email already exists.")

    db.add(db_super_admin)
    db.commit()
    db.refresh(db_super_admin)
    return db_super_admin

def delete_super_admin(db: Session, super_admin_id: int) -> bool:
    db_super_admin = db.get(SuperAdmin, super_admin_id)
    if not db_super_admin:
        return False
    db.delete(db_super_admin)
    db.commit()
    return True

def update_super_admin_password(db: Session, super_admin_id: int, new_password: str) -> Optional[SuperAdmin]:
    db_super_admin = db.get(SuperAdmin, super_admin_id)
    if not db_super_admin:
        return None
    db_super_admin.password_hash = hash_password(new_password)
    db.add(db_super_admin)
    db.commit()
    db.refresh(db_super_admin)
    return db_super_admin