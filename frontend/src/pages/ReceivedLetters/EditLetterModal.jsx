import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner, FaPaperclip, FaFileAlt, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import { useUpdateReceivedLetterMutation } from '../../store/api/appApi';

const EditLetterModal = ({ isOpen, onClose, onSuccess, letter }) => {
  const { currentLang } = useLanguage();
  const [updateLetter, { isLoading }] = useUpdateReceivedLetterMutation();
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
    received_date: '',
    due_date: '',
    response_content: '',
    notes: '',
    attachments: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  // Sample data for dropdowns - in a real app, these would come from API
  const categories = ['Education', 'Health', 'Infrastructure', 'Business', 'Policy', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['New', 'Under Review', 'Replied', 'Closed'];

  // Get translated labels
  const getTranslatedLabel = (key) => {
    return fallbackTranslations.receivedLetters?.[key]?.[currentLang] || key;
  };

  // Populate form when letter data is available
  useEffect(() => {
    if (isOpen && letter) {
      setFormData({
        sender: letter.sender || letter.sender_name || '',
        sender_email: letter.sender_email || '',
        sender_phone: letter.sender_phone || '',
        sender_address: letter.sender_address || '',
        subject: letter.subject || '',
        content: letter.content || '',
        category: letter.category || 'Other',
        priority: letter.priority || 'Medium',
        status: letter.status || 'New',
        received_date: letter.received_date ? new Date(letter.received_date).toISOString().split('T')[0] : '',
        due_date: letter.due_date ? new Date(letter.due_date).toISOString().split('T')[0] : '',
        response_content: letter.response_content || '',
        notes: letter.notes || '',
        attachments: letter.attachments || ''
      });
      setErrors({});
      setSelectedFiles([]);
      
      // Parse existing attachments
      if (letter.attachments) {
        setExistingAttachments(letter.attachments.split(',').map(att => att.trim()).filter(att => att));
      } else {
        setExistingAttachments([]);
      }
    }
  }, [isOpen, letter]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.sender.trim()) {
      newErrors.sender = getTranslatedLabel('senderRequired') || 'Sender name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = getTranslatedLabel('subjectRequired') || 'Subject is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = getTranslatedLabel('contentRequired') || 'Content is required';
    }

    if (formData.sender_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sender_email)) {
      newErrors.sender_email = getTranslatedLabel('invalidEmail') || 'Invalid email format';
    }

    if (formData.due_date && formData.received_date && formData.due_date < formData.received_date) {
      newErrors.due_date = getTranslatedLabel('dueDateAfterReceived') || 'Due date must be after received date';
    }

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

      await updateLetter({ letterId: letter.id, letterData }).unwrap();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating letter:', error);
      // Handle error - you might want to show a toast notification here
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
    const allFileNames = [
      ...existingAttachments,
      ...selectedFiles.map(f => f.name),
      ...files.map(f => f.name)
    ].join(', ');
    
    setFormData(prev => ({
      ...prev,
      attachments: allFileNames
    }));
  };

  // Remove new file from selection
  const removeNewFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    // Update formData with remaining file names
    const allFileNames = [
      ...existingAttachments,
      ...newFiles.map(f => f.name)
    ].join(', ');
    
    setFormData(prev => ({
      ...prev,
      attachments: allFileNames
    }));
  };

  // Remove existing attachment
  const removeExistingAttachment = (index) => {
    const newExistingAttachments = existingAttachments.filter((_, i) => i !== index);
    setExistingAttachments(newExistingAttachments);
    
    // Update formData with remaining file names
    const allFileNames = [
      ...newExistingAttachments,
      ...selectedFiles.map(f => f.name)
    ].join(', ');
    
    setFormData(prev => ({
      ...prev,
      attachments: allFileNames
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

  if (!isOpen || !letter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {getTranslatedLabel('editLetter') || 'Edit Letter'} - #{letter.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FaTimes size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {getTranslatedLabel('senderInformation') || 'Sender Information'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('senderName') || 'Sender Name'} *
                </label>
                <input
                  type="text"
                  name="sender"
                  value={formData.sender}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sender ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getTranslatedLabel('enterSenderName') || 'Enter sender name'}
                />
                {errors.sender && (
                  <p className="mt-1 text-sm text-red-600">{errors.sender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('senderEmail') || 'Email'}
                </label>
                <input
                  type="email"
                  name="sender_email"
                  value={formData.sender_email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.sender_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getTranslatedLabel('enterEmail') || 'Enter email address'}
                />
                {errors.sender_email && (
                  <p className="mt-1 text-sm text-red-600">{errors.sender_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('senderPhone') || 'Phone'}
                </label>
                <input
                  type="tel"
                  name="sender_phone"
                  value={formData.sender_phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getTranslatedLabel('enterPhone') || 'Enter phone number'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('senderAddress') || 'Address'}
                </label>
                <textarea
                  name="sender_address"
                  value={formData.sender_address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={getTranslatedLabel('enterAddress') || 'Enter address'}
                />
              </div>
            </div>

            {/* Letter Details */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {getTranslatedLabel('letterDetails') || 'Letter Details'}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('subject') || 'Subject'} *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.subject ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={getTranslatedLabel('enterSubject') || 'Enter letter subject'}
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('category') || 'Category'}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('priority') || 'Priority'}
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getTranslatedLabel('status') || 'Status'}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslatedLabel('receivedDate') || 'Received Date'}
                  </label>
                  <input
                    type="date"
                    name="received_date"
                    value={formData.received_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslatedLabel('dueDate') || 'Due Date'}
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.due_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.due_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslatedLabel('content') || 'Content'} *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={getTranslatedLabel('enterLetterContent') || 'Enter letter content...'}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Response Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslatedLabel('responseContent') || 'Response Content'}
            </label>
            <textarea
              name="response_content"
              value={formData.response_content}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={getTranslatedLabel('enterResponseContent') || 'Enter response content...'}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getTranslatedLabel('notes') || 'Notes'}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={getTranslatedLabel('enterNotes') || 'Enter any additional notes...'}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FaPaperclip className="text-gray-600" />
              {getTranslatedLabel('attachments') || 'Attachments'}
            </label>
            <div className="space-y-3">
              {/* File Upload Input */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="edit-file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="edit-file-upload"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <FaPaperclip className="text-sm" />
                  <span>Click to upload additional documents</span>
                </label>
              </div>

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Existing Attachments:</p>
                  {existingAttachments.map((attachment, index) => (
                    <div
                      key={`existing-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-blue-500 text-sm" />
                        <span className="text-sm font-medium text-gray-800">{attachment}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove attachment"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">New Files to Upload:</p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`new-${index}`}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-blue-500 text-sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove file"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              disabled={isLoading}
            >
              {getTranslatedLabel('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {getTranslatedLabel('saving') || 'Saving...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {getTranslatedLabel('updateLetter') || 'Update Letter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLetterModal;

