from sqlmodel import SQLModel, Field, DateTime
from sqlalchemy import Column, Text, String
from datetime import datetime
from typing import Optional
from enum import Enum

class SentGrievanceLetterStatus(str, Enum):
    AWAITING = "Awaiting"
    RESPONSE_RECEIVED = "Response Received"
    CLOSED = "Closed"

class SentGrievanceLetterPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class SentGrievanceLetterCategory(str, Enum):
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

class SentGrievanceLetter(SQLModel, table=True):
    __tablename__ = "sent_grievance_letters"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    grievance_id: str = Field(description="Reference to citizen issue/grievance ID")
    recipient_name: str = Field(max_length=255, description="Name of the recipient")
    recipient_email: Optional[str] = Field(default=None, max_length=255, description="Email of the recipient")
    recipient_phone: Optional[str] = Field(default=None, max_length=20, description="Phone number of the recipient")
    recipient_address: Optional[str] = Field(default=None, max_length=500, description="Address of the recipient")
    recipient_organization: Optional[str] = Field(default=None, max_length=255, description="Organization of the recipient")
    subject: str = Field(max_length=500, description="Subject of the letter")
    content: str = Field(sa_column=Column(Text), description="Content/body of the letter")
    category: SentGrievanceLetterCategory = Field(default=SentGrievanceLetterCategory.OTHER, description="Category of the letter")
    priority: SentGrievanceLetterPriority = Field(default=SentGrievanceLetterPriority.MEDIUM, description="Priority level")
    status: SentGrievanceLetterStatus = Field(default=SentGrievanceLetterStatus.AWAITING, description="Current status")
    sent_date: datetime = Field(default_factory=datetime.utcnow, description="Date when letter was sent")
    follow_up_date: Optional[datetime] = Field(default=None, description="Follow-up due date")
    response_received_date: Optional[datetime] = Field(default=None, description="Date when response was received")
    response_content: Optional[str] = Field(default=None, sa_column=Column(Text), description="Response content received")
    closure_date: Optional[datetime] = Field(default=None, description="Date when grievance was closed")
    assigned_to: Optional[int] = Field(default=None, description="User assigned to handle this letter")
    attachments: Optional[str] = Field(default=None, description="Comma-separated list of attachment file paths")
    notes: Optional[str] = Field(default=None, sa_column=Column(Text), description="Internal notes about the letter")
    tenant_id: Optional[int] = Field(default=None, description="Tenant ID for multi-tenancy")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Record last update timestamp")
    created_by: Optional[int] = Field(default=None, description="User who created this record")
    updated_by: Optional[int] = Field(default=None, description="User who last updated this record")
