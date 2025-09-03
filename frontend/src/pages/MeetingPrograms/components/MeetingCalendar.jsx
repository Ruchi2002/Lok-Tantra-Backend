import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const MeetingCalendar = ({ meetings = [], onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || calendar.length < 42) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  }, [currentDate]);

  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.scheduled_date);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-500';
      case 'Done': return 'bg-green-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Government': return 'border-purple-500';
      case 'NGO': return 'border-orange-500';
      case 'Public': return 'border-green-500';
      case 'Private': return 'border-gray-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Upcoming': return <AlertCircle className="w-3 h-3" />;
      case 'Done': return <CheckCircle className="w-3 h-3" />;
      case 'Cancelled': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatDay = (date) => {
    return date.getDate();
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendar View
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Today
          </button>
          
          <h3 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
            {formatMonthYear(currentDate)}
          </h3>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center">
            <span className="text-sm font-medium text-gray-500">{day}</span>
          </div>
        ))}

        {/* Calendar Days */}
        {calendarData.map((date, index) => {
          const dayMeetings = getMeetingsForDate(date);
          const isTodayDate = isToday(date);
          const isCurrentMonthDate = isCurrentMonth(date);

          return (
            <div
              key={index}
              onClick={() => onDateClick && onDateClick(date)}
              className={`min-h-[80px] p-2 border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                !isCurrentMonthDate ? 'bg-gray-50' : 'bg-white'
              } ${isTodayDate ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            >
              {/* Date Number */}
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTodayDate ? 'text-blue-600' : 
                  isCurrentMonthDate ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {formatDay(date)}
                </span>
                {isTodayDate && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>

              {/* Meeting Indicators */}
              <div className="space-y-1">
                {dayMeetings.slice(0, 3).map((meeting, meetingIndex) => (
                  <div
                    key={meetingIndex}
                    className={`flex items-center gap-1 p-1 rounded text-xs border-l-2 ${getTypeColor(meeting.meeting_type)} ${
                      isCurrentMonthDate ? 'bg-gray-50' : 'bg-gray-100'
                    }`}
                    title={`${meeting.title} - ${meeting.status}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(meeting.status)}`}></div>
                    <span className="truncate text-gray-700 font-medium">
                      {meeting.title}
                    </span>
                  </div>
                ))}
                
                {dayMeetings.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayMeetings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Legend */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2">Status</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-700">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Type Legend */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2">Meeting Type</h5>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-purple-500"></div>
                <span className="text-xs text-gray-700">Government</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-orange-500"></div>
                <span className="text-xs text-gray-700">NGO</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-green-500"></div>
                <span className="text-xs text-gray-700">Public</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-2 border-gray-500"></div>
                <span className="text-xs text-gray-700">Private</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-blue-600">
              {meetings.filter(m => m.status === 'Upcoming').length}
            </p>
            <p className="text-xs text-gray-600">Upcoming</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">
              {meetings.filter(m => m.status === 'Done').length}
            </p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-600">
              {meetings.filter(m => m.status === 'Cancelled').length}
            </p>
            <p className="text-xs text-gray-600">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCalendar;
