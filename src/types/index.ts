export interface Profile {
  id: string;
  email: string;
  display_name: string;
}

export interface Category {
  id: string;
  name: string;
  color_hex: string;
  goal_minutes: number;
  gradient_start_hex: string;
  gradient_end_hex: string;
  progress_pct?: number; // Derived field
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  current_minutes: number;
  progress_pct?: number; // Derived field
  gradient_start_hex?: string; // Virtual field from parent
  gradient_end_hex?: string; // Virtual field from parent
}

export interface Entry {
  id: string;
  user_id: string;
  subcategory_id: string;
  date: string; // ISO date string
  minutes: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type TimeRange = 'day' | 'week' | 'month';

export const DAILY_ALLOCATABLE_MINUTES = 420; // 7 hours