import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaTags, FaFlag, FaCalendarAlt, FaStickyNote, FaPaperclip, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import { useCreateReceivedLetterMutation } from '../../store/api/appApi';

const AddLetterModal = ({ isOpen, onClose, onSuccess }) => {
  const { currentLang } = useLanguage();
  const [createLetter, { isLoading }] = useCreateReceivedLetterMutation();
  const [formData, setFormData] = useState({
    sender: '',
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    subject: '',
    content: '',
    category: 'Other',
    priority: 'Medium',
    status: 'New',
    received_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    attachments: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Sample data for dropdowns - these should match the backend enum values
  const categories = ['Education', 'Health', 'Infrastructure', 'Business', 'Policy', 'Environment', 'Social Welfare', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['New', 'Under Review', 'Replied', 'Closed'];

  // Priority colors
  const priorityColors = {
    High: 'bg-red-50 border-red-200 text-red-700',
    Medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    Low: 'bg-green-50 border-green-200 text-green-700'
  };

  // Status colors
  const statusColors = {
    New: 'bg-blue-50 border-blue-200 text-blue-700',
    'Under Review': 'bg-orange-50 border-orange-200 text-orange-700',
    Replied: 'bg-green-50 border-green-200 text-green-700',
    Closed: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  // Get translated labels
  const getTranslatedLabel = (key) => {
    return fallbackTranslations.receivedLetters?.[key]?.[currentLang] || key;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        sender: '',
        sender_email: '',
        sender_phone: '',
        sender_address: '',
        subject: '',
        content: '',
        category: 'Other',
        priority: 'Medium',
        status: 'New',
        received_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        attachments: ''
      });
      setErrors({});
      setSelectedFiles([]);
    }
  }, [isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.sender.trim()) {
      newErrors.sender = 'Sender name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.sender_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
      newErrors.sender_email = 'Invalid email format';
    }

    if (formData.due_date && formData.due_date < formData.received_date) {
      newErrors.due_date = 'Due date must be after received date';
    }

    console.log('Form validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const letterData = {
        ...formData,
        received_date: formData.received_date ? new Date(formData.received_date).toISOString() : null,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      await createLetter(letterData).unwrap();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating letter:', error);
      // Show error to user
      alert(`Failed to create letter: ${error.data?.detail || error.message || 'Unknown error'}`);
    }
  };

  // Handle input changes
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
      attachments: fileNames
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
      attachments: fileNames
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[95vh] shadow-2xl border border-gray-200 flex flex-col max-h-[98vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaEnvelope className="text-white text-sm sm:text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Add New Letter</h2>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Fill in the details below to add a new received letter</p>
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
              
                              {/* Column 1: Sender Information */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FaUser className="text-emerald-600 text-xs sm:text-sm" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Sender Details</h3>
                  </div>
                  
                                  <div className="space-y-3 sm:space-y-4">
                   <div>
                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                       <FaUser className="text-gray-400 text-xs" />
                       Sender Name *
                     </label>
                     <input
                       type="text"
                       name="sender"
                       value={formData.sender}
                       onChange={handleInputChange}
                       className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm ${
                         errors.sender ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                       }`}
                       placeholder="Enter sender name"
                     />
                     {errors.sender && <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">⚠️ {errors.sender}</p>}
                   </div>

                                     <div>
                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                       <FaEnvelope className="text-gray-400 text-xs" />
                       Email Address
                     </label>
                     <input
                       type="email"
                       name="sender_email"
                       value={formData.sender_email}
                       onChange={handleInputChange}
                       className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm ${
                         errors.sender_email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                       }`}
                       placeholder="Enter email address"
                     />
                     {errors.sender_email && <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">⚠️ {errors.sender_email}</p>}
                   </div>

                                     <div>
                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                       <FaPhone className="text-gray-400 text-xs" />
                       Phone Number
                     </label>
                     <input
                       type="tel"
                       name="sender_phone"
                       value={formData.sender_phone}
                       onChange={handleInputChange}
                       className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 text-sm"
                       placeholder="Enter phone number"
                     />
                   </div>

                   <div>
                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                       <FaMapMarkerAlt className="text-gray-400 text-xs" />
                       Address
                     </label>
                     <textarea
                       name="sender_address"
                       value={formData.sender_address}
                       onChange={handleInputChange}
                       rows="2"
                       className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none text-sm"
                       placeholder="Enter sender address"
                     />
                   </div>
                </div>
              </div>

                                                           {/* Column 2: Letter Content */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaFileAlt className="text-blue-600 text-xs sm:text-sm" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Letter Content</h3>
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
                       className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm ${
                         errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                       }`}
                       placeholder="Enter letter subject"
                     />
                     {errors.subject && <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">⚠️ {errors.subject}</p>}
                   </div>

                                       <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                        <FaFileAlt className="text-gray-400 text-xs" />
                        Content *
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        className={`w-full h-24 sm:h-32 lg:h-40 px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none text-sm ${
                          errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="Enter the main content of the letter..."
                      />
                      {errors.content && <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center gap-1">⚠️ {errors.content}</p>}
                    </div>

                                     <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                       <FaStickyNote className="text-gray-400 text-xs" />
                       Additional Notes
                     </label>
                     <textarea
                       name="notes"
                       value={formData.notes}
                       onChange={handleInputChange}
                       rows="2"
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none"
                       placeholder="Any additional notes or comments..."
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                       <FaPaperclip className="text-gray-400 text-xs" />
                       Attachments
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
                           <p className="text-sm font-medium text-gray-700">Selected Files:</p>
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

              {/* Column 3: Letter Metadata */}
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaTags className="text-purple-600 text-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Classification</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaTags className="text-gray-400 text-xs" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaFlag className="text-gray-400 text-xs" />
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${priorityColors[formData.priority]}`}
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${statusColors[formData.status]}`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        Received Date
                      </label>
                      <input
                        type="date"
                        name="received_date"
                        value={formData.received_date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400 text-xs" />
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                          errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      {errors.due_date && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">⚠️ {errors.due_date}</p>}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Summary</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`px-2 py-1 rounded-full ${priorityColors[formData.priority]}`}>
                          {formData.priority}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full ${statusColors[formData.status]}`}>
                          {formData.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium text-gray-800">{formData.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                                                   {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-100 mt-6 sm:mt-8">
               <button
                 type="button"
                 onClick={onClose}
                 className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
                 disabled={isLoading}
               >
                 <FaTimes className="text-sm" />
                 Cancel
               </button>
               <button
                 type="submit"
                 className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <>
                     <FaSpinner className="animate-spin" />
                     Saving...
                   </>
                 ) : (
                   <>
                     <FaSave />
                     Save Letter
                   </>
                 )}
               </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLetterModal;