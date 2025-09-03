import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Save, Facebook, Instagram, Twitter, Youtube, 
  Globe, Users, Eye, Heart, Activity, Target, TrendingUp, CheckCircle
} from 'lucide-react';

const SocialMediaForm = ({ isOpen, onClose, onSubmit, account, isLoading }) => {
  const [formData, setFormData] = useState({
    platform: 'Facebook',
    handle: '',
    url: '',
    followers: '',
    reach: '',
    impressions: '',
    engagements: '',
    posts_this_week: '',
    posts_this_month: '',
    engagement_rate: '',
    growth_rate: '',
    status: 'Active',
    bio: '',
    is_verified: false
  });

  useEffect(() => {
    if (account) {
      setFormData({
        platform: account.platform || 'Facebook',
        handle: account.handle || '',
        url: account.url || '',
        followers: account.followers || '',
        reach: account.reach || '',
        impressions: account.impressions || '',
        engagements: account.engagements || '',
        posts_this_week: account.posts_this_week || '',
        posts_this_month: account.posts_this_month || '',
        engagement_rate: account.engagement_rate || '',
        growth_rate: account.growth_rate || '',
        status: account.status || 'Active',
        bio: account.bio || '',
        is_verified: account.is_verified || false
      });
    } else {
      setFormData({
        platform: 'Facebook',
        handle: '',
        url: '',
        followers: '',
        reach: '',
        impressions: '',
        engagements: '',
        posts_this_week: '',
        posts_this_month: '',
        engagement_rate: '',
        growth_rate: '',
        status: 'Active',
        bio: '',
        is_verified: false
      });
    }
  }, [account]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.handle.trim() && formData.url.trim()) {
      // Convert numeric fields
      const submitData = {
        ...formData,
        followers: parseInt(formData.followers) || 0,
        reach: parseInt(formData.reach) || 0,
        impressions: parseInt(formData.impressions) || 0,
        engagements: parseInt(formData.engagements) || 0,
        posts_this_week: parseInt(formData.posts_this_week) || 0,
        posts_this_month: parseInt(formData.posts_this_month) || 0,
        engagement_rate: parseFloat(formData.engagement_rate) || 0,
        growth_rate: parseFloat(formData.growth_rate) || 0
      };
      onSubmit(submitData);
    }
  };

  const platforms = [
    { value: "Facebook", label: "Facebook", icon: <Facebook size={16} className="text-blue-600" /> },
    { value: "Instagram", label: "Instagram", icon: <Instagram size={16} className="text-pink-600" /> },
    { value: "Twitter", label: "Twitter", icon: <Twitter size={16} className="text-blue-400" /> },
    { value: "YouTube", label: "YouTube", icon: <Youtube size={16} className="text-red-600" /> }
  ];

  const statuses = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {account ? 'Edit Social Media Account' : 'Add New Social Media Account'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {account ? 'Update social media account information' : 'Add a new social media account to track'}
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
                Platform *
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {platforms.map(platform => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handle/Username *
              </label>
              <input
                type="text"
                name="handle"
                value={formData.handle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., @MPRajeshKumar"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://facebook.com/MPRajeshKumar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio/Description
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the account"
            />
          </div>

          {/* Metrics */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Metrics</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Followers
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="followers"
                    value={formData.followers}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="125000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reach
                </label>
                <div className="relative">
                  <Eye size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="reach"
                    value={formData.reach}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="450000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impressions
                </label>
                <div className="relative">
                  <Activity size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="impressions"
                    value={formData.impressions}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="680000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagements
                </label>
                <div className="relative">
                  <Heart size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="engagements"
                    value={formData.engagements}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="89000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Rate (%)
                </label>
                <div className="relative">
                  <Target size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    name="engagement_rate"
                    value={formData.engagement_rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="13.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Rate (%)
                </label>
                <div className="relative">
                  <TrendingUp size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    name="growth_rate"
                    value={formData.growth_rate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2.4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Posts Activity */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Posts Activity</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posts This Week
                </label>
                <input
                  type="number"
                  name="posts_this_week"
                  value={formData.posts_this_week}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posts This Month
                </label>
                <input
                  type="number"
                  name="posts_this_month"
                  value={formData.posts_this_month}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="45"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_verified"
                  checked={formData.is_verified}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  Verified Account
                </label>
              </div>
            </div>
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
              disabled={isLoading || !formData.handle.trim() || !formData.url.trim()}
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
                  {account ? 'Update Account' : 'Create Account'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialMediaForm;
