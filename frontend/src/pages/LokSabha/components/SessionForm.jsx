import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Star, 
  FileText,
  Building2,
  Calendar,
  Save
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const SessionForm = ({ isOpen, onClose, onSubmit, session, isLoading }) => {
  const { t, tSection } = useTranslation();
  const tLokSabha = tSection('dashboard'); // Using dashboard section for Lok Sabha translations
  const [formData, setFormData] = useState({
    session_number: '',
    date: '',
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState({
    type: 'Starred',
    ministry: '',
    subject: '',
    outcome: 'Pending',
    answer_text: '',
    date_asked: ''
  });

  useEffect(() => {
    if (session) {
      setFormData({
        session_number: session.session_number || '',
        date: session.date || '',
        questions: session.questions || []
      });
    } else {
      setFormData({
        session_number: '',
        date: '',
        questions: []
      });
    }
  }, [session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addQuestion = () => {
    if (newQuestion.ministry && newQuestion.subject) {
      const question = {
        id: Date.now(),
        ...newQuestion,
        date_asked: newQuestion.date_asked || formData.date
      };
      
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, question]
      }));
      
      setNewQuestion({
        type: 'Starred',
        ministry: '',
        subject: '',
        outcome: 'Pending',
        answer_text: '',
        date_asked: ''
      });
    }
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.session_number && formData.date) {
      onSubmit(formData);
    }
  };

  const ministries = [
    "Ministry of Finance",
    "Ministry of Health",
    "Ministry of Education",
    "Ministry of Defence",
    "Ministry of Agriculture",
    "Ministry of Transport",
    "Ministry of Rural Development",
    "Ministry of Environment",
    "Ministry of Home Affairs",
    "Ministry of External Affairs",
    "Ministry of Commerce and Industry",
    "Ministry of Labour and Employment",
    "Ministry of Women and Child Development",
    "Ministry of Social Justice and Empowerment",
    "Ministry of Tribal Affairs"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {session ? tLokSabha('editSession') : tLokSabha('newSession')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tLokSabha('sessionNumber')}
              </label>
              <input
                type="text"
                name="session_number"
                value={formData.session_number}
                onChange={handleInputChange}
                placeholder={tLokSabha('enterSessionNumber')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tLokSabha('sessionDate')}
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{tLokSabha('questions')}</h3>
              <span className="text-sm text-gray-500">
                {formData.questions.length} {t('questionsAdded')}
              </span>
            </div>

            {/* Add Question Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">{t('addNewQuestion')}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {tLokSabha('type')}
                  </label>
                  <select
                    name="type"
                    value={newQuestion.type}
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="Starred">Starred</option>
                    <option value="Unstarred">Unstarred</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {tLokSabha('ministry')}
                  </label>
                  <select
                    name="ministry"
                    value={newQuestion.ministry}
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  >
                    <option value="">{t('selectMinistry')}</option>
                    {ministries.map(ministry => (
                      <option key={ministry} value={ministry}>{ministry}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {tLokSabha('outcome')}
                  </label>
                  <select
                    name="outcome"
                    value={newQuestion.outcome}
                    onChange={handleQuestionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Answered">Answered</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {tLokSabha('subject')}
                  </label>
                <input
                  type="text"
                  name="subject"
                  value={newQuestion.subject}
                  onChange={handleQuestionChange}
                  placeholder={t('enterQuestionSubject')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              
              <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {t('answerTextOptional')}
                  </label>
                <textarea
                  name="answer_text"
                  value={newQuestion.answer_text}
                  onChange={handleQuestionChange}
                  placeholder={t('enterAnswerTextIfAvailable')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                {t('addQuestion')}
              </button>
            </div>

            {/* Questions List */}
            {formData.questions.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">{t('addedQuestions')}</h4>
                {formData.questions.map((question, index) => (
                  <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {question.type === 'Starred' ? (
                          <Star className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {t('question')} {index + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          question.outcome === 'Answered' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {question.outcome}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{tLokSabha('ministry')}:</span>
                        <span className="ml-2 text-gray-900">{question.ministry}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">{tLokSabha('type')}:</span>
                        <span className="ml-2 text-gray-900">{question.type}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">{tLokSabha('subject')}:</span>
                      <p className="text-gray-900 text-sm mt-1">{question.subject}</p>
                    </div>
                    
                    {question.answer_text && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-sm">{t('answer')}:</span>
                        <p className="text-gray-900 text-sm mt-1 bg-gray-50 p-2 rounded">
                          {question.answer_text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              {tLokSabha('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.session_number || !formData.date}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {session ? tLokSabha('updateSession') : tLokSabha('createSession')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;



