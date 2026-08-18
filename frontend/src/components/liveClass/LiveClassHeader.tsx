import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Users, Sparkles } from 'lucide-react';
import { LiveConnectionStatus } from './LiveConnectionStatus';
import type { SocketConnectionStatus } from '@/hooks/useLiveClassSocket';

export interface LiveClassHeaderProps {
  courseTitle?: string;
  courseId?: string;
  classTitle: string;
  instructorName?: string;
  status: string; // 'LIVE' | 'SCHEDULED' | 'ENDED' | 'CANCELLED'
  scheduledAt?: string;
  startTime?: string;
  connectionStatus?: SocketConnectionStatus;
  onlineCount?: number;
}

export const LiveClassHeader: React.FC<LiveClassHeaderProps> = ({
  courseTitle = 'KaizenQ Masterclass',
  courseId,
  classTitle,
  instructorName = 'Lead Instructor',
  status,
  connectionStatus = 'connected',
  onlineCount = 1,
}) => {
  const navigate = useNavigate();
  const normalizedStatus = (status || 'SCHEDULED').toUpperCase();

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-xl font-['Sora']">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Branding & Class Navigation */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 shadow-sm shrink-0 cursor-pointer"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              {/* KaizenQ Platform Brand Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-sky-300 font-extrabold text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>KAIZENQ</span>
              </div>

              {/* Course Title Badge */}
              {courseId ? (
                <Link
                  to={`/dashboard/course/${courseId}`}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold truncate max-w-[200px] sm:max-w-xs transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-sky-400" />
                  <span className="truncate">{courseTitle}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold truncate max-w-[200px] sm:max-w-xs">
                  <BookOpen className="w-3 h-3 text-sky-400" />
                  <span className="truncate">{courseTitle}</span>
                </span>
              )}

              {/* Live Status Badge */}
              {normalizedStatus === 'LIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-red-500 -ml-3.5" />
                  <span>LIVE NOW</span>
                </span>
              ) : normalizedStatus === 'SCHEDULED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>UPCOMING</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                  <span>CONCLUDED</span>
                </span>
              )}
            </div>

            {/* Live Class Title */}
            <h1 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">
              {classTitle}
            </h1>
          </div>
        </div>

        {/* Right: Faculty Meta, Online Audience Counter, Socket Engine Status */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-300">
            <span className="text-slate-400 text-[11px]">Faculty:</span>
            <strong className="text-white truncate max-w-[120px]">{instructorName}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-emerald-400">
            <Users className="w-3.5 h-3.5" />
            <span>{onlineCount || 1} Online</span>
          </div>

          <LiveConnectionStatus status={connectionStatus} />
        </div>
      </div>
    </header>
  );
};

export default LiveClassHeader;
