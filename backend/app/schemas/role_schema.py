# app/schemas/role_schema.py (Updated)
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Import for nested relationships
# If User or Permission models are deeply nested, consider using forward references
# and update_forward_refs() if needed.
class UserReadForRole(BaseModel):
    id: int
    name: str
    email: str
    class Config:
        from_attributes = True

class PermissionReadForRole(BaseModel):
    id: int
    permission_name: str
    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    scope: Optional[str] = "global"

class RoleCreate(RoleBase):
    pass

class RoleRead(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Nested relationships (optional, load with selectinload in queries if needed)
    users: List[UserReadForRole] = [] # List of users for this role
    permissions: List[PermissionReadForRole] = [] # List of permissions (will be populated via service layer or explicit loading)

    class Config:
        from_attributes = True

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    scope: Optional[str] = None