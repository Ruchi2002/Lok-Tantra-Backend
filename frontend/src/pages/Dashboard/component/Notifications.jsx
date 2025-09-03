import { useEffect, useState } from "react";
import React from "react";

const Notifications = React.memo(({ labels = {} }) => {
  const notifications = [
    {
      id: 1,
      title: labels?.newIssue || "New Issue Logged",
      message: labels?.msg1 || "A citizen reported pothole on MG Road.",
      time: labels?.time1 || "5 min ago",
    },
    {
      id: 2,
      title: labels?.followUp || "Follow Up Reminder",
      message: labels?.msg2 || "Reminder to follow up on water supply complaint in Ward 9.",
      time: labels?.time2 || "2 hours ago",
    },
    {
      id: 3,
      title: labels?.visitUpdate || "Visit Plan Updated",
      message: labels?.msg3 || "The visit plan for the health camp has been updated.",
      time: labels?.time3 || "Yesterday",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-3 md:p-4 xl:p-3 h-full">
      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3">
        {labels?.title || "Notifications"}
      </h2>

      <ul className="space-y-2 md:space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className="p-2 rounded border border-gray-200 hover:bg-gray-50 transition text-xs md:text-sm leading-tight"
          >
            <h3 className="font-semibold text-teal-700">{notification.title}</h3>
            <p className="text-gray-600">{notification.message}</p>
            <p className="text-gray-400">{notification.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
});

Notifications.displayName = 'Notifications';

export default Notifications;
