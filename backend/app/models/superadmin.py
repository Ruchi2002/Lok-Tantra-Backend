# app/models/super_admin.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column

class SuperAdmin(SQLModel, table=True):
    __tablename__ = "super_admins"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    name: str = Field(index=True)
    email: str = Field(index=True, unique=True, nullable=False)
    password_hash: str = Field(nullable=False)
    is_active: bool = Field(default=True, index=True)

    # Foreign Key to User (who created this SuperAdmin record)
    created_by: Optional[str] = Field(default=None, foreign_key="users.id", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationship to the User who created this SuperAdmin
    creator: Optional["User"] = Relationship(back_populates="super_admins_created")
