import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaEnvelope } from 'react-icons/fa';
import { useRecordSentGrievanceLetterResponseMutation } from '../../store/api/appApi';

const ResponseModal = ({ letter, onClose }) => {
  const [recordResponse, { isLoading: recordLoading }] = useRecordSentGrievanceLetterResponseMutation();
  const [responseContent, setResponseContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      setError('Please enter the response content');
      return;
    }

    try {
      setError('');

      await recordResponse({ letterId: letter.id, responseContent }).unwrap();
      onClose();
    } catch (error) {
      console.error('Error recording response:', error);
      setError(error.data?.detail || 'Failed to record response');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <FaEnvelope className="mr-2 text-blue-600" />
            Record Response Received
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Letter Information */}
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Letter Details</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Subject:</strong> {letter.subject}</p>
              <p><strong>Recipient:</strong> {letter.recipient_name}</p>
              <p><strong>Grievance ID:</strong> {letter.grievance_id}</p>
              <p><strong>Sent Date:</strong> {new Date(letter.sent_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Response Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Content *
            </label>
            <textarea
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              rows="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the response content received from the recipient..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This will update the letter status to "Response Received" and record the response date.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {recordLoading && <FaSpinner className="animate-spin" />}
              <span>{recordLoading ? 'Recording...' : 'Record Response'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResponseModal;
