from sqlmodel import Session, select, and_, or_, func, desc, asc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging
from app.models.received_letter import ReceivedLetter, LetterStatus, LetterPriority, LetterCategory
from app.schemas.received_letter_schema import ReceivedLetterCreate, ReceivedLetterUpdate, LetterFilters, LetterStatistics

logger = logging.getLogger(__name__)

def create_received_letter(db: Session, letter_data: ReceivedLetterCreate, user_id: str, tenant_id: Optional[str] = None) -> ReceivedLetter:
    """Create a new received letter"""
    try:
        # Convert to dict and handle tenant_id properly
        letter_dict = letter_data.dict()
        if tenant_id is not None:
            letter_dict['tenant_id'] = tenant_id
        
        # Handle received_date properly
        if not letter_dict.get('received_date'):
            letter_dict['received_date'] = datetime.utcnow()
        
        db_letter = ReceivedLetter(
            **letter_dict,
            created_by=user_id,
            updated_by=user_id
        )
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Created received letter with ID: {db_letter.id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating received letter: {str(e)}")
        raise

def get_received_letter(db: Session, letter_id: int, tenant_id: Optional[str] = None) -> Optional[ReceivedLetter]:
    """Get a specific received letter by ID"""
    try:
        query = select(ReceivedLetter).where(ReceivedLetter.id == letter_id)
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        return db.exec(query).first()
    except Exception as e:
        logger.error(f"Error fetching received letter {letter_id}: {str(e)}")
        raise

def get_all_received_letters(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    tenant_id: Optional[str] = None
) -> List[ReceivedLetter]:
    """Get all received letters with pagination"""
    try:
        query = select(ReceivedLetter)
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        query = query.offset(skip).limit(limit).order_by(desc(ReceivedLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching received letters: {str(e)}")
        raise

def get_filtered_received_letters(
    db: Session, 
    filters: LetterFilters, 
    tenant_id: Optional[str] = None
) -> Dict[str, Any]:
    """Get filtered received letters with pagination"""
    try:
        query = select(ReceivedLetter)
        
        # Apply tenant filter
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        
        # Apply search filter
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.where(
                or_(
                    ReceivedLetter.sender.ilike(search_term),
                    ReceivedLetter.subject.ilike(search_term),
                    ReceivedLetter.content.ilike(search_term),
                    ReceivedLetter.category.ilike(search_term)
                )
            )
        
        # Apply status filter
        if filters.status:
            query = query.where(ReceivedLetter.status == filters.status)
        
        # Apply priority filter
        if filters.priority:
            query = query.where(ReceivedLetter.priority == filters.priority)
        
        # Apply category filter
        if filters.category:
            query = query.where(ReceivedLetter.category == filters.category)
        
        # Apply assigned_to filter
        if filters.assigned_to:
            query = query.where(ReceivedLetter.assigned_to == filters.assigned_to)
        
        # Apply date range filters
        if filters.date_from:
            query = query.where(ReceivedLetter.received_date >= filters.date_from)
        if filters.date_to:
            query = query.where(ReceivedLetter.received_date <= filters.date_to)
        
        # Get total count for pagination
        total_query = select(func.count()).select_from(query.subquery())
        total = db.exec(total_query).first() or 0
        
        # Apply pagination and ordering
        query = query.order_by(desc(ReceivedLetter.created_at))
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
        logger.error(f"Error fetching filtered received letters: {str(e)}")
        raise

def update_received_letter(
    db: Session, 
    letter_id: int, 
    letter_data: ReceivedLetterUpdate, 
    user_id: str,
    tenant_id: Optional[str] = None
) -> Optional[ReceivedLetter]:
    """Update a received letter"""
    try:
        db_letter = get_received_letter(db, letter_id, tenant_id)
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
        logger.info(f"Updated received letter with ID: {letter_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating received letter {letter_id}: {str(e)}")
        raise

def delete_received_letter(db: Session, letter_id: int, tenant_id: Optional[str] = None) -> bool:
    """Delete a received letter"""
    try:
        db_letter = get_received_letter(db, letter_id, tenant_id)
        if not db_letter:
            return False
        
        db.delete(db_letter)
        db.commit()
        logger.info(f"Deleted received letter with ID: {letter_id}")
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting received letter {letter_id}: {str(e)}")
        raise

def get_letter_statistics(db: Session, tenant_id: Optional[str] = None, user_id: Optional[str] = None, user_role: Optional[str] = None) -> LetterStatistics:
    """Get statistics for received letters with role-based filtering"""
    try:
        base_query = select(ReceivedLetter)
        
        # Apply role-based filtering
        if user_role == "super_admin":
            # Super admin sees all letters
            pass
        elif user_role == "admin" and tenant_id:
            # Admin sees letters they created + letters assigned to their Field Agents
            from app.models.user import User
            from app.models.role import Role
            
            # Get Field Agent IDs in the same tenant
            field_agent_ids = db.exec(
                select(User.id).where(
                    and_(
                        User.tenant_id == tenant_id,
                        User.role_id.in_(
                            select(Role.id).where(Role.name == "FieldAgent")
                        )
                    )
                )
            ).all()
            
            # Filter for letters created by admin OR assigned to their Field Agents
            base_query = base_query.where(
                or_(
                    ReceivedLetter.created_by == user_id,
                    ReceivedLetter.assigned_to.in_([str(fa_id) for fa_id in field_agent_ids])
                )
            )
        elif user_role in ["field_agent", "assistant"] and user_id:
            # Field agents see only their assigned letters
            base_query = base_query.where(ReceivedLetter.assigned_to == user_id)
        elif user_role == "regular_user" and user_id:
            # Regular users see only their created letters
            base_query = base_query.where(ReceivedLetter.created_by == user_id)
        elif tenant_id:
            # Fallback to tenant filtering if provided
            base_query = base_query.where(ReceivedLetter.tenant_id == tenant_id)
        
        # Total letters
        total_letters = db.exec(select(func.count()).select_from(base_query.subquery())).first() or 0
        
        # Status counts
        new_letters = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.status == LetterStatus.NEW).subquery()
            )
        ).first() or 0
        
        under_review = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.status == LetterStatus.UNDER_REVIEW).subquery()
            )
        ).first() or 0
        
        replied = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.status == LetterStatus.REPLIED).subquery()
            )
        ).first() or 0
        
        closed = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.status == LetterStatus.CLOSED).subquery()
            )
        ).first() or 0
        
        # Priority counts
        high_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.priority == LetterPriority.HIGH).subquery()
            )
        ).first() or 0
        
        medium_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.priority == LetterPriority.MEDIUM).subquery()
            )
        ).first() or 0
        
        low_priority = db.exec(
            select(func.count()).select_from(
                base_query.where(ReceivedLetter.priority == LetterPriority.LOW).subquery()
            )
        ).first() or 0
        
        # Overdue letters (due_date is past and status is not closed)
        overdue_letters = db.exec(
            select(func.count()).select_from(
                base_query.where(
                    and_(
                        ReceivedLetter.due_date < datetime.utcnow(),
                        ReceivedLetter.status != LetterStatus.CLOSED
                    )
                ).subquery()
            )
        ).first() or 0
        
        return LetterStatistics(
            total_letters=total_letters,
            new_letters=new_letters,
            under_review=under_review,
            replied=replied,
            closed=closed,
            high_priority=high_priority,
            medium_priority=medium_priority,
            low_priority=low_priority,
            overdue_letters=overdue_letters
        )
    except Exception as e:
        logger.error(f"Error fetching letter statistics: {str(e)}")
        raise

