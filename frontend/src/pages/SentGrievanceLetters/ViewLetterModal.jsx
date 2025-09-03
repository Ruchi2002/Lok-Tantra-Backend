 import React from 'react';
import { FaTimes, FaCalendar, FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ViewLetterModal = ({ letter, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Awaiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'Response Received':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">View Grievance Letter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Letter Header */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{letter.subject}</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                {letter.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                {letter.priority}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {letter.category}
              </span>
            </div>
          </div>

          {/* Grievance Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Linked Grievance</h4>
            <p className="text-blue-800">
              <strong>Grievance ID:</strong> {letter.grievance_id}
            </p>
          </div>

          {/* Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaUser className="mr-2 text-gray-500" />
                Recipient Information
              </h4>
              <div className="space-y-2">
                <p><strong>Name:</strong> {letter.recipient_name}</p>
                {letter.recipient_organization && (
                  <p className="flex items-center">
                    <FaBuilding className="mr-2 text-gray-500" />
                    <strong>Organization:</strong> {letter.recipient_organization}
                  </p>
                )}
                {letter.recipient_email && (
                  <p className="flex items-center">
                    <FaEnvelope className="mr-2 text-gray-500" />
                    <strong>Email:</strong> {letter.recipient_email}
                  </p>
                )}
                {letter.recipient_phone && (
                  <p className="flex items-center">
                    <FaPhone className="mr-2 text-gray-500" />
                    <strong>Phone:</strong> {letter.recipient_phone}
                  </p>
                )}
                {letter.recipient_address && (
                  <p className="flex items-start">
                    <FaMapMarkerAlt className="mr-2 text-gray-500 mt-1" />
                    <div>
                      <strong>Address:</strong><br />
                      {letter.recipient_address}
                    </div>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FaCalendar className="mr-2 text-gray-500" />
                Letter Details
              </h4>
              <div className="space-y-2">
                <p><strong>Sent Date:</strong> {formatDate(letter.sent_date)}</p>
                {letter.follow_up_date && (
                  <p><strong>Follow-up Date:</strong> {formatDate(letter.follow_up_date)}</p>
                )}
                {letter.response_received_date && (
                  <p><strong>Response Received:</strong> {formatDate(letter.response_received_date)}</p>
                )}
                {letter.closure_date && (
                  <p><strong>Closure Date:</strong> {formatDate(letter.closure_date)}</p>
                )}
                <p><strong>Created:</strong> {formatDate(letter.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(letter.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Letter Content</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="whitespace-pre-wrap text-gray-800">{letter.content}</div>
            </div>
          </div>

          {/* Response Content */}
          {letter.response_content && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Response Received</h4>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                <div className="whitespace-pre-wrap text-gray-800">{letter.response_content}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {letter.notes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <div className="whitespace-pre-wrap text-gray-800">{letter.notes}</div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLetterModal;
