# app/schemas/super_admin_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Nested schema for the creator (User) if you want to include user details in SuperAdminRead
class UserReadForSuperAdmin(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        from_attributes = True

class SuperAdminBase(BaseModel):
    name: str
    email: EmailStr
    is_active: Optional[bool] = True
    created_by: Optional[int] = None # ID of the User who created this SuperAdmin

class SuperAdminCreate(SuperAdminBase):
    password: str # Plain text password for creation

class SuperAdminRead(SuperAdminBase):
    id: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserReadForSuperAdmin] = None # Nested creator details

    class Config:
        from_attributes = True

class SuperAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    # created_by typically shouldn't be updated after creation

class SuperAdminPasswordUpdate(BaseModel):
    old_password: str
    new_password: str