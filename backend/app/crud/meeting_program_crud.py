from sqlmodel import Session, select, and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import logging
import json
from fastapi import HTTPException, status

from app.models.meeting_program import MeetingProgram
from app.models.user import User
from app.schemas.meeting_program_schema import MeetingProgramCreate, MeetingProgramUpdate, MeetingProgramKPIs, MeetingProgramStats

# Setup logging
logger = logging.getLogger(__name__)

# Valid meeting types and statuses
VALID_MEETING_TYPES = ["Government", "NGO", "Public"]
VALID_STATUSES = ["Upcoming", "Done", "Cancelled"]

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

def validate_meeting_type(meeting_type: str) -> str:
    """Validate and normalize meeting type"""
    if not meeting_type:
        return "Government"
    
    meeting_type = meeting_type.strip()
    if meeting_type not in VALID_MEETING_TYPES:
        raise ValidationError(f"Meeting type '{meeting_type}' is not valid. Allowed values: {', '.join(VALID_MEETING_TYPES)}")
    
    return meeting_type

def validate_status(status: str) -> str:
    """Validate and normalize status"""
    if not status:
        return "Upcoming"
    
    status = status.strip()
    if status not in VALID_STATUSES:
        raise ValidationError(f"Status '{status}' is not valid. Allowed values: {', '.join(VALID_STATUSES)}")
    
    return status

def get_user_by_id_or_name(db: Session, identifier: Optional[str]) -> Optional[User]:
    """Get user by ID or name with proper error handling"""
    if not identifier:
        return None
    
    try:
        # Try to parse as UUID first
        import uuid
        try:
            user_id = str(uuid.UUID(identifier))
            user = db.get(User, user_id)
            if user:
                return user
        except ValueError:
            pass  # Not a valid UUID, try name
        
        # Try to find by name
        user = db.exec(select(User).where(User.name == identifier)).first()
        return user
        
    except Exception as e:
        logger.error(f"Error finding user with identifier '{identifier}': {e}")
        return None

def create_meeting_program(db: Session, meeting_data: MeetingProgramCreate, current_user_id: str) -> MeetingProgram:
    """Create a new meeting program"""
    try:
        # Validate meeting type and status
        meeting_type = validate_meeting_type(meeting_data.meeting_type)
        status = validate_status(meeting_data.status)
        
        # Convert participants list to JSON string if provided
        participants_json = None
        if meeting_data.participants:
            participants_json = json.dumps(meeting_data.participants)
        
        # Create meeting program
        db_meeting = MeetingProgram(
            title=meeting_data.title,
            description=meeting_data.description,
            agenda=meeting_data.agenda,
            venue=meeting_data.venue,
            scheduled_date=meeting_data.scheduled_date,
            start_time=meeting_data.start_time,
            end_time=meeting_data.end_time,
            meeting_type=meeting_type,
            status=status,
            participants=participants_json,
            expected_attendance=meeting_data.expected_attendance,
            actual_attendance=meeting_data.actual_attendance,
            reminder_date=meeting_data.reminder_date,
            minutes=meeting_data.minutes,
            created_by=current_user_id,
            tenant_id=meeting_data.tenant_id
        )
        
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)
        
        logger.info(f"Created meeting program: {db_meeting.id} - {db_meeting.title}")
        return db_meeting
        
    except ValidationError as e:
        logger.error(f"Validation error creating meeting program: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating meeting program: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create meeting program")

def get_meeting_program(db: Session, meeting_id: str) -> Optional[MeetingProgram]:
    """Get a meeting program by ID"""
    try:
        meeting = db.get(MeetingProgram, meeting_id)
        if not meeting:
            logger.warning(f"Meeting program not found: {meeting_id}")
            return None
        return meeting
    except Exception as e:
        logger.error(f"Error getting meeting program {meeting_id}: {e}")
        return None

