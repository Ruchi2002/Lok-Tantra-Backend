from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy.sql import func
from sqlalchemy import Text
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .user import User
    from .visit_issue import VisitIssue
    from .visit import Visit
    from .Issue_category import IssueCategory
    from .tenant import Tenant

class CitizenIssue(SQLModel, table=True):
    __tablename__ = "citizen_issues"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    title: str = Field(index=True)
    description: Optional[str] = None

    # Foreign Keys (UUIDs)
    status: Optional[str] = Field(default="Open", index=True)
    priority: Optional[str] = Field(default="Medium", index=True)
    category_id: Optional[str] = Field(default=None, foreign_key="issue_categories.id", index=True)

    created_by: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    assigned_to: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    area_id: Optional[str] = Field(default=None, foreign_key="areas.id", index=True)
    tenant_id: str = Field(foreign_key="tenant.id", nullable=False, index=True)

    location: Optional[str] = Field(default=None)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    geojson_data: Optional[str] = Field(default=None, sa_column=Text())
    action_taken: Optional[str] = Field(default=None, sa_column=Text())

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationships
    created_by_user: Optional["User"] = Relationship(
        back_populates="citizen_issues_created",
        sa_relationship_kwargs={"primaryjoin": "CitizenIssue.created_by == User.id"}
    )
    assigned_to_user: Optional["User"] = Relationship(
        back_populates="citizen_issues_assigned",
        sa_relationship_kwargs={"primaryjoin": "CitizenIssue.assigned_to == User.id"}
    )

    area: Optional["Area"] = Relationship(back_populates="citizen_issues")
    category: Optional["IssueCategory"] = Relationship(back_populates="citizen_issues")
    tenant: "Tenant" = Relationship(back_populates="citizen_issues")
    visit_issues: List["VisitIssue"] = Relationship(back_populates="issue")
    visits: List["Visit"] = Relationship(back_populates="citizen_issue")