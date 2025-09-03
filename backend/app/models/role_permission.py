# app/models/role_permission.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column

# Import related models for type hinting
from .role import Role
from .permission import Permission

class RolePermission(SQLModel, table=True):
    __tablename__ = "role_permissions"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    
    role_id: str = Field(foreign_key="roles.id", index=True)
    permission_id: str = Field(foreign_key="permissions.id", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})

    role: "Role" = Relationship(back_populates="role_permissions_link")
    permission: "Permission" = Relationship(back_populates="role_permissions_link")