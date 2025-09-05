from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


# Base for Create/Update
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    status: Optional[str] = "active"
    language_preference: Optional[str] = "English"
    role_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)
    tenant_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)
   


# ✅ For Creating User
class UserCreate(UserBase):
    password: str


# ✅ For Returning User (exclude password for security)
class UserRead(UserBase):
    id: str  # Fixed: Changed from int to str (UUID)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ✅ For Admin Viewing (includes plain password)
class UserReadWithPassword(UserBase):
    id: str
    plain_password: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ✅ For Updating User (partial) - never update password through this schema
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    language_preference: Optional[str] = None
    status: Optional[str] = None
    role_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)
    tenant_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)

# ✅ For Creating Field Agent specifically
class FieldAgentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    area: Optional[str] = None  # Assigned area for the field agent
    description: Optional[str] = None  # Additional description/notes