from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
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
    db: Session = Depends(get_session)
):
    """Create a new sent grievance letter"""
    try:
        # Use a default user ID of 1 for created_by and updated_by
        letter = create_sent_grievance_letter(db, letter_data, 1, None)
        return letter
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
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user ID"),
    date_from: Optional[datetime] = Query(None, description="Filter by sent date from"),
    date_to: Optional[datetime] = Query(None, description="Filter by sent date to"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_session)
):
    """Get filtered sent grievance letters with pagination"""
    try:
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

@router.get("/all", response_model=List[SentGrievanceLetterRead])
def get_all_letters(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_session)
):
    """Get all sent grievance letters"""
    try:
        letters = get_all_sent_grievance_letters(db, skip, limit, None)
        return letters
    except Exception as e:
        logger.error(f"Error fetching all sent grievance letters: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sent grievance letters: {str(e)}"
        )

@router.get("/{letter_id}", response_model=SentGrievanceLetterRead)
def get_letter(
    letter_id: int,
    db: Session = Depends(get_session)
):
    """Get a specific sent grievance letter by ID"""
    try:
        letter = get_sent_grievance_letter(db, letter_id, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sent grievance letter not found"
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