def get_letters_by_status(db: Session, status: LetterStatus, tenant_id: Optional[str] = None) -> List[ReceivedLetter]:
    """Get letters by status"""
    try:
        query = select(ReceivedLetter).where(ReceivedLetter.status == status)
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        query = query.order_by(desc(ReceivedLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching letters by status {status}: {str(e)}")
        raise

def get_letters_by_priority(db: Session, priority: LetterPriority, tenant_id: Optional[str] = None) -> List[ReceivedLetter]:
    """Get letters by priority"""
    try:
        query = select(ReceivedLetter).where(ReceivedLetter.priority == priority)
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        query = query.order_by(desc(ReceivedLetter.created_at))
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching letters by priority {priority}: {str(e)}")
        raise

def get_overdue_letters(db: Session, tenant_id: Optional[str] = None) -> List[ReceivedLetter]:
    """Get overdue letters"""
    try:
        query = select(ReceivedLetter).where(
            and_(
                ReceivedLetter.due_date < datetime.utcnow(),
                ReceivedLetter.status != LetterStatus.CLOSED
            )
        )
        if tenant_id:
            query = query.where(ReceivedLetter.tenant_id == tenant_id)
        query = query.order_by(ReceivedLetter.due_date)
        return db.exec(query).all()
    except Exception as e:
        logger.error(f"Error fetching overdue letters: {str(e)}")
        raise

def assign_letter_to_user(db: Session, letter_id: int, user_id: str, assigned_user_id: str, tenant_id: Optional[str] = None) -> Optional[ReceivedLetter]:
    """Assign a letter to a specific user"""
    try:
        db_letter = get_received_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        db_letter.assigned_to = assigned_user_id
        db_letter.updated_at = datetime.utcnow()
        db_letter.updated_by = user_id
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Assigned letter {letter_id} to user {assigned_user_id}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning letter {letter_id} to user {assigned_user_id}: {str(e)}")
        raise

def update_letter_status(db: Session, letter_id: int, status: LetterStatus, user_id: str, tenant_id: Optional[str] = None) -> Optional[ReceivedLetter]:
    """Update letter status"""
    try:
        db_letter = get_received_letter(db, letter_id, tenant_id)
        if not db_letter:
            return None
        
        db_letter.status = status
        db_letter.updated_at = datetime.utcnow()
        db_letter.updated_by = user_id
        
        # If status is replied, set response date
        if status == LetterStatus.REPLIED and not db_letter.response_date:
            db_letter.response_date = datetime.utcnow()
        
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        logger.info(f"Updated letter {letter_id} status to {status}")
        return db_letter
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating letter {letter_id} status to {status}: {str(e)}")
        raise

