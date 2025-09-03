from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .tenant import Tenant
    from .citizen_issues import CitizenIssue
    from .visit import Visit
    from .role import Role
    from .superadmin import SuperAdmin
    from .meeting_program import MeetingProgram
    

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    name: str
    email: str = Field(index=True, unique=True)
    password_hash: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    status: Optional[str] = Field(default="active", index=True)
    language_preference: Optional[str] = Field(default="English")
    
    # FK relations (UUIDs)
    role_id: Optional[str] = Field(default=None, foreign_key="roles.id", index=True)
    tenant_id: Optional[str] = Field(default=None, foreign_key="tenant.id", index=True)
 
    # Audit timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    role: Optional["Role"] = Relationship(back_populates="users")
    tenant: Optional["Tenant"] = Relationship(back_populates="users")
    super_admins_created: List["SuperAdmin"] = Relationship(back_populates="creator")
    citizen_issues_created: List["CitizenIssue"] = Relationship(
        back_populates="created_by_user",
        sa_relationship_kwargs={"foreign_keys": "[CitizenIssue.created_by]"}
    )
    citizen_issues_assigned: List["CitizenIssue"] = Relationship(
        back_populates="assigned_to_user",
        sa_relationship_kwargs={"foreign_keys": "[CitizenIssue.assigned_to]"}
    )
    visits: List["Visit"] = Relationship(back_populates="assistant")
    meeting_programs_created: List["MeetingProgram"] = Relationship(back_populates="creator")




