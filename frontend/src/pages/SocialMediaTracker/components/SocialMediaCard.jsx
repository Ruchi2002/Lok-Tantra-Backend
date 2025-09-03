import React, { useState } from 'react';
import { 
  CalendarDays, Share2, Edit, Trash2, MoreVertical, 
  Eye, Heart, MessageCircle, Share, Download, 
  Users, TrendingUp, Target, Activity, CheckCircle,
  ExternalLink, Copy, BarChart3, Clock, Star
} from 'lucide-react';

const SocialMediaCard = ({ account, onEdit, onDelete, getPlatformIcon }) => {
  const [showActions, setShowActions] = useState(false);
  const [showTopPosts, setShowTopPosts] = useState(false);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Facebook':
        return 'bg-blue-100 text-blue-800';
      case 'Instagram':
        return 'bg-pink-100 text-pink-800';
      case 'Twitter':
        return 'bg-blue-100 text-blue-600';
      case 'YouTube':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 
      'bg-green-100 text-green-800' : 
      'bg-gray-100 text-gray-800';
  };

  const getGrowthColor = (rate) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 mb-3">
            {getPlatformIcon(account.platform)}
            <div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPlatformColor(account.platform)}`}>
                {account.platform}
              </span>
              {account.is_verified && (
                <CheckCircle size={14} className="text-blue-500 ml-1" />
              )}
            </div>
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
                  onClick={() => onEdit(account)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => window.open(account.url, '_blank')}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Visit Profile
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(account.handle)}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy size={14} className="mr-2" />
                  Copy Handle
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => onDelete(account.id)}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {account.handle}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {account.bio}
        </p>

        {/* Status and Growth */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(account.status)}`}>
            {account.status}
          </span>
          <div className={`flex items-center text-xs ${getGrowthColor(account.growth_rate)}`}>
            <TrendingUp size={12} className="mr-1" />
            {account.growth_rate > 0 ? '+' : ''}{account.growth_rate}% growth
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users size={16} className="text-blue-600 mr-1" />
              <span className="text-sm font-medium text-gray-700">Followers</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatNumber(account.followers)}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target size={16} className="text-green-600 mr-1" />
              <span className="text-sm font-medium text-gray-700">Engagement</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{account.engagement_rate}%</p>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Eye size={14} className="mr-2" />
              Reach
            </span>
            <span className="font-medium">{formatNumber(account.reach)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Activity size={14} className="mr-2" />
              Impressions
            </span>
            <span className="font-medium">{formatNumber(account.impressions)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-gray-600">
              <Heart size={14} className="mr-2" />
              Engagements
            </span>
            <span className="font-medium">{formatNumber(account.engagements)}</span>
          </div>
        </div>

        {/* Posts Activity */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>Posts this week: {account.posts_this_week}</span>
          <span>Posts this month: {account.posts_this_month}</span>
        </div>

        {/* Top Posts */}
        {account.top_posts && account.top_posts.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Top Posts</h4>
              <button
                onClick={() => setShowTopPosts(!showTopPosts)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showTopPosts ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showTopPosts && (
              <div className="space-y-3">
                {account.top_posts.slice(0, 2).map((post, index) => (
                  <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(post.date)}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Heart size={12} className="mr-1" />
                          {formatNumber(post.likes)}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle size={12} className="mr-1" />
                          {formatNumber(post.comments)}
                        </span>
                        <span className="flex items-center">
                          <Share size={12} className="mr-1" />
                          {formatNumber(post.shares)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Reach: {formatNumber(post.reach)}</span>
                      <span className="text-green-600 font-medium">{post.engagement_rate}% engagement</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={14} className="mr-1" />
            Updated {formatDate(account.last_updated)}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(account.url, '_blank')}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Visit Profile"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={() => onEdit(account)}
              className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Edit Account"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => setShowTopPosts(!showTopPosts)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Top Posts"
            >
              <BarChart3 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaCard;
