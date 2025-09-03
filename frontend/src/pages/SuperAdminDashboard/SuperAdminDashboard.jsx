// src/pages/SuperAdminDashboard.jsx
import React from "react";
import SuperAdminSidebar from "../SuperAdminDashboard/superAdminsidebar";
import { Outlet } from "react-router-dom"; // for nested routes
import TenantPage from "./tenantPage";
import { LogoutButton } from "../../components/LogoutButton";
import { useAuth } from "../../hooks/useAuth";

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SuperAdminSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Top Header */}
        <header className="h-14 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email || "Super Admin"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role || "Super Admin"}
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Logout Button */}
            <LogoutButton 
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </LogoutButton>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Nested content from routes (like TenantsPage) */}
          
          <TenantPage/>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
