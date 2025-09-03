from sqlmodel import SQLModel, Field, DateTime
from datetime import datetime
from typing import Optional
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

class ReceivedLetter(SQLModel, table=True):
    __tablename__ = "received_letters"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    sender: str = Field(max_length=255, description="Name of the sender")
    sender_email: Optional[str] = Field(default=None, max_length=255, description="Email of the sender")
    sender_phone: Optional[str] = Field(default=None, max_length=20, description="Phone number of the sender")
    sender_address: Optional[str] = Field(default=None, max_length=500, description="Address of the sender")
    subject: str = Field(max_length=500, description="Subject of the letter")
    content: str = Field(description="Content/body of the letter")
    category: LetterCategory = Field(default=LetterCategory.OTHER, description="Category of the letter")
    priority: LetterPriority = Field(default=LetterPriority.MEDIUM, description="Priority level")
    status: LetterStatus = Field(default=LetterStatus.NEW, description="Current status")
    received_date: datetime = Field(default_factory=datetime.utcnow, description="Date when letter was received")
    due_date: Optional[datetime] = Field(default=None, description="Due date for response")
    assigned_to: Optional[int] = Field(default=None, description="User assigned to handle this letter")
    response_content: Optional[str] = Field(default=None, description="Response content")
    response_date: Optional[datetime] = Field(default=None, description="Date when response was sent")
    attachments: Optional[str] = Field(default=None, description="Comma-separated list of attachment file paths")
    notes: Optional[str] = Field(default=None, description="Internal notes about the letter")
    tenant_id: Optional[int] = Field(default=None, description="Tenant ID for multi-tenancy")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Record last update timestamp")
    created_by: Optional[int] = Field(default=None, description="User who created this record")
    updated_by: Optional[int] = Field(default=None, description="User who last updated this record")

