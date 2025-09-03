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
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Camera,
  Building2,
  Users,
  CalendarDays
} from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import ProjectForm from './components/ProjectForm';
import ProjectStats from './components/ProjectStats';
import ProjectCalendar from './components/ProjectCalendar';
import { useAuth } from '../../hooks/useAuth';

const MPLADSTracker = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'stats'
  const [kpis, setKpis] = useState({});
  const [stats, setStats] = useState({});

  // Dummy data for MPLADS projects
  const dummyProjects = [
    {
      id: 1,
      title: "Road Construction - Main Market Area",
      description: "Construction of 2.5 km concrete road connecting main market to highway",
      sanctioned_amount: 2500000,
      utilized_amount: 1800000,
      contractor: "ABC Construction Ltd.",
      start_date: "2024-01-15",
      end_date: "2024-06-15",
      progress_percentage: 72,
      status: "Ongoing",
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: "Main Market Area, Delhi"
      },
      photos: [
        { id: 1, url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400", caption: "Initial site preparation", date: "2024-01-20" },
        { id: 2, url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400", caption: "Foundation work completed", date: "2024-03-15" }
      ],
      category: "Infrastructure",
      priority: "High",
      beneficiaries: 5000,
      is_delayed: false
    },
    {
      id: 2,
      title: "Community Health Center",
      description: "Construction of 10-bed community health center with basic facilities",
      sanctioned_amount: 1500000,
      utilized_amount: 1200000,
      contractor: "XYZ Healthcare Infrastructure",
      start_date: "2024-02-01",
      end_date: "2024-08-01",
      progress_percentage: 80,
      status: "Ongoing",
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: "Village Center, Rural Area"
      },
      photos: [
        { id: 3, url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400", caption: "Building structure completed", date: "2024-04-10" }
      ],
      category: "Healthcare",
      priority: "High",
      beneficiaries: 15000,
      is_delayed: false
    },
    {
      id: 3,
      title: "Solar Street Lighting",
      description: "Installation of 200 solar-powered street lights across the constituency",
      sanctioned_amount: 800000,
      utilized_amount: 800000,
      contractor: "Green Energy Solutions",
      start_date: "2023-11-01",
      end_date: "2024-02-01",
      progress_percentage: 100,
      status: "Completed",
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: "Various locations across constituency"
      },
      photos: [
        { id: 4, url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400", caption: "Solar panels installed", date: "2024-01-15" },
        { id: 5, url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400", caption: "Final testing completed", date: "2024-02-01" }
      ],
      category: "Energy",
      priority: "Medium",
      beneficiaries: 8000,
      is_delayed: false
    },
    {
      id: 4,
      title: "Water Supply Pipeline",
      description: "Laying of 5 km water supply pipeline to improve water access",
      sanctioned_amount: 3000000,
      utilized_amount: 500000,
      contractor: "Water Infrastructure Corp",
      start_date: "2024-03-01",
      end_date: "2024-09-01",
      progress_percentage: 17,
      status: "Ongoing",
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: "Rural water supply route"
      },
      photos: [
        { id: 6, url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", caption: "Pipeline trenching started", date: "2024-03-10" }
      ],
      category: "Water Supply",
      priority: "High",
      beneficiaries: 12000,
      is_delayed: false
    },
    {
      id: 5,
      title: "School Computer Lab",
      description: "Setting up computer lab with 20 computers in government school",
      sanctioned_amount: 600000,
      utilized_amount: 0,
      contractor: "Tech Education Solutions",
      start_date: "2024-05-01",
      end_date: "2024-07-01",
      progress_percentage: 0,
      status: "Planned",
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: "Government High School, Central Area"
      },
      photos: [],
      category: "Education",
      priority: "Medium",
      beneficiaries: 500,
      is_delayed: false
    },
    {
      id: 6,
      title: "Sports Complex Renovation",
      description: "Renovation of existing sports complex with new equipment",
      sanctioned_amount: 1200000,
      utilized_amount: 1200000,
      contractor: "Sports Infrastructure Ltd",
      start_date: "2023-09-01",
      end_date: "2024-01-01",
      progress_percentage: 100,
      status: "Completed",
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: "District Sports Complex"
      },
      photos: [
        { id: 7, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", caption: "Renovated indoor facility", date: "2024-01-01" }
      ],
      category: "Sports",
      priority: "Low",
      beneficiaries: 3000,
      is_delayed: false
    }
  ];

  // Dummy KPIs data
  const dummyKPIs = {
    total_projects: 6,
    planned_projects: 1,
    ongoing_projects: 3,
    completed_projects: 2,
    total_sanctioned_budget: 9600000,
    total_utilized_amount: 5500000,
    average_progress: 61.5,
    delayed_projects: 0,
    top_ongoing_projects: [
      { title: "Road Construction - Main Market Area", budget: 2500000, progress: 72 },
      { title: "Community Health Center", budget: 1500000, progress: 80 },
      { title: "Water Supply Pipeline", budget: 3000000, progress: 17 }
    ],
    projects_by_category: [
      { category: "Infrastructure", count: 2, budget: 5500000 },
      { category: "Healthcare", count: 1, budget: 1500000 },
      { category: "Energy", count: 1, budget: 800000 },
      { category: "Water Supply", count: 1, budget: 3000000 },
      { category: "Education", count: 1, budget: 600000 }
    ],
    monthly_progress: [
      { month: "Jan", completed: 1, ongoing: 2 },
      { month: "Feb", completed: 1, ongoing: 3 },
      { month: "Mar", completed: 1, ongoing: 3 },
      { month: "Apr", completed: 1, ongoing: 3 },
      { month: "May", completed: 1, ongoing: 3 },
      { month: "Jun", completed: 2, ongoing: 2 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(dummyProjects);
      setKpis(dummyKPIs);
      setStats(dummyKPIs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      setFormLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject = {
        id: projects.length + 1,
        ...projectData,
        progress_percentage: 0,
        utilized_amount: 0,
        photos: [],
        is_delayed: false
      };
      
      setProjects([...projects, newProject]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      setFormLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(projects.map(project => 
        project.id === editingProject.id 
          ? { ...project, ...projectData }
          : project
      ));
      setShowForm(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(projects.filter(project => project.id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSubmit = (projectData) => {
    if (editingProject) {
      handleUpdateProject(projectData);
    } else {
      handleCreateProject(projectData);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesBudget = budgetFilter === 'All' || 
      (budgetFilter === 'High' && project.sanctioned_amount >= 2000000) ||
      (budgetFilter === 'Medium' && project.sanctioned_amount >= 500000 && project.sanctioned_amount < 2000000) ||
      (budgetFilter === 'Low' && project.sanctioned_amount < 500000);
    
    return matchesSearch && matchesStatus && matchesBudget;
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
              <h1 className="text-2xl font-bold text-gray-900">MPLADS & Development Projects Tracker</h1>
              <p className="text-gray-600 mt-1">Monitor development projects and track progress in your constituency</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              
              <button
                onClick={() => {
                  setProjects(dummyProjects);
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
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
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
            
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="All">All Budgets</option>
              <option value="High">High (≥20L)</option>
              <option value="Medium">Medium (5L-20L)</option>
              <option value="Low">Low (&lt;5L)</option>
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
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Building2 className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'All' || budgetFilter !== 'All' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first project'
                  }
                </p>
                {!searchTerm && statusFilter === 'All' && budgetFilter === 'All' && (
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'calendar' && (
          <ProjectCalendar 
            projects={filteredProjects} 
          />
        )}

        {viewMode === 'stats' && (
          <ProjectStats 
            stats={stats} 
            kpis={kpis}
          />
        )}
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        project={editingProject}
        isLoading={formLoading}
      />
    </div>
  );
};

export default MPLADSTracker;
