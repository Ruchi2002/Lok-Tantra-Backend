# 📂 backend/app/routes/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.crud import user_crud as crud_user
from database import get_session


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create(user: UserCreate, db: Session = Depends(get_session)):
    existing = crud_user.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db, user)

   



@router.get("/{user_id}", response_model=UserRead)
def read(user_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    db_user = crud_user.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/", response_model=list[UserRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    return crud_user.get_all_users(db, skip, limit)


@router.put("/{user_id}", response_model=UserRead)
def update(user_id: str, user_update: UserUpdate, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    updated_user = crud_user.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.delete("/{user_id}")
def delete(user_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    success = crud_user.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}

@router.get("/tenant/{tenant_id}/assistants", response_model=list[UserRead])
def get_assistants(tenant_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    """Get all assistant users for a specific tenant"""
    try:
        assistants = crud_user.get_assistants_by_tenant(db, tenant_id)
        
        if not assistants:
            # Return empty list instead of 404 error
            print(f"⚠️ No assistants found for tenant {tenant_id}")
            return []
        
        print(f"✅ Found {len(assistants)} assistants for tenant {tenant_id}")
        return assistants
        
    except Exception as e:
        print(f"❌ Error in get_assistants route: {e}")
        # Return empty list on error instead of raising exception
        return []
