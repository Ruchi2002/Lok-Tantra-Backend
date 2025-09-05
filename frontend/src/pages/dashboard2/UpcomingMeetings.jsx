import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const UpcomingMeetings = () => {
  const navigate = useNavigate();
  const { t, tSection } = useTranslation();
  const tDashboard = tSection('dashboard');

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
      onClick={() => navigate('/dashboard/meeting-programs')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/dashboard/meeting-programs');
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Navigate to Meeting Programs page"
    >
      <h3 className="text-lg font-semibold text-gray-800">{tDashboard('upcomingMeetingsAndPrograms')}</h3>
      <div className="text-gray-600 text-sm mt-2">
        <p>{tDashboard('scheduledEventsAndMeetings')}</p>
      </div>
    </div>
  );
};

export default UpcomingMeetings;
