from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class IssueCategoryBase(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Category name cannot be empty")
        return v.strip()

class IssueCategoryCreate(IssueCategoryBase):
    pass

class IssueCategoryUpdate(BaseModel):
    name: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Category name cannot be empty")
            return v.strip()
        return v

class IssueCategoryRead(IssueCategoryBase):
    id: str  # Fixed: Changed from int to str (UUID)

    class Config:
        from_attributes = True

class IssueCategoryWithCount(BaseModel):
    id: str  # Fixed: Changed from int to str (UUID)
    name: str
    issue_count: int

    class Config:
        from_attributes = True