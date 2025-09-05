// layouts/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import { LogoutButton } from "../../components/LogoutButton";
import { useAuth } from "../../hooks/useAuth";
import LanguageToggle from "../../components/LanguageToggle";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: sidebar open by default
        setSidebarOpen(true);
      } else {
        // Mobile/Tablet: sidebar closed by default
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-6">
          <div className="mx-auto">
            <div className="flex items-center justify-between">
              {/* Left Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
              </div>

              {/* Center Logo */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">क</span>
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    LOK TANTRA APP
                  </div>
                </div>
              </div>

              {/* Right User Section */}
              <div className="flex items-center space-x-4">
                {/* Language Toggle */}
                {/* <LanguageToggle /> */}

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email || "User"}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user?.role || "User"}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                

                {/* Logout Button */}
                <LogoutButton 
                  className="p-2 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </LogoutButton>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 h-[calc(100vh-64px)] overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;