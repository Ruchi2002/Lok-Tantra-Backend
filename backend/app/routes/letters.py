from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from database import get_session
from app.core.auth import get_current_user
from app.utils.role_permissions import role_permissions

from app.models.received_letter import ReceivedLetter, LetterStatus, LetterPriority, LetterCategory
from app.models.sent_letter import SentLetter, SentLetterStatus, SentLetterPriority, SentLetterCategory
from app.models.sent_grievance_letter import SentGrievanceLetter, SentGrievanceLetterStatus, SentGrievanceLetterPriority, SentGrievanceLetterCategory
from app.models.user import User
from app.models.role import Role

from app.schemas.received_letter_schema import (
    ReceivedLetterCreate, ReceivedLetterRead, ReceivedLetterUpdate
)
from app.schemas.sent_letter_schema import (
    SentLetterCreate, SentLetterRead, SentLetterUpdate
)
from app.schemas.sent_grievance_letter_schema import (
    SentGrievanceLetterCreate, SentGrievanceLetterRead, SentGrievanceLetterUpdate
)

from app.crud.received_letter_crud import (
    create_received_letter, get_received_letter, update_received_letter, delete_received_letter
)
from app.crud.sent_letter_crud import (
    create_sent_letter, get_sent_letter, update_sent_letter, delete_sent_letter
)
from app.crud.sent_grievance_letter_crud import (
    create_sent_grievance_letter, get_sent_grievance_letter, update_sent_grievance_letter, delete_sent_grievance_letter
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/letters", tags=["Letters"])

def check_letter_access(user: User, letter: Any, letter_type: str) -> bool:
    """Check if user has access to a specific letter based on role and permissions"""
    if not user or not letter:
        return False
    
    # Get user role
    user_role = getattr(user, 'role', None)
    if not user_role:
        return False
    
    # Extract role name from role object
    role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
    
    # Get letter context
    letter_tenant_id = getattr(letter, 'tenant_id', None)
    letter_user_id = getattr(letter, 'assigned_to', None) or getattr(letter, 'created_by', None)
    
    # Super Admin can access all letters
    if role_permissions.can_view_letters(role_name, letter_tenant_id, user.tenant_id, letter_user_id, user.id):
        return True
    
    return False

def get_filtered_letter_query(current_user: User, base_query, letter_type: str):
    """Get query with role-based filtering for letters"""
    if base_query is None:
        return base_query
    
    user_role = getattr(current_user, 'role', None)
    if not user_role:
        return base_query.filter(False)  # Return no results
    
    role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
    
    # Super Admin can see all letters
    if role_permissions.can_view_letters(role_name, None, None, None, None):
        return base_query
    
    # Get the model class based on letter type
    if letter_type == "received":
        model_class = ReceivedLetter
    elif letter_type == "sent_public_interest":
        model_class = SentLetter
    elif letter_type == "sent_public_grievance":
        model_class = SentGrievanceLetter
    else:
        return base_query.filter(False)  # Return no results
    
    # Admin can see letters from their tenant
    if role_permissions.can_view_letters(role_name, None, current_user.tenant_id, None, None):
        return base_query.filter(model_class.tenant_id == current_user.tenant_id)
    
    # Field Agent can only see letters assigned to them
    if role_permissions.can_view_letters(role_name, None, None, None, current_user.id):
        return base_query.filter(
            or_(
                model_class.assigned_to == current_user.id,
                model_class.created_by == current_user.id
            )
        )
    
    return base_query.filter(False)  # Return no results

# Received Letters Endpoints - MOVED TO DEDICATED ROUTER
# @router.get("/received", response_model=List[ReceivedLetterRead])
# def get_received_letters(
#     search: Optional[str] = Query(None, description="Search term"),
#     status: Optional[LetterStatus] = Query(None, description="Filter by status"),
#     priority: Optional[LetterPriority] = Query(None, description="Filter by priority"),
#     category: Optional[LetterCategory] = Query(None, description="Filter by category"),
#     page: int = Query(1, ge=1, description="Page number"),
#     per_page: int = Query(20, ge=1, le=100, description="Items per page"),
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_session)
# ):
#     """Get received letters with role-based filtering"""
#     try:
#         # Base query
#         base_query = select(ReceivedLetter)
#         
#         # Apply role-based filtering
#         filtered_query = get_filtered_letter_query(current_user, base_query, "received")
#         
#         # Apply additional filters
#         if search:
#             search_filter = or_(
#                 ReceivedLetter.sender.contains(search),
#                 ReceivedLetter.subject.contains(search),
#                 ReceivedLetter.content.contains(search)
#             )
#             filtered_query = filtered_query.filter(search_filter)
#         
#         if status:
#             filtered_query = filtered_query.filter(ReceivedLetter.status == status)
#         
#         if priority:
#             filtered_query = filtered_query.filter(ReceivedLetter.priority == priority)
#         
#         if category:
#             filtered_query = filtered_query.filter(ReceivedLetter.category == category)
#         
#         # Apply pagination
#         offset = (page - 1) * per_page
#         filtered_query = filtered_query.offset(offset).limit(per_page)
#         
#         # Execute query
#         letters = db.exec(filtered_query).all()
#         return letters
#         
#     except Exception as e:
#         logger.error(f"Error fetching received letters: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to fetch letters: {str(e)}"
#         )