def get_all_meeting_programs(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    status_filter: Optional[str] = None,
    meeting_type_filter: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    tenant_id: Optional[str] = None
) -> List[MeetingProgram]:
    """Get all meeting programs with optional filters"""
    try:
        query = select(MeetingProgram)
        
        # Apply filters
        filters = []
        
        if status_filter:
            status_filter = validate_status(status_filter)
            filters.append(MeetingProgram.status == status_filter)
        
        if meeting_type_filter:
            meeting_type_filter = validate_meeting_type(meeting_type_filter)
            filters.append(MeetingProgram.meeting_type == meeting_type_filter)
        
        if date_from:
            filters.append(MeetingProgram.scheduled_date >= date_from)
        
        if date_to:
            filters.append(MeetingProgram.scheduled_date <= date_to)
        
        if tenant_id:
            filters.append(MeetingProgram.tenant_id == tenant_id)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Order by scheduled date
        query = query.order_by(MeetingProgram.scheduled_date.desc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        meetings = db.exec(query).all()
        return meetings
        
    except ValidationError as e:
        logger.error(f"Validation error in get_all_meeting_programs: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting meeting programs: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get meeting programs")

def update_meeting_program(db: Session, meeting_id: str, meeting_data: MeetingProgramUpdate) -> Optional[MeetingProgram]:
    """Update a meeting program"""
    try:
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting program not found")
        
        # Update fields
        update_data = meeting_data.dict(exclude_unset=True)
        
        # Validate meeting type and status if provided
        if 'meeting_type' in update_data:
            update_data['meeting_type'] = validate_meeting_type(update_data['meeting_type'])
        
        if 'status' in update_data:
            update_data['status'] = validate_status(update_data['status'])
        
        # Handle participants list
        if 'participants' in update_data:
            update_data['participants'] = json.dumps(update_data['participants']) if update_data['participants'] else None
        
        # Handle minutes upload
        if 'minutes' in update_data and update_data['minutes']:
            update_data['minutes_uploaded_at'] = datetime.utcnow()
        
        # Update the meeting
        for field, value in update_data.items():
            setattr(meeting, field, value)
        
        meeting.updated_at = datetime.utcnow()
        
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
        
        logger.info(f"Updated meeting program: {meeting.id} - {meeting.title}")
        return meeting
        
    except ValidationError as e:
        logger.error(f"Validation error updating meeting program: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating meeting program {meeting_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update meeting program")

def delete_meeting_program(db: Session, meeting_id: str) -> bool:
    """Delete a meeting program"""
    try:
        meeting = get_meeting_program(db, meeting_id)
        if not meeting:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting program not found")
        
        db.delete(meeting)
        db.commit()
        
        logger.info(f"Deleted meeting program: {meeting_id}")
        return True
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting meeting program {meeting_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete meeting program")

def get_upcoming_meetings_today(db: Session, tenant_id: Optional[str] = None) -> List[MeetingProgram]:
    """Get upcoming meetings for today"""
    try:
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)
        
        query = select(MeetingProgram).where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < tomorrow,
                MeetingProgram.status == "Upcoming"
            )
        )
        
        if tenant_id:
            query = query.where(MeetingProgram.tenant_id == tenant_id)
        
        query = query.order_by(MeetingProgram.scheduled_date.asc())
        
        return db.exec(query).all()
        
    except Exception as e:
        logger.error(f"Error getting upcoming meetings for today: {e}")
        return []

def get_upcoming_meetings_week(db: Session, tenant_id: Optional[str] = None) -> List[MeetingProgram]:
    """Get upcoming meetings for this week"""
    try:
        today = datetime.now().date()
        week_end = today + timedelta(days=7)
        
        query = select(MeetingProgram).where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < week_end,
                MeetingProgram.status == "Upcoming"
            )
        )
        
        if tenant_id:
            query = query.where(MeetingProgram.tenant_id == tenant_id)
        
        query = query.order_by(MeetingProgram.scheduled_date.asc())
        
        return db.exec(query).all()
        
    except Exception as e:
        logger.error(f"Error getting upcoming meetings for this week: {e}")
        return []

def get_meeting_program_kpis(db: Session, tenant_id: Optional[str] = None) -> MeetingProgramKPIs:
    """Get KPIs for meeting programs dashboard"""
    try:
        today = datetime.now().date()
        week_end = today + timedelta(days=7)
        
        # Base query with tenant filter
        base_query = select(MeetingProgram)
        if tenant_id:
            base_query = base_query.where(MeetingProgram.tenant_id == tenant_id)
        
        # Total upcoming today
        upcoming_today_query = base_query.where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < today + timedelta(days=1),
                MeetingProgram.status == "Upcoming"
            )
        )
        total_upcoming_today = len(db.exec(upcoming_today_query).all())
        
        # Total upcoming this week
        upcoming_week_query = base_query.where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < week_end,
                MeetingProgram.status == "Upcoming"
            )
        )
        total_upcoming_week = len(db.exec(upcoming_week_query).all())
        
        # Completed and cancelled counts
        completed_query = base_query.where(MeetingProgram.status == "Done")
        completed_count = len(db.exec(completed_query).all())
        
        cancelled_query = base_query.where(MeetingProgram.status == "Cancelled")
        cancelled_count = len(db.exec(cancelled_query).all())
        
        # Calculate completed vs cancelled ratio
        total_processed = completed_count + cancelled_count
        completed_cancelled_ratio = completed_count / total_processed if total_processed > 0 else 0.0
        
        # Average attendance
        attendance_query = base_query.where(
            and_(
                MeetingProgram.actual_attendance.is_not(None),
                MeetingProgram.actual_attendance > 0
            )
        )
        meetings_with_attendance = db.exec(attendance_query).all()
        average_attendance = None
        if meetings_with_attendance:
            total_attendance = sum(m.actual_attendance for m in meetings_with_attendance)
            average_attendance = total_attendance / len(meetings_with_attendance)
        
        # Meetings by type
        meetings_by_type = {}
        for meeting_type in VALID_MEETING_TYPES:
            type_query = base_query.where(MeetingProgram.meeting_type == meeting_type)
            meetings_by_type[meeting_type] = len(db.exec(type_query).all())
        
        # Monthly meetings (last 12 months)
        monthly_meetings = {}
        for i in range(12):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = month_start.replace(day=1) + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            month_key = month_start.strftime("%Y-%m")
            month_query = base_query.where(
                and_(
                    MeetingProgram.scheduled_date >= month_start,
                    MeetingProgram.scheduled_date <= month_end
                )
            )
            monthly_meetings[month_key] = len(db.exec(month_query).all())
        
        return MeetingProgramKPIs(
            total_upcoming_today=total_upcoming_today,
            total_upcoming_week=total_upcoming_week,
            completed_count=completed_count,
            cancelled_count=cancelled_count,
            completed_cancelled_ratio=completed_cancelled_ratio,
            average_attendance=average_attendance,
            meetings_by_type=meetings_by_type,
            monthly_meetings=monthly_meetings
        )
        
    except Exception as e:
        logger.error(f"Error getting meeting program KPIs: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get meeting program KPIs")

