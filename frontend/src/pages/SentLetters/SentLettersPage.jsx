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
import { FaSpinner, FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaChartBar, FaClock, FaExclamationTriangle, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const SentLettersPage = () => {
  const { user, isAuthenticated, canEditLetter, canDeleteLetter } = useAuth();
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
  const [showFilters, setShowFilters] = useState(false);

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
  const totalCount = lettersData?.total_count || 0;

  // Handle letter deletion
  const handleDeleteLetter = async (letter) => {
    // Check if user can delete this specific letter
    if (!canDeleteLetter(letter)) {
      alert('You do not have permission to delete this letter');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        await deleteLetter(letter.id).unwrap();
      } catch (error) {
        console.error('Error deleting letter:', error);
        alert('Failed to delete letter');
      }
    }
  };

  // Handle letter edit
  const handleEditLetter = (letter) => {
    // Check if user can edit this specific letter
    if (!canEditLetter(letter)) {
      alert('You do not have permission to edit this letter');
      return;
    }
    setSelectedLetter(letter);
    setShowEditModal(true);
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

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter || priorityFilter || categoryFilter || searchTerm;

  // Count active filters
  const activeFiltersCount = [statusFilter, priorityFilter, categoryFilter].filter(Boolean).length;

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Awaiting Response':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Response Received':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Mobile card component for letters
  const LetterCard = ({ letter }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {letter.recipient_name}
          </h3>
          {letter.recipient_organization && (
            <p className="text-xs text-gray-500 truncate">
              {letter.recipient_organization}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-2">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(letter.status)}`}>
            {letter.status}
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(letter.priority)}`}>
            {letter.priority}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-900 font-medium mb-1">
          {letter.subject}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span>{labels.getText('sent')}: {formatDate(letter.sent_date)}</span>
          <span>•</span>
          <span>{labels.getText('category')}: {letter.category}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => {
            setSelectedLetter(letter);
            setShowViewModal(true);
          }}
          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          title={labels.getText('view')}
        >
          <FaEye className="text-sm" />
        </button>
        {canEditLetter(letter) && (
          <button
            onClick={() => handleEditLetter(letter)}
            className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
            title={labels.getText('edit')}
          >
            <FaEdit className="text-sm" />
          </button>
        )}
        {letter.status === 'Awaiting Response' && (
          <button
            onClick={() => {
              setSelectedLetter(letter);
              setShowResponseModal(true);
            }}
            className="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded-lg transition-colors"
            title={labels.getText('recordResponse')}
          >
            📝
          </button>
        )}
        {canDeleteLetter(letter) && (
          <button
            onClick={() => handleDeleteLetter(letter)}
            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title={labels.getText('delete')}
          >
            <FaTrash className="text-sm" />
          </button>
        )}
      </div>
    </div>
  );

  if (lettersLoading && letters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6  mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            {labels.getText('sentLetters')} - {labels.getText('publicInterest')}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {labels.getText('manageOutgoingLetters')}
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                  <FaChartBar className="text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{labels.getText('totalLetters')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{statistics.total_letters}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                  <FaClock className="text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{labels.getText('awaitingResponse')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{statistics.awaiting_response}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-red-100 text-red-600 flex-shrink-0">
                  <FaExclamationTriangle className="text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{labels.getText('overdueFollowups')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{statistics.overdue_followups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                  <FaClock className="text-sm sm:text-lg lg:text-xl" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{labels.getText('dueThisWeek')}</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{statistics.followups_due_this_week}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Controls */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Top Row: Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder={labels.getText('searchLetters')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex-shrink-0"
              >
                <FaPlus className="text-sm" />
                <span className="hidden sm:inline">{labels.getText('addLetter')}</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg sm:rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                  showFilters 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className="text-sm" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                {showFilters ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl flex items-center gap-2 transition-all duration-200 text-sm font-medium"
                >
                  <FaTimes className="text-sm" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>

            {/* Collapsible Filters */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showFilters ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white"
                  >
                    <option value="">{labels.getText('allStatuses')}</option>
                    {statuses.map((status, index) => (
                      <option key={`status-${index}-${typeof status === 'object' ? status.value || status.label || JSON.stringify(status) : status}`} value={status}>{typeof status === 'object' ? status.value || status.label || JSON.stringify(status) : status}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => {
                      setPriorityFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white"
                  >
                    <option value="">{labels.getText('allPriorities')}</option>
                    {priorities.map((priority, index) => (
                      <option key={`priority-${index}-${typeof priority === 'object' ? priority.value || priority.label || JSON.stringify(priority) : priority}`} value={priority}>{typeof priority === 'object' ? priority.value || priority.label || JSON.stringify(priority) : priority}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm bg-white"
                  >
                    <option value="">{labels.getText('allCategories')}</option>
                    {categories.map((category, index) => (
                      <option key={`category-${index}-${typeof category === 'object' ? category.value || category.label || JSON.stringify(category) : category}`} value={category}>{typeof category === 'object' ? category.value || category.label || JSON.stringify(category) : category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {(letters.length > 0 || hasActiveFilters) && (
          <div className="mb-4 px-1">
            <p className="text-sm text-gray-600">
              {lettersLoading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Loading...
                </span>
              ) : (
                `Showing ${letters.length} of ${totalCount} letters`
              )}
              {hasActiveFilters && (
                <span className="text-blue-600 ml-2">(filtered)</span>
              )}
            </p>
          </div>
        )}

        {/* Error State */}
        {lettersError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              Error loading letters. Please try again.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!lettersLoading && letters.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <div className="mb-4">
              <FaChartBar className="mx-auto text-4xl sm:text-5xl text-gray-300" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? 'No letters match your filters' : 'No letters found'}
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or clear filters to see all letters.'
                : 'Get started by adding your first letter.'
              }
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium transition-colors"
              >
                Add Your First Letter
              </button>
            )}
          </div>
        )}

        {/* Letters Content */}
        {letters.length > 0 && (
          <>
            {/* Mobile View - Cards */}
            <div className="block lg:hidden">
              {letters.map((letter) => (
                <LetterCard key={letter.id} letter={letter} />
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('recipient')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('subject')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('sentDate')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('status')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('priority')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('category')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {labels.getText('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {letters.map((letter) => (
                      <tr key={letter.id} className="hover:bg-gray-50 transition-colors">
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(letter.status)}`}>
                            {letter.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(letter.priority)}`}>
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
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title={labels.getText('view')}
                            >
                              <FaEye className="text-sm" />
                            </button>
                            {canEditLetter(letter) && (
                              <button
                                onClick={() => handleEditLetter(letter)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title={labels.getText('edit')}
                              >
                                <FaEdit className="text-sm" />
                              </button>
                            )}
                            {letter.status === 'Awaiting Response' && (
                              <button
                                onClick={() => {
                                  setSelectedLetter(letter);
                                  setShowResponseModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                title={labels.getText('recordResponse')}
                              >
                                📝
                              </button>
                            )}
                            {canDeleteLetter(letter) && (
                              <button
                                onClick={() => handleDeleteLetter(letter)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title={labels.getText('delete')}
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, totalCount)} of {totalCount} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      {labels.getText('previous')}
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Mobile page indicator */}
                    <div className="sm:hidden px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                      {currentPage} / {totalPages}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      {labels.getText('next')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

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
    </div>
  );
};

export default SentLettersPage;