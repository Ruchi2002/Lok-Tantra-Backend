import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const Colors = ['#10b981', '#f59e0b', '#6366f1']; // Resolved, Pending, In Progress

const StatusDistributionPie = React.memo(({ issues = [], labels = {} }) => {
  // 📊 Prepare data
  const statusCounts = {
    Resolved: 0,
    Pending: 0,
    "In Progress": 0
  };

  issues.forEach(issue => {
    const status = issue.status;
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const data = [
    { name: labels?.Resolved || "Resolved", value: statusCounts.Resolved },
    { name: labels?.Pending || "Pending", value: statusCounts.Pending },
    { name: labels?.["In Progress"] || "In Progress", value: statusCounts["In Progress"] }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{labels?.chartTitle || "Status Distribution"}</h2>

      {data.every(item => item.value === 0) ? (
        <div className="w-full h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500 text-sm">No status data available</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  borderColor: '#d1d5db'
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

StatusDistributionPie.displayName = 'StatusDistributionPie';

export default StatusDistributionPie;