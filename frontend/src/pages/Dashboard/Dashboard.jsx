import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Memoized navigation handlers to prevent recreation
  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleNavigateToReceivedLetters = useCallback(() => {
    navigate('/dashboard/received-letters');
  }, [navigate]);

  const handleNavigateToSentLetters = useCallback(() => {
    navigate('/dashboard/sent-letters');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleNavigateToReceivedLetters}
                  className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">📥</div>
                  <div className="font-medium">Received Letters</div>
                  <div className="text-sm opacity-90">View incoming correspondence</div>
                </button>
                
                <button
                  onClick={handleNavigateToSentLetters}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-2">📤</div>
                  <div className="font-medium">Sent Letters</div>
                  <div className="text-sm opacity-90">Manage outgoing letters</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">📊</div>
                    <div>
                      <div className="font-medium text-gray-900">Dashboard</div>
                      <div className="text-sm text-gray-600">System overview and statistics</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">⚙️</div>
                    <div>
                      <div className="font-medium text-gray-900">Settings</div>
                      <div className="text-sm text-gray-600">Configure system preferences</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome</h2>
              <p className="text-gray-600 mb-4">
                Welcome to the Smart Politician Assistant Dashboard. This system helps you manage 
                citizen issues, correspondence, and administrative tasks efficiently.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use the Quick Actions to access main features</li>
                  <li>• Navigate through different sections using the sidebar</li>
                  <li>• Check the system overview for important information</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>System is running smoothly</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span>All services are operational</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                  <span>Ready to process requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
