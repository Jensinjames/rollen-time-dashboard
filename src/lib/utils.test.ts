import { describe, it, expect } from 'vitest';
import {
  calculateProgress,
  getDateRangeForTimeRange,
  calculateCategoryProgress,
  calculateSubcategoryProgress,
} from './utils';
import { Category, Subcategory, Entry } from '@/types';

describe('calculateProgress', () => {
  it('calculates correct percentage', () => {
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(75, 100)).toBe(75);
    expect(calculateProgress(150, 100)).toBe(100); // Should cap at 100%
  });
});

describe('getDateRangeForTimeRange', () => {
  it('returns correct date range for day', () => {
    const { start, end } = getDateRangeForTimeRange('day');
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('returns correct date range for week', () => {
    const { start, end } = getDateRangeForTimeRange('week');
    expect(start.getDay()).toBe(0); // Should start on Sunday
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });

  it('returns correct date range for month', () => {
    const { start, end } = getDateRangeForTimeRange('month');
    expect(start.getDate()).toBe(1); // Should start on first day of month
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});

describe('calculateCategoryProgress', () => {
  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    color_hex: '#000000',
    goal_minutes: 60,
    gradient_start_hex: '#000000',
    gradient_end_hex: '#000000',
  };

  const mockSubcategories: Subcategory[] = [
    {
      id: '1-1',
      category_id: '1',
      name: 'Test Subcategory',
      current_minutes: 0,
    },
  ];

  const mockEntries: Entry[] = [
    {
      id: '1',
      user_id: '1',
      subcategory_id: '1-1',
      date: new Date().toISOString(),
      minutes: 30,
    },
  ];

  it('calculates category progress correctly', () => {
    const result = calculateCategoryProgress(
      mockCategory,
      mockSubcategories,
      mockEntries,
      'day'
    );
    expect(result.progress_pct).toBe(50);
  });
});

describe('calculateSubcategoryProgress', () => {
  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    color_hex: '#000000',
    goal_minutes: 60,
    gradient_start_hex: '#000000',
    gradient_end_hex: '#000000',
  };

  const mockSubcategory: Subcategory = {
    id: '1-1',
    category_id: '1',
    name: 'Test Subcategory',
    current_minutes: 0,
  };

  const mockEntries: Entry[] = [
    {
      id: '1',
      user_id: '1',
      subcategory_id: '1-1',
      date: new Date().toISOString(),
      minutes: 30,
    },
  ];

  it('calculates subcategory progress correctly', () => {
    const result = calculateSubcategoryProgress(
      mockSubcategory,
      mockCategory,
      mockEntries,
      'day'
    );
    expect(result.current_minutes).toBe(30);
    expect(result.gradient_start_hex).toBe(mockCategory.gradient_start_hex);
    expect(result.gradient_end_hex).toBe(mockCategory.gradient_end_hex);
  });
}); 