import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Share2, 
  Facebook, Instagram, Twitter, Youtube, CheckCircle, Clock, Star
} from 'lucide-react';

const SocialMediaCalendar = ({ accounts }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getActivityForDate = (date) => {
    // Simulate activity based on account posts
    const activities = [];
    accounts.forEach(account => {
      // Simulate posts based on posts_this_month
      const postsPerDay = account.posts_this_month / 30; // Average posts per day
      const random = Math.random();
      if (random < postsPerDay) {
        activities.push({
          platform: account.platform,
          handle: account.handle,
          type: 'post',
          engagement_rate: account.engagement_rate
        });
      }
    });
    return activities;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameMonth = (date1, date2) => {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook size={12} className="text-blue-600" />;
      case 'Instagram':
        return <Instagram size={12} className="text-pink-600" />;
      case 'Twitter':
        return <Twitter size={12} className="text-blue-400" />;
      case 'YouTube':
        return <Youtube size={12} className="text-red-600" />;
      default:
        return <Share2 size={12} className="text-gray-600" />;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    days.push(date);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate summary statistics
  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter(account => account.status === 'Active').length;
  const totalPosts = accounts.reduce((sum, account) => sum + account.posts_this_month, 0);
  const averageEngagement = accounts.reduce((sum, account) => sum + account.engagement_rate, 0) / accounts.length;
  const verifiedAccounts = accounts.filter(account => account.is_verified).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Social Media Activity Calendar</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-medium text-gray-900 min-w-[120px] text-center">
            {formatDate(currentDate)}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24 bg-gray-50 rounded-lg"></div>;
            }

            const dayActivities = getActivityForDate(date);
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <div
                key={index}
                className={`h-24 p-1 border border-gray-200 rounded-lg ${
                  isToday(date) ? 'bg-blue-50 border-blue-300' : 
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(date) ? 'text-blue-600' : 
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </span>
                  {dayActivities.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-1 rounded-full">
                      {dayActivities.length}
                    </span>
                  )}
                </div>

                {/* Activity Indicators */}
                <div className="space-y-1">
                  {dayActivities.slice(0, 3).map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="flex items-center space-x-1 p-1 bg-gray-100 rounded text-xs"
                      title={`${activity.platform} - ${activity.handle}`}
                    >
                      {getPlatformIcon(activity.platform)}
                      <span className="text-gray-600">{activity.engagement_rate}%</span>
                    </div>
                  ))}
                  {dayActivities.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayActivities.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Facebook size={16} className="text-blue-600" />
            <span className="text-sm text-gray-600">Facebook</span>
          </div>
          <div className="flex items-center space-x-2">
            <Instagram size={16} className="text-pink-600" />
            <span className="text-sm text-gray-600">Instagram</span>
          </div>
          <div className="flex items-center space-x-2">
            <Twitter size={16} className="text-blue-400" />
            <span className="text-sm text-gray-600">Twitter</span>
          </div>
          <div className="flex items-center space-x-2">
            <Youtube size={16} className="text-red-600" />
            <span className="text-sm text-gray-600">YouTube</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">Active Account</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-orange-600" />
            <span className="text-sm text-gray-600">Recent Activity</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-600">High Engagement</span>
          </div>
          <div className="flex items-center space-x-2">
            <Share2 size={16} className="text-purple-600" />
            <span className="text-sm text-gray-600">Post Activity</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Share2 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Total Accounts</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalAccounts}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-900">Active Accounts</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeAccounts}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CalendarIcon size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Total Posts</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalPosts}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-gray-900">Avg Engagement</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">{averageEngagement.toFixed(1)}%</p>
        </div>
      </div>

      {/* Account Status Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Account Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
            <p className="text-sm text-gray-600">Total Accounts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{activeAccounts}</p>
            <p className="text-sm text-gray-600">Active Status</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{verifiedAccounts}</p>
            <p className="text-sm text-gray-600">Verified Accounts</p>
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Platform Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map(platform => {
            const platformAccounts = accounts.filter(account => account.platform === platform);
            const count = platformAccounts.length;
            return (
              <div key={platform} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getPlatformIcon(platform)}
                </div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{platform}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaCalendar;
