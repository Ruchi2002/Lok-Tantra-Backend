# 📂 backend/app/crud/user.py
from sqlmodel import Session, select
from typing import List
from app.models.user import User
from app.models.role import Role
from app.schemas.user_schema import UserCreate, UserUpdate
from app.core.auth import hash_password

# Configuration for assistant role names
ASSISTANT_ROLE_NAMES = ["member", "admin"]  # Priority order: try 'member' first, then 'admin'

def create_user(db: Session, user: UserCreate) -> User:
    # Convert UserCreate to dict and handle password hashing
    user_data = user.model_dump()
    
    # Extract and hash the password
    plain_password = user_data.pop("password")  # Remove password from dict
    hashed_password = hash_password(plain_password)
    
    # Add the hashed password
    user_data["password_hash"] = hashed_password
    
    # Create User instance directly with the prepared data
    db_user = User(**user_data)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: str) -> User | None:  # Fixed: Changed from int to str (UUID)
    return db.get(User, user_id)

def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.exec(select(User).offset(skip).limit(limit)).all()

def update_user(db: Session, user_id: str, user_data: UserUpdate) -> User:  # Fixed: Changed from int to str (UUID)
    db_user = db.get(User, user_id)
    if not db_user:
        return None
    
    user_data_dict = user_data.model_dump(exclude_unset=True)
    
    # Hash password if it's being updated
    if "password" in user_data_dict and user_data_dict["password"]:
        user_data_dict["password_hash"] = hash_password(user_data_dict["password"])
        del user_data_dict["password"]  # Remove the plain password
    
    for key, value in user_data_dict.items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: str) -> bool:  # Fixed: Changed from int to str (UUID)
    user = db.get(User, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

# Additional function for backward compatibility with your auth routes
def get_user_by_id(db: Session, user_id: str) -> User | None:  # Fixed: Changed from int to str (UUID)
    """Alias for get_user function to maintain compatibility"""
    return get_user(db, user_id)

def get_assistants_by_tenant(db: Session, tenant_id: str) -> List[User]:  # Fixed: Changed from int to str (UUID)
    """Get all users with assistant roles for a specific tenant"""
    try:
        # First, let's check what roles exist in the database
        roles = db.exec(select(Role)).all()
        print(f"🔍 Available roles in database: {[role.name for role in roles]}")
        
        # Try to find users with assistant roles in priority order
        assistants = []
        for role_name in ASSISTANT_ROLE_NAMES:
            if not assistants:  # Only try next role if no assistants found yet
                statement = (
                    select(User)
                    .join(Role)  # join to filter by role name
                    .where(User.tenant_id == tenant_id, Role.name == role_name)
                )
                
                assistants = db.exec(statement).all()
                print(f"🔍 Found {len(assistants)} assistants with '{role_name}' role for tenant {tenant_id}")
        
        # If still no users found, return all users for the tenant (for debugging)
        if not assistants:
            print(f"⚠️ No users found with assistant roles, returning all users for tenant {tenant_id}")
            statement = select(User).where(User.tenant_id == tenant_id)
            assistants = db.exec(statement).all()
            print(f"🔍 Found {len(assistants)} total users for tenant {tenant_id}")
        
        return assistants
        
    except Exception as e:
        print(f"❌ Error in get_assistants_by_tenant: {e}")
        # Return empty list on error
        return []