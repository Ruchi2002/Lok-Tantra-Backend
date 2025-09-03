from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from app.models.sent_letter import SentLetter, SentLetterStatus, SentLetterPriority, SentLetterCategory
from app.schemas.sent_letter_schema import SentLetterCreate, SentLetterUpdate, SentLetterFilters, SentLetterStatistics

logger = logging.getLogger(__name__)

def create_sent_letter(db: Session, letter_data: SentLetterCreate, user_id: int, tenant_id: Optional[int] = None) -> SentLetter:
    """Create a new sent letter"""
    try:
        # Convert to dict and handle tenant_id properly
        letter_dict = letter_data.dict()
        if tenant_id is not None:
            letter_dict['tenant_id'] = tenant_id
        
        # Handle sent_date properly
        if not letter_dict.get('sent_date'):
            letter_dict['sent_date'] = datetime.utcnow()
        
        db_letter = SentLetter(
            **letter_dict,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Created sent letter with ID: {db_letter.id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating sent letter: {str(e)}")
        raise

def get_sent_letter(db: Session, letter_id: int, tenant_id: Optional[int] = None) -> Optional[SentLetter]:
    """Get a specific sent letter by ID"""
    try:
        query = select(SentLetter).where(SentLetter.id == letter_id)
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        return db.exec(query).first()
    except Exception as e:
        logger.error(f"Error fetching sent letter {letter_id}: {str(e)}")
        raise

def get_all_sent_letters(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    tenant_id: Optional[int] = None
) -> List[SentLetter]:
    """Get all sent letters with pagination"""
    try:
        query = select(SentLetter)
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        query = query.offset(skip).limit(limit).order_by(desc(SentLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent letters: {str(e)}")
        raise

def get_filtered_sent_letters(
    db: Session, 
    filters: SentLetterFilters, 
    tenant_id: Optional[int] = None
) -> Dict[str, Any]:
    """Get filtered sent letters with pagination"""
    try:
        query = select(SentLetter)
        
        # Apply tenant filter
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        
        # Apply search filter
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    SentLetter.recipient_name.ilike(search_term),
                    SentLetter.recipient_organization.ilike(search_term),
                    SentLetter.subject.ilike(search_term),
                    SentLetter.content.ilike(search_term),
                    SentLetter.category.ilike(search_term)
                )
            )
        
        # Apply status filter
        if filters.status:
            query = query.where(SentLetter.status == filters.status)
        
        # Apply priority filter
        if filters.priority:
            query = query.where(SentLetter.priority == filters.priority)
        
        # Apply category filter
        if filters.category:
            query = query.where(SentLetter.category == filters.category)
        
        # Apply assigned_to filter
        if filters.assigned_to:
            query = query.where(SentLetter.assigned_to == filters.assigned_to)
        
        # Apply date range filters
        if filters.date_from:
            query = query.where(SentLetter.sent_date >= filters.date_from)
        if filters.date_to:
            query = query.where(SentLetter.sent_date <= filters.date_to)
        
        # Get total count for pagination
        total_query = select(func.count()).select_from(query.subquery())
        total = db.exec(total_query).first() or 0
        
        # Apply pagination and ordering
        query = query.order_by(desc(SentLetter.created_at))
        query = query.offset((filters.page - 1) * filters.per_page).limit(filters.per_page)
        
        letters = db.exec(query).all()
        
        total_pages = (total + filters.per_page - 1) // filters.per_page
        
        return {
            "letters": letters,
            "total": total,
            "page": filters.page,
            "per_page": filters.per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error fetching filtered sent letters: {str(e)}")
        raise

def update_sent_letter(
    db: Session, 
    letter_id: int, 
    letter_data: SentLetterUpdate, 
    user_id: int,
    tenant_id: Optional[int] = None
) -> Optional[SentLetter]:
    """Update a sent letter"""
    try:
        db_letter = get_sent_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        update_data = letter_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        update_data["updated_by"] = user_id
        
        for field, value in update_data.items():
            setattr(db_letter, field, value)
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Updated sent letter with ID: {letter_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sent letter {letter_id}: {str(e)}")
        raise

def delete_sent_letter(db: Session, letter_id: int, tenant_id: Optional[int] = None) -> bool:
    """Delete a sent letter"""
    try:
        db_letter = get_sent_letter(db, letter_id, tenant_id)
        if not db_letter:
            return False
        
        db.delete(db_letter)
        db.commit()
        logger.info(f"Deleted sent letter with ID: {letter_id}")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting sent letter {letter_id}: {str(e)}")
        raise

def get_sent_letter_statistics(db: Session, tenant_id: Optional[int] = None) -> SentLetterStatistics:
    """Get statistics for sent letters"""
    try:
        base_query = select(SentLetter)
        if tenant_id:
            base_query = base_query.where(SentLetter.tenant_id == tenant_id)
        
        # Total letters
        total_letters = db.exec(select(func.count()).select_from(base_query.subquery())).first() or 0
        
        # Status counts
        awaiting_response = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.status == SentLetterStatus.AWAITING_RESPONSE).subquery()
            )
        ).first() or 0
        
        response_received = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.status == SentLetterStatus.RESPONSE_RECEIVED).subquery()
            )
        ).first() or 0
        
        closed = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.status == SentLetterStatus.CLOSED).subquery()
            )
        ).first() or 0
        
        # Priority counts
        high_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.priority == SentLetterPriority.HIGH).subquery()
            )
        ).first() or 0
        
        medium_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.priority == SentLetterPriority.MEDIUM).subquery()
            )
        ).first() or 0
        
        low_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(SentLetter.priority == SentLetterPriority.LOW).subquery()
            )
        ).first() or 0
        
        # Overdue follow-ups (follow_up_date is past and status is not closed)
        overdue_followups = db.exec(
            select(func.count()).select_from(
                base_query.where(
                    and_(
                        SentLetter.follow_up_date < datetime.utcnow(),
                        SentLetter.status != SentLetterStatus.CLOSED
                    )
                ).subquery()
            )
        ).first() or 0
        
        # Follow-ups due this week
        week_from_now = datetime.utcnow() + timedelta(days=7)
        followups_due_this_week = db.exec(
            select(func.count()).select_from(
                base_query.where(
                    and_(
                        SentLetter.follow_up_date >= datetime.utcnow(),
                        SentLetter.follow_up_date <= week_from_now,
                        SentLetter.status != SentLetterStatus.CLOSED
                    )
                ).subquery()
            )
        ).first() or 0
        
        return SentLetterStatistics(
            total_letters=total_letters,
            awaiting_response=awaiting_response,
            response_received=response_received,
            closed=closed,
            high_priority=high_priority,
            medium_priority=medium_priority,
            low_priority=low_priority,
            overdue_followups=overdue_followups,
            followups_due_this_week=followups_due_this_week
        )
    except Exception as e:
        logger.error(f"Error fetching sent letter statistics: {str(e)}")
        raise

