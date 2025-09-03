import { useAuth } from '../hooks/useAuth'
import { LogoutButton } from './LogoutButton'

export const UserProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div>Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome, {user?.name || 'User'}
          </h2>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500">
            Role: {user?.role} | Type: {user?.user_type}
          </p>
        </div>
        <LogoutButton className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Logout
        </LogoutButton>
      </div>
      
      {user?.permissions && user.permissions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">Permissions:</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.permissions.map((permission) => (
              <span
                key={permission}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