# @router.post("/received", response_model=ReceivedLetterRead, status_code=status.HTTP_201_CREATED)
def create_received_letter(
    letter_data: ReceivedLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new received letter"""
    try:
        # Check if user can create letters
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_create_letters(role_name):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to create letters")
        
        # Create letter with user context
        letter = create_received_letter(
            db, 
            letter_data, 
            current_user.id, 
            current_user.tenant_id
        )
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating received letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create letter: {str(e)}"
        )

# @router.get("/received/{letter_id}", response_model=ReceivedLetterRead)
def get_received_letter(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific received letter"""
    try:
        letter = get_received_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "received"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching received letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letter: {str(e)}"
        )

# @router.put("/received/{letter_id}", response_model=ReceivedLetterRead)
def update_received_letter(
    letter_id: str,
    letter_data: ReceivedLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a received letter"""
    try:
        letter = get_received_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "received"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check edit permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_edit_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to edit this letter")
        
        # Update letter
        updated_letter = update_received_letter(db, letter_id, letter_data, current_user.id)
        return updated_letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating received letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update letter: {str(e)}"
        )

# @router.delete("/received/{letter_id}")
def delete_received_letter(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a received letter"""
    try:
        letter = get_received_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "received"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check delete permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_delete_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to delete this letter")
        
        # Delete letter
        delete_received_letter(db, letter_id)
        return {"message": "Letter deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting received letter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete letter: {str(e)}"
        )

# Sent Letters (Public Interest) Endpoints
@router.get("/public-interest", response_model=List[SentLetterRead])
def get_sent_letters_public_interest(
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[SentLetterStatus] = Query(None, description="Filter by status"),
    priority: Optional[SentLetterPriority] = Query(None, description="Filter by priority"),
    category: Optional[SentLetterCategory] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get sent letters (public interest) with role-based filtering"""
    try:
        # Base query
        base_query = select(SentLetter)
        
        # Apply role-based filtering
        filtered_query = get_filtered_letter_query(current_user, base_query, "sent_public_interest")
        
        # Apply additional filters
        if search:
            search_filter = or_(
                SentLetter.recipient_name.contains(search),
                SentLetter.subject.contains(search),
                SentLetter.content.contains(search)
            )
            filtered_query = filtered_query.filter(search_filter)
        
        if status:
            filtered_query = filtered_query.filter(SentLetter.status == status)
        
        if priority:
            filtered_query = filtered_query.filter(SentLetter.priority == priority)
        
        if category:
            filtered_query = filtered_query.filter(SentLetter.category == category)
        
        # Apply pagination
        offset = (page - 1) * per_page
        filtered_query = filtered_query.offset(offset).limit(per_page)
        
        # Execute query
        letters = db.exec(filtered_query).all()
        return letters
        
    except Exception as e:
        logger.error(f"Error fetching sent letters (public interest): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.post("/public-interest", response_model=SentLetterRead, status_code=status.HTTP_201_CREATED)
def create_sent_letter_public_interest(
    letter_data: SentLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new sent letter (public interest)"""
    try:
        # Check if user can create letters
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_create_letters(role_name):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to create letters")
        
        # Create letter with user context
        letter = create_sent_letter(
            db, 
            letter_data, 
            current_user.id, 
            current_user.tenant_id
        )
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating sent letter (public interest): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create letter: {str(e)}"
        )

@router.get("/public-interest/{letter_id}", response_model=SentLetterRead)
def get_sent_letter_public_interest(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific sent letter (public interest)"""
    try:
        letter = get_sent_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_interest"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sent letter (public interest): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letter: {str(e)}"
        )

@router.put("/public-interest/{letter_id}", response_model=SentLetterRead)
def update_sent_letter_public_interest(
    letter_id: str,
    letter_data: SentLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a sent letter (public interest)"""
    try:
        letter = get_sent_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_interest"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check edit permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_edit_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to edit this letter")
        
        # Update letter
        updated_letter = update_sent_letter(db, letter_id, letter_data, current_user.id)
        return updated_letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent letter (public interest): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update letter: {str(e)}"
        )

