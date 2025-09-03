from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import json

from app.schemas.user_schema import UserRead

class MeetingProgramBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    agenda: Optional[str] = Field(None, max_length=2000)
    venue: Optional[str] = Field(None, max_length=255)
    
    # Date and time
    scheduled_date: datetime
    start_time: Optional[str] = Field(None, pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: Optional[str] = Field(None, pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    
    # Meeting type and status
    meeting_type: str = Field(default="Government")
    status: str = Field(default="Upcoming")
    
    # Participants and attendance
    participants: Optional[List[str]] = Field(None)  # List of user IDs
    expected_attendance: Optional[int] = Field(None, ge=0)
    actual_attendance: Optional[int] = Field(None, ge=0)
    
    # Reminders and alerts
    reminder_date: Optional[datetime] = Field(None)
    
    # Meeting minutes
    minutes: Optional[str] = Field(None, max_length=5000)
    
    # Foreign keys
    tenant_id: Optional[str] = Field(None)
    
    @validator('meeting_type')
    def validate_meeting_type(cls, v):
        valid_types = ["Government", "NGO", "Public"]
        if v not in valid_types:
            raise ValueError(f'Meeting type must be one of: {", ".join(valid_types)}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ["Upcoming", "Done", "Cancelled"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v
    
    @validator('end_time')
    def validate_end_time(cls, v, values):
        if v and 'start_time' in values and values['start_time']:
            start = values['start_time']
            if v <= start:
                raise ValueError('End time must be after start time')
        return v
    
    @validator('actual_attendance')
    def validate_actual_attendance(cls, v, values):
        if v is not None and 'expected_attendance' in values and values['expected_attendance']:
            if v > values['expected_attendance']:
                raise ValueError('Actual attendance cannot exceed expected attendance')
        return v

class MeetingProgramCreate(MeetingProgramBase):
    created_by: Optional[str] = Field(None)

class MeetingProgramRead(MeetingProgramBase):
    id: str
    created_by: str
    reminder_sent: bool
    minutes_uploaded_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    # Frontend-compatible fields
    date: Optional[str] = None  # Formatted scheduled_date
    time: Optional[str] = None  # Formatted start_time - end_time
    creator_name: Optional[str] = None
    participant_names: Optional[List[str]] = None
    
    # Relationships
    creator: Optional[UserRead] = None
    
    class Config:
        from_attributes = True

class MeetingProgramUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    agenda: Optional[str] = Field(None, max_length=2000)
    venue: Optional[str] = Field(None, max_length=255)
    
    scheduled_date: Optional[datetime] = None
    start_time: Optional[str] = Field(None, pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    end_time: Optional[str] = Field(None, pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$')
    
    meeting_type: Optional[str] = None
    status: Optional[str] = None
    
    participants: Optional[List[str]] = None
    expected_attendance: Optional[int] = Field(None, ge=0)
    actual_attendance: Optional[int] = Field(None, ge=0)
    
    reminder_date: Optional[datetime] = None
    minutes: Optional[str] = Field(None, max_length=5000)
    
    @validator('meeting_type')
    def validate_meeting_type(cls, v):
        if v is not None:
            valid_types = ["Government", "NGO", "Public"]
            if v not in valid_types:
                raise ValueError(f'Meeting type must be one of: {", ".join(valid_types)}')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ["Upcoming", "Done", "Cancelled"]
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return v

# Dashboard KPI schemas
class MeetingProgramKPIs(BaseModel):
    total_upcoming_today: int
    total_upcoming_week: int
    completed_count: int
    cancelled_count: int
    completed_cancelled_ratio: float
    average_attendance: Optional[float]
    meetings_by_type: Dict[str, int]
    monthly_meetings: Dict[str, int]  # Format: "YYYY-MM" -> count

class MeetingProgramStats(BaseModel):
    total_meetings: int
    upcoming_meetings: int
    completed_meetings: int
    cancelled_meetings: int
    average_attendance_rate: Optional[float]
    most_common_venue: Optional[str]
    most_common_type: Optional[str]
