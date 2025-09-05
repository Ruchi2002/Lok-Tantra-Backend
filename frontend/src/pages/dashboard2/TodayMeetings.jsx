import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetTodayMeetingsQuery } from '../../store/api/appApi';
import { useTranslation } from '../../hooks/useTranslation';

const TodayMeetings = () => {
  const navigate = useNavigate();
  const { data: meetings, isLoading, error } = useGetTodayMeetingsQuery();
  const { t, tSection } = useTranslation();
  const tDashboard = tSection('dashboard');

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 h-full flex-shrink-0">
          {tDashboard('todaysMeetingsAndAppointment')}
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 h-full flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">
          {tDashboard('todaysMeetingsAndAppointment')}
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-sm text-center">
            {tDashboard('errorLoadingMeetings')}
          </div>
        </div>
      </div>
    );
  }

  const hasMeetings = meetings && meetings.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">
        {tDashboard('todaysMeetingsAndAppointment')}
      </h3>
      
      <div className="flex-1 overflow-hidden">
        {!hasMeetings ? (
          <div className="text-gray-500 text-sm py-2 h-full flex items-center justify-center">
            {tDashboard('noMeetingsScheduledForToday')}
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-full">
            {meetings.map((meeting) => (
              <div 
                key={meeting.id} 
                className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/meeting-programs/${meeting.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                    {meeting.title || meeting.meeting_title || tDashboard('untitledMeeting')}
                  </h4>
                  <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded">
                    {formatTime(meeting.start_time)}
                  </span>
                </div>
                
                {meeting.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {meeting.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(meeting.meeting_date || meeting.date)}</span>
                  {meeting.location && (
                    <span className="truncate max-w-24">
                      📍 {meeting.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayMeetings;
