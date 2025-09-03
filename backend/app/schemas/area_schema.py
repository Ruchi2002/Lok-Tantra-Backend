from typing import Optional
from pydantic import BaseModel

class AreaBase(BaseModel):
    name: str
    tenant_id: str  # Fixed: Changed from int to str (UUID)

class AreaCreate(AreaBase):
    pass

class AreaRead(AreaBase):
    id: str  # Fixed: Changed from int to str (UUID)

    class Config:
        from_attributes = True

class AreaUpdate(BaseModel):
    name: Optional[str] = None
    tenant_id: Optional[str] = None  # Fixed: Changed from int to str (UUID)
