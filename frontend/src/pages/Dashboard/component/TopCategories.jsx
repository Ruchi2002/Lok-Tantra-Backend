import { useEffect, useState } from "react";
import React from "react";

const TopCategoriesSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      ))}
    </div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mt-4 animate-pulse"></div>
  </div>
);

const TopCategories = React.memo(({ issues = [], labels, translatedCategories = [] }) => {
  const [categoriesWithCounts, setCategoriesWithCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate categories from issues data directly
  useEffect(() => {
    const calculateCategoriesFromIssues = () => {
      try {
        setLoading(true);
        
        if (!issues || issues.length === 0) {
          setCategoriesWithCounts([]);
          setLoading(false);
          return;
        }

        // Count issues by category
        const categoryCount = {};
        issues.forEach(issue => {
          // Handle both category and category_id fields
          const category = issue.category || issue.category_id || 'Unknown';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });

        // Convert to array format and sort by count
        const sortedCategories = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => [name, count]);

        setCategoriesWithCounts(sortedCategories);
        setError(null);
      } catch (err) {
        setError("Failed to calculate categories");
      } finally {
        setLoading(false);
      }
    };

    calculateCategoriesFromIssues();
  }, [issues]);

  const total = issues.length;

  // Show skeleton while loading
  if (loading) {
    return <TopCategoriesSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{labels?.heading || "Top Categories"}</h3>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{labels?.heading || "Top Categories"}</h3>
      
      {categoriesWithCounts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-600">
            {labels?.noData || "No category data available"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoriesWithCounts.map(([name, count], index) => {
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={`${name}-${index}`}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="font-medium text-gray-700">{name}</span>
                  <span className="text-sm text-gray-500">({count} issues)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-teal-600 min-w-[3rem] text-right">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          {labels?.footer?.replace("{count}", total) || `Based on ${total} issues logged`}
        </p>
      </div>
    </div>
  );
});

TopCategories.displayName = 'TopCategories';

export default TopCategories;