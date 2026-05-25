import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="skeleton-container" aria-label="Loading weather data">
      {/* Search Header Skeleton */}
      <div className="skeleton skeleton-search" />

      {/* Date and Title Skeleton */}
      <div className="skeleton-header">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-subtitle" />
      </div>

      {/* Main Grid: Card + Stats */}
      <div className="skeleton-main-grid">
        <div className="skeleton skeleton-current-card" />
        <div className="skeleton-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`stat-skel-${i}`} className="skeleton skeleton-stat-card" />
          ))}
        </div>
      </div>

      {/* Chart Card Skeleton */}
      <div className="skeleton skeleton-chart-card" />

      {/* Forecast Section Title Skeleton */}
      <div className="skeleton skeleton-forecast-title" />

      {/* Forecast Row Skeletons */}
      <div className="skeleton-forecast-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`forecast-skel-${i}`} className="skeleton skeleton-forecast-card" />
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