@router.delete("/public-interest/{letter_id}")
def delete_sent_letter_public_interest(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a sent letter (public interest)"""
    try:
        letter = get_sent_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_interest"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check delete permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_delete_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to delete this letter")
        
        # Delete letter
        delete_sent_letter(db, letter_id)
        return {"message": "Letter deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sent letter (public interest): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete letter: {str(e)}"
        )

# Sent Letters (Public Grievance) Endpoints
@router.get("/public-grievance", response_model=List[SentGrievanceLetterRead])
def get_sent_letters_public_grievance(
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[SentGrievanceLetterStatus] = Query(None, description="Filter by status"),
    priority: Optional[SentGrievanceLetterPriority] = Query(None, description="Filter by priority"),
    category: Optional[SentGrievanceLetterCategory] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get sent letters (public grievance) with role-based filtering"""
    try:
        # Base query
        base_query = select(SentGrievanceLetter)
        
        # Apply role-based filtering
        filtered_query = get_filtered_letter_query(current_user, base_query, "sent_public_grievance")
        
        # Apply additional filters
        if search:
            search_filter = or_(
                SentGrievanceLetter.recipient_name.contains(search),
                SentGrievanceLetter.subject.contains(search),
                SentGrievanceLetter.content.contains(search)
            )
            filtered_query = filtered_query.filter(search_filter)
        
        if status:
            filtered_query = filtered_query.filter(SentGrievanceLetter.status == status)
        
        if priority:
            filtered_query = filtered_query.filter(SentGrievanceLetter.priority == priority)
        
        if category:
            filtered_query = filtered_query.filter(SentGrievanceLetter.category == category)
        
        # Apply pagination
        offset = (page - 1) * per_page
        filtered_query = filtered_query.offset(offset).limit(per_page)
        
        # Execute query
        letters = db.exec(filtered_query).all()
        return letters
        
    except Exception as e:
        logger.error(f"Error fetching sent letters (public grievance): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.post("/public-grievance", response_model=SentGrievanceLetterRead, status_code=status.HTTP_201_CREATED)
def create_sent_letter_public_grievance(
    letter_data: SentGrievanceLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Create a new sent letter (public grievance)"""
    try:
        # Check if user can create letters
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_create_letters(role_name):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to create letters")
        
        # Create letter with user context
        letter = create_sent_grievance_letter(
            db, 
            letter_data, 
            current_user.id, 
            current_user.tenant_id
        )
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating sent letter (public grievance): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create letter: {str(e)}"
        )

@router.get("/public-grievance/{letter_id}", response_model=SentGrievanceLetterRead)
def get_sent_letter_public_grievance(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get a specific sent letter (public grievance)"""
    try:
        letter = get_sent_grievance_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_grievance"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sent letter (public grievance): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letter: {str(e)}"
        )

@router.put("/public-grievance/{letter_id}", response_model=SentGrievanceLetterRead)
def update_sent_letter_public_grievance(
    letter_id: str,
    letter_data: SentGrievanceLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Update a sent letter (public grievance)"""
    try:
        letter = get_sent_grievance_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_grievance"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check edit permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_edit_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to edit this letter")
        
        # Update letter
        updated_letter = update_sent_grievance_letter(db, letter_id, letter_data, current_user.id)
        return updated_letter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sent letter (public grievance): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update letter: {str(e)}"
        )

@router.delete("/public-grievance/{letter_id}")
def delete_sent_letter_public_grievance(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Delete a sent letter (public grievance)"""
    try:
        letter = get_sent_grievance_letter(db, letter_id)
        if not letter:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Letter not found")
        
        # Check access permissions
        if not check_letter_access(current_user, letter, "sent_public_grievance"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        # Check delete permissions
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_delete_letter(
            role_name, 
            letter.tenant_id, 
            current_user.tenant_id, 
            letter.assigned_to or letter.created_by, 
            current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions to delete this letter")
        
        # Delete letter
        delete_sent_grievance_letter(db, letter_id)
        return {"message": "Letter deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting sent letter (public grievance): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete letter: {str(e)}"
        )

# Letter Statistics Endpoint
@router.get("/statistics")
def get_letters_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Get letter statistics with role-based filtering"""
    try:
        # Get user role for permission checking
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        
        # Initialize statistics
        stats = {
            "total_received": 0,
            "total_sent_public_interest": 0,
            "total_sent_public_grievance": 0,
            "awaiting_response": 0,
            "response_received": 0,
            "overdue_followups": 0
        }
        
        # Super Admin can see all statistics
        if role_permissions.can_view_letters(role_name, None, None, None, None):
            # Count all letters
            stats["total_received"] = db.exec(select(func.count(ReceivedLetter.id))).first()
            stats["total_sent_public_interest"] = db.exec(select(func.count(SentLetter.id))).first()
            stats["total_sent_public_grievance"] = db.exec(select(func.count(SentGrievanceLetter.id))).first()
            
            # Count by status
            stats["awaiting_response"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.status == SentLetterStatus.AWAITING_RESPONSE)
            ).first()
            
            stats["response_received"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.status == SentLetterStatus.RESPONSE_RECEIVED)
            ).first()
            
            # Count overdue followups (simplified logic)
            today = datetime.utcnow()
            stats["overdue_followups"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        SentLetter.follow_up_date < today,
                        SentLetter.status == SentLetterStatus.AWAITING_RESPONSE
                    )
                )
            ).first()
        
        # Admin can see tenant statistics
        elif role_permissions.can_view_letters(role_name, None, current_user.tenant_id, None, None):
            # Count tenant letters
            stats["total_received"] = db.exec(
                select(func.count(ReceivedLetter.id)).where(ReceivedLetter.tenant_id == current_user.tenant_id)
            ).first()
            
            stats["total_sent_public_interest"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.tenant_id == current_user.tenant_id)
            ).first()
            
            stats["total_sent_public_grievance"] = db.exec(
                select(func.count(SentGrievanceLetter.id)).where(SentGrievanceLetter.tenant_id == current_user.tenant_id)
            ).first()
            
            # Count by status for tenant
            stats["awaiting_response"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        SentLetter.tenant_id == current_user.tenant_id,
                        SentLetter.status == SentLetterStatus.AWAITING_RESPONSE
                    )
                )
            ).first()
            
            stats["response_received"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        SentLetter.tenant_id == current_user.tenant_id,
                        SentLetter.status == SentLetterStatus.RESPONSE_RECEIVED
                    )
                )
            ).first()
            
            # Count overdue followups for tenant
            today = datetime.utcnow()
            stats["overdue_followups"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        SentLetter.tenant_id == current_user.tenant_id,
                        SentLetter.follow_up_date < today,
                        SentLetter.status == SentLetterStatus.AWAITING_RESPONSE
                    )
                )
            ).first()
        
        # Field Agent can only see their own statistics
        elif role_permissions.can_view_letters(role_name, None, None, None, current_user.id):
            # Count own letters
            stats["total_received"] = db.exec(
                select(func.count(ReceivedLetter.id)).where(
                    or_(
                        ReceivedLetter.assigned_to == current_user.id,
                        ReceivedLetter.created_by == current_user.id
                    )
                )
            ).first()
            
            stats["total_sent_public_interest"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    or_(
                        SentLetter.assigned_to == current_user.id,
                        SentLetter.created_by == current_user.id
                    )
                )
            ).first()
            
            stats["total_sent_public_grievance"] = db.exec(
                select(func.count(SentGrievanceLetter.id)).where(
                    or_(
                        SentGrievanceLetter.assigned_to == current_user.id,
                        SentGrievanceLetter.created_by == current_user.id
                    )
                )
            ).first()
            
            # Count own letters by status
            stats["awaiting_response"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        or_(
                            SentLetter.assigned_to == current_user.id,
                            SentLetter.created_by == current_user.id
                        ),
                        SentLetter.status == SentLetterStatus.AWAITING_RESPONSE
                    )
                )
            ).first()
            
            stats["response_received"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        or_(
                            SentLetter.assigned_to == current_user.id,
                            SentLetter.created_by == current_user.id
                        ),
                        SentLetter.status == SentLetterStatus.RESPONSE_RECEIVED
                    )
                )
            ).first()
            
            # Count own overdue followups
            today = datetime.utcnow()
            stats["overdue_followups"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    and_(
                        or_(
                            SentLetter.assigned_to == current_user.id,
                            SentLetter.created_by == current_user.id
                        ),
                        SentLetter.follow_up_date < today,
                        SentLetter.status == SentLetterStatus.AWAITING_RESPONSE
                    )
                )
            ).first()
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

