from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_, and_
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.models.role import Role
from app.models.received_letter import ReceivedLetter, LetterStatus, LetterPriority, LetterCategory
from app.schemas.received_letter_schema import (
    ReceivedLetterCreate, ReceivedLetterRead, ReceivedLetterUpdate, 
    ReceivedLetterList, LetterStatistics, LetterFilters
)
from app.crud.received_letter_crud import (
    create_received_letter, get_received_letter, get_all_received_letters,
    get_filtered_received_letters, update_received_letter, delete_received_letter,
    get_letter_statistics, get_letters_by_status, get_letters_by_priority,
    get_overdue_letters, assign_letter_to_user, update_letter_status
)
from app.utils.role_permissions import RolePermissions

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/letters/received", tags=["Received Letters"])

# Initialize role permissions
role_permissions = RolePermissions()

def get_user_role_name(user: User) -> str:
    """Get normalized role name from user"""
    if not user or not hasattr(user, 'role'):
        return "regular_user"
    
    if hasattr(user.role, 'name'):
        role_name = user.role.name
    else:
        role_name = str(user.role)
    
    # Normalize role names
    role_lower = role_name.lower().strip()
    if any(keyword in role_lower for keyword in ['super_admin', 'superadmin', 'super_admins']):
        return "super_admin"
    elif any(keyword in role_lower for keyword in ['admin', 'tenant_admin']):
        return "admin"
    elif any(keyword in role_lower for keyword in ['field_agent', 'fieldagent', 'field agent']):
        return "field_agent"
    elif any(keyword in role_lower for keyword in ['assistant', 'assistants']):
        return "assistant"
    else:
        return "regular_user"

def get_filtered_letter_query(current_user: User, base_query, db: Session, letter_type: str = "received"):
    """Get query with role-based filtering for letters"""
    if base_query is None:
        return base_query
    
    user_role = get_user_role_name(current_user)
    
    # Super Admin can see all letters
    if user_role == "super_admin":
        return base_query
    
    # Admin can see letters they created + letters assigned to their Field Agents
    if user_role == "admin":
        if hasattr(current_user, 'tenant_id') and current_user.tenant_id:
            # Get Field Agent IDs in the same tenant
            field_agent_ids = db.exec(
                select(User.id).where(
                    and_(
                        User.tenant_id == current_user.tenant_id,
                        User.role_id.in_(
                            select(Role.id).where(Role.name == "FieldAgent")
                        )
                    )
                )
            ).all()
            
            # Filter for letters created by admin OR assigned to their Field Agents
            return base_query.filter(
                or_(
                    ReceivedLetter.created_by == str(current_user.id),
                    ReceivedLetter.assigned_to.in_([str(fa_id) for fa_id in field_agent_ids])
                )
            )
        else:
            # If no tenant_id, only show letters created by admin
            return base_query.filter(ReceivedLetter.created_by == str(current_user.id))
    
    # Field Agent can only see letters assigned to them
    if user_role in ["field_agent", "assistant"]:
        return base_query.filter(ReceivedLetter.assigned_to == str(current_user.id))
    
    # Regular users can only see letters they created
    return base_query.filter(ReceivedLetter.created_by == str(current_user.id))

