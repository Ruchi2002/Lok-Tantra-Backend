# app/crud/role_crud.py
from sqlmodel import Session, select
from typing import List, Optional
from app.models.role import Role
from app.schemas.role_schema import RoleCreate, RoleUpdate

def create_role(db: Session, role_in: RoleCreate) -> Role:
    # Check for existing role name
    existing_role = db.exec(
        select(Role).where(Role.name == role_in.name)
    ).first()
    if existing_role:
        raise ValueError("Role with this name already exists.")

    db_role = Role.model_validate(role_in)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_role(db: Session, role_id: int) -> Optional[Role]:
    return db.get(Role, role_id)

def get_role_by_name(db: Session, role_name: str) -> Optional[Role]:
    return db.exec(select(Role).where(Role.name == role_name)).first()

def get_all_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.exec(select(Role)).offset(skip).limit(limit).all()

def update_role(db: Session, role_id: int, role_update: RoleUpdate) -> Optional[Role]:
    db_role = db.get(Role, role_id)
    if not db_role:
        return None

    role_data = role_update.model_dump(exclude_unset=True)
    for key, value in role_data.items():
        setattr(db_role, key, value)
    
    # Check for uniqueness if name is updated
    if "name" in role_data and role_data["name"] != db_role.name:
        existing_role = get_role_by_name(db, role_data["name"])
        if existing_role and existing_role.id != db_role.id:
            raise ValueError("Role with this name already exists.")

    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def delete_role(db: Session, role_id: int) -> bool:
    db_role = db.get(Role, role_id)
    if not db_role:
        return False
    db.delete(db_role)
    db.commit()
    return True