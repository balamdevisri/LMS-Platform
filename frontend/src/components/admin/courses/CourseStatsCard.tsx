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
      bg: 'bg-blue-50/70 border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600',
    },
    green: {
      bg: 'bg-emerald-50/70 border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/70 border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      text: 'text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50/70 border-purple-100',
      iconBg: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600',
    },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-6 rounded-3xl border bg-white/95 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between ${selectedColor.bg}`}>
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
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
