from sqlmodel import Session, select, and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import logging
import json
from fastapi import HTTPException, status

from app.models.meeting_program import MeetingProgram
from app.models.user import User
from app.models.role import Role
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
        
        # Handle user_id field - convert empty string to None
        user_id = meeting_data.user_id if meeting_data.user_id != '' else None
        
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
            tenant_id=meeting_data.tenant_id,
            user_id=user_id
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
        
        # Handle user_id field - convert empty string to None
        if 'user_id' in update_data and update_data['user_id'] == '':
            update_data['user_id'] = None
        
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

def get_meeting_program_kpis(db: Session, tenant_id: Optional[str] = None, current_user: Optional[User] = None) -> MeetingProgramKPIs:
    """Get KPIs for meeting programs dashboard with role-based filtering"""
    try:
        today = datetime.now().date()
        
        # Base query with role-based filtering
        base_query = select(MeetingProgram)
        
        # Apply role-based filtering
        if current_user:
            user_role = getattr(current_user, 'role', None)
            role_name = user_role.name if hasattr(user_role, 'name') else str(user_role) if user_role else None
            
            if role_name == "SuperAdmin":
                # Super Admin can see all meetings
                pass
            elif role_name == "Admin":
                # Admin can see meetings they created and meetings assigned to Field Agents in their tenant
                base_query = base_query.where(
                    and_(
                        MeetingProgram.tenant_id == current_user.tenant_id,
                        or_(
                            MeetingProgram.created_by == current_user.id,  # Meetings created by admin
                            MeetingProgram.user_id.in_(  # Meetings assigned to Field Agents in their tenant
                                select(User.id).where(
                                    and_(
                                        User.tenant_id == current_user.tenant_id,
                                        User.role_id.in_(
                                            select(Role.id).where(Role.name == "FieldAgent")
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            elif role_name == "FieldAgent":
                # Field Agent can only see meetings assigned to them
                base_query = base_query.where(MeetingProgram.user_id == current_user.id)
            else:
                # Other roles - no access
                base_query = base_query.where(MeetingProgram.id == None)
        elif tenant_id:
            # Fallback to tenant-based filtering if no user context
            base_query = base_query.where(MeetingProgram.tenant_id == tenant_id)
        
        # Total meetings
        total_meetings = len(db.exec(base_query).all())
        
        # Upcoming today
        upcoming_today_query = base_query.where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < today + timedelta(days=1),
                MeetingProgram.status == "Upcoming"
            )
        )
        upcoming_today = len(db.exec(upcoming_today_query).all())
        
        # Completion rate
        completed_query = base_query.where(MeetingProgram.status == "Done")
        completed_count = len(db.exec(completed_query).all())
        completion_rate = (completed_count / total_meetings * 100) if total_meetings > 0 else 0.0
        
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
        
        # Role-based KPIs
        meetings_created_by_me = 0
        meetings_assigned_to_me = 0
        meetings_assigned_to_field_agents = 0
        
        if current_user:
            # Meetings created by current user
            created_by_me_query = select(MeetingProgram).where(MeetingProgram.created_by == current_user.id)
            if current_user.tenant_id:
                created_by_me_query = created_by_me_query.where(MeetingProgram.tenant_id == current_user.tenant_id)
            meetings_created_by_me = len(db.exec(created_by_me_query).all())
            
            # Meetings assigned to current user
            assigned_to_me_query = select(MeetingProgram).where(MeetingProgram.user_id == current_user.id)
            if current_user.tenant_id:
                assigned_to_me_query = assigned_to_me_query.where(MeetingProgram.tenant_id == current_user.tenant_id)
            meetings_assigned_to_me = len(db.exec(assigned_to_me_query).all())
            
            # Meetings assigned to Field Agents in admin's tenant
            if role_name == "Admin" and current_user.tenant_id:
                field_agent_meetings_query = select(MeetingProgram).where(
                    and_(
                        MeetingProgram.tenant_id == current_user.tenant_id,
                        MeetingProgram.user_id.in_(
                            select(User.id).where(
                                and_(
                                    User.tenant_id == current_user.tenant_id,
                                    User.role_id.in_(
                                        select(Role.id).where(Role.name == "FieldAgent")
                                    )
                                )
                            )
                        )
                    )
                )
                meetings_assigned_to_field_agents = len(db.exec(field_agent_meetings_query).all())
        
        return MeetingProgramKPIs(
            total_meetings=total_meetings,
            upcoming_today=upcoming_today,
            completion_rate=completion_rate,
            average_attendance=average_attendance,
            meetings_by_type=meetings_by_type,
            monthly_meetings=monthly_meetings,
            meetings_created_by_me=meetings_created_by_me,
            meetings_assigned_to_me=meetings_assigned_to_me,
            meetings_assigned_to_field_agents=meetings_assigned_to_field_agents
        )
        
    except Exception as e:
        logger.error(f"Error getting meeting program KPIs: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get meeting program KPIs")

def get_meeting_program_stats(db: Session, tenant_id: Optional[str] = None, current_user: Optional[User] = None) -> MeetingProgramStats:
    """Get detailed statistics for meeting programs with role-based filtering"""
    try:
        today = datetime.now().date()
        
        # Base query with role-based filtering
        base_query = select(MeetingProgram)
        
        # Apply role-based filtering
        if current_user:
            user_role = getattr(current_user, 'role', None)
            role_name = user_role.name if hasattr(user_role, 'name') else str(user_role) if user_role else None
            
            if role_name == "SuperAdmin":
                # Super Admin can see all meetings
                pass
            elif role_name == "Admin":
                # Admin can see meetings they created and meetings assigned to Field Agents in their tenant
                base_query = base_query.where(
                    and_(
                        MeetingProgram.tenant_id == current_user.tenant_id,
                        or_(
                            MeetingProgram.created_by == current_user.id,  # Meetings created by admin
                            MeetingProgram.user_id.in_(  # Meetings assigned to Field Agents in their tenant
                                select(User.id).where(
                                    and_(
                                        User.tenant_id == current_user.tenant_id,
                                        User.role_id.in_(
                                            select(Role.id).where(Role.name == "FieldAgent")
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            elif role_name == "FieldAgent":
                # Field Agent can only see meetings assigned to them
                base_query = base_query.where(MeetingProgram.user_id == current_user.id)
            else:
                # Other roles - no access
                base_query = base_query.where(MeetingProgram.id == None)
        elif tenant_id:
            # Fallback to tenant-based filtering if no user context
            base_query = base_query.where(MeetingProgram.tenant_id == tenant_id)
        
        # Total meetings
        total_meetings = len(db.exec(base_query).all())
        
        # Status distribution
        status_distribution = []
        for status in VALID_STATUSES:
            status_query = base_query.where(MeetingProgram.status == status)
            count = len(db.exec(status_query).all())
            percentage = (count / total_meetings * 100) if total_meetings > 0 else 0.0
            status_distribution.append({
                "status": status,
                "count": count,
                "percentage": percentage
            })
        
        # Type distribution
        type_distribution = []
        for meeting_type in VALID_MEETING_TYPES:
            type_query = base_query.where(MeetingProgram.meeting_type == meeting_type)
            count = len(db.exec(type_query).all())
            percentage = (count / total_meetings * 100) if total_meetings > 0 else 0.0
            type_distribution.append({
                "meeting_type": meeting_type,
                "count": count,
                "percentage": percentage
            })
        
        # Monthly trends (last 6 months)
        monthly_trends = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=30*i)
            month_end = month_start.replace(day=1) + timedelta(days=32)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            
            month_key = month_start.strftime("%B %Y")
            month_query = base_query.where(
                and_(
                    MeetingProgram.scheduled_date >= month_start,
                    MeetingProgram.scheduled_date <= month_end
                )
            )
            month_meetings = db.exec(month_query).all()
            
            total = len(month_meetings)
            completed = len([m for m in month_meetings if m.status == "Done"])
            cancelled = len([m for m in month_meetings if m.status == "Cancelled"])
            
            monthly_trends.append({
                "month": month_key,
                "total": total,
                "completed": completed,
                "cancelled": cancelled
            })
        
        # Attendance metrics
        attendance_query = base_query.where(
            and_(
                MeetingProgram.expected_attendance.is_not(None),
                MeetingProgram.actual_attendance.is_not(None),
                MeetingProgram.expected_attendance > 0
            )
        )
        meetings_with_attendance = db.exec(attendance_query).all()
        
        avg_expected = None
        avg_actual = None
        attendance_rate = None
        
        if meetings_with_attendance:
            total_expected = sum(m.expected_attendance for m in meetings_with_attendance)
            total_actual = sum(m.actual_attendance for m in meetings_with_attendance)
            avg_expected = total_expected / len(meetings_with_attendance)
            avg_actual = total_actual / len(meetings_with_attendance)
            attendance_rate = (total_actual / total_expected * 100) if total_expected > 0 else 0.0
        
        attendance_metrics = {
            "avg_expected": avg_expected,
            "avg_actual": avg_actual,
            "attendance_rate": attendance_rate
        }
        
        # Recent activity (last 10 meetings)
        recent_query = base_query.order_by(MeetingProgram.created_at.desc()).limit(10)
        recent_meetings = db.exec(recent_query).all()
        
        recent_activity = []
        for meeting in recent_meetings:
            activity_type = "created"
            if meeting.status == "Done":
                activity_type = "completed"
            elif meeting.status == "Cancelled":
                activity_type = "cancelled"
            
            recent_activity.append({
                "type": activity_type,
                "title": meeting.title,
                "description": f"Meeting {meeting.status.lower()}",
                "date": meeting.created_at.strftime("%Y-%m-%d")
            })
        
        return MeetingProgramStats(
            status_distribution=status_distribution,
            type_distribution=type_distribution,
            monthly_trends=monthly_trends,
            attendance_metrics=attendance_metrics,
            recent_activity=recent_activity
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
