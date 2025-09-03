from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SentLetterStatus(str, Enum):
    AWAITING_RESPONSE = "Awaiting Response"
    RESPONSE_RECEIVED = "Response Received"
    CLOSED = "Closed"

class SentLetterPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class SentLetterCategory(str, Enum):
    EDUCATION = "Education"
    HEALTH = "Health"
    INFRASTRUCTURE = "Infrastructure"
    POLICY = "Policy"
    BUSINESS = "Business"
    ENVIRONMENT = "Environment"
    SOCIAL_WELFARE = "Social Welfare"
    PUBLIC_SAFETY = "Public Safety"
    TRANSPORTATION = "Transportation"
    UTILITIES = "Utilities"
    OTHER = "Other"

# Base schema with common fields
class SentLetterBase(BaseModel):
    recipient_name: str
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_address: Optional[str] = None
    recipient_organization: Optional[str] = None
    subject: str
    content: str
    category: SentLetterCategory = SentLetterCategory.OTHER
    priority: SentLetterPriority = SentLetterPriority.MEDIUM
    status: SentLetterStatus = SentLetterStatus.AWAITING_RESPONSE
    sent_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    response_received_date: Optional[datetime] = None
    response_content: Optional[str] = None
    assigned_to: Optional[int] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None
    tenant_id: Optional[int] = None

    @validator('recipient_name')
    def validate_recipient_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Recipient name is required')
        if len(v) > 255:
            raise ValueError('Recipient name must be less than 255 characters')
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

    @validator('recipient_email')
    def validate_email(cls, v):
        if v and len(v) > 255:
            raise ValueError('Email must be less than 255 characters')
        return v

    @validator('recipient_phone')
    def validate_phone(cls, v):
        if v and len(v) > 20:
            raise ValueError('Phone number must be less than 20 characters')
        return v

    @validator('recipient_address')
    def validate_address(cls, v):
        if v and len(v) > 500:
            raise ValueError('Address must be less than 500 characters')
        return v

    @validator('recipient_organization')
    def validate_organization(cls, v):
        if v and len(v) > 255:
            raise ValueError('Organization must be less than 255 characters')
        return v

# Schema for creating a new letter
class SentLetterCreate(SentLetterBase):
    pass

# Schema for updating a letter
class SentLetterUpdate(BaseModel):
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_address: Optional[str] = None
    recipient_organization: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    category: Optional[SentLetterCategory] = None
    priority: Optional[SentLetterPriority] = None
    status: Optional[SentLetterStatus] = None
    sent_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    response_received_date: Optional[datetime] = None
    response_content: Optional[str] = None
    assigned_to: Optional[int] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None

    @validator('recipient_name')
    def validate_recipient_name(cls, v):
        if v is not None:
            if len(v.strip()) == 0:
                raise ValueError('Recipient name cannot be empty')
            if len(v) > 255:
                raise ValueError('Recipient name must be less than 255 characters')
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
class SentLetterRead(SentLetterBase):
    id: int
    tenant_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True

# Schema for letter list response
class SentLetterList(BaseModel):
    letters: List[SentLetterRead]
    total: int
    page: int
    per_page: int
    total_pages: int

# Schema for letter statistics
class SentLetterStatistics(BaseModel):
    total_letters: int
    awaiting_response: int
    response_received: int
    closed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue_followups: int
    followups_due_this_week: int

# Schema for letter filters
class SentLetterFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[SentLetterStatus] = None
    priority: Optional[SentLetterPriority] = None
    category: Optional[SentLetterCategory] = None
    assigned_to: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    per_page: int = 20
