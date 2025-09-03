from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
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

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sent-letters", tags=["Sent Letters - Public Interest"])

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
    db: Session = Depends(get_session)
):
    """Create a new sent letter for public interest"""
    try:
        # Use a default user ID of 1 for created_by and updated_by
        letter = create_sent_letter(db, letter_data, 1, None)
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
    db: Session = Depends(get_session)
):
    """Get filtered sent letters with pagination"""
    try:
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
        
        result = get_filtered_sent_letters(db, filters, None)
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

@router.get("/{letter_id}", response_model=SentLetterRead)
def get_letter(
    letter_id: int,
    db: Session = Depends(get_session)
):
    """Get a specific sent letter by ID"""
    try:
        letter = get_sent_letter(db, letter_id, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
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
    db: Session = Depends(get_session)
):
    """Update a sent letter"""
    try:
        # Use a default user ID of 1 for updated_by
        letter = update_sent_letter(db, letter_id, letter_data, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent letter not found"
            )
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
    db: Session = Depends(get_session)
):
    """Delete a sent letter"""
    try:
        success = delete_sent_letter(db, letter_id, None)
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

@router.get("/statistics/overview", response_model=SentLetterStatistics)
def get_statistics(
    db: Session = Depends(get_session)
):
    """Get sent letter statistics for dashboard KPIs"""
    try:
        stats = get_sent_letter_statistics(db, None)
        return stats
    except Exception as e:
        logger.error(f"Error fetching sent letter statistics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
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
def get_overdue_followups_route(
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

@router.get("/followups-due-this-week/all", response_model=List[SentLetterRead])
def get_followups_due_this_week_route(
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

@router.post("/{letter_id}/assign", response_model=SentLetterRead)
def assign_letter(
    letter_id: int,
    assigned_user_id: int,
    db: Session = Depends(get_session)
):
    """Assign a sent letter to a specific user"""
    try:
        # Use a default user ID of 1 for the user performing the assignment
        letter = assign_sent_letter_to_user(db, letter_id, 1, assigned_user_id, None)
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
        # Use a default user ID of 1 for the user updating the status
        letter = update_sent_letter_status(db, letter_id, status, 1, None)
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
        # Use a default user ID of 1 for the user recording the response
        letter = record_response_received(db, letter_id, response_content, 1, None)
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

@router.get("/categories/list", response_model=List[str])
def get_categories():
    """Get list of available sent letter categories"""
    return [category.value for category in SentLetterCategory]

@router.get("/priorities/list", response_model=List[str])
def get_priorities():
    """Get list of available sent letter priorities"""
    return [priority.value for priority in SentLetterPriority]

@router.get("/statuses/list", response_model=List[str])
def get_statuses():
    """Get list of available sent letter statuses"""
    return [status.value for status in SentLetterStatus]
