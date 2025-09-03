# app/crud/citizen_issues_crud.py - FIXED VERSION
from sqlmodel import Session, select
from typing import List, Optional
import logging
from app.models.citizen_issues import CitizenIssue
from app.schemas.citizen_issues_schema import CitizenIssueCreate, CitizenIssueUpdate
from app.utils.geo import generate_citizen_issue_geojson, geojson_to_string, validate_coordinates
from app.utils.geo import get_coordinates
from fastapi import HTTPException, status
from app.models.user import User

# Setup logging
logger = logging.getLogger(__name__)

# Valid status and priority values - consider moving to config/constants
VALID_STATUSES = ["Open", "In Progress", "Pending", "Resolved"]
VALID_PRIORITIES = ["Low", "Medium", "High", "Urgent"]

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

def validate_status(status: str) -> str:
    """Validate and normalize status value"""
    if not status:
        return "Open"
    
    status = status.strip()
    if status not in VALID_STATUSES:
        raise ValidationError(f"Status '{status}' is not valid. Allowed values: {', '.join(VALID_STATUSES)}")
    
    return status

def validate_priority(priority: str) -> str:
    """Validate and normalize priority value"""
    if not priority:
        return "Medium"
    
    priority = priority.strip()
    if priority not in VALID_PRIORITIES:
        raise ValidationError(f"Priority '{priority}' is not valid. Allowed values: {', '.join(VALID_PRIORITIES)}")
    
    return priority

def get_user_by_name_or_id(db: Session, identifier: Optional[str]) -> Optional[User]:
    """Get user by name or ID with proper error handling"""
    if not identifier:
        return None
    
    try:
        # Try to parse as UUID first
        import uuid
        try:
            user_id = str(uuid.UUID(identifier))
            user = db.get(User, user_id)
            if user:
                return user
        except ValueError:
            pass  # Not a valid UUID, try name
        
        # Try to find by name
        user = db.exec(select(User).where(User.name == identifier)).first()
        return user
        
    except Exception as e:
        logger.error(f"Error finding user with identifier '{identifier}': {e}")
        return None

def generate_geojson_for_issue(
    issue: CitizenIssue, 
    db: Session, 
    assigned_user: Optional[User] = None
) -> Optional[str]:
    """Generate GeoJSON data for an issue with proper error handling"""
    try:
        if not (issue.latitude and issue.longitude):
            logger.debug(f"Issue {issue.id} has no coordinates, skipping GeoJSON generation")
            return None
        
        if not validate_coordinates(issue.latitude, issue.longitude):
            logger.warning(f"Issue {issue.id} has invalid coordinates")
            return None
        
        # Get assistant name
        assistant_name = "Unassigned"
        if assigned_user:
            assistant_name = assigned_user.name
        elif issue.assigned_to:
            try:
                user = db.get(User, issue.assigned_to)
                assistant_name = user.name if user else "Unassigned"
            except Exception as e:
                logger.warning(f"Error fetching assigned user {issue.assigned_to}: {e}")
        
        # Generate GeoJSON
        geojson = generate_citizen_issue_geojson(
            lat=issue.latitude,
            lon=issue.longitude,
            title=issue.title or "Untitled",
            description=issue.description or "",
            issue_id=issue.id,
            priority=issue.priority or "Medium",
            status=issue.status or "Open",
            location=issue.location or "",
            assistant=assistant_name,
            visit_date=issue.created_at.isoformat() if issue.created_at else None
        )
        
        return geojson_to_string(geojson)
        
    except Exception as e:
        logger.error(f"Error generating GeoJSON for issue {issue.id}: {e}")
        return None

