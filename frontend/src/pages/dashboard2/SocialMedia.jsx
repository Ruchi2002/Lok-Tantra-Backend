import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const SocialMedia = () => {
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
      onClick={() => !isFieldAgent() && navigate('/dashboard/social-media')}
      onKeyDown={(e) => {
        if (!isFieldAgent() && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          navigate('/dashboard/social-media');
        }
      }}
      tabIndex={isFieldAgent() ? -1 : 0}
      role="button"
      aria-label={isFieldAgent() ? "Social Media (Access Restricted)" : "Navigate to Social Media page"}
    >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{tDashboard('socialMediaHandlesAndTheirHits')}</h3>
        </div>
                 <div className="text-gray-600 text-sm">
           <p>{tDashboard('socialMediaEngagementMetrics')}</p>
         </div>
       </div>
     );
   };

export default SocialMedia;
