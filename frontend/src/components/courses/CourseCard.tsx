import React from 'react';
import { Link } from 'react-router-dom';
import type { ICourse } from '../../../../shared/types/course';
import { CourseThumbnail } from './CourseThumbnail';
import { CourseStatusBadge } from './CourseStatusBadge';
import { Star, Clock, Users, ArrowRight, Bookmark, Award, PlayCircle, CheckCircle2, Zap } from 'lucide-react';
import { courseService } from '../../services/courseService';

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
  beginner:           { bg: 'bg-emerald-50 dark:bg-emerald-950/40',  text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  intermediate:       { bg: 'bg-amber-50 dark:bg-amber-950/40',      text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500'   },
  advanced:           { bg: 'bg-rose-50 dark:bg-rose-950/40',        text: 'text-rose-700 dark:text-rose-400',       dot: 'bg-rose-500'    },
  beginner_to_advanced: { bg: 'bg-indigo-50 dark:bg-indigo-950/40',  text: 'text-indigo-700 dark:text-indigo-400',   dot: 'bg-indigo-500'  },
  all_levels:         { bg: 'bg-slate-100 dark:bg-zinc-800',         text: 'text-slate-600 dark:text-zinc-400',      dot: 'bg-slate-400'   },
};
// ────────────────────────────────────────────────────────────────────────────

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isAdmin = false,
  onBookmark,
}) => {
  // ── Progress from courseService (preserves all existing logic) ──────────────
  const checkpoint = courseService.getCourseCheckpoint(course.id, 'default_student');
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

  // Star rating display (filled / half)
  const ratingStars = Math.round((course.rating ?? 0) * 2) / 2;
  const fullStars = Math.floor(ratingStars);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 dark:hover:shadow-indigo-900/10 overflow-hidden">

      {/* ── Thumbnail + Progress Bar ─────────────────────────────────────────── */}
      <div className="relative">
        <CourseThumbnail src={course.thumbnail} alt={course.title} category={course.category} />

        {/* Admin status badge */}
        {isAdmin && (
          <div className="absolute top-3 right-3">
            <CourseStatusBadge status={course.status} />
          </div>
        )}

        {/* Bookmark */}
        {!isAdmin && onBookmark && (
          <button
            onClick={(e) => { e.preventDefault(); onBookmark(course.id); }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-white/60 text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-indigo-600 transition-colors backdrop-blur-md cursor-pointer shadow-sm"
            title="Bookmark Course"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Completion badge overlay */}
        {isCompleted && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </div>
        )}

        {/* Progress bar (thin strip under thumbnail) */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
            <div
              className={`h-full transition-all duration-700 rounded-r-full ${isCompleted ? 'bg-emerald-400' : 'bg-indigo-400'}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Card Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 space-y-3">

        {/* Difficulty + Price row */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-transparent ${levelStyle.bg} ${levelStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${levelStyle.dot}`} />
            {levelLabel}
          </span>
          <span className={`text-xs font-extrabold ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {isFree ? 'Free' : `$${course.price.toFixed(2)}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
          <Link to={`/course/${course.slug}`}>{course.title}</Link>
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {course.shortDescription}
        </p>

        {/* Skills */}
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

        {/* ── Stats Row: Rating · Students · Duration ──────────────────────── */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-500 pt-1 border-t border-slate-100 dark:border-zinc-800">
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
            <span className="font-bold text-slate-700 dark:text-zinc-300 ml-0.5">
              {(course.rating ?? 0).toFixed(1)}
            </span>
          </div>

          {/* Students */}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{(course.enrollmentCount ?? 0).toLocaleString()}</span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* ── Certificate Badge + Progress ─────────────────────────────────── */}
        <div className="flex items-center justify-between gap-2">
          {/* Certificate badge — shown for published courses */}
          {course.status === 'published' && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <Award className="w-3.5 h-3.5 fill-amber-400/20" />
              Certificate
            </div>
          )}

          {/* Progress pill */}
          {progressPercent > 0 ? (
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                {Math.round(progressPercent)}%
              </span>
            </div>
          ) : null}
        </div>

        {/* ── CTA Button ───────────────────────────────────────────────────── */}
        <Link
          to={`/course/${course.slug}`}
          className={`group/btn w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
            isCompleted
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
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
