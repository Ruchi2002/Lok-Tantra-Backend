/**
 * Comprehensive Permissions Utility for Smart Politician Assistant
 * Centralizes all role-based access control logic
 */

import { useAuth } from '../hooks/useAuth';

/**
 * Permission checking functions for Citizen Issues
 */
export const useIssuePermissions = () => {
  const { user, hasRole, isSuperAdmin, isTenantAdmin } = useAuth();

  const canCreateIssue = () => {
    if (!user) return false;
    return true; // All authenticated users can create issues
  };

  const canViewIssue = (issue) => {
    if (!user || !issue) return false;
    
    // SuperAdmin can view all issues
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can view issues from their tenant
    if (isTenantAdmin()) {
      return issue.tenant_id === user.tenant_id;
    }
    
    // FieldAgent can view issues they created, are assigned to, or from their tenant
    if (hasRole("FieldAgent")) {
      return issue.created_by === user.id || 
             issue.assigned_to === user.id ||
             issue.tenant_id === user.tenant_id;
    }
    
    // Regular users can only view issues they created
    return issue.created_by === user.id;
  };

  const canEditIssue = (issue) => {
    if (!user || !issue) return false;
    
    // SuperAdmin can edit all issues
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can edit issues in their tenant
    if (isTenantAdmin()) {
      return issue.tenant_id === user.tenant_id;
    }
    
    // FieldAgent can edit issues they created or are assigned to
    if (hasRole("FieldAgent")) {
      return issue.created_by === user.id || issue.assigned_to === user.id;
    }
    
    // Regular users can only edit issues they created
    return issue.created_by === user.id;
  };

  const canDeleteIssue = (issue) => {
    if (!user || !issue) return false;
    
    // SuperAdmin can delete all issues
    if (isSuperAdmin()) return true;
    
    // Only creators can delete their own issues
    return issue.created_by === user.id;
  };

  const canAssignIssue = (issue) => {
    if (!user || !issue) return false;
    
    // SuperAdmin can assign any issue
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can assign issues in their tenant
    if (isTenantAdmin()) {
      return issue.tenant_id === user.tenant_id;
    }
    
    // FieldAgent cannot assign issues
    return false;
  };

  const canSetIssuePriority = (priority) => {
    if (!user) return false;
    
    // SuperAdmin and TenantAdmin can set any priority
    if (isSuperAdmin() || isTenantAdmin()) return true;
    
    // FieldAgent can set up to High priority
    if (hasRole("FieldAgent")) {
      return ["Low", "Medium", "High"].includes(priority);
    }
    
    // Regular users can only set Low and Medium priority
    return ["Low", "Medium"].includes(priority);
  };

  const canSetIssueStatus = (status) => {
    if (!user) return false;
    
    // SuperAdmin and TenantAdmin can set any status
    if (isSuperAdmin() || isTenantAdmin()) return true;
    
    // FieldAgent can set status up to "In Progress"
    if (hasRole("FieldAgent")) {
      return ["Open", "In Progress"].includes(status);
    }
    
    // Regular users can only set "Open" status
    return status === "Open";
  };

  const canExportIssues = () => {
    if (!user) return false;
    
    // SuperAdmin and TenantAdmin can export all data
    if (isSuperAdmin() || isTenantAdmin()) return true;
    
    // FieldAgent can export their own data
    if (hasRole("FieldAgent")) return true;
    
    // Regular users can export their own data
    return true;
  };

  return {
    canCreateIssue,
    canViewIssue,
    canEditIssue,
    canDeleteIssue,
    canAssignIssue,
    canSetIssuePriority,
    canSetIssueStatus,
    canExportIssues,
  };
};

/**
 * Permission checking functions for User Management
 */
export const useUserPermissions = () => {
  const { user, hasRole, isSuperAdmin, isTenantAdmin } = useAuth();

  const canViewUsers = () => {
    if (!user) return false;
    
    // SuperAdmin can view all users
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can view users in their tenant
    if (isTenantAdmin()) return true;
    
    // Others cannot view user lists
    return false;
  };

  const canCreateUser = () => {
    if (!user) return false;
    
    // SuperAdmin can create any user
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can create users in their tenant
    if (isTenantAdmin()) return true;
    
    // Others cannot create users
    return false;
  };

  const canEditUser = (targetUser) => {
    if (!user || !targetUser) return false;
    
    // SuperAdmin can edit any user
    if (isSuperAdmin()) return true;
    
    // Users can edit themselves
    if (user.id === targetUser.id) return true;
    
    // TenantAdmin can edit users in their tenant
    if (isTenantAdmin() && targetUser.tenant_id === user.tenant_id) {
      return true;
    }
    
    return false;
  };

  const canDeleteUser = (targetUser) => {
    if (!user || !targetUser) return false;
    
    // SuperAdmin can delete any user
    if (isSuperAdmin()) return true;
    
    // Users cannot delete themselves
    if (user.id === targetUser.id) return false;
    
    // TenantAdmin can delete users in their tenant
    if (isTenantAdmin() && targetUser.tenant_id === user.tenant_id) {
      return true;
    }
    
    return false;
  };

  return {
    canViewUsers,
    canCreateUser,
    canEditUser,
    canDeleteUser,
  };
};

