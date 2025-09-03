import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  List, 
  Calendar, 
  BarChart3,
  RefreshCw,
  FileText,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import SessionCard from './components/SessionCard';
import SessionForm from './components/SessionForm';
import SessionStats from './components/SessionStats';
import SessionCalendar from './components/SessionCalendar';
import { useAuth } from '../../hooks/useAuth';

const LokSabhaSessionTracker = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [kpis, setKpis] = useState({});
  const [stats, setStats] = useState({});

  // Dummy data for Lok Sabha sessions
  const dummySessions = [
    {
      id: 1,
      session_number: "17th Lok Sabha - Session 1",
      date: "2024-01-15",
      total_questions: 45,
      starred_questions: 12,
      unstarred_questions: 33,
      answered_questions: 38,
      pending_questions: 7,
      top_ministries: ["Ministry of Finance", "Ministry of Health", "Ministry of Education"],
      questions: [
        {
          id: 1,
          type: "Starred",
          ministry: "Ministry of Finance",
          subject: "Economic Growth and Fiscal Policy",
          outcome: "Answered",
          answer_text: "The government has implemented various measures to boost economic growth...",
          date_asked: "2024-01-15"
        },
        {
          id: 2,
          type: "Unstarred",
          ministry: "Ministry of Health",
          subject: "Healthcare Infrastructure Development",
          outcome: "Pending",
          answer_text: "",
          date_asked: "2024-01-15"
        }
      ]
    },
    {
      id: 2,
      session_number: "17th Lok Sabha - Session 2",
      date: "2024-02-20",
      total_questions: 52,
      starred_questions: 18,
      unstarred_questions: 34,
      answered_questions: 45,
      pending_questions: 7,
      top_ministries: ["Ministry of Defence", "Ministry of Agriculture", "Ministry of Transport"],
      questions: [
        {
          id: 3,
          type: "Starred",
          ministry: "Ministry of Defence",
          subject: "National Security and Border Management",
          outcome: "Answered",
          answer_text: "Comprehensive measures have been taken to strengthen national security...",
          date_asked: "2024-02-20"
        }
      ]
    },
    {
      id: 3,
      session_number: "17th Lok Sabha - Session 3",
      date: "2024-03-10",
      total_questions: 38,
      starred_questions: 15,
      unstarred_questions: 23,
      answered_questions: 32,
      pending_questions: 6,
      top_ministries: ["Ministry of Education", "Ministry of Rural Development", "Ministry of Environment"],
      questions: [
        {
          id: 4,
          type: "Unstarred",
          ministry: "Ministry of Education",
          subject: "Digital Education Initiatives",
          outcome: "Answered",
          answer_text: "The government has launched several digital education programs...",
          date_asked: "2024-03-10"
        }
      ]
    }
  ];

  // Dummy KPIs data
  const dummyKPIs = {
    total_questions: 135,
    starred_ratio: 33.3,
    unstarred_ratio: 66.7,
    answered_ratio: 85.2,
    pending_ratio: 14.8,
    top_ministries: [
      { name: "Ministry of Finance", count: 15 },
      { name: "Ministry of Health", count: 12 },
      { name: "Ministry of Education", count: 10 }
    ],
    questions_per_session: [
      { session: "Session 1", count: 45 },
      { session: "Session 2", count: 52 },
      { session: "Session 3", count: 38 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessions(dummySessions);
      setKpis(dummyKPIs);
      setStats(dummyKPIs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateSession = async (sessionData) => {
    try {
      setFormLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession = {
        id: sessions.length + 1,
        ...sessionData,
        total_questions: 0,
        starred_questions: 0,
        unstarred_questions: 0,
        answered_questions: 0,
        pending_questions: 0,
        top_ministries: [],
        questions: []
      };
      
      setSessions([...sessions, newSession]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSession = async (sessionData) => {
    try {
      setFormLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(sessions.map(session => 
        session.id === editingSession.id 
          ? { ...session, ...sessionData }
          : session
      ));
      setShowForm(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSessions(sessions.filter(session => session.id !== sessionId));
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleFormSubmit = (sessionData) => {
    if (editingSession) {
      handleUpdateSession(sessionData);
    } else {
      handleCreateSession(sessionData);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.session_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Active' && session.pending_questions > 0) ||
      (statusFilter === 'Completed' && session.pending_questions === 0);
    const matchesType = questionTypeFilter === 'All' || 
      (questionTypeFilter === 'Starred' && session.starred_questions > 0) ||
      (questionTypeFilter === 'Unstarred' && session.unstarred_questions > 0);
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Lok Sabha Session Tracker</h1>
              <p className="text-gray-600 mt-1">Track parliamentary performance and session details</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingSession(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>
              
              <button
                onClick={() => {
                  setSessions(dummySessions);
                  setKpis(dummyKPIs);
                  setStats(dummyKPIs);
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
                placeholder="Search sessions..."
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
            
            <select
              value={questionTypeFilter}
              onChange={(e) => setQuestionTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Question Types</option>
              <option value="Starred">Starred Questions</option>
              <option value="Unstarred">Unstarred Questions</option>
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
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'All' || questionTypeFilter !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first session'
                  }
                </p>
                {!searchTerm && statusFilter === 'All' && questionTypeFilter === 'All' && (
                  <button
                    onClick={() => {
                      setEditingSession(null);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Session
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onEdit={() => handleEditSession(session)}
                    onDelete={() => handleDeleteSession(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' && (
          <SessionCalendar 
            sessions={filteredSessions} 
          />
        )}

        {viewMode === 'stats' && (
          <SessionStats 
            stats={stats} 
            kpis={kpis}
          />
        )}
      </div>

      {/* Session Form Modal */}
      <SessionForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        session={editingSession}
        isLoading={formLoading}
      />
    </div>
  );
};

export default LokSabhaSessionTracker;
