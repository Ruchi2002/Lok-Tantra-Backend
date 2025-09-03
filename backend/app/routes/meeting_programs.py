from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import json
from database import get_session
from app.core.auth import get_current_user

from app.schemas.meeting_program_schema import (
    MeetingProgramCreate, MeetingProgramRead, MeetingProgramUpdate,
    MeetingProgramKPIs, MeetingProgramStats
)
from app.crud.meeting_program_crud import (
    create_meeting_program, get_meeting_program, get_all_meeting_programs,
    update_meeting_program, delete_meeting_program, get_upcoming_meetings_today,
    get_upcoming_meetings_week, get_meeting_program_kpis, get_meeting_program_stats,
    send_meeting_reminders
)
from app.models.meeting_program import MeetingProgram
from app.models.user import User

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/meeting-programs", tags=["Meeting Programs"])

def check_meeting_access(user: User, meeting: MeetingProgram) -> bool:
    """Check if user has access to a specific meeting - simplified access"""
    # For now, allow all authenticated users to access all meetings
    return True

def get_filtered_meeting_query(current_user: User, base_query=None):
    """Get query without role-based filtering - simplified access"""
    if base_query is None:
        base_query = select(MeetingProgram)
    
    # For now, return all meetings without filtering
    return base_query

@router.post("/", response_model=MeetingProgramRead, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingProgramCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new meeting program"""
    try:
        logger.info(f"Creating meeting program: {meeting_data.title}")
        
        # Set tenant_id from current user if not provided
        if not meeting_data.tenant_id and hasattr(current_user, 'tenant_id'):
            meeting_data.tenant_id = current_user.tenant_id
        
        # Set created_by from current user
        meeting_data.created_by = current_user.id
        
        # Create the meeting
        meeting = create_meeting_program(db, meeting_data, current_user.id)
        
        # Convert to response format
        response_data = MeetingProgramRead.from_orm(meeting)
        
        # Add frontend-compatible fields
        response_data.date = meeting.scheduled_date.strftime("%Y-%m-%d")
        if meeting.start_time and meeting.end_time:
            response_data.time = f"{meeting.start_time} - {meeting.end_time}"
        
        # Get creator name
        if meeting.creator:
            response_data.creator_name = meeting.creator.name
        
        # Get participant names
        if meeting.participants:
            try:
                participant_ids = json.loads(meeting.participants)
                participant_names = []
                for participant_id in participant_ids:
                    user = db.get(User, participant_id)
                    if user:
                        participant_names.append(user.name)
                response_data.participant_names = participant_names
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Error parsing participants for meeting {meeting.id}: {e}")
                response_data.participant_names = []
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error in create_meeting endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create meeting program"
        )

@router.get("/{meeting_id}", response_model=MeetingProgramRead)
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get a specific meeting program by ID"""
    try:
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting program not found"
            )
        
        # Check access permissions
        if not check_meeting_access(current_user, meeting):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Convert to response format
        response_data = MeetingProgramRead.from_orm(meeting)
        
        # Add frontend-compatible fields
        response_data.date = meeting.scheduled_date.strftime("%Y-%m-%d")
        if meeting.start_time and meeting.end_time:
            response_data.time = f"{meeting.start_time} - {meeting.end_time}"
        
        # Get creator name
        if meeting.creator:
            response_data.creator_name = meeting.creator.name
        
        # Get participant names
        if meeting.participants:
            try:
                participant_ids = json.loads(meeting.participants)
                participant_names = []
                for participant_id in participant_ids:
                    user = db.get(User, participant_id)
                    if user:
                        participant_names.append(user.name)
                response_data.participant_names = participant_names
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Error parsing participants for meeting {meeting.id}: {e}")
                response_data.participant_names = []
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_meeting endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting program"
        )

