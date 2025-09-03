# app/routes/citizen_issue_routes.py - FIXED VERSION
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, and_, or_
from typing import List, Optional
from datetime import datetime
import logging
from database import get_session
from app.core.auth import get_current_user

from app.schemas.citizen_issues_schema import CitizenIssueCreate, CitizenIssueRead, CitizenIssueUpdate
from app.crud.citizen_issues_crud import (
    create_citizen_issue, get_citizen_issue, get_all_citizen_issues, 
    update_citizen_issue, delete_citizen_issue, get_citizen_issues_geojson
)
from app.models.citizen_issues import CitizenIssue
from app.models.user import User
from app.models.Issue_category import IssueCategory
from app.models.area import Area

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/citizen-issues", tags=["Citizen Issues"])

class SecurityError(Exception):
    """Custom exception for security-related errors"""
    pass

def get_user_role_name(user: User) -> str:
    """Safely get user role name with proper error handling"""
    try:
        logger.debug(f"Getting role for user {user.id} ({user.email})")
        
        # Try different ways to access role
        if hasattr(user, 'role') and user.role:
            if hasattr(user.role, 'name'):
                role_name = user.role.name
                logger.debug(f"Role found via user.role.name: {role_name}")
                return role_name
            elif isinstance(user.role, str):
                role_name = user.role
                logger.debug(f"Role found as string: {role_name}")
                return role_name
        
        # Fallback: check if role is stored as a string field
        if hasattr(user, 'role_name'):
            role_name = user.role_name
            logger.debug(f"Role found via role_name field: {role_name}")
            return role_name
            
        # Default role for users without explicit role
        logger.warning(f"No role found for user {user.id}, defaulting to 'assistant'")
        return "assistant"
        
    except Exception as e:
        logger.error(f"Error getting user role for user {user.id}: {e}")
        return "assistant"  # Safe fallback

def check_issue_access(user: User, issue: CitizenIssue) -> bool:
    """Check if user has access to a specific issue based on role and ownership"""
    try:
        user_role = get_user_role_name(user)
        
        if user_role == "super_admin":
            return True
        
        elif user_role in ["tenant", "tenant_admin"]:
            # Tenant users can only access issues from their tenant
            if not hasattr(user, 'tenant_id') or not user.tenant_id:
                logger.warning(f"Tenant user {user.id} has no tenant_id")
                return False
            
            # For now, allow access (proper tenant filtering should be done at query level)
            # In a full implementation, you'd need to join with User table to check creator's tenant
            return True
        
        elif user_role in ["assistant", "FieldAgent"]:
            # Assistants and FieldAgents can access issues they created
            # Also allow access if they are assigned to the issue
            if issue.created_by == user.id:
                logger.debug(f"User {user.id} created issue {issue.id} - access granted")
                return True
            elif hasattr(issue, 'assigned_to') and issue.assigned_to == user.id:
                logger.debug(f"User {user.id} is assigned to issue {issue.id} - access granted")
                return True
            else:
                logger.debug(f"User {user.id} has no access to issue {issue.id} (created_by: {issue.created_by}, assigned_to: {getattr(issue, 'assigned_to', None)})")
                return False
        
        logger.warning(f"Unknown role '{user_role}' for user {user.id}")
        return False
        
    except Exception as e:
        logger.error(f"Error checking issue access: {e}")
        return False

def get_filtered_query(current_user: User, base_query=None):
    """Get properly filtered query based on user role - SECURE VERSION"""
    if base_query is None:
        base_query = select(CitizenIssue)
    
    user_role = get_user_role_name(current_user)
    logger.debug(f"Applying security filter for role: {user_role}")
    
    if user_role == "super_admin":
        logger.debug("Super admin - no filter applied")
        return base_query
    
    elif user_role in ["tenant", "tenant_admin"]:
        # Tenant users see only issues from their tenant
        if not hasattr(current_user, 'tenant_id') or not current_user.tenant_id:
            logger.error(f"Tenant user {current_user.id} has no tenant_id - denying access")
            raise SecurityError("User has no valid tenant assignment")
        
        logger.debug(f"Tenant filter - showing issues from tenant_id: {current_user.tenant_id}")
        # Join with User table to filter by creator's tenant
        return (
            select(CitizenIssue)
            .join(User, CitizenIssue.created_by == User.id)
            .where(User.tenant_id == current_user.tenant_id)
        )
    
    elif user_role == "assistant":
        logger.debug(f"Assistant filter - showing issues created by user_id: {current_user.id}")
        return base_query.where(CitizenIssue.created_by == current_user.id)
    
    else:
        logger.error(f"Unknown role '{user_role}' - denying access")
        raise SecurityError(f"Access denied for role: {user_role}")

