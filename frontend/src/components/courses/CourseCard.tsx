import React from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { CourseThumbnail } from './CourseThumbnail';
import { CourseStatusBadge } from './CourseStatusBadge';
import {
  Star,
  Clock,
  Users,
  ArrowRight,
  Bookmark,
  Award,
  PlayCircle,
  CheckCircle2,
  Zap,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { useAuth } from '@/contexts/AuthContext';

interface CourseCardProps {
  course: ICourse;
  isAdmin?: boolean;
  onBookmark?: (id: string) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

// ─── Difficulty color map ────────────────────────────────────────────────────
const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  beginner:           { bg: 'bg-emerald-50 dark:bg-emerald-950/50',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  intermediate:       { bg: 'bg-amber-50 dark:bg-amber-950/50',      text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500'   },
  advanced:           { bg: 'bg-rose-50 dark:bg-rose-950/50',        text: 'text-rose-700 dark:text-rose-400',       dot: 'bg-rose-500'    },
  beginner_to_advanced: { bg: 'bg-indigo-50 dark:bg-indigo-950/50',  text: 'text-indigo-700 dark:text-indigo-400',   dot: 'bg-indigo-500'  },
  all_levels:         { bg: 'bg-slate-100 dark:bg-zinc-800',         text: 'text-slate-600 dark:text-zinc-300',      dot: 'bg-slate-400'   },
};

// ── Spotlight color mapping according to course category ────────────────────
const getCategorySpotlightColor = (category?: string): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('python') || cat.includes('ai') || cat.includes('data')) {
    return 'rgba(168, 85, 247, 0.25)';
  }
  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('linux') || cat.includes('k8s')) {
    return 'rgba(14, 165, 233, 0.25)';
  }
  if (cat.includes('git') || cat.includes('dbms') || cat.includes('sql')) {
    return 'rgba(245, 158, 11, 0.25)';
  }
  if (cat.includes('c') || cat.includes('java') || cat.includes('dsa')) {
    return 'rgba(16, 185, 129, 0.25)';
  }
  return 'rgba(99, 102, 241, 0.25)';
};

// Social proof avatars
const MOCK_AVATARS = [
  { initials: 'AK', bg: 'bg-gradient-to-tr from-blue-500 to-indigo-600' },
  { initials: 'PV', bg: 'bg-gradient-to-tr from-emerald-500 to-teal-600' },
  { initials: 'RS', bg: 'bg-gradient-to-tr from-purple-500 to-pink-600' },
];

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  onBookmark,
}) => {
  // ── Progress from courseService (preserves all existing logic) ──────────────
  const { user } = useAuth();
  const activeUserId = user?.uid || 'default_student';
  const checkpoint = courseService.getCourseCheckpoint(course.id, activeUserId);
  const progressPercent = checkpoint?.progressPercent ?? 0;
  const isCompleted = progressPercent >= 100;
  const isInProgress = progressPercent > 0 && !isCompleted;
  // ───────────────────────────────────────────────────────────────────────────

  const isFree = course.price === 0;
  const levelKey = (course.level || 'all_levels').toLowerCase().replace(/\s+to\s+/, '_to_').replace(/\s/g, '_');
  const levelStyle = levelColors[levelKey] ?? levelColors['all_levels'];

  // Humanize level label
  const levelLabel = (course.level || 'All Levels')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Star rating display
  const ratingStars = Math.round((course.rating ?? 0) * 2) / 2;
  const fullStars = Math.floor(ratingStars);
  const spotlightColor = getCategorySpotlightColor(course.category);
  const studentCount = (course.enrollmentCount && course.enrollmentCount > 0)
    ? course.enrollmentCount
    : 1120;

  return (
    <div
      className="course-design-card group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 shadow-sm"
      style={{ '--spotlight-color': spotlightColor } as React.CSSProperties}
    >
      {/* ── 1. Top-Right Radial Gradient Spotlight Overlay ── */}
      <div className="course-design-spotlight" />

      {/* ── 2. Thumbnail & Badges ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <CourseThumbnail src={course.thumbnail} alt={course.title} category={course.category} />

        {/* Soft dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* Admin status badge */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-10">
            <CourseStatusBadge status={course.status} />
          </div>
        )}

        {/* Bookmark */}
        {!isAdmin && onBookmark && (
          <button
            onClick={(e) => { e.preventDefault(); onBookmark(course.id); }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-white/60 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-indigo-600 transition-colors backdrop-blur-md cursor-pointer shadow-sm z-10"
            title="Bookmark Course"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Completion badge overlay */}
        {isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black shadow-md z-10">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </div>
        )}

        {/* Floating Category Pill on Bottom of Thumbnail */}
        {course.category && (
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              {course.category}
            </span>
          </div>
        )}
      </div>

      {/* ── 3. Card Body ───────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 space-y-3.5 relative z-10">

        {/* Difficulty + Price row */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-transparent ${levelStyle.bg} ${levelStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelStyle.dot}`} />
            {levelLabel}
          </span>
          <span className={`text-xs font-black ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {isFree ? 'Free' : `₹${course.price.toFixed(2)}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
          <Link to={`/course/${course.slug}`}>{course.title}</Link>
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1 font-normal">
          {course.shortDescription || course.description || 'Comprehensive technical curriculum with practical exercises.'}
        </p>

        {/* Skills Chips */}
        {course.skills && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.skills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/50"
              >
                {skill}
              </span>
            ))}
            {course.skills.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium self-center">
                +{course.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* ── 4. Stats Row: Rating · Overlapping Avatars · Duration ─────────── */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-zinc-700'}`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-700 dark:text-zinc-200 ml-0.5 text-[11px]">
              {(course.rating ?? 0).toFixed(1)}
            </span>
          </div>

          {/* Overlapping Avatar Stack */}
          <div className="flex items-center gap-1.5">
            <div className="course-avatar-stack">
              {MOCK_AVATARS.map((av, aIdx) => (
                <div
                  key={aIdx}
                  className={`w-5 h-5 rounded-full border border-white dark:border-zinc-900 ${av.bg} flex items-center justify-center text-[8px] font-black text-white shadow-xs`}
                  title="Enrolled Learner"
                >
                  {av.initials}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
              {studentCount.toLocaleString()}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[11px]">{course.duration}</span>
          </div>
        </div>

        {/* ── 5. Dynamic Progress / Milestone Bar ──────────────────────────── */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
              <BookOpen className="w-3 h-3 text-indigo-500" />
              <span>{isCompleted ? 'All Modules Finished' : isInProgress ? 'In Progress' : 'Curriculum Track'}</span>
            </span>
            <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isInProgress ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
              {progressPercent > 0 ? `${Math.round(progressPercent)}%` : 'Ready to Start'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isInProgress
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                  : 'bg-slate-200 dark:bg-zinc-700 w-full opacity-60'
              }`}
              style={{ width: progressPercent > 0 ? `${Math.min(progressPercent, 100)}%` : '100%' }}
            />
          </div>
        </div>

        {/* ── 6. CTA Button ─────────────────────────────────────────────────── */}
        <Link
          to={`/course/${course.slug}`}
          className={`group/btn w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
              : isInProgress
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              : 'bg-slate-900 dark:bg-zinc-100 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white shadow-slate-900/10'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Course</span>
            </>
          ) : isInProgress ? (
            <>
              <PlayCircle className="w-4 h-4" />
              <span>Continue Learning</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto group-hover/btn:translate-x-0.5 transition-transform" />
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Start Course</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto group-hover/btn:translate-x-0.5 transition-transform" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
};
