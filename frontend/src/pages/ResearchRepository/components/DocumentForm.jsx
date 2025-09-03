import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, FileText, BookOpen, Mic, Upload, Tag, Save, 
  Calendar, Users, FileType, Star, AlertCircle
} from 'lucide-react';

const DocumentForm = ({ isOpen, onClose, onSubmit, document, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Research Note',
    status: 'Draft',
    version: 'V1',
    tags: [],
    author: '',
    content_summary: '',
    file_type: 'PDF',
    file_size: '',
    file_url: '',
    related_documents: [],
    is_featured: false
  });
  const [newTag, setNewTag] = useState('');
  const [newRelatedDoc, setNewRelatedDoc] = useState('');

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        type: document.type || 'Research Note',
        status: document.status || 'Draft',
        version: document.version || 'V1',
        tags: document.tags || [],
        author: document.author || '',
        content_summary: document.content_summary || '',
        file_type: document.file_type || 'PDF',
        file_size: document.file_size || '',
        file_url: document.file_url || '',
        related_documents: document.related_documents || [],
        is_featured: document.is_featured || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'Research Note',
        status: 'Draft',
        version: 'V1',
        tags: [],
        author: '',
        content_summary: '',
        file_type: 'PDF',
        file_size: '',
        file_url: '',
        related_documents: [],
        is_featured: false
      });
    }
  }, [document]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRelatedDocument = () => {
    if (newRelatedDoc.trim() && !formData.related_documents.includes(parseInt(newRelatedDoc))) {
      setFormData(prev => ({
        ...prev,
        related_documents: [...prev.related_documents, parseInt(newRelatedDoc)]
      }));
      setNewRelatedDoc('');
    }
  };

  const removeRelatedDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      related_documents: prev.related_documents.filter(id => id !== docId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim() && formData.description.trim()) {
      onSubmit(formData);
    }
  };

  const documentTypes = [
    "Research Note",
    "Speech Draft", 
    "Speech Final"
  ];

  const documentStatuses = [
    "Draft",
    "Final"
  ];

  const documentVersions = [
    "V1",
    "V2", 
    "V3",
    "Final"
  ];

  const fileTypes = [
    "PDF",
    "DOCX",
    "PPTX",
    "TXT",
    "RTF"
  ];

  const suggestedTags = [
    "Budget", "Healthcare", "Education", "Infrastructure", "Agriculture",
    "Rural Development", "Women Empowerment", "Technology", "Environment",
    "Social Welfare", "Economic Development", "Policy", "Parliament",
    "Finance", "Transportation", "Energy", "Water Supply", "Skill Development"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {document ? 'Edit Document' : 'Add New Document'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {document ? 'Update document information' : 'Create a new research document or speech'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author name"
              />
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
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter document description"
            />
          </div>

          {/* Document Type and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {documentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version
              </label>
              <select
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {documentVersions.map(version => (
                  <option key={version} value={version}>{version}</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select
                name="file_type"
                value={formData.file_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {fileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Size
              </label>
              <input
                type="text"
                name="file_size"
                value={formData.file_size}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2.5 MB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File URL
              </label>
              <input
                type="url"
                name="file_url"
                value={formData.file_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/document.pdf"
              />
            </div>
          </div>

          {/* Content Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Summary
            </label>
            <textarea
              name="content_summary"
              value={formData.content_summary}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of the document content"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {/* Suggested Tags */}
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (!formData.tags.includes(tag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...prev.tags, tag]
                        }));
                      }
                    }}
                    disabled={formData.tags.includes(tag)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full flex items-center"
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Documents
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newRelatedDoc}
                  onChange={(e) => setNewRelatedDoc(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedDocument())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Document ID"
                />
                <button
                  type="button"
                  onClick={addRelatedDocument}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {formData.related_documents.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.related_documents.map((docId, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center"
                    >
                      Doc #{docId}
                      <button
                        type="button"
                        onClick={() => removeRelatedDocument(docId)}
                        className="ml-2 text-green-600 hover:text-red-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Document */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Mark as featured document
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {document ? 'Update Document' : 'Create Document'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
