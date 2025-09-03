import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Star,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';

const SessionCalendar = ({ sessions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getSessionsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date === dateString);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  const getStatusIcon = (session) => {
    if (session.pending_questions === 0) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    } else if (session.pending_questions > 0) {
      return <Clock className="w-3 h-3 text-blue-500" />;
    }
    return <Clock className="w-3 h-3 text-gray-500" />;
  };

  const getQuestionTypeIcon = (session) => {
    if (session.starred_questions > 0) {
      return <Star className="w-3 h-3 text-yellow-500" />;
    }
    return <FileText className="w-3 h-3 text-gray-500" />;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    days.push(date);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Session Calendar</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">View by Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-600">Active</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-600">Starred</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {formatDate(currentDate)}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center">
            <div className="text-sm font-medium text-gray-700">{day}</div>
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-3"></div>;
          }

          const sessionsForDate = getSessionsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`p-3 min-h-[100px] border border-gray-100 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Date Number */}
              <div className={`text-sm font-medium mb-2 ${
                isCurrentDay 
                  ? 'text-blue-600' 
                  : isCurrentMonth 
                    ? 'text-gray-900' 
                    : 'text-gray-400'
              }`}>
                {date.getDate()}
              </div>

              {/* Sessions */}
              <div className="space-y-1">
                {sessionsForDate.map(session => (
                  <div
                    key={session.id}
                    className="p-2 bg-blue-50 border border-blue-200 rounded text-xs cursor-pointer hover:bg-blue-100 transition-colors"
                    title={`${session.session_number} - ${session.total_questions} questions`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(session)}
                        {getQuestionTypeIcon(session)}
                      </div>
                      <span className="font-medium text-blue-700">
                        {session.total_questions}
                      </span>
                    </div>
                    <div className="text-blue-800 font-medium truncate">
                      {session.session_number.split(' - ')[1]}
                    </div>
                    <div className="text-blue-600 text-xs">
                      {session.answered_questions}/{session.total_questions} answered
                    </div>
                  </div>
                ))}
              </div>

              {/* No Sessions Indicator */}
              {sessionsForDate.length === 0 && isCurrentMonth && (
                <div className="text-xs text-gray-400 text-center mt-2">
                  No sessions
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Completed Session</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Active Session</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Has Starred Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Unstarred Questions Only</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Session Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {sessions.length}
            </div>
            <div className="text-xs text-blue-600">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {sessions.filter(s => s.pending_questions === 0).length}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {sessions.filter(s => s.pending_questions > 0).length}
            </div>
            <div className="text-xs text-yellow-600">Active</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {sessions.reduce((sum, s) => sum + s.total_questions, 0)}
            </div>
            <div className="text-xs text-purple-600">Total Questions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCalendar;
