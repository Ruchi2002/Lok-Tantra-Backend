# app/crud/issue_category_crud.py
from sqlmodel import Session, select, func
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from app.models.Issue_category import IssueCategory
from app.models.citizen_issues import CitizenIssue
from app.schemas.issue_category_schema import IssueCategoryCreate, IssueCategoryUpdate

def create_issue_category(db: Session, category: IssueCategoryCreate) -> IssueCategory:
    """Create a new issue category"""
    try:
        # Check if category with same name already exists
        existing_category = db.exec(
            select(IssueCategory).where(IssueCategory.name == category.name)
        ).first()
        
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category with this name already exists"
            )

        # Create category instance
        new_category = IssueCategory(name=category.name)
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(e)}"
        )

def get_all_categories(db: Session, skip: int = 0, limit: int = 100) -> List[IssueCategory]:
    """Get all issue categories with pagination"""
    try:
        return db.exec(select(IssueCategory).offset(skip).limit(limit)).all()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )

def get_category_by_id(db: Session, category_id: str) -> Optional[IssueCategory]:  # Fixed: Changed from int to str (UUID)
    """Get a category by ID"""
    try:
        return db.get(IssueCategory, category_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category: {str(e)}"
        )

def get_category_by_name(db: Session, name: str) -> Optional[IssueCategory]:
    """Get a category by name"""
    try:
        return db.exec(select(IssueCategory).where(IssueCategory.name == name)).first()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category by name: {str(e)}"
        )

def update_category(db: Session, category_id: str, category_update: IssueCategoryUpdate) -> Optional[IssueCategory]:  # Fixed: Changed from int to str (UUID)
    """Update a category"""
    try:
        db_category = db.get(IssueCategory, category_id)
        if not db_category:
            return None
        
        # Check for name conflicts if updating
        update_data = category_update.model_dump(exclude_unset=True)
        
        if "name" in update_data and update_data["name"] != db_category.name:
            existing_category = get_category_by_name(db, update_data["name"])
            if existing_category and existing_category.id != category_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Category with this name already exists"
                )
        
        # Apply updates
        for key, value in update_data.items():
            setattr(db_category, key, value)
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category: {str(e)}"
        )

def delete_category(db: Session, category_id: str) -> bool:  # Fixed: Changed from int to str (UUID)
    """Delete a category"""
    try:
        db_category = db.get(IssueCategory, category_id)
        if not db_category:
            return False
        
        # Check if category has associated issues
        issue_count = db.exec(
            select(func.count(CitizenIssue.id))
            .where(CitizenIssue.category_id == category_id)
        ).first()
        
        if issue_count and issue_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete category with {issue_count} associated issues"
            )
        
        db.delete(db_category)
        db.commit()
        return True
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        )

def get_top_category_by_issue_count(db: Session) -> Optional[Dict[str, Any]]:
    """Get the category with the maximum number of issues"""
    try:
        result = db.exec(
            select(
                IssueCategory.id,
                IssueCategory.name,
                func.count(CitizenIssue.id).label('issue_count')
            )
            .outerjoin(CitizenIssue, IssueCategory.id == CitizenIssue.category_id)
            .group_by(IssueCategory.id, IssueCategory.name)
            .order_by(func.count(CitizenIssue.id).desc())
            .limit(1)
        ).first()
        
        if result:
            return {
                'id': result[0],
                'name': result[1],
                'issue_count': result[2]
            }
        return None
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching top category: {str(e)}"
        )

def get_categories_with_counts(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    """Get top categories with their issue counts for the frontend component"""
    try:
        results = db.exec(
            select(
                IssueCategory.id,
                IssueCategory.name,
                func.count(CitizenIssue.id).label('issue_count')
            )
            .outerjoin(CitizenIssue, IssueCategory.id == CitizenIssue.category_id)
            .group_by(IssueCategory.id, IssueCategory.name)
            .having(func.count(CitizenIssue.id) > 0)  # Only categories with issues
            .order_by(func.count(CitizenIssue.id).desc())
            .limit(limit)
        ).all()
        
        return [
            {
                'id': result[0],
                'name': result[1],
                'issue_count': result[2]
            }
            for result in results
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories with counts: {str(e)}"
        )

def get_category_statistics(db: Session) -> Dict[str, Any]:
    """Get comprehensive category statistics"""
    try:
        # Total categories
        total_categories = db.exec(select(func.count(IssueCategory.id))).first()
        
        # Categories with issues
        categories_with_issues = db.exec(
            select(func.count(IssueCategory.id))
            .outerjoin(CitizenIssue, IssueCategory.id == CitizenIssue.category_id)
            .group_by(IssueCategory.id)
            .having(func.count(CitizenIssue.id) > 0)
        ).all()
        
        # Top 5 categories by issue count
        top_categories = get_categories_with_counts(db, 5)
        
        return {
            'total_categories': total_categories or 0,
            'categories_with_issues': len(categories_with_issues),
            'top_categories': top_categories
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching category statistics: {str(e)}"
        )