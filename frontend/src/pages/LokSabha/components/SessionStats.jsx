import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Star, 
  FileText, 
  CheckCircle, 
  Clock,
  Building2,
  Activity
} from 'lucide-react';

const SessionStats = ({ stats, kpis }) => {
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(kpis.total_questions || 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Questions Asked</p>
          </div>
          <div className="text-xs text-green-600 font-medium">
            +12% from last month
          </div>
        </div>

        {/* Starred vs Unstarred Ratio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Starred</div>
              <div className="text-lg font-bold text-yellow-600">
                {formatPercentage(kpis.starred_ratio || 0)}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatPercentage(kpis.unstarred_ratio || 0)}
            </h3>
            <p className="text-sm text-gray-600">Unstarred Questions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-3 h-3" />
            <span>Starred vs Unstarred Ratio</span>
          </div>
        </div>

        {/* Answered vs Pending */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Answered</div>
              <div className="text-lg font-bold text-green-600">
                {formatPercentage(kpis.answered_ratio || 0)}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatPercentage(kpis.pending_ratio || 0)}
            </h3>
            <p className="text-sm text-gray-600">Pending Questions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Answered vs Pending Ratio</span>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-lg font-bold text-purple-600">85%</div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Excellent</h3>
            <p className="text-sm text-gray-600">Performance Rating</p>
          </div>
          <div className="text-xs text-green-600 font-medium">
            Above average performance
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ministries Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top 3 Ministries Addressed</h3>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {kpis.top_ministries && kpis.top_ministries.slice(0, 3).map((ministry, index) => {
              const percentage = (ministry.count / kpis.total_questions) * 100;
              return (
                <div key={ministry.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium truncate">
                      {ministry.name}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {ministry.count} questions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(percentage)} of total questions
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Questions Per Session Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Questions Asked per Session</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {kpis.questions_per_session && kpis.questions_per_session.map((session, index) => {
              const maxQuestions = Math.max(...kpis.questions_per_session.map(s => s.count));
              const percentage = (session.count / maxQuestions) * 100;
              return (
                <div key={session.session} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {session.session}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {session.count} questions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question Type Distribution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Question Type Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Starred</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(kpis.starred_ratio || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Unstarred</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(kpis.unstarred_ratio || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Response Status */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Response Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Answered</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(kpis.answered_ratio || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(kpis.pending_ratio || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Questions/Session</span>
                <span className="text-sm font-medium text-gray-900">
                  {kpis.questions_per_session ? 
                    Math.round(kpis.questions_per_session.reduce((sum, s) => sum + s.count, 0) / kpis.questions_per_session.length) : 
                    0
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPercentage(kpis.answered_ratio || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency Score</span>
                <span className="text-sm font-medium text-gray-900">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Strong performance in starred questions with 33.3% ratio</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ministry of Finance receives most questions (15 total)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>85.2% response rate shows good accountability</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Session 2 had highest question volume (52 questions)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;