@router.get("/", response_model=List[MeetingProgramRead])
async def get_meetings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    meeting_type: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get all meeting programs with optional filters"""
    try:
        # Simplified access - get all meetings without role-based filtering
        meetings = get_all_meeting_programs(
            db=db,
            skip=skip,
            limit=limit,
            status_filter=status,
            meeting_type_filter=meeting_type,
            date_from=date_from,
            date_to=date_to,
            tenant_id=None  # No tenant filtering
        )
        
        # Convert to response format
        response_data = []
        for meeting in meetings:
            meeting_response = MeetingProgramRead.from_orm(meeting)
            
            # Add frontend-compatible fields
            meeting_response.date = meeting.scheduled_date.strftime("%Y-%m-%d")
            if meeting.start_time and meeting.end_time:
                meeting_response.time = f"{meeting.start_time} - {meeting.end_time}"
            
            # Get creator name
            if meeting.creator:
                meeting_response.creator_name = meeting.creator.name
            
            # Get participant names
            if meeting.participants:
                try:
                    participant_ids = json.loads(meeting.participants)
                    participant_names = []
                    for participant_id in participant_ids:
                        user = db.get(User, participant_id)
                        if user:
                            participant_names.append(user.name)
                    meeting_response.participant_names = participant_names
                except (json.JSONDecodeError, Exception) as e:
                    logger.warning(f"Error parsing participants for meeting {meeting.id}: {e}")
                    meeting_response.participant_names = []
            
            response_data.append(meeting_response)
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error in get_meetings endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting programs"
        )

@router.put("/{meeting_id}", response_model=MeetingProgramRead)
async def update_meeting(
    meeting_id: str,
    meeting_data: MeetingProgramUpdate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a meeting program"""
    try:
        # Check if meeting exists and user has access
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting program not found"
            )
        
        if not check_meeting_access(current_user, meeting):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Update the meeting
        updated_meeting = update_meeting_program(db, meeting_id, meeting_data)
        
        # Convert to response format
        response_data = MeetingProgramRead.from_orm(updated_meeting)
        
        # Add frontend-compatible fields
        response_data.date = updated_meeting.scheduled_date.strftime("%Y-%m-%d")
        if updated_meeting.start_time and updated_meeting.end_time:
            response_data.time = f"{updated_meeting.start_time} - {updated_meeting.end_time}"
        
        # Get creator name
        if updated_meeting.creator:
            response_data.creator_name = updated_meeting.creator.name
        
        # Get participant names
        if updated_meeting.participants:
            try:
                participant_ids = json.loads(updated_meeting.participants)
                participant_names = []
                for participant_id in participant_ids:
                    user = db.get(User, participant_id)
                    if user:
                        participant_names.append(user.name)
                response_data.participant_names = participant_names
            except (json.JSONDecodeError, Exception) as e:
                logger.warning(f"Error parsing participants for meeting {updated_meeting.id}: {e}")
                response_data.participant_names = []
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_meeting endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update meeting program"
        )

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a meeting program"""
    try:
        # Check if meeting exists and user has access
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting program not found"
            )
        
        if not check_meeting_access(current_user, meeting):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Delete the meeting
        delete_meeting_program(db, meeting_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_meeting endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete meeting program"
        )

@router.get("/upcoming/today", response_model=List[MeetingProgramRead])
async def get_today_meetings(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming meetings for today"""
    try:
        # Simplified access - get all today's meetings without tenant filtering
        meetings = get_upcoming_meetings_today(db, None)
        
        # Convert to response format
        response_data = []
        for meeting in meetings:
            meeting_response = MeetingProgramRead.from_orm(meeting)
            
            # Add frontend-compatible fields
            meeting_response.date = meeting.scheduled_date.strftime("%Y-%m-%d")
            if meeting.start_time and meeting.end_time:
                meeting_response.time = f"{meeting.start_time} - {meeting.end_time}"
            
            # Get creator name
            if meeting.creator:
                meeting_response.creator_name = meeting.creator.name
            
            response_data.append(meeting_response)
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error in get_today_meetings endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get today's meetings"
        )

@router.get("/upcoming/week", response_model=List[MeetingProgramRead])
async def get_week_meetings(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming meetings for this week"""
    try:
        # Simplified access - get all week's meetings without tenant filtering
        meetings = get_upcoming_meetings_week(db, None)
        
        # Convert to response format
        response_data = []
        for meeting in meetings:
            meeting_response = MeetingProgramRead.from_orm(meeting)
            
            # Add frontend-compatible fields
            meeting_response.date = meeting.scheduled_date.strftime("%Y-%m-%d")
            if meeting.start_time and meeting.end_time:
                meeting_response.time = f"{meeting.start_time} - {meeting.end_time}"
            
            # Get creator name
            if meeting.creator:
                meeting_response.creator_name = meeting.creator.name
            
            response_data.append(meeting_response)
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error in get_week_meetings endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get week's meetings"
        )

@router.get("/dashboard/kpis", response_model=MeetingProgramKPIs)
async def get_meeting_kpis(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get KPIs for meeting programs dashboard"""
    try:
        # Simplified access - get KPIs for all meetings without tenant filtering
        kpis = get_meeting_program_kpis(db, None)
        return kpis
        
    except Exception as e:
        logger.error(f"Error in get_meeting_kpis endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting program KPIs"
        )

@router.get("/dashboard/stats", response_model=MeetingProgramStats)
async def get_meeting_stats(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get detailed statistics for meeting programs"""
    try:
        # Simplified access - get stats for all meetings without tenant filtering
        stats = get_meeting_program_stats(db, None)
        return stats
        
    except Exception as e:
        logger.error(f"Error in get_meeting_stats endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting program statistics"
        )

@router.post("/reminders/send", status_code=status.HTTP_200_OK)
async def send_reminders(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Send reminders for upcoming meetings"""
    try:
        # Simplified access - any authenticated user can send reminders
        tenant_id = getattr(current_user, 'tenant_id', None)
        meetings_with_reminders = send_meeting_reminders(db, tenant_id)
        
        return {
            "message": f"Reminders sent for {len(meetings_with_reminders)} meetings",
            "meetings_count": len(meetings_with_reminders)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_reminders endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reminders"
        )

@router.post("/{meeting_id}/upload-minutes", response_model=MeetingProgramRead)
async def upload_meeting_minutes(
    meeting_id: str,
    minutes: str = Query(..., description="Meeting minutes content"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Upload minutes for a completed meeting"""
    try:
        # Check if meeting exists and user has access
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting program not found"
            )
        
        if not check_meeting_access(current_user, meeting):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Check if meeting is completed
        if meeting.status != "Done":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minutes can only be uploaded for completed meetings"
            )
        
        # Update meeting with minutes
        update_data = MeetingProgramUpdate(minutes=minutes)
        updated_meeting = update_meeting_program(db, meeting_id, update_data)
        
        # Convert to response format
        response_data = MeetingProgramRead.from_orm(updated_meeting)
        
        # Add frontend-compatible fields
        response_data.date = updated_meeting.scheduled_date.strftime("%Y-%m-%d")
        if updated_meeting.start_time and updated_meeting.end_time:
            response_data.time = f"{updated_meeting.start_time} - {updated_meeting.end_time}"
        
        # Get creator name
        if updated_meeting.creator:
            response_data.creator_name = updated_meeting.creator.name
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upload_meeting_minutes endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload meeting minutes"
        )
