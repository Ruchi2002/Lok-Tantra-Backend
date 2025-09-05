import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaSpinner, FaUser, FaEnvelope, FaBuilding, FaCalendar, FaFlag, FaFileAlt, FaStickyNote, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaUpload } from 'react-icons/fa';
import { useCreateSentGrievanceLetterMutation, useGetAccessibleCitizenIssuesQuery } from '../../store/api/appApi';
import { useAuth } from '../../hooks/useAuth';

const AddLetterModal = ({ onClose, categories, priorities, statuses }) => {
  const [createLetter, { isLoading: createLoading }] = useCreateSentGrievanceLetterMutation();
  const { data: grievancesData, isLoading: loadingGrievances, error: grievancesError } = useGetAccessibleCitizenIssuesQuery();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    grievance_id: '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    recipient_organization: '',
    subject: '',
    content: '',
    category: 'Other',
    priority: 'Medium',
    status: 'Awaiting Response',
    sent_date: new Date().toISOString().split('T')[0],
    follow_up_date: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recipient');
  const grievances = grievancesData || [];
  

  const tabs = [
    { 
      id: 'recipient', 
      label: 'Recipient', 
      icon: FaUser,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-500'
    },
    { 
      id: 'details', 
      label: 'Letter Details', 
      icon: FaFileAlt,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    },
    { 
      id: 'content', 
      label: 'Content & Documents', 
      icon: FaEnvelope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500'
    }
  ];

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.grievance_id) {
      setError('Please select a grievance');
      return;
    }

    if (!formData.recipient_name || !formData.subject || !formData.content) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');

      // Convert date strings to ISO format
      const letterData = {
        ...formData,
        sent_date: formData.sent_date ? new Date(formData.sent_date).toISOString() : null,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date).toISOString() : null
      };

      await createLetter(letterData).unwrap();
      onClose();
    } catch (error) {
      console.error('Error creating letter:', error);
      setError(error.data?.detail || 'Failed to create letter');
    }
  }, [formData, createLetter, onClose]);

  const InputField = React.memo(({ icon: Icon, label, required, children, className = "", description }) => (
    <div className={`space-y-2 ${className}`}>
      <label className="flex items-center text-sm font-medium text-gray-700 gap-2">
        {Icon && <Icon className="text-gray-400 text-sm" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
    </div>
  ));

  // Stable input component to prevent re-renders
  const StableInput = React.memo(({ name, value, onChange, ...props }) => {
    const inputRef = useRef(null);
    
    useEffect(() => {
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }, [value]);
    
    return (
      <input
        ref={inputRef}
        name={name}
        defaultValue={value}
        onChange={onChange}
        {...props}
      />
    );
  });

  const StableTextarea = React.memo(({ name, value, onChange, ...props }) => {
    const textareaRef = useRef(null);
    
    useEffect(() => {
      if (textareaRef.current && textareaRef.current.value !== value) {
        textareaRef.current.value = value;
      }
    }, [value]);
    
    return (
      <textarea
        ref={textareaRef}
        name={name}
        defaultValue={value}
        onChange={onChange}
        {...props}
      />
    );
  });

  const getTabStyle = useCallback((tab) => {
    const isActive = activeTab === tab.id;
    return isActive 
      ? `${tab.color} ${tab.bgColor} border-b-2 ${tab.borderColor}`
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';
  }, [activeTab]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaPaperPlane className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compose New Letter</h2>
              <p className="text-sm text-gray-500">Create and send a new letter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 ${getTabStyle(tab)}`}
                >
                  <Icon className="text-base" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="text-red-700 text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Recipient Tab */}
            {activeTab === 'recipient' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField 
                    icon={FaUser} 
                    label="Name" 
                    required
                    description="Full name of the recipient"
                  >
                    <StableInput
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </InputField>

                  <InputField icon={FaEnvelope} label="Email">
                    <StableInput
                      type="email"
                      name="recipient_email"
                      value={formData.recipient_email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </InputField>

                  <InputField icon={FaPhone} label="Phone">
                    <input
                      type="tel"
                      name="recipient_phone"
                      value={formData.recipient_phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </InputField>

                  <InputField icon={FaBuilding} label="Organization">
                    <input
                      type="text"
                      name="recipient_organization"
                      value={formData.recipient_organization}
                      onChange={handleInputChange}
                      placeholder="Enter organization"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </InputField>
                </div>

                <InputField icon={FaMapMarkerAlt} label="Address">
                  <textarea
                    name="recipient_address"
                    value={formData.recipient_address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                </InputField>
              </div>
            )}

            {/* Letter Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <InputField 
                  icon={FaFileAlt} 
                  label="Subject" 
                  required
                  description="Brief description of the letter's purpose"
                >
                  <StableInput
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Enter subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </InputField>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <InputField label="Category">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Priority">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-yellow-50 border-yellow-300"
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </InputField>

                  <InputField label="Status">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-orange-50 border-orange-300"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </InputField>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField icon={FaCalendar} label="Sent Date">
                    <input
                      type="date"
                      name="sent_date"
                      value={formData.sent_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </InputField>

                  <InputField icon={FaCalendar} label="Follow-up Date">
                    <input
                      type="date"
                      name="follow_up_date"
                      value={formData.follow_up_date}
                      onChange={handleInputChange}
                      placeholder="dd-mm-yyyy"
                      min={formData.sent_date}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </InputField>
                </div>
              </div>
            )}

            {/* Content & Documents Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <InputField 
                  label="Main Content" 
                  required
                  description={`(0/${formData.content.length > 5000 ? '5000+' : formData.content.length})`}
                >
                  <StableTextarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="12"
                    placeholder="Enter the main content of your letter here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    required
                  />
                </InputField>

                <InputField 
                  icon={FaStickyNote} 
                  label="Internal Notes"
                  description="Add any internal notes or reminders"
                >
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Add any internal notes or reminders..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  />
                </InputField>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Document Uploads</p>
                  <p className="text-sm text-gray-500 mb-4">Click to upload documents</p>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    📎 Click to upload documents
                  </button>
                </div>
              </div>
            )}

            {/* Grievance Selection (visible on all tabs) */}
            {loadingGrievances ? (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="animate-spin text-blue-500" />
                  <span className="text-gray-600">Loading accessible grievances...</span>
                </div>
              </div>
            ) : grievancesError ? (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center space-x-2">
                  <FaTimes className="text-red-500" />
                  <span className="text-red-700 text-sm">
                    Error loading grievances: {typeof grievancesError?.data?.detail === 'string' 
                      ? grievancesError.data.detail 
                      : grievancesError?.data?.detail?.message || 
                        grievancesError?.message || 
                        'Please try again'}
                  </span>
                </div>
              </div>
            ) : grievances && grievances.length === 0 ? (
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center space-x-2">
                  <FaFlag className="text-yellow-500" />
                  <span className="text-yellow-700 text-sm">
                    No grievances available for creating letters. You can only create letters for grievances assigned to you or that you have logged.
                  </span>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Grievance <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({grievances?.length || 0} available)
                  </span>
                </label>
                <select
                  name="grievance_id"
                  value={formData.grievance_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white"
                  required
                >
                  <option value="">Choose the grievance for this letter</option>
                  {grievances?.map((grievance) => (
                    <option key={grievance.id} value={grievance.id}>
                      #{grievance.id} - {grievance.title} 
                      {grievance.assigned_to && ` (Assigned to: ${grievance.assigned_to})`}
                    </option>
                  ))}
                </select>
                {grievances && grievances.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 You can only create letters for grievances assigned to you or that you have logged.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer with status indicators and actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Status Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ● {formData.priority} Priority
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ● {formData.category}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              ● {formData.status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <FaTimes className="text-sm" />
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={createLoading || !formData.grievance_id || !formData.recipient_name || !formData.subject || !formData.content}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl"
            >
              {createLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Sending Letter...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send Letter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AddLetterModal);  