'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { supabase } from '@/lib/supabase/client';
import { Category, Subcategory } from '@/types';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { categories, subcategories } = useSelector(
    (state: RootState) => state.dashboard
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [editingSubcategory, setEditingSubcategory] =
    React.useState<Subcategory | null>(null);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      // TODO: Add success toast and refresh data
    } catch (error) {
      console.error('Error deleting category:', error);
      // TODO: Add error toast
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?'))
      return;

    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId);

      if (error) throw error;
      // TODO: Add success toast and refresh data
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      // TODO: Add error toast
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Categories Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Categories</h2>
            <button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border p-4"
                style={{ borderColor: category.color_hex }}
              >
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    Goal: {category.goal_minutes} minutes
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                    aria-label={`Edit ${category.name} category`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${category.name} category`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategories Section */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Subcategories</h2>
            <button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const categorySubcategories = subcategories.filter(
                (s) => s.category_id === category.id
              );

              return (
                <div key={category.id} className="space-y-2">
                  <h3
                    className="text-sm font-medium"
                    style={{ color: category.color_hex }}
                  >
                    {category.name}
                  </h3>
                  {categorySubcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h4 className="font-medium">{subcategory.name}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSubcategory(subcategory)}
                          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                          aria-label={`Edit ${subcategory.name} subcategory`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="rounded-md p-2 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${subcategory.name} subcategory`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TODO: Add modals for editing categories and subcategories */}
    </div>
  );
} 