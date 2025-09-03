from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Column, Text, JSON
from .base import BaseModel

if TYPE_CHECKING:
    from .user import User
    from .tenant import Tenant

class MeetingProgram(BaseModel, table=True):
    __tablename__ = "meeting_programs"
    
    # Basic meeting information
    title: str = Field(index=True)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    agenda: Optional[str] = Field(default=None, sa_column=Column(Text))
    venue: Optional[str] = Field(default=None)
    
    # Date and time
    scheduled_date: datetime = Field(index=True)
    start_time: Optional[str] = Field(default=None)  # Format: "HH:MM"
    end_time: Optional[str] = Field(default=None)    # Format: "HH:MM"
    
    # Meeting type and status
    meeting_type: str = Field(default="Government", index=True)  # Government, NGO, Public
    status: str = Field(default="Upcoming", index=True)  # Upcoming, Done, Cancelled
    
    # Participants and attendance
    participants: Optional[str] = Field(default=None, sa_column=Column(Text))  # JSON array stored as TEXT
    expected_attendance: Optional[int] = Field(default=None)
    actual_attendance: Optional[int] = Field(default=None)
    
    # Reminders and alerts
    reminder_sent: bool = Field(default=False)
    reminder_date: Optional[datetime] = Field(default=None)
    
    # Meeting minutes
    minutes: Optional[str] = Field(default=None, sa_column=Column(Text))
    minutes_uploaded_at: Optional[datetime] = Field(default=None)
    
    # Foreign keys
    created_by: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    tenant_id: Optional[str] = Field(default=None, foreign_key="tenant.id", index=True)
    
    # Relationships
    creator: Optional["User"] = Relationship(back_populates="meeting_programs_created")
    tenant: Optional["Tenant"] = Relationship(back_populates="meeting_programs")
