import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
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
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Sample data for dropdowns - in a real app, these would come from API
  const categories = ['Education', 'Health', 'Infrastructure', 'Business', 'Policy', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['New', 'Under Review', 'Replied', 'Closed'];

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
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

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

    if (formData.due_date && formData.due_date < formData.received_date) {
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

      await createLetter(letterData).unwrap();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating letter:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTranslatedLabel('addNewLetter') || 'Add New Letter'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
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
              <h3 className="text-lg font-medium text-gray-900">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              {getTranslatedLabel('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                  {getTranslatedLabel('saveLetter') || 'Save Letter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLetterModal;

