import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  List, 
  Calendar, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  useGetMeetingProgramsQuery,
  useCreateMeetingProgramMutation,
  useUpdateMeetingProgramMutation,
  useDeleteMeetingProgramMutation
} from '../../store/api/appApi';
import MeetingForm from './components/MeetingForm';
import MeetingCard from './components/MeetingCard';
import MeetingStats from './components/MeetingStats';
import MeetingCalendar from './components/MeetingCalendar';
import { useAuth } from '../../hooks/useAuth';

const MeetingPrograms = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [users, setUsers] = useState([]);

  // RTK Query hooks
  const { 
    data: meetings = [], 
    isLoading: loading, 
    error,
    refetch: refetchMeetings 
  } = useGetMeetingProgramsQuery();
  
  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingProgramMutation();
  const [updateMeeting, { isLoading: isUpdating }] = useUpdateMeetingProgramMutation();
  const [deleteMeeting, { isLoading: isDeleting }] = useDeleteMeetingProgramMutation();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/', {
        credentials: 'include'
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      await createMeeting(meetingData).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const handleUpdateMeeting = async (meetingData) => {
    try {
      await updateMeeting({ 
        programId: editingMeeting.id, 
        programData: meetingData 
      }).unwrap();
      setShowForm(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId).unwrap();
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    }
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleFormSubmit = (meetingData) => {
    if (editingMeeting) {
      handleUpdateMeeting(meetingData);
    } else {
      handleCreateMeeting(meetingData);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMeeting(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Done': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Government': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'NGO': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Public': return 'text-green-600 bg-green-50 border-green-200';
      case 'Private': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || meeting.status === statusFilter;
    const matchesType = typeFilter === 'All' || meeting.meeting_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDateClick = (date) => {
    // Filter meetings for the clicked date
    const dateString = date.toISOString().split('T')[0];
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    // You could also set a date filter here if needed
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting Programs</h1>
              <p className="text-gray-600 mt-1">Manage your meetings, schedules, and programs</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingMeeting(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Meeting
              </button>
              
              <button
                onClick={() => {
                  refetchMeetings();
                  fetchKPIs();
                  fetchStats();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Done">Done</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="Government">Government</option>
              <option value="NGO">NGO</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Calendar View"
              >
                <Calendar className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setViewMode('stats')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'stats' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Statistics View"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {filteredMeetings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'All' || typeFilter !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first meeting'
                  }
                </p>
                {!searchTerm && statusFilter === 'All' && typeFilter === 'All' && (
                  <button
                    onClick={() => {
                      setEditingMeeting(null);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Meeting
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMeetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onEdit={() => handleEditMeeting(meeting)}
                    onDelete={() => handleDeleteMeeting(meeting.id)}
                    getStatusColor={getStatusColor}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' && (
          <MeetingCalendar 
            meetings={filteredMeetings} 
            onDateClick={handleDateClick}
          />
        )}

        {viewMode === 'stats' && (
          <MeetingStats />
        )}
      </div>

      {/* Meeting Form Modal */}
      <MeetingForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        meeting={editingMeeting}
        users={users}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default MeetingPrograms;
