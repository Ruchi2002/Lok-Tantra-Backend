import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useGetCurrentUserQuery } from '../store/api/authApi'
import { setAuthenticated, logout, setLoading } from '../store/authSlice'

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Check if we have a token before making the API call
  const hasToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  
  console.log('AuthProvider - hasToken:', hasToken) // Debug log
  
  // Check if user is authenticated on app start
  const { data: user, error, isLoading } = useGetCurrentUserQuery(undefined, {
    // Skip the query if no token exists
    skip: !hasToken,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  })
  
  console.log('AuthProvider - Query result:', { user: !!user, error, isLoading }) // Debug log
  
  // Update loading state in Redux
  useEffect(() => {
    dispatch(setLoading(isLoading))
  }, [isLoading, dispatch])
  
  useEffect(() => {
    console.log('AuthProvider - Effect triggered:', { user: !!user, error, hasToken }) // Debug log
    
    if (user && !error) {
      // User is authenticated
      console.log('AuthProvider - Setting authenticated user:', user) // Debug log
      dispatch(setAuthenticated({
        user: user,
        permissions: user.permissions || [],
        roles: user.role ? [user.role] : [],
      }))
    } else if (error && error.status === 401) {
      // User is not authenticated - clear any stale tokens
      console.log('AuthProvider - 401 error, clearing tokens') // Debug log
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken')
      dispatch(logout())
    } else if (!hasToken) {
      // No token exists, user is not authenticated
      console.log('AuthProvider - No token, setting logout state') // Debug log
      dispatch(logout())
    }
    
    setIsInitialized(true)
  }, [user, error, dispatch, hasToken])
  
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
