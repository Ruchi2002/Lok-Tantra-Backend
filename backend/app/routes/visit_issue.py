from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from sqlmodel import select
from database import get_session
from app.schemas.visit_issue_schema import VisitIssueCreate, VisitIssueRead
from app.crud.visit_issue_crud import create_visit_issue, get_issues_for_visit
from app.models.visit_issue import VisitIssue
from app.models.visit import Visit
from app.models.citizen_issues import CitizenIssue
from app.models.user import User
from app.models.area import Area

router = APIRouter(prefix="/visit-issues", tags=["Visit Issues"])

@router.post("/", response_model=VisitIssueRead)
def create_visit_issue_route(vi: VisitIssueCreate, db: Session = Depends(get_session)):
    return create_visit_issue(db, vi)

@router.get("/visit/{visit_id}", response_model=list[VisitIssueRead])
def get_issues_for_visit_route(visit_id: int, db: Session = Depends(get_session)):
    """Get all issues for a specific visit with enhanced data for frontend"""
    visit_issues = db.exec(
        select(VisitIssue)
        .where(VisitIssue.visit_id == visit_id)
        .options(
            selectinload(VisitIssue.visit),
            selectinload(VisitIssue.issue)
        )
    ).all()
    
    # Transform to include frontend-compatible data
    result = []
    for visit_issue in visit_issues:
        visit_issue_dict = visit_issue.dict()
        
        # Get visit details
        visit = db.get(Visit, visit_issue.visit_id)
        if visit:
            # Get assistant name
            assistant = db.get(User, visit.assistant_id)
            visit_issue_dict["assistant"] = assistant.name if assistant else None
            
            # Get area name
            area = db.get(Area, visit.area_id)
            visit_issue_dict["location"] = area.name if area else None
            
            # Format visit date
            if visit.visit_date:
                visit_issue_dict["visit_date"] = visit.visit_date.strftime("%d %b %Y")
            
            visit_issue_dict["visit_time"] = visit.visit_time
        
        # Get issue details
        issue = db.get(CitizenIssue, visit_issue.issue_id)
        if issue:
            visit_issue_dict["issue_title"] = issue.title
            # Get issue status (now using string field)
            visit_issue_dict["issue_status"] = issue.status if issue.status else "Open"
        
        result.append(visit_issue_dict)
    
    return result