def transform_issue_for_frontend(issue: CitizenIssue, db: Session) -> dict:
    """Transform backend issue data to frontend-expected format with proper error handling"""
    try:
        # Use model_dump() for SQLModel objects
        if hasattr(issue, 'model_dump'):
            issue_dict = issue.model_dump()
        else:
            issue_dict = {k: v for k, v in issue.__dict__.items() if not k.startswith('_')}
        
        # Core mappings with fallbacks
        issue_dict["issue"] = issue_dict.get("title", "Untitled Issue")
        
        # Format date consistently
        if hasattr(issue, 'created_at') and issue.created_at:
            issue_dict["date"] = issue.created_at.strftime("%d %b %Y")
        else:
            issue_dict["date"] = datetime.now().strftime("%d %b %Y")
        
        # Handle priority with validation
        priority_name = getattr(issue, 'priority', 'Medium') or "Medium"
        if priority_name not in ["Low", "Medium", "High", "Urgent"]:
            priority_name = "Medium"
        issue_dict["priority"] = priority_name
        issue_dict["priority_label"] = priority_name
        
        # Handle status with validation
        status_name = getattr(issue, 'status', 'Open') or "Open"
        if status_name not in ["Open", "In Progress", "Pending", "Resolved"]:
            status_name = "Open"
        issue_dict["status"] = status_name
        issue_dict["status_label"] = status_name
        
        # Get assistant name safely
        assistant_name = "Unassigned"
        if hasattr(issue, 'assigned_to') and issue.assigned_to:
            try:
                assistant = db.get(User, issue.assigned_to)
                if assistant and hasattr(assistant, 'name'):
                    assistant_name = assistant.name
            except Exception as e:
                logger.warning(f"Error fetching assigned user {issue.assigned_to}: {e}")
                
        issue_dict["assistant"] = assistant_name
        issue_dict["assigned_to"] = assistant_name
        
        # Get category name safely
        category_name = "General"
        if hasattr(issue, 'category_id') and issue.category_id:
            try:
                category = db.get(IssueCategory, issue.category_id)
                if category and hasattr(category, 'name'):
                    category_name = category.name
            except Exception as e:
                logger.warning(f"Error fetching category {issue.category_id}: {e}")
        
        issue_dict["category"] = category_name
        issue_dict["category_id"] = getattr(issue, 'category_id', None)
        
        # Get area name safely
        area_name = "Unassigned"
        if hasattr(issue, 'area_id') and issue.area_id:
            try:
                area = db.get(Area, issue.area_id)
                if area and hasattr(area, 'name'):
                    area_name = area.name
            except Exception as e:
                logger.warning(f"Error fetching area {issue.area_id}: {e}")
        
        issue_dict["area"] = area_name
        issue_dict["area_id"] = getattr(issue, 'area_id', None)
        
        # Add frontend-expected fields
        issue_dict["visitDate"] = None
        issue_dict["visitTime"] = None
        
        # Ensure required fields exist
        required_fields = ["id", "title", "description", "location"]
        for field in required_fields:
            if field not in issue_dict:
                issue_dict[field] = getattr(issue, field, "" if field != "id" else "")
        
        return issue_dict
        
    except Exception as e:
        logger.error(f"Error transforming issue {getattr(issue, 'id', 'unknown')}: {e}")
        # Return minimal viable object
        return {
            "id": getattr(issue, 'id', ''),
            "title": getattr(issue, 'title', 'Error Loading Issue'),
            "issue": getattr(issue, 'title', 'Error Loading Issue'),
            "description": getattr(issue, 'description', ''),
            "location": getattr(issue, 'location', ''),
            "priority": "Medium",
            "priority_label": "Medium",
            "status": "Open",
            "status_label": "Open",
            "assistant": "Unassigned",
            "assigned_to": "Unassigned",
            "area": "Unassigned",
            "area_id": None,
            "date": datetime.now().strftime("%d %b %Y"),
            "category": "General",
            "category_id": None,
            "visitDate": None,
            "visitTime": None
        }

