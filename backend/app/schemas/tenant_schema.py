from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Literal
from datetime import datetime

# Use Literal type for status to avoid circular imports

TenantStatusType = Literal["active", "inactive"]

class TenantCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    status: TenantStatusType = "active"
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, and plus signs')
        return v

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    status: Optional[TenantStatusType] = None
    
    @validator('password')
    def validate_password(cls, v):
        if v and len(v) < 4:
            raise ValueError('Password must be at least 4 characters long')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v and not v.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise ValueError('Phone number must contain only digits, spaces, hyphens, and plus signs')
        return v

class TenantRead(BaseModel):
    id: str  # Fixed: Changed from int to str (UUID)
    name: str
    email: str
    phone: Optional[str] = None
    status: TenantStatusType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TenantReadWithPassword(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    plain_password: Optional[str] = None  # Plain password for super admin viewing
    status: TenantStatusType
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TenantLogin(BaseModel):
    email: EmailStr
    password: str