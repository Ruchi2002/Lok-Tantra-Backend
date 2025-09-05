import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaPrint, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, FaUser, FaTag, FaExclamationTriangle, FaPaperclip, FaFileAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';

const ViewLetterModal = ({ isOpen, onClose, letter, onEdit }) => {
  const { currentLang } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Get translated labels
  const getTranslatedLabel = (key) => {
    return fallbackTranslations.receivedLetters?.[key]?.[currentLang] || key;
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Replied':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if letter is overdue
  const isOverdue = () => {
    if (!letter?.due_date) return false;
    return new Date(letter.due_date) < new Date() && letter.status !== 'Closed';
  };

  if (!isOpen || !letter) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-200 gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {getTranslatedLabel('letterDetails') || 'Letter Details'}
            </h2>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                {letter.status}
              </span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                {letter.priority}
              </span>
              {isOverdue() && (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                  <FaExclamationTriangle size={10} />
                  {getTranslatedLabel('overdue') || 'Overdue'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onEdit(letter)}
              className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              title={getTranslatedLabel('editLetter') || 'Edit Letter'}
            >
              <FaEdit size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              title={getTranslatedLabel('printLetter') || 'Print Letter'}
            >
              <FaPrint size={14} className="sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={getTranslatedLabel('close') || 'Close'}
            >
              <FaTimes size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Letter ID and Basic Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {letter.subject}
              </h3>
              <p className="text-sm text-gray-600">
                {getTranslatedLabel('letterId') || 'Letter ID'}: #{letter.id}
              </p>
            </div>
            <div className="text-left sm:text-right text-sm text-gray-600">
              <p>{getTranslatedLabel('receivedOn') || 'Received on'}: {formatDate(letter.received_date)}</p>
              {letter.due_date && (
                <p className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                  {getTranslatedLabel('dueDate') || 'Due date'}: {formatDate(letter.due_date)}
                </p>
              )}
            </div>
          </div>

          {/* Sender Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser />
              {getTranslatedLabel('senderInformation') || 'Sender Information'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getTranslatedLabel('senderName') || 'Name'}:
                </p>
                <p className="text-sm text-gray-900">{letter.sender}</p>
              </div>
              {letter.sender_email && (
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FaEnvelope size={12} />
                    {getTranslatedLabel('email') || 'Email'}:
                  </p>
                  <p className="text-sm text-gray-900">{letter.sender_email}</p>
                </div>
              )}
              {letter.sender_phone && (
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FaPhone size={12} />
                    {getTranslatedLabel('phone') || 'Phone'}:
                  </p>
                  <p className="text-sm text-gray-900">{letter.sender_phone}</p>
                </div>
              )}
              {letter.sender_address && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FaMapMarkerAlt size={12} />
                    {getTranslatedLabel('address') || 'Address'}:
                  </p>
                  <p className="text-sm text-gray-900">{letter.sender_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Letter Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaTag />
              {getTranslatedLabel('letterDetails') || 'Letter Details'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getTranslatedLabel('category') || 'Category'}:
                </p>
                <p className="text-sm text-gray-900">{letter.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getTranslatedLabel('priority') || 'Priority'}:
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                  {letter.priority}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {getTranslatedLabel('status') || 'Status'}:
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                  {letter.status}
                </span>
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              {getTranslatedLabel('content') || 'Content'}
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                {letter.content}
              </div>
            </div>
          </div>

          {/* Response Information */}
          {letter.response_content && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                {getTranslatedLabel('response') || 'Response'}
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                  {letter.response_content}
                </div>
                {letter.response_date && (
                  <p className="text-xs text-gray-600 mt-2">
                    {getTranslatedLabel('respondedOn') || 'Responded on'}: {formatDateTime(letter.response_date)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {letter.notes && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                {getTranslatedLabel('notes') || 'Notes'}
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed">
                  {letter.notes}
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
          {letter.attachments && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaPaperclip className="text-gray-600" />
                {getTranslatedLabel('attachments') || 'Attachments'}
              </h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {letter.attachments.split(',').map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mb-2 last:mb-0">
                    <div className="flex items-center gap-3">
                      <FaFileAlt className="text-blue-500 text-sm" />
                      <span className="text-sm text-gray-900 font-medium">{attachment.trim()}</span>
                    </div>
                    <button
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download attachment"
                    >
                      <FaDownload size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">
              {getTranslatedLabel('systemInformation') || 'System Information'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-gray-700">
                  {getTranslatedLabel('createdOn') || 'Created on'}: {formatDateTime(letter.created_at)}
                </p>
                <p className="text-gray-700">
                  {getTranslatedLabel('lastUpdated') || 'Last updated'}: {formatDateTime(letter.updated_at)}
                </p>
              </div>
              <div>
                {letter.assigned_to && (
                  <p className="text-gray-700">
                    {getTranslatedLabel('assignedTo') || 'Assigned to'}: User #{letter.assigned_to}
                  </p>
                )}
                {letter.tenant_id && (
                  <p className="text-gray-700">
                    {getTranslatedLabel('tenant') || 'Tenant'}: #{letter.tenant_id}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={() => onEdit(letter)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <FaEdit size={14} />
            {getTranslatedLabel('editLetter') || 'Edit Letter'}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
          >
            {getTranslatedLabel('close') || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLetterModal;