def get_sent_letters_by_status(db: Session, status: SentLetterStatus, tenant_id: Optional[int] = None) -> List[SentLetter]:
    """Get sent letters by status"""
    try:
        query = select(SentLetter).where(SentLetter.status == status)
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        query = query.order_by(desc(SentLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent letters by status {status}: {str(e)}")
        raise

def get_sent_letters_by_priority(db: Session, priority: SentLetterPriority, tenant_id: Optional[int] = None) -> List[SentLetter]:
    """Get sent letters by priority"""
    try:
        query = select(SentLetter).where(SentLetter.priority == priority)
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        query = query.order_by(desc(SentLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching sent letters by priority {priority}: {str(e)}")
        raise

def get_overdue_followups(db: Session, tenant_id: Optional[int] = None) -> List[SentLetter]:
    """Get sent letters with overdue follow-ups"""
    try:
        query = select(SentLetter).where(
            and_(
                SentLetter.follow_up_date < datetime.utcnow(),
                SentLetter.status != SentLetterStatus.CLOSED
            )
        )
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        query = query.order_by(SentLetter.follow_up_date)
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching overdue followups: {str(e)}")
        raise

def get_followups_due_this_week(db: Session, tenant_id: Optional[int] = None) -> List[SentLetter]:
    """Get sent letters with follow-ups due this week"""
    try:
        week_from_now = datetime.utcnow() + timedelta(days=7)
        query = select(SentLetter).where(
            and_(
                SentLetter.follow_up_date >= datetime.utcnow(),
                SentLetter.follow_up_date <= week_from_now,
                SentLetter.status != SentLetterStatus.CLOSED
            )
        )
        if tenant_id:
            query = query.where(SentLetter.tenant_id == tenant_id)
        query = query.order_by(SentLetter.follow_up_date)
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching followups due this week: {str(e)}")
        raise

def assign_sent_letter_to_user(db: Session, letter_id: int, user_id: int, assigned_user_id: int, tenant_id: Optional[int] = None) -> Optional[SentLetter]:
    """Assign a sent letter to a specific user"""
    try:
        db_letter = get_sent_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        db_letter.assigned_to = assigned_user_id
        db_letter.updated_at = datetime.utcnow()
        db_letter.updated_by = user_id
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Assigned sent letter {letter_id} to user {assigned_user_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning sent letter {letter_id} to user {assigned_user_id}: {str(e)}")
        raise

def update_sent_letter_status(db: Session, letter_id: int, status: SentLetterStatus, user_id: int, tenant_id: Optional[int] = None) -> Optional[SentLetter]:
    """Update sent letter status"""
    try:
        db_letter = get_sent_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        db_letter.status = status
        db_letter.updated_at = datetime.utcnow()
        db_letter.updated_by = user_id
        
        # If status is response received, set response received date
        if status == SentLetterStatus.RESPONSE_RECEIVED and not db_letter.response_received_date:
            db_letter.response_received_date = datetime.utcnow()
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Updated sent letter {letter_id} status to {status}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sent letter {letter_id} status to {status}: {str(e)}")
        raise

def record_response_received(db: Session, letter_id: int, response_content: str, user_id: int, tenant_id: Optional[int] = None) -> Optional[SentLetter]:
    """Record that a response was received for a sent letter"""
    try:
        db_letter = get_sent_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        db_letter.status = SentLetterStatus.RESPONSE_RECEIVED
        db_letter.response_content = response_content
        db_letter.response_received_date = datetime.utcnow()
        db_letter.updated_at = datetime.utcnow()
        db_letter.updated_by = user_id
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Recorded response received for sent letter {letter_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error recording response for sent letter {letter_id}: {str(e)}")
        raise