def create_citizen_issue(db: Session, issue_in: CitizenIssueCreate) -> CitizenIssue:
    """Create a new citizen issue with comprehensive validation and error handling"""
    try:
        issue_data = issue_in.model_dump()
        logger.info(f"Creating citizen issue with data: {issue_data.get('title', 'Untitled')}")

        # --- Validate required fields ---
        if not issue_data.get("tenant_id"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="tenant_id is required"
            )

        # --- Status validation ---
        try:
            issue_data["status"] = validate_status(issue_data.get("status"))
        except ValidationError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

        # --- Priority validation ---
        try:
            issue_data["priority"] = validate_priority(issue_data.get("priority"))
        except ValidationError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

        # --- Handle assigned_to (convert name to ID) ---
        assigned_to_name = issue_data.pop("assigned_to", None)
        assigned_user = None
        
        if assigned_to_name:
            assigned_user = get_user_by_name_or_id(db, assigned_to_name)
            if not assigned_user:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                    detail=f"Assigned user '{assigned_to_name}' does not exist"
                )
            issue_data["assigned_to"] = assigned_user.id
        else:
            issue_data["assigned_to"] = None

        # --- Get coordinates from location if not provided ---
        if issue_data.get("location") and not (issue_data.get("latitude") and issue_data.get("longitude")):
            try:
                lat, lon = get_coordinates(issue_data["location"])
                if lat and lon:
                    issue_data["latitude"] = lat
                    issue_data["longitude"] = lon
                    logger.info(f"Got coordinates for location '{issue_data['location']}': {lat}, {lon}")
            except Exception as e:
                logger.warning(f"Could not get coordinates for location '{issue_data['location']}': {e}")

        # --- Create the issue first (without GeoJSON) ---
        db_issue = CitizenIssue(**issue_data)
        db.add(db_issue)
        db.commit()
        db.refresh(db_issue)
        
        logger.info(f"Created citizen issue with ID: {db_issue.id}")
        
        # --- Generate and update GeoJSON with the actual issue ID ---
        try:
            geojson_data = generate_geojson_for_issue(db_issue, db, assigned_user)
            if geojson_data:
                db_issue.geojson_data = geojson_data
                db.add(db_issue)
                db.commit()
                db.refresh(db_issue)
                logger.debug(f"Updated GeoJSON for issue {db_issue.id}")
        except Exception as e:
            logger.warning(f"Could not generate GeoJSON for issue {db_issue.id}: {e}")
        
        return db_issue

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating citizen issue: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create citizen issue"
        )

def get_citizen_issue(db: Session, issue_id: str) -> Optional[CitizenIssue]:
    """Get a citizen issue by ID with proper error handling"""
    try:
        return db.get(CitizenIssue, issue_id)
    except Exception as e:
        logger.error(f"Error fetching citizen issue {issue_id}: {e}")
        return None

def get_all_citizen_issues(db: Session, skip: int = 0, limit: int = 100) -> List[CitizenIssue]:
    """Get all citizen issues with pagination and error handling"""
    try:
        # Validate pagination parameters
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 1000:  # Reasonable max limit
            limit = 100
            
        return db.exec(select(CitizenIssue).offset(skip).limit(limit)).all()
    except Exception as e:
        logger.error(f"Error fetching citizen issues: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch citizen issues"
        )

