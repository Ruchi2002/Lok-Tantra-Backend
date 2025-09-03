# app/schemas/role_permission_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Import nested schemas if you want to embed role/permission details
class RoleBaseReadForRolePermission(BaseModel):
    id: str  # Fixed: Changed from int to str (UUID)
    name: str
    class Config:
        from_attributes = True

class PermissionBaseReadForRolePermission(BaseModel):
    id: str  # Fixed: Changed from int to str (UUID)
    name: str  # Fixed: Changed from permission_name to name
    display_name: str
    category: str
    class Config:
        from_attributes = True

class RolePermissionBase(BaseModel):
    role_id: str  # Fixed: Changed from int to str (UUID)
    permission_id: str  # Fixed: Changed from int to str (UUID)

class RolePermissionCreate(RolePermissionBase):
    pass

class RolePermissionRead(RolePermissionBase):
    id: str  # Fixed: Changed from int to str (UUID)
    created_at: datetime
    # Optionally include the full related objects
    role: Optional[RoleBaseReadForRolePermission] = None
    permission: Optional[PermissionBaseReadForRolePermission] = None

    class Config:
        from_attributes = True

class RolePermissionUpdate(BaseModel):
    role_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)
    permission_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)