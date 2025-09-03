from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from datetime import date, time, datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .citizen_issues import CitizenIssue
    from .user import User
    from .area import Area
    from .tenant import Tenant
    from .visit_issue import VisitIssue

VALID_VISIT_STATUSES = ["Upcoming", "Completed", "Rejected", "Cancelled"]

class Visit(SQLModel, table=True):
    __tablename__ = "visits"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )

    # Foreign Keys (UUIDs)
    citizen_issue_id: str = Field(foreign_key="citizen_issues.id", index=True)
    assistant_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    area_id: Optional[str] = Field(default=None, foreign_key="areas.id", index=True)
    tenant_id: str = Field(foreign_key="tenant.id", nullable=False, index=True)

    # Visit details
    visit_reason: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[str] = None
    visit_date: date = Field(index=True)
    visit_time: Optional[time] = None
    status: str = Field(default="Upcoming", index=True)
    notes: Optional[str] = None
    
    # Audit timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationships
    citizen_issue: Optional["CitizenIssue"] = Relationship(back_populates="visits")
    assistant: Optional["User"] = Relationship(back_populates="visits")
    area: Optional["Area"] = Relationship(back_populates="visits")
    tenant: "Tenant" = Relationship(back_populates="visits")
    visit_issues: List["VisitIssue"] = Relationship(back_populates="visit")
