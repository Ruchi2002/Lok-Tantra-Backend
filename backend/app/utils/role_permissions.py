"""
Role-Based Access Control (RBAC) Utilities
Centralized permission management for the Smart Politician Assistant backend
"""

from enum import Enum
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class Permission(str, Enum):
    """Permission enumeration for the system"""
    # Issue permissions
    VIEW_ALL_ISSUES = "view_all_issues"
    VIEW_TENANT_ISSUES = "view_tenant_issues"
    VIEW_OWN_ISSUES = "view_own_issues"
    VIEW_ASSIGNED_ISSUES = "view_assigned_issues"
    
    CREATE_ISSUES = "create_issues"
    EDIT_ALL_ISSUES = "edit_all_issues"
    EDIT_TENANT_ISSUES = "edit_tenant_issues"
    EDIT_OWN_ISSUES = "edit_own_issues"
    EDIT_ASSIGNED_ISSUES = "edit_assigned_issues"
    
    DELETE_ALL_ISSUES = "delete_all_issues"
    DELETE_TENANT_ISSUES = "delete_tenant_issues"
    DELETE_OWN_ISSUES = "delete_own_issues"
    DELETE_ASSIGNED_ISSUES = "delete_assigned_issues"
    
    # Letter permissions
    VIEW_ALL_LETTERS = "view_all_letters"
    VIEW_TENANT_LETTERS = "view_tenant_letters"
    VIEW_OWN_LETTERS = "view_own_letters"
    VIEW_ASSIGNED_LETTERS = "view_assigned_letters"
    
    CREATE_LETTERS = "create_letters"
    EDIT_ALL_LETTERS = "edit_all_letters"
    EDIT_TENANT_LETTERS = "edit_tenant_letters"
    EDIT_OWN_LETTERS = "edit_own_letters"
    EDIT_ASSIGNED_LETTERS = "edit_assigned_letters"
    
    DELETE_ALL_LETTERS = "delete_all_letters"
    DELETE_TENANT_LETTERS = "delete_tenant_letters"
    DELETE_OWN_LETTERS = "delete_own_letters"
    DELETE_ASSIGNED_LETTERS = "delete_assigned_letters"
    
    MANAGE_LETTER_ASSIGNMENTS = "manage_letter_assignments"
    
    # User management permissions
    MANAGE_ALL_USERS = "manage_all_users"
    MANAGE_TENANT_USERS = "manage_tenant_users"
    MANAGE_ASSISTANTS = "manage_assistants"
    
    # Tenant permissions
    SWITCH_TENANTS = "switch_tenants"
    VIEW_ALL_TENANTS = "view_all_tenants"
    
    # Meeting permissions
    VIEW_ALL_MEETINGS = "view_all_meetings"
    VIEW_TENANT_MEETINGS = "view_tenant_meetings"
    VIEW_ASSIGNED_MEETINGS = "view_assigned_meetings"
    EDIT_ALL_MEETINGS = "edit_all_meetings"
    EDIT_TENANT_MEETINGS = "edit_tenant_meetings"
    EDIT_ASSIGNED_MEETINGS = "edit_assigned_meetings"
    DELETE_ALL_MEETINGS = "delete_all_meetings"
    DELETE_TENANT_MEETINGS = "delete_tenant_meetings"
    DELETE_ASSIGNED_MEETINGS = "delete_assigned_meetings"
    CREATE_MEETINGS = "create_meetings"

class UserRole(str, Enum):
    """User role enumeration"""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    FIELD_AGENT = "field_agent"
    ASSISTANT = "assistant"
    REGULAR_USER = "regular_user"

