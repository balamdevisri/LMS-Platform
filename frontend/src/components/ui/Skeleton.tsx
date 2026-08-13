import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={['animate-pulse rounded-2xl', 'bg-slate-200/80', 'dark:bg-zinc-800/80', className].filter(Boolean).join(' ')}
    />
  );
};
