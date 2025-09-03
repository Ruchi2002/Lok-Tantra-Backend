from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .visit import Visit
    from .citizen_issues import CitizenIssue

class VisitIssue(SQLModel, table=True):
    __tablename__ = "visit_issues"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    visit_id: str = Field(foreign_key="visits.id", index=True)
    issue_id: str = Field(foreign_key="citizen_issues.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})

    visit: "Visit" = Relationship(back_populates="visit_issues")
    issue: "CitizenIssue" = Relationship(back_populates="visit_issues")
