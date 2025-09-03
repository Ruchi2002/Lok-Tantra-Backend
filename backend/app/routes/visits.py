# Fixed visit_routes.py

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, text
import traceback

from database import get_session
from app.schemas.visit_schema import VisitCreate, VisitRead, VisitUpdate
from app.crud.visit_crud import (
    create_visit, get_all_visits, get_visit_by_id, update_visit, delete_visit,
    list_eligible_issues, list_assistants, get_visit_stats, get_issue_stats
)

router = APIRouter(prefix="/visits", tags=["Visits"])

# ✅ Fixed: Move locations endpoint BEFORE the parameterized routes
@router.get("/locations", response_model=List[str])
def get_visit_locations_route(db: Session = Depends(get_session)):
    """Get unique locations from citizen_issues for the AreaSelector dropdown"""
    try:
        # Use text() for raw SQL to avoid SQLModel issues
        result = db.exec(text("""
            SELECT DISTINCT location
            FROM citizen_issues
            WHERE location IS NOT NULL AND location != ''
            ORDER BY location
        """))
        locations = [row[0] for row in result]
        return locations
    except Exception as e:
        print("🔥 Error in /visits/locations:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching locations: {str(e)}")
    


# ✅ Fixed: Move eligible-issues endpoint BEFORE parameterized routes
@router.get("/eligible-issues", response_model=List[dict])
def eligible_issues_route(db: Session = Depends(get_session)):
    """Return minimal data for dropdown: id, title, priority, location, assigned_to"""
    try:
        issues = list_eligible_issues(db)
        return [
            {
                "id": i.id,
                "title": i.title,
                "priority": i.priority,
                "location": i.location,
                "assigned_to": i.assigned_to,
            }
            for i in issues
        ]
    except Exception as e:
        print("🔥 Error in /visits/eligible-issues:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching eligible issues: {str(e)}")

# ✅ Fixed: Move assistants endpoint BEFORE parameterized routes
@router.get("/assistants", response_model=List[dict])
def assistants_route(db: Session = Depends(get_session)):
    """Get all users with Assistant role for dropdown"""
    try:
        users = list_assistants(db)
        return [{"id": u.id, "name": u.name, "email": u.email} for u in users]
    except Exception as e:
        print("🔥 Error in /visits/assistants:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching assistants: {str(e)}")

# ✅ Fixed: Remove duplicate stats endpoint, keep only one
@router.get("/stats")
def visit_stats_route(db: Session = Depends(get_session)):
    """Get visit and issue statistics"""
    try:
        visit_stats = get_visit_stats(db)
        issue_stats = get_issue_stats(db)
        
        # Combine both stats
        return {
            **visit_stats,
            **issue_stats
        }
    except Exception as e:
        print("🔥 Error in /visits/stats:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

# ✅ Main CRUD endpoints (these should come AFTER the specific endpoints)
@router.post("/", response_model=VisitRead, status_code=status.HTTP_201_CREATED)
def create_visit_route(visit_in: VisitCreate, db: Session = Depends(get_session)):
    """Create a new visit"""
    try:
        return create_visit(db, visit_in)
    except Exception as e:
        print("🔥 Error creating visit:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating visit: {str(e)}")

@router.get("/", response_model=List[VisitRead])
def read_visits_route(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    """Get all visits with pagination"""
    try:
        return get_all_visits(db, skip, limit)
    except Exception as e:
        print("🔥 Error fetching visits:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching visits: {str(e)}")

@router.get("/{visit_id}", response_model=VisitRead)
def read_visit_route(visit_id: int, db: Session = Depends(get_session)):
    """Get a specific visit by ID"""
    return get_visit_by_id(db, visit_id)

@router.put("/{visit_id}", response_model=VisitRead)
def update_visit_route(visit_id: int, visit_update: VisitUpdate, db: Session = Depends(get_session)):
    """Update a specific visit"""
    try:
        return update_visit(db, visit_id, visit_update)
    except Exception as e:
        print("🔥 Error updating visit:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error updating visit: {str(e)}")

@router.delete("/{visit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visit_route(visit_id: int, db: Session = Depends(get_session)):
    """Delete a specific visit"""
    if not delete_visit(db, visit_id):
        raise HTTPException(status_code=404, detail="Visit not found")