def update_citizen_issue(db: Session, issue_id: str, issue_update: CitizenIssueUpdate) -> Optional[CitizenIssue]:
    """Update a citizen issue with comprehensive validation and error handling"""
    try:
        db_issue = db.get(CitizenIssue, issue_id)
        if not db_issue:
            logger.warning(f"Citizen issue {issue_id} not found for update")
            return None

        issue_data = issue_update.model_dump(exclude_unset=True)
        logger.info(f"Updating citizen issue {issue_id} with data: {list(issue_data.keys())}")
        
        # --- Validate status if provided ---
        if "status" in issue_data:
            try:
                issue_data["status"] = validate_status(issue_data["status"])
            except ValidationError as e:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        
        # --- Validate priority if provided ---
        if "priority" in issue_data:
            try:
                issue_data["priority"] = validate_priority(issue_data["priority"])
            except ValidationError as e:
                raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
        
        # --- Handle assigned_to ---
        assigned_user = None
        if "assigned_to" in issue_data:
            if issue_data["assigned_to"]:
                assigned_user = get_user_by_name_or_id(db, issue_data["assigned_to"])
                if not assigned_user:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
                        detail=f"Assigned user '{issue_data['assigned_to']}' does not exist"
                    )
                issue_data["assigned_to"] = assigned_user.id
            else:
                # Explicit None to unassign
                issue_data["assigned_to"] = None
        
        # --- Get coordinates from location if location updated ---
        if "location" in issue_data and issue_data["location"]:
            if not issue_data.get("latitude") and not issue_data.get("longitude"):
                try:
                    lat, lon = get_coordinates(issue_data["location"])
                    if lat and lon:
                        issue_data["latitude"] = lat
                        issue_data["longitude"] = lon
                        logger.info(f"Updated coordinates for location '{issue_data['location']}': {lat}, {lon}")
                except Exception as e:
                    logger.warning(f"Could not get coordinates for updated location '{issue_data['location']}': {e}")

        # --- Apply updates ---
        for key, value in issue_data.items():
            setattr(db_issue, key, value)
        
        db.add(db_issue)
        db.commit()
        db.refresh(db_issue)
        
        # --- Regenerate GeoJSON if coordinates or other relevant data changed ---
        coordinate_fields = ["latitude", "longitude", "location"]
        relevant_fields = coordinate_fields + ["title", "description", "priority", "status", "assigned_to"]
        
        if any(field in issue_data for field in relevant_fields):
            try:
                geojson_data = generate_geojson_for_issue(db_issue, db, assigned_user)
                if geojson_data:
                    db_issue.geojson_data = geojson_data
                    db.add(db_issue)
                    db.commit()
                    db.refresh(db_issue)
                    logger.debug(f"Regenerated GeoJSON for updated issue {db_issue.id}")
            except Exception as e:
                logger.warning(f"Could not regenerate GeoJSON for updated issue {db_issue.id}: {e}")
        
        logger.info(f"Successfully updated citizen issue {issue_id}")
        return db_issue

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error updating citizen issue {issue_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update citizen issue"
        )

def delete_citizen_issue(db: Session, issue_id: str) -> bool:
    """Delete a citizen issue by ID with proper error handling"""
    try:
        db_issue = db.get(CitizenIssue, issue_id)
        if not db_issue:
            logger.warning(f"Citizen issue {issue_id} not found for deletion")
            return False
        
        db.delete(db_issue)
        db.commit()
        logger.info(f"Successfully deleted citizen issue {issue_id}")
        return True
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting citizen issue {issue_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete citizen issue"
        )

def get_citizen_issues_geojson(db: Session, skip: int = 0, limit: int = 100) -> dict:
    """Get all citizen issues as a GeoJSON FeatureCollection with proper error handling"""
    try:
        from app.utils.geo import generate_geojson_collection
        
        # Validate pagination parameters
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 1000:
            limit = 100
        
        # Get all issues with coordinates
        issues = db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.latitude.isnot(None))
            .where(CitizenIssue.longitude.isnot(None))
            .offset(skip)
            .limit(limit)
        ).all()
        
        logger.info(f"Found {len(issues)} issues with coordinates for GeoJSON")
        
        features = []
        
        for issue in issues:
            try:
                # Skip issues without valid coordinates
                if not (issue.latitude and issue.longitude):
                    continue
                    
                if not validate_coordinates(issue.latitude, issue.longitude):
                    logger.warning(f"Issue {issue.id} has invalid coordinates, skipping")
                    continue
                
                # Get assistant name safely
                assistant_name = "Unassigned"
                if issue.assigned_to:
                    try:
                        user = db.get(User, issue.assigned_to)
                        assistant_name = user.name if user else "Unassigned"
                    except Exception as e:
                        logger.warning(f"Error fetching assigned user {issue.assigned_to} for issue {issue.id}: {e}")
                
                # Generate fresh GeoJSON feature with all required fields
                geojson_feature = generate_citizen_issue_geojson(
                    lat=issue.latitude,
                    lon=issue.longitude,
                    title=issue.title or "Untitled",
                    description=issue.description or "",
                    issue_id=issue.id,
                    priority=issue.priority or "Medium",
                    status=issue.status or "Open",
                    location=issue.location or "",
                    assistant=assistant_name,
                    visit_date=issue.created_at.isoformat() if issue.created_at else None
                )
                
                features.append(geojson_feature)
                
            except Exception as e:
                logger.warning(f"Error processing issue {issue.id} for GeoJSON: {e}")
                continue
        
        geojson_collection = generate_geojson_collection(features)
        logger.info(f"Generated GeoJSON collection with {len(features)} features")
        
        return geojson_collection
        
    except Exception as e:
        logger.error(f"Error generating GeoJSON collection: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate GeoJSON data"
        )

