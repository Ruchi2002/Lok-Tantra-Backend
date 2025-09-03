import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  MapPin, 
  DollarSign,
  Building2,
  Calendar,
  Save,
  Camera,
  Upload,
  Star
} from 'lucide-react';

const ProjectForm = ({ isOpen, onClose, onSubmit, project, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sanctioned_amount: '',
    utilized_amount: '',
    contractor: '',
    start_date: '',
    end_date: '',
    progress_percentage: 0,
    status: 'Planned',
    category: '',
    priority: 'Medium',
    beneficiaries: '',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    },
    photos: []
  });

  const [newPhoto, setNewPhoto] = useState({
    caption: '',
    date: ''
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        sanctioned_amount: project.sanctioned_amount || '',
        utilized_amount: project.utilized_amount || '',
        contractor: project.contractor || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        progress_percentage: project.progress_percentage || 0,
        status: project.status || 'Planned',
        category: project.category || '',
        priority: project.priority || 'Medium',
        beneficiaries: project.beneficiaries || '',
        location: {
          latitude: project.location?.latitude || '',
          longitude: project.location?.longitude || '',
          address: project.location?.address || ''
        },
        photos: project.photos || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        sanctioned_amount: '',
        utilized_amount: '',
        contractor: '',
        start_date: '',
        end_date: '',
        progress_percentage: 0,
        status: 'Planned',
        category: '',
        priority: 'Medium',
        beneficiaries: '',
        location: {
          latitude: '',
          longitude: '',
          address: ''
        },
        photos: []
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const { name, value } = e.target;
    setNewPhoto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPhoto = () => {
    if (newPhoto.caption && newPhoto.date) {
      const photo = {
        id: Date.now(),
        ...newPhoto,
        url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400`
      };
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, photo]
      }));
      
      setNewPhoto({
        caption: '',
        date: ''
      });
    }
  };

  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.sanctioned_amount) {
      onSubmit(formData);
    }
  };

  const categories = [
    "Infrastructure",
    "Healthcare",
    "Education",
    "Water Supply",
    "Energy",
    "Sports",
    "Transportation",
    "Agriculture",
    "Rural Development",
    "Urban Development",
    "Environment",
    "Social Welfare"
  ];

  const priorities = ["High", "Medium", "Low"];
  const statuses = ["Planned", "Ongoing", "Completed"];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter project description..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Budget Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Budget Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sanctioned Amount (₹) *
                </label>
                <input
                  type="number"
                  name="sanctioned_amount"
                  value={formData.sanctioned_amount}
                  onChange={handleInputChange}
                  placeholder="Enter sanctioned amount..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilized Amount (₹)
                </label>
                <input
                  type="number"
                  name="utilized_amount"
                  value={formData.utilized_amount}
                  onChange={handleInputChange}
                  placeholder="Enter utilized amount..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Percentage (%)
                </label>
                <input
                  type="number"
                  name="progress_percentage"
                  value={formData.progress_percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Project Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Project Timeline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contractor and Beneficiaries */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Contractor & Beneficiaries</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor *
                </label>
                <input
                  type="text"
                  name="contractor"
                  value={formData.contractor}
                  onChange={handleInputChange}
                  placeholder="Enter contractor name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Beneficiaries
                </label>
                <input
                  type="number"
                  name="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={handleInputChange}
                  placeholder="Enter number of beneficiaries..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Project Priority</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.location.latitude}
                  onChange={handleLocationChange}
                  placeholder="Enter latitude..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.location.longitude}
                  onChange={handleLocationChange}
                  placeholder="Enter longitude..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  placeholder="Enter project address..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Project Photos</h3>
            
            {/* Add Photo Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Add New Photo</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Photo Caption
                  </label>
                  <input
                    type="text"
                    name="caption"
                    value={newPhoto.caption}
                    onChange={handlePhotoChange}
                    placeholder="Enter photo caption..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Photo Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newPhoto.date}
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addPhoto}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Photo
              </button>
            </div>

            {/* Photos List */}
            {formData.photos.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Added Photos</h4>
                {formData.photos.map((photo, index) => (
                  <div key={photo.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Photo {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Caption:</span>
                        <span className="ml-2 text-gray-900">{photo.caption}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 text-gray-900">{photo.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.description || !formData.sanctioned_amount}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