# ===== ENHANCED ENDPOINTS FOR FULL FRONTEND INTEGRATION =====

@router.get("/categories", response_model=List[dict])
def get_issue_categories(db: Session = Depends(get_session)):
    """Get all issue categories for frontend dropdown"""
    try:
        categories = db.exec(select(IssueCategory)).all()
        return [
            {
                "id": cat.id,
                "name": cat.name,
                "description": getattr(cat, 'description', '')
            }
            for cat in categories
        ]
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch categories"
        )

@router.get("/areas", response_model=List[dict])
def get_areas(db: Session = Depends(get_session)):
    """Get all areas for frontend dropdown"""
    try:
        areas = db.exec(select(Area)).all()
        return [
            {
                "id": area.id,
                "name": area.name,
                "description": getattr(area, 'description', '')
            }
            for area in areas
        ]
    except Exception as e:
        logger.error(f"Error fetching areas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch areas"
        )

@router.get("/users", response_model=List[dict])
def get_available_users(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get available users for assignment based on user role"""
    try:
        user_role = get_user_role_name(current_user)
        
        if user_role == "super_admin":
            # Super admin can see all users
            users = db.exec(select(User)).all()
        elif user_role in ["tenant", "tenant_admin"]:
            # Tenant users can only see users from their tenant
            if not hasattr(current_user, 'tenant_id') or not current_user.tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tenant assignment"
                )
            users = db.exec(
                select(User).where(User.tenant_id == current_user.tenant_id)
            ).all()
        else:
            # Other roles can only see themselves
            users = [current_user]
        
        return [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": get_user_role_name(user)
            }
            for user in users
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@router.get("/filtered", response_model=List[dict])
def get_filtered_citizen_issues(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    area_id: Optional[str] = Query(None, description="Filter by area ID"),
    assigned_to: Optional[str] = Query(None, description="Filter by assigned user ID"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Get filtered citizen issues with advanced filtering"""
    try:
        # Start with base query
        query = get_filtered_query(current_user)
        
        # Apply filters
        conditions = []
        
        if status:
            conditions.append(CitizenIssue.status == status)
        
        if priority:
            conditions.append(CitizenIssue.priority == priority)
        
        if category_id:
            conditions.append(CitizenIssue.category_id == category_id)
        
        if area_id:
            conditions.append(CitizenIssue.area_id == area_id)
        
        if assigned_to:
            conditions.append(CitizenIssue.assigned_to == assigned_to)
        
        if search:
            search_condition = or_(
                CitizenIssue.title.ilike(f"%{search}%"),
                CitizenIssue.description.ilike(f"%{search}%"),
                CitizenIssue.location.ilike(f"%{search}%")
            )
            conditions.append(search_condition)
        
        # Apply all conditions
        if conditions:
            query = query.where(and_(*conditions))
        
        # Add pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        issues = db.exec(query).all()
        
        # Transform for frontend
        transformed_issues = []
        for issue in issues:
            try:
                transformed = transform_issue_for_frontend(issue, db)
                transformed_issues.append(transformed)
            except Exception as transform_error:
                logger.error(f"Error transforming issue {issue.id}: {transform_error}")
                continue
        
        return transformed_issues
        
    except SecurityError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching filtered issues: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch filtered issues"
        )

