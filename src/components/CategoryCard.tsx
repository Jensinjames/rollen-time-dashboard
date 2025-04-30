import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { DonutProgress } from './DonutProgress';
import { Category, Subcategory } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  subcategories: Subcategory[];
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, subcategories }) => {
  const cardStyle = {
    borderColor: category.color_hex,
    borderWidth: '2px',
  };

  const headerStyle = {
    background: `linear-gradient(135deg, ${category.gradient_start_hex}, ${category.gradient_end_hex})`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden" style={cardStyle}>
        <CardHeader className="text-white" style={headerStyle}>
          <CardTitle className="flex items-center justify-between">
            <span>{category.name}</span>
            <span className="text-sm font-normal">
              {category.progress_pct}% Complete
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <DonutProgress subcategories={subcategories} size={180} />
          </div>
          
          <div className="space-y-4">
            {subcategories.map((subcat) => (
              <div key={subcat.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{subcat.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {subcat.current_minutes}m / {category.goal_minutes}m
                  </span>
                  <div
                    className="h-2 w-20 rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${subcat.gradient_start_hex}, ${subcat.gradient_end_hex})`,
                      opacity: subcat.progress_pct ? subcat.progress_pct / 100 : 0.2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href={`/category/${category.id}`}
            className="mt-6 flex items-center justify-end text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 