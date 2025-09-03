import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const MeetingForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  meeting = null, 
  users = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agenda: '',
    venue: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    meeting_type: 'Government',
    status: 'Upcoming',
    participants: [],
    expected_attendance: '',
    actual_attendance: '',
    minutes: '',
    reminder_date: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        agenda: meeting.agenda || '',
        venue: meeting.venue || '',
        scheduled_date: meeting.scheduled_date ? meeting.scheduled_date.split('T')[0] : '',
        start_time: meeting.start_time || '',
        end_time: meeting.end_time || '',
        meeting_type: meeting.meeting_type || 'Government',
        status: meeting.status || 'Upcoming',
        participants: meeting.participants || [],
        expected_attendance: meeting.expected_attendance || '',
        actual_attendance: meeting.actual_attendance || '',
        minutes: meeting.minutes || '',
        reminder_date: meeting.reminder_date ? meeting.reminder_date.split('T')[0] : ''
      });
      setSelectedParticipants(meeting.participant_names || []);
    } else {
      resetForm();
    }
  }, [meeting]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      agenda: '',
      venue: '',
      scheduled_date: '',
      start_time: '',
      end_time: '',
      meeting_type: 'Government',
      status: 'Upcoming',
      participants: [],
      expected_attendance: '',
      actual_attendance: '',
      minutes: '',
      reminder_date: ''
    });
    setSelectedParticipants([]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'Date is required';
    }

    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    if (formData.expected_attendance && formData.actual_attendance) {
      if (parseInt(formData.actual_attendance) > parseInt(formData.expected_attendance)) {
        newErrors.actual_attendance = 'Actual attendance cannot exceed expected attendance';
      }
    }

    if (formData.status === 'Done' && !formData.minutes.trim()) {
      newErrors.minutes = 'Minutes are required for completed meetings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      participants: selectedParticipants
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleParticipantChange = (participant, isChecked) => {
    if (isChecked) {
      setSelectedParticipants(prev => [...prev, participant]);
    } else {
      setSelectedParticipants(prev => prev.filter(p => p !== participant));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Upcoming': return <AlertCircle className="w-4 h-4" />;
      case 'Done': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {meeting ? 'Edit Meeting' : 'Create New Meeting'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter meeting title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter meeting description"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.scheduled_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {errors.scheduled_date && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduled_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleInputChange('end_time', e.target.value)}
                  className={`w-full px-3 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.end_time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter meeting venue"
              />
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                value={formData.meeting_type}
                onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Government">Government</option>
                <option value="NGO">NGO</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user) => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(user.name)}
                        onChange={(e) => handleParticipantChange(user.name, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No users available</p>
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Attendance
              </label>
              <input
                type="number"
                value={formData.expected_attendance}
                onChange={(e) => handleInputChange('expected_attendance', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter expected attendance"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Attendance
              </label>
              <input
                type="number"
                value={formData.actual_attendance}
                onChange={(e) => handleInputChange('actual_attendance', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.actual_attendance ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter actual attendance"
                min="0"
              />
              {errors.actual_attendance && (
                <p className="mt-1 text-sm text-red-600">{errors.actual_attendance}</p>
              )}
            </div>
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agenda
            </label>
            <textarea
              value={formData.agenda}
              onChange={(e) => handleInputChange('agenda', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter meeting agenda"
            />
          </div>

          {/* Minutes - Only show for Done status */}
          {formData.status === 'Done' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Minutes *
              </label>
              <textarea
                value={formData.minutes}
                onChange={(e) => handleInputChange('minutes', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.minutes ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter meeting minutes"
              />
              {errors.minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.minutes}</p>
              )}
            </div>
          )}

          {/* Reminder Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Date
            </label>
            <input
              type="date"
              value={formData.reminder_date}
              onChange={(e) => handleInputChange('reminder_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {meeting ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {meeting ? 'Update Meeting' : 'Create Meeting'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingForm;
