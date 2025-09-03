from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .citizen_issues import CitizenIssue

class IssueCategory(SQLModel, table=True):
    __tablename__ = "issue_categories"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    name: str = Field(index=True, unique=True)
    
    # Relationship to issues
    citizen_issues: List["CitizenIssue"] = Relationship(back_populates="category")