# app/routers/issue_category.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Dict, Any, Optional
from database import get_session
from app.schemas.issue_category_schema import (
    IssueCategoryCreate, 
    IssueCategoryRead, 
    IssueCategoryUpdate,
    IssueCategoryWithCount
)
from app.crud.issue_category_crud import (
    create_issue_category,
    get_all_categories,
    get_category_by_id,
    get_category_by_name,
    update_category,
    delete_category,
    get_top_category_by_issue_count,
    get_categories_with_counts,
    get_category_statistics
)

router = APIRouter(prefix="/issue-categories", tags=["Issue Categories"])

@router.post("/", response_model=IssueCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(category: IssueCategoryCreate, db: Session = Depends(get_session)):
    """
    Create a new issue category
    
    - **name**: Category name (must be unique)
    """
    return create_issue_category(db, category)

@router.get("/", response_model=List[IssueCategoryRead])
def list_categories(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_session)
):
    """
    Get all issue categories with pagination
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    return get_all_categories(db, skip, limit)

@router.get("/name/{category_name}", response_model=IssueCategoryRead)
def get_category_by_name_route(category_name: str, db: Session = Depends(get_session)):
    """Get a category by name"""
    category = get_category_by_name(db, category_name)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )
    return category

@router.get("/with-counts", response_model=List[Dict[str, Any]])
def get_categories_with_issue_counts(
    limit: int = Query(5, ge=1, le=50, description="Number of top categories to return"),
    db: Session = Depends(get_session)
):
    """
    Get top categories with their issue counts for analytics
    
    - **limit**: Number of top categories to return (default: 5)
    """
    return get_categories_with_counts(db, limit)

@router.get("/statistics", response_model=Dict[str, Any])
def get_category_statistics_route(db: Session = Depends(get_session)):
    """Get comprehensive category statistics"""
    return get_category_statistics(db)

@router.get("/top", response_model=IssueCategoryWithCount)
def get_top_category(db: Session = Depends(get_session)):
    """Get the category with the maximum number of issues"""
    result = get_top_category_by_issue_count(db)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No categories found"
        )
    
    return IssueCategoryWithCount(
        id=result['id'],
        name=result['name'],
        issue_count=result['issue_count']
    )

@router.get("/{category_id}", response_model=IssueCategoryRead)
def get_category(
    category_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """Get a specific category by ID"""
    category = get_category_by_id(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )
    return category

@router.put("/{category_id}", response_model=IssueCategoryRead)
def update_category_route(
    category_id: str,  # Fixed: Changed from int to str (UUID)
    category_update: IssueCategoryUpdate, 
    db: Session = Depends(get_session)
):
    """
    Update a category
    
    - Only provided fields will be updated
    - Name must be unique
    """
    updated = update_category(db, category_id, category_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )
    return updated

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category_route(
    category_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session)
):
    """
    Delete a category
    
    - Cannot delete categories with associated issues
    - Returns 204 No Content on success
    """
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Category not found"
        )
    # No content returned for 204