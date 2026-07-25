import React from 'react';
import type { CourseStatus } from '../../../../shared/types/course';

interface CourseStatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

export const CourseStatusBadge: React.FC<CourseStatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'draft':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'archived':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase backdrop-blur-md ${getBadgeStyle()} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'published' ? 'bg-emerald-400 animate-pulse' : status === 'draft' ? 'bg-amber-400' : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};
