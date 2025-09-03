import { useEffect, useState } from "react";
import React from "react";
import { useGetVisitsQuery } from "../../../store/api/appApi";

const UpcomingVisits = React.memo(({ labels, selectedLocation = "All" }) => { 
  // RTK Query hook
  const { data: allVisits, isLoading: loading, error } = useGetVisitsQuery({ skip: 0, limit: 100 });

  // Process and filter visits
  const upcomingVisitsList = React.useMemo(() => {
    if (!Array.isArray(allVisits)) return [];
    
    // Filter for upcoming visits
    let upcoming = allVisits.filter((visit) => {
      // Check if visit is upcoming/pending
      const isUpcoming = visit.status === "Upcoming";
      
      // Check if visit has future date
      const today = new Date();
      const visitDate = new Date(visit.visit_date);
      const isFutureDate = visitDate >= today.setHours(0, 0, 0, 0);
      
      return isUpcoming && isFutureDate;
    });
    
    // Filter by location if specified
    if (selectedLocation && selectedLocation !== "All") {
      upcoming = upcoming.filter(visit => visit.location === selectedLocation);
    }
    
    // Sort by visit date (earliest first)
    upcoming.sort((a, b) => {
      const dateA = new Date(a.visit_date);
      const dateB = new Date(b.visit_date);
      return dateA - dateB;
    });
    
    // Take only first 5 for display
    return upcoming.slice(0, 5);
  }, [allVisits, selectedLocation]);

  // ✅ Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  // ✅ Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "No time";
    try {
      // Handle both HH:MM:SS and HH:MM formats
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return timeString; // Return original if parsing fails
    }
  };

  // ✅ Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {labels?.heading || "Upcoming Visits"}
        </h2>
        {selectedLocation && selectedLocation !== "All" && (
          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            📍 {selectedLocation}
          </span>
        )}
      </div>

      {/* ✅ Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
          <span className="ml-2 text-gray-500">Loading upcoming visits...</span>
        </div>
      )}

      {/* ✅ Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ✅ Visits List */}
      {!loading && !error && (
        <ul className="space-y-3">
          {upcomingVisitsList.length === 0 ? (
            <li className="text-sm text-gray-500 text-center py-4">
              {labels?.noVisits || "No upcoming visits scheduled"}
              {selectedLocation && selectedLocation !== "All" && 
                ` for ${selectedLocation}`
              }
            </li>
          ) : (
            upcomingVisitsList.map((visit) => (
              <li
                key={visit.id}
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-teal-700 text-sm">
                    {visit.visit_reason || visit.title || "No reason specified"}
                  </h3>
                  {visit.priority && (
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                      {visit.priority}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  📍 {visit.location || labels?.unknownLocation || "Unknown location"}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    🗓️ {formatDate(visit.visit_date)}
                  </span>
                  <span>
                    🕐 {formatTime(visit.visit_time)}
                  </span>
                </div>
                
                {visit.notes && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    💬 {visit.notes}
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
});

UpcomingVisits.displayName = 'UpcomingVisits';

export default UpcomingVisits;