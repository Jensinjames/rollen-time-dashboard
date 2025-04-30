import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, Subcategory, Entry, TimeRange, DateRange } from '@/types';

interface DashboardState {
  categories: Category[];
  subcategories: Subcategory[];
  entries: Entry[];
  selectedTimeRange: TimeRange;
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  categories: [],
  subcategories: [],
  entries: [],
  selectedTimeRange: 'day',
  dateRange: {
    start: new Date(),
    end: new Date(),
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setSubcategories: (state, action: PayloadAction<Subcategory[]>) => {
      state.subcategories = action.payload;
    },
    setEntries: (state, action: PayloadAction<Entry[]>) => {
      state.entries = action.payload;
    },
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.selectedTimeRange = action.payload;
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCategories,
  setSubcategories,
  setEntries,
  setTimeRange,
  setDateRange,
  setLoading,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 