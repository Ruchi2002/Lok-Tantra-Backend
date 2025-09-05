// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store'

// Pages
import Landing from "./pages/Landing/Landing";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard2/Dashboard";
import CitizenIssuesPage from "./pages/CitizenIssues/CitizenIssuesPage";
import AreaInsights from "./pages/Heatmap/AreaInsights";
import VisitPlanner from "./pages/Visits/VisitPlanner";
import Reports from "./pages/Reports/Reports";
import SettingsPage from "./pages/Settings/SettingsPage";
import AddAssistantPage from "./pages/Assistants Page/AddAssistantPage";
import TenantPage from "./pages/SuperAdminDashboard/tenantPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard/SuperAdminDashboard";
import ReceivedLettersPage from "./pages/ReceivedLetters/ReceivedLettersPage";
import SentLettersPage from "./pages/SentLetters/SentLettersPage";
import SentGrievanceLettersPage from "./pages/SentGrievanceLetters/SentGrievanceLettersPage";
import MeetingPrograms from "./pages/MeetingPrograms/index";
import LokSabhaSessionTracker from "./pages/LokSabha/index";
import MPLADSTracker from "./pages/MPLADS/index";
import ResearchRepository from "./pages/ResearchRepository/index";
import SocialMediaTracker from "./pages/SocialMediaTracker/index";

// Components
import { AuthProvider } from "./components/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginForm } from "./components/LoginForm";
import { LogoutButton } from "./components/LogoutButton";
import { LanguageProvider } from "./context/LanguageContext";
import { useAuth } from "./hooks/useAuth";

// Styles
import "leaflet/dist/leaflet.css";

// Memoized components for performance
const MemoizedDashboard = React.memo(Dashboard);
const MemoizedCitizenIssuesPage = React.memo(CitizenIssuesPage);
const MemoizedAreaInsights = React.memo(AreaInsights);
const MemoizedVisitPlanner = React.memo(VisitPlanner);
const MemoizedReports = React.memo(Reports);
const MemoizedSettingsPage = React.memo(SettingsPage);
const MemoizedAddAssistantPage = React.memo(AddAssistantPage);
const MemoizedReceivedLettersPage = React.memo(ReceivedLettersPage);
const MemoizedSentLettersPage = React.memo(SentLettersPage);
const MemoizedSentGrievanceLettersPage = React.memo(SentGrievanceLettersPage);
const MemoizedMeetingPrograms = React.memo(MeetingPrograms);
const MemoizedLokSabhaSessionTracker = React.memo(LokSabhaSessionTracker);
const MemoizedMPLADSTracker = React.memo(MPLADSTracker);
const MemoizedResearchRepository = React.memo(ResearchRepository);
const MemoizedSocialMediaTracker = React.memo(SocialMediaTracker);

// Unauthorized page component
const UnauthorizedPage = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    // Redirect based on user role
    if (isSuperAdmin()) {
      navigate('/superadmin/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen    flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Unauthorized Access
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to access this resource.
        </p>
        <p className="text-xs text-gray-500">
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </button>
          
          <LogoutButton className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </LogoutButton>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Super Admin routes */}
              <Route
                path="/superadmin/*"
                element={
                  <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin"]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route path="tenants" element={<TenantPage />} />
              </Route>

              {/* Protected dashboard routes */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<MemoizedDashboard />} />
                
                {/* Field Agent routes */}
                <Route
                  path="issues"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "FieldAgent", "Admin", "Tenant_admin"]}>
                      <MemoizedCitizenIssuesPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="received-letters"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent"]}>
                      <MemoizedReceivedLettersPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="sent-letters"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent"]}>
                      <MemoizedSentLettersPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="sent-grievance-letters"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent"]}>
                      <MemoizedSentGrievanceLettersPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Shared routes */}
                <Route
                  path="meeting-programs"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                      <MemoizedMeetingPrograms />
                    </ProtectedRoute>
                  }
                />
                
                
                <Route
                  path="lok-sabha"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "Member"]}>
                      <MemoizedLokSabhaSessionTracker />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="mplads"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "Member"]}>
                      <MemoizedMPLADSTracker />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="research-repository"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "Member"]}>
                      <MemoizedResearchRepository />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="social-media"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "Member"]}>
                      <MemoizedSocialMediaTracker />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="news-updates"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                      <div className="p-8">
                        <h1 className="text-2xl font-bold mb-4">Parliament News Updates</h1>
                        <p className="text-gray-600">This page will contain detailed parliament news and updates.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin only routes */}
                <Route
                  path="addAssistants"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin"]}>
                      <MemoizedAddAssistantPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin"]}>
                      <MemoizedReports />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredRoles={["Super_admins", "SuperAdmin", "super_admin", "Admin", "Tenant_admin"]}>
                      <MemoizedSettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
