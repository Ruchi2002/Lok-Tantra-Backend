# app/models/permission.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column
from enum import Enum

class PermissionCategory(str, Enum):
    """Permission categories for organization"""
    SYSTEM = "system"           # System-level permissions
    TENANT = "tenant"           # Tenant management
    USER = "user"               # User management
    ISSUE = "issue"             # Issue management
    VISIT = "visit"             # Visit management
    AREA = "area"               # Area management
    REPORT = "report"           # Reporting and analytics
    SETTINGS = "settings"       # System settings

class Permission(SQLModel, table=True):
    __tablename__ = "permissions"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    
    # Permission identification
    name: str = Field(unique=True, index=True, nullable=False)
    display_name: str = Field(nullable=False)
    category: PermissionCategory = Field(index=True, nullable=False)
    
    # Permission metadata
    description: Optional[str] = None
    is_active: bool = Field(default=True, index=True)
    is_system_permission: bool = Field(default=False)
    
    # Scope and access level
    scope: str = Field(default="tenant", index=True)  # global, tenant, area
    
    # Audit timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Many-to-Many relationship with Role through RolePermission
    role_permissions_link: List["RolePermission"] = Relationship(back_populates="permission")