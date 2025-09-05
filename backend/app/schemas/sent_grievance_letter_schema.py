from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.sent_grievance_letter import (
    SentGrievanceLetterStatus, 
    SentGrievanceLetterPriority, 
    SentGrievanceLetterCategory
)

class SentGrievanceLetterBase(BaseModel):
    grievance_id: str
    recipient_name: str
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_address: Optional[str] = None
    recipient_organization: Optional[str] = None
    subject: str
    content: str
    category: SentGrievanceLetterCategory = SentGrievanceLetterCategory.OTHER
    priority: SentGrievanceLetterPriority = SentGrievanceLetterPriority.MEDIUM
    status: SentGrievanceLetterStatus = SentGrievanceLetterStatus.AWAITING
    sent_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    response_received_date: Optional[datetime] = None
    response_content: Optional[str] = None
    closure_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None

class SentGrievanceLetterCreate(SentGrievanceLetterBase):
    pass

class SentGrievanceLetterRead(SentGrievanceLetterBase):
    id: int
    tenant_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class SentGrievanceLetterUpdate(BaseModel):
    grievance_id: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_address: Optional[str] = None
    recipient_organization: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    category: Optional[SentGrievanceLetterCategory] = None
    priority: Optional[SentGrievanceLetterPriority] = None
    status: Optional[SentGrievanceLetterStatus] = None
    sent_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    response_received_date: Optional[datetime] = None
    response_content: Optional[str] = None
    closure_date: Optional[datetime] = None
    assigned_to: Optional[str] = None
    attachments: Optional[str] = None
    notes: Optional[str] = None

class SentGrievanceLetterFilters(BaseModel):
    search: Optional[str] = None
    status: Optional[SentGrievanceLetterStatus] = None
    priority: Optional[SentGrievanceLetterPriority] = None
    category: Optional[SentGrievanceLetterCategory] = None
    grievance_id: Optional[str] = None
    assigned_to: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = 1
    per_page: int = 20

class SentGrievanceLetterList(BaseModel):
    letters: List[SentGrievanceLetterRead]
    total: int
    page: int
    per_page: int
    total_pages: int

class SentGrievanceLetterStatistics(BaseModel):
    total_letters: int
    awaiting: int
    response_received: int
    closed: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overdue_followups: int
    followups_due_this_week: int
    average_closure_time_days: Optional[float] = None
    top_categories: List[dict]
