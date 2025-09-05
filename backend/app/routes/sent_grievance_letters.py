from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.models.citizen_issues import CitizenIssue
from app.models.sent_grievance_letter import (
    SentGrievanceLetterStatus, 
    SentGrievanceLetterPriority, 
    SentGrievanceLetterCategory
)
from app.schemas.sent_grievance_letter_schema import (
    SentGrievanceLetterCreate, 
    SentGrievanceLetterRead, 
    SentGrievanceLetterUpdate, 
    SentGrievanceLetterList, 
    SentGrievanceLetterStatistics, 
    SentGrievanceLetterFilters
)
from app.crud.sent_grievance_letter_crud import (
    create_sent_grievance_letter, 
    get_sent_grievance_letter, 
    get_all_sent_grievance_letters,
    get_filtered_sent_grievance_letters, 
    update_sent_grievance_letter, 
    delete_sent_grievance_letter,
    get_sent_grievance_letter_statistics, 
    get_sent_grievance_letters_by_status, 
    get_sent_grievance_letters_by_priority,
    get_overdue_followups, 
    get_followups_due_this_week, 
    assign_sent_grievance_letter_to_user, 
    update_sent_grievance_letter_status, 
    record_response_received
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sent-grievance-letters", tags=["Sent Letters - Public Grievance"])

def get_user_role_name(user: User) -> str:
    """Safely get user role name with proper error handling"""
    try:
        if hasattr(user, 'role') and user.role:
            if hasattr(user.role, 'name'):
                return user.role.name
            elif isinstance(user.role, str):
                return user.role
        
        if hasattr(user, 'role_name'):
            return user.role_name
            
        return "assistant"  # Safe fallback
        
    except Exception as e:
        logger.error(f"Error getting user role for user {user.id}: {e}")
        return "assistant"

def check_letter_access(user: User, letter, letter_type: str = "sent_grievance") -> bool:
    """Check if user has access to a specific letter based on role and permissions"""
    if not user or not letter:
        return False
    
    user_role = get_user_role_name(user)
    
    # Super Admin can access all letters
    if user_role == "super_admin":
        return True
    
    # Admin can access letters from their tenant
    if user_role in ["admin", "tenant_admin"]:
        if hasattr(user, 'tenant_id') and hasattr(letter, 'tenant_id'):
            return user.tenant_id == letter.tenant_id
        return True  # Fallback for missing tenant info
    
    # Field Agent can only access letters they created or are assigned to
    if user_role in ["field_agent", "assistant", "FieldAgent"]:
        if hasattr(letter, 'created_by') and letter.created_by == user.id:
            return True
        if hasattr(letter, 'assigned_to') and letter.assigned_to == user.id:
            return True
        return False
    
    return False

def get_filtered_letter_query(current_user: User, base_query=None):
    """Get query with role-based filtering for letters"""
    if base_query is None:
        from app.models.sent_grievance_letter import SentGrievanceLetter
        base_query = select(SentGrievanceLetter)
    
    user_role = get_user_role_name(current_user)
    
    # Super Admin can see all letters
    if user_role == "super_admin":
        return base_query
    
    # Admin can see letters from their tenant
    if user_role in ["admin", "tenant_admin"]:
        if hasattr(current_user, 'tenant_id') and current_user.tenant_id:
            return base_query.where(SentGrievanceLetter.tenant_id == current_user.tenant_id)
        return base_query.filter(False)  # Return no results if no tenant
    
    # Field Agent can only see letters they created or are assigned to
    if user_role in ["field_agent", "assistant", "FieldAgent"]:
        return base_query.filter(
            or_(
                SentGrievanceLetter.created_by == current_user.id,
                SentGrievanceLetter.assigned_to == current_user.id
            )
        )
    
    return base_query.filter(False)  # Return no results for unknown roles

# Test endpoint that doesn't require authentication
@router.get("/test", response_model=dict)
def test_endpoint():
    """Test endpoint to verify the sent grievance letters API is working"""
    return {
        "message": "Sent Letters - Public Grievance API is working!",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success"
    }

@router.post("/", response_model=SentGrievanceLetterRead, status_code=status.HTTP_201_CREATED)
def create_letter(
    letter_data: SentGrievanceLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new sent grievance letter with role-based access control"""
    try:
        user_role = get_user_role_name(current_user)
        
        # Verify that the citizen issue exists and user has access to it
        citizen_issue = db.exec(
            select(CitizenIssue).where(CitizenIssue.id == letter_data.grievance_id)
        ).first()
        
        if not citizen_issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen issue with ID {letter_data.grievance_id} not found"
            )
        
        # Check if user can create a letter for this issue
        if user_role in ["field_agent", "assistant", "FieldAgent"]:
            # Field Agents can only create letters for issues they created or are assigned to
            if citizen_issue.created_by != current_user.id and citizen_issue.assigned_to != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only create grievance letters for issues you created or are assigned to"
                )
        elif user_role in ["admin", "tenant_admin"]:
            # Admins can create letters for issues from their tenant
            if hasattr(current_user, 'tenant_id') and current_user.tenant_id != citizen_issue.tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You can only create grievance letters for issues from your tenant"
                )
        elif user_role != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create grievance letters"
            )
        
        # Create the letter with proper user context
        letter = create_sent_grievance_letter(
            db, 
            letter_data, 
            current_user.id, 
            getattr(current_user, 'tenant_id', None)
        )
        return letter
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error creating sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create sent grievance letter: {str(e)}"
        )

@router.get("/", response_model=SentGrievanceLetterList)
def get_letters(
    search: Optional[str] = Query(None, description="Search term for recipient, organization, subject, content, or category"),
    status: Optional[SentGrievanceLetterStatus] = Query(None, description="Filter by letter status"),
    priority: Optional[SentGrievanceLetterPriority] = Query(None, description="Filter by letter priority"),
    category: Optional[SentGrievanceLetterCategory] = Query(None, description="Filter by letter category"),
    grievance_id: Optional[str] = Query(None, description="Filter by grievance ID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter by sent date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by sent date to"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_session)
):
    """Get filtered sent grievance letters with pagination (public endpoint for backward compatibility)"""
    try:
        # Use the original CRUD function for backward compatibility
        filters = SentGrievanceLetterFilters(
            search=search,
            status=status,
            priority=priority,
            category=category,
            grievance_id=grievance_id,
            assigned_to=assigned_to,
            date_from=date_from,
            date_to=date_to,
            page=page,
            per_page=per_page
        )
        
        result = get_filtered_sent_grievance_letters(db, filters, None)
        return SentGrievanceLetterList(**result)
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent grievance letters: {str(e)}"
        )

@router.get("/authenticated", response_model=SentGrievanceLetterList)
def get_letters_authenticated(
    search: Optional[str] = Query(None, description="Search term for recipient, organization, subject, content, or category"),
    status: Optional[SentGrievanceLetterStatus] = Query(None, description="Filter by letter status"),
    priority: Optional[SentGrievanceLetterPriority] = Query(None, description="Filter by letter priority"),
    category: Optional[SentGrievanceLetterCategory] = Query(None, description="Filter by letter category"),
    grievance_id: Optional[str] = Query(None, description="Filter by grievance ID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter by sent date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by sent date to"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get filtered sent grievance letters with role-based access control and pagination"""
    try:
        user_role = get_user_role_name(current_user)
        logger.info(f"Fetching sent grievance letters for user {current_user.email} with role {user_role}")
        
        # Get role-based filtered query
        from app.models.sent_grievance_letter import SentGrievanceLetter
        base_query = select(SentGrievanceLetter)
        filtered_query = get_filtered_letter_query(current_user, base_query)
        
        # Apply additional filters
        if search:
            search_filter = or_(
                SentGrievanceLetter.recipient_name.ilike(f"%{search}%"),
                SentGrievanceLetter.recipient_organization.ilike(f"%{search}%"),
                SentGrievanceLetter.subject.ilike(f"%{search}%"),
                SentGrievanceLetter.content.ilike(f"%{search}%"),
                SentGrievanceLetter.category.ilike(f"%{search}%")
            )
            filtered_query = filtered_query.where(search_filter)
        
        if status:
            filtered_query = filtered_query.where(SentGrievanceLetter.status == status)
        
        if priority:
            filtered_query = filtered_query.where(SentGrievanceLetter.priority == priority)
        
        if category:
            filtered_query = filtered_query.where(SentGrievanceLetter.category == category)
        
        if grievance_id:
            filtered_query = filtered_query.where(SentGrievanceLetter.grievance_id == grievance_id)
        
        if assigned_to:
            filtered_query = filtered_query.where(SentGrievanceLetter.assigned_to == assigned_to)
        
        if date_from:
            filtered_query = filtered_query.where(SentGrievanceLetter.sent_date >= date_from)
        
        if date_to:
            filtered_query = filtered_query.where(SentGrievanceLetter.sent_date <= date_to)
        
        # Get total count for pagination
        from sqlmodel import func
        total_query = select(func.count()).select_from(filtered_query.subquery())
        total = db.exec(total_query).first() or 0
        
        # Apply pagination and ordering
        from sqlmodel import desc
        filtered_query = filtered_query.order_by(desc(SentGrievanceLetter.created_at))
        filtered_query = filtered_query.offset((page - 1) * per_page).limit(per_page)
        
        letters = db.exec(filtered_query).all()
        
        result = {
            "letters": letters,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        }
        
        logger.info(f"Returning {len(letters)} letters out of {total} total for user {current_user.email}")
        return SentGrievanceLetterList(**result)
        
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent grievance letters: {str(e)}"
        )

@router.get("/all", response_model=List[SentGrievanceLetterRead])
def get_all_letters(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get all sent grievance letters with role-based access control"""
    try:
        user_role = get_user_role_name(current_user)
        tenant_id = getattr(current_user, 'tenant_id', None)
        
        # Apply role-based filtering
        if user_role == "super_admin":
            letters = get_all_sent_grievance_letters(db, skip, limit, None)
        elif user_role in ["admin", "tenant_admin"]:
            letters = get_all_sent_grievance_letters(db, skip, limit, tenant_id)
        elif user_role in ["field_agent", "assistant", "FieldAgent"]:
            # Field Agents can only see their own letters
            from app.models.sent_grievance_letter import SentGrievanceLetter
            query = select(SentGrievanceLetter).where(
                or_(
                    SentGrievanceLetter.created_by == current_user.id,
                    SentGrievanceLetter.assigned_to == current_user.id
                )
            ).offset(skip).limit(limit)
            letters = db.exec(query).all()
        else:
            letters = []
        
        return letters
    except Exception as e:
        logger.error(f"Error fetching all sent grievance letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent grievance letters: {str(e)}"
        )

@router.get("/accessible-citizen-issues", response_model=List[dict])
def get_accessible_citizen_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get citizen issues that the current user can create grievance letters for"""
    try:
        user_role = get_user_role_name(current_user)
        logger.info(f"Fetching accessible citizen issues for user {current_user.email} with role {user_role}")
        
        # Build query based on user role
        if user_role == "super_admin":
            # Super admin can see all issues
            query = select(CitizenIssue)
        elif user_role in ["admin", "tenant_admin"]:
            # Admin can see issues from their tenant
            if hasattr(current_user, 'tenant_id') and current_user.tenant_id:
                query = select(CitizenIssue).where(CitizenIssue.tenant_id == current_user.tenant_id)
            else:
                query = select(CitizenIssue).where(False)  # No results if no tenant
        elif user_role in ["field_agent", "assistant", "FieldAgent"]:
            # Field Agents can see issues they created or are assigned to
            query = select(CitizenIssue).where(
                or_(
                    CitizenIssue.created_by == current_user.id,
                    CitizenIssue.assigned_to == current_user.id
                )
            )
        else:
            query = select(CitizenIssue).where(False)  # No results for unknown roles
        
        # Execute query and transform results
        issues = db.exec(query.order_by(CitizenIssue.created_at.desc())).all()
        
        result = []
        for issue in issues:
            result.append({
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "status": issue.status,
                "priority": issue.priority,
                "location": issue.location,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
                "created_by": issue.created_by,
                "assigned_to": issue.assigned_to,
                "tenant_id": issue.tenant_id
            })
        
        logger.info(f"Returning {len(result)} accessible citizen issues for user {current_user.email}")
        return result
        
    except Exception as e:
        logger.error(f"Error fetching accessible citizen issues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch accessible citizen issues: {str(e)}"
        )

@router.get("/{letter_id}", response_model=SentGrievanceLetterRead)
def get_letter(
    letter_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific sent grievance letter by ID with role-based access control"""
    try:
        letter = get_sent_grievance_letter(db, letter_id, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        
        # Check if user has access to this letter
        if not check_letter_access(current_user, letter):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this letter"
            )
        
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent grievance letter: {str(e)}"
        )

@router.put("/{letter_id}", response_model=SentGrievanceLetterRead)
def update_letter(
    letter_id: int,
    letter_data: SentGrievanceLetterUpdate,
    db: Session = Depends(get_session)
):
    """Update a sent grievance letter"""
    try:
        letter = update_sent_grievance_letter(db, letter_id, letter_data, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update sent grievance letter: {str(e)}"
        )

@router.delete("/{letter_id}", response_model=dict)
def delete_letter(
    letter_id: int,
    db: Session = Depends(get_session)
):
    """Delete a sent grievance letter"""
    try:
        success = delete_sent_grievance_letter(db, letter_id, None)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        return {"message": "Sent grievance letter deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete sent grievance letter: {str(e)}"
        )

@router.get("/statistics/overview", response_model=SentGrievanceLetterStatistics)
def get_statistics(
    db: Session = Depends(get_session)
):
    """Get statistics for sent grievance letters"""
    try:
        stats = get_sent_grievance_letter_statistics(db, None)
        return stats
    except Exception as e:
        logger.error(f"Error fetching sent grievance letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get("/status/{status}", response_model=List[SentGrievanceLetterRead])
def get_letters_by_status(
    status: SentGrievanceLetterStatus,
    db: Session = Depends(get_session)
):
    """Get sent grievance letters by status"""
    try:
        letters = get_sent_grievance_letters_by_status(db, status, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters by status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters by status: {str(e)}"
        )

@router.get("/priority/{priority}", response_model=List[SentGrievanceLetterRead])
def get_letters_by_priority(
    priority: SentGrievanceLetterPriority,
    db: Session = Depends(get_session)
):
    """Get sent grievance letters by priority"""
    try:
        letters = get_sent_grievance_letters_by_priority(db, priority, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters by priority: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters by priority: {str(e)}"
        )

@router.get("/overdue-followups/all", response_model=List[SentGrievanceLetterRead])
def get_overdue_followups_endpoint(
    db: Session = Depends(get_session)
):
    """Get overdue follow-up letters"""
    try:
        letters = get_overdue_followups(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching overdue followups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch overdue followups: {str(e)}"
        )

@router.get("/followups-due-this-week/all", response_model=List[SentGrievanceLetterRead])
def get_followups_due_this_week_endpoint(
    db: Session = Depends(get_session)
):
    """Get follow-ups due this week"""
    try:
        letters = get_followups_due_this_week(db, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching followups due this week: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch followups due this week: {str(e)}"
        )

@router.post("/{letter_id}/assign", response_model=SentGrievanceLetterRead)
def assign_letter(
    letter_id: int,
    assigned_user_id: int = Query(..., description="User ID to assign the letter to"),
    db: Session = Depends(get_session)
):
    """Assign a sent grievance letter to a user"""
    try:
        letter = assign_sent_grievance_letter_to_user(db, letter_id, assigned_user_id, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning sent grievance letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign letter: {str(e)}"
        )

@router.post("/{letter_id}/status", response_model=SentGrievanceLetterRead)
def update_letter_status(
    letter_id: int,
    status: SentGrievanceLetterStatus = Query(..., description="New status for the letter"),
    db: Session = Depends(get_session)
):
    """Update the status of a sent grievance letter"""
    try:
        letter = update_sent_grievance_letter_status(db, letter_id, status, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent grievance letter status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

@router.post("/{letter_id}/record-response", response_model=SentGrievanceLetterRead)
def record_response(
    letter_id: int,
    response_content: str = Query(..., description="Response content received"),
    db: Session = Depends(get_session)
):
    """Record that a response has been received for a sent grievance letter"""
    try:
        letter = record_response_received(db, letter_id, response_content, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
            )
        return letter
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording response: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record response: {str(e)}"
        )

@router.get("/categories/list", response_model=List[str])
def get_categories():
    """Get available categories"""
    return [category.value for category in SentGrievanceLetterCategory]

@router.get("/priorities/list", response_model=List[str])
def get_priorities():
    """Get available priorities"""
    return [priority.value for priority in SentGrievanceLetterPriority]

@router.get("/statuses/list", response_model=List[str])
def get_statuses():
    """Get available statuses"""
    return [status.value for status in SentGrievanceLetterStatus]

# ===== ROLE-BASED ENDPOINTS FOR CITIZEN ISSUES =====

@router.get("/field-agent-issues", response_model=List[dict])
def get_field_agent_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get citizen issues that Field Agents can create grievance letters for"""
    try:
        user_role = get_user_role_name(current_user)
        
        # Check if user is a Field Agent
        if user_role not in ["field_agent", "assistant", "FieldAgent"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only Field Agents can access this endpoint."
            )
        
        # Get issues created by or assigned to this Field Agent
        query = select(CitizenIssue).where(
            or_(
                CitizenIssue.created_by == current_user.id,
                CitizenIssue.assigned_to == current_user.id
            )
        )
        
        issues = db.exec(query.order_by(CitizenIssue.created_at.desc())).all()
        
        result = []
        for issue in issues:
            result.append({
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "status": issue.status,
                "priority": issue.priority,
                "location": issue.location,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
                "created_by": issue.created_by,
                "assigned_to": issue.assigned_to,
                "tenant_id": issue.tenant_id,
                "can_create_letter": True  # Field Agents can always create letters for their issues
            })
        
        logger.info(f"Returning {len(result)} Field Agent issues for user {current_user.email}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Field Agent issues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Field Agent issues: {str(e)}"
        )

@router.get("/admin-issues", response_model=List[dict])
def get_admin_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get citizen issues that Admins can create grievance letters for (from their tenant's Field Agents)"""
    try:
        user_role = get_user_role_name(current_user)
        
        # Check if user is an Admin
        if user_role not in ["admin", "tenant_admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only Admins can access this endpoint."
            )
        
        # Build query based on admin role
        if user_role == "super_admin":
            # Super admin can see all issues
            query = select(CitizenIssue)
        else:
            # Regular admin can see issues from their tenant
            if not hasattr(current_user, 'tenant_id') or not current_user.tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No tenant assignment found for admin user"
                )
            query = select(CitizenIssue).where(CitizenIssue.tenant_id == current_user.tenant_id)
        
        issues = db.exec(query.order_by(CitizenIssue.created_at.desc())).all()
        
        result = []
        for issue in issues:
            # Get the creator's information
            creator_info = None
            if issue.created_by:
                creator = db.get(User, issue.created_by)
                if creator:
                    creator_info = {
                        "id": creator.id,
                        "name": creator.name,
                        "email": creator.email,
                        "role": get_user_role_name(creator)
                    }
            
            result.append({
                "id": issue.id,
                "title": issue.title,
                "description": issue.description,
                "status": issue.status,
                "priority": issue.priority,
                "location": issue.location,
                "created_at": issue.created_at.isoformat() if issue.created_at else None,
                "created_by": issue.created_by,
                "assigned_to": issue.assigned_to,
                "tenant_id": issue.tenant_id,
                "creator_info": creator_info,
                "can_create_letter": True  # Admins can create letters for tenant issues
            })
        
        logger.info(f"Returning {len(result)} admin issues for user {current_user.email}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching admin issues: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch admin issues: {str(e)}"
        )
