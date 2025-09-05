import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const DevelopmentGoals = () => {
  const navigate = useNavigate();
  const { t, tSection } = useTranslation();
  const { isFieldAgent } = useAuth();
  const tDashboard = tSection('dashboard');

  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 ${
        isFieldAgent() 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer hover:shadow-lg hover:bg-gray-50'
      }`}
      onClick={() => !isFieldAgent() && navigate('/dashboard/mplads')}
      onKeyDown={(e) => {
        if (!isFieldAgent() && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          navigate('/dashboard/mplads');
        }
      }}
      tabIndex={isFieldAgent() ? -1 : 0}
      role="button"
      aria-label={isFieldAgent() ? "MP Lads (Access Restricted)" : "Navigate to MPLADS page"}
    >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{tDashboard('mpladsAndOtherDevelopmentGoal')}</h3>
        </div>
                 <div className="text-gray-600 text-sm">
           <p>{tDashboard('developmentProjectTracking')}</p>
         </div>
       </div>
     );
   };

export default DevelopmentGoals;
