import React, { useState } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  DollarSign, 
  Users, 
  Edit, 
  Trash2, 
  MoreVertical,
  Eye,
  TrendingUp,
  Building2,
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const getStatusColor = () => {
    switch (project.status) {
      case 'Completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Ongoing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Planned':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Ongoing':
        return <Clock className="w-4 h-4" />;
      case 'Planned':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case 'High':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = () => {
    switch (project.priority) {
      case 'High':
        return <Star className="w-4 h-4" />;
      case 'Medium':
        return <Star className="w-4 h-4" />;
      case 'Low':
        return <Star className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const calculateBudgetUtilization = () => {
    if (project.sanctioned_amount === 0) return 0;
    return (project.utilized_amount / project.sanctioned_amount) * 100;
  };

  const isProjectDelayed = () => {
    if (project.status === 'Completed') return false;
    const endDate = new Date(project.end_date);
    const today = new Date();
    return endDate < today;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Building2 className="w-4 h-4" />
              <span>{project.category}</span>
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
                  {showDetails ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    setShowPhotos(!showPhotos);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {showPhotos ? 'Hide Photos' : 'View Photos'}
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onEdit();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status and Priority Badges */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusIcon()}
            {project.status}
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
            {getPriorityIcon()}
            {project.priority} Priority
          </div>
          {isProjectDelayed() && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border text-red-600 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4" />
              Delayed
            </div>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="px-6 pb-4">
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Budget and Progress */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{formatCurrency(project.sanctioned_amount)}</div>
            <div className="text-xs text-blue-600 font-medium">Sanctioned</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{formatCurrency(project.utilized_amount)}</div>
            <div className="text-xs text-green-600 font-medium">Utilized</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{project.progress_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress_percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Budget Utilization</span>
            <span>{Math.round(calculateBudgetUtilization())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateBudgetUtilization()}%` }}
            ></div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Beneficiaries</span>
            </div>
            <span className="font-medium text-gray-900">{project.beneficiaries.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Contractor</span>
            </div>
            <span className="font-medium text-gray-900 truncate ml-2">{project.contractor}</span>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            Location
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {project.location.address}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <CalendarDays className="w-4 h-4" />
            Timeline
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Start:</span>
              <div className="font-medium text-gray-900">{formatDate(project.start_date)}</div>
            </div>
            <div>
              <span className="text-gray-600">End:</span>
              <div className="font-medium text-gray-900">{formatDate(project.end_date)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Photos Section */}
      {showPhotos && project.photos && project.photos.length > 0 && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Project Photos ({project.photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {project.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-xs text-center p-2">
                    <div className="font-medium">{photo.caption}</div>
                    <div>{formatDate(photo.date)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Description:</span>
              <p className="text-gray-900 mt-1">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 font-medium">Category:</span>
                <div className="text-gray-900">{project.category}</div>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Priority:</span>
                <div className="text-gray-900">{project.priority}</div>
              </div>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Contractor Details:</span>
              <div className="text-gray-900">{project.contractor}</div>
            </div>
            
            <div>
              <span className="text-gray-600 font-medium">Location Coordinates:</span>
              <div className="text-gray-900">
                {project.location.latitude}, {project.location.longitude}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Utilization: {Math.round(calculateBudgetUtilization())}%</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Development Tracker</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
