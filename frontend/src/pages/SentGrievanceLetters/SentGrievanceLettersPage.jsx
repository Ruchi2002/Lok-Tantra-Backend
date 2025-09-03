import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, MapPin, Calendar, User, AlertCircle, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { FaSpinner, FaChartBar, FaClock, FaExclamationTriangle, FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { 
  useGetSentGrievanceLettersQuery, 
  useDeleteSentGrievanceLetterMutation 
} from '../../store/api/appApi';
import AddLetterModal from './AddLetterModal';
import ViewLetterModal from './ViewLetterModal';
import EditLetterModal from './EditLetterModal';
import ResponseModal from './ResponseModal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';
import TranslationTest from './TranslationTest';

const SentGrievanceLettersPage = () => {
  const { currentLang } = useLanguage();
  
  // Debug logging
  console.log('🌐 Current language:', currentLang);
  console.log('📚 Fallback translations available:', !!fallbackTranslations);
  console.log('📚 SentGrievanceLetters translations available:', !!fallbackTranslations?.sentGrievanceLetters);
  console.log('🔤 Test translation for "title":', fallbackTranslations?.sentGrievanceLetters?.title?.[currentLang]);
  console.log('🔤 Test translation for "searchPlaceholder":', fallbackTranslations?.sentGrievanceLetters?.searchPlaceholder?.[currentLang]);
  
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

  // RTK Query hooks from appApi.js
  const params = {
    page: currentPage,
    per_page: perPage,
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    category: categoryFilter || undefined
  };

  const { data: lettersData, isLoading: lettersLoading, error: lettersError } = useGetSentGrievanceLettersQuery(params);
  const [deleteLetter] = useDeleteSentGrievanceLetterMutation();

  // Sample data for dropdowns - in a real app, these would come from API
  const categories = ['Education', 'Health', 'Infrastructure', 'Business', 'Policy', 'Other'];
  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Awaiting', 'Response Received', 'Closed'];

  // Extract data
  const letters = lettersData?.letters || [];
  const totalPages = lettersData?.total_pages || 1;
  const statistics = lettersData?.statistics || {
    total_letters: letters.length,
    awaiting: letters.filter(l => l.status === 'Awaiting').length,
    response_received: letters.filter(l => l.status === 'Response Received').length,
    overdue_followups: letters.filter(l => l.status === 'Awaiting' && new Date(l.sent_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  // Create labels object with getText method
  const labels = {
    getText: (key) => {
      const translation = fallbackTranslations?.sentGrievanceLetters?.[key]?.[currentLang] ||
                         fallbackTranslations?.sentGrievanceLetters?.[key]?.en ||
                         key;
      console.log(`🔤 Translation for key "${key}" in language "${currentLang}":`, translation);
      return translation;
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filters
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'priority':
        setPriorityFilter(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  // Handle letter actions
  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setShowViewModal(true);
  };

  const handleEditLetter = (letter) => {
    setSelectedLetter(letter);
    setShowEditModal(true);
  };

  const handleDeleteLetter = async (letterId) => {
    if (window.confirm('Are you sure you want to delete this letter?')) {
      try {
        await deleteLetter(letterId).unwrap();
      } catch (error) {
        console.error('Error deleting letter:', error);
      }
    }
  };

  const handleRecordResponse = (letter) => {
    setSelectedLetter(letter);
    setShowResponseModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowResponseModal(false);
    setSelectedLetter(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color
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

  // Get priority color
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

  if (lettersLoading && letters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Translation Test */}
      {/* <TranslationTest /> */}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {labels.getText('title') || 'Sent Letters - Public Grievance'}
           
          </h1>
          <p className="text-gray-600">
            {labels.getText('subtitle') || 'Track outgoing letters linked to citizen grievances'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          {labels.getText('addLetter') || 'Add Letter'}
        </button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaChartBar className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('totalLetters') || 'Total Letters'}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_letters}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('awaitingResponse') || 'Awaiting Response'}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.awaiting}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaChartBar className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('responseReceived') || 'Response Received'}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.response_received}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{labels.getText('overdueFollowups') || 'Overdue Follow-ups'}</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.overdue_followups}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={labels.getText('searchPlaceholder') || 'Search letters...'}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{labels.getText('allStatuses') || 'All Statuses'}</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{labels.getText('allPriorities') || 'All Priorities'}</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{labels.getText('allCategories') || 'All Categories'}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {labels.getText('clearFilters') || 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* Letters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('recipient') || 'Recipient'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('subject') || 'Subject'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('grievanceId') || 'Grievance ID'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('status') || 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('priority') || 'Priority'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('sentDate') || 'Sent Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {labels.getText('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
               {letters.map((letter) => (
                <tr key={letter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{letter.recipient_name}</div>
                      <div className="text-sm text-gray-500">{letter.recipient_organization}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{letter.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{letter.grievance_id}</div>
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
                    {formatDate(letter.sent_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewLetter(letter)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditLetter(letter)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      {letter.status === 'Awaiting' && (
                        <button
                          onClick={() => handleRecordResponse(letter)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Record Response"
                        >
                          <FaChartBar />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLetter(letter.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {lettersError && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {lettersError.data?.detail || 'Failed to fetch letters'}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddLetterModal
          onClose={handleModalClose}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
        />
      )}

      {showViewModal && selectedLetter && (
        <ViewLetterModal
          letter={selectedLetter}
          onClose={handleModalClose}
        />
      )}

      {showEditModal && selectedLetter && (
        <EditLetterModal
          letter={selectedLetter}
          onClose={handleModalClose}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
        />
      )}

      {showResponseModal && selectedLetter && (
        <ResponseModal
          letter={selectedLetter}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default SentGrievanceLettersPage;
