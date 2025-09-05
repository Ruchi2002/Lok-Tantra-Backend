from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import logging
from app.models.sent_grievance_letter import (
    SentGrievanceLetter, 
    SentGrievanceLetterStatus, 
    SentGrievanceLetterPriority, 
    SentGrievanceLetterCategory
)
from app.schemas.sent_grievance_letter_schema import (
    SentGrievanceLetterCreate, 
    SentGrievanceLetterUpdate, 
    SentGrievanceLetterFilters, 
    SentGrievanceLetterStatistics
)
from app.models.citizen_issues import CitizenIssue

logger = logging.getLogger(__name__)

def create_sent_grievance_letter(
    db: Session, 
    letter_data: SentGrievanceLetterCreate, 
    user_id: str, 
    tenant_id: Optional[str] = None
) -> SentGrievanceLetter:
    """Create a new sent grievance letter"""
    try:
        # Verify that the grievance exists
        grievance = db.exec(
            select(CitizenIssue).where(CitizenIssue.id == letter_data.grievance_id)
        ).first()
        
        if not grievance:
            raise ValueError(f"Grievance with ID {letter_data.grievance_id} not found")
        
        # Convert to dict and handle tenant_id properly
        letter_dict = letter_data.dict()
        if tenant_id is not None:
            letter_dict['tenant_id'] = tenant_id
        
        # Handle sent_date properly
        if not letter_dict.get('sent_date'):
            letter_dict['sent_date'] = datetime.now(timezone.utc)
        
        db_letter = SentGrievanceLetter(
            **letter_dict,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Created sent grievance letter with ID: {db_letter.id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating sent grievance letter: {str(e)}")
        raise

def get_sent_grievance_letter(
    db: Session, 
    letter_id: str, 
    tenant_id: Optional[str] = None
) -> Optional[SentGrievanceLetter]:
    """Get a specific sent grievance letter by ID"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        return db.exec(query).first()
    except Exception as e:
        logger.error(f"Error fetching sent grievance letter: {str(e)}")
        raise

def get_all_sent_grievance_letters(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    tenant_id: Optional[str] = None
) -> List[SentGrievanceLetter]:
    """Get all sent grievance letters with pagination"""
    try:
        query = select(SentGrievanceLetter)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        query = query.offset(skip).limit(limit).order_by(desc(SentGrievanceLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters: {str(e)}")
        raise

def get_filtered_sent_grievance_letters(
    db: Session, 
    filters: SentGrievanceLetterFilters, 
    tenant_id: Optional[str] = None
) -> Dict[str, Any]:
    """Get filtered sent grievance letters with pagination"""
    try:
        query = select(SentGrievanceLetter)
        
        # Apply tenant filter
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        # Apply search filter
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    SentGrievanceLetter.recipient_name.ilike(search_term),
                    SentGrievanceLetter.recipient_organization.ilike(search_term),
                    SentGrievanceLetter.subject.ilike(search_term),
                    SentGrievanceLetter.content.ilike(search_term),
                    SentGrievanceLetter.category.ilike(search_term)
                )
            )
        
        # Apply status filter
        if filters.status:
            query = query.where(SentGrievanceLetter.status == filters.status)
        
        # Apply priority filter
        if filters.priority:
            query = query.where(SentGrievanceLetter.priority == filters.priority)
        
        # Apply category filter
        if filters.category:
            query = query.where(SentGrievanceLetter.category == filters.category)
        
        # Apply grievance_id filter
        if filters.grievance_id:
            query = query.where(SentGrievanceLetter.grievance_id == filters.grievance_id)
        
        # Apply assigned_to filter
        if filters.assigned_to:
            query = query.where(SentGrievanceLetter.assigned_to == filters.assigned_to)
        
        # Apply date range filters
        if filters.date_from:
            query = query.where(SentGrievanceLetter.sent_date >= filters.date_from)
        if filters.date_to:
            query = query.where(SentGrievanceLetter.sent_date <= filters.date_to)
        
        # Get total count for pagination
        total_query = select(func.count()).select_from(query.subquery())
        total = db.exec(total_query).first() or 0
        
        # Apply pagination and ordering
        query = query.order_by(desc(SentGrievanceLetter.created_at))
        query = query.offset((filters.page - 1) * filters.per_page).limit(filters.per_page)
        
        letters = db.exec(query).all()
        
        return {
            "letters": letters,
            "total": total,
            "page": filters.page,
            "per_page": filters.per_page,
            "total_pages": (total + filters.per_page - 1) // filters.per_page
        }
    except Exception as e:
        logger.error(f"Error fetching filtered sent grievance letters: {str(e)}")
        raise

def update_sent_grievance_letter(
    db: Session, 
    letter_id: str, 
    letter_data: SentGrievanceLetterUpdate, 
    user_id: str, 
    tenant_id: Optional[str] = None
) -> Optional[SentGrievanceLetter]:
    """Update a sent grievance letter"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        db_letter = db.exec(query).first()
        if not db_letter:
            return None
        
        # Update fields
        update_data = letter_data.dict(exclude_unset=True)
        update_data['updated_by'] = user_id
        update_data['updated_at'] = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_letter, field, value)
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Updated sent grievance letter with ID: {db_letter.id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sent grievance letter: {str(e)}")
        raise

def delete_sent_grievance_letter(
    db: Session, 
    letter_id: str, 
    tenant_id: Optional[str] = None
) -> bool:
    """Delete a sent grievance letter"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        db_letter = db.exec(query).first()
        if not db_letter:
            return False
        
        db.delete(db_letter)
        db.commit()
        logger.info(f"Deleted sent grievance letter with ID: {letter_id}")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting sent grievance letter: {str(e)}")
        raise

def get_sent_grievance_letter_statistics(
    db: Session, 
    tenant_id: Optional[str] = None
) -> SentGrievanceLetterStatistics:
    """Get statistics for sent grievance letters"""
    try:
        base_query = select(SentGrievanceLetter)
        if tenant_id:
            base_query = base_query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        # Total letters
        total_letters = db.exec(select(func.count()).select_from(base_query.subquery())).first() or 0
        
        # Status counts
        awaiting = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.status == SentGrievanceLetterStatus.AWAITING).subquery()
            )
        ).first() or 0
        
        response_received = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.status == SentGrievanceLetterStatus.RESPONSE_RECEIVED).subquery()
            )
        ).first() or 0
        
        closed = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.status == SentGrievanceLetterStatus.CLOSED).subquery()
            )
        ).first() or 0
        
        # Priority counts
        high_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.priority == SentGrievanceLetterPriority.HIGH).subquery()
            )
        ).first() or 0
        
        medium_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.priority == SentGrievanceLetterPriority.MEDIUM).subquery()
            )
        ).first() or 0
        
        low_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentGrievanceLetter.priority == SentGrievanceLetterPriority.LOW).subquery()
            )
        ).first() or 0
        
        # Overdue follow-ups
        today = datetime.now(timezone.utc).date()
        overdue_followups = db.exec(
            select(func.count()).select_from(
                base_query.where(
                    and_(
                        SentGrievanceLetter.follow_up_date < today,
                        SentGrievanceLetter.status != SentGrievanceLetterStatus.CLOSED
                    )
                ).subquery()
            )
        ).first() or 0
        
        # Follow-ups due this week
        week_from_now = today + timedelta(days=7)
        followups_due_this_week = db.exec(
            select(func.count()).select_from(
                base_query.where(
                    and_(
                        SentGrievanceLetter.follow_up_date >= today,
                        SentGrievanceLetter.follow_up_date <= week_from_now,
                        SentGrievanceLetter.status != SentGrievanceLetterStatus.CLOSED
                    )
                ).subquery()
            )
        ).first() or 0
        
        # Average closure time
        closed_letters = db.exec(
            base_query.where(
                and_(
                    SentGrievanceLetter.status == SentGrievanceLetterStatus.CLOSED,
                    SentGrievanceLetter.closure_date.isnot(None)
                )
            )
        ).all()
        
        average_closure_time_days = None
        if closed_letters:
            total_days = 0
            for letter in closed_letters:
                if letter.closure_date and letter.sent_date:
                    days = (letter.closure_date - letter.sent_date).days
                    total_days += days
            average_closure_time_days = total_days / len(closed_letters)
        
        # Top categories
        category_counts = db.exec(
            select(
                SentGrievanceLetter.category,
                func.count(SentGrievanceLetter.id).label('count')
            )
            .select_from(base_query.subquery())
            .group_by(SentGrievanceLetter.category)
            .order_by(desc('count'))
            .limit(5)
        ).all()
        
        top_categories = [
            {"category": cat.category, "count": cat.count} 
            for cat in category_counts
        ]
        
        return SentGrievanceLetterStatistics(
            total_letters=total_letters,
            awaiting=awaiting,
            response_received=response_received,
            closed=closed,
            high_priority=high_priority,
            medium_priority=medium_priority,
            low_priority=low_priority,
            overdue_followups=overdue_followups,
            followups_due_this_week=followups_due_this_week,
            average_closure_time_days=average_closure_time_days,
            top_categories=top_categories
        )
    except Exception as e:
        logger.error(f"Error calculating sent grievance letter statistics: {str(e)}")
        raise

def get_sent_grievance_letters_by_status(
    db: Session, 
    status: SentGrievanceLetterStatus, 
    tenant_id: Optional[str] = None
) -> List[SentGrievanceLetter]:
    """Get sent grievance letters by status"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.status == status)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        query = query.order_by(desc(SentGrievanceLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters by status: {str(e)}")
        raise

def get_sent_grievance_letters_by_priority(
    db: Session, 
    priority: SentGrievanceLetterPriority, 
    tenant_id: Optional[str] = None
) -> List[SentGrievanceLetter]:
    """Get sent grievance letters by priority"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.priority == priority)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        query = query.order_by(desc(SentGrievanceLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent grievance letters by priority: {str(e)}")
        raise

def get_overdue_followups(
    db: Session, 
    tenant_id: Optional[str] = None
) -> List[SentGrievanceLetter]:
    """Get overdue follow-up letters"""
    try:
        today = datetime.utcnow().date()
        query = select(SentGrievanceLetter).where(
            and_(
                SentGrievanceLetter.follow_up_date < today,
                SentGrievanceLetter.status != SentGrievanceLetterStatus.CLOSED
            )
        )
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        query = query.order_by(SentGrievanceLetter.follow_up_date)
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching overdue followups: {str(e)}")
        raise

def get_followups_due_this_week(
    db: Session, 
    tenant_id: Optional[str] = None
) -> List[SentGrievanceLetter]:
    """Get follow-ups due this week"""
    try:
        today = datetime.utcnow().date()
        week_from_now = today + timedelta(days=7)
        query = select(SentGrievanceLetter).where(
            and_(
                SentGrievanceLetter.follow_up_date >= today,
                SentGrievanceLetter.follow_up_date <= week_from_now,
                SentGrievanceLetter.status != SentGrievanceLetterStatus.CLOSED
            )
        )
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        query = query.order_by(SentGrievanceLetter.follow_up_date)
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching followups due this week: {str(e)}")
        raise

def assign_sent_grievance_letter_to_user(
    db: Session, 
    letter_id: str, 
    assigned_user_id: int, 
    user_id: str, 
    tenant_id: Optional[str] = None
) -> Optional[SentGrievanceLetter]:
    """Assign a sent grievance letter to a user"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        db_letter = db.exec(query).first()
        if not db_letter:
            return None
        
        db_letter.assigned_to = assigned_user_id
        db_letter.updated_by = user_id
        db_letter.updated_at = datetime.utcnow()
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Assigned sent grievance letter {letter_id} to user {assigned_user_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning sent grievance letter: {str(e)}")
        raise

def update_sent_grievance_letter_status(
    db: Session, 
    letter_id: str, 
    status: SentGrievanceLetterStatus, 
    user_id: str, 
    tenant_id: Optional[str] = None
) -> Optional[SentGrievanceLetter]:
    """Update the status of a sent grievance letter"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        db_letter = db.exec(query).first()
        if not db_letter:
            return None
        
        db_letter.status = status
        db_letter.updated_by = user_id
        db_letter.updated_at = datetime.utcnow()
        
        # Set closure date if status is CLOSED
        if status == SentGrievanceLetterStatus.CLOSED:
            db_letter.closure_date = datetime.utcnow()
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Updated sent grievance letter {letter_id} status to {status}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sent grievance letter status: {str(e)}")
        raise

def record_response_received(
    db: Session, 
    letter_id: str, 
    response_content: str, 
    user_id: str, 
    tenant_id: Optional[str] = None
) -> Optional[SentGrievanceLetter]:
    """Record that a response has been received for a sent grievance letter"""
    try:
        query = select(SentGrievanceLetter).where(SentGrievanceLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentGrievanceLetter.tenant_id == tenant_id)
        
        db_letter = db.exec(query).first()
        if not db_letter:
            return None
        
        db_letter.response_content = response_content
        db_letter.response_received_date = datetime.utcnow()
        db_letter.status = SentGrievanceLetterStatus.RESPONSE_RECEIVED
        db_letter.updated_by = user_id
        db_letter.updated_at = datetime.utcnow()
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Recorded response for sent grievance letter {letter_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error recording response: {str(e)}")
        raise
