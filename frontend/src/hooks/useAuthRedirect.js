// src/hooks/useAuthRedirect.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useAuthRedirect = (redirectTo = '/dashboard') => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // If user is already authenticated, redirect them to the appropriate page
      switch (user.role) {
        case "SuperAdmin":
          navigate("/superadmin");
          break;
        case "Admin":
        case "Tenant_admin":
          navigate("/dashboard");
          break;
        case "FieldAgent":
          navigate("/dashboard/issues");
          break;
        default:
          navigate(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, redirectTo]);

  return { isAuthenticated, isLoading, user };
};
