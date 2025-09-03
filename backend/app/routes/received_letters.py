from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime
import logging

from database import get_session
from app.models.received_letter import LetterStatus, LetterPriority, LetterCategory
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

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/received-letters", tags=["Received Letters"])

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
    db: Session = Depends(get_session)
):
    """Create a new received letter"""
    try:
        # Use a default user ID of 1 for created_by and updated_by
        letter = create_received_letter(db, letter_data, 1, None)
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
    db: Session = Depends(get_session)
):
    """Get filtered received letters with pagination"""
    try:
        filters = LetterFilters(
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
        
        result = get_filtered_received_letters(db, filters, None)
        return ReceivedLetterList(**result)
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
    db: Session = Depends(get_session)
):
    """Get a specific received letter by ID"""
    try:
        letter = get_received_letter(db, letter_id, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
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
    db: Session = Depends(get_session)
):
    """Update a received letter"""
    try:
        # Use a default user ID of 1 for updated_by
        letter = update_received_letter(db, letter_id, letter_data, 1, None)
        if not letter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Letter not found"
            )
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
    db: Session = Depends(get_session)
):
    """Delete a received letter"""
    try:
        success = delete_received_letter(db, letter_id, None)
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
    db: Session = Depends(get_session)
):
    """Get letter statistics"""
    try:
        stats = get_letter_statistics(db, None)
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
    assigned_user_id: int,
    db: Session = Depends(get_session)
):
    """Assign a letter to a specific user"""
    try:
        # Use a default user ID of 1 for the user performing the assignment
        letter = assign_letter_to_user(db, letter_id, 1, assigned_user_id, None)
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
        # Use a default user ID of 1 for the user updating the status
        letter = update_letter_status(db, letter_id, status, 1, None)
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

