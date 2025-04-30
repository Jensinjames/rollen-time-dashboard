import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 1,
  formatValue = (v) => Math.round(v).toString(),
  className = '',
}) => {
  const springValue = useSpring(from, {
    stiffness: 100,
    damping: 30,
    duration,
  });

  const displayValue = useTransform(springValue, (current) => formatValue(current));

  React.useEffect(() => {
    springValue.set(to);
  }, [to, springValue]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
}; 