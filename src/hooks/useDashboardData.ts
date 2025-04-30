import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '@/lib/supabase/client';
import {
  setCategories,
  setSubcategories,
  setEntries,
  setLoading,
  setError,
} from '@/store/slices/dashboardSlice';
import { RootState } from '@/store';
import { Category, Subcategory, Entry, DateRange } from '@/types';
import {
  calculateCategoryProgress,
  calculateSubcategoryProgress,
} from '@/lib/utils';

export function useDashboardData(dateRange: DateRange) {
  const dispatch = useDispatch();
  const { selectedTimeRange } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    async function fetchData() {
      try {
        dispatch(setLoading(true));

        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        // Fetch subcategories
        const { data: subcategories, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*');

        if (subcategoriesError) throw subcategoriesError;

        // Fetch entries within date range
        const { data: entries, error: entriesError } = await supabase
          .from('entries')
          .select('*')
          .gte('date', dateRange.start.toISOString())
          .lte('date', dateRange.end.toISOString());

        if (entriesError) throw entriesError;

        // Calculate progress for categories and subcategories
        const categoriesWithProgress = categories.map((category: Category) => {
          return calculateCategoryProgress(
            category,
            subcategories,
            entries || [],
            selectedTimeRange
          );
        });

        const subcategoriesWithProgress = subcategories.map(
          (subcategory: Subcategory) => {
            const parentCategory = categories.find(
              (c: Category) => c.id === subcategory.category_id
            );
            return calculateSubcategoryProgress(
              subcategory,
              parentCategory!,
              entries || [],
              selectedTimeRange
            );
          }
        );

        dispatch(setCategories(categoriesWithProgress));
        dispatch(setSubcategories(subcategoriesWithProgress));
        dispatch(setEntries(entries || []));
        dispatch(setError(null));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        dispatch(setError('Failed to fetch dashboard data'));
      } finally {
        dispatch(setLoading(false));
      }
    }

    fetchData();
  }, [dispatch, dateRange, selectedTimeRange]);
} 