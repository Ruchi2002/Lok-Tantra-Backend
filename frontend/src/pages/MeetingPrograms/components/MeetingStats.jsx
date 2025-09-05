import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  BarChart3,
  PieChart,
  UserCheck
} from 'lucide-react';
import { 
  useGetMeetingKPIsQuery,
  useGetMeetingStatsQuery
} from '../../../store/api/appApi';
import { useAuth } from '../../../hooks/useAuth';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MeetingStats = () => {
  const { user } = useAuth();
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useGetMeetingKPIsQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetMeetingStatsQuery();

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

  if (kpisLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (kpisError || statsError) {
    console.error('MeetingStats Error:', { kpisError, statsError });
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading meeting statistics</p>
        <p className="text-sm text-gray-500 mt-2">
          {kpisError?.data?.detail || statsError?.data?.detail || 'Please try again later'}
        </p>
      </div>
    );
  }

  // Debug logging
  console.log('MeetingStats Data:', { kpis, stats });
  console.log('Status Distribution:', stats?.status_distribution);
  console.log('Monthly Trends:', stats?.monthly_trends);

  // Check if we have data
  if (!kpis && !stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available. Please check if you're logged in and the backend is running.</p>
        <p className="text-sm text-gray-400 mt-2">Backend URL: http://localhost:8000</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting:</h4>
          <ul className="text-blue-800 text-sm space-y-1 text-left">
            <li>• Make sure you're logged in to the application</li>
            <li>• Ensure the backend server is running on port 8000</li>
            <li>• Check browser console for any error messages</li>
            <li>• Verify your authentication token is valid</li>
          </ul>
        </div>
      </div>
    );
  }

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
        {stats?.status_distribution && stats.status_distribution.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.status_distribution.map((item) => (
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No status distribution data available</p>
            <p className="text-sm text-gray-400 mt-2">Stats data: {JSON.stringify(stats?.status_distribution)}</p>
          </div>
        )}
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

      {/* Role-Based Meeting Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Meetings by Assignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Created by me */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-900 mb-1">Created by Me</p>
            <p className="text-2xl font-bold text-blue-900">{formatNumber(kpis?.meetings_created_by_me || 0)}</p>
          </div>

          {/* Assigned to me */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-900 mb-1">Assigned to Me</p>
            <p className="text-2xl font-bold text-green-900">{formatNumber(kpis?.meetings_assigned_to_me || 0)}</p>
          </div>

          {/* Assigned to Field Agents */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-900 mb-1">Assigned to Field Agents</p>
            <p className="text-2xl font-bold text-purple-900">{formatNumber(kpis?.meetings_assigned_to_field_agents || 0)}</p>
          </div>
        </div>
      </div>

      {/* Current User's Meeting Summary */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            My Meeting Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Role</p>
              <p className="text-lg font-semibold text-blue-900 capitalize">{user.role}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Total Accessible</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(kpis?.total_meetings || 0)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(kpis?.upcoming_today || 0)}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Access Level:</strong> {
                user.role === 'SuperAdmin' ? 'Can view and manage all meetings across all tenants' :
                user.role === 'Admin' ? 'Can view meetings you created and meetings assigned to Field Agents in your tenant' :
                user.role === 'FieldAgent' ? 'Can only view meetings assigned to you' :
                'Limited access to meetings'
              }
            </p>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {stats?.monthly_trends && stats.monthly_trends.length > 0 ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Trends
          </h3>
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.monthly_trends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Total Meetings"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Completed"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cancelled" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Cancelled"
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Monthly Trends Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(() => {
              const totalMeetings = stats.monthly_trends.reduce((sum, item) => sum + item.total, 0);
              const totalCompleted = stats.monthly_trends.reduce((sum, item) => sum + item.completed, 0);
              const totalCancelled = stats.monthly_trends.reduce((sum, item) => sum + item.cancelled, 0);
              const avgMeetingsPerMonth = totalMeetings / stats.monthly_trends.length;
              
              return (
                <>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-600">Total Meetings (6 months)</p>
                    <p className="text-2xl font-bold text-blue-900">{totalMeetings}</p>
                    <p className="text-xs text-blue-700">Avg: {avgMeetingsPerMonth.toFixed(1)}/month</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-600">Total Completed</p>
                    <p className="text-2xl font-bold text-green-900">{totalCompleted}</p>
                    <p className="text-xs text-green-700">{((totalCompleted / totalMeetings) * 100).toFixed(1)}% completion rate</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-600">Total Cancelled</p>
                    <p className="text-2xl font-bold text-red-900">{totalCancelled}</p>
                    <p className="text-xs text-red-700">{((totalCancelled / totalMeetings) * 100).toFixed(1)}% cancellation rate</p>
                  </div>
                </>
              );
            })()}
          </div>
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
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Trends
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No monthly trends data available</p>
            <p className="text-sm text-gray-400 mt-2">Monthly trends data: {JSON.stringify(stats?.monthly_trends)}</p>
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
