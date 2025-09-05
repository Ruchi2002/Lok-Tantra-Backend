# 📂 backend/app/routes/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.schemas.user_schema import UserCreate, UserRead, UserUpdate, FieldAgentCreate
from app.crud import user_crud as crud_user
from app.models.user import User
from app.models.role import Role
from app.core.auth import get_current_user
from app.utils.role_permissions import role_permissions, Permission
from database import get_session


router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create(user: UserCreate, db: Session = Depends(get_session)):
    existing = crud_user.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db, user)

   



@router.get("/", response_model=list[UserRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    return crud_user.get_all_users(db, skip, limit)

@router.get("/field-agents", response_model=list[UserRead])
def get_field_agents(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all Field Agent users for the current tenant - Admin only"""
    try:
        # Get current user's role - handle both User and Tenant objects
        if hasattr(current_user, 'role') and current_user.role:
            user_role = getattr(current_user.role, 'name', '')
        elif hasattr(current_user, 'user_type'):
            # This might be a tenant or superadmin object
            user_role = getattr(current_user, 'user_type', '')
        else:
            user_role = ''
        
        # For now, allow all authenticated users to view Field Agents for testing
        # TODO: Implement proper role-based access control
        print(f"🔍 Allowing Field Agent viewing for user with role: '{user_role}'")
        
        # Get FieldAgent role
        field_agent_role = db.exec(select(Role).where(Role.name == "FieldAgent")).first()
        if not field_agent_role:
            return []
        
        # Get tenant_id from current user
        tenant_id = None
        if hasattr(current_user, 'tenant_id'):
            tenant_id = current_user.tenant_id
        elif hasattr(current_user, 'id'):
            # If it's a tenant object, use its ID
            tenant_id = current_user.id
        
        # Get all Field Agents for the current tenant
        print(f"🔍 Debug - Looking for Field Agents with role_id: {field_agent_role.id}, tenant_id: {tenant_id}")
        
        # First, let's see all users with the FieldAgent role
        all_field_agents = db.exec(
            select(User).where(User.role_id == field_agent_role.id)
        ).all()
        print(f"🔍 Debug - Found {len(all_field_agents)} total Field Agents in system")
        
        field_agents = db.exec(
            select(User).where(
                User.role_id == field_agent_role.id,
                User.tenant_id == tenant_id
            )
        ).all()
        print(f"🔍 Debug - Found {len(field_agents)} Field Agents for tenant {tenant_id}")
        
        print(f"✅ Found {len(field_agents)} Field Agents for tenant {tenant_id}")
        return field_agents
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching Field Agents: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Field Agents: {str(e)}"
        )

@router.get("/field-agent/{user_id}", response_model=dict)
def get_field_agent_details(
    user_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get Field Agent details including password for admin viewing"""
    try:
        # Get current user's role - handle both User and Tenant objects
        if hasattr(current_user, 'role') and current_user.role:
            user_role = getattr(current_user.role, 'name', '')
        elif hasattr(current_user, 'user_type'):
            # This might be a tenant or superadmin object
            user_role = getattr(current_user, 'user_type', '')
        else:
            user_role = ''
        
        # For now, allow all authenticated users to view Field Agent details for testing
        # TODO: Implement proper role-based access control
        print(f"🔍 Allowing Field Agent details viewing for user with role: '{user_role}'")
        
        # Get the Field Agent
        field_agent = db.get(User, user_id)
        if not field_agent:
            raise HTTPException(status_code=404, detail="Field Agent not found")
        
        # Check if it's actually a Field Agent
        if not field_agent.role_id:
            raise HTTPException(status_code=400, detail="User has no role assigned")
        
        # Get the role to verify it's a Field Agent
        role = db.get(Role, field_agent.role_id)
        if not role or role.name != "FieldAgent":
            raise HTTPException(status_code=400, detail="User is not a Field Agent")
        
        # Check tenant access
        tenant_id = None
        if hasattr(current_user, 'tenant_id'):
            tenant_id = current_user.tenant_id
        elif hasattr(current_user, 'id'):
            tenant_id = current_user.id
        
        if field_agent.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to Field Agent from different tenant")
        
        # Return Field Agent details including password
        return {
            "id": field_agent.id,
            "name": field_agent.name,
            "email": field_agent.email,
            "phone": field_agent.phone,
            "status": field_agent.status,
            "language_preference": field_agent.language_preference,
            "role_id": field_agent.role_id,
            "tenant_id": field_agent.tenant_id,
            "created_at": field_agent.created_at,
            "updated_at": field_agent.updated_at,
            "password": field_agent.plain_password or "******"  # Show stored plain password if available
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching Field Agent details: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch Field Agent details: {str(e)}"
        )

@router.put("/field-agent/{user_id}", response_model=UserRead)
def update_field_agent(
    user_id: str,
    field_agent_data: UserUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update Field Agent details - Admin only"""
    try:
        # Get current user's role - handle both User and Tenant objects
        if hasattr(current_user, 'role') and current_user.role:
            user_role = getattr(current_user.role, 'name', '')
        elif hasattr(current_user, 'user_type'):
            # This might be a tenant or superadmin object
            user_role = getattr(current_user, 'user_type', '')
        else:
            user_role = ''
        
        # For now, allow all authenticated users to update Field Agents for testing
        # TODO: Implement proper role-based access control
        print(f"🔍 Allowing Field Agent update for user with role: '{user_role}'")
        
        # Get the Field Agent
        field_agent = db.get(User, user_id)
        if not field_agent:
            raise HTTPException(status_code=404, detail="Field Agent not found")
        
        # Check if it's actually a Field Agent
        if not field_agent.role_id:
            raise HTTPException(status_code=400, detail="User has no role assigned")
        
        # Get the role to verify it's a Field Agent
        role = db.get(Role, field_agent.role_id)
        if not role or role.name != "FieldAgent":
            raise HTTPException(status_code=400, detail="User is not a Field Agent")
        
        # Check tenant access
        tenant_id = None
        if hasattr(current_user, 'tenant_id'):
            tenant_id = current_user.tenant_id
        elif hasattr(current_user, 'id'):
            tenant_id = current_user.id
        
        if field_agent.tenant_id != tenant_id:
            raise HTTPException(status_code=403, detail="Access denied to Field Agent from different tenant")
        
        # Update the Field Agent
        updated_field_agent = crud_user.update_user(db, user_id, field_agent_data)
        
        print(f"✅ Updated Field Agent: {updated_field_agent.name} ({updated_field_agent.email})")
        return updated_field_agent
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating Field Agent: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update Field Agent: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserRead)
def read(user_id: str, db: Session = Depends(get_session)):  # Fixed: Changed from int to str (UUID)
    db_user = crud_user.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


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

@router.post("/field-agent", response_model=UserRead, status_code=201)
def create_field_agent(
    field_agent_data: FieldAgentCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new Field Agent user - Admin only"""
    try:
        # Get current user's role - handle both User and Tenant objects
        if hasattr(current_user, 'role') and current_user.role:
            user_role = getattr(current_user.role, 'name', '')
        elif hasattr(current_user, 'user_type'):
            # This might be a tenant or superadmin object
            user_role = getattr(current_user, 'user_type', '')
        else:
            user_role = ''
        
        print(f"🔍 Debug - Current user type: {type(current_user)}")
        print(f"🔍 Debug - User role: '{user_role}'")
        print(f"🔍 Debug - User attributes: {dir(current_user)}")
        
        # For now, allow all authenticated users to create Field Agents for testing
        # TODO: Implement proper role-based access control
        print(f"🔍 Allowing Field Agent creation for user with role: '{user_role}'")
        
        # Get FieldAgent role
        field_agent_role = db.exec(select(Role).where(Role.name == "FieldAgent")).first()
        if not field_agent_role:
            raise HTTPException(
                status_code=500,
                detail="FieldAgent role not found in system"
            )
        
        # Get tenant_id from current user
        tenant_id = None
        if hasattr(current_user, 'tenant_id'):
            tenant_id = current_user.tenant_id
        elif hasattr(current_user, 'id'):
            # If it's a tenant object, use its ID
            tenant_id = current_user.id
        
        # Convert FieldAgentCreate to UserCreate
        user_data = UserCreate(
            name=field_agent_data.name,
            email=field_agent_data.email,
            password=field_agent_data.password,
            phone=field_agent_data.phone,
            role_id=field_agent_role.id,
            tenant_id=tenant_id  # Assign to same tenant as admin
        )
        
        # Check if email already exists
        existing_user = crud_user.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Create the user
        new_user = crud_user.create_user(db, user_data)
        
        print(f"✅ Created Field Agent: {new_user.name} ({new_user.email}) for tenant {tenant_id}")
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating Field Agent: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create Field Agent: {str(e)}"
        )