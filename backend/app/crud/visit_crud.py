from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session, select,func
from app.models.visit import Visit
from app.models.citizen_issues import CitizenIssue
from app.models.user import User
from app.models.role import Role
from app.schemas.visit_schema import VisitCreate, VisitUpdate

# ✅ Updated: Add location filtering to issue stats (counts only)
def get_issue_stats(db: Session, location: Optional[str] = None):
    """Get issue statistics counts, optionally filtered by location"""
    
    # Base query for all issues
    base_query = select(CitizenIssue)
    
    # Add location filter if provided
    if location:
        base_query = base_query.where(CitizenIssue.location == location)
        print(f"🔍 Filtering issues by location: {location}")
    
    # Get total count
    all_issues = db.exec(base_query).all()
    total_count = len(all_issues)
    print(f"📊 Found {total_count} total issues" + (f" for location '{location}'" if location else ""))

    # Count by status - more efficient than loading all data
    resolved_query = base_query.where(CitizenIssue.status == "Resolved")
    resolved_issues = db.exec(resolved_query).all()
    resolved_count = len(resolved_issues)
    
    pending_query = base_query.where(CitizenIssue.status == "Pending")
    pending_issues = db.exec(pending_query).all()
    pending_count = len(pending_issues)
    
    # Count by priority
    urgent_query = base_query.where(CitizenIssue.priority == "Urgent")
    urgent_issues = db.exec(urgent_query).all()
    urgent_count = len(urgent_issues)
    
    print(f"📊 Issue counts - Total: {total_count}, Resolved: {resolved_count}, Pending: {pending_count}, Urgent: {urgent_count}")

    # Convert to simple dictionaries for the lists (only when clicked)
    def issue_to_dict(issue):
        return {
            "id": issue.id,
            "title": issue.title,
            "description": issue.description,
            "location": issue.location,
            "status": issue.status,
            "priority": issue.priority,
            "issue": issue.title,  # For backward compatibility
            "created_at": issue.created_at.isoformat() if hasattr(issue, 'created_at') and issue.created_at else None,
            "updated_at": issue.updated_at.isoformat() if hasattr(issue, 'updated_at') and issue.updated_at else None,
        }

    # Build response with counts and lists
    stats = {
        "total_issues": total_count,
        "resolved_issues": resolved_count,
        "pending_issues": pending_count,
        "Urgent_issues": urgent_count,
        # Include lists for modal details when stats boxes are clicked
        "resolved_list": [issue_to_dict(issue) for issue in resolved_issues],
        "pending_list": [issue_to_dict(issue) for issue in pending_issues],
        "urgent_list": [issue_to_dict(issue) for issue in urgent_issues],
        "all_issues": [issue_to_dict(issue) for issue in all_issues],
    }

    return stats

# ✅ Updated: Add location filtering to visit stats (counts only)
def get_visit_stats(db: Session, location: Optional[str] = None):
    """Get visit statistics counts, optionally filtered by location"""
    
    # Base query for all visits
    base_query = select(Visit)
    
    # Add location filter if provided
    if location:
        base_query = base_query.where(Visit.location == location)
        print(f"🔍 Filtering visits by location: {location}")
    
    # Get total count
    all_visits = db.exec(base_query).all()
    total_count = len(all_visits)
    print(f"📊 Found {total_count} total visits" + (f" for location '{location}'" if location else ""))
    
    # Count by status - more efficient
    upcoming_visits = [v for v in all_visits if v.status == "Upcoming"]
    completed_visits = [v for v in all_visits if v.status == "Completed"]
    rejected_visits = [v for v in all_visits if v.status == "Rejected"]
    
    upcoming_count = len(upcoming_visits)
    completed_count = len(completed_visits)
    rejected_count = len(rejected_visits)
    
    print(f"📊 Visit counts - Total: {total_count}, Upcoming: {upcoming_count}, Completed: {completed_count}, Rejected: {rejected_count}")

    # Convert SQLModel objects to dictionaries for JSON serialization
    def visit_to_dict(visit):
        return {
            "id": visit.id,
            "citizen_issue_id": visit.citizen_issue_id,
            "visit_reason": visit.visit_reason,
            "location": visit.location,
            "priority": visit.priority,
            "assistant_id": visit.assistant_id,
            "visit_date": visit.visit_date.isoformat() if visit.visit_date else None,
            "visit_time": visit.visit_time.strftime('%H:%M:%S') if visit.visit_time else None,
            "status": visit.status,
            "notes": visit.notes,
        }

    return {
        "total_visits": total_count,
        "upcoming_visits": upcoming_count,
        "completed_visits": completed_count,
        "rejected_visits": rejected_count,
        # Include lists for modal details when stats boxes are clicked
        "all_visits": [visit_to_dict(v) for v in all_visits],
        "upcoming_list": [visit_to_dict(v) for v in upcoming_visits],
        "completed_list": [visit_to_dict(v) for v in completed_visits],
        "rejected_list": [visit_to_dict(v) for v in rejected_visits],
    }

# ✅ Rest of the functions remain the same
ELIGIBLE_ISSUE_STATUSES = ["Open", "Pending"]

def _validate_assistant_or_none(db: Session, assistant_id: Optional[int]) -> Optional[int]:
    """
    Returns assistant_id if it's a valid 'Assistant' user, otherwise raises.
    Allows None.
    """
    if assistant_id is None:
        return None
    assistant = db.exec(
        select(User).join(Role, User.role_id == Role.id)
        .where(User.id == assistant_id, Role.name == "Assistant")
    ).first()
    if not assistant:
        raise HTTPException(status_code=400, detail="assistant_id must refer to a user with role 'Assistant'.")
    return assistant_id

