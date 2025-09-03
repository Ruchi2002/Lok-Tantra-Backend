from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.schemas.user_schema import UserRead

class CitizenIssueBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None  # Human-readable area
    latitude: Optional[float] = None  # Will be auto-filled by backend
    longitude: Optional[float] = None
    status: Optional[str] = None  # String value
    priority: Optional[str] = None  # String value
    assigned_to: Optional[str] = None  # User ID or name
    created_by: Optional[str] = None  # User ID (UUID)
    category_id: Optional[str] = None  # Category ID
    area_id: Optional[str] = None  # Area ID
    action_taken: Optional[str] = None  # Action taken to resolve the issue

class CitizenIssueCreate(CitizenIssueBase):
    tenant_id: Optional[str] = None  # Optional in schema, will be set by backend logic

class CitizenIssueRead(CitizenIssueBase):
    id: str  # UUID
    tenant_id: str  # Required field from model
    created_at: datetime
    updated_at: datetime
    geojson_data: Optional[str] = None  # GeoJSON data

    # Frontend-compatible fields (aliases for human-readable data)
    issue: Optional[str] = None  # Alias for title
    date: Optional[str] = None  # Formatted created_at
    priority_label: Optional[str] = None  # String from priority
    status_label: Optional[str] = None  # String from status
    assistant: Optional[str] = None  # String from assigned_to
    category: Optional[str] = None  # From category relationship
    visitDate: Optional[str] = None  # From visit relationship
    visitTime: Optional[str] = None  # From visit relationship

    # Relationship fields (for backend operations)
    created_by_user: Optional[UserRead] = None
    assigned_to_user: Optional[UserRead] = None

    class Config:
        from_attributes = True

class CitizenIssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None  # Allow updating location if needed
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: Optional[str] = None  # Priority string
    status: Optional[str] = None    # Status string
    assigned_to: Optional[str] = None  # User ID or name
    category_id: Optional[str] = None  # Allow updating category
    area_id: Optional[str] = None  # Allow updating area
    action_taken: Optional[str] = None  # Allow updating action taken

    class Config:
        from_attributes = True
