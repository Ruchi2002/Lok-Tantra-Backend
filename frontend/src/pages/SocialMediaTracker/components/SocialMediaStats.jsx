import React from 'react';
import { 
  BarChart3, TrendingUp, Share2, Users, Eye, Heart, Activity, Target, 
  Facebook, Instagram, Twitter, Youtube, Globe, CalendarDays, Star,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

const SocialMediaStats = ({ stats, kpis }) => {
  const formatNumber = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook':
        return <Facebook size={16} className="text-blue-600" />;
      case 'Instagram':
        return <Instagram size={16} className="text-pink-600" />;
      case 'Twitter':
        return <Twitter size={16} className="text-blue-400" />;
      case 'YouTube':
        return <Youtube size={16} className="text-red-600" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  const getGrowthIcon = (rate) => {
    if (rate > 0) return <ArrowUpRight size={16} className="text-green-600" />;
    if (rate < 0) return <ArrowDownRight size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Followers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.total_followers)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            {getGrowthIcon(kpis.growth_rate)}
            <span className="ml-1">{kpis.growth_rate > 0 ? '+' : ''}{kpis.growth_rate}% from last month</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(kpis.overall_engagement_rate)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp size={16} className="mr-1 text-green-600" />
            <span>+1.5% from last month</span>
          </div>
        </div>

        {/* Total Reach */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.total_reach)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Activity size={16} className="mr-1 text-purple-600" />
            <span>{formatNumber(kpis.total_impressions)} impressions</span>
          </div>
        </div>

        {/* Total Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.total_posts_this_month}</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Share2 size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <CalendarDays size={16} className="mr-1 text-orange-600" />
            <span>{kpis.total_posts_this_week} posts this week</span>
          </div>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform-wise Audience Distribution</h3>
          <div className="space-y-4">
            {kpis.platform_distribution.map((platform, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  {getPlatformIcon(platform.platform)}
                  <span className="ml-3 text-sm font-medium text-gray-700">{platform.platform}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        platform.platform === 'Facebook' ? 'bg-blue-500' :
                        platform.platform === 'Instagram' ? 'bg-pink-500' :
                        platform.platform === 'Twitter' ? 'bg-blue-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${platform.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {formatNumber(platform.followers)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {platform.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {kpis.platform_performance.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getPlatformIcon(platform.platform)}
                  <span className="ml-3 text-sm font-medium text-gray-700">{platform.platform}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{platform.engagement_rate}% engagement</div>
                  <div className="text-xs text-gray-500">{platform.growth_rate > 0 ? '+' : ''}{platform.growth_rate}% growth</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Growth Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Followers Growth Trend (Weekly)</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {kpis.weekly_growth.map((week, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '80px' }}>
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-300"
                  style={{ 
                    height: `${(week.followers / Math.max(...kpis.weekly_growth.map(w => w.followers))) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{week.week}</span>
              <span className="text-xs font-medium text-gray-900">{formatNumber(week.followers)}</span>
              <span className="text-xs text-green-600">{week.growth > 0 ? '+' : ''}{week.growth}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Posts by Engagement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Posts by Engagement</h3>
        <div className="space-y-4">
          {kpis.top_posts.map((post, index) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  post.platform === 'Facebook' ? 'bg-blue-100' :
                  post.platform === 'Instagram' ? 'bg-pink-100' :
                  post.platform === 'Twitter' ? 'bg-blue-100' : 'bg-red-100'
                }`}>
                  {getPlatformIcon(post.platform)}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{post.content}</h4>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{post.platform}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>Reach: {formatNumber(post.reach)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{post.engagement_rate}%</div>
                <div className="text-xs text-gray-500">engagement</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Metrics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.monthly_metrics.map((month, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900">{month.month}</h4>
              <div className="mt-2">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(month.followers)}</p>
                <p className="text-sm text-gray-600">followers</p>
              </div>
              <div className="mt-2">
                <p className="text-lg font-semibold text-green-600">{month.engagement_rate}%</p>
                <p className="text-sm text-gray-600">engagement</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Growth Rate</h4>
              <p className="text-sm text-gray-600">
                {kpis.growth_rate > 0 ? '+' : ''}{kpis.growth_rate}% monthly follower growth
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target size={16} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Engagement Quality</h4>
              <p className="text-sm text-gray-600">
                {formatPercentage(kpis.overall_engagement_rate)} average engagement rate
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={16} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Content Performance</h4>
              <p className="text-sm text-gray-600">
                {kpis.total_posts_this_month} posts with {formatNumber(kpis.total_engagements)} total engagements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStats;