def get_unique_locations(db: Session) -> List[str]:
    """Get unique locations from all citizen issues"""
    try:
        locations = db.exec(
            select(CitizenIssue.location)
            .distinct()
            .where(CitizenIssue.location.isnot(None))
            .where(CitizenIssue.location != "")
        ).all()
        
        # Filter out None/empty and sort
        unique_locations = sorted(list(set([loc for loc in locations if loc and loc.strip()])))
        
        logger.info(f"Found {len(unique_locations)} unique locations")
        return unique_locations
        
    except Exception as e:
        logger.error(f"Error fetching unique locations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch unique locations"
        )

def get_issues_by_status(db: Session, status_filter: str, skip: int = 0, limit: int = 100) -> List[CitizenIssue]:
    """Get citizen issues filtered by status"""
    try:
        # Validate status
        if status_filter not in VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status '{status_filter}'. Valid statuses: {', '.join(VALID_STATUSES)}"
            )
        
        # Validate pagination
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 1000:
            limit = 100
        
        issues = db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.status == status_filter)
            .offset(skip)
            .limit(limit)
        ).all()
        
        logger.info(f"Found {len(issues)} issues with status '{status_filter}'")
        return issues
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching issues by status '{status_filter}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch issues by status"
        )

def get_issues_by_priority(db: Session, priority_filter: str, skip: int = 0, limit: int = 100) -> List[CitizenIssue]:
    """Get citizen issues filtered by priority"""
    try:
        # Validate priority
        if priority_filter not in VALID_PRIORITIES:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid priority '{priority_filter}'. Valid priorities: {', '.join(VALID_PRIORITIES)}"
            )
        
        # Validate pagination
        if skip < 0:
            skip = 0
        if limit <= 0 or limit > 1000:
            limit = 100
        
        issues = db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.priority == priority_filter)
            .offset(skip)
            .limit(limit)
        ).all()
        
        logger.info(f"Found {len(issues)} issues with priority '{priority_filter}'")
        return issues
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching issues by priority '{priority_filter}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch issues by priority"
        )

def get_issues_statistics(db: Session) -> dict:
    """Get basic statistics about citizen issues"""
    try:
        # Get total count
        total_issues = len(db.exec(select(CitizenIssue)).all())
        
        # Get counts by status
        status_counts = {}
        for status_value in VALID_STATUSES:
            count = len(db.exec(select(CitizenIssue).where(CitizenIssue.status == status_value)).all())
            status_counts[status_value] = count
        
        # Get counts by priority
        priority_counts = {}
        for priority_value in VALID_PRIORITIES:
            count = len(db.exec(select(CitizenIssue).where(CitizenIssue.priority == priority_value)).all())
            priority_counts[priority_value] = count
        
        # Get assigned vs unassigned
        assigned_count = len(db.exec(select(CitizenIssue).where(CitizenIssue.assigned_to.isnot(None))).all())
        unassigned_count = total_issues - assigned_count
        
        # Get issues with coordinates
        with_coordinates = len(db.exec(
            select(CitizenIssue)
            .where(CitizenIssue.latitude.isnot(None))
            .where(CitizenIssue.longitude.isnot(None))
        ).all())
        
        stats = {
            "total_issues": total_issues,
            "status_distribution": status_counts,
            "priority_distribution": priority_counts,
            "assignment_distribution": {
                "assigned": assigned_count,
                "unassigned": unassigned_count
            },
            "location_data": {
                "with_coordinates": with_coordinates,
                "without_coordinates": total_issues - with_coordinates
            }
        }
        
        logger.info(f"Generated statistics for {total_issues} citizen issues")
        return stats
        
    except Exception as e:
        logger.error(f"Error generating citizen issues statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate statistics"
        )