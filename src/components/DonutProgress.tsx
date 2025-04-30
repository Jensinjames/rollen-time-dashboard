import React from 'react';
import { PieChart, Pie, Cell, Label } from 'recharts';
import { motion } from 'framer-motion';
import { Subcategory } from '@/types';

interface DonutProgressProps {
  subcategories: Subcategory[];
  size?: number;
  strokeWidth?: number;
}

export const DonutProgress: React.FC<DonutProgressProps> = ({
  subcategories,
  size = 200,
  strokeWidth = 20,
}) => {
  const data = subcategories.map((subcat) => ({
    name: subcat.name,
    value: subcat.progress_pct || 0,
    gradient_start: subcat.gradient_start_hex,
    gradient_end: subcat.gradient_end_hex,
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const normalizedData = data.map((item) => ({
    ...item,
    value: (item.value / total) * 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <PieChart width={size} height={size}>
        <defs>
          {normalizedData.map((entry, index) => (
            <linearGradient
              key={`grad-${index}`}
              id={`grad-${index}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={entry.gradient_start} />
              <stop offset="100%" stopColor={entry.gradient_end} />
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={normalizedData}
          cx={size / 2}
          cy={size / 2}
          innerRadius={size / 2 - strokeWidth}
          outerRadius={size / 2}
          paddingAngle={2}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {normalizedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
          ))}
          {normalizedData.map((entry, index) => (
            <Label
              key={`label-${index}`}
              position="outside"
              content={({ viewBox: { cx, cy }}) => {
                const RADIAN = Math.PI / 180;
                const radius = (size / 2) + 10;
                const startAngle = 90 - (entry.value / 2);
                const x = cx + radius * Math.cos(-startAngle * RADIAN);
                const y = cy - radius * Math.sin(-startAngle * RADIAN);
                
                return (
                  <text
                    x={x}
                    y={y}
                    fill={entry.gradient_end}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="text-xs font-medium"
                  >
                    {`${entry.name} • ${Math.round(entry.value)}%`}
                  </text>
                );
              }}
            />
          ))}
        </Pie>
      </PieChart>
    </motion.div>
  );
}; 