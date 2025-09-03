import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye
} from 'lucide-react';

const MeetingCard = ({ meeting, onEdit, onDelete, getStatusColor, getTypeColor }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Upcoming': return <AlertCircle className="w-4 h-4" />;
      case 'Done': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const isToday = (dateString) => {
    const today = new Date();
    const meetingDate = new Date(dateString);
    return today.toDateString() === meetingDate.toDateString();
  };

  const isUpcoming = (dateString) => {
    const today = new Date();
    const meetingDate = new Date(dateString);
    return meetingDate > today;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {meeting.title}
            </h3>
            {meeting.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {meeting.description}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowDetails(!showDetails);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showDetails ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and Type Badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
            {getStatusIcon(meeting.status)}
            {meeting.status}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(meeting.meeting_type)}`}>
            {meeting.meeting_type}
          </span>
          {isToday(meeting.scheduled_date) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
              Today
            </span>
          )}
        </div>

        {/* Date and Time */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            <span className={isToday(meeting.scheduled_date) ? 'font-medium text-orange-600' : ''}>
              {formatDate(meeting.scheduled_date)}
            </span>
          </div>
          {meeting.time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{meeting.time}</span>
            </div>
          )}
        </div>

        {/* Venue */}
        {meeting.venue && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{meeting.venue}</span>
          </div>
        )}

        {/* Participants */}
        {meeting.participant_names && meeting.participant_names.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Users className="w-4 h-4" />
            <span>{meeting.participant_names.length} participants</span>
          </div>
        )}

        {/* Attendance */}
        {(meeting.expected_attendance || meeting.actual_attendance) && (
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {meeting.expected_attendance && (
              <span>Expected: {meeting.expected_attendance}</span>
            )}
            {meeting.actual_attendance && (
              <span className="font-medium text-green-600">
                Actual: {meeting.actual_attendance}
              </span>
            )}
          </div>
        )}

        {/* Creator */}
        {meeting.creator_name && (
          <div className="text-sm text-gray-500">
            Created by {meeting.creator_name}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 pt-4">
          {/* Agenda */}
          {meeting.agenda && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Agenda</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{meeting.agenda}</p>
            </div>
          )}

          {/* Minutes */}
          {meeting.minutes && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Meeting Minutes
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{meeting.minutes}</p>
            </div>
          )}

          {/* Participant List */}
          {meeting.participant_names && meeting.participant_names.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Participants</h4>
              <div className="flex flex-wrap gap-1">
                {meeting.participant_names.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-gray-100 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {meeting.status === 'Done' && meeting.minutes && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                <FileText className="w-3 h-3" />
                Minutes uploaded
              </span>
            )}
            {meeting.reminder_sent && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                <AlertCircle className="w-3 h-3" />
                Reminder sent
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
            <button
              onClick={onEdit}
              className="text-xs text-gray-600 hover:text-gray-800 font-medium"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