def get_meeting_program_stats(db: Session, tenant_id: Optional[str] = None) -> MeetingProgramStats:
    """Get detailed statistics for meeting programs"""
    try:
        # Base query with tenant filter
        base_query = select(MeetingProgram)
        if tenant_id:
            base_query = base_query.where(MeetingProgram.tenant_id == tenant_id)
        
        # Total meetings
        total_meetings = len(db.exec(base_query).all())
        
        # Status counts
        upcoming_query = base_query.where(MeetingProgram.status == "Upcoming")
        upcoming_meetings = len(db.exec(upcoming_query).all())
        
        completed_query = base_query.where(MeetingProgram.status == "Done")
        completed_meetings = len(db.exec(completed_query).all())
        
        cancelled_query = base_query.where(MeetingProgram.status == "Cancelled")
        cancelled_meetings = len(db.exec(cancelled_query).all())
        
        # Average attendance rate
        attendance_rate_query = base_query.where(
            and_(
                MeetingProgram.actual_attendance.is_not(None),
                MeetingProgram.expected_attendance.is_not(None),
                MeetingProgram.expected_attendance > 0
            )
        )
        meetings_with_attendance_data = db.exec(attendance_rate_query).all()
        average_attendance_rate = None
        if meetings_with_attendance_data:
            total_rate = 0
            for meeting in meetings_with_attendance_data:
                rate = meeting.actual_attendance / meeting.expected_attendance
                total_rate += rate
            average_attendance_rate = total_rate / len(meetings_with_attendance_data)
        
        # Most common venue
        venue_query = base_query.where(MeetingProgram.venue.is_not(None))
        venues = [m.venue for m in db.exec(venue_query).all() if m.venue]
        most_common_venue = max(set(venues), key=venues.count) if venues else None
        
        # Most common type
        type_query = base_query.where(MeetingProgram.meeting_type.is_not(None))
        types = [m.meeting_type for m in db.exec(type_query).all()]
        most_common_type = max(set(types), key=types.count) if types else None
        
        return MeetingProgramStats(
            total_meetings=total_meetings,
            upcoming_meetings=upcoming_meetings,
            completed_meetings=completed_meetings,
            cancelled_meetings=cancelled_meetings,
            average_attendance_rate=average_attendance_rate,
            most_common_venue=most_common_venue,
            most_common_type=most_common_type
        )
        
    except Exception as e:
        logger.error(f"Error getting meeting program stats: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get meeting program stats")

def send_meeting_reminders(db: Session, tenant_id: Optional[str] = None) -> List[MeetingProgram]:
    """Send reminders for upcoming meetings"""
    try:
        # Get meetings that need reminders (scheduled within 24 hours and reminder not sent)
        tomorrow = datetime.now() + timedelta(days=1)
        
        query = select(MeetingProgram).where(
            and_(
                MeetingProgram.scheduled_date <= tomorrow,
                MeetingProgram.status == "Upcoming",
                MeetingProgram.reminder_sent == False
            )
        )
        
        if tenant_id:
            query = query.where(MeetingProgram.tenant_id == tenant_id)
        
        meetings_needing_reminders = db.exec(query).all()
        
        # Mark reminders as sent
        for meeting in meetings_needing_reminders:
            meeting.reminder_sent = True
            meeting.reminder_date = datetime.utcnow()
            db.add(meeting)
        
        db.commit()
        
        logger.info(f"Sent reminders for {len(meetings_needing_reminders)} meetings")
        return meetings_needing_reminders
        
    except Exception as e:
        logger.error(f"Error sending meeting reminders: {e}")
        db.rollback()
        return []
