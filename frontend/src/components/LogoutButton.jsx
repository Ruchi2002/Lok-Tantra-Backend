// src/components/LogoutButton.jsx
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export const LogoutButton = ({ className = '', children }) => {
  const { logout, isLogoutLoading } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    try {
      await logout().unwrap()
      // The logout mutation will handle redirecting to login
    } catch (error) {
      console.error('Logout failed:', error)
      
      // If logout fails (e.g., 401 - session already expired), 
      // force a local logout and redirect to login
      if (error.status === 401 || error.status === 403) {
        console.log('Session already expired, performing local logout...')
        
        // Clear local storage
        localStorage.removeItem('accessToken')
        sessionStorage.removeItem('accessToken')
        
        // Force redirect to login
        navigate('/login', { replace: true })
      }
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLogoutLoading}
      className={className}
    >
      {isLogoutLoading ? 'Logging out...' : (children || 'Logout')}
    </button>
  )
}