/**
 * Permission checking functions for Tenant Management
 */
export const useTenantPermissions = () => {
  const { user, isSuperAdmin } = useAuth();

  const canViewTenants = () => {
    return isSuperAdmin();
  };

  const canCreateTenant = () => {
    return isSuperAdmin();
  };

  const canEditTenant = (tenantId) => {
    if (!user) return false;
    
    // SuperAdmin can edit any tenant
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can edit their own tenant
    if (user.tenant_id === tenantId) return true;
    
    return false;
  };

  const canDeleteTenant = (tenantId) => {
    return isSuperAdmin();
  };

  return {
    canViewTenants,
    canCreateTenant,
    canEditTenant,
    canDeleteTenant,
  };
};

/**
 * Permission checking functions for Reports and Analytics
 */
export const useReportPermissions = () => {
  const { user, hasRole, isSuperAdmin, isTenantAdmin } = useAuth();

  const canViewReports = () => {
    if (!user) return false;
    
    // SuperAdmin can view all reports
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can view tenant reports
    if (isTenantAdmin()) return true;
    
    // FieldAgent can view their own reports
    if (hasRole("FieldAgent")) return true;
    
    // Regular users can view their own reports
    return true;
  };

  const canExportReports = () => {
    if (!user) return false;
    
    // SuperAdmin and TenantAdmin can export all reports
    if (isSuperAdmin() || isTenantAdmin()) return true;
    
    // FieldAgent can export their own reports
    if (hasRole("FieldAgent")) return true;
    
    // Regular users can export their own reports
    return true;
  };

  const canViewAnalytics = () => {
    if (!user) return false;
    
    // SuperAdmin can view all analytics
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can view tenant analytics
    if (isTenantAdmin()) return true;
    
    // FieldAgent can view limited analytics
    if (hasRole("FieldAgent")) return true;
    
    // Regular users cannot view analytics
    return false;
  };

  return {
    canViewReports,
    canExportReports,
    canViewAnalytics,
  };
};

/**
 * Permission checking functions for System Settings
 */
export const useSystemPermissions = () => {
  const { user, isSuperAdmin, isTenantAdmin } = useAuth();

  const canViewSystemSettings = () => {
    return isSuperAdmin();
  };

  const canModifySystemSettings = () => {
    return isSuperAdmin();
  };

  const canViewTenantSettings = (tenantId) => {
    if (!user) return false;
    
    // SuperAdmin can view any tenant settings
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can view their own tenant settings
    if (isTenantAdmin() && user.tenant_id === tenantId) return true;
    
    return false;
  };

  const canModifyTenantSettings = (tenantId) => {
    if (!user) return false;
    
    // SuperAdmin can modify any tenant settings
    if (isSuperAdmin()) return true;
    
    // TenantAdmin can modify their own tenant settings
    if (isTenantAdmin() && user.tenant_id === tenantId) return true;
    
    return false;
  };

  return {
    canViewSystemSettings,
    canModifySystemSettings,
    canViewTenantSettings,
    canModifyTenantSettings,
  };
};

/**
 * Utility function to get user's accessible data scope
 */
export const getUserDataScope = () => {
  const { user, hasRole, isSuperAdmin, isTenantAdmin } = useAuth();
  
  if (!user) return 'none';
  
  if (isSuperAdmin()) return 'global';
  if (isTenantAdmin()) return 'tenant';
  if (hasRole("FieldAgent")) return 'assigned';
  
  return 'own';
};

/**
 * Utility function to check if user has any of the required permissions
 */
export const hasAnyPermission = (permissions) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.some(permission => permission());
};

/**
 * Utility function to check if user has all required permissions
 */
export const hasAllPermissions = (permissions) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.every(permission => permission());
};

export default {
  useIssuePermissions,
  useUserPermissions,
  useTenantPermissions,
  useReportPermissions,
  useSystemPermissions,
  getUserDataScope,
  hasAnyPermission,
  hasAllPermissions,
};

