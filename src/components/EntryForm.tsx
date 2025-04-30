import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { supabase } from '@/lib/supabase/client';
import { Category, Subcategory } from '@/types';

interface EntryFormData {
  date: string;
  category_id: string;
  subcategory_id: string;
  minutes: number;
}

export const EntryForm: React.FC = () => {
  const { categories, subcategories } = useSelector(
    (state: RootState) => state.dashboard
  );
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>();

  const filteredSubcategories = subcategories.filter(
    (s) => s.category_id === selectedCategory
  );

  const onSubmit = async (data: EntryFormData) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('entries').insert([
        {
          date: data.date,
          subcategory_id: data.subcategory_id,
          minutes: data.minutes,
          user_id: '1', // TODO: Replace with actual user ID from auth
        },
      ]);

      if (error) throw error;

      reset();
      // TODO: Add success toast notification
    } catch (error) {
      console.error('Error adding entry:', error);
      // TODO: Add error toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          {...register('date', { required: 'Date is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          {...register('category_id', { required: 'Category is required' })}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a category</option>
          {categories.map((category: Category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subcategory
        </label>
        <select
          {...register('subcategory_id', { required: 'Subcategory is required' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a subcategory</option>
          {filteredSubcategories.map((subcategory: Subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
        </select>
        {errors.subcategory_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.subcategory_id.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Minutes</label>
        <input
          type="number"
          {...register('minutes', {
            required: 'Minutes is required',
            min: { value: 1, message: 'Minutes must be at least 1' },
          })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {errors.minutes && (
          <p className="mt-1 text-sm text-red-600">{errors.minutes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Entry'}
      </button>
    </form>
  );
}; 