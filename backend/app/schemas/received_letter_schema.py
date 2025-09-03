from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class LetterStatus(str, Enum):
    NEW = "New"
    UNDER_REVIEW = "Under Review"
    REPLIED = "Replied"
    CLOSED = "Closed"

class LetterPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class LetterCategory(str, Enum):
    EDUCATION = "Education"
    HEALTH = "Health"
    INFRASTRUCTURE = "Infrastructure"
    POLICY = "Policy"
    BUSINESS = "Business"
    ENVIRONMENT = "Environment"
    SOCIAL_WELFARE = "Social Welfare"
    OTHER = "Other"

# Base schema with common fields
class ReceivedLetterBase(BaseModel):
    sender: str
    sender_email: Optional[str] = None
    sender_phone: Optional[str] = None
    sender_address: Optional[str] = None
    subject: str
    content: str
    category: LetterCategory = LetterCategory.OTHER
    priority: LetterPriority = LetterPriority.MEDIUM
    status: LetterStatus = LetterStatus.NEW
    received_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    response_content: Optional[str] = None
    response_date: Optional[datetime] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None
    tenant_id: Optional[int] = None

    @validator('sender')
    def validate_sender(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Sender name is required')
        if len(v) > 255:
            raise ValueError('Sender name must be less than 255 characters')
        return v.strip()

    @validator('subject')
    def validate_subject(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Subject is required')
        if len(v) > 500:
            raise ValueError('Subject must be less than 500 characters')
        return v.strip()

    @validator('content')
    def validate_content(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Content is required')
        return v.strip()

    @validator('sender_email')
    def validate_email(cls, v):
        if v and len(v) > 255:
            raise ValueError('Email must be less than 255 characters')
        return v

    @validator('sender_phone')
    def validate_phone(cls, v):
        if v and len(v) > 20:
            raise ValueError('Phone number must be less than 20 characters')
        return v

    @validator('sender_address')
    def validate_address(cls, v):
        if v and len(v) > 500:
            raise ValueError('Address must be less than 500 characters')
        return v

# Schema for creating a new letter
class ReceivedLetterCreate(ReceivedLetterBase):
    pass

# Schema for updating a letter
class ReceivedLetterUpdate(BaseModel):
    sender: Optional[str] = None
    sender_email: Optional[str] = None
    sender_phone: Optional[str] = None
    sender_address: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    category: Optional[LetterCategory] = None
    priority: Optional[LetterPriority] = None
    status: Optional[LetterStatus] = None
    received_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    response_content: Optional[str] = None
    response_date: Optional[datetime] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None

    @validator('sender')
    def validate_sender(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Sender name cannot be empty')
            if len(v) > 255:
                raise ValueError('Sender name must be less than 255 characters')
            return v.strip()
        return v

    @validator('subject')
    def validate_subject(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Subject cannot be empty')
            if len(v) > 500:
                raise ValueError('Subject must be less than 500 characters')
            return v.strip()
        return v

    @validator('content')
    def validate_content(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Content cannot be empty')
            return v.strip()
        return v

# Schema for reading a letter (response model)
class ReceivedLetterRead(ReceivedLetterBase):
    id: int
    tenant_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# Schema for letter list response
class ReceivedLetterList(BaseModel):
    letters: List[ReceivedLetterRead]
    total: int
    page: int
    per_page: int
    total_pages: int

# Schema for letter statistics
class LetterStatistics(BaseModel):
    total_letters: int
    new_letters: int
    under_review: int
    replied: int
    closed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue_letters: int

# Schema for letter filters
class LetterFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[LetterStatus] = None
    priority: Optional[LetterPriority] = None
    category: Optional[LetterCategory] = None
    assigned_to: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    per_page: int = 20

