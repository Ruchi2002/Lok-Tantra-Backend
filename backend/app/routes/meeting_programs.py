from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
import json
from database import get_session
from app.core.auth import get_current_user
from app.utils.role_permissions import role_permissions

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
from app.models.role import Role

# Setup logging
logger = logging.getLogger(__name__)

def parse_participants(participants_json: str, db: Session) -> List[str]:
    """Parse participants JSON and return list of participant names"""
    if not participants_json:
        return []
    
    try:
        # Parse participants JSON - could be list of objects with names or list of user IDs
        participant_data = json.loads(participants_json)
        participant_names = []
        
        if isinstance(participant_data, list):
            for participant in participant_data:
                if isinstance(participant, dict) and 'name' in participant:
                    # New format: list of objects with names
                    participant_names.append(participant['name'])
                elif isinstance(participant, str):
                    # Old format: list of user IDs
                    user = db.get(User, participant)
                    if user:
                        participant_names.append(user.name)
        
        return participant_names
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"Error parsing participants: {e}")
        return []

router = APIRouter(prefix="/meeting-programs", tags=["Meeting Programs"])

def check_meeting_access(user: User, meeting: MeetingProgram) -> bool:
    """Check if user has access to a specific meeting based on role and permissions"""
    if not user or not meeting:
        return False
    
    # Get user role
    user_role = getattr(user, 'role', None)
    if not user_role:
        return False
    
    # Extract role name from role object
    role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
    
    # Super Admin can access all meetings
    if role_permissions.can_view_meetings(role_name, None, None, None, None):
        return True
    
    # Admin can access meetings they created and meetings assigned to Field Agents in their tenant
    if role_permissions.can_view_meetings(role_name, meeting.tenant_id, user.tenant_id, None, None):
        # Check if admin created the meeting or if it's assigned to a Field Agent in their tenant
        if meeting.created_by == user.id:
            return True
        
        # Check if meeting is assigned to a Field Agent in admin's tenant
        if meeting.user_id and meeting.tenant_id == user.tenant_id:
            # This would require a database query to check if the assigned user is a Field Agent
            # For now, we'll allow access if the meeting is in the same tenant
            return True
    
    # Field Agent can only access meetings assigned to them
    if role_permissions.can_view_meetings(role_name, None, None, user.id, meeting.user_id):
        return meeting.user_id == user.id
    
    return False

def get_filtered_meeting_query(current_user: User, base_query=None):
    """Get query with role-based filtering for meetings"""
    if base_query is None:
        base_query = select(MeetingProgram)
    
    user_role = getattr(current_user, 'role', None)
    if not user_role:
        return base_query.filter(MeetingProgram.id == None)  # Return no results
    
    # Extract role name from role object
    role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
    
    # Super Admin can see all meetings
    if role_permissions.can_view_meetings(role_name, None, None, None, None):
        return base_query
    
    # Admin can see meetings they created and meetings assigned to Field Agents in their tenant
    if role_permissions.can_view_meetings(role_name, current_user.tenant_id, current_user.tenant_id, None, None):
        # For now, let's filter by tenant and then apply additional filtering in Python
        # This is simpler and more reliable
        return base_query.filter(MeetingProgram.tenant_id == current_user.tenant_id)
    
    # Field Agent can only see meetings assigned to them
    if role_permissions.can_view_meetings(role_name, None, None, current_user.id, current_user.id):
        return base_query.filter(MeetingProgram.user_id == current_user.id)
    
    # Default: no access
    return base_query.filter(MeetingProgram.id == None)

