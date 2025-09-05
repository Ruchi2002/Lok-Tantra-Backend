import React, { useState } from 'react';
import { 
  CalendarDays, 
  FileText, 
  Star, 
  CheckCircle, 
  Clock,
  Edit, 
  Trash2, 
  MoreVertical,
  Eye,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

const SessionCard = ({ session, onEdit, onDelete }) => {
  const { t, tSection } = useTranslation();
  const tLokSabha = tSection('dashboard'); // Using dashboard section for Lok Sabha translations
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (session.pending_questions === 0) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (session.pending_questions > 0) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = () => {
    if (session.pending_questions === 0) {
      return 'Completed';
    } else if (session.pending_questions > 0) {
      return 'Active';
    }
    return 'Unknown';
  };

  const getStatusIcon = () => {
    if (session.pending_questions === 0) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (session.pending_questions > 0) {
      return <Clock className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  const calculateProgress = () => {
    if (session.total_questions === 0) return 0;
    return (session.answered_questions / session.total_questions) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {session.session_number}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <CalendarDays className="w-4 h-4" />
              <span>{formatDate(session.date)}</span>
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowDetails(!showDetails);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showDetails ? tLokSabha('hideDetails') : tLokSabha('viewDetails')}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {tLokSabha('edit')}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {tLokSabha('delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{session.total_questions}</div>
            <div className="text-xs text-blue-600 font-medium">{tLokSabha('totalQuestions')}</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{session.answered_questions}</div>
            <div className="text-xs text-green-600 font-medium">{tLokSabha('answeredQuestions')}</div>
          </div>
        </div>

        {/* Question Types */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700">{tLokSabha('starredQuestionsCount')}</span>
            </div>
            <span className="font-medium text-gray-900">{session.starred_questions}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{tLokSabha('unstarredQuestionsCount')}</span>
            </div>
            <span className="font-medium text-gray-900">{session.unstarred_questions}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{t('progress')}</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Top Ministries */}
        {session.top_ministries && session.top_ministries.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4" />
              {tLokSabha('topMinistries')}
            </div>
            <div className="flex flex-wrap gap-1">
              {session.top_ministries.slice(0, 3).map((ministry, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {ministry}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">{tLokSabha('sessionDetails')}</h4>
          
          {/* Questions List */}
          {session.questions && session.questions.length > 0 ? (
            <div className="space-y-3">
              {session.questions.map((question) => (
                <div key={question.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {question.type === 'Starred' ? (
                        <Star className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{question.type}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      question.outcome === 'Answered' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {question.outcome}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{tLokSabha('ministry')}:</strong> {question.ministry}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>{tLokSabha('subject')}:</strong> {question.subject}
                  </div>
                  {question.answer_text && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                              <strong>{t('answer')}:</strong> {question.answer_text.substring(0, 100)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t('noQuestionsRecorded')}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{tLokSabha('pendingQuestions')}: {session.pending_questions}</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{t('performanceTracker')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
