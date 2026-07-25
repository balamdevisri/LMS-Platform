import React from 'react';
import { CourseStatusBadge } from './CourseStatusBadge';
import type { CourseStatus } from '../../../../shared/types/course';
import { Star, Clock, Globe, Shield, Sparkles, PlayCircle } from 'lucide-react';

interface CourseBannerProps {
  title: string;
  subtitle: string;
  category: string;
  level: string;
  duration: string;
  language: string;
  rating: number;
  ratingCount?: number;
  enrollmentCount: number;
  bannerUrl?: string;
  status?: CourseStatus;
  aiGenerated?: boolean;
  onStartCourse?: () => void;
}

export const CourseBanner: React.FC<CourseBannerProps> = ({
  title,
  subtitle,
  category,
  level,
  duration,
  language,
  rating,
  ratingCount = 120,
  enrollmentCount,
  bannerUrl,
  status,
  aiGenerated,
  onStartCourse,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-sky-600 via-sky-700 to-indigo-800 border border-sky-500 shadow-xl p-6 sm:p-10 text-white font-['Sora']">
      {bannerUrl && (
        <div className="absolute inset-0 z-0">
          <img src={bannerUrl} alt={title} className="w-full h-full object-cover opacity-20 filter blur-xs" />
          <div className="absolute inset-0 bg-linear-to-r from-sky-900/90 via-sky-800/80 to-indigo-900/90" />
        </div>
      )}

      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
              {category}
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-900/40 border border-sky-400/30 text-sky-100 text-xs font-bold capitalize">
              {level.replace('_', ' ')}
            </span>
            {status && <CourseStatusBadge status={status} />}
            {aiGenerated && (
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" /> AI Assisted Track
              </span>
            )}
          </div>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white leading-tight">
          {title}
        </h1>

        <p className="text-xs sm:text-base text-sky-100 font-normal leading-relaxed max-w-3xl">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-6 text-xs text-sky-100 font-medium pt-2 border-t border-white/15">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Star className="w-4 h-4 fill-current text-amber-300" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-sky-200 font-normal">({ratingCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sky-200" />
            <span>{enrollmentCount.toLocaleString()} Students Enrolled</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-200" />
            <span>{duration} Total Length</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-sky-200" />
            <span>Language: {language}</span>
          </div>
        </div>

        {onStartCourse && (
          <div className="pt-4">
            <button
              onClick={onStartCourse}
              className="py-3.5 px-8 rounded-2xl bg-white text-sky-800 hover:bg-sky-50 font-extrabold text-xs flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 text-sky-600" />
              <span>Start Learning Track Now ➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
