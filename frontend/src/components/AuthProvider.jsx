import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useGetCurrentUserQuery } from '../store/api/authApi'
import { setAuthenticated, logout, setLoading } from '../store/authSlice'

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Check if user is authenticated on app start
  const { data: user, error, isLoading } = useGetCurrentUserQuery(undefined, {
    // Don't skip - let it check for existing cookies
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  
  // Update loading state in Redux
  useEffect(() => {
    dispatch(setLoading(isLoading))
  }, [isLoading, dispatch])
  
  useEffect(() => {
    if (user && !error) {
      // User is authenticated
      dispatch(setAuthenticated({
        user: user,
        permissions: user.permissions || [],
        roles: user.role ? [user.role] : [],
      }))
    } else if (error && error.status === 401) {
      // User is not authenticated
      dispatch(logout())
    }
    
    setIsInitialized(true)
  }, [user, error, dispatch])
  
  // Show loading spinner while checking authentication
  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return children
}
