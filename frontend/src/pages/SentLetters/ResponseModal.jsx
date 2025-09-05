import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaReply, FaUser, FaBuilding, FaFileAlt, FaCalendar } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import { useRecordResponseMutation } from '../../store/api/sentLettersApi';

const ResponseModal = ({ letter, onClose }) => {
  const { currentLang } = useLanguage();
  const [recordResponse, { isLoading }] = useRecordResponseMutation();
  const [responseContent, setResponseContent] = useState('');

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation = fallbackTranslations?.sentLetters?.[key]?.[currentLang] ||
                         fallbackTranslations?.sentLetters?.[key]?.en ||
                         key;
      return translation;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!responseContent.trim()) {
      alert('Response content is required');
      return;
    }

    try {
      await recordResponse({ id: letter.id, response_content: responseContent }).unwrap();
      onClose();
    } catch (error) {
      console.error('Error recording response:', error);
      alert('Failed to record response. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-[98vw] lg:max-w-4xl h-[98vh] shadow-2xl border border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaReply className="text-white text-sm sm:text-base lg:text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Record Response</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Record the response received for this letter</p>
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

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            
            {/* Letter Info */}
            <div className="mb-6 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-blue-500 text-sm" />
                Original Letter
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-400 text-xs" />
                    Recipient:
                  </span>
                  <span className="ml-4 text-gray-900">{letter.recipient_name}</span>
                  {letter.recipient_organization && (
                    <span className="ml-2 text-gray-600">({letter.recipient_organization})</span>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <FaFileAlt className="text-gray-400 text-xs" />
                    Subject:
                  </span>
                  <span className="ml-4 text-gray-900">{letter.subject}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <FaCalendar className="text-gray-400 text-xs" />
                    Sent Date:
                  </span>
                  <span className="ml-4 text-gray-900">
                    {formatDate(letter.sent_date)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <FaBuilding className="text-gray-400 text-xs" />
                    Category:
                  </span>
                  <span className="ml-4 text-gray-900">{letter.category}</span>
                </div>
              </div>
            </div>

            {/* Response Form */}
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                  <FaReply className="text-gray-400 text-xs" />
                  Response Content * ({responseContent.length}/5000)
                </label>
                <textarea
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  className="w-full h-48 sm:h-56 lg:h-64 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 resize-none text-sm sm:text-base"
                  placeholder="Enter the response content received..."
                  required
                />
              </div>

              {/* Character count warning */}
              {responseContent.length > 4500 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    ⚠️ Response is getting long. Consider keeping it concise and clear.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 mt-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <FaTimes className="text-sm" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !responseContent.trim()}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <FaReply />
                      Record Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
