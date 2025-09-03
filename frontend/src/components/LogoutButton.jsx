// src/components/LogoutButton.jsx
import { useAuth } from '../hooks/useAuth'

export const LogoutButton = ({ className = '', children }) => {
  const { logout, isLogoutLoading } = useAuth()
  
  const handleLogout = async () => {
    try {
      await logout().unwrap()
      // The logout mutation will handle redirecting to login
    } catch (error) {
      console.error('Logout failed:', error)
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
