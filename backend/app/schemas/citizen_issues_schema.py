from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.schemas.user_schema import UserRead
# from app.schemas.issue_status_schema import IssueStatusRead
# from app.schemas.issue_priority_schema import IssuePriorityRead

class CitizenIssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None  # 🆕 Human-readable area
    latitude: Optional[float] = None  # 🆕 Will be auto-filled by backend
    longitude: Optional[float] = None
    status: Optional[str] = None  # Now a string
    priority: Optional[str] = None  # Now a string
    assigned_to: Optional[str] = None  # Now a string (name)
    created_by: Optional[str] = None  # Fixed: Changed from int to str (UUID)
    category_id: Optional[str] = None  # Added: Missing field from model
    area_id: Optional[str] = None  # Added: Missing field from model
    action_taken: Optional[str] = None  # Added: Action taken to resolve the issue

class CitizenIssueCreate(CitizenIssueBase):
    tenant_id: Optional[str] = None  # Added: Required field from model

class CitizenIssueRead(CitizenIssueBase):
    id: str  # Fixed: Changed from int to str (UUID)
    tenant_id: str  # Added: Required field from model
    created_at: datetime
    updated_at: datetime
    geojson_data: Optional[str] = None  # Added: Missing field from model

    # 🆕 Frontend-compatible fields (aliases for human-readable data)
    issue: Optional[str] = None  # Alias for title
    date: Optional[str] = None  # Formatted created_at
    priority_label: Optional[str] = None  # String from priority_id (avoid conflict)
    status_label: Optional[str] = None  # String from status_id (avoid conflict)
    assistant: Optional[str] = None  # String from assigned_to
    category: Optional[str] = None  # From category relationship
    visitDate: Optional[str] = None  # From visit relationship
    visitTime: Optional[str] = None  # From visit relationship

    # Original relationship fields (for backend operations)
    created_by_user: Optional[UserRead] = None
    assigned_to_user: Optional[UserRead] = None
    priority: Optional[str] = None  # Changed from IssuePriorityRead to str
    status: Optional[str] = None   # Changed from IssueStatusRead to str
    # priority: Optional[IssuePriorityRead] = None  # Old, now commented out
    # status: Optional[IssueStatusRead] = None      # Old, now commented out

    class Config:
        from_attributes = True

class CitizenIssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

    location: Optional[str] = None  # Allow updating location if needed
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    priority: Optional[str] = None  # Changed from priority_id to priority string
    status: Optional[str] = None    # Changed from status_id to status string

    assigned_to: Optional[str] = None  # Changed to string (name) for consistency
    category_id: Optional[str] = None  # Added: Allow updating category
    area_id: Optional[str] = None  # Added: Allow updating area
    action_taken: Optional[str] = None  # Added: Allow updating action taken
