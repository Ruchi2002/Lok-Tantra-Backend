import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaEdit, FaCalendar, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt, FaDownload, FaEye } from 'react-icons/fa';
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

  // Handle document download/view
  const handleDocumentAction = (documentPath, action = 'view') => {
    if (action === 'download') {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = documentPath;
      link.download = documentPath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open document in new tab for viewing
      window.open(documentPath, '_blank');
    }
  };

  // Parse documents string to array
  const getDocuments = () => {
    if (!letter.documents) return [];
    return letter.documents.split(',').map(doc => doc.trim()).filter(doc => doc);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-[98vw] lg:max-w-6xl h-[98vh] shadow-2xl border border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaEye className="text-white text-sm sm:text-base lg:text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Letter Details</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">View complete letter information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:rotate-90"
          >
            <FaTimes className="text-gray-600 text-sm sm:text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Left Column - Letter Info */}
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Status
                  </label>
                  <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                    {letter.status}
                  </span>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Priority
                  </label>
                  <span className={`inline-flex px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                    {letter.priority}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Subject
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{letter.subject}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Category
                </label>
                <p className="text-gray-900">{letter.category}</p>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Sent Date
                  </label>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400 text-sm" />
                    <span className="text-gray-900">{formatDate(letter.sent_date)}</span>
                  </div>
                </div>

                {letter.follow_up_date && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Follow-up Date
                    </label>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400 text-sm" />
                      <span className="text-gray-900">{formatDate(letter.follow_up_date)}</span>
                    </div>
                  </div>
                )}

                {letter.response_received_date && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                      Response Received Date
                    </label>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-gray-400 text-sm" />
                      <span className="text-gray-900">{formatDate(letter.response_received_date)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Content
                </label>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{letter.content}</p>
                </div>
              </div>

              {/* Response Content */}
              {letter.response_content && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Response Content
                  </label>
                  <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{letter.response_content}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {letter.notes && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Notes
                  </label>
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{letter.notes}</p>
                  </div>
                </div>
              )}

              {/* Documents */}
              {getDocuments().length > 0 && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Documents
                  </label>
                  <div className="space-y-2">
                    {getDocuments().map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <FaFileAlt className="text-blue-500 text-sm flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{doc}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDocumentAction(doc, 'view')}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                            title="View document"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDocumentAction(doc, 'download')}
                            className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors flex-shrink-0"
                            title="Download document"
                          >
                            <FaDownload className="text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Recipient Info & Actions */}
            <div className="space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">
                Recipient Information
              </h3>

              {/* Recipient Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Recipient Name
                </label>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400 text-sm" />
                  <span className="text-gray-900 font-medium">{letter.recipient_name}</span>
                </div>
              </div>

              {/* Organization */}
              {letter.recipient_organization && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Organization
                  </label>
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-gray-400 text-sm" />
                    <span className="text-gray-900">{letter.recipient_organization}</span>
                  </div>
                </div>
              )}

              {/* Email */}
              {letter.recipient_email && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400 text-sm" />
                    <a href={`mailto:${letter.recipient_email}`} className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
                      {letter.recipient_email}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {letter.recipient_phone && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400 text-sm" />
                    <a href={`tel:${letter.recipient_phone}`} className="text-blue-600 hover:text-blue-800 text-sm sm:text-base">
                      {letter.recipient_phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              {letter.recipient_address && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                    Address
                  </label>
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-gray-400 text-sm mt-1" />
                    <span className="text-gray-900 text-sm sm:text-base">{letter.recipient_address}</span>
                  </div>
                </div>
              )}

              {/* Status Update Section */}
              <div className="border-t pt-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Update Status
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                  >
                    <option value="Awaiting Response">Awaiting Response</option>
                    <option value="Response Received">Response Received</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={loading || newStatus === letter.status}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaEdit />
                        Update
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Metadata
                </h4>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(letter.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(letter.updated_at)}
                  </div>
                  {letter.assigned_to && (
                    <div>
                      <span className="font-medium">Assigned To:</span> User ID {letter.assigned_to}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 sm:p-6 lg:p-8 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLetterModal;