def create_visit(db: Session, visit_in: VisitCreate) -> Visit:
    # 1) Pull the issue and ensure it is eligible
    issue = db.exec(
        select(CitizenIssue).where(
            CitizenIssue.id == visit_in.citizen_issue_id,
            CitizenIssue.status.in_(ELIGIBLE_ISSUE_STATUSES)
        )
    ).first()
    if not issue:
        raise HTTPException(status_code=400, detail="Citizen issue not found or not eligible (must be Open/Pending).")

    # 2) Determine assistant:
    #   - If client provided assistant_id, validate it's an Assistant.
    #   - Else, try to use issue.assigned_to if that user is an Assistant.
    assistant_id: Optional[int] = None
    if visit_in.assistant_id is not None:
        assistant_id = _validate_assistant_or_none(db, visit_in.assistant_id)
    elif issue.assigned_to:
        candidate = db.exec(
            select(User).join(Role, User.role_id == Role.id)
            .where(User.id == issue.assigned_to, Role.name == "Assistant")
        ).first()
        assistant_id = candidate.id if candidate else None

    # 3) Build visit with auto-filled fields from issue
    db_visit = Visit(
        citizen_issue_id=issue.id,
        tenant_id=visit_in.tenant_id,  # Add tenant_id from input
        visit_reason=issue.title or "",
        location=issue.location,
        priority=issue.priority,
        assistant_id=assistant_id,
        visit_date=visit_in.visit_date,
        visit_time=visit_in.visit_time,
        status=visit_in.status or "Upcoming",
        notes=visit_in.notes,
    )

    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

def get_all_visits(db: Session, skip: int = 0, limit: int = 100) -> List[Visit]:
    return db.exec(select(Visit).offset(skip).limit(limit)).all()

def get_visit_by_id(db: Session, visit_id: int) -> Visit:
    visit = db.get(Visit, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return visit

def update_visit(db: Session, visit_id: int, visit_update: VisitUpdate) -> Visit:
    db_visit = get_visit_by_id(db, visit_id)
    data = visit_update.model_dump(exclude_unset=True)

    # Validate assistant if provided
    if "assistant_id" in data:
        data["assistant_id"] = _validate_assistant_or_none(db, data["assistant_id"])

    # Enforce valid status
    if "status" in data:
        status_val = data["status"]
        if status_val is not None and status_val not in ["Upcoming", "Completed", "Rejected"]:
            raise HTTPException(status_code=400, detail="Invalid status. Allowed: Upcoming, Completed, Rejected")

    for k, v in data.items():
        setattr(db_visit, k, v)

    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

def delete_visit(db: Session, visit_id: int) -> bool:
    visit = db.get(Visit, visit_id)
    if not visit:
        return False
    db.delete(visit)
    db.commit()
    return True

# ---------- extras for your frontend dropdowns ----------

def list_eligible_issues(db: Session) -> List[CitizenIssue]:
    """Issues you can create a visit for (Open/Pending only)."""
    return db.exec(
        select(CitizenIssue)
        .where(CitizenIssue.status.in_(ELIGIBLE_ISSUE_STATUSES))
        .order_by(CitizenIssue.created_at.desc())
    ).all()

def list_assistants(db: Session) -> List[User]:
    """All users with role Assistant."""
    return db.exec(
        select(User).join(Role, User.role_id == Role.id).where(Role.name == "Assistant")
    ).all()


def get_issue_stats_counts_only(db: Session, location: Optional[str] = None):
    """Get issue statistics counts only, optimized with database COUNT queries"""
    
    try:
        # Base condition for location filtering
        location_condition = CitizenIssue.location == location if location else True
        
        # Count total issues
        total_issues = db.exec(
            select(func.count(CitizenIssue.id)).where(location_condition)
        ).first()
        
        # Count resolved issues
        resolved_issues = db.exec(
            select(func.count(CitizenIssue.id)).where(
                location_condition & (CitizenIssue.status == "Resolved")
            )
        ).first()
        
        # Count pending issues
        pending_issues = db.exec(
            select(func.count(CitizenIssue.id)).where(
                location_condition & (CitizenIssue.status == "Pending")
            )
        ).first()
        
        # Count urgent issues
        urgent_issues = db.exec(
            select(func.count(CitizenIssue.id)).where(
                location_condition & (CitizenIssue.priority == "Urgent")
            )
        ).first()
        
        print(f"📊 Issue counts for location '{location}': Total={total_issues}, Resolved={resolved_issues}, Pending={pending_issues}, Urgent={urgent_issues}")
        
        return {
            "total_issues": total_issues or 0,
            "resolved_issues": resolved_issues or 0,
            "pending_issues": pending_issues or 0,
            "Urgent_issues": urgent_issues or 0,
            # Empty lists since we're only returning counts
            "resolved_list": [],
            "pending_list": [],
            "urgent_list": [],
            "all_issues": [],
        }
        
    except Exception as e:
        print(f"❌ Error in get_issue_stats_counts_only: {e}")
        return {
            "total_issues": 0,
            "resolved_issues": 0,
            "pending_issues": 0,
            "Urgent_issues": 0,
            "resolved_list": [],
            "pending_list": [],
            "urgent_list": [],
            "all_issues": [],
        }