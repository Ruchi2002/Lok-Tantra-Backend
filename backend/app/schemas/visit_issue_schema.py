from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VisitIssueBase(BaseModel):
    issue_id: str  # Fixed: Changed from int to str (UUID)
    visit_id: str
    status: Optional[str] = "Pending"
    notes: Optional[str] = None
    resolution: Optional[str] = None

class VisitIssueCreate(VisitIssueBase):
    pass

class VisitIssueRead(VisitIssueBase):
    id: int
    created_at: Optional[datetime] = None
    
    # 🆕 Frontend-compatible fields
    visit_details: Optional[dict] = None  # Visit information
    issue_details: Optional[dict] = None  # Issue information
    assistant: Optional[str] = None  # Assistant name
    location: Optional[str] = None  # Location name
    visit_date: Optional[str] = None  # Formatted visit date
    visit_time: Optional[str] = None  # Visit time
    issue_title: Optional[str] = None  # Issue title
    issue_status: Optional[str] = None  # Issue status

    class Config:
        from_attributes = True
