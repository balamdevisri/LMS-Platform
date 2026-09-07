import React, { memo } from 'react';
import { Star, Clock, ArrowRight, Users, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import type { ICourse } from '../../../../shared/types/course';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface FlipCardProps {
  course: ICourse;
  getCourseImage: (course: ICourse) => string;
  onEnrollClick: (course: ICourse) => void;
}

// ── Spotlight color mapping according to course category ────────────────────
const getCategorySpotlightColor = (category?: string): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('python') || cat.includes('ai') || cat.includes('data')) {
    return 'rgba(168, 85, 247, 0.25)'; // Purple/Violet
  }
  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('linux') || cat.includes('k8s')) {
    return 'rgba(14, 165, 233, 0.25)'; // Sky/Cyan
  }
  if (cat.includes('git') || cat.includes('dbms') || cat.includes('sql')) {
    return 'rgba(245, 158, 11, 0.25)'; // Amber/Orange
  }
  if (cat.includes('c') || cat.includes('java') || cat.includes('dsa')) {
    return 'rgba(16, 185, 129, 0.25)'; // Emerald/Teal
  }
  return 'rgba(99, 102, 241, 0.25)'; // Electric Blue/Indigo
};

// Curated avatar representations for social proof stack
const MOCK_AVATARS = [
  { initials: 'AK', bg: 'bg-gradient-to-tr from-blue-500 to-indigo-600' },
  { initials: 'PV', bg: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
  { initials: 'RS', bg: 'bg-gradient-to-tr from-purple-500 to-pink-600' },
];

const FlipCardComponent: React.FC<FlipCardProps> = ({
  course,
  getCourseImage,
  onEnrollClick,
}) => {
  const rawImageUrl = getCourseImage(course);
  const optimizedImageUrl = getOptimizedImageUrl(rawImageUrl, { width: 600, quality: 80 });
  const bullets = course.skills && course.skills.length > 0 ? course.skills.slice(0, 3) : [];
  const spotlightColor = getCategorySpotlightColor(course.category);
  const enrollmentCount = (course.enrollmentCount && course.enrollmentCount > 0)
    ? course.enrollmentCount
    : 1240;

  return (
    <div
      className="course-design-card group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full min-h-[500px]"
      style={{ '--spotlight-color': spotlightColor } as React.CSSProperties}
    >
      {/* ── 1. Top-Right Radial Gradient Spotlight Overlay ── */}
      <div className="course-design-spotlight" />

      {/* ── 2. Top Image Header with Level & Rating Badges ── */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#1e293b] shrink-0">
        <img
          src={optimizedImageUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          width="384"
          height="192"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Soft vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Level Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
          {(course.level || 'all_levels').replace('_', ' ')}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
          <span>{course.rating ? Number(course.rating).toFixed(1) : '5.0'}</span>
        </div>

        {/* Bottom Category Tag Floating Over Image */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            {course.category || 'Engineering'}
          </span>
        </div>
      </div>

      {/* ── 3. Card Body: Course Info, Avatars & Dynamic Progress ── */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 relative z-10">
        <div className="space-y-3">
          {/* Course Title */}
          <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] dark:text-[#ffffff] line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {course.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#475569] dark:text-[#94a3b8] line-clamp-2 leading-relaxed font-normal">
            {course.shortDescription || 'Hands-on modular curriculum with interactive terminal labs and real-world projects.'}
          </p>

          {/* Key Skills Chips */}
          {bullets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {bullets.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── 4. Overlapping Avatar Stack + Milestone Track ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            {/* Overlapping Student Avatars Stack */}
            <div className="course-avatar-stack">
              {MOCK_AVATARS.map((av, aIdx) => (
                <div
                  key={aIdx}
                  className={`w-6 h-6 rounded-full border-2 border-white dark:border-[#111827] ${av.bg} flex items-center justify-center text-[9px] font-black text-white shadow-xs cursor-default`}
                  title="Enrolled Student"
                >
                  {av.initials}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#111827] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-200 shadow-xs">
                +
              </div>
            </div>

            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {enrollmentCount.toLocaleString()} enrolled
            </span>
          </div>

          {/* Dynamic Learning Milestone / Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>Interactive Labs Included</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Verified</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 w-full" />
            </div>
          </div>
        </div>

        {/* ── 5. Card Footer: Duration, Pricing & CTA ── */}
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-[#475569] dark:text-[#a1a5b7] font-medium">
            {course.duration ? (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold">{course.duration}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold">Self-paced</span>
              </span>
            )}

            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#0f172a] dark:text-[#ffffff]">
                {course.price !== undefined ? (course.price === 0 ? 'Free' : `₹${course.price}`) : 'Free'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onEnrollClick(course)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
          >
            <span>Enroll in Course</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const FlipCard = memo(FlipCardComponent);
export default FlipCard;
