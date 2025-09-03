from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from typing import List, Dict, Any
import logging

from database import get_session
from app.models.citizen_issues import CitizenIssue
from app.models.user import User
from app.models.visit import Visit
from app.crud.sent_letter_crud import get_sent_letter_statistics

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/dashboard/stats", response_model=Dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(get_session)
):
    """Get dashboard statistics"""
    try:
        # Total issues count
        total_issues = db.exec(select(func.count(CitizenIssue.id))).first() or 0
        
        # Resolved issues count
        resolved_issues = db.exec(
            select(func.count(CitizenIssue.id))
            .where(CitizenIssue.status == "Resolved")
        ).first() or 0
        
        # Calculate resolved percentage
        resolved_percentage = (resolved_issues / total_issues * 100) if total_issues > 0 else 0
        
        # Get top category
        category_counts = db.exec(
            select(CitizenIssue.category_id, func.count(CitizenIssue.id))
            .where(CitizenIssue.category_id.isnot(None))
            .group_by(CitizenIssue.category_id)
            .order_by(func.count(CitizenIssue.id).desc())
        ).all()
        
        top_category = category_counts[0][0] if category_counts else "Unknown"
        
        # Get status distribution
        status_counts = db.exec(
            select(CitizenIssue.status, func.count(CitizenIssue.id))
            .group_by(CitizenIssue.status)
        ).all()
        
        status_distribution = {status: count for status, count in status_counts}
        
        # Get recent issues for follow-ups
        recent_issues = db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.status.in_(["Open", "Pending", "In Progress"]))
            .order_by(CitizenIssue.created_at.desc())
            .limit(5)
        ).all()
        
        # Get upcoming visits
        upcoming_visits = db.exec(
            select(Visit)
            .where(Visit.visit_date >= func.current_date())
            .order_by(Visit.visit_date.asc())
            .limit(5)
        ).all()
        
        # Get sent letters statistics
        sent_letters_stats = get_sent_letter_statistics(db, None)
        
        return {
            "total_issues": total_issues,
            "resolved_issues": resolved_issues,
            "resolved_percentage": round(resolved_percentage, 1),
            "top_category": top_category,
            "status_distribution": status_distribution,
            "recent_issues": [
                {
                    "id": issue.id,
                    "title": issue.title,
                    "status": issue.status,
                    "priority": issue.priority,
                    "category": issue.category_id,
                    "assigned_to": issue.assigned_to,
                    "created_at": issue.created_at.isoformat() if issue.created_at else None,
                    "location": issue.location
                }
                for issue in recent_issues
            ],
            "upcoming_visits": [
                {
                    "id": visit.id,
                    "title": visit.visit_reason,
                    "visit_date": visit.visit_date.isoformat() if visit.visit_date else None,
                    "visit_time": visit.visit_time.isoformat() if visit.visit_time else None,
                    "location": visit.location,
                    "assigned_to": visit.assistant_id
                }
                for visit in upcoming_visits
            ],
            "sent_letters_stats": {
                "total_letters": sent_letters_stats.total_letters,
                "awaiting_response": sent_letters_stats.awaiting_response,
                "response_received": sent_letters_stats.response_received,
                "closed": sent_letters_stats.closed,
                "overdue_followups": sent_letters_stats.overdue_followups,
                "followups_due_this_week": sent_letters_stats.followups_due_this_week
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )

@router.get("/dashboard/categories", response_model=List[Dict[str, Any]])
def get_category_stats(
    db: Session = Depends(get_session)
):
    """Get category statistics for charts"""
    try:
        category_stats = db.exec(
            select(
                CitizenIssue.category_id,
                func.count(CitizenIssue.id).label("count")
            )
            .where(CitizenIssue.category_id.isnot(None))
            .group_by(CitizenIssue.category_id)
            .order_by(func.count(CitizenIssue.id).desc())
        ).all()
        
        return [
            {"category": category, "count": count}
            for category, count in category_stats
        ]
        
    except Exception as e:
        logger.error(f"Error fetching category stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch category statistics"
        )

@router.get("/dashboard/stats/public", response_model=Dict[str, Any])
def get_dashboard_stats_public(
    db: Session = Depends(get_session)
):
    """Get dashboard statistics - PUBLIC ENDPOINT"""
    try:
        # Total issues count
        total_issues = db.exec(select(func.count(CitizenIssue.id))).first() or 0
        
        # Resolved issues count
        resolved_issues = db.exec(
            select(func.count(CitizenIssue.id))
            .where(CitizenIssue.status == "Resolved")
        ).first() or 0
        
        # Calculate resolved percentage
        resolved_percentage = (resolved_issues / total_issues * 100) if total_issues > 0 else 0
        
        # Get top category
        category_counts = db.exec(
            select(CitizenIssue.category_id, func.count(CitizenIssue.id))
            .where(CitizenIssue.category_id.isnot(None))
            .group_by(CitizenIssue.category_id)
            .order_by(func.count(CitizenIssue.id).desc())
        ).all()
        
        top_category = category_counts[0][0] if category_counts else "Unknown"
        
        # Get status distribution
        status_counts = db.exec(
            select(CitizenIssue.status, func.count(CitizenIssue.id))
            .group_by(CitizenIssue.status)
        ).all()
        
        status_distribution = {status: count for status, count in status_counts}
        
        # Get recent issues for follow-ups
        recent_issues = db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.status.in_(["Open", "Pending", "In Progress"]))
            .order_by(CitizenIssue.created_at.desc())
            .limit(5)
        ).all()
        
        return {
            "total_issues": total_issues,
            "resolved_issues": resolved_issues,
            "resolved_percentage": round(resolved_percentage, 1),
            "top_category": top_category,
            "status_distribution": status_distribution,
            "recent_issues": [
                {
                    "id": issue.id,
                    "title": issue.title,
                    "status": issue.status,
                    "priority": issue.priority,
                    "category": issue.category_id,
                    "assigned_to": issue.assigned_to,
                    "created_at": issue.created_at.isoformat() if issue.created_at else None,
                    "location": issue.location
                }
                for issue in recent_issues
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch dashboard statistics"
        )
