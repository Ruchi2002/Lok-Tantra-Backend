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
  XCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  PlusCircle,
  Building,
  Hash
} from 'lucide-react';
// Removed useGetMeetingParticipantsQuery import as we're using manual participant entry

const MeetingForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  meeting = null, 
  users = [],
  isLoading = false,
  currentUser = null,
  canAssignUsers = false
}) => {
  // Removed participant API query as we're using manual entry
  
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
    reminder_date: '',
    user_id: '' // For assigning users
  });

  const [errors, setErrors] = useState({});
  const [participantText, setParticipantText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
        reminder_date: meeting.reminder_date ? meeting.reminder_date.split('T')[0] : '',
        user_id: meeting.user_id || '' // For assigned user
      });
      setParticipantText(meeting.participant_names ? meeting.participant_names.join(', ') : '');
    } else {
      resetForm();
      // Auto-assign Field Agents to themselves
      if (currentUser?.role === 'FieldAgent' && currentUser?.id) {
        setFormData(prev => ({
          ...prev,
          user_id: currentUser.id
        }));
      }
    }
  }, [meeting, currentUser]);

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
      reminder_date: '',
      user_id: ''
    });
    setParticipantText('');
    setErrors({});
    setCurrentStep(1);
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

    // Field Agent validation - can only assign to themselves
    if (currentUser?.role === 'FieldAgent' && formData.user_id && formData.user_id !== currentUser.id) {
      newErrors.user_id = 'Field Agents can only assign meetings to themselves';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert participant text to array of objects
    const participantNames = participantText.split(',').map(name => name.trim()).filter(name => name.length > 0);
    const formattedParticipants = participantNames.map(name => ({ name }));

    // Convert date string to ISO datetime string
    let formattedScheduledDate = formData.scheduled_date;
    if (formData.scheduled_date) {
      // If it's just a date, add time to make it a proper datetime
      if (formData.scheduled_date.length === 10) { // YYYY-MM-DD format
        formattedScheduledDate = `${formData.scheduled_date}T00:00:00`;
      }
    }

    const submitData = {
      ...formData,
      scheduled_date: formattedScheduledDate,
      participants: formattedParticipants,
      user_id: formData.user_id || null  // Convert empty string to null
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

  const handleParticipantTextChange = (text) => {
    setParticipantText(text);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Upcoming': return <AlertCircle className="w-4 h-4" />;
      case 'Done': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Done': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'Government': return <Building className="w-4 h-4" />;
      case 'NGO': return <Users className="w-4 h-4" />;
      case 'Public': return <UserCheck className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {meeting ? 'Edit Meeting' : 'Create New Meeting'}
                </h2>
                <p className="text-indigo-100 text-sm">
                  {meeting ? 'Update meeting details' : 'Schedule a new meeting'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Container with Scroll */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter a descriptive meeting title"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Meeting Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.meeting_type}
                      onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                    >
                      <option value="Government">Government</option>
                      <option value="NGO">NGO</option>
                      <option value="Public">Public</option>
                    </select>
                    <div className="absolute left-3 top-3.5">
                      {getMeetingTypeIcon(formData.meeting_type)}
                    </div>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none ${getStatusColor(formData.status)}`}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Done">Done</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="absolute left-3 top-3.5">
                      {getStatusIcon(formData.status)}
                    </div>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* User Assignment - Only show if user can assign users */}
                {canAssignUsers && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                    </label>
                    <div className="relative">
                                             <select
                         value={formData.user_id}
                         onChange={(e) => handleInputChange('user_id', e.target.value)}
                         className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none"
                       >
                         <option value="">Select User</option>
                         {participants.map(user => (
                           <option key={user.id} value={user.id}>
                             {user.name} ({user.role})
                           </option>
                         ))}
                       </select>
                      <div className="absolute left-3 top-3.5">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                      </div>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {currentUser?.role === 'FieldAgent' 
                        ? 'Field Agents can only assign meetings to themselves'
                        : 'Admins can assign meetings to any user in their tenant'
                      }
                    </p>
                    {errors.user_id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.user_id}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                  placeholder="Provide a brief description of the meeting"
                />
              </div>
            </div>

            {/* Schedule Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Schedule & Location</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Date */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.scheduled_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.scheduled_date && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.scheduled_date}
                    </p>
                  )}
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.end_time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <Clock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.end_time && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.end_time}
                    </p>
                  )}
                </div>
              </div>

              {/* Venue */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Conference Room, Online, Office Address, etc."
                  />
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Participants Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participant Names
                </label>
                <div className="relative">
                  <textarea
                    value={participantText}
                    onChange={(e) => handleParticipantTextChange(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Enter participant names separated by commas (e.g., John Doe, Jane Smith, Mike Johnson)"
                  />
                  <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter participant names separated by commas. You can add as many participants as needed.
                </p>
              </div>

              {/* Attendance Numbers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Attendance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.expected_attendance}
                      onChange={(e) => handleInputChange('expected_attendance', e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="0"
                      min="0"
                    />
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Attendance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.actual_attendance}
                      onChange={(e) => handleInputChange('actual_attendance', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                        errors.actual_attendance ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    <UserCheck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.actual_attendance && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.actual_attendance}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Agenda Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Meeting Agenda</h3>
              </div>
              
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                placeholder="• Discussion points&#10;• Action items&#10;• Decisions to be made"
              />
            </div>

            {/* Meeting Minutes - Only show for Done status */}
            {formData.status === 'Done' && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Meeting Minutes *</h3>
                </div>
                
                <textarea
                  value={formData.minutes}
                  onChange={(e) => handleInputChange('minutes', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none ${
                    errors.minutes ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Record key discussions, decisions made, and action items..."
                />
                {errors.minutes && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.minutes}
                  </p>
                )}
              </div>
            )}

            {/* Advanced Options */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center w-full text-left mb-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 flex-1">Advanced Options</h3>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showAdvanced && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  {/* Reminder Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.reminder_date}
                        onChange={(e) => handleInputChange('reminder_date', e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                      />
                      <AlertCircle className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-4 rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <div className="relative">
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin"></div>
                      <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    {meeting ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {meeting ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Update Meeting
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        Create Meeting
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;