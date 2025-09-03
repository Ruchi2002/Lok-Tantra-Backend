from sqlmodel import Session, select
from app.models.visit_issue import VisitIssue
from app.schemas.visit_issue_schema import VisitIssueCreate

def create_visit_issue(db: Session, visit_issue: VisitIssueCreate):
    db_vi = VisitIssue.model_validate(visit_issue)
    db.add(db_vi)
    db.commit()
    db.refresh(db_vi)
    return db_vi

def get_issues_for_visit(db: Session, visit_id: int):
    return db.exec(select(VisitIssue).where(VisitIssue.visit_id == visit_id)).all()
