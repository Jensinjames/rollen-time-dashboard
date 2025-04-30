import React from 'react';

export const LoadingDashboard: React.FC = () => {
  return (
    <div className="container mx-auto animate-pulse p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Summary Cards */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white shadow-sm dark:bg-gray-800"
          >
            <div className="h-16 rounded-t-lg bg-gray-200 p-6 dark:bg-gray-700" />
            <div className="space-y-4 p-6">
              <div className="h-48 w-48 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 