@router.post("/bulk-update", response_model=dict)
def bulk_update_issues(
    issue_ids: List[str],
    updates: dict,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple issues with proper validation"""
    try:
        # Validate updates parameter
        if not isinstance(updates, dict):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Updates must be a dictionary"
            )
        
        # Define allowed fields for bulk updates
        allowed_fields = {
            'status', 'priority', 'assigned_to', 'category_id', 
            'area_id', 'action_taken'
        }
        
        # Validate that only allowed fields are being updated
        invalid_fields = set(updates.keys()) - allowed_fields
        if invalid_fields:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid fields for bulk update: {', '.join(invalid_fields)}. Allowed fields: {', '.join(allowed_fields)}"
            )
        
        # Validate field values
        if 'status' in updates and updates['status'] not in ["Open", "In Progress", "Pending", "Resolved"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status: {updates['status']}. Allowed values: Open, In Progress, Pending, Resolved"
            )
        
        if 'priority' in updates and updates['priority'] not in ["Low", "Medium", "High", "Urgent"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid priority: {updates['priority']}. Allowed values: Low, Medium, High, Urgent"
            )
        
        user_role = get_user_role_name(current_user)
        updated_count = 0
        failed_count = 0
        
        for issue_id in issue_ids:
            try:
                issue = db.get(CitizenIssue, issue_id)
                if not issue:
                    failed_count += 1
                    continue
                
                # Check access
                if not check_issue_access(current_user, issue):
                    failed_count += 1
                    continue
                
                # Apply updates
                for field, value in updates.items():
                    if hasattr(issue, field):
                        setattr(issue, field, value)
                
                db.add(issue)
                updated_count += 1
                
            except Exception as e:
                logger.error(f"Error updating issue {issue_id}: {e}")
                failed_count += 1
        
        db.commit()
        
        return {
            "message": "Bulk update completed",
            "updated_count": updated_count,
            "failed_count": failed_count,
            "total_processed": len(issue_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk update: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk update"
        )

@router.delete("/bulk-delete", response_model=dict)
def bulk_delete_issues(
    issue_ids: List[str],
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Bulk delete multiple issues"""
    try:
        user_role = get_user_role_name(current_user)
        deleted_count = 0
        failed_count = 0
        
        for issue_id in issue_ids:
            try:
                issue = db.get(CitizenIssue, issue_id)
                if not issue:
                    failed_count += 1
                    continue
                
                # Check access (only creator or super admin can delete)
                if user_role != "super_admin" and issue.created_by != current_user.id:
                    failed_count += 1
                    continue
                
                db.delete(issue)
                deleted_count += 1
                
            except Exception as e:
                logger.error(f"Error deleting issue {issue_id}: {e}")
                failed_count += 1
        
        db.commit()
        
        return {
            "message": "Bulk delete completed",
            "deleted_count": deleted_count,
            "failed_count": failed_count,
            "total_processed": len(issue_ids)
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error in bulk delete: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk delete"
        )

# ===== EXISTING ENDPOINTS =====

@router.post("/", response_model=CitizenIssueRead, status_code=status.HTTP_201_CREATED)
def create_citizen_issue_route(
    issue_in: CitizenIssueCreate, 
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Create a new citizen issue - automatically assigns creator"""
    logger.info(f"Creating citizen issue for user: {getattr(current_user, 'email', 'No email')}")
    logger.info(f"User object type: {type(current_user)}")
    logger.info(f"User object attributes: {dir(current_user)}")
    logger.info(f"User ID: {getattr(current_user, 'id', 'No ID')}")
    logger.info(f"Received issue data: {issue_in.model_dump()}")
    
    try:
        # Ensure the issue is created by the current user
        issue_data = issue_in.model_dump()
        issue_data['created_by'] = current_user.id
        
        logger.info(f"User tenant_id: {getattr(current_user, 'tenant_id', 'Not set')}")
        logger.info(f"User role_id: {getattr(current_user, 'role_id', 'Not set')}")
        
        # Handle tenant_id - make it optional for users without tenant
        if hasattr(current_user, 'tenant_id') and current_user.tenant_id:
            issue_data['tenant_id'] = current_user.tenant_id
            logger.info(f"Using user's tenant_id: {current_user.tenant_id}")
        else:
            # Check if user has a role that requires tenant assignment
            user_role = get_user_role_name(current_user)
            logger.info(f"User role determined: {user_role}")
            
            if user_role in ["tenant", "tenant_admin"]:
                # These roles must have a tenant
                logger.error(f"User {current_user.id} has role {user_role} but no tenant_id")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tenant assignment required for this user role"
                )
            elif user_role == "super_admin":
                # Super admin can create issues without tenant (system-wide issues)
                logger.info(f"Super admin {current_user.id} creating system-wide issue")
                # For super admin, we need to create a system-wide tenant or use a default
                from app.models.tenant import Tenant
                system_tenant = db.exec(select(Tenant).where(Tenant.name == "System")).first()
                
                if not system_tenant:
                    # Create a system tenant if it doesn't exist
                    system_tenant = Tenant(
                        name="System",
                        email="system@admin.com",
                        password="system_password_hash_placeholder"  # This should be properly hashed in production
                    )
                    db.add(system_tenant)
                    db.commit()
                    db.refresh(system_tenant)
                    logger.info(f"Created system tenant {system_tenant.id}")
                
                issue_data['tenant_id'] = system_tenant.id
            else:
                # For assistants and other roles, try to find a default tenant
                from app.models.tenant import Tenant
                default_tenant = db.exec(select(Tenant).where(Tenant.name == "System Default")).first()
                
                if not default_tenant:
                    # Try to find any tenant
                    any_tenant = db.exec(select(Tenant).where(Tenant.name == "System Default")).first()
                    if any_tenant:
                        logger.info(f"Using existing tenant {any_tenant.id} for user {current_user.id}")
                        issue_data['tenant_id'] = any_tenant.id
                    else:
                        logger.error(f"No tenants found in database")
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No tenant assignment available. Please contact administrator."
                        )
                else:
                    issue_data['tenant_id'] = default_tenant.id
                    logger.info(f"Using default tenant {default_tenant.id} for user {current_user.id}")
        
        logger.info(f"Final issue data before creation: {issue_data}")
        
        # Ensure tenant_id is set
        if not issue_data.get('tenant_id'):
            logger.error(f"No tenant_id available for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tenant assignment required. Please contact administrator."
            )
        
        # Create the issue using only the fields expected by CitizenIssueCreate
        create_data = {
            'title': issue_data['title'],
            'description': issue_data.get('description'),
            'location': issue_data.get('location'),
            'latitude': issue_data.get('latitude'),
            'longitude': issue_data.get('longitude'),
            'status': issue_data.get('status'),
            'priority': issue_data.get('priority'),
            'assigned_to': issue_data.get('assigned_to'),
            'category_id': issue_data.get('category_id'),
            'area_id': issue_data.get('area_id'),
            'action_taken': issue_data.get('action_taken'),
            'tenant_id': issue_data['tenant_id'],  # Now guaranteed to exist
            'created_by': current_user.id  # Add the created_by field
        }
        
        logger.info(f"Create data for CitizenIssueCreate: {create_data}")
        
        # Create the issue
        created_issue = create_citizen_issue(db, CitizenIssueCreate(**create_data))
        
        logger.info(f"Successfully created issue with ID: {created_issue.id}")
        logger.info(f"Issue created_by: {created_issue.created_by}")
        logger.info(f"Current user ID: {current_user.id}")
        
        # Verify access (defense in depth)
        logger.info(f"Checking access for user {current_user.id} to issue {created_issue.id}")
        if not check_issue_access(current_user, created_issue):
            logger.error(f"Access denied to created issue {created_issue.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied to created issue"
            )
        
        logger.info(f"Access granted, transforming issue for frontend")
        transformed_issue = transform_issue_for_frontend(created_issue, db)
        logger.info(f"Successfully transformed issue, returning response")
        return transformed_issue
        
    except SecurityError as e:
        logger.error(f"Security error creating issue: {e}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        logger.error(f"Validation error creating issue: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating citizen issue: {e}", exc_info=True)
        logger.error(f"Error type: {type(e)}")
        logger.error(f"Error details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to create citizen issue: {str(e)}"
        )

@router.get("/", response_model=List[CitizenIssueRead])
def read_all_citizen_issues_route(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
):
    """Get all citizen issues without authentication - PUBLIC ENDPOINT"""
    logger.info(f"Fetching citizen issues (public access)")
    
    try:
        # Get all issues without filtering
        issues = db.exec(select(CitizenIssue).offset(skip).limit(limit)).all()
        
        logger.info(f"Found {len(issues)} citizen issues")

        # Transform each issue for frontend
        transformed_issues = []
        for issue in issues:
            try:
                transformed = transform_issue_for_frontend(issue, db)
                transformed_issues.append(transformed)
            except Exception as transform_error:
                logger.error(f"Error transforming issue {issue.id}: {transform_error}")
                continue

        logger.info(f"Returning {len(transformed_issues)} transformed issues")
        return transformed_issues

    except Exception as e:
        logger.error(f"Unexpected error fetching citizen issues: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch citizen issues"
        )

# Test and health endpoints
@router.get("/test-auth")
def test_auth_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)  # Fixed: Use proper dependency injection
):
    """Test endpoint to verify authentication and role-based access"""
    try:
        user_role = get_user_role_name(current_user)
        
        # Test query to see how many issues this user can access
        query = get_filtered_query(current_user)
        issues = db.exec(query).all()
        issue_count = len(issues)
        
        return {
            "message": "Authentication successful!",
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "role": user_role,
                "tenant_id": getattr(current_user, 'tenant_id', None)
            },
            "access_info": {
                "accessible_issues_count": issue_count,
                "access_level": user_role
            }
        }
    except SecurityError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error(f"Error in test auth endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/debug/create-issue")
def debug_create_issue_endpoint(
    db: Session = Depends(get_session)
):
    """Debug endpoint to test issue creation without authentication"""
    try:
        # Check if required tables exist
        from app.models.tenant import Tenant
        from app.models.user import User
        
        # Check tenants
        tenants = db.exec(select(Tenant)).all()
        logger.info(f"Found {len(tenants)} tenants in database")
        
        # Check users
        users = db.exec(select(User)).all()
        logger.info(f"Found {len(users)} users in database")
        
        # Try to create a simple tenant if none exists
        if not tenants:
            logger.info("No tenants found, creating default tenant")
            default_tenant = Tenant(
                name="Default",
                email="default@example.com",
                password="default_password_hash"
            )
            db.add(default_tenant)
            db.commit()
            db.refresh(default_tenant)
            logger.info(f"Created default tenant: {default_tenant.id}")
            tenants = [default_tenant]
        
        return {
            "message": "Debug info",
            "tenants_count": len(tenants),
            "users_count": len(users),
            "default_tenant_id": tenants[0].id if tenants else None
        }
        
    except Exception as e:
        logger.error(f"Error in debug endpoint: {e}", exc_info=True)
        return {
            "error": str(e),
            "error_type": type(e).__name__
        }

@router.get("/{issue_id}", response_model=CitizenIssueRead)
def get_citizen_issue_route(
    issue_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session),
):
    """Get a specific citizen issue - PUBLIC ENDPOINT"""
    logger.info(f"Fetching citizen issue {issue_id} (public access)")
    
    try:
        # Get the issue
        issue = db.get(CitizenIssue, issue_id)
        if not issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Citizen Issue not found"
            )
        
        return transform_issue_for_frontend(issue, db)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching citizen issue {issue_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch citizen issue"
        )

@router.put("/{issue_id}", response_model=CitizenIssueRead)
def update_citizen_issue_route(
    issue_id: str,  # Fixed: Changed from int to str (UUID)
    issue_update: CitizenIssueUpdate, 
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Update a citizen issue with access control"""
    logger.info(f"Updating citizen issue {issue_id} for user: {current_user.email}")
    
    try:
        # Get the existing issue first
        existing_issue = db.get(CitizenIssue, issue_id)
        if not existing_issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Citizen Issue not found"
            )
        
        # Check access
        if not check_issue_access(current_user, existing_issue):
            logger.warning(f"Access denied to update issue {issue_id} for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied to this issue"
            )
        
        # Update the issue
        updated_issue = update_citizen_issue(db, issue_id, issue_update)
        if not updated_issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Citizen Issue not found"
            )
        
        return transform_issue_for_frontend(updated_issue, db)
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating issue {issue_id}: {e}")
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error updating citizen issue {issue_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to update citizen issue"
        )

