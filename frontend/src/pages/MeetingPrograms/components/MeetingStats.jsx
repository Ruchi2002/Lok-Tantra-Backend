import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

const MeetingStats = ({ stats, kpis }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString();
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return '0%';
    return `${Math.round(num)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Done': return 'text-green-600 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Government': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'NGO': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Public': return 'text-green-600 bg-green-50 border-green-200';
      case 'Private': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.total_meetings)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Today</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.upcoming_today)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(kpis?.completion_rate)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(kpis?.average_attendance)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Status Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.status_distribution?.map((item) => (
            <div key={item.status} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-600">{formatPercentage(item.percentage)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Types */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Meetings by Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.type_distribution?.map((item) => (
            <div key={item.meeting_type} className="text-center p-4 bg-gray-50 rounded-lg">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-3 ${getTypeColor(item.meeting_type)}`}>
                {item.meeting_type}
              </span>
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-600">{formatPercentage(item.percentage)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      {stats?.monthly_trends && stats.monthly_trends.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Trends
          </h3>
          <div className="space-y-3">
            {stats.monthly_trends.map((item) => (
              <div key={item.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{item.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Total: {item.total}</span>
                  <span className="text-sm text-green-600">Completed: {item.completed}</span>
                  <span className="text-sm text-red-600">Cancelled: {item.cancelled}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Metrics */}
      {stats?.attendance_metrics && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Average Expected</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.attendance_metrics.avg_expected)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Average Actual</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(stats.attendance_metrics.avg_actual)}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-900">{formatPercentage(stats.attendance_metrics.attendance_rate)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'created' ? 'bg-green-500' :
                  activity.type === 'updated' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingStats;
