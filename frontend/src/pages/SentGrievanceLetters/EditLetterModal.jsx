import React, { useState } from 'react';
import { X, Loader2, User, Mail, Phone, Building, MapPin, FileText, Calendar, AlertCircle } from 'lucide-react';

const EditLetterModal = ({ letter, onClose, categories, priorities, statuses }) => {
  // Mock the mutation hook for demonstration
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const updateLetter = async (data) => {
    setUpdateLoading(true);
    try {
      console.log('Updating letter:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { unwrap: () => Promise.resolve() };
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const [formData, setFormData] = useState({
    recipient_name: letter?.recipient_name || '',
    recipient_email: letter?.recipient_email || '',
    recipient_phone: letter?.recipient_phone || '',
    recipient_address: letter?.recipient_address || '',
    recipient_organization: letter?.recipient_organization || '',
    subject: letter?.subject || '',
    content: letter?.content || '',
    category: letter?.category || 'Other',
    priority: letter?.priority || 'Medium',
    status: letter?.status || 'Awaiting',
    sent_date: letter?.sent_date ? new Date(letter.sent_date).toISOString().split('T')[0] : '',
    follow_up_date: letter?.follow_up_date ? new Date(letter.follow_up_date).toISOString().split('T')[0] : '',
    notes: letter?.notes || ''
  });

  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('recipient');

  // Mock data for demonstration
  const mockCategories = categories || ['Service Issue', 'Billing', 'Product Quality', 'Staff Behavior', 'Other'];
  const mockPriorities = priorities || ['Low', 'Medium', 'High', 'Urgent'];
  const mockStatuses = statuses || ['Awaiting', 'In Progress', 'Resolved', 'Closed'];
  const mockLetter = letter || { id: 'DEMO-001', grievance_id: 'GRV-2024-001' };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recipient_name || !formData.subject || !formData.content) {
      setError('Please fill in all required fields (Recipient Name, Subject, and Content)');
      return;
    }

    try {
      setError('');
      
      const letterData = {
        ...formData,
        sent_date: formData.sent_date ? new Date(formData.sent_date).toISOString() : null,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null
      };

      await updateLetter({ letterId: mockLetter.id, letterData });
      onClose();
    } catch (error) {
      console.error('Error updating letter:', error);
      setError(error?.data?.detail || 'Failed to update letter. Please try again.');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const sections = [
    { id: 'recipient', label: 'Recipient Info', icon: User },
    { id: 'letter', label: 'Letter Details', icon: FileText },
    { id: 'tracking', label: 'Tracking', icon: Calendar }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Grievance Letter</h2>
              <p className="text-sm text-gray-600">ID: {mockLetter.grievance_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation Tabs - Mobile Responsive */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Recipient Information Section */}
            {activeSection === 'recipient' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4" />
                      <span>Recipient Name *</span>
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter recipient's full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      name="recipient_email"
                      value={formData.recipient_email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="recipient@example.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      name="recipient_phone"
                      value={formData.recipient_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4" />
                      <span>Organization</span>
                    </label>
                    <input
                      type="text"
                      name="recipient_organization"
                      value={formData.recipient_organization}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Company or organization name"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>Address</span>
                    </label>
                    <textarea
                      name="recipient_address"
                      value={formData.recipient_address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Complete mailing address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Letter Details Section */}
            {activeSection === 'letter' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Brief description of your grievance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letter Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="8"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe your grievance in detail..."
                    required
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Be clear and specific about your concerns</span>
                    <span>{formData.content.length} characters</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      {mockCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${getPriorityColor(formData.priority)}`}
                    >
                      {mockPriorities.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      {mockStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Any additional information, follow-up actions, or internal notes..."
                  />
                </div>
              </div>
            )}

            {/* Tracking Section */}
            {activeSection === 'tracking' && (
              <div className="space-y-6">
                {/* Grievance ID - Read Only */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grievance ID
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={mockLetter.grievance_id}
                      disabled
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono"
                    />
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Read Only
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">This ID is automatically generated and cannot be modified</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Date Sent</span>
                    </label>
                    <input
                      type="date"
                      name="sent_date"
                      value={formData.sent_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">When was this letter sent?</p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Follow-up Date</span>
                    </label>
                    <input
                      type="date"
                      name="follow_up_date"
                      value={formData.follow_up_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">When to follow up if no response</p>
                  </div>
                </div>

                {/* Status Overview Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{formData.status}</div>
                      <div className="text-sm text-gray-600">Current Status</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        formData.priority === 'Urgent' ? 'text-red-600' : 
                        formData.priority === 'High' ? 'text-orange-600' : 
                        formData.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formData.priority}
                      </div>
                      <div className="text-sm text-gray-600">Priority Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formData.category}</div>
                      <div className="text-sm text-gray-600">Category</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex space-x-1">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      section.id === activeSection ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="hidden sm:inline">
                {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={updateLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
              >
                {updateLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{updateLoading ? 'Updating...' : 'Update Letter'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLetterModal;