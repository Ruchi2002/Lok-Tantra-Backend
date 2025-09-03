import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Activity,
  MapPin,
  Users,
  CalendarDays
} from 'lucide-react';

const ProjectStats = ({ stats, kpis }) => {
  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

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
        {/* Total Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatNumber(kpis.total_projects || 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Projects</p>
          </div>
          <div className="text-xs text-green-600 font-medium">
            +2 new this month
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Utilized</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(kpis.total_utilized_amount || 0)}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(kpis.total_sanctioned_budget || 0)}
            </h3>
            <p className="text-sm text-gray-600">Sanctioned Budget</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DollarSign className="w-3 h-3" />
            <span>Budget Utilization: {formatPercentage((kpis.total_utilized_amount / kpis.total_sanctioned_budget) * 100 || 0)}</span>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-bold text-purple-600">
                {formatPercentage(kpis.average_progress || 0)}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">Excellent</h3>
            <p className="text-sm text-gray-600">Average Progress</p>
          </div>
          <div className="text-xs text-green-600 font-medium">
            Above target performance
          </div>
        </div>

        {/* Delayed Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Delayed</div>
              <div className="text-lg font-bold text-red-600">
                {kpis.delayed_projects || 0}
              </div>
            </div>
          </div>
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-gray-900">On Track</h3>
            <p className="text-sm text-gray-600">Project Timeline</p>
          </div>
          <div className="text-xs text-green-600 font-medium">
            All projects on schedule
          </div>
        </div>
      </div>

      {/* Project Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Project Status</h3>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {kpis.completed_projects || 0} projects
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ongoing</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {kpis.ongoing_projects || 0} projects
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Planned</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {kpis.planned_projects || 0} projects
              </span>
            </div>
          </div>
        </div>

        {/* Top Ongoing Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Ongoing Projects</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {kpis.top_ongoing_projects && kpis.top_ongoing_projects.slice(0, 3).map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium truncate">
                    {project.title}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {project.progress}% complete
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Projects by Category</h3>
            <Building2 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {kpis.projects_by_category && kpis.projects_by_category.slice(0, 5).map((category, index) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium truncate">
                    {category.category}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {category.count} projects
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(category.count / kpis.total_projects) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(category.budget)} budget
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(kpis.total_sanctioned_budget || 0)}
            </div>
            <div className="text-sm text-blue-600 font-medium">Total Sanctioned</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(kpis.total_utilized_amount || 0)}
            </div>
            <div className="text-sm text-green-600 font-medium">Total Utilized</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency((kpis.total_sanctioned_budget || 0) - (kpis.total_utilized_amount || 0))}
            </div>
            <div className="text-sm text-purple-600 font-medium">Remaining Budget</div>
          </div>
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Project Progress</h3>
        
        <div className="space-y-4">
          {kpis.monthly_progress && kpis.monthly_progress.map((month, index) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">
                  {month.month}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-green-600">
                    {month.completed} completed
                  </span>
                  <span className="text-blue-600">
                    {month.ongoing} ongoing
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(month.completed / (month.completed + month.ongoing)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Strong budget utilization at {formatPercentage((kpis.total_utilized_amount / kpis.total_sanctioned_budget) * 100 || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{kpis.ongoing_projects || 0} projects currently in progress</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Average progress of {formatPercentage(kpis.average_progress || 0)} across all projects</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Infrastructure projects lead with highest budget allocation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
