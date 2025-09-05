from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy.sql import func
from enum import Enum
import uuid
from sqlalchemy import String, Column

class TenantStatus(str, Enum):
    """Enum for tenant status"""
    ACTIVE = "active"
    INACTIVE = "inactive"

class Tenant(SQLModel, table=True):
    __tablename__ = "tenant"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    
    name: str = Field(unique=True, index=True, nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    phone: Optional[str] = Field(default=None, nullable=True)
    password: str = Field(nullable=False)  # This stores the hashed password
    plain_password: Optional[str] = None  # Store plain password for admin viewing
    status: TenantStatus = Field(default=TenantStatus.ACTIVE, nullable=False, index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationships
    users: List["User"] = Relationship(back_populates="tenant")
    areas: List["Area"] = Relationship(back_populates="tenant")
    citizen_issues: List["CitizenIssue"] = Relationship(back_populates="tenant")
    visits: List["Visit"] = Relationship(back_populates="tenant")
    meeting_programs: List["MeetingProgram"] = Relationship(back_populates="tenant")
  