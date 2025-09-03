# Authentication Integration Guide

This document explains how authentication is integrated between the FastAPI backend and React frontend.

## Overview

The authentication system uses **HTTP-only cookies** for secure token storage and **JWT tokens** for authentication. This approach provides better security compared to localStorage-based token storage.

## Architecture

### Backend (FastAPI)
- **JWT Tokens**: Access tokens (60 minutes) and refresh tokens (7 days)
- **HTTP-only Cookies**: Secure storage of tokens
- **CORS Configuration**: Properly configured for credentials
- **Role-based Access Control**: User roles and permissions

### Frontend (React)
- **Cookie-based Authentication**: Automatic token handling via cookies
- **AuthContext**: Centralized authentication state management
- **PrivateRoute**: Route protection with role-based access
- **Automatic Token Refresh**: Handled by axios interceptors

## Key Features

### 1. Secure Cookie-based Authentication
- Tokens are stored in HTTP-only cookies (not accessible via JavaScript)
- Automatic token transmission with requests
- CSRF protection through SameSite cookie attributes

### 2. Automatic Token Refresh
- Access tokens automatically refreshed when expired
- Seamless user experience without manual intervention
- Failed requests are retried after token refresh

### 3. Role-based Access Control
- Route protection based on user roles
- Component-level permission checks
- Graceful handling of unauthorized access

### 4. Centralized State Management
- AuthContext provides authentication state across the app
- Consistent user experience
- Easy integration with components

## User Roles

| Role | Description | Access |
|------|-------------|---------|
| `SuperAdmin` | Super administrators | Full system access |
| `Admin` | Tenant administrators | Dashboard, issues, visits, reports, settings |
| `Tenant_admin` | Tenant administrators (alternative) | Same as Admin |
| `FieldAgent` | Field agents | Issues management only |

## API Endpoints

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token
- `POST /auth/change-password` - Change password
- `POST /auth/password-reset-request` - Request password reset
- `POST /auth/password-reset-confirm` - Confirm password reset

## Frontend Components

### 1. AuthContext (`src/context/AuthContext.jsx`)
Provides authentication state and methods:

```javascript
const { 
  user, 
  isAuthenticated, 
  isLoading, 
  login, 
  logout, 
  hasRole, 
  hasPermission 
} = useAuth();
```

### 2. PrivateRoute (`src/components/privateRoute.jsx`)
Protects routes based on authentication and roles:

```javascript
<PrivateRoute allowedRoles={["Tenant", "assistant"]}>
  <ProtectedComponent />
</PrivateRoute>
```

### 3. LogoutButton (`src/components/LogoutButton.jsx`)
Handles user logout:

```javascript
<LogoutButton className="custom-class">
  Custom Logout Text
</LogoutButton>
```

### 4. useAuthRedirect Hook (`src/hooks/useAuthRedirect.js`)
Automatically redirects authenticated users:

```javascript
const { isAuthenticated, isLoading, user } = useAuthRedirect('/dashboard');
```

## Usage Examples

### 1. Login Component
```javascript
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  
  const handleSubmit = async (email, password) => {
    try {
      const userData = await login(email, password);
      // User is automatically redirected based on role
    } catch (error) {
      // Handle login error
    }
  };
};
```

### 2. Protected Component
```javascript
import { useAuth } from '../context/AuthContext';

const ProtectedComponent = () => {
  const { user, hasRole, hasPermission } = useAuth();
  
  if (!hasRole(['Admin', 'FieldAgent'])) {
    return <div>Access denied</div>;
  }
  
  if (!hasPermission('read_issues')) {
    return <div>Insufficient permissions</div>;
  }
  
  return <div>Protected content</div>;
};
```

### 3. Route Protection
```javascript
<Route
  path="/dashboard"
  element={
    <PrivateRoute allowedRoles={["Admin", "FieldAgent"]}>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

## Configuration

### Backend Configuration (`backend/config.py`)
```python
# JWT Settings
SECRET_KEY: str = "your-secret-key"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
REFRESH_TOKEN_EXPIRE_DAYS: int = 7

# Cookie Settings
COOKIE_SECURE: bool = False  # Set to True in production
COOKIE_HTTPONLY: bool = True
COOKIE_SAMESITE: str = "lax"
COOKIE_DOMAIN: Optional[str] = None
COOKIE_PATH: str = "/"
```

### Frontend Configuration (`src/services/api.js`)
```javascript
const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, // Important for cookies
});
```

## Security Features

### 1. HTTP-only Cookies
- Tokens cannot be accessed via JavaScript
- Protection against XSS attacks
- Automatic transmission with requests

### 2. CORS Configuration
- Properly configured for credentials
- Specific origin allowlist
- Secure headers configuration

### 3. Token Refresh
- Automatic token refresh on expiration
- Seamless user experience
- Failed request retry mechanism

### 4. Role-based Access
- Route-level protection
- Component-level permission checks
- Graceful unauthorized access handling

## Error Handling

### 1. Network Errors
- Automatic retry for failed requests
- User-friendly error messages
- Graceful degradation

### 2. Authentication Errors
- Automatic logout on token expiration
- Redirect to login page
- Clear invalid user data

### 3. Authorization Errors
- Role-based access denied pages
- Permission-based component rendering
- Clear error messages

## Testing

### Test Credentials
```
Field Agent:
- Email: priya@mumbai.gov.in
- Password: password123

Admin:
- Email: rajesh@mumbai.gov.in
- Password: password123

Super Admin:
- Email: superadmin@example.com
- Password: password123
```

### Manual Testing
1. Start backend server: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to login page
4. Test with different user roles
5. Verify route protection
6. Test logout functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is properly configured
   - Check that `allow_credentials=True`
   - Verify origin is in allowlist

2. **Cookie Issues**
   - Check `withCredentials: true` in axios config
   - Verify cookie settings in backend
   - Ensure same domain/port for development

3. **Token Refresh Issues**
   - Check refresh token endpoint
   - Verify cookie transmission
   - Check token expiration settings

4. **Role-based Access Issues**
   - Verify user roles in database
   - Check role names match exactly
   - Ensure proper role assignment

### Debug Mode
Enable debug logging in `src/services/api.js` to troubleshoot authentication issues.

## Production Considerations

1. **HTTPS**: Set `COOKIE_SECURE=True` in production
2. **Domain**: Configure `COOKIE_DOMAIN` for production domain
3. **Secret Key**: Use strong, unique secret key
4. **CORS**: Restrict origins to production domains
5. **Token Expiration**: Adjust based on security requirements

## Migration from localStorage

If migrating from localStorage-based authentication:

1. Update API service to use cookies
2. Remove token storage from localStorage
3. Update components to use AuthContext
4. Test all authentication flows
5. Update error handling

## Support

For authentication issues:
1. Check browser developer tools for network errors
2. Verify backend server is running
3. Check console for JavaScript errors
4. Verify database user data
5. Test with provided test credentials