# Test endpoint that doesn't require authentication
@router.get("/test", response_model=dict)
def test_endpoint():
    """Test endpoint to verify the received letters API is working"""
    return {
        "message": "Received Letters API is working!",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.post("/", response_model=ReceivedLetterRead, status_code=status.HTTP_201_CREATED)
def create_letter(
    letter_data: ReceivedLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new received letter"""
    try:
        # Set tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        letter = create_received_letter(db, letter_data, str(current_user.id), tenant_id)
        return letter
    except Exception as e:
        logger.error(f"Error creating letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create letter: {str(e)}"
        )

@router.get("/", response_model=ReceivedLetterList)
def get_letters(
    search: Optional[str] = Query(None, description="Search term for sender, subject, content, or category"),
    status: Optional[LetterStatus] = Query(None, description="Filter by letter status"),
    priority: Optional[LetterPriority] = Query(None, description="Filter by letter priority"),
    category: Optional[LetterCategory] = Query(None, description="Filter by letter category"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter by received date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by received date to"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get filtered received letters with pagination and role-based access control"""
    try:
        # Start with base query
        base_query = select(ReceivedLetter)
        
        # Apply role-based filtering
        filtered_query = get_filtered_letter_query(current_user, base_query, db, "received")
        
        # Apply additional filters
        if search:
            search_filter = or_(
                ReceivedLetter.sender.contains(search),
                ReceivedLetter.subject.contains(search),
                ReceivedLetter.content.contains(search),
                ReceivedLetter.category.contains(search)
            )
            filtered_query = filtered_query.filter(search_filter)
        
        if status:
            filtered_query = filtered_query.filter(ReceivedLetter.status == status)
        
        if priority:
            filtered_query = filtered_query.filter(ReceivedLetter.priority == priority)
        
        if category:
            filtered_query = filtered_query.filter(ReceivedLetter.category == category)
        
        if assigned_to:
            filtered_query = filtered_query.filter(ReceivedLetter.assigned_to == str(assigned_to))
        
        if date_from:
            filtered_query = filtered_query.filter(ReceivedLetter.received_date >= date_from)
        
        if date_to:
            filtered_query = filtered_query.filter(ReceivedLetter.received_date <= date_to)
        
        # Get total count for pagination
        from sqlmodel import func
        total_query = select(func.count()).select_from(filtered_query.subquery())
        total = db.exec(total_query).first() or 0
        
        # Apply pagination and ordering
        from sqlmodel import desc
        filtered_query = filtered_query.order_by(desc(ReceivedLetter.created_at))
        filtered_query = filtered_query.offset((page - 1) * per_page).limit(per_page)
        
        # Execute query
        letters = db.exec(filtered_query).all()
        
        total_pages = (total + per_page - 1) // per_page
        
        return ReceivedLetterList(
            letters=letters,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.get("/all", response_model=List[ReceivedLetterRead])
def get_all_letters(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_session)
):
    """Get all received letters (for backward compatibility)"""
    try:
        letters = get_all_received_letters(db, skip, limit, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching all letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.get("/{letter_id}", response_model=ReceivedLetterRead)
def get_letter(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific received letter by ID with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        letter = get_received_letter(db, letter_id, tenant_id)
        
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can see all letters
        if user_role == "super_admin":
            return letter
        
        # Admin can see letters they created + letters assigned to their Field Agents
        if user_role == "admin":
            # Check if admin created the letter
            if letter.created_by == str(current_user.id):
                return letter
            
            # Check if letter is assigned to a Field Agent in their tenant
            if letter.assigned_to:
                assigned_user = db.get(User, letter.assigned_to)
                if assigned_user and assigned_user.tenant_id == tenant_id:
                    # Check if assigned user is a Field Agent
                    if assigned_user.role and assigned_user.role.name == "FieldAgent":
                        return letter
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access letters you created or letters assigned to your Field Agents"
            )
        
        # Field Agent can only see letters assigned to them
        if user_role in ["field_agent", "assistant"]:
            if letter.assigned_to != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only access letters assigned to you"
                )
            return letter
        
        # Regular users can only see letters they created
        if letter.created_by != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access letters you created"
            )
        
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letter: {str(e)}"
        )

@router.put("/{letter_id}", response_model=ReceivedLetterRead)
def update_letter(
    letter_id: int,
    letter_data: ReceivedLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a received letter with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        # First check if letter exists and user has access
        letter = get_received_letter(db, letter_id, tenant_id)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can update all letters
        if user_role == "super_admin":
            pass  # Allow update
        
        # Admin can update letters they created + letters assigned to their Field Agents
        elif user_role == "admin":
            # Check if admin created the letter
            if letter.created_by == str(current_user.id):
                pass  # Allow update
            # Check if letter is assigned to a Field Agent in their tenant
            elif letter.assigned_to:
                assigned_user = db.get(User, letter.assigned_to)
                if assigned_user and assigned_user.tenant_id == tenant_id:
                    # Check if assigned user is a Field Agent
                    if assigned_user.role and assigned_user.role.name == "FieldAgent":
                        pass  # Allow update
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: You can only update letters you created or letters assigned to your Field Agents"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters you created or letters assigned to your Field Agents"
                )
        
        # Field Agent can only update letters assigned to them
        elif user_role in ["field_agent", "assistant"]:
            if letter.assigned_to != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters assigned to you"
                )
        
        # Regular users can only update letters they created
        else:
            if letter.created_by != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters you created"
                )
        
        # Perform the update
        letter = update_received_letter(db, letter_id, letter_data, str(current_user.id), tenant_id)
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update letter: {str(e)}"
        )

