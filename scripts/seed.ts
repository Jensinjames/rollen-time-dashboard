import { supabase } from '@/lib/supabase/client';

const categories = [
  {
    id: '1',
    name: 'Faith',
    color_hex: '#2ECC71',
    goal_minutes: 60,
    gradient_start_hex: '#2ECC71',
    gradient_end_hex: '#27AE60',
  },
  {
    id: '2',
    name: 'Life',
    color_hex: '#F1C40F',
    goal_minutes: 60,
    gradient_start_hex: '#F1C40F',
    gradient_end_hex: '#F39C12',
  },
  {
    id: '3',
    name: 'Work',
    color_hex: '#E74C3C',
    goal_minutes: 120,
    gradient_start_hex: '#E74C3C',
    gradient_end_hex: '#C0392B',
  },
  {
    id: '4',
    name: 'Health',
    color_hex: '#FF4DA6',
    goal_minutes: 60,
    gradient_start_hex: '#FF4DA6',
    gradient_end_hex: '#FF1493',
  },
];

const subcategories = [
  // Faith subcategories
  {
    id: '1-1',
    category_id: '1',
    name: 'Daily Prayer',
    current_minutes: 0,
  },
  {
    id: '1-2',
    category_id: '1',
    name: 'Meditation',
    current_minutes: 0,
  },
  {
    id: '1-3',
    category_id: '1',
    name: 'Scripture Study',
    current_minutes: 0,
  },
  // Life subcategories
  {
    id: '2-1',
    category_id: '2',
    name: 'Family Time',
    current_minutes: 0,
  },
  {
    id: '2-2',
    category_id: '2',
    name: 'Social Activities',
    current_minutes: 0,
  },
  {
    id: '2-3',
    category_id: '2',
    name: 'Hobbies',
    current_minutes: 0,
  },
  // Work subcategories
  {
    id: '3-1',
    category_id: '3',
    name: 'Project A',
    current_minutes: 0,
  },
  {
    id: '3-2',
    category_id: '3',
    name: 'Emails',
    current_minutes: 0,
  },
  {
    id: '3-3',
    category_id: '3',
    name: 'Learning',
    current_minutes: 0,
  },
  // Health subcategories
  {
    id: '4-1',
    category_id: '4',
    name: 'Exercise',
    current_minutes: 0,
  },
  {
    id: '4-2',
    category_id: '4',
    name: 'Sleep',
    current_minutes: 0,
  },
  {
    id: '4-3',
    category_id: '4',
    name: 'Stress Management',
    current_minutes: 0,
  },
];

async function seed() {
  try {
    // Insert categories
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories);

    if (categoriesError) {
      throw categoriesError;
    }

    // Insert subcategories
    const { error: subcategoriesError } = await supabase
      .from('subcategories')
      .upsert(subcategories);

    if (subcategoriesError) {
      throw subcategoriesError;
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed(); 