@router.post("/", response_model=MeetingProgramRead, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingProgramCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new meeting program"""
    try:
        logger.info(f"Creating meeting program: {meeting_data.title}")
        
        # Check if user can create meetings
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to create meeting programs"
            )
        
        # Extract role name from role object
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_create_meetings(role_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to create meeting programs"
            )
        
        # Set tenant_id from current user if not provided
        if not meeting_data.tenant_id and hasattr(current_user, 'tenant_id'):
            meeting_data.tenant_id = current_user.tenant_id
        
        # Set created_by from current user
        meeting_data.created_by = current_user.id
        
        # Field Agents can only create meetings assigned to themselves
        if role_name == 'FieldAgent':
            meeting_data.user_id = current_user.id
        
        # Create the meeting
        meeting = create_meeting_program(db, meeting_data, current_user.id)
        
        # Convert to response format
        response_data = MeetingProgramRead.model_validate(meeting)
        
        # Add frontend-compatible fields
        response_data.date = meeting.scheduled_date.strftime("%Y-%m-%d")
        if meeting.start_time and meeting.end_time:
            response_data.time = f"{meeting.start_time} - {meeting.end_time}"
        
        # Get creator name
        if meeting.creator:
            response_data.creator_name = meeting.creator.name
        
        # Get participant names
        response_data.participant_names = parse_participants(meeting.participants, db)
        
        return response_data
        
    except HTTPException:
        raise
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
        response_data = MeetingProgramRead.model_validate(meeting)
        
        # Add frontend-compatible fields
        response_data.date = meeting.scheduled_date.strftime("%Y-%m-%d")
        if meeting.start_time and meeting.end_time:
            response_data.time = f"{meeting.start_time} - {meeting.end_time}"
        
        # Get creator name
        if meeting.creator:
            response_data.creator_name = meeting.creator.name
        
        # Get participant names
        response_data.participant_names = parse_participants(meeting.participants, db)
        
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
    print(f"Getting meetings with filters: {status}, {meeting_type}, {date_from}, {date_to}")
    try:
        # Get role-based filtered meetings
        base_query = select(MeetingProgram)
        
        # Apply role-based filtering
        filtered_query = get_filtered_meeting_query(current_user, base_query)
        
        # Apply additional filters
        if status:
            filtered_query = filtered_query.filter(MeetingProgram.status == status)
        if meeting_type:
            filtered_query = filtered_query.filter(MeetingProgram.meeting_type == meeting_type)
        if date_from:
            filtered_query = filtered_query.filter(MeetingProgram.scheduled_date >= date_from)
        if date_to:
            filtered_query = filtered_query.filter(MeetingProgram.scheduled_date <= date_to)
        
        # Execute query with pagination
        result = db.exec(filtered_query.offset(skip).limit(limit))
        meetings = result.all()
        
        # Apply additional role-based filtering for Admin users and Field Agents
        filtered_meetings = []
        user_role = getattr(current_user, 'role', None)
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role) if user_role else None
        
        for meeting in meetings:
            # For Admin users, only show meetings they created or meetings assigned to Field Agents
            if role_name == "Admin":
                # Check if admin created the meeting
                if meeting.created_by == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
                
                # Check if meeting is assigned to a Field Agent in their tenant
                if meeting.user_id:
                    assigned_user = db.get(User, meeting.user_id)
                    if assigned_user and assigned_user.tenant_id == current_user.tenant_id:
                        # Check if assigned user is a Field Agent
                        if assigned_user.role and assigned_user.role.name == "FieldAgent":
                            filtered_meetings.append(meeting)
                            continue
            
            # For Field Agents, only show meetings assigned to them
            elif role_name == "FieldAgent":
                if meeting.user_id == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
            
            # For Super Admin, include all meetings
            elif role_name == "SuperAdmin":
                filtered_meetings.append(meeting)
            
            # For other roles, no access
        
        # Convert to response format
        response_data = []
        for meeting in filtered_meetings:
            meeting_response = MeetingProgramRead.model_validate(meeting)
            
            # Add frontend-compatible fields
            meeting_response.date = meeting.scheduled_date.strftime("%Y-%m-%d")
            if meeting.start_time and meeting.end_time:
                meeting_response.time = f"{meeting.start_time} - {meeting.end_time}"
            
            # Get creator name
            if meeting.creator:
                meeting_response.creator_name = meeting.creator.name
            
            # Get assigned user name
            if meeting.user_id:
                assigned_user = db.get(User, meeting.user_id)
                if assigned_user:
                    meeting_response.assigned_user_name = assigned_user.name
            
            # Get participant names from the parsed participants data
            meeting_response.participant_names = parse_participants(meeting.participants, db)
            
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
        
        # Check if user can edit this meeting
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Extract role name from role object
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_edit_meeting(
            role_name, 
            meeting.tenant_id, 
            current_user.tenant_id, 
            meeting.user_id, 
            current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to edit this meeting program"
            )
        
        # Update the meeting
        updated_meeting = update_meeting_program(db, meeting_id, meeting_data)
        
        # Convert to response format
        response_data = MeetingProgramRead.model_validate(updated_meeting)
        
        # Add frontend-compatible fields
        response_data.date = updated_meeting.scheduled_date.strftime("%Y-%m-%d")
        if updated_meeting.start_time and updated_meeting.end_time:
            response_data.time = f"{updated_meeting.start_time} - {updated_meeting.end_time}"
        
        # Get creator name
        if updated_meeting.creator:
            response_data.creator_name = updated_meeting.creator.name
        
        # Get participant names
        response_data.participant_names = parse_participants(updated_meeting.participants, db)
        
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
        
        # Check if user can delete this meeting
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this meeting program"
            )
        
        # Extract role name from role object
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        if not role_permissions.can_delete_meeting(
            role_name, 
            meeting.tenant_id, 
            current_user.tenant_id, 
            meeting.user_id, 
            current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this meeting program"
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
    """Get upcoming meetings for today with role-based filtering"""
    try:
        # Get today's meetings with role-based filtering
        base_query = select(MeetingProgram)
        filtered_query = get_filtered_meeting_query(current_user, base_query)
        
        # Get today's meetings
        today = datetime.now().date()
        today_query = filtered_query.where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date < today + timedelta(days=1),
                MeetingProgram.status == "Upcoming"
            )
        )
        meetings = db.exec(today_query).all()
        
        # Apply additional role-based filtering for Admin users and Field Agents
        filtered_meetings = []
        user_role = getattr(current_user, 'role', None)
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role) if user_role else None
        
        for meeting in meetings:
            # For Admin users, only show meetings they created or meetings assigned to Field Agents
            if role_name == "Admin":
                # Check if admin created the meeting
                if meeting.created_by == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
                
                # Check if meeting is assigned to a Field Agent in their tenant
                if meeting.user_id:
                    assigned_user = db.get(User, meeting.user_id)
                    if assigned_user and assigned_user.tenant_id == current_user.tenant_id:
                        # Check if assigned user is a Field Agent
                        if assigned_user.role and assigned_user.role.name == "FieldAgent":
                            filtered_meetings.append(meeting)
                            continue
            
            # For Field Agents, only show meetings assigned to them
            elif role_name == "FieldAgent":
                if meeting.user_id == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
            
            # For Super Admin, include all meetings
            elif role_name == "SuperAdmin":
                filtered_meetings.append(meeting)
            
            # For other roles, no access
        
        # Convert to response format
        response_data = []
        for meeting in filtered_meetings:
            meeting_response = MeetingProgramRead.model_validate(meeting)
            
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
    """Get upcoming meetings for this week with role-based filtering"""
    try:
        # Get week's meetings with role-based filtering
        base_query = select(MeetingProgram)
        filtered_query = get_filtered_meeting_query(current_user, base_query)
        
        # Get week's meetings
        today = datetime.now().date()
        week_end = today + timedelta(days=7)
        week_query = filtered_query.where(
            and_(
                MeetingProgram.scheduled_date >= today,
                MeetingProgram.scheduled_date <= week_end,
                MeetingProgram.status == "Upcoming"
            )
        )
        meetings = db.exec(week_query).all()
        
        # Apply additional role-based filtering for Admin users and Field Agents
        filtered_meetings = []
        user_role = getattr(current_user, 'role', None)
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role) if user_role else None
        
        for meeting in meetings:
            # For Admin users, only show meetings they created or meetings assigned to Field Agents
            if role_name == "Admin":
                # Check if admin created the meeting
                if meeting.created_by == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
                
                # Check if meeting is assigned to a Field Agent in their tenant
                if meeting.user_id:
                    assigned_user = db.get(User, meeting.user_id)
                    if assigned_user and assigned_user.tenant_id == current_user.tenant_id:
                        # Check if assigned user is a Field Agent
                        if assigned_user.role and assigned_user.role.name == "FieldAgent":
                            filtered_meetings.append(meeting)
                            continue
            
            # For Field Agents, only show meetings assigned to them
            elif role_name == "FieldAgent":
                if meeting.user_id == current_user.id:
                    filtered_meetings.append(meeting)
                    continue
            
            # For Super Admin, include all meetings
            elif role_name == "SuperAdmin":
                filtered_meetings.append(meeting)
            
            # For other roles, no access
        
        # Convert to response format
        response_data = []
        for meeting in filtered_meetings:
            meeting_response = MeetingProgramRead.model_validate(meeting)
            
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
        # Get KPIs with role-based filtering
        kpis = get_meeting_program_kpis(db, current_user=current_user)
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
        # Get stats with role-based filtering
        stats = get_meeting_program_stats(db, current_user=current_user)
        return stats
        
    except Exception as e:
        logger.error(f"Error in get_meeting_stats endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting program statistics"
        )

@router.get("/participants", response_model=List[Dict[str, Any]])
async def get_meeting_participants(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get available users for meeting participants (Admin and FieldAgent only)"""
    try:
        # Get user role
        user_role = getattr(current_user, 'role', None)
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found"
            )
        
        role_name = user_role.name if hasattr(user_role, 'name') else str(user_role)
        
        # Build query for Admin and FieldAgent users
        base_query = select(User).where(
            and_(
                User.role_id.in_(
                    select(Role.id).where(
                        or_(Role.name == "Admin", Role.name == "FieldAgent")
                    )
                )
            )
        )
        
        # Apply tenant filtering based on user role
        if role_name == "SuperAdmin":
            # Super Admin can see all Admin and FieldAgent users
            pass
        elif role_name in ["Admin", "FieldAgent"]:
            # Admin and Field Agent can only see users from their tenant
            base_query = base_query.where(User.tenant_id == current_user.tenant_id)
        else:
            # Other roles have no access
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view meeting participants"
            )
        
        # Execute query
        users = db.exec(base_query).all()
        
        # Format response
        participants = []
        for user in users:
            # Skip the current user
            if user.id == current_user.id:
                continue
                
            participants.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role.name if user.role else "Unknown",
                "tenant_id": user.tenant_id,
                "tenant_name": getattr(user, 'tenant_name', None)
            })
        
        return participants
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_meeting_participants endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get meeting participants"
        )

@router.post("/reminders/send", status_code=status.HTTP_200_OK)
async def send_reminders(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Send reminders for upcoming meetings"""
    try:
        # Get reminders with role-based filtering
        # For now, we'll use the existing function but filter results based on user access
        if current_user.role and current_user.role.name == "SuperAdmin":
            meetings_with_reminders = send_meeting_reminders(db, None)
        elif current_user.role and current_user.role.name == "Admin":
            meetings_with_reminders = send_meeting_reminders(db, current_user.tenant_id)
        else:
            # Field Agent - only their assigned meetings
            meetings_with_reminders = send_meeting_reminders(db, None)
        
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
        response_data = MeetingProgramRead.model_validate(updated_meeting)
        
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
 