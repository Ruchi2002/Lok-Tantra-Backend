const StatsCards = ({ issues = [], dashboardData, labels, translatedTopCategory }) => {
  // Use dashboard data if available, otherwise calculate from issues
  const total = dashboardData?.total_issues || issues.length;
  const resolved = dashboardData?.resolved_issues || issues.filter((i) => i.status === "Resolved").length;
  const resolvedPercent = dashboardData?.resolved_percentage || (total ? Math.round((resolved / total) * 100) : 0);

  const stats = [
    {
      title: labels?.totalIssues || "Total Issues",
      value: total,
      color: "bg-gradient-to-br from-red-50 to-red-300 text-red-800",
    },
    {
      title: labels?.resolvedPercent || "% Resolved",
      value: `${resolvedPercent}%`,
      color: "bg-gradient-to-br from-green-50 to-emerald-300 text-green-800",
    },
    {
      title: labels?.topCategory || "Top Category",
      value: translatedTopCategory || "Unknown",
      color: "bg-gradient-to-br from-blue-200 to-violet-300 text-blue-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`p-4 md:p-6 rounded-lg shadow ${stat.color} text-center`}
        >
          <h2 className="text-3xl font-bold mb-1">{stat.value}</h2>
          <p className="text-gray-800 font-semibold">{stat.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
