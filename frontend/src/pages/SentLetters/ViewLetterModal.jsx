import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaEdit, FaCalendar, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';

const ViewLetterModal = ({ letter, onClose, onStatusUpdate }) => {
  const { currentLang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(letter.status);

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation = fallbackTranslations?.sentLetters?.[key]?.[currentLang] ||
                         fallbackTranslations?.sentLetters?.[key]?.en ||
                         key;
      return translation;
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Awaiting Response':
        return 'bg-yellow-100 text-yellow-800';
      case 'Response Received':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get priority badge color
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (newStatus === letter.status) return;
    
    try {
      setLoading(true);
      await onStatusUpdate(letter.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {labels.getText('letterDetails')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Letter Info */}
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('status')}
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                    {letter.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('priority')}
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                    {letter.priority}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.getText('subject')}
                </label>
                <p className="text-lg font-semibold text-gray-900">{letter.subject}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.getText('category')}
                </label>
                <p className="text-gray-900">{letter.category}</p>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('sentDate')}
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    <span className="text-gray-900">{formatDate(letter.sent_date)}</span>
                  </div>
                </div>

                {letter.follow_up_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels.getText('followUpDate')}
                    </label>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400" />
                      <span className="text-gray-900">{formatDate(letter.follow_up_date)}</span>
                    </div>
                  </div>
                )}

                {letter.response_received_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels.getText('responseReceivedDate')}
                    </label>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400" />
                      <span className="text-gray-900">{formatDate(letter.response_received_date)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.getText('content')}
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{letter.content}</p>
                </div>
              </div>

              {/* Response Content */}
              {letter.response_content && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('responseContent')}
                  </label>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{letter.response_content}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {letter.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('notes')}
                  </label>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{letter.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recipient Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {labels.getText('recipientInformation')}
              </h3>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.getText('recipientName')}
                </label>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <span className="text-gray-900 font-medium">{letter.recipient_name}</span>
                </div>
              </div>

              {/* Organization */}
              {letter.recipient_organization && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('recipientOrganization')}
                  </label>
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-gray-400" />
                    <span className="text-gray-900">{letter.recipient_organization}</span>
                  </div>
                </div>
              )}

              {/* Email */}
              {letter.recipient_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('recipientEmail')}
                  </label>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <a href={`mailto:${letter.recipient_email}`} className="text-blue-600 hover:text-blue-800">
                      {letter.recipient_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {letter.recipient_phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('recipientPhone')}
                  </label>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <a href={`tel:${letter.recipient_phone}`} className="text-blue-600 hover:text-blue-800">
                      {letter.recipient_phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              {letter.recipient_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.getText('recipientAddress')}
                  </label>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-gray-400 mt-1" />
                    <span className="text-gray-900">{letter.recipient_address}</span>
                  </div>
                </div>
              )}

              {/* Status Update Section */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  {labels.getText('updateStatus')}
                </h4>
                <div className="flex gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Awaiting Response">Awaiting Response</option>
                    <option value="Response Received">Response Received</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading || newStatus === letter.status}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {labels.getText('updating')}
                      </>
                    ) : (
                      <>
                        <FaEdit />
                        {labels.getText('update')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  {labels.getText('metadata')}
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{labels.getText('createdAt')}:</span> {formatDate(letter.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">{labels.getText('updatedAt')}:</span> {formatDate(letter.updated_at)}
                  </div>
                  {letter.assigned_to && (
                    <div>
                      <span className="font-medium">{labels.getText('assignedTo')}:</span> User ID {letter.assigned_to}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {labels.getText('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLetterModal;
