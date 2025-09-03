import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, List, Calendar, BarChart3, RefreshCw, FileText, 
  BookOpen, Mic, Upload, Tag, Clock, CheckCircle, AlertCircle, TrendingUp, 
  Download, Eye, Edit, Trash2, FileType, CalendarDays, Users, Star
} from 'lucide-react';
import DocumentCard from './components/DocumentCard';
import DocumentForm from './components/DocumentForm';
import DocumentStats from './components/DocumentStats';
import DocumentCalendar from './components/DocumentCalendar';
import { useAuth } from '../../hooks/useAuth';

const ResearchRepository = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [kpis, setKpis] = useState({});
  const [stats, setStats] = useState({});

  // Dummy data for research documents and speeches
  const dummyDocuments = [
    {
      id: 1,
      title: "Budget Analysis 2024-25",
      description: "Comprehensive analysis of the Union Budget 2024-25 with focus on rural development and healthcare allocations",
      type: "Research Note",
      status: "Final",
      version: "V3",
      tags: ["Budget", "Healthcare", "Rural Development", "Finance"],
      author: "Dr. Rajesh Kumar",
      created_date: "2024-01-15",
      updated_date: "2024-02-20",
      file_size: "2.5 MB",
      file_type: "PDF",
      file_url: "https://example.com/budget-analysis-2024.pdf",
      content_summary: "Analysis covers 15 major sectors with detailed breakdown of allocations and impact assessment",
      related_documents: [2, 3],
      views: 45,
      downloads: 12,
      is_featured: true
    },
    {
      id: 2,
      title: "Healthcare Infrastructure Speech",
      description: "Speech draft for parliamentary debate on healthcare infrastructure development in rural areas",
      type: "Speech Draft",
      status: "Draft",
      version: "V2",
      tags: ["Healthcare", "Infrastructure", "Rural Development", "Parliament"],
      author: "MP Priya Sharma",
      created_date: "2024-02-10",
      updated_date: "2024-02-18",
      file_size: "1.8 MB",
      file_type: "DOCX",
      file_url: "https://example.com/healthcare-speech-v2.docx",
      content_summary: "Focus on primary healthcare centers, medical equipment, and healthcare worker training",
      related_documents: [1, 4],
      views: 28,
      downloads: 8,
      is_featured: false
    },
    {
      id: 3,
      title: "Education Policy Research",
      description: "Research paper on improving quality of education in government schools with case studies",
      type: "Research Note",
      status: "Final",
      version: "V1",
      tags: ["Education", "Policy", "Government Schools", "Quality"],
      author: "Prof. Amit Patel",
      created_date: "2024-01-25",
      updated_date: "2024-01-25",
      file_size: "3.2 MB",
      file_type: "PDF",
      file_url: "https://example.com/education-policy-research.pdf",
      content_summary: "Comprehensive study of 50 government schools across 5 states with recommendations",
      related_documents: [1, 5],
      views: 67,
      downloads: 23,
      is_featured: true
    },
    {
      id: 4,
      title: "Women Empowerment Initiative Speech",
      description: "Final speech for women's day celebration focusing on economic empowerment and skill development",
      type: "Speech Final",
      status: "Final",
      version: "Final",
      tags: ["Women Empowerment", "Economic Development", "Skill Development", "Social Welfare"],
      author: "MP Priya Sharma",
      created_date: "2024-02-25",
      updated_date: "2024-03-05",
      file_size: "1.2 MB",
      file_type: "PDF",
      file_url: "https://example.com/women-empowerment-speech-final.pdf",
      content_summary: "Addresses key challenges and proposed solutions for women's economic empowerment",
      related_documents: [2, 6],
      views: 89,
      downloads: 34,
      is_featured: true
    },
    {
      id: 5,
      title: "Agricultural Reforms Analysis",
      description: "Detailed analysis of agricultural reforms and their impact on farmer income and productivity",
      type: "Research Note",
      status: "Draft",
      version: "V2",
      tags: ["Agriculture", "Reforms", "Farmer Income", "Productivity"],
      author: "Dr. Rajesh Kumar",
      created_date: "2024-02-05",
      updated_date: "2024-02-15",
      file_size: "4.1 MB",
      file_type: "PDF",
      file_url: "https://example.com/agricultural-reforms-v2.pdf",
      content_summary: "Analysis of three major agricultural reforms with data from 10 states",
      related_documents: [1, 3],
      views: 34,
      downloads: 15,
      is_featured: false
    },
    {
      id: 6,
      title: "Digital India Progress Report",
      description: "Research note on the progress of Digital India initiative and its impact on rural connectivity",
      type: "Research Note",
      status: "Final",
      version: "V1",
      tags: ["Digital India", "Technology", "Rural Connectivity", "Infrastructure"],
      author: "Prof. Amit Patel",
      created_date: "2024-01-30",
      updated_date: "2024-01-30",
      file_size: "2.8 MB",
      file_type: "PDF",
      file_url: "https://example.com/digital-india-progress.pdf",
      content_summary: "Progress assessment of Digital India initiative with focus on rural areas",
      related_documents: [1, 4],
      views: 56,
      downloads: 19,
      is_featured: false
    }
  ];

  // Dummy KPIs data
  const dummyKPIs = {
    total_documents: 6,
    research_notes: 3,
    speech_drafts: 1,
    speech_finals: 2,
    total_speeches: 3,
    drafted_speeches: 1,
    finalized_speeches: 2,
    total_views: 319,
    total_downloads: 111,
    featured_documents: 3,
    recent_documents: [
      { id: 4, title: "Women Empowerment Initiative Speech", type: "Speech Final", date: "2024-03-05" },
      { id: 2, title: "Healthcare Infrastructure Speech", type: "Speech Draft", date: "2024-02-18" },
      { id: 5, title: "Agricultural Reforms Analysis", type: "Research Note", date: "2024-02-15" }
    ],
    documents_by_type: [
      { type: "Research Note", count: 3, percentage: 50 },
      { type: "Speech Draft", count: 1, percentage: 16.7 },
      { type: "Speech Final", count: 2, percentage: 33.3 }
    ],
    documents_by_status: [
      { status: "Final", count: 4, percentage: 66.7 },
      { status: "Draft", count: 2, percentage: 33.3 }
    ],
    top_tags: [
      { tag: "Healthcare", count: 2 },
      { tag: "Rural Development", count: 2 },
      { tag: "Budget", count: 1 },
      { tag: "Education", count: 1 },
      { tag: "Women Empowerment", count: 1 }
    ],
    monthly_uploads: [
      { month: "Jan", documents: 3 },
      { month: "Feb", documents: 2 },
      { month: "Mar", documents: 1 }
    ],
    top_authors: [
      { author: "Dr. Rajesh Kumar", documents: 2, views: 79 },
      { author: "Prof. Amit Patel", documents: 2, views: 123 },
      { author: "MP Priya Sharma", documents: 2, views: 117 }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setDocuments(dummyDocuments);
      setKpis(dummyKPIs);
      setStats(dummyKPIs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleDeleteDocument = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const handleFormSubmit = (formData) => {
    setFormLoading(true);
    setTimeout(() => {
      if (editingDocument) {
        setDocuments(documents.map(doc => 
          doc.id === editingDocument.id ? { ...doc, ...formData, id: doc.id } : doc
        ));
      } else {
        const newDocument = {
          ...formData,
          id: Math.max(...documents.map(d => d.id)) + 1,
          created_date: new Date().toISOString().split('T')[0],
          updated_date: new Date().toISOString().split('T')[0],
          views: 0,
          downloads: 0,
          is_featured: false
        };
        setDocuments([newDocument, ...documents]);
      }
      setShowForm(false);
      setEditingDocument(null);
      setFormLoading(false);
    }, 1000);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    const matchesTag = tagFilter === 'All' || doc.tags.includes(tagFilter);
    
    return matchesSearch && matchesType && matchesStatus && matchesTag;
  });

  const getAvailableTags = () => {
    const allTags = documents.flatMap(doc => doc.tags);
    return [...new Set(allTags)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Works & Speeches Repository</h1>
          <p className="text-gray-600 mt-1">Centralized knowledge and speech archive</p>
        </div>
        <button
          onClick={handleAddDocument}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Document
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Research Note">Research Notes</option>
              <option value="Speech Draft">Speech Drafts</option>
              <option value="Speech Final">Final Speeches</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Final">Final</option>
            </select>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Tags</option>
              {getAvailableTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar size={20} />
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'stats' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={20} />
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={handleEditDocument}
              onDelete={handleDeleteDocument}
            />
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <DocumentCalendar documents={filteredDocuments} />
      )}

      {viewMode === 'stats' && (
        <DocumentStats stats={stats} kpis={kpis} />
      )}

      {/* Document Form Modal */}
      <DocumentForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingDocument(null);
        }}
        onSubmit={handleFormSubmit}
        document={editingDocument}
        isLoading={formLoading}
      />
    </div>
  );
};

export default ResearchRepository;
