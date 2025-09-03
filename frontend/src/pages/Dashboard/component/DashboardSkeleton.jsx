import React from 'react';

const SkeletonCard = ({ className = "", height = "h-24" }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${height} ${className}`} />
);

const SkeletonText = ({ className = "", width = "w-full" }) => (
  <div className={`bg-gray-200 rounded animate-pulse h-4 ${width} ${className}`} />
);

const SkeletonCircle = ({ size = "w-12 h-12" }) => (
  <div className={`bg-gray-200 rounded-full animate-pulse ${size}`} />
);

const StatsCardSkeleton = () => (
  <div className="p-4 md:p-6 rounded-lg shadow bg-gradient-to-br from-gray-50 to-gray-200 text-center">
    <div className="bg-gray-300 rounded animate-pulse h-8 w-16 mx-auto mb-2" />
    <div className="bg-gray-300 rounded animate-pulse h-6 w-24 mx-auto" />
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-4 w-full">
    <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
    <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse" />
  </div>
);

const PanelSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-3 md:p-4 xl:p-3 h-full">
    <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
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

const QuickActionsSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6 h-full">
    <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-200 rounded-lg animate-pulse h-12" />
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Title Skeleton */}
      <div className="bg-gray-200 rounded animate-pulse h-8 w-64" />

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <div className="bg-orange-50 rounded-xl p-4 shadow-lg">
          <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="bg-gray-200 rounded animate-pulse h-4 w-20" />
                <div className="bg-gray-200 rounded animate-pulse h-4 w-8" />
              </div>
            ))}
          </div>
          <div className="bg-gray-200 rounded animate-pulse h-3 w-40 mt-3" />
        </div>
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PanelSkeleton />
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="bg-gray-200 rounded animate-pulse h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-gray-200">
                <div className="bg-gray-200 rounded animate-pulse h-4 w-32 mb-2" />
                <div className="bg-gray-200 rounded animate-pulse h-3 w-24 mb-1" />
                <div className="bg-gray-200 rounded animate-pulse h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
        <PanelSkeleton />
      </div>

      {/* Quick Actions Skeleton */}
      <QuickActionsSkeleton />
    </div>
  );
};

export default DashboardSkeleton; 