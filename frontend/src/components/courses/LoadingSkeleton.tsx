import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'detail';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 6, variant = 'card' }) => {
  if (variant === 'detail') {
    return (
      <div className="space-y-8 animate-pulse font-['Sora']">
        <div className="h-64 rounded-3xl bg-slate-900/80 border border-slate-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 rounded-3xl bg-slate-900/80 border border-slate-800" />
            <div className="h-60 rounded-3xl bg-slate-900/80 border border-slate-800" />
          </div>
          <div className="h-96 rounded-3xl bg-slate-900/80 border border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className={variant === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-4 animate-pulse"
        >
          <div className="aspect-video rounded-2xl bg-slate-800" />
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-full" />
          <div className="h-3 bg-slate-800/60 rounded w-2/3" />
          <div className="pt-4 flex justify-between">
            <div className="h-3 bg-slate-800 rounded w-1/4" />
            <div className="h-3 bg-slate-800 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
};
