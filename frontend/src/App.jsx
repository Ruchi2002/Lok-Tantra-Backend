// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { AppDataProvider } from "./context/AppDataContext";
import { LanguageProvider } from "./context/LanguageContext";

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

// Unauthorized page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full space-y-8 text-center">
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        Unauthorized Access
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        You don't have permission to access this resource.
      </p>
      <div className="mt-4 space-x-4">
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => window.location.href = "/login"}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppDataProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Super Admin routes */}
                <Route
                  path="/superadmin/*"
                  element={
                    <ProtectedRoute requiredRoles={["SuperAdmin"]}>
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
                    <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MemoizedDashboard />} />
                  
                  {/* Field Agent routes */}
                  <Route
                    path="issues"
                    element={
                      <ProtectedRoute requiredRoles={["FieldAgent", "Admin", "Tenant_admin"]}>
                        <MemoizedCitizenIssuesPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="received-letters"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin", "FieldAgent"]}>
                        <MemoizedReceivedLettersPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="sent-letters"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin", "FieldAgent"]}>
                        <MemoizedSentLettersPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="sent-grievance-letters"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin", "FieldAgent"]}>
                        <MemoizedSentGrievanceLettersPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Shared routes */}
                  <Route
                    path="meeting-programs"
                    element={
                      <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                        <MemoizedMeetingPrograms />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="lok-sabha"
                    element={
                      <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                        <MemoizedLokSabhaSessionTracker />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="mplads"
                    element={
                      <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                        <MemoizedMPLADSTracker />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="research-repository"
                    element={
                      <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                        <MemoizedResearchRepository />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="social-media"
                    element={
                      <ProtectedRoute requiredRoles={["SuperAdmin", "Admin", "Tenant_admin", "FieldAgent", "Member"]}>
                        <MemoizedSocialMediaTracker />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin only routes */}
                  <Route
                    path="addAssistants"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin"]}>
                        <MemoizedAddAssistantPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin"]}>
                        <MemoizedReports />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute requiredRoles={["Admin", "Tenant_admin"]}>
                        <MemoizedSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppDataProvider>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
