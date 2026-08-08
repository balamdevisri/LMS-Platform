import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  breadcrumbs?: { label: string; path?: string }[];
  action?: React.ReactNode;
  courseCount?: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  description,
  badgeText,
  breadcrumbs = [],
  action,
  courseCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-1.5">
        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-600" />}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-indigo-500 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 dark:text-zinc-300 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight leading-none">
            {title}
          </h1>
          {courseCount !== undefined && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <BookOpen className="w-3 h-3" />
              {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
            </span>
          )}
          {badgeText && courseCount === undefined && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
              <BookOpen className="w-3 h-3" />
              {badgeText}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {/* Action Slot */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
