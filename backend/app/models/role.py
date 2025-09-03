from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column
from enum import Enum

class RoleType(str, Enum):
    """Enterprise role types"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MEMBER = "member"

class RoleScope(str, Enum):
    """Role scope for multi-tenancy"""
    GLOBAL = "global"      # System-wide (SuperAdmin only)
    TENANT = "tenant"      # Organization-specific
    AREA = "area"          # Area-specific (future)

class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    
    # Role identification
    name: str = Field(unique=True, index=True, nullable=False)
    role_type: RoleType = Field(index=True, nullable=False)
    scope: RoleScope = Field(default=RoleScope.TENANT, index=True)
    
    # Role metadata
    description: Optional[str] = None
    is_active: bool = Field(default=True, index=True)
    is_system_role: bool = Field(default=False)  # System-created roles cannot be deleted
    
    # Hierarchy (for future role inheritance)
    parent_role_id: Optional[str] = Field(default=None, foreign_key="roles.id")
    
    # Audit timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationships
    users: List["User"] = Relationship(back_populates="role")
    role_permissions_link: List["RolePermission"] = Relationship(back_populates="role")
    child_roles: List["Role"] = Relationship(
        back_populates="parent_role",
        sa_relationship_kwargs={"foreign_keys": "[Role.parent_role_id]"}
    )
    parent_role: Optional["Role"] = Relationship(
        back_populates="child_roles",
        sa_relationship_kwargs={"foreign_keys": "[Role.parent_role_id]", "remote_side": "[Role.id]"}
    )