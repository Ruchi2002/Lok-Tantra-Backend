import { useSelector } from 'react-redux'
import { useLoginMutation, useLogoutMutation } from '../store/api/authApi'
import { selectIsAuthenticated, selectIsLoading, selectUser } from '../store/authSlice'

export const useAuth = () => {
  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)
  const user = useSelector(selectUser)
  
  // RTK Query hooks
  const [login, loginResult] = useLoginMutation()
  const [logout, logoutResult] = useLogoutMutation()
  
  // Permission and role checking functions
  const hasPermission = (requiredPermission) => {
    if (!user?.permissions) return false
    
    if (Array.isArray(requiredPermission)) {
      return requiredPermission.some(permission => 
        user.permissions.includes(permission)
      )
    }
    return user.permissions.includes(requiredPermission)
  }
  
  const hasRole = (requiredRole) => {
    if (!user?.role) return false
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => user.role === role)
    }
    return user.role === requiredRole
  }
  
  // User type checks
  const isSuperAdmin = () => user?.user_type === 'superadmin'
  const isTenantAdmin = () => user?.user_type === 'tenant' || user?.role === 'Admin'
  const isRegularUser = () => user?.user_type === 'user'
  
  // Tenant access check
  const canAccessTenant = (tenantId) => {
    if (!isAuthenticated || !user) return false
    if (isSuperAdmin()) return true
    return user.tenant_id === tenantId
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
    
    // Loading states
    isLoginLoading: loginResult.isLoading,
    isLogoutLoading: logoutResult.isLoading,
    
    // Error states
    loginError: loginResult.error,
    logoutError: logoutResult.error,
  }
}
