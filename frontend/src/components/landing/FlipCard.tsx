import React, { useState, memo } from 'react';
import { Star, Clock, ArrowRight, Check, RotateCw, BookOpen } from 'lucide-react';
import type { ICourse } from '../../../../shared/types/course';
import { useReducedMotion } from 'framer-motion';
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
  const [isFlipped, setIsFlipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const rawImageUrl = getCourseImage(course);
  const optimizedImageUrl = getOptimizedImageUrl(rawImageUrl, { width: 600, quality: 80 });

  // If user prefers reduced motion, render a clean static card without flip interaction
  if (shouldReduceMotion) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] overflow-hidden flex flex-col justify-between shadow-xs transition-colors h-[520px]">
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
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4 overflow-hidden">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#2563eb] dark:text-[#3b82f6] uppercase tracking-wider">
              {course.category || 'Engineering'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#ffffff] line-clamp-2">
              {course.title}
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#a1a5b7] line-clamp-2 leading-relaxed">
              {course.shortDescription || 'Practical hands-on curriculum with real terminal exercises.'}
            </p>
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
  }

  const handleFlip = (e: React.MouseEvent) => {
    // Prevent flip when clicking the enroll button
    const target = e.target as HTMLElement;
    if (target.closest('.no-flip-btn')) return;
    setIsFlipped(!isFlipped);
  };

  // Extract skills/bullet points or use defaults
  const bullets = course.skills && course.skills.length > 0
    ? course.skills.slice(0, 4)
    : ['Practical hands-on lab exercises', 'Real-time sandbox practices', 'Comprehensive project syllabus', 'Industry-verified certification'];

  return (
    <div
      className="perspective-1200 w-full h-[520px] cursor-pointer group"
      onClick={handleFlip}
    >
      {/* ─── 3D Card Inner Wrapper ────────────────────────────────────────── */}
      <div
        className={`
          relative w-full h-full preserve-3d duration-550 ease-in-out transition-[transform,box-shadow]
          ${isFlipped ? 'rotate-y-180 shadow-2xl scale-[1.01]' : 'shadow-xs hover:shadow-lg group-hover:scale-[1.005]'}
        `}
        style={{ willChange: 'transform' }}
      >
        
        {/* ════════════════════════════════════════════════════════════════════
           FRONT FACE
        ════════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-[#111827] rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] flex flex-col justify-between overflow-hidden">
          
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
            
            {/* Badges */}
            <div className="absolute top-3 left-3 bg-[#0b0f19]/90 text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold capitalize">
              {(course.level || 'all_levels').replace('_', ' ')}
            </div>
            
            <div className="absolute top-3 right-3 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{course.rating || 5.0}</span>
            </div>

            {/* Tap to Flip Hint in Top Right below rating */}
            <div className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer" title="Flip Card">
              <RotateCw className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Front Body */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4 overflow-hidden">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#2563eb] dark:text-[#3b82f6] uppercase tracking-wider">
                {course.category || 'Engineering'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#ffffff] line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-[#475569] dark:text-[#a1a5b7] line-clamp-2 leading-relaxed">
                {course.shortDescription || 'Practical hands-on curriculum with real terminal exercises.'}
              </p>
            </div>

            {/* Bottom Actions */}
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
                className="no-flip-btn w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
              >
                <span>Enroll in Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
           BACK FACE (revealed on 180deg flip)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-white dark:bg-[#111827] rounded-2xl border border-[#e2e8f0] dark:border-[#1f2937] p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
          
          <div className="space-y-4">
            {/* Header Lockup */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#2563eb] dark:text-[#3b82f6] uppercase tracking-wider">
                Syllabus & Outcomes
              </span>
              <div className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#ffffff] line-clamp-1">
              {course.title}
            </h3>

            {/* Bullet Points */}
            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                What you'll master:
              </p>
              <ul className="space-y-2">
                {bullets.map((bullet: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#475569] dark:text-[#a1a5b7] font-medium leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Meta Info */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.05]">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Skill Level</span>
                <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-200">
                  {(course.level || 'all_levels').replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Curriculum</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#2563eb]" />
                  <span>Interactive Labs</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom CTA Block */}
          <div className="space-y-4 pt-4 border-t border-[#e2e8f0] dark:border-[#1f2937]">
            <div className="flex items-center justify-between text-xs text-[#475569] dark:text-[#a1a5b7] font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration || '24 Hours'}
              </span>
              <span className="font-bold text-[#0f172a] dark:text-[#ffffff] text-base">
                {course.price !== undefined ? (course.price === 0 ? 'Free' : `₹${course.price}`) : 'Free'}
              </span>
            </div>

            <button
              onClick={() => onEnrollClick(course)}
              className="no-flip-btn w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
            >
              <span>Enroll in Course</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export const FlipCard = memo(FlipCardComponent);
