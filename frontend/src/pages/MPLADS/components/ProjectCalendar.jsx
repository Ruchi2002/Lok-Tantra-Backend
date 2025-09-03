import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Building2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin
} from 'lucide-react';

const ProjectCalendar = ({ projects }) => {
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

  const getProjectsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return projects.filter(project => 
      project.start_date === dateString || 
      project.end_date === dateString ||
      (new Date(project.start_date) <= date && new Date(project.end_date) >= date)
    );
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

  const getStatusIcon = (project) => {
    switch (project.status) {
      case 'Completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'Ongoing':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'Planned':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusColor = (project) => {
    switch (project.status) {
      case 'Completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Ongoing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Planned':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
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
        <h3 className="text-lg font-semibold text-gray-900">Project Calendar</h3>
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
              <span className="text-xs text-gray-600">Ongoing</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-gray-600">Planned</span>
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

          const projectsForDate = getProjectsForDate(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`p-3 min-h-[120px] border border-gray-100 ${
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

              {/* Projects */}
              <div className="space-y-1">
                {projectsForDate.map(project => (
                  <div
                    key={project.id}
                    className={`p-2 border rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(project)}`}
                    title={`${project.title} - ${project.status} - ${project.progress_percentage}% complete`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(project)}
                        <Building2 className="w-3 h-3" />
                      </div>
                      <span className="font-medium">
                        {project.progress_percentage}%
                      </span>
                    </div>
                    <div className="font-medium truncate">
                      {project.title.split(' - ')[0]}
                    </div>
                    <div className="text-xs opacity-75">
                      {project.category}
                    </div>
                  </div>
                ))}
              </div>

              {/* No Projects Indicator */}
              {projectsForDate.length === 0 && isCurrentMonth && (
                <div className="text-xs text-gray-400 text-center mt-2">
                  No projects
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
              <span className="text-sm text-gray-600">Completed Project</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Ongoing Project</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Planned Project</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Project Day</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Project Day</span>
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
              {projects.length}
            </div>
            <div className="text-xs text-blue-600">Total Projects</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {projects.filter(p => p.status === 'Completed').length}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">
              {projects.filter(p => p.status === 'Ongoing').length}
            </div>
            <div className="text-xs text-yellow-600">Ongoing</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(projects.reduce((sum, p) => sum + p.sanctioned_amount, 0))}
            </div>
            <div className="text-xs text-purple-600">Total Budget</div>
          </div>
        </div>
      </div>

      {/* Project Timeline Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Upcoming Project Milestones</h4>
        <div className="space-y-2">
          {projects
            .filter(project => new Date(project.end_date) >= new Date())
            .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
            .slice(0, 3)
            .map(project => (
              <div key={project.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(project)}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {project.title}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Ends: {new Date(project.end_date).toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else {
    return `₹${amount.toLocaleString()}`;
  }
};

export default ProjectCalendar;