@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_citizen_issue_route(
    issue_id: str,  # Fixed: Changed from int to str (UUID)
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Delete a citizen issue with access control"""
    logger.info(f"Deleting citizen issue {issue_id} for user: {current_user.email}")
    
    try:
        # Get the existing issue first
        existing_issue = db.get(CitizenIssue, issue_id)
        if not existing_issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Citizen Issue not found"
            )
        
        # Check access (only allow deletion by creator or super admin)
        user_role = get_user_role_name(current_user)
        if user_role != "super_admin" and existing_issue.created_by != current_user.id:
            logger.warning(f"Deletion denied for issue {issue_id} by user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Only the creator or super admin can delete this issue"
            )
        
        success = delete_citizen_issue(db, issue_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Citizen Issue not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error deleting citizen issue {issue_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to delete citizen issue"
        )

@router.get("/geojson/all", response_model=dict)
def get_citizen_issues_geojson_route(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_session),
):
    """Get citizen issues as GeoJSON FeatureCollection - PUBLIC ENDPOINT"""
    logger.info(f"Fetching GeoJSON data (public access)")
    
    try:
        # Get all issues without filtering
        issues = db.exec(select(CitizenIssue).offset(skip).limit(limit)).all()
        
        # Convert to GeoJSON format
        features = []
        for issue in issues:
            try:
                if (hasattr(issue, 'latitude') and hasattr(issue, 'longitude') 
                    and issue.latitude and issue.longitude):
                    
                    # Get assistant name safely
                    assistant_name = "Unassigned"
                    if issue.assigned_to:
                        try:
                            assistant = db.get(User, issue.assigned_to)
                            assistant_name = assistant.name if assistant else "Unassigned"
                        except Exception:
                            pass
                    
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [float(issue.longitude), float(issue.latitude)]
                        },
                        "properties": {
                            "id": issue.id,
                            "title": issue.title or "Untitled",
                            "description": issue.description or "",
                            "status": issue.status or "Open",
                            "priority": issue.priority or "Medium",
                            "location": issue.location or "",
                            "assistant": assistant_name,
                            "category": "General",  # Default for now
                            "date": issue.created_at.strftime("%d %b %Y") if issue.created_at else "",
                            "created_at": issue.created_at.isoformat() if issue.created_at else None
                        }
                    }
                    features.append(feature)
            except Exception as e:
                logger.warning(f"Error processing issue {issue.id} for GeoJSON: {e}")
                continue
        
        geojson_result = {
            "type": "FeatureCollection",
            "features": features
        }
        
        logger.info(f"GeoJSON fetch successful - {len(features)} features")
        return geojson_result
        
    except SecurityError as e:
        logger.error(f"Security error fetching GeoJSON: {e}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error fetching GeoJSON: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch GeoJSON"
        )

@router.get("/locations", response_model=List[str])
def get_unique_locations_route(
    db: Session = Depends(get_session),
):
    """Get unique locations - PUBLIC ENDPOINT"""
    logger.info(f"Fetching unique locations (public access)")
    
    try:
        # Get all unique locations without filtering
        results = db.exec(
            select(CitizenIssue.location)
            .distinct()
            .where(CitizenIssue.location.isnot(None))
            .where(CitizenIssue.location != "")
        ).all()
        
        # Remove duplicates and sort
        unique_locations = sorted(list(set([location for location in results if location])))
        
        logger.info(f"Found {len(unique_locations)} unique locations")
        return unique_locations
        
    except Exception as e:
        logger.error(f"Unexpected error fetching locations: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch locations"
        )

@router.get("/health", response_model=dict)
def citizen_issues_health_check(db: Session = Depends(get_session)):
    """Health check endpoint for citizen issues API"""
    try:
        # Count total issues
        total_issues = db.exec(select(CitizenIssue)).all()
        
        # Count categories
        try:
            total_categories = db.exec(select(IssueCategory)).all()
        except Exception:
            total_categories = []
        
        # Count users
        total_users = db.exec(select(User)).all()
        
        return {
            "status": "healthy",
            "total_issues": len(total_issues),
            "total_categories": len(total_categories),
            "total_users": len(total_users),
            "message": "Citizen Issues API is working",
            "sample_issues": [
                {
                    "id": issue.id,
                    "title": issue.title,
                    "status": issue.status,
                    "created_by": issue.created_by
                }
                for issue in total_issues[:3]  # Show first 3 issues
            ] if total_issues else []
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return {
            "status": "error",
            "error": str(e),
            "message": "Citizen Issues API has issues"
        }

# Create a separate public router for endpoints that don't need authentication
public_router = APIRouter(prefix="/citizen-issues-public", tags=["Citizen Issues - Public"])
@public_router.get("/health", response_model=dict)
def public_health_check(db: Session = Depends(get_session)):
    """Public health check endpoint without authentication"""
    try:
        # Simple database connectivity test
        result = db.exec(select(CitizenIssue).limit(1)).first()
        
        return {
            "status": "success",
            "message": "Database connection successful",
            "database_accessible": True
        }
    except Exception as e:
        logger.error(f"Public health check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Database connection failed",
            "database_accessible": False
        }
