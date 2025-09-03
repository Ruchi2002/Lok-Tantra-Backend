import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { 
  useGetReceivedLettersQuery, 
  useDeleteReceivedLetterMutation, 
  useGetReceivedLettersStatisticsQuery 
} from '../../store/api/appApi';
import AddLetterModal from './AddLetterModal';
import EditLetterModal from './EditLetterModal';
import ViewLetterModal from './ViewLetterModal';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { fallbackTranslations } from '../../utils/fallbackTranslation';

const ReceivedLettersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentLang } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // RTK Query hooks
  const { 
    data: lettersData, 
    isLoading: lettersLoading, 
    error: lettersError,
    refetch: refetchLetters 
  } = useGetReceivedLettersQuery({
    search: searchTerm || undefined,
    date_from: dateRange || undefined,
    date_to: dateRange || undefined,
    page: currentPage,
    per_page: itemsPerPage
  });

  const { 
    data: statistics, 
    isLoading: statsLoading, 
    error: statsError 
  } = useGetReceivedLettersStatisticsQuery();

  const [deleteLetter, { isLoading: isDeleting }] = useDeleteReceivedLetterMutation();

  // Extract data
  const letters = lettersData?.letters || [];
  const totalPages = lettersData?.total_pages || 1;

  // Get translated labels
  const getTranslatedLabel = (key) => {
    return fallbackTranslations.receivedLetters?.[key]?.[currentLang] || key;
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Replied':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Priority colors
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

  // Handle letter actions
  const handleViewLetter = (letter) => {
    setSelectedLetter(letter);
    setShowViewModal(true);
  };

  const handleEditLetter = (letter) => {
    setSelectedLetter(letter);
    setShowEditModal(true);
  };

  const handleDeleteLetter = async (letter) => {
    if (window.confirm(getTranslatedLabel('confirmDelete') || 'Are you sure you want to delete this letter?')) {
      try {
        await deleteLetter(letter.id).unwrap();
        // RTK Query will automatically refetch the data
      } catch (error) {
        console.error('Error deleting letter:', error);
        alert(getTranslatedLabel('deleteError') || 'Failed to delete letter');
      }
    }
  };

  const handleSuccess = () => {
    // RTK Query will automatically refetch the data
    refetchLetters();
  };

  if (lettersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading letters...</p>
        </div>
      </div>
    );
  }

  if (lettersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">Failed to load letters</p>
          <button 
            onClick={() => refetchLetters()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getTranslatedLabel('receivedLetters') || 'Received Letters'}
              </h1>
              <p className="text-gray-600">
                {getTranslatedLabel('manageIncomingLetters') || 'Manage all incoming letters from citizens, NGOs, departments, etc.'}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              {getTranslatedLabel('addLetter') || 'Add Letter'}
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslatedLabel('searchLetters') || 'Search letters...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Filter size={14} />
                {getTranslatedLabel('filter') || 'Filter'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Letters Table */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getTranslatedLabel('sender') || 'Sender'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getTranslatedLabel('subject') || 'Subject'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getTranslatedLabel('date') || 'Date'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getTranslatedLabel('status') || 'Status'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {getTranslatedLabel('actions') || 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {letters.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            {getTranslatedLabel('noLettersFound') || 'No letters found'}
                          </td>
                        </tr>
                      ) : (
                        letters.map((letter) => (
                          <tr key={letter.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {letter.sender_name || letter.sender}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {letter.category}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {letter.subject}
                              </div>
                              <div className="mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(letter.priority)}`}>
                                  {letter.priority}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {letter.received_date ? new Date(letter.received_date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(letter.status)}`}>
                                {letter.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleViewLetter(letter)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditLetter(letter)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                {/* <button
                                  onClick={() => handleDeleteLetter(letter)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        {getTranslatedLabel('showing') || 'Showing'} {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, letters.length)} of {letters.length} {getTranslatedLabel('results') || 'results'}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          {getTranslatedLabel('previous') || 'Previous'}
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-700">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          {getTranslatedLabel('next') || 'Next'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Summary Statistics */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {getTranslatedLabel('filterLettersBy') || 'Filter Letters by'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getTranslatedLabel('dateRange') || 'Date Range'}
                    </label>
                    <input
                      type="text"
                      placeholder={getTranslatedLabel('dateRange') || 'Date range'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {letters.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getTranslatedLabel('filtered') || 'Filtered'}
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        {statistics?.total_letters || letters.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getTranslatedLabel('totalLetters') || 'Total Letters'}
                      </div>
                    </div>

                    {statistics && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-600">{getTranslatedLabel('new') || 'New'}:</span>
                          <span className="font-medium">{statistics.new_letters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">{getTranslatedLabel('underReview') || 'Under Review'}:</span>
                          <span className="font-medium">{statistics.under_review}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">{getTranslatedLabel('replied') || 'Replied'}:</span>
                          <span className="font-medium">{statistics.replied}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{getTranslatedLabel('closed') || 'Closed'}:</span>
                          <span className="font-medium">{statistics.closed}</span>
                        </div>
                        {statistics.overdue_letters > 0 && (
                          <div className="flex justify-between">
                            <span className="text-red-600">{getTranslatedLabel('overdue') || 'Overdue'}:</span>
                            <span className="font-medium">{statistics.overdue_letters}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddLetterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSuccess}
      />

      <ViewLetterModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        letter={selectedLetter}
        onEdit={handleEditLetter}
      />

      <EditLetterModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
        letter={selectedLetter}
      />
    </div>
  );
};

export default ReceivedLettersPage;
