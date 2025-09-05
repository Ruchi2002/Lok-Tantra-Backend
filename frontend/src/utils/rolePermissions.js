/**
 * Frontend Role-Based Access Control (RBAC) Utilities
 * Centralized permission management for the Smart Politician Assistant
 */

// User role enumeration
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  FIELD_AGENT: 'field_agent',
  ASSISTANT: 'assistant',
  REGULAR_USER: 'regular_user'
};

// Permission enumeration
export const Permission = {
  // Issue permissions
  VIEW_ALL_ISSUES: 'view_all_issues',
  VIEW_TENANT_ISSUES: 'view_tenant_issues',
  VIEW_OWN_ISSUES: 'view_own_issues',
  VIEW_ASSIGNED_ISSUES: 'view_assigned_issues',
  
  CREATE_ISSUES: 'create_issues',
  EDIT_ALL_ISSUES: 'edit_all_issues',
  EDIT_TENANT_ISSUES: 'edit_tenant_issues',
  EDIT_OWN_ISSUES: 'edit_own_issues',
  EDIT_ASSIGNED_ISSUES: 'edit_assigned_issues',
  
  DELETE_ALL_ISSUES: 'delete_all_issues',
  DELETE_TENANT_ISSUES: 'delete_tenant_issues',
  DELETE_OWN_ISSUES: 'delete_own_issues',
  DELETE_ASSIGNED_ISSUES: 'delete_assigned_issues',
  
  // Letter permissions
  VIEW_ALL_LETTERS: 'view_all_letters',
  VIEW_TENANT_LETTERS: 'view_tenant_letters',
  VIEW_OWN_LETTERS: 'view_own_letters',
  VIEW_ASSIGNED_LETTERS: 'view_assigned_letters',
  
  CREATE_LETTERS: 'create_letters',
  EDIT_ALL_LETTERS: 'edit_all_letters',
  EDIT_TENANT_LETTERS: 'edit_tenant_letters',
  EDIT_OWN_LETTERS: 'edit_own_letters',
  EDIT_ASSIGNED_LETTERS: 'edit_assigned_letters',
  
  DELETE_ALL_LETTERS: 'delete_all_letters',
  DELETE_TENANT_LETTERS: 'delete_tenant_letters',
  DELETE_OWN_LETTERS: 'delete_own_letters',
  DELETE_ASSIGNED_LETTERS: 'delete_assigned_letters',
  
  MANAGE_LETTER_ASSIGNMENTS: 'manage_letter_assignments',
  
  // User management permissions
  MANAGE_ALL_USERS: 'manage_all_users',
  MANAGE_TENANT_USERS: 'manage_tenant_users',
  MANAGE_ASSISTANTS: 'manage_assistants',
  
  // Tenant permissions
  SWITCH_TENANTS: 'switch_tenants',
  VIEW_ALL_TENANTS: 'view_all_tenants',
  
  // Meeting permissions
  VIEW_ALL_MEETINGS: 'view_all_meetings',
  VIEW_TENANT_MEETINGS: 'view_tenant_meetings',
  VIEW_ASSIGNED_MEETINGS: 'view_assigned_meetings',
  EDIT_ALL_MEETINGS: 'edit_all_meetings',
  EDIT_TENANT_MEETINGS: 'edit_tenant_meetings',
  EDIT_ASSIGNED_MEETINGS: 'edit_assigned_meetings',
  DELETE_ALL_MEETINGS: 'delete_all_meetings',
  DELETE_TENANT_MEETINGS: 'delete_tenant_meetings',
  DELETE_ASSIGNED_MEETINGS: 'delete_assigned_meetings',
  CREATE_MEETINGS: 'create_meetings'
};

