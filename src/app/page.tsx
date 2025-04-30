'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryCard } from '@/components/CategoryCard';
import { DateRangeToggle } from '@/components/DateRangeToggle';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { LoadingDashboard } from '@/components/LoadingDashboard';
import { RootState } from '@/store';
import { setTimeRange, setDateRange } from '@/store/slices/dashboardSlice';
import { getDateRangeForTimeRange } from '@/lib/utils';
import { TimeRange } from '@/types';
import { Activity, Brain, Moon, Heart } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const {
    categories,
    subcategories,
    entries,
    selectedTimeRange,
    dateRange,
    isLoading,
  } = useSelector((state: RootState) => state.dashboard);

  // Use our custom hook to fetch and manage data
  useDashboardData(dateRange);

  const handleTimeRangeChange = (range: TimeRange) => {
    dispatch(setTimeRange(range));
    dispatch(setDateRange(getDateRangeForTimeRange(range)));
  };

  const summaryMetrics = [
    {
      title: 'Daily Score',
      value: 85,
      icon: Activity,
      color: '#2ECC71',
      unit: '%',
    },
    {
      title: 'Motivation Level',
      value: 92,
      icon: Brain,
      color: '#9B59B6',
      unit: '%',
    },
    {
      title: 'Sleep Duration',
      value: 7.5,
      icon: Moon,
      color: '#3498DB',
      unit: 'h',
    },
    {
      title: 'Health Balance',
      value: 88,
      icon: Heart,
      color: '#FF4DA6',
      unit: '%',
    },
  ];

  if (isLoading) {
    return <LoadingDashboard />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DateRangeToggle
          value={selectedTimeRange}
          onChange={handleTimeRangeChange}
        />
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className="rounded-full p-3"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: metric.color }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-semibold dark:text-white">
                    <AnimatedCounter
                      from={0}
                      to={metric.value}
                      formatValue={(v) => `${v}${metric.unit}`}
                    />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            subcategories={subcategories.filter(
              (s) => s.category_id === category.id
            )}
          />
        ))}
      </div>
    </div>
  );
}
