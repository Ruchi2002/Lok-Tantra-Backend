import React from 'react';
import { useNavigate } from 'react-router-dom';

const TodayMeetings = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">
        Today's Meetings and Appointment
      </h3>
      
      <div className="flex-1 overflow-hidden">
        <div className="text-gray-500 text-sm py-2 h-full flex items-center justify-center">
          No meetings scheduled for today.
        </div>
      </div>
    </div>
  );
};

export default TodayMeetings;
