import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCitizenIssuesQuery, useGetFieldAgentIssuesQuery } from '../../store/api/appApi';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const GrievanceDashboard = () => {
  console.log('GrievanceDashboard component rendered');
  const navigate = useNavigate();
  const { user, isFieldAgent, hasRole } = useAuth();
  const { t, tSection } = useTranslation();
  const tDashboard = tSection('dashboard');
  const [stats, setStats] = useState({
    total: 0,
    solved: 0,
    pending: 0,
    onReminder: 0
  });

  // Determine which API endpoint to use based on user role
  const isAgent = isFieldAgent() || hasRole("FieldAgent") || hasRole("field_agent");
  
  // Use appropriate RTK Query hook based on user role
  const { 
    data: issues = [], 
    isLoading: loading, 
    error, 
    refetch: refetchIssues 
  } = isAgent ? useGetFieldAgentIssuesQuery() : useGetCitizenIssuesQuery();

  // Calculate statistics when issues data changes
  React.useEffect(() => {
    if (issues && issues.length > 0) {
      console.log('Raw issues data:', issues);
      
      // Calculate statistics based on your backend status values
      const total = issues.length;
      
      // Based on your backend API, the status values are:
      // - 'Resolved' or 'Closed' for solved
      // - 'Open' or 'In Progress' for pending  
      // - 'Pending' for on reminder
      const solved = issues.filter(issue => 
        issue.status === 'Resolved' || issue.status === 'Closed'
      ).length;
      
      const pending = issues.filter(issue => 
        issue.status === 'Open' || issue.status === 'In Progress'
      ).length;
      
      const onReminder = issues.filter(issue => 
        issue.status === 'Pending'
      ).length;
      
      setStats({
        total,
        solved,
        pending,
        onReminder
      });
      
      console.log('Issues data fetched successfully:', {
        total,
        solved,
        pending,
        onReminder
      });
    }
  }, [issues]);

  // Handle retry functionality
  const handleRetry = () => {
    refetchIssues();
  };

  // Handle click to navigate to issues page
  const handleCardClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('GrievanceDashboard clicked - navigating to /dashboard/issues');
    
    // Try React Router navigation first
    try {
      navigate('/dashboard/issues');
      console.log('React Router navigation successful');
    } catch (error) {
      console.error('React Router navigation failed:', error);
      // Fallback to window.location if navigate fails
      console.log('Falling back to window.location.href');
      window.location.href = '/dashboard/issues';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {tDashboard('grievanceDashboard')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {tDashboard('overviewOfAllCitizenIssues')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 md:col-span-2 border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {tDashboard('grievanceDashboard')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {tDashboard('overviewOfAllCitizenIssues')}
        </p>
        <div className="text-center p-8">
          <div className="mb-4">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 md:col-span-2 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Navigate to Citizen Issues page"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {tDashboard('grievanceDashboard')}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {isAgent 
          ? tDashboard('overviewOfYourAssignedCitizenIssues')
          : tDashboard('overviewOfAllCitizenIssues')
        }
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
          <div className="text-2xl font-bold text-blue-700 mb-1">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 font-semibold">
            {tDashboard('totalCases')}
          </div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {stats.solved.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 font-semibold">
            {tDashboard('solved')}
          </div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors duration-200">
          <div className="text-2xl font-bold text-orange-700 mb-1">
            {stats.pending.toLocaleString()}
          </div>
          <div className="text-sm text-orange-600 font-semibold">
            {tDashboard('pending')}
          </div>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors duration-200">
          <div className="text-2xl font-bold text-red-700 mb-1">
            {stats.onReminder.toLocaleString()}
          </div>
          <div className="text-sm text-red-600 font-semibold">
            {tDashboard('onReminder')}
          </div>
                 </div>
       </div>
       
               {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mb-2">
            <span>Click to view detailed issues</span>
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(e);
            }}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Test Navigation
          </button>
        </div> */}
     </div>
  );
};

export default GrievanceDashboard;