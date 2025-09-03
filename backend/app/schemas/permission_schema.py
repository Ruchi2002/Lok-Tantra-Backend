# app/schemas/permission_schema.py
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.permission import PermissionCategory

class PermissionBase(BaseModel):
    name: str
    display_name: str
    category: PermissionCategory
    description: Optional[str] = None
    is_active: bool = True
    is_system_permission: bool = False
    scope: str = "tenant"

class PermissionCreate(PermissionBase):
    pass

class PermissionRead(PermissionBase):
    id: str  # Fixed: Changed from int to str (UUID)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    category: Optional[PermissionCategory] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_system_permission: Optional[bool] = None
    scope: Optional[str] = None

    @field_validator("scope")
    @classmethod
    def validate_scope(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ["global", "tenant", "area"]:
            raise ValueError("Scope must be one of: global, tenant, area")
        return v