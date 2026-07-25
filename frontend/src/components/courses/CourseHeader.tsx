import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen } from 'lucide-react';

interface CourseHeaderProps {
  title: string;
  description?: string;
  badgeText?: string;
  breadcrumbs?: { label: string; path?: string }[];
  action?: React.ReactNode;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  title,
  description,
  badgeText = 'SHAIVIKA Enterprise Academy',
  breadcrumbs = [],
  action,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-sky-100 p-6 sm:p-8 shadow-md shadow-sky-100/50 font-['Sora'] text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 max-w-3xl">
        {/* Breadcrumb Navigation */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-sky-600 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-sky-600 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>{badgeText}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Action CTA Slot */}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
