import React from 'react';
import { TimeRange } from '@/types';
import { cn } from '@/lib/utils';

interface DateRangeToggleProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  className?: string;
}

export const DateRangeToggle: React.FC<DateRangeToggleProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const options: { value: TimeRange; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  return (
    <div className={cn('inline-flex rounded-md shadow-sm', className)}>
      {options.map((option, idx) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            idx === 0 && 'rounded-l-md',
            idx === options.length - 1 && 'rounded-r-md',
            value === option.value
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-background hover:bg-accent hover:text-accent-foreground',
            'border border-input',
            idx !== 0 && 'border-l-0'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}; 