@router.delete("/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_letter(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a received letter with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        # First check if letter exists and user has access
        letter = get_received_letter(db, letter_id, tenant_id)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can delete all letters
        if user_role == "super_admin":
            pass  # Allow delete
        
        # Admin can delete letters they created + letters assigned to their Field Agents
        elif user_role == "admin":
            # Check if admin created the letter
            if letter.created_by == str(current_user.id):
                pass  # Allow delete
            # Check if letter is assigned to a Field Agent in their tenant
            elif letter.assigned_to:
                assigned_user = db.get(User, letter.assigned_to)
                if assigned_user and assigned_user.tenant_id == tenant_id:
                    # Check if assigned user is a Field Agent
                    if assigned_user.role and assigned_user.role.name == "FieldAgent":
                        pass  # Allow delete
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: You can only delete letters you created or letters assigned to your Field Agents"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only delete letters you created or letters assigned to your Field Agents"
                )
        
        # Field Agents and Assistants CANNOT delete letters (CRU only)
        elif user_role in ["field_agent", "assistant"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Field Agents and Assistants cannot delete letters"
            )
        
        # Regular users can only delete letters they created
        else:
            if letter.created_by != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only delete letters you created"
                )
        
        # Perform the delete
        success = delete_received_letter(db, letter_id, tenant_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete letter: {str(e)}"
        )

@router.get("/statistics/overview", response_model=LetterStatistics)
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get letter statistics with role-based filtering"""
    try:
        # Get user role and tenant_id for filtering
        user_role = get_user_role_name(current_user)
        tenant_id = None
        
        if user_role == "admin" and hasattr(current_user, 'tenant_id'):
            tenant_id = current_user.tenant_id
        
        stats = get_letter_statistics(db, tenant_id, str(current_user.id), user_role)
        return stats
    except Exception as e:
        logger.error(f"Error fetching letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get("/status/{status}", response_model=List[ReceivedLetterRead])
def get_letters_by_status_route(
    status: LetterStatus,
    db: Session = Depends(get_session)
):
    """Get letters by status"""
    try:
        letters = get_letters_by_status(db, status, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching letters by status {status}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.get("/priority/{priority}", response_model=List[ReceivedLetterRead])
def get_letters_by_priority_route(
    priority: LetterPriority,
    db: Session = Depends(get_session)
):
    """Get letters by priority"""
    try:
        letters = get_letters_by_priority(db, priority, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching letters by priority {priority}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.get("/overdue/all", response_model=List[ReceivedLetterRead])
def get_overdue_letters_route(
    db: Session = Depends(get_session)
):
    """Get all overdue letters"""
    try:
        letters = get_overdue_letters(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching overdue letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch overdue letters: {str(e)}"
        )

@router.post("/{letter_id}/assign", response_model=ReceivedLetterRead)
def assign_letter(
    letter_id: int,
    assigned_user_id: str,
    db: Session = Depends(get_session)
):
    """Assign a letter to a specific user"""
    try:
        # Use a default user ID of "1" for the user performing the assignment
        letter = assign_letter_to_user(db, letter_id, "1", assigned_user_id, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning letter {letter_id} to user {assigned_user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign letter: {str(e)}"
        )

@router.post("/{letter_id}/status", response_model=ReceivedLetterRead)
def update_status(
    letter_id: int,
    status: LetterStatus,
    db: Session = Depends(get_session)
):
    """Update letter status"""
    try:
        # Use a default user ID of "1" for the user updating the status
        letter = update_letter_status(db, letter_id, status, "1", None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating letter {letter_id} status to {status}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update letter status: {str(e)}"
        )

@router.get("/categories/list", response_model=List[str])
def get_categories():
    """Get list of available letter categories"""
    return [category.value for category in LetterCategory]

@router.get("/priorities/list", response_model=List[str])
def get_priorities():
    """Get list of available letter priorities"""
    return [priority.value for priority in LetterPriority]

@router.get("/statuses/list", response_model=List[str])
def get_statuses():
    """Get list of available letter statuses"""
    return [status.value for status in LetterStatus]

