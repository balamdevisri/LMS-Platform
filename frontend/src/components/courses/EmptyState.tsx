import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Courses Found',
  description = 'No course tracks match your current filter parameters or search term.',
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl font-['Sora'] text-slate-300 my-6">
      <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
        <BookOpen className="w-8 h-8" />
      </div>
      <h3 className="font-heading font-bold text-lg text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 font-medium leading-relaxed">
        {description}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="py-2.5 px-5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
