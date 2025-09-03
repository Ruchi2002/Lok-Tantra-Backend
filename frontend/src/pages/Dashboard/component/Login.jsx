// src/pages/Dashboard/component/Login.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const Login = React.memo(function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    login, 
    isAuthenticated, 
    isLoading, 
    user,
    checkExistingAuth 
  } = useAuth();
  
  // Check for existing token and auto-login on mount
  useEffect(() => {
    const checkExistingAuthOnMount = async () => {
      console.log("🔍 Checking for existing authentication...");
      try {
        // Use the checkExistingAuth function from useAuth hook
        const userInfo = await checkExistingAuth();
        if (userInfo) {
          console.log("✅ Valid token found, user is already authenticated");
          // User is authenticated, redirect based on role
          redirectBasedOnRole(userInfo);
        } else {
          console.log("❌ No valid token found");
        }
      } catch (error) {
        console.log("❌ Error checking authentication:", error);
        // Clear any invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("tenant");
      }
    };

    checkExistingAuthOnMount();
  }, [checkExistingAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 User is authenticated, redirecting...");
      redirectBasedOnRole(user);
    }
  }, [isAuthenticated, user, navigate, location]);

  const redirectBasedOnRole = useCallback((userData) => {
    const from = location.state?.from?.pathname;
    
    // If there's a specific redirect path, use it
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    
    // Otherwise, redirect based on user role
    switch (userData.role) {
      case "SuperAdmin":
        navigate("/superadmin", { replace: true });
        break;
      case "Admin":
      case "Tenant_admin":
        navigate("/dashboard", { replace: true });
        break;
      case "FieldAgent":
        navigate("/dashboard/issues", { replace: true });
        break;
      default:
        navigate("/dashboard", { replace: true });
    }
  }, [navigate, location]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("🔐 Attempting login...");
      // Login using Redux RTK Query
      const result = await login({ email: formData.email, password: formData.password }).unwrap();
      console.log("✅ User login successful:", result);
      
      // The redirect will be handled by the useEffect above
      // since isAuthenticated will be updated by Redux
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.data?.detail || err.message || "Login failed. Please try again.");
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.email || !formData.password}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold mb-2">Test credentials:</p>
            <div className="space-y-1">
              <p className="font-medium text-blue-600">Field Agent:</p>
              <p>Email: priya@mumbai.gov.in</p>
              <p>Password: password123</p>
            </div>
            <div className="space-y-1 mt-2">
              <p className="font-medium text-green-600">Admin:</p>
              <p>Email: rajesh@mumbai.gov.in</p>
              <p>Password: password123</p>
            </div>
            <div className="space-y-1 mt-2">
              <p className="font-medium text-purple-600">Super Admin:</p>
              <p>Email: superadmin@example.com</p>
              <p>Password: password123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});

export default Login;

