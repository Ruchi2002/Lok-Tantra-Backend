"""
Role-based Access Control Middleware
Middleware for checking user permissions and role-based access
"""

from fastapi import HTTPException, status, Depends
from sqlmodel import Session
from typing import Optional, Callable, Any
import logging

from database import get_session
from app.core.auth import get_current_user
from app.models.user import User
from app.utils.role_permissions import role_permissions, Permission

logger = logging.getLogger(__name__)

def require_permission(permission: Permission):
    """
    Dependency decorator to require a specific permission
    
    Usage:
    @router.get("/issues")
    def get_issues(
        current_user: User = Depends(require_permission(Permission.VIEW_ALL_ISSUES))
    ):
        pass
    """
    def permission_checker(current_user: User = Depends(get_current_user)):
        user_role = getattr(current_user, 'role', None)
        if hasattr(user_role, 'name'):
            user_role = user_role.name
        elif not user_role:
            user_role = "assistant"  # Default fallback
        
        if not role_permissions.has_permission(user_role, permission):
            logger.warning(f"Access denied: User {current_user.email} (role: {user_role}) "
                         f"attempted to access endpoint requiring permission: {permission}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        
        return current_user
    
    return permission_checker

def require_role(allowed_roles: list):
    """
    Dependency decorator to require specific roles
    
    Usage:
    @router.get("/admin-only")
    def admin_endpoint(
        current_user: User = Depends(require_role(["admin", "super_admin"]))
    ):
        pass
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        user_role = getattr(current_user, 'role', None)
        if hasattr(user_role, 'name'):
            user_role = user_role.name
        elif not user_role:
            user_role = "assistant"  # Default fallback
        
        # Normalize role names for comparison
        normalized_user_role = role_permissions._normalize_role_name(user_role).value
        allowed_normalized = [role_permissions._normalize_role_name(role).value for role in allowed_roles]
        
        if normalized_user_role not in allowed_normalized:
            logger.warning(f"Access denied: User {current_user.email} (role: {user_role}) "
                         f"attempted to access endpoint requiring roles: {allowed_roles}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        
        return current_user
    
    return role_checker

def check_issue_access(permission_type: str = "view"):
    """
    Dependency decorator to check issue access permissions
    
    Usage:
    @router.put("/issues/{issue_id}")
    def update_issue(
        issue_id: str,
        current_user: User = Depends(check_issue_access("edit")),
        db: Session = Depends(get_session)
    ):
        # Get issue and check access
        issue = get_issue_from_db(issue_id, db)
        if not can_access_issue(current_user, issue, permission_type):
            raise HTTPException(status_code=403, detail="Access denied to this issue")
        pass
    """
    def access_checker(current_user: User = Depends(get_current_user)):
        return current_user
    
    return access_checker

def can_access_issue(user: User, issue: Any, permission_type: str = "view") -> bool:
    """
    Check if a user can access a specific issue based on their role and permissions
    
    Args:
        user: Current authenticated user
        issue: Issue object from database
        permission_type: Type of access ("view", "edit", "delete")
    
    Returns:
        bool: True if user can access the issue, False otherwise
    """
    try:
        user_role = getattr(user, 'role', None)
        if hasattr(user_role, 'name'):
            user_role = user_role.name
        elif not user_role:
            user_role = "assistant"  # Default fallback
        
        # Extract issue properties
        issue_tenant_id = getattr(issue, 'tenant_id', None)
        issue_created_by = getattr(issue, 'created_by', None)
        issue_assigned_to = getattr(issue, 'assigned_to', None)
        user_tenant_id = getattr(user, 'tenant_id', None)
        user_id = str(user.id)
        
        logger.debug(f"Checking {permission_type} access for user {user.email} (role: {user_role}) "
                    f"to issue {getattr(issue, 'id', 'unknown')}")
        
        if permission_type == "view":
            return role_permissions.can_view_issues(
                user_role, issue_tenant_id, user_tenant_id
            )
        elif permission_type == "edit":
            return role_permissions.can_edit_issue(
                user_role, issue_tenant_id, user_tenant_id, 
                issue_created_by, issue_assigned_to, user_id
            )
        elif permission_type == "delete":
            return role_permissions.can_delete_issue(
                user_role, issue_tenant_id, user_tenant_id,
                issue_created_by, issue_assigned_to, user_id
            )
        else:
            logger.warning(f"Unknown permission type: {permission_type}")
            return False
            
    except Exception as e:
        logger.error(f"Error checking issue access: {e}")
        return False

def get_accessible_issues_query(user: User, db: Session):
    """
    Get a database query that returns only issues the user can access
    
    Args:
        user: Current authenticated user
        db: Database session
    
    Returns:
        SQLModel query object filtered by user permissions
    """
    try:
        from sqlmodel import select
        from app.models.citizen_issues import CitizenIssue
        
        user_role = getattr(user, 'role', None)
        if hasattr(user_role, 'name'):
            user_role = user_role.name
        elif not user_role:
            user_role = "assistant"  # Default fallback
        
        user_tenant_id = getattr(user, 'tenant_id', None)
        user_id = str(user.id)
        
        # Build query based on role
        if role_permissions.has_permission(user_role, Permission.VIEW_ALL_ISSUES):
            # Super Admin can see all issues
            return select(CitizenIssue)
        
        elif role_permissions.has_permission(user_role, Permission.VIEW_TENANT_ISSUES):
            # Admin can see all issues in their tenant
            if user_tenant_id:
                return select(CitizenIssue).where(CitizenIssue.tenant_id == user_tenant_id)
            else:
                # No tenant assigned, return empty query
                return select(CitizenIssue).where(CitizenIssue.id == None)
        
        elif role_permissions.has_permission(user_role, Permission.VIEW_ASSIGNED_ISSUES):
            # Field Agent/Assistant can see issues they created or are assigned to
            return select(CitizenIssue).where(
                (CitizenIssue.created_by == user_id) | 
                (CitizenIssue.assigned_to == user_id)
            )
        
        elif role_permissions.has_permission(user_role, Permission.VIEW_OWN_ISSUES):
            # Regular users can only see issues they created
            return select(CitizenIssue).where(CitizenIssue.created_by == user_id)
        
        else:
            # No permissions, return empty query
            return select(CitizenIssue).where(CitizenIssue.id == None)
            
    except Exception as e:
        logger.error(f"Error building accessible issues query: {e}")
        # Return empty query on error
        from sqlmodel import select
        from app.models.citizen_issues import CitizenIssue
        return select(CitizenIssue).where(CitizenIssue.id == None)

# Convenience functions for common permission checks
def require_super_admin():
    """Require super admin role"""
    return require_role(["super_admin"])

def require_admin():
    """Require admin role (tenant admin or super admin)"""
    return require_role(["admin", "super_admin"])

def require_field_agent():
    """Require field agent role"""
    return require_role(["field_agent", "admin", "super_admin"])

def require_issue_view():
    """Require permission to view issues"""
    return require_permission(Permission.VIEW_ALL_ISSUES)

def require_issue_create():
    """Require permission to create issues"""
    return require_permission(Permission.CREATE_ISSUES)

def require_issue_edit():
    """Require permission to edit issues"""
    return require_permission(Permission.EDIT_ALL_ISSUES)

def require_issue_delete():
    """Require permission to delete issues"""
    return require_permission(Permission.DELETE_ALL_ISSUES)
