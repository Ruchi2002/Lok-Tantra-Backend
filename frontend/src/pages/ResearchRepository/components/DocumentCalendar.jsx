import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText, 
  BookOpen, Mic, CheckCircle, Clock, AlertCircle, Star
} from 'lucide-react';

const DocumentCalendar = ({ documents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getDocumentsForDate = (date) => {
    return documents.filter(doc => {
      const docDate = new Date(doc.created_date);
      return docDate.getDate() === date.getDate() &&
             docDate.getMonth() === date.getMonth() &&
             docDate.getFullYear() === date.getFullYear();
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Research Note':
        return <BookOpen size={12} className="text-blue-600" />;
      case 'Speech Draft':
        return <Mic size={12} className="text-orange-600" />;
      case 'Speech Final':
        return <FileText size={12} className="text-green-600" />;
      default:
        return <FileText size={12} className="text-gray-600" />;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Final' ? 
      <CheckCircle size={12} className="text-green-600" /> : 
      <Clock size={12} className="text-orange-600" />;
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

  // Calculate summary statistics
  const totalDocuments = documents.length;
  const researchNotes = documents.filter(doc => doc.type === 'Research Note').length;
  const speechDrafts = documents.filter(doc => doc.type === 'Speech Draft').length;
  const speechFinals = documents.filter(doc => doc.type === 'Speech Final').length;
  const finalDocuments = documents.filter(doc => doc.status === 'Final').length;
  const draftDocuments = documents.filter(doc => doc.status === 'Draft').length;
  const featuredDocuments = documents.filter(doc => doc.is_featured).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Document Calendar</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
            {formatDate(currentDate)}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24 bg-gray-50 rounded-lg"></div>;
            }

            const dayDocuments = getDocumentsForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <div
                key={index}
                className={`h-24 p-1 border border-gray-200 rounded-lg ${
                  isToday(date) ? 'bg-blue-50 border-blue-300' : 
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(date) ? 'text-blue-600' : 
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </span>
                  {dayDocuments.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded-full">
                      {dayDocuments.length}
                    </span>
                  )}
                </div>

                {/* Document Indicators */}
                <div className="space-y-1">
                  {dayDocuments.slice(0, 3).map((doc, docIndex) => (
                    <div
                      key={docIndex}
                      className="flex items-center space-x-1 p-1 bg-gray-100 rounded text-xs"
                      title={`${doc.title} (${doc.type})`}
                    >
                      {getTypeIcon(doc.type)}
                      {getStatusIcon(doc.status)}
                      {doc.is_featured && <Star size={10} className="text-yellow-500" />}
                    </div>
                  ))}
                  {dayDocuments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayDocuments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">Research Note</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mic size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Speech Draft</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">Speech Final</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">Final Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Draft Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-600">Featured</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Research Notes</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{researchNotes}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Mic size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Speech Drafts</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{speechDrafts}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-900">Final Speeches</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{speechFinals}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Featured</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{featuredDocuments}</p>
        </div>
      </div>

      {/* Document Timeline Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Document Timeline Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
            <p className="text-sm text-gray-600">Total Documents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{finalDocuments}</p>
            <p className="text-sm text-gray-600">Final Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{draftDocuments}</p>
            <p className="text-sm text-gray-600">Draft Status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCalendar;
