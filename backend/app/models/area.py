from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlalchemy.sql import func
import uuid
from sqlalchemy import String, Column

if TYPE_CHECKING:
    from .citizen_issues import CitizenIssue
    from .visit import Visit
    from .tenant import Tenant

class Area(SQLModel, table=True):
    __tablename__ = "areas"

    id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        sa_column=Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    )
    name: str = Field(index=True, nullable=False)
    description: Optional[str] = None
    
    # Tenant isolation
    tenant_id: str = Field(foreign_key="tenant.id", nullable=False, index=True)
    
    # Geographic data
    geojson_data: Optional[str] = Field(default=None)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    
    # Status
    is_active: bool = Field(default=True, index=True)
    
    # Audit timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"server_default": func.now()})
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": func.now(), "server_default": func.now()})

    # Relationships
    citizen_issues: List["CitizenIssue"] = Relationship(back_populates="area")
    visits: List["Visit"] = Relationship(back_populates="area")
    tenant: "Tenant" = Relationship(back_populates="areas")
