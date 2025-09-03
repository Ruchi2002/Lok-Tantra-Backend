from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

VALID_VISIT_STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled"]

class VisitBase(BaseModel):
    citizen_issue_id: str  # Fixed: Changed from int to str (UUID)
    scheduled_date: datetime
    scheduled_time: str
    status: Optional[str] = "Scheduled"
    notes: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    assistant_id: Optional[str] = None  # Added: Assistant assignment

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> str:
        v = v or "Scheduled"
        if v not in VALID_VISIT_STATUSES:
            raise ValueError(f"Invalid status. Allowed: {', '.join(VALID_VISIT_STATUSES)}")
        return v

class VisitCreate(VisitBase):
    pass

class VisitUpdate(BaseModel):
    # Only allow updating these fields
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    assistant_id: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if v not in VALID_VISIT_STATUSES:
            raise ValueError(f"Invalid status. Allowed: {', '.join(VALID_VISIT_STATUSES)}")
        return v

class VisitRead(VisitBase):
    id: str  # Fixed: Changed from int to str (UUID)
    created_at: datetime
    updated_at: datetime
    
    # Additional fields for frontend display
    issue_title: Optional[str] = None
    issue_priority: Optional[str] = None
    assistant_name: Optional[str] = None
    visit_reason: Optional[str] = None

    class Config:
        from_attributes = True
