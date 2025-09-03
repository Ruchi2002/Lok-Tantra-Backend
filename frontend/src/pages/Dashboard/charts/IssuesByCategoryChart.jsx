import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-4 w-full">
    <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
    <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse" />
  </div>
);

const IssuesByCategoryChart = React.memo(({ issues = [], labels, translatedData = [] }) => {
  // Calculate chart data from issues if translatedData is not available
  const chartData = React.useMemo(() => {
    if (translatedData.length > 0) {
      return translatedData;
    }

    if (!issues || issues.length === 0) {
      return [];
    }

    // Calculate categories from issues data
    const categoryCount = {};
    issues.forEach(issue => {
      const category = issue.category || issue.category_id || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Show top 5 categories
      .map(([category, count]) => ({
        category: category === 'Unknown' ? (labels?.unknown || 'Unknown') : category,
        issues: count
      }));
  }, [issues, translatedData, labels?.unknown]);

  // Show skeleton only when no data is available
  if (chartData.length === 0 && issues.length === 0) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{labels?.chartTitle || "Issues by Category"}</h2>

      {chartData.length === 0 ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500 text-sm">No category data available</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  borderColor: '#d1d5db',
                }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              />
              <Bar dataKey="issues" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

IssuesByCategoryChart.displayName = 'IssuesByCategoryChart';

export default IssuesByCategoryChart;