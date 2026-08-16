import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CourseStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

export const CourseStatsCard: React.FC<CourseStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50/70 dark:bg-slate-900 border-blue-100 dark:border-slate-800',
      iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400',
      text: 'text-blue-600 dark:text-cyan-400',
    },
    green: {
      bg: 'bg-emerald-50/70 dark:bg-slate-900 border-emerald-100 dark:border-slate-800',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-slate-900 border-amber-100 dark:border-slate-800',
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
    },
    purple: {
      bg: 'bg-purple-50/70 dark:bg-slate-900 border-purple-100 dark:border-slate-800',
      iconBg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-6 rounded-3xl border bg-white/95 dark:bg-slate-900 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between ${selectedColor.bg}`}>
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
          {value}
        </span>
      </div>
      
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${selectedColor.iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default CourseStatsCard;
