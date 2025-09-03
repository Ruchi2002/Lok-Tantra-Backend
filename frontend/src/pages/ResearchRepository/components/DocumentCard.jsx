import React, { useState } from 'react';
import { 
  CalendarDays, FileText, Mic, BookOpen, Edit, Trash2, MoreVertical, 
  Eye, Download, Tag, Clock, CheckCircle, AlertCircle, Star, FileType, 
  Users, TrendingUp, Copy, Share2, Bookmark
} from 'lucide-react';

const DocumentCard = ({ document, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Research Note':
        return <BookOpen size={16} className="text-blue-600" />;
      case 'Speech Draft':
        return <Mic size={16} className="text-orange-600" />;
      case 'Speech Final':
        return <FileText size={16} className="text-green-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Research Note':
        return 'bg-blue-100 text-blue-800';
      case 'Speech Draft':
        return 'bg-orange-100 text-orange-800';
      case 'Speech Final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'Final' ? 
      <CheckCircle size={16} className="text-green-600" /> : 
      <Clock size={16} className="text-orange-600" />;
  };

  const getStatusColor = (status) => {
    return status === 'Final' ? 
      'bg-green-100 text-green-800' : 
      'bg-orange-100 text-orange-800';
  };

  const getVersionColor = (version) => {
    if (version === 'Final') return 'bg-purple-100 text-purple-800';
    if (version === 'V3') return 'bg-red-100 text-red-800';
    if (version === 'V2') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 mb-2">
            {getTypeIcon(document.type)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(document.type)}`}>
              {document.type}
            </span>
            {document.is_featured && (
              <Star size={14} className="text-yellow-500 fill-current" />
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[140px]">
                <button
                  onClick={() => onEdit(document)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => window.open(document.file_url, '_blank')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye size={14} className="mr-2" />
                  View
                </button>
                <button
                  onClick={() => window.open(document.file_url, '_blank')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download size={14} className="mr-2" />
                  Download
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(document.title)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy size={14} className="mr-2" />
                  Copy Title
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => onDelete(document.id)}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {document.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {document.description}
        </p>

        {/* Status and Version Badges */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
            {getStatusIcon(document.status)}
            <span className="ml-1">{document.status}</span>
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getVersionColor(document.version)}`}>
            {document.version}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {document.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center"
            >
              <Tag size={12} className="mr-1" />
              {tag}
            </span>
          ))}
          {document.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              +{document.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Document Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={14} className="mr-2" />
            <span className="font-medium">{document.author}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <FileType size={14} className="mr-2" />
            <span>{document.file_type} • {document.file_size}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays size={14} className="mr-2" />
            <span>Updated {formatDate(document.updated_date)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Eye size={14} className="mr-1" />
              {document.views} views
            </span>
            <span className="flex items-center">
              <Download size={14} className="mr-1" />
              {document.downloads} downloads
            </span>
          </div>
          <div className="flex items-center">
            <TrendingUp size={14} className="mr-1" />
            {Math.round((document.downloads / Math.max(document.views, 1)) * 100)}% engagement
          </div>
        </div>

        {/* Content Summary */}
        {showDetails && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Content Summary</h4>
            <p className="text-sm text-gray-600">{document.content_summary}</p>
            
            {document.related_documents && document.related_documents.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Related Documents</h5>
                <div className="flex flex-wrap gap-1">
                  {document.related_documents.map((docId, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      Doc #{docId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(document.file_url, '_blank')}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Document"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => window.open(document.file_url, '_blank')}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Download Document"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => onEdit(document)}
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Edit Document"
            >
              <Edit size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
