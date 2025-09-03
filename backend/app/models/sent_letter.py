from sqlmodel import SQLModel, Field, DateTime
from datetime import datetime
from typing import Optional
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

class SentLetter(SQLModel, table=True):
    __tablename__ = "sent_letters"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    recipient_name: str = Field(max_length=255, description="Name of the recipient")
    recipient_email: Optional[str] = Field(default=None, max_length=255, description="Email of the recipient")
    recipient_phone: Optional[str] = Field(default=None, max_length=20, description="Phone number of the recipient")
    recipient_address: Optional[str] = Field(default=None, max_length=500, description="Address of the recipient")
    recipient_organization: Optional[str] = Field(default=None, max_length=255, description="Organization of the recipient")
    subject: str = Field(max_length=500, description="Subject of the letter")
    content: str = Field(max_length=5000, description="Content/body of the letter (max 1000 words)")
    category: SentLetterCategory = Field(default=SentLetterCategory.OTHER, description="Category of the letter")
    priority: SentLetterPriority = Field(default=SentLetterPriority.MEDIUM, description="Priority level")
    status: SentLetterStatus = Field(default=SentLetterStatus.AWAITING_RESPONSE, description="Current status")
    sent_date: datetime = Field(default_factory=datetime.utcnow, description="Date when letter was sent")
    follow_up_date: Optional[datetime] = Field(default=None, description="Follow-up due date")
    response_received_date: Optional[datetime] = Field(default=None, description="Date when response was received")
    response_content: Optional[str] = Field(default=None, max_length=5000, description="Response content received")
    assigned_to: Optional[int] = Field(default=None, description="User assigned to handle this letter")
    attachments: Optional[str] = Field(default=None, description="Comma-separated list of attachment file paths")
    documents: Optional[str] = Field(default=None, description="Comma-separated list of document file paths for uploads")
    notes: Optional[str] = Field(default=None, description="Internal notes about the letter")
    tenant_id: Optional[int] = Field(default=None, description="Tenant ID for multi-tenancy")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Record last update timestamp")
    created_by: Optional[int] = Field(default=None, description="User who created this record")
    updated_by: Optional[int] = Field(default=None, description="User who last updated this record")
