import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaReply } from 'react-icons/fa';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {labels.getText('recordResponse')}
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
          {/* Letter Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {labels.getText('originalLetter')}
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">{labels.getText('recipient')}:</span>
                <span className="ml-2 text-gray-900">{letter.recipient_name}</span>
                {letter.recipient_organization && (
                  <span className="ml-2 text-gray-600">({letter.recipient_organization})</span>
                )}
              </div>
              <div>
                <span className="font-medium text-gray-700">{labels.getText('subject')}:</span>
                <span className="ml-2 text-gray-900">{letter.subject}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">{labels.getText('sentDate')}:</span>
                <span className="ml-2 text-gray-900">
                  {letter.sent_date ? new Date(letter.sent_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {labels.getText('responseContent')} *
              </label>
              <textarea
                value={responseContent}
                onChange={(e) => setResponseContent(e.target.value)}
                rows="8"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={labels.getText('enterResponseContent')}
                required
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {labels.getText('cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {labels.getText('recording')}
                  </>
                ) : (
                  <>
                    <FaReply />
                    {labels.getText('recordResponse')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResponseModal;
