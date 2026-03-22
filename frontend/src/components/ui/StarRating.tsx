'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 0-10 scale
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className={cn(iconSizes[size], 'text-amber-400 fill-amber-400')} />
      <span className={cn('font-semibold text-gray-800', sizeClasses[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn('text-gray-500', sizeClasses[size])}>({count})</span>
      )}
    </div>
  );
}
