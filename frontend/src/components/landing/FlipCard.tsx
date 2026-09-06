import React, { memo } from 'react';
import { Star, Clock, ArrowRight } from 'lucide-react';
import type { ICourse } from '../../../../shared/types/course';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface FlipCardProps {
  course: ICourse;
  getCourseImage: (course: ICourse) => string;
  onEnrollClick: (course: ICourse) => void;
}

const FlipCardComponent: React.FC<FlipCardProps> = ({
  course,
  getCourseImage,
  onEnrollClick,
}) => {
  const rawImageUrl = getCourseImage(course);
  const optimizedImageUrl = getOptimizedImageUrl(rawImageUrl, { width: 600, quality: 80 });
  const bullets = course.skills && course.skills.length > 0 ? course.skills.slice(0, 3) : [];

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] overflow-hidden flex flex-col justify-between shadow-xs transition-colors h-full min-h-[480px]">
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#1e293b] shrink-0">
        <img
          src={optimizedImageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width="384"
          height="192"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute top-3 left-3 bg-[#0b0f19]/90 text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold capitalize">
          {(course.level || 'all_levels').replace('_', ' ')}
        </div>
        <div className="absolute top-3 right-3 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          <span>{course.rating || 5.0}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-[#2563eb] dark:text-[#3b82f6] uppercase tracking-wider">
            {course.category || 'Engineering'}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#ffffff] line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-[#475569] dark:text-[#a1a5b7] line-clamp-2 leading-relaxed">
            {course.shortDescription || 'Practical hands-on curriculum with real terminal exercises.'}
          </p>

          {/* Key skills pills */}
          {bullets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bullets.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-3 border-t border-[#e2e8f0] dark:border-[#1f2937]">
          <div className="flex items-center justify-between text-xs text-[#475569] dark:text-[#a1a5b7] font-medium">
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </span>
            )}
            <span className="font-bold text-[#0f172a] dark:text-[#ffffff] text-base">
              {course.price !== undefined ? (course.price === 0 ? 'Free' : `₹${course.price}`) : 'Free'}
            </span>
          </div>

          <button
            onClick={() => onEnrollClick(course)}
            className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Enroll in Course</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FlipCard = memo(FlipCardComponent);
