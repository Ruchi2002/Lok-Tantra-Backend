from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
from app.core.auth import get_current_user
from app.models.sent_letter import SentLetterStatus, SentLetterPriority, SentLetterCategory
from app.schemas.sent_letter_schema import (
    SentLetterCreate, SentLetterRead, SentLetterUpdate, 
    SentLetterList, SentLetterStatistics, SentLetterFilters
)
from app.crud.sent_letter_crud import (
    create_sent_letter, get_sent_letter, get_all_sent_letters,
    get_filtered_sent_letters, update_sent_letter, delete_sent_letter,
    get_sent_letter_statistics, get_sent_letters_by_status, get_sent_letters_by_priority,
    get_overdue_followups, get_followups_due_this_week, assign_sent_letter_to_user, 
    update_sent_letter_status, record_response_received
)
from app.models.user import User
from app.utils.role_permissions import RolePermissions

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sent-letters", tags=["Sent Letters - Public Interest"])

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

# Test endpoint that doesn't require authentication
@router.get("/test", response_model=dict)
def test_endpoint():
    """Test endpoint to verify the sent letters API is working"""
    return {
        "message": "Sent Letters - Public Interest API is working!",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.post("/", response_model=SentLetterRead, status_code=status.HTTP_201_CREATED)
def create_letter(
    letter_data: SentLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new sent letter for public interest"""
    try:
        # Set tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        letter = create_sent_letter(db, letter_data, str(current_user.id), tenant_id)
        return letter
    except Exception as e:
        logger.error(f"Error creating sent letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sent letter: {str(e)}"
        )

@router.get("/", response_model=SentLetterList)
def get_letters(
    search: Optional[str] = Query(None, description="Search term for recipient, organization, subject, content, or category"),
    status: Optional[SentLetterStatus] = Query(None, description="Filter by letter status"),
    priority: Optional[SentLetterPriority] = Query(None, description="Filter by letter priority"),
    category: Optional[SentLetterCategory] = Query(None, description="Filter by letter category"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter by sent date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by sent date to"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get filtered sent letters with pagination and role-based access control"""
    try:
        # Get tenant_id from current user for role-based filtering
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        filters = SentLetterFilters(
            search=search,
            status=status,
            priority=priority,
            category=category,
            assigned_to=assigned_to,
            date_from=date_from,
            date_to=date_to,
            page=page,
            per_page=per_page
        )
        
        # Get user role for filtering
        user_role = get_user_role_name(current_user)
        
        result = get_filtered_sent_letters(db, filters, tenant_id, str(current_user.id), user_role)
        return SentLetterList(**result)
    except Exception as e:
        logger.error(f"Error fetching sent letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent letters: {str(e)}"
        )

@router.get("/all", response_model=List[SentLetterRead])
def get_all_letters(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_session)
):
    """Get all sent letters (for backward compatibility)"""
    try:
        letters = get_all_sent_letters(db, skip, limit, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching all sent letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent letters: {str(e)}"
        )

# Specific endpoints that must come before /{letter_id} routes
@router.get("/statistics", response_model=SentLetterStatistics)
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get sent letter statistics for dashboard KPIs with role-based filtering"""
    try:
        # Get user role and tenant_id for filtering
        user_role = get_user_role_name(current_user)
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        stats = get_sent_letter_statistics(db, tenant_id, str(current_user.id), user_role)
        return stats
    except Exception as e:
        logger.error(f"Error fetching sent letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get("/statistics/overview", response_model=SentLetterStatistics)
def get_statistics_overview(
    db: Session = Depends(get_session)
):
    """Get sent letter statistics for dashboard KPIs (alternative endpoint)"""
    try:
        stats = get_sent_letter_statistics(db, None)
        return stats
    except Exception as e:
        logger.error(f"Error fetching sent letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get("/categories", response_model=List[str])
def get_categories():
    """Get all available letter categories"""
    return [category.value for category in SentLetterCategory]

@router.get("/priorities", response_model=List[str])
def get_priorities():
    """Get all available letter priorities"""
    return [priority.value for priority in SentLetterPriority]

@router.get("/statuses", response_model=List[str])
def get_statuses():
    """Get all available letter statuses"""
    return [status.value for status in SentLetterStatus]

@router.get("/overdue-followups", response_model=List[SentLetterRead])
def get_overdue_followups(
    db: Session = Depends(get_session)
):
    """Get all sent letters with overdue follow-ups"""
    try:
        letters = get_overdue_followups(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching overdue followups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch overdue followups: {str(e)}"
        )

@router.get("/followups-due-this-week", response_model=List[SentLetterRead])
def get_followups_due_this_week(
    db: Session = Depends(get_session)
):
    """Get all sent letters with follow-ups due this week"""
    try:
        letters = get_followups_due_this_week(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching followups due this week: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch followups due this week: {str(e)}"
        )

@router.get("/status/{status}", response_model=List[SentLetterRead])
def get_letters_by_status_route(
    status: SentLetterStatus,
    db: Session = Depends(get_session)
):
    """Get sent letters by status"""
    try:
        letters = get_sent_letters_by_status(db, status, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching sent letters by status {status}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent letters: {str(e)}"
        )

@router.get("/priority/{priority}", response_model=List[SentLetterRead])
def get_letters_by_priority_route(
    priority: SentLetterPriority,
    db: Session = Depends(get_session)
):
    """Get sent letters by priority"""
    try:
        letters = get_sent_letters_by_priority(db, priority, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching sent letters by priority {priority}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent letters: {str(e)}"
        )

@router.get("/overdue-followups/all", response_model=List[SentLetterRead])
def get_overdue_followups_all(
    db: Session = Depends(get_session)
):
    """Get all sent letters with overdue follow-ups (alternative endpoint)"""
    try:
        letters = get_overdue_followups(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching overdue followups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch overdue followups: {str(e)}"
        )

@router.get("/followups-due-this-week/all", response_model=List[SentLetterRead])
def get_followups_due_this_week_all(
    db: Session = Depends(get_session)
):
    """Get all sent letters with follow-ups due this week (alternative endpoint)"""
    try:
        letters = get_followups_due_this_week(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching followups due this week: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch followups due this week: {str(e)}"
        )

@router.get("/categories/list", response_model=List[str])
def get_categories_list():
    """Get list of available sent letter categories (alternative endpoint)"""
    return [category.value for category in SentLetterCategory]

@router.get("/priorities/list", response_model=List[str])
def get_priorities_list():
    """Get list of available sent letter priorities (alternative endpoint)"""
    return [priority.value for priority in SentLetterPriority]

@router.get("/statuses/list", response_model=List[str])
def get_statuses_list():
    """Get list of available sent letter statuses (alternative endpoint)"""
    return [status.value for status in SentLetterStatus]

# Now the /{letter_id} routes
@router.get("/{letter_id}", response_model=SentLetterRead)
def get_letter(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific sent letter by ID with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        letter = get_sent_letter(db, letter_id, tenant_id)
        
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can see all letters
        if user_role == "super_admin":
            return letter
        
        # Admin can see letters from their tenant
        if user_role == "admin":
            if letter.tenant_id != tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only access letters from your organization"
                )
            return letter
        
        # Field Agent can only see letters assigned to them or created by them
        if user_role in ["field_agent", "assistant"]:
            if letter.assigned_to != str(current_user.id) and letter.created_by != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only access letters assigned to you or created by you"
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
        logger.error(f"Error fetching sent letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent letter: {str(e)}"
        )

@router.put("/{letter_id}", response_model=SentLetterRead)
def update_letter(
    letter_id: int,
    letter_data: SentLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a sent letter with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        # First check if letter exists and user has access
        letter = get_sent_letter(db, letter_id, tenant_id)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can update all letters
        if user_role == "super_admin":
            pass  # Allow update
        
        # Admin can update letters from their tenant
        elif user_role == "admin":
            if letter.tenant_id != tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters from your organization"
                )
        
        # Field Agent can only update letters assigned to them or created by them
        elif user_role in ["field_agent", "assistant"]:
            if letter.assigned_to != str(current_user.id) and letter.created_by != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters assigned to you or created by you"
                )
        
        # Regular users can only update letters they created
        else:
            if letter.created_by != str(current_user.id):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only update letters you created"
                )
        
        # Perform the update
        letter = update_sent_letter(db, letter_id, letter_data, str(current_user.id), tenant_id)
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sent letter: {str(e)}"
        )

@router.delete("/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_letter(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a sent letter with role-based access control"""
    try:
        # Get tenant_id from current user
        tenant_id = current_user.tenant_id if hasattr(current_user, 'tenant_id') else None
        
        # First check if letter exists and user has access
        letter = get_sent_letter(db, letter_id, tenant_id)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Apply role-based access control
        user_role = get_user_role_name(current_user)
        
        # Super Admin can delete all letters
        if user_role == "super_admin":
            pass  # Allow delete
        
        # Admin can delete letters from their tenant
        elif user_role == "admin":
            if letter.tenant_id != tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: You can only delete letters from your organization"
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
        success = delete_sent_letter(db, letter_id, tenant_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sent letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sent letter: {str(e)}"
        )

@router.post("/{letter_id}/assign", response_model=SentLetterRead)
def assign_letter(
    letter_id: int,
    assigned_user_id: int,
    db: Session = Depends(get_session)
):
    """Assign a sent letter to a specific user"""
    try:
        # Use a default user ID for the user performing the assignment
        letter = assign_sent_letter_to_user(db, letter_id, "1", str(assigned_user_id), None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning sent letter {letter_id} to user {assigned_user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign sent letter: {str(e)}"
        )

@router.post("/{letter_id}/status", response_model=SentLetterRead)
def update_status(
    letter_id: int,
    status: SentLetterStatus,
    db: Session = Depends(get_session)
):
    """Update sent letter status"""
    try:
        # Use a default user ID for the user updating the status
        letter = update_sent_letter_status(db, letter_id, status, "1", None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent letter {letter_id} status to {status}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sent letter status: {str(e)}"
        )

@router.post("/{letter_id}/record-response", response_model=SentLetterRead)
def record_response(
    letter_id: int,
    response_content: str = Query(..., description="Response content received"),
    db: Session = Depends(get_session)
):
    """Record that a response was received for a sent letter"""
    try:
        # Use a default user ID for the user recording the response
        letter = record_response_received(db, letter_id, response_content, "1", None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording response for sent letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record response: {str(e)}"
        )

# Additional endpoints that frontend expects
@router.patch("/{letter_id}/status", response_model=SentLetterRead)
def update_letter_status(
    letter_id: int,
    status_data: dict,
    db: Session = Depends(get_session)
):
    """Update the status of a sent letter"""
    try:
        new_status = status_data.get("status")
        if not new_status:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Status is required"
            )
        
        success = update_sent_letter_status(db, letter_id, new_status, "1", None)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Return the updated letter
        letter = get_sent_letter(db, letter_id, None)
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent letter status {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sent letter status: {str(e)}"
        )

@router.post("/{letter_id}/response", response_model=SentLetterRead)
def record_response_main(
    letter_id: int,
    response_data: dict,
    db: Session = Depends(get_session)
):
    """Record a response received for a sent letter"""
    try:
        response_content = response_data.get("response_content")
        if not response_content:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Response content is required"
            )
        
        success = record_response_received(db, letter_id, response_content, "1", None)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Return the updated letter
        letter = get_sent_letter(db, letter_id, None)
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording response for sent letter {letter_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record response: {str(e)}"
        )

@router.patch("/{letter_id}/assign", response_model=SentLetterRead)
def assign_letter_to_user(
    letter_id: int,
    assign_data: dict,
    db: Session = Depends(get_session)
):
    """Assign a sent letter to a user"""
    try:
        user_id = assign_data.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="User ID is required"
            )
        
        success = assign_sent_letter_to_user(db, letter_id, "1", str(user_id), None)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
        
        # Return the updated letter
        letter = get_sent_letter(db, letter_id, None)
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning sent letter {letter_id} to user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign letter: {str(e)}"
        )

