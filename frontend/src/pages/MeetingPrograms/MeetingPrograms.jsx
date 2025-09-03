import React, { useState } from 'react';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Filter,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Bell,
  RefreshCw
} from 'lucide-react';
import { 
  useGetMeetingProgramsQuery,
  useCreateMeetingProgramMutation,
  useUpdateMeetingProgramMutation,
  useDeleteMeetingProgramMutation
} from '../../store/api/appApi';
import MeetingForm from '../../components/MeetingForm';
import MeetingCard from '../../components/MeetingCard';
import MeetingStats from '../components/MeetingStats';
import MeetingCalendar from '../components/MeetingCalendar';
import { useAuth } from '../../hooks/useAuth';

const MeetingPrograms = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [stats, setStats] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    meeting_type: '',
    search: ''
  });
  const [view, setView] = useState('list'); // 'list', 'calendar', 'stats'

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

  // Fetch additional data (these might need to be added to appApi)
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/meeting-programs/dashboard/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchKPIs = async () => {
    try {
      const response = await fetch('http://localhost:8000/meeting-programs/dashboard/kpis', {
        credentials: 'include'
      });
      const data = await response.json();
      setKpis(data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      await createMeeting(meetingData).unwrap();
      setShowForm(false);
      fetchStats();
      fetchKPIs();
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
      setEditingMeeting(null);
      fetchStats();
      fetchKPIs();
    } catch (error) {
      console.error('Error updating meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(meetingId).unwrap();
        fetchStats();
        fetchKPIs();
      } catch (error) {
        console.error('Error deleting meeting:', error);
      }
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesStatus = !filters.status || meeting.status === filters.status;
    const matchesType = !filters.meeting_type || meeting.meeting_type === filters.meeting_type;
    const matchesSearch = !filters.search || 
      meeting.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      meeting.venue?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Done': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Government': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'NGO': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Public': return 'bg-teal-50 text-teal-700 border-teal-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meeting Programs
              </h1>
              <p className="text-gray-600">
                Manage your daily schedule, planning, and event tracking
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              New Meeting
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Meetings</p>
                  <p className="text-2xl font-bold text-blue-600">{kpis.today_meetings}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">{kpis.week_meetings}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{kpis.completion_rate}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-orange-600">{kpis.avg_attendance || 0}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'list' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'stats' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
          </div>

          <button
            onClick={refetchMeetings}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.meeting_type}
                onChange={(e) => setFilters({ ...filters, meeting_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Government">Government</option>
                <option value="NGO">NGO</option>
                <option value="Public">Public</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', meeting_type: '', search: '' })}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {view === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMeetings.map(meeting => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onEdit={() => setEditingMeeting(meeting)}
                onDelete={() => handleDeleteMeeting(meeting.id)}
                getStatusColor={getStatusColor}
                getTypeColor={getTypeColor}
              />
            ))}
          </div>
        )}

        {view === 'calendar' && (
          <MeetingCalendar meetings={filteredMeetings} />
        )}

        {view === 'stats' && stats && (
          <MeetingStats stats={stats} />
        )}

        {/* Empty State */}
        {filteredMeetings.length === 0 && view === 'list' && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.meeting_type 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first meeting'
              }
            </p>
            {!filters.search && !filters.status && !filters.meeting_type && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Meeting
              </button>
            )}
          </div>
        )}
      </div>

      {/* Meeting Form Modal */}
      {showForm && (
        <MeetingForm
          meeting={null}
          onSubmit={handleCreateMeeting}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingMeeting && (
        <MeetingForm
          meeting={editingMeeting}
          onSubmit={handleUpdateMeeting}
          onClose={() => setEditingMeeting(null)}
        />
      )}
    </div>
  );
};

export default MeetingPrograms;