// Role hierarchy and permissions
const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: [
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
  
  [UserRole.ADMIN]: [
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
  
  [UserRole.FIELD_AGENT]: [
    Permission.VIEW_ASSIGNED_ISSUES,
    Permission.CREATE_ISSUES,
    Permission.EDIT_ASSIGNED_ISSUES,
    Permission.DELETE_ASSIGNED_ISSUES,
    Permission.VIEW_ASSIGNED_LETTERS,
    Permission.CREATE_LETTERS,
    Permission.EDIT_ASSIGNED_LETTERS,
    // Note: Field Agents CANNOT delete letters (CRU only)
    Permission.VIEW_ASSIGNED_MEETINGS,
    Permission.EDIT_ASSIGNED_MEETINGS,
    Permission.DELETE_ASSIGNED_MEETINGS
  ],
  
  [UserRole.ASSISTANT]: [
    Permission.VIEW_ASSIGNED_ISSUES,
    Permission.CREATE_ISSUES,
    Permission.EDIT_ASSIGNED_ISSUES,
    Permission.DELETE_ASSIGNED_ISSUES,
    Permission.VIEW_ASSIGNED_LETTERS,
    Permission.CREATE_LETTERS,
    Permission.EDIT_ASSIGNED_LETTERS,
    // Note: Assistants CANNOT delete letters (CRU only)
    Permission.VIEW_ASSIGNED_MEETINGS,
    Permission.EDIT_ASSIGNED_MEETINGS,
    Permission.DELETE_ASSIGNED_MEETINGS
  ],
  
  [UserRole.REGULAR_USER]: [
    Permission.VIEW_OWN_ISSUES,
    Permission.CREATE_ISSUES,
    Permission.EDIT_OWN_ISSUES,
    Permission.DELETE_OWN_ISSUES,
    Permission.VIEW_OWN_LETTERS,
    Permission.CREATE_LETTERS,
    Permission.EDIT_OWN_LETTERS,
    Permission.DELETE_OWN_LETTERS,
  ],
};

/**
 * Normalize role names for consistency
 * @param {string} role - Role name to normalize
 * @returns {string} Normalized role name
 */
export const normalizeRoleName = (role) => {
  if (!role) return UserRole.REGULAR_USER;
  
  const roleLower = role.toLowerCase().trim();
  
  if (roleLower.includes('super_admin') || roleLower.includes('superadmin') || roleLower.includes('super_admins')) {
    return UserRole.SUPER_ADMIN;
  } else if (roleLower.includes('admin') || roleLower.includes('tenant_admin')) {
    return UserRole.ADMIN;
  } else if (roleLower.includes('field_agent') || roleLower.includes('fieldagent') || roleLower.includes('field agent')) {
    return UserRole.FIELD_AGENT;
  } else if (roleLower.includes('assistant') || roleLower.includes('assistants')) {
    return UserRole.ASSISTANT;
  } else {
    return UserRole.REGULAR_USER;
  }
};

/**
 * Get permissions for a given role
 * @param {string} role - User role
 * @returns {Array} Array of permissions
 */
export const getUserPermissions = (role) => {
  try {
    const normalizedRole = normalizeRoleName(role);
    return ROLE_PERMISSIONS[normalizedRole] || [];
  } catch (error) {
    console.error(`Error getting permissions for role ${role}:`, error);
    return [];
  }
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
export const hasPermission = (role, permission) => {
  const userPermissions = getUserPermissions(role);
  return userPermissions.includes(permission);
};

/**
 * Check if user can view issues based on role and tenant context
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @returns {boolean} True if user can view issues
 */
export const canViewIssues = (role, targetTenantId = null, userTenantId = null) => {
  if (hasPermission(role, Permission.VIEW_ALL_ISSUES)) {
    return true;
  }
  
  if (hasPermission(role, Permission.VIEW_TENANT_ISSUES)) {
    return targetTenantId === userTenantId;
  }
  
  if (hasPermission(role, Permission.VIEW_ASSIGNED_ISSUES)) {
    return true;
  }
  
  if (hasPermission(role, Permission.VIEW_OWN_ISSUES)) {
    return true;
  }
  
  return false;
};

/**
 * Check if user can edit a specific issue
 * @param {string} role - User role
 * @param {Object} issue - Issue object
 * @param {string} userId - Current user ID
 * @returns {boolean} True if user can edit issue
 */
export const canEditIssue = (role, issue, userId) => {
  // Everyone can edit any issue (as long as they are authenticated)
  return true;
};

/**
 * Check if user can delete a specific issue
 * @param {string} role - User role
 * @param {Object} issue - Issue object
 * @param {string} userId - Current user ID
 * @returns {boolean} True if user can delete issue
 */
export const canDeleteIssue = (role, issue, userId) => {
  // Everyone can delete any issue (as long as they are authenticated)
  return true;
};

/**
 * Check if user can manage other users
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @returns {boolean} - Whether user can manage users
 */
export const canManageUsers = (role, targetTenantId = null, userTenantId = null) => {
  if (hasPermission(role, Permission.MANAGE_ALL_USERS)) {
    return true;
  }
  
  if (hasPermission(role, Permission.MANAGE_TENANT_USERS)) {
    return targetTenantId === userTenantId;
  }
  
  return false;
};

/**
 * Check if user can switch between tenants
 * @param {string} role - User role
 * @returns {boolean} - Whether user can switch tenants
 */
export const canSwitchTenants = (role) => {
  return hasPermission(role, Permission.SWITCH_TENANTS);
};

/**
 * Check if user can view meetings based on role and context
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} userId - User ID
 * @param {string} meetingUserId - Meeting's assigned user ID
 * @returns {boolean} - Whether user can view meetings
 */
export const canViewMeetings = (role, targetTenantId = null, userTenantId = null, userId = null, meetingUserId = null) => {
  if (hasPermission(role, Permission.VIEW_ALL_MEETINGS)) {
    return true;
  }
  
  if (hasPermission(role, Permission.VIEW_TENANT_MEETINGS)) {
    return targetTenantId === userTenantId;
  }
  
  if (hasPermission(role, Permission.VIEW_ASSIGNED_MEETINGS)) {
    return meetingUserId === userId;
  }
  
  return false;
};

/**
 * Check if user can edit a specific meeting
 * @param {string} role - User role
 * @param {string} meetingTenantId - Meeting's tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} meetingUserId - Meeting's assigned user ID
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user can edit the meeting
 */
export const canEditMeeting = (role, meetingTenantId = null, userTenantId = null, meetingUserId = null, userId = null) => {
  if (hasPermission(role, Permission.EDIT_ALL_MEETINGS)) {
    return true;
  }
  
  if (hasPermission(role, Permission.EDIT_TENANT_MEETINGS)) {
    return meetingTenantId === userTenantId;
  }
  
  if (hasPermission(role, Permission.EDIT_ASSIGNED_MEETINGS)) {
    return meetingUserId === userId;
  }
  
  return false;
};

/**
 * Check if user can delete a specific meeting
 * @param {string} role - User role
 * @param {string} meetingTenantId - Meeting's tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} meetingUserId - Meeting's assigned user ID
 * @param {string} userId - User ID
 * @returns {boolean} - Whether user can delete the meeting
 */
export const canDeleteMeeting = (role, meetingTenantId = null, userTenantId = null, meetingUserId = null, userId = null) => {
  if (hasPermission(role, Permission.DELETE_ALL_MEETINGS)) {
    return true;
  }
  
  if (hasPermission(role, Permission.DELETE_TENANT_MEETINGS)) {
    return meetingTenantId === userTenantId;
  }
  
  if (hasPermission(role, Permission.DELETE_ASSIGNED_MEETINGS)) {
    return meetingUserId === userId;
  }
  
  return false;
};

/**
 * Check if user can create meetings
 * @param {string} role - User role
 * @returns {boolean} - Whether user can create meetings
 */
export const canCreateMeetings = (role) => {
  return hasPermission(role, Permission.CREATE_MEETINGS);
};

/**
 * Get the appropriate API endpoint based on user role
 * @param {string} role - User role
 * @returns {string} API endpoint to use
 */
export const getApiEndpoint = (role) => {
  const normalizedRole = normalizeRoleName(role);
  
  switch (normalizedRole) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return '/citizen-issues/filtered';
    case UserRole.FIELD_AGENT:
    case UserRole.ASSISTANT:
      return '/citizen-issues/field-agent';
    default:
      return '/citizen-issues';
  }
};

/**
 * Get role display name
 * @param {string} role - User role
 * @returns {string} Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const normalizedRole = normalizeRoleName(role);
  
  const displayNames = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.FIELD_AGENT]: 'Field Agent',
    [UserRole.ASSISTANT]: 'Assistant',
    [UserRole.REGULAR_USER]: 'User'
  };
  
  return displayNames[normalizedRole] || 'User';
};

/**
 * Check if user is a super admin
 * @param {string} role - User role
 * @returns {boolean} True if user is super admin
 */
export const isSuperAdmin = (role) => {
  return normalizeRoleName(role) === UserRole.SUPER_ADMIN;
};

/**
 * Check if user is an admin (tenant admin or super admin)
 * @param {string} role - User role
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (role) => {
  const normalizedRole = normalizeRoleName(role);
  return normalizedRole === UserRole.ADMIN || normalizedRole === UserRole.SUPER_ADMIN;
};

/**
 * Check if user is a field agent
 * @param {string} role - User role
 * @returns {boolean} True if user is field agent
 */
export const isFieldAgent = (role) => {
  const normalizedRole = normalizeRoleName(role);
  return normalizedRole === UserRole.FIELD_AGENT || normalizedRole === UserRole.ASSISTANT;
};

/**
 * Check if user can view letters
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} letterUserId - Letter's user ID (assigned_to or created_by)
 * @param {string} userId - Current user ID
 * @returns {boolean} - Whether user can view letters
 */
export const canViewLetters = (role, targetTenantId = null, userTenantId = null, letterUserId = null, userId = null) => {
  const normalizedRole = normalizeRoleName(role)
  
  // Super Admin can see all letters
  if (normalizedRole === UserRole.SUPER_ADMIN) return true
  
  // Admin can see letters from their tenant
  if (normalizedRole === UserRole.ADMIN) {
    return targetTenantId === userTenantId
  }
  
  // Field Agent and Assistant can see letters assigned to them or created by them
  if (normalizedRole === UserRole.FIELD_AGENT || normalizedRole === UserRole.ASSISTANT) {
    return letterUserId === userId
  }
  
  // Regular users can see letters they created
  if (normalizedRole === UserRole.REGULAR_USER) {
    return letterUserId === userId
  }
  
  return false
}

/**
 * Check if user can create letters
 * @param {string} role - User role
 * @returns {boolean} - Whether user can create letters
 */
export const canCreateLetters = (role) => {
  return hasPermission(role, Permission.CREATE_LETTERS)
}

/**
 * Check if user can edit a letter
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} letterUserId - Letter's user ID (assigned_to or created_by)
 * @param {string} userId - Current user ID
 * @returns {boolean} - Whether user can edit the letter
 */
export const canEditLetter = (role, targetTenantId = null, userTenantId = null, letterUserId = null, userId = null) => {
  const normalizedRole = normalizeRoleName(role)
  
  // Super Admin can edit all letters
  if (normalizedRole === UserRole.SUPER_ADMIN) return true
  
  // Admin can edit letters from their tenant
  if (normalizedRole === UserRole.ADMIN) {
    return targetTenantId === userTenantId
  }
  
  // Field Agent and Assistant can edit letters assigned to them or created by them
  if (normalizedRole === UserRole.FIELD_AGENT || normalizedRole === UserRole.ASSISTANT) {
    return letterUserId === userId
  }
  
  // Regular users can edit letters they created
  if (normalizedRole === UserRole.REGULAR_USER) {
    return letterUserId === userId
  }
  
  return false
}

/**
 * Check if user can delete a letter
 * @param {string} role - User role
 * @param {string} targetTenantId - Target tenant ID
 * @param {string} userTenantId - User's tenant ID
 * @param {string} letterUserId - Letter's user ID (assigned_to or created_by)
 * @param {string} userId - Current user ID
 * @returns {boolean} - Whether user can delete the letter
 */
export const canDeleteLetter = (role, targetTenantId = null, userTenantId = null, letterUserId = null, userId = null) => {
  const normalizedRole = normalizeRoleName(role)
  
  // Super Admin can delete all letters
  if (normalizedRole === UserRole.SUPER_ADMIN) return true
  
  // Admin can delete letters from their tenant
  if (normalizedRole === UserRole.ADMIN) {
    return targetTenantId === userTenantId
  }
  
  // Field Agents and Assistants CANNOT delete letters (CRU only)
  if (normalizedRole === UserRole.FIELD_AGENT || normalizedRole === UserRole.ASSISTANT) {
    return false
  }
  
  // Regular users can delete letters they created
  if (normalizedRole === UserRole.REGULAR_USER) {
    return letterUserId === userId
  }
  
  return false
}

/**
 * Check if user can manage letter assignments
 * @param {string} role - User role
 * @returns {boolean} - Whether user can manage letter assignments
 */
export const canManageLetterAssignments = (role) => {
  return hasPermission(role, Permission.MANAGE_LETTER_ASSIGNMENTS)
}

// Export default object with all functions
export default {
  UserRole,
  Permission,
  normalizeRoleName,
  getUserPermissions,
  hasPermission,
  canViewIssues,
  canEditIssue,
  canDeleteIssue,
  canManageUsers,
  canSwitchTenants,
  canViewMeetings,
  canEditMeeting,
  canDeleteMeeting,
  canCreateMeetings,
  canViewLetters,
  canCreateLetters,
  canEditLetter,
  canDeleteLetter,
  canManageLetterAssignments,
  getApiEndpoint,
  getRoleDisplayName,
  isSuperAdmin,
  isAdmin,
  isFieldAgent
};
