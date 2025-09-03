import React from 'react';
import { 
  BarChart3, TrendingUp, FileText, BookOpen, Mic, CheckCircle, Clock, 
  AlertCircle, Activity, Users, CalendarDays, Star, Download, Eye, Tag
} from 'lucide-react';

const DocumentStats = ({ stats, kpis }) => {
  const formatNumber = (value) => {
    return value.toLocaleString();
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.total_documents)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp size={16} className="mr-1 text-green-600" />
            <span>+12% from last month</span>
          </div>
        </div>

        {/* Total Speeches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Speeches</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.total_speeches)}</p>
              <p className="text-sm text-gray-500">
                {kpis.drafted_speeches} Drafted • {kpis.finalized_speeches} Finalized
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Mic size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <CheckCircle size={16} className="mr-1 text-green-600" />
            <span>{formatPercentage((kpis.finalized_speeches / kpis.total_speeches) * 100)} finalized</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.total_views)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Download size={16} className="mr-1 text-blue-600" />
            <span>{formatNumber(kpis.total_downloads)} downloads</span>
          </div>
        </div>

        {/* Featured Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured Documents</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis.featured_documents)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Activity size={16} className="mr-1 text-yellow-600" />
            <span>High engagement content</span>
          </div>
        </div>
      </div>

      {/* Document Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Type</h3>
          <div className="space-y-4">
            {kpis.documents_by_type.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents by Status</h3>
          <div className="space-y-4">
            {kpis.documents_by_status.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    item.status === 'Final' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.status === 'Final' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Tags and Authors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tags</h3>
          <div className="space-y-3">
            {kpis.top_tags.map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{tag.tag}</span>
                </div>
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {tag.count} docs
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Authors</h3>
          <div className="space-y-3">
            {kpis.top_authors.map((author, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{author.author}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{author.documents} docs</div>
                  <div className="text-xs text-gray-500">{author.views} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Added Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Documents</h3>
        <div className="space-y-4">
          {kpis.recent_documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  doc.type === 'Research Note' ? 'bg-blue-100' :
                  doc.type === 'Speech Draft' ? 'bg-orange-100' : 'bg-green-100'
                }`}>
                  {doc.type === 'Research Note' ? (
                    <BookOpen size={16} className="text-blue-600" />
                  ) : doc.type === 'Speech Draft' ? (
                    <Mic size={16} className="text-orange-600" />
                  ) : (
                    <FileText size={16} className="text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">{doc.date}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  doc.type === 'Research Note' ? 'bg-blue-100 text-blue-700' :
                  doc.type === 'Speech Draft' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {doc.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Uploads Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Document Uploads</h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {kpis.monthly_uploads.map((month, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: '80px' }}>
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-300"
                  style={{ 
                    height: `${(month.documents / Math.max(...kpis.monthly_uploads.map(m => m.documents))) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{month.month}</span>
              <span className="text-xs font-medium text-gray-900">{month.documents}</span>
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
              <h4 className="text-sm font-medium text-gray-900">Engagement Rate</h4>
              <p className="text-sm text-gray-600">
                {formatPercentage(Math.round((kpis.total_downloads / Math.max(kpis.total_views, 1)) * 100))} download rate
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Completion Rate</h4>
              <p className="text-sm text-gray-600">
                {formatPercentage((kpis.finalized_speeches / Math.max(kpis.total_speeches, 1)) * 100)} speeches finalized
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star size={16} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Featured Content</h4>
              <p className="text-sm text-gray-600">
                {formatPercentage((kpis.featured_documents / Math.max(kpis.total_documents, 1)) * 100)} documents featured
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentStats;
