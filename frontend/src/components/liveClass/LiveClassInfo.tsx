import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import type { LiveClass } from '@/services/liveClassService';

interface LiveClassInfoProps {
  liveClass: Partial<LiveClass>;
}

export const LiveClassInfo: React.FC<LiveClassInfoProps> = ({ liveClass }) => {
  const {
    title,
    description,
    courseName,
    courseId,
    instructorName,
    instructorAvatar,
    duration = 60,
    difficulty = 'Intermediate',
    tags = [],
    certificateEligible = true,
  } = liveClass;

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        {/* Title & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              {difficulty} Level
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {duration} Minutes
            </span>
            {certificateEligible && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Certificate Track
              </span>
            )}
          </div>

          {courseId && (
            <Link
              to={`/dashboard/course/${courseId}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors group"
            >
              <span>View Full Syllabus</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h2>

        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line mb-6">
          {description ||
            'Welcome to this live interactive classroom session. Join your instructor for real-time coding breakdowns, architecture concepts, and live Q&A discussions.'}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Topics:
            </span>
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Instructor & Session Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Instructor Profile */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex items-center gap-4">
          {instructorAvatar ? (
            <img
              src={instructorAvatar}
              alt={instructorName || 'Instructor'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-sky-500/30 shadow-md shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
              {(instructorName || 'I').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Faculty
            </div>
            <h4 className="text-base font-bold text-white truncate">{instructorName || 'Lead Faculty Instructor'}</h4>
            <p className="text-xs text-slate-400 truncate">Senior AI & Software Engineering Mentor</p>
          </div>
        </div>

        {/* Course Track Link */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 shadow-inner">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Enrolled Course Track</div>
            <h4 className="text-base font-bold text-white truncate">{courseName || 'Shaivika Technical Program'}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Student Access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClassInfo;
