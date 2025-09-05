from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from database import get_session
from app.core.auth import get_current_user
from app.utils.role_permissions import role_permissions

from app.models.sent_letter import SentLetter, SentLetterStatus, SentLetterPriority, SentLetterCategory
from app.models.user import User

from app.schemas.sent_letter_schema import SentLetterRead

from app.crud.sent_letter_crud import get_sent_letter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sent-letters-legacy", tags=["Sent Letters Legacy"])

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
    
    # Admin can see letters from their tenant
    if role_permissions.can_view_letters(role_name, None, current_user.tenant_id, None, None):
        return base_query.filter(SentLetter.tenant_id == current_user.tenant_id)
    
    # Field Agent can only see letters assigned to them
    if role_permissions.can_view_letters(role_name, None, None, None, current_user.id):
        return base_query.filter(
            or_(
                SentLetter.assigned_to == current_user.id,
                SentLetter.created_by == current_user.id
            )
        )
    
    return base_query.filter(False)  # Return no results

@router.get("", response_model=List[SentLetterRead])
def get_sent_letters_legacy(
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[SentLetterStatus] = Query(None, description="Filter by status"),
    priority: Optional[SentLetterPriority] = Query(None, description="Filter by priority"),
    category: Optional[SentLetterCategory] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Legacy endpoint for sent letters"""
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
        logger.error(f"Error fetching sent letters (legacy): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch letters: {str(e)}"
        )

@router.get("/statistics")
def get_sent_letters_statistics_legacy(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """Legacy endpoint for sent letters statistics"""
    try:
        # Get user role for permission checking
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        
        # Initialize statistics
        stats = {
            "total_letters": 0,
            "awaiting_response": 0,
            "response_received": 0,
            "overdue_letters": 0
        }
        
        # Super Admin can see all statistics
        if role_permissions.can_view_letters(role_name, None, None, None, None):
            # Count all letters
            stats["total_letters"] = db.exec(select(func.count(SentLetter.id))).first()
            
            # Count by status
            stats["awaiting_response"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.status == SentLetterStatus.AWAITING_RESPONSE)
            ).first()
            
            stats["response_received"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.status == SentLetterStatus.RESPONSE_RECEIVED)
            ).first()
            
            # Count overdue followups
            today = datetime.utcnow()
            stats["overdue_letters"] = db.exec(
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
            stats["total_letters"] = db.exec(
                select(func.count(SentLetter.id)).where(SentLetter.tenant_id == current_user.tenant_id)
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
            stats["overdue_letters"] = db.exec(
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
            stats["total_letters"] = db.exec(
                select(func.count(SentLetter.id)).where(
                    or_(
                        SentLetter.assigned_to == current_user.id,
                        SentLetter.created_by == current_user.id
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
            stats["overdue_letters"] = db.exec(
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
        logger.error(f"Error fetching sent letters statistics (legacy): {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get("/categories")
def get_sent_letters_categories():
    """Get available categories for sent letters"""
    return [{"value": cat.value, "label": cat.value} for cat in SentLetterCategory]

@router.get("/priorities")
def get_sent_letters_priorities():
    """Get available priorities for sent letters"""
    return [{"value": pri.value, "label": pri.value} for pri in SentLetterPriority]

@router.get("/statuses")
def get_sent_letters_statuses():
    """Get available statuses for sent letters"""
    return [{"value": stat.value, "label": stat.value} for stat in SentLetterStatus]