class RolePermissions:
    """Role-based permission management class"""
    
    def __init__(self):
        """Initialize role permissions mapping"""
        self._role_permissions: Dict[str, List[Permission]] = {
            UserRole.SUPER_ADMIN: [
                Permission.VIEW_ALL_ISSUES,
                Permission.CREATE_ISSUES,
                Permission.EDIT_ALL_ISSUES,
                Permission.DELETE_ALL_ISSUES,
                Permission.VIEW_ALL_LETTERS,
                Permission.CREATE_LETTERS,
                Permission.EDIT_ALL_LETTERS,
                Permission.DELETE_ALL_LETTERS,
                Permission.MANAGE_LETTER_ASSIGNMENTS,
                Permission.MANAGE_ALL_USERS,
                Permission.SWITCH_TENANTS,
                Permission.VIEW_ALL_TENANTS,
                Permission.VIEW_ALL_MEETINGS,
                Permission.EDIT_ALL_MEETINGS,
                Permission.DELETE_ALL_MEETINGS,
                Permission.CREATE_MEETINGS
            ],
            
            UserRole.ADMIN: [
                Permission.VIEW_TENANT_ISSUES,
                Permission.CREATE_ISSUES,
                Permission.EDIT_TENANT_ISSUES,
                Permission.DELETE_TENANT_ISSUES,
                Permission.VIEW_TENANT_LETTERS,
                Permission.CREATE_LETTERS,
                Permission.EDIT_TENANT_LETTERS,
                Permission.DELETE_TENANT_LETTERS,
                Permission.MANAGE_LETTER_ASSIGNMENTS,
                Permission.MANAGE_TENANT_USERS,
                Permission.MANAGE_ASSISTANTS,
                Permission.VIEW_TENANT_MEETINGS,
                Permission.EDIT_TENANT_MEETINGS,
                Permission.DELETE_TENANT_MEETINGS,
                Permission.CREATE_MEETINGS
            ],
            
            UserRole.FIELD_AGENT: [
                Permission.VIEW_ASSIGNED_ISSUES,
                Permission.CREATE_ISSUES,
                Permission.EDIT_ASSIGNED_ISSUES,
                Permission.DELETE_ASSIGNED_ISSUES,
                Permission.VIEW_ASSIGNED_LETTERS,
                Permission.CREATE_LETTERS,
                Permission.EDIT_ASSIGNED_LETTERS,
                Permission.DELETE_ASSIGNED_LETTERS,
                Permission.VIEW_ASSIGNED_MEETINGS,
                Permission.EDIT_ASSIGNED_MEETINGS,
                Permission.DELETE_ASSIGNED_MEETINGS
            ],
            
            UserRole.ASSISTANT: [
                Permission.VIEW_ASSIGNED_ISSUES,
                Permission.CREATE_ISSUES,
                Permission.EDIT_ASSIGNED_ISSUES,
                Permission.DELETE_ASSIGNED_ISSUES,
                Permission.VIEW_ASSIGNED_LETTERS,
                Permission.CREATE_LETTERS,
                Permission.EDIT_ASSIGNED_LETTERS,
                Permission.DELETE_ASSIGNED_LETTERS,
                Permission.VIEW_ASSIGNED_MEETINGS,
                Permission.EDIT_ASSIGNED_MEETINGS,
                Permission.DELETE_ASSIGNED_MEETINGS
            ],
            
            UserRole.REGULAR_USER: [
                Permission.VIEW_OWN_ISSUES,
                Permission.CREATE_ISSUES,
                Permission.EDIT_OWN_ISSUES,
                Permission.DELETE_OWN_ISSUES,
            ],
        }
    
    def _normalize_role_name(self, role: str) -> UserRole:
        """Normalize role names for consistency"""
        if not role:
            return UserRole.REGULAR_USER
        
        role_lower = role.lower().strip()
        
        if any(keyword in role_lower for keyword in ['super_admin', 'superadmin', 'super_admins']):
            return UserRole.SUPER_ADMIN
        elif any(keyword in role_lower for keyword in ['admin', 'tenant_admin']):
            return UserRole.ADMIN
        elif any(keyword in role_lower for keyword in ['field_agent', 'fieldagent', 'field agent']):
            return UserRole.FIELD_AGENT
        elif any(keyword in role_lower for keyword in ['assistant', 'assistants']):
            return UserRole.ASSISTANT
        else:
            return UserRole.REGULAR_USER
    
    def has_permission(self, role: str, permission: Permission) -> bool:
        """Check if a role has a specific permission"""
        try:
            normalized_role = self._normalize_role_name(role)
            user_permissions = self._role_permissions.get(normalized_role, [])
            return permission in user_permissions
        except Exception as e:
            logger.error(f"Error checking permission {permission} for role {role}: {e}")
            return False
    
    def get_user_permissions(self, role: str) -> List[Permission]:
        """Get all permissions for a given role"""
        try:
            normalized_role = self._normalize_role_name(role)
            return self._role_permissions.get(normalized_role, [])
        except Exception as e:
            logger.error(f"Error getting permissions for role {role}: {e}")
            return []
    
    def can_view_issues(self, role: str, target_tenant_id: Optional[str] = None, 
                       user_tenant_id: Optional[str] = None) -> bool:
        """Check if user can view issues based on role and tenant context"""
        if self.has_permission(role, Permission.VIEW_ALL_ISSUES):
            return True
        
        if self.has_permission(role, Permission.VIEW_TENANT_ISSUES):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.VIEW_ASSIGNED_ISSUES):
            return True
        
        if self.has_permission(role, Permission.VIEW_OWN_ISSUES):
            return True
        
        return False
    
    def can_edit_issue(self, role: str, target_tenant_id: Optional[str] = None,
                       user_tenant_id: Optional[str] = None, issue_created_by: Optional[str] = None,
                       issue_assigned_to: Optional[str] = None, user_id: Optional[str] = None) -> bool:
        """Check if user can edit a specific issue"""
        if self.has_permission(role, Permission.EDIT_ALL_ISSUES):
            return True
        
        if self.has_permission(role, Permission.EDIT_TENANT_ISSUES):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.EDIT_ASSIGNED_ISSUES):
            return (issue_assigned_to == user_id or issue_created_by == user_id)
        
        if self.has_permission(role, Permission.EDIT_OWN_ISSUES):
            return issue_created_by == user_id
        
        return False
    
    def can_delete_issue(self, role: str, target_tenant_id: Optional[str] = None,
                         user_tenant_id: Optional[str] = None, issue_created_by: Optional[str] = None,
                         issue_assigned_to: Optional[str] = None, user_id: Optional[str] = None) -> bool:
        """Check if user can delete a specific issue"""
        if self.has_permission(role, Permission.DELETE_ALL_ISSUES):
            return True
        
        if self.has_permission(role, Permission.DELETE_TENANT_ISSUES):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.DELETE_ASSIGNED_ISSUES):
            return (issue_assigned_to == user_id or issue_created_by == user_id)
        
        if self.has_permission(role, Permission.DELETE_OWN_ISSUES):
            return issue_created_by == user_id
        
        return False
    
    def can_view_meetings(self, role: str, meeting_tenant_id: Optional[str] = None,
                         user_tenant_id: Optional[str] = None, meeting_user_id: Optional[str] = None,
                         user_id: Optional[str] = None) -> bool:
        """Check if user can view meetings based on role and context"""
        if self.has_permission(role, Permission.VIEW_ALL_MEETINGS):
            return True
        
        if self.has_permission(role, Permission.VIEW_TENANT_MEETINGS):
            return meeting_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.VIEW_ASSIGNED_MEETINGS):
            return meeting_user_id == user_id
        
        return False
    
    def can_create_meetings(self, role: str) -> bool:
        """Check if user can create meetings"""
        return self.has_permission(role, Permission.CREATE_MEETINGS)
    
    def can_edit_meeting(self, role: str, meeting_tenant_id: Optional[str] = None,
                         user_tenant_id: Optional[str] = None, meeting_user_id: Optional[str] = None,
                         user_id: Optional[str] = None) -> bool:
        """Check if user can edit a specific meeting"""
        if self.has_permission(role, Permission.EDIT_ALL_MEETINGS):
            return True
        
        if self.has_permission(role, Permission.EDIT_TENANT_MEETINGS):
            return meeting_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.EDIT_ASSIGNED_MEETINGS):
            return meeting_user_id == user_id
        
        return False
    
    def can_delete_meeting(self, role: str, meeting_tenant_id: Optional[str] = None,
                           user_tenant_id: Optional[str] = None, meeting_user_id: Optional[str] = None,
                           user_id: Optional[str] = None) -> bool:
        """Check if user can delete a specific meeting"""
        if self.has_permission(role, Permission.DELETE_ALL_MEETINGS):
            return True
        
        if self.has_permission(role, Permission.DELETE_TENANT_MEETINGS):
            return meeting_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.DELETE_ASSIGNED_MEETINGS):
            return meeting_user_id == user_id
        
        return False
    
    def can_switch_tenants(self, role: str) -> bool:
        """Check if user can switch between tenants"""
        return self.has_permission(role, Permission.SWITCH_TENANTS)
    
    # Letter permission methods
    def can_view_letters(self, role: str, target_tenant_id: Optional[str] = None, 
                        user_tenant_id: Optional[str] = None, letter_user_id: Optional[str] = None,
                        user_id: Optional[str] = None) -> bool:
        """Check if user can view letters based on role and context"""
        if self.has_permission(role, Permission.VIEW_ALL_LETTERS):
            return True
        
        if self.has_permission(role, Permission.VIEW_TENANT_LETTERS):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.VIEW_ASSIGNED_LETTERS):
            return letter_user_id == user_id
        
        if self.has_permission(role, Permission.VIEW_OWN_LETTERS):
            return letter_user_id == user_id
        
        return False
    
    def can_create_letters(self, role: str) -> bool:
        """Check if user can create letters"""
        return self.has_permission(role, Permission.CREATE_LETTERS)
    
    def can_edit_letter(self, role: str, target_tenant_id: Optional[str] = None,
                        user_tenant_id: Optional[str] = None, letter_user_id: Optional[str] = None,
                        user_id: Optional[str] = None) -> bool:
        """Check if user can edit a specific letter"""
        if self.has_permission(role, Permission.EDIT_ALL_LETTERS):
            return True
        
        if self.has_permission(role, Permission.EDIT_TENANT_LETTERS):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.EDIT_ASSIGNED_LETTERS):
            return letter_user_id == user_id
        
        if self.has_permission(role, Permission.EDIT_OWN_LETTERS):
            return letter_user_id == user_id
        
        return False
    
    def can_delete_letter(self, role: str, target_tenant_id: Optional[str] = None,
                          user_tenant_id: Optional[str] = None, letter_user_id: Optional[str] = None,
                          user_id: Optional[str] = None) -> bool:
        """Check if user can delete a specific letter"""
        if self.has_permission(role, Permission.DELETE_ALL_LETTERS):
            return True
        
        if self.has_permission(role, Permission.DELETE_TENANT_LETTERS):
            return target_tenant_id == user_tenant_id
        
        if self.has_permission(role, Permission.DELETE_ASSIGNED_LETTERS):
            return letter_user_id == user_id
        
        if self.has_permission(role, Permission.DELETE_OWN_LETTERS):
            return letter_user_id == user_id
        
        return False
    
    def can_manage_letter_assignments(self, role: str) -> bool:
        """Check if user can manage letter assignments"""
        return self.has_permission(role, Permission.MANAGE_LETTER_ASSIGNMENTS)

# Create a singleton instance
role_permissions = RolePermissions()
