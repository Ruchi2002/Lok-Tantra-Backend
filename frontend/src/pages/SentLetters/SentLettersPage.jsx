import React, { useState, useMemo } from 'react';
import {
  useGetAllQuery,
  useGetStatisticsQuery,
  useGetCategoriesQuery,
  useGetPrioritiesQuery,
  useGetStatusesQuery,
  useDeleteMutation,
  useUpdateStatusMutation,
  useRecordResponseMutation
} from '../../store/api/sentLettersApi';
import AddLetterModal from './AddLetterModal';
import ViewLetterModal from './ViewLetterModal';
import EditLetterModal from './EditLetterModal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import ResponseModal from './ResponseModal';
import { FaSpinner, FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaChartBar, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const SentLettersPage = () => {
  const { currentLang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation = fallbackTranslations?.sentLetters?.[key]?.[currentLang] ||
                         fallbackTranslations?.sentLetters?.[key]?.en ||
                         key;
      return translation;
    }
  };

  // RTK Query hooks
  const {
    data: lettersData,
    isLoading: lettersLoading,
    error: lettersError
  } = useGetAllQuery({
    page: currentPage,
    per_page: perPage,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined
  });

  const { data: statistics } = useGetStatisticsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: priorities = [] } = useGetPrioritiesQuery();
  const { data: statuses = [] } = useGetStatusesQuery();

  // Mutations
  const [deleteLetter] = useDeleteMutation();
  const [updateStatus] = useUpdateStatusMutation();
  const [recordResponse] = useRecordResponseMutation();

  // Extract data
  const letters = lettersData?.letters || [];
  const totalPages = lettersData?.total_pages || 1;

  // Handle letter deletion
  const handleDeleteLetter = async (letterId) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        await deleteLetter(letterId).unwrap();
      } catch (error) {
        console.error('Error deleting letter:', error);
        alert('Failed to delete letter');
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (letterId, status) => {
    try {
      await updateStatus({ id: letterId, status }).unwrap();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Handle response recording
  const handleRecordResponse = async (letterId, responseContent) => {
    try {
      await recordResponse({ id: letterId, response_content: responseContent }).unwrap();
      setShowResponseModal(false);
      setSelectedLetter(null);
    } catch (error) {
      console.error('Error recording response:', error);
      throw error;
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

  if (lettersLoading && letters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {labels.getText('sentLetters')} - {labels.getText('publicInterest')}
        </h1>
        <p className="text-gray-600">
          {labels.getText('manageOutgoingLetters')}
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaChartBar className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('totalLetters')}</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.total_letters}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaClock className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('awaitingResponse')}</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.awaiting_response}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('overdueFollowups')}</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.overdue_followups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaClock className="text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('dueThisWeek')}</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.followups_due_this_week}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={labels.getText('searchLetters')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{labels.getText('allStatuses')}</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{labels.getText('allPriorities')}</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{labels.getText('allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus />
              {labels.getText('addLetter')}
            </button>
          </div>
        </div>

        {/* Letters Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('recipient')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('sentDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {letters.map((letter) => (
                <tr key={letter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {letter.recipient_name}
                      </div>
                      {letter.recipient_organization && (
                        <div className="text-sm text-gray-500">
                          {letter.recipient_organization}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {letter.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(letter.sent_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                      {letter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                      {letter.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {letter.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLetter(letter);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title={labels.getText('view')}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLetter(letter);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title={labels.getText('edit')}
                      >
                        <FaEdit />
                      </button>
                      {letter.status === 'Awaiting Response' && (
                        <button
                          onClick={() => {
                            setSelectedLetter(letter);
                            setShowResponseModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title={labels.getText('recordResponse')}
                        >
                          📝
                        </button>
                      )}
                      {/* <button
                        onClick={() => handleDeleteLetter(letter.id)}
                        className="text-red-600 hover:text-red-900"
                        title={labels.getText('delete')}
                      >
                        <FaTrash />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {labels.getText('showing')} {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, letters.length)} of {letters.length} {labels.getText('results')}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {labels.getText('previous')}
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {labels.getText('next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLetterModal
          onClose={() => setShowAddModal(false)}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
        />
      )}

      {showViewModal && selectedLetter && (
        <ViewLetterModal
          letter={selectedLetter}
          onClose={() => {
            setShowViewModal(false);
            setSelectedLetter(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showEditModal && selectedLetter && (
        <EditLetterModal
          letter={selectedLetter}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLetter(null);
          }}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
        />
      )}

      {showResponseModal && selectedLetter && (
        <ResponseModal
          letter={selectedLetter}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedLetter(null);
          }}
          onSubmit={handleRecordResponse}
        />
      )}
    </div>
  );
};

export default SentLettersPage;
