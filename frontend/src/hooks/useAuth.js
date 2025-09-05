import { useSelector } from 'react-redux'
import { useLoginMutation, useLogoutMutation } from '../store/api/authApi'
import { selectIsAuthenticated, selectIsLoading, selectUser } from '../store/authSlice'
import {
  normalizeRoleName,
  hasPermission as checkPermission, // Renamed to avoid conflict
  canViewIssues as checkCanViewIssues,
  canEditIssue as checkCanEditIssue,
  canDeleteIssue as checkCanDeleteIssue,
  canManageUsers as checkCanManageUsers,
  canSwitchTenants as checkCanSwitchTenants,
  isSuperAdmin as checkIsSuperAdmin,
  isAdmin as checkIsAdmin,
  isFieldAgent as checkIsFieldAgent,
  getRoleDisplayName as getRoleDisplayNameUtil,
  canViewMeetings as checkCanViewMeetings,
  canEditMeeting as checkCanEditMeeting,
  canDeleteMeeting as checkCanDeleteMeeting,
  canCreateMeetings as checkCanCreateMeetings,
  canViewLetters as checkCanViewLetters,
  canCreateLetters as checkCanCreateLetters,
  canEditLetter as checkCanEditLetter,
  canDeleteLetter as checkCanDeleteLetter,
  canManageLetterAssignments as checkCanManageLetterAssignments
} from '../utils/rolePermissions'

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)
  const user = useSelector(selectUser)

  const [login, loginResult] = useLoginMutation()
  const [logout, logoutResult] = useLogoutMutation()

  // Get normalized user role
  const getUserRole = () => {
    if (!user?.role) return 'assistant'
    return normalizeRoleName(user.role)
  }

  // Permission and role checking functions
  const hasPermission = (requiredPermission) => {
    if (!user?.role) return false
    return checkPermission(user.role, requiredPermission)
  }

  const hasRole = (requiredRole) => {
    if (!user?.role) return false

    const userRole = getUserRole()
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => userRole === normalizeRoleName(role))
    }
    return userRole === normalizeRoleName(requiredRole)
  }

  // User type checks using role permissions utility
  const isSuperAdmin = () => checkIsSuperAdmin(user?.role)
  const isTenantAdmin = () => checkIsAdmin(user?.role)
  const isRegularUser = () => !checkIsAdmin(user?.role) && !checkIsFieldAgent(user?.role)
  const isFieldAgent = () => checkIsFieldAgent(user?.role)

  // Tenant access check
  const canAccessTenant = (tenantId) => {
    if (!isAuthenticated || !user) return false
    if (isSuperAdmin()) return true
    return user.tenant_id === tenantId
  }

  // Issue permission checks
  const canViewIssues = (targetTenantId = null) => {
    if (!user?.role) return false
    return checkCanViewIssues(user.role, targetTenantId, user.tenant_id)
  }

  const canEditIssue = (issue, userId = null) => {
    if (!user?.role) return false
    return checkCanEditIssue(user.role, issue, userId || user.id)
  }

  const canDeleteIssue = (issue, userId = null) => {
    if (!user?.role) return false
    return checkCanDeleteIssue(user.role, issue, userId || user.id)
  }

  const canManageUsers = (targetTenantId = null) => {
    if (!user?.role) return false
    return checkCanManageUsers(user.role, targetTenantId, user.tenant_id)
  }

  const canSwitchTenants = () => {
    if (!user?.role) return false
    return checkCanSwitchTenants(user.role)
  }

  // Meeting Program permission checks
  const canViewMeetings = (targetTenantId = null, meetingUserId = null) => {
    if (!user?.role) return false
    return checkCanViewMeetings(user.role, targetTenantId, user.tenant_id, user.id, meetingUserId)
  }

  const canEditMeeting = (meeting, userId = null) => {
    if (!user?.role) return false
    return checkCanEditMeeting(user.role, meeting?.tenant_id, user.tenant_id, meeting?.user_id, userId || user.id)
  }

  const canDeleteMeeting = (meeting, userId = null) => {
    if (!user?.role) return false
    return checkCanDeleteMeeting(user.role, meeting?.tenant_id, user.tenant_id, meeting?.user_id, userId || user.id)
  }

  const canCreateMeetings = () => {
    if (!user?.role) return false
    return checkCanCreateMeetings(user.role)
  }

  // Letter permission checks
  const canViewLetters = (targetTenantId = null, letterUserId = null) => {
    if (!user?.role) return false
    return checkCanViewLetters(user.role, targetTenantId, user.tenant_id, letterUserId, user.id)
  }

  const canCreateLetters = () => {
    if (!user?.role) return false
    return checkCanCreateLetters(user.role)
  }

  const canEditLetter = (letter, userId = null) => {
    if (!user?.role) return false
    return checkCanEditLetter(user.role, letter?.tenant_id, user.tenant_id, letter?.assigned_to || letter?.created_by, userId || user.id)
  }

  const canDeleteLetter = (letter, userId = null) => {
    if (!user?.role) return false
    return checkCanDeleteLetter(user.role, letter?.tenant_id, user.tenant_id, letter?.assigned_to || letter?.created_by, userId || user.id)
  }

  const canManageLetterAssignments = () => {
    if (!user?.role) return false
    return checkCanManageLetterAssignments(user.role)
  }

  // Get role display name
  const getRoleDisplayName = () => {
    if (!user?.role) return 'User'
    return getRoleDisplayNameUtil(user.role)
  }

  return {
    // State
    user,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    logout,

    // Permission checks
    hasPermission,
    hasRole,
    canAccessTenant,
    isSuperAdmin,
    isTenantAdmin,
    isRegularUser,
    isFieldAgent,

    // Issue permissions
    canViewIssues,
    canEditIssue,
    canDeleteIssue,
    canManageUsers,
    canSwitchTenants,

    // Meeting Program permissions
    canViewMeetings,
    canEditMeeting,
    canDeleteMeeting,
    canCreateMeetings,

    // Letter permissions
    canViewLetters,
    canCreateLetters,
    canEditLetter,
    canDeleteLetter,
    canManageLetterAssignments,

    // Role utilities
    getUserRole,
    getRoleDisplayName,

    // Loading states
    isLoginLoading: loginResult.isLoading,
    isLogoutLoading: logoutResult.isLoading,

    // Error states
    loginError: loginResult.error,
    logoutError: logoutResult.error,
  }
}
