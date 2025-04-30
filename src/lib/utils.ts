import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Category, Subcategory, Entry, TimeRange, DAILY_ALLOCATABLE_MINUTES } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateProgress(current: number, goal: number): number {
  return Math.min(Math.round((current / goal) * 100), 100);
}

export function getDateRangeForTimeRange(timeRange: TimeRange): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

export function calculateCategoryProgress(
  category: Category,
  subcategories: Subcategory[],
  entries: Entry[],
  timeRange: TimeRange
): Category {
  const { start, end } = getDateRangeForTimeRange(timeRange);
  const multiplier = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1;
  const goalMinutes = category.goal_minutes * multiplier;

  const categoryEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const subcategory = subcategories.find((s) => s.id === entry.subcategory_id);
    return (
      subcategory?.category_id === category.id &&
      entryDate >= start &&
      entryDate <= end
    );
  });

  const totalMinutes = categoryEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const progress = calculateProgress(totalMinutes, goalMinutes);

  return {
    ...category,
    progress_pct: progress,
  };
}

export function calculateSubcategoryProgress(
  subcategory: Subcategory,
  category: Category,
  entries: Entry[],
  timeRange: TimeRange
): Subcategory {
  const { start, end } = getDateRangeForTimeRange(timeRange);
  const multiplier = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 1;
  const allocatableMinutes = DAILY_ALLOCATABLE_MINUTES * multiplier;

  const subcategoryEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entry.subcategory_id === subcategory.id &&
      entryDate >= start &&
      entryDate <= end
    );
  });

  const totalMinutes = subcategoryEntries.reduce((sum, entry) => sum + entry.minutes, 0);
  const progress = calculateProgress(totalMinutes, allocatableMinutes);

  return {
    ...subcategory,
    current_minutes: totalMinutes,
    progress_pct: progress,
    gradient_start_hex: category.gradient_start_hex,
    gradient_end_hex: category.gradient_end_hex,
  };
}