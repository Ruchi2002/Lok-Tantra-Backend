import { useEffect, useState } from "react";
import React from "react";

const FollowUpsSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-3 md:p-4 xl:p-3 h-full">
    <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-start border-b pb-2 last:border-none">
          <div className="flex-1">
            <div className="bg-gray-200 rounded animate-pulse h-3 w-20 mb-1" />
            <div className="bg-gray-200 rounded animate-pulse h-3 w-32 mb-1" />
            <div className="bg-gray-200 rounded animate-pulse h-3 w-16" />
          </div>
          <div className="bg-gray-200 rounded animate-pulse h-5 w-16 ml-2" />
        </div>
      ))}
    </div>
  </div>
);

const FollowUps = React.memo(({ issues = [], labels, translatedFollowUps = [] }) => {
  const [processedFollowUps, setProcessedFollowUps] = useState([]);

  // Process follow-ups from issues data
  useEffect(() => {
    if (!issues || issues.length === 0) {
      setProcessedFollowUps([]);
      return;
    }

    // Get today's follow-ups (issues that need attention)
    const today = new Date().toISOString().split("T")[0];
    const followUps = issues
      .filter((issue) => {
        // Include issues that are not resolved
        const isNotResolved = issue.status !== "Resolved";
        // Include issues from today or earlier
        const issueDate = new Date(issue.date || issue.created_at);
        const todayDate = new Date(today);
        return isNotResolved && issueDate <= todayDate;
      })
      .slice(0, 5); // Limit to 5 items

    // Use translated follow-ups if available, otherwise use processed ones
    if (translatedFollowUps.length > 0) {
      setProcessedFollowUps(translatedFollowUps);
    } else {
      setProcessedFollowUps(followUps.map(item => ({
        ...item,
        translatedIssue: item.issue || item.title || "No title",
        citizen: item.citizen_name || item.citizen || "Unknown"
      })));
    }
  }, [issues, translatedFollowUps]);

  // Get translated status label
  const getTranslatedStatus = (status) => {
    if (status === "Pending") return labels?.pending || "Pending";
    if (status === "In Progress") return labels?.inProgress || "In Progress";
    if (status === "Resolved") return labels?.resolved || "Resolved";
    if(status === "Open") return labels?.open || "Open";
    return status;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-4 xl:p-3 h-full">
      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
        {labels?.title || "Today's Follow-ups"}
      </h2>

      {processedFollowUps.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-sm text-gray-500">
            {issues.length === 0 ? "No issues available" : "No follow-ups for today"}
          </p>
        </div>
      ) : (
        <ul className="space-y-2 md:space-y-3">
          {processedFollowUps.map((item, index) => (
            <li
              key={item.id || index}
              className="flex justify-between items-start border-b pb-2 last:border-none"
            >
              <div className="text-xs md:text-sm leading-tight">
                <p className="font-medium text-gray-700">{item.citizen}</p>
                <p className="text-gray-500">{item.translatedIssue}</p>
                <p className="text-gray-500">{item.date || item.created_at}</p>
              </div>
              <span
                className={`text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded ${
                  item.status === "Pending"
                    ? "bg-orange-100 text-orange-700"
                    : item.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : item.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {getTranslatedStatus(item.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

FollowUps.displayName = 'FollowUps';

export default FollowUps;
