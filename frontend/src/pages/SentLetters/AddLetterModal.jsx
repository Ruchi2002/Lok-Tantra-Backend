import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding, FaFileAlt, FaTags, FaFlag, FaCalendarAlt, FaStickyNote, FaPaperPlane, FaPaperclip, FaTrash, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import { useCreateMutation } from '../../store/api/sentLettersApi';

const AddLetterModal = ({ onClose, categories = ['Education', 'Health', 'Infrastructure', 'Business', 'Policy', 'Environment', 'Social Welfare', 'Public Safety', 'Transportation', 'Utilities', 'Other'], priorities = ['High', 'Medium', 'Low'], statuses = ['Draft', 'Sent', 'Awaiting Response', 'Response Received', 'Closed'] }) => {
  const { currentLang } = useLanguage();
  const [createLetter, { isLoading }] = useCreateMutation();
  const [formData, setFormData] = useState({
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
    notes: '',
    documents: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Priority colors
  const priorityColors = {
    High: 'bg-red-50 border-red-200 text-red-700',
    Medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    Low: 'bg-green-50 border-green-200 text-green-700'
  };

  // Status colors
  const statusColors = {
    Draft: 'bg-gray-50 border-gray-200 text-gray-700',
    Sent: 'bg-blue-50 border-blue-200 text-blue-700',
    'Awaiting Response': 'bg-orange-50 border-orange-200 text-orange-700',
    'Response Received': 'bg-green-50 border-green-200 text-green-700',
    Closed: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation = fallbackTranslations?.sentLetters?.[key]?.[currentLang] ||
                         fallbackTranslations?.sentLetters?.[key]?.en ||
                         key;
      return translation;
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipient_name.trim()) {
      newErrors.recipient_name = 'Recipient name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 1000 words (5000 characters)';
    }

    if (formData.recipient_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipient_email)) {
      newErrors.recipient_email = 'Invalid email format';
    }

    if (formData.follow_up_date && formData.follow_up_date < formData.sent_date) {
      newErrors.follow_up_date = 'Follow-up date must be after sent date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Update formData with file names
    const fileNames = [...selectedFiles, ...files].map(file => file.name).join(', ');
    setFormData(prev => ({
      ...prev,
      documents: fileNames
    }));
  };

  // Remove file from selection
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    // Update formData with remaining file names
    const fileNames = newFiles.map(file => file.name).join(', ');
    setFormData(prev => ({
      ...prev,
      documents: fileNames
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createLetter(formData).unwrap();
      onClose();
    } catch (error) {
      console.error('Error creating letter:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-[98vw] lg:max-w-7xl h-[98vh] shadow-2xl border border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaPaperPlane className="text-white text-sm sm:text-base lg:text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Compose New Letter</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Create and send a new letter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:rotate-90"
            disabled={isLoading}
          >
            <FaTimes className="text-gray-600 text-sm sm:text-base" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="min-h-full flex flex-col">
            
            {/* Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              
              {/* Column 1: Recipient Basic Info */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FaUser className="text-emerald-600 text-xs sm:text-sm" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recipient</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaUser className="text-gray-400 text-xs" />
                      Name *
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      value={formData.recipient_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                        errors.recipient_name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter name"
                    />
                    {errors.recipient_name && <p className="mt-1 text-xs sm:text-sm text-red-600">⚠️ {errors.recipient_name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaEnvelope className="text-gray-400 text-xs" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="recipient_email"
                      value={formData.recipient_email}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                        errors.recipient_email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter email"
                    />
                    {errors.recipient_email && <p className="mt-1 text-xs sm:text-sm text-red-600">⚠️ {errors.recipient_email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaPhone className="text-gray-400 text-xs" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="recipient_phone"
                      value={formData.recipient_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      placeholder="Enter phone"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaBuilding className="text-gray-400 text-xs" />
                      Organization
                    </label>
                    <input
                      type="text"
                      name="recipient_organization"
                      value={formData.recipient_organization}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      placeholder="Enter organization"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" />
                      Address
                    </label>
                    <textarea
                      name="recipient_address"
                      value={formData.recipient_address}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Letter Details */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-blue-600 text-xs sm:text-sm" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Letter Details</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaFileAlt className="text-gray-400 text-xs" />
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                        errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter subject"
                    />
                    {errors.subject && <p className="mt-1 text-xs sm:text-sm text-red-600">⚠️ {errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaTags className="text-gray-400 text-xs" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white"
                    >
                      {categories.map((category, index) => (
                        <option key={`category-${index}-${typeof category === 'object' ? category.value || category.label || JSON.stringify(category) : category}`} value={category}>{typeof category === 'object' ? category.value || category.label || JSON.stringify(category) : category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaFlag className="text-gray-400 text-xs" />
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${priorityColors[formData.priority]}`}
                    >
                      {priorities.map((priority, index) => (
                        <option key={`priority-${index}-${typeof priority === 'object' ? priority.value || priority.label || JSON.stringify(priority) : priority}`} value={priority}>{typeof priority === 'object' ? priority.value || priority.label || JSON.stringify(priority) : priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${statusColors[formData.status]}`}
                    >
                      {statuses.map((status, index) => (
                        <option key={`status-${index}-${typeof status === 'object' ? status.value || status.label || JSON.stringify(status) : status}`} value={status}>{typeof status === 'object' ? status.value || status.label || JSON.stringify(status) : status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        Sent Date
                      </label>
                      <input
                        type="date"
                        name="sent_date"
                        value={formData.sent_date}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        name="follow_up_date"
                        value={formData.follow_up_date}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                          errors.follow_up_date ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      {errors.follow_up_date && <p className="mt-1 text-xs sm:text-sm text-red-600">⚠️ {errors.follow_up_date}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Letter Content & Documents */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-purple-600 text-xs sm:text-sm" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Content & Documents</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaFileAlt className="text-gray-400 text-xs" />
                      Main Content * ({formData.content.length}/5000)
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      className={`w-full h-32 sm:h-40 lg:h-48 px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none ${
                        errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      placeholder="Enter the main content of your letter here..."
                    />
                    {errors.content && <p className="mt-1 text-xs sm:text-sm text-red-600">⚠️ {errors.content}</p>}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaStickyNote className="text-gray-400 text-xs" />
                      Internal Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none"
                      placeholder="Add any internal notes or reminders..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <FaPaperclip className="text-gray-400 text-xs" />
                      Document Uploads
                    </label>
                    <div className="space-y-3">
                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                        />
                        <label
                          htmlFor="file-upload"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 text-sm"
                        >
                          <FaPaperclip className="text-sm" />
                          <span className="text-xs sm:text-sm">Click to upload documents</span>
                        </label>
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm font-medium text-gray-700">Selected Files:</p>
                          {selectedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <FaFileAlt className="text-blue-500 text-sm flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 sm:pt-8 border-t border-gray-100 mt-6 sm:mt-8 flex-shrink-0">
              {/* Letter Summary */}
              <div className="hidden lg:flex items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    formData.priority === 'High' ? 'bg-red-400' :
                    formData.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <span>{formData.priority} Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTags className="text-gray-400" />
                  <span>{formData.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[formData.status].includes('blue') ? 'bg-blue-400' : statusColors[formData.status].includes('green') ? 'bg-green-400' : statusColors[formData.status].includes('orange') ? 'bg-orange-400' : statusColors[formData.status].includes('red') ? 'bg-red-400' : 'bg-gray-400'}`}></div>
                  <span>{formData.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <FaTimes className="text-sm" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Letter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLetterModal;