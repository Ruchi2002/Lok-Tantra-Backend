import { useNavigate } from "react-router-dom";
import React from "react";

const QuickActions = React.memo(({ labels = {} }) => {
  const navigate = useNavigate();

  const actions = [
    {
      label: labels?.logIssue || "Log New Issue",
      color: "bg-red-500",
      hover: "hover:bg-red-600",
      path: "/dashboard/issues",
    },
    {
      label: labels?.visitPlan || "Create Visit Plan",
      color: "bg-teal-500",
      hover: "hover:bg-green-600",
      path: "/dashboard/visits",
    },
    {
      label: labels?.viewReports || "View Reports",
      color: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      path: "/dashboard/reports",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6 h-full">
      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">
        {labels?.heading || "Quick Actions"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`${action.color} ${action.hover} text-white font-medium py-2 md:py-3 rounded-lg shadow transition w-full text-sm md:text-base`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;
