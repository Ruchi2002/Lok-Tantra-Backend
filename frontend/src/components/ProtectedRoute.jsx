import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const ProtectedRoute = ({ children, requiredPermissions = [], requiredRoles = [] }) => {
  const { isAuthenticated, user, hasPermission, hasRole, isLoading } = useAuth()
  const location = useLocation()
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // Only redirect to login if we're not loading AND not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // Check permissions if required
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  // Check roles if required
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}
