import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen, Wifi, WifiOff } from 'lucide-react';
import type { SocketConnectionStatus } from '@/hooks/useLiveClassSocket';

interface LiveClassHeaderProps {
  courseTitle?: string;
  courseId?: string;
  classTitle: string;
  instructorName?: string;
  instructorAvatar?: string;
  status: string; // 'LIVE' | 'SCHEDULED' | 'ENDED' | etc.
  scheduledAt?: string;
  startTime?: string;
  connectionStatus?: SocketConnectionStatus;
  onlineCount?: number;
}

export const LiveClassHeader: React.FC<LiveClassHeaderProps> = ({
  courseTitle = 'Shaivika AI LMS Track',
  courseId,
  classTitle,
  instructorName = 'Lead Instructor',
  instructorAvatar,
  status,
  scheduledAt,
  startTime,
  connectionStatus = 'connected',
  onlineCount = 1,
}) => {
  const navigate = useNavigate();
  const normalizedStatus = (status || 'SCHEDULED').toUpperCase();

  const formattedTime = React.useMemo(() => {
    const raw = scheduledAt || startTime;
    if (!raw) return 'Scheduled Today';
    try {
      const d = new Date(raw);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Scheduled Session';
    }
  }, [scheduledAt, startTime]);

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Navigation & Titles */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 shadow-sm shrink-0"
            title="Go Back"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            {/* Course Badge & Status */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {courseId ? (
                <Link
                  to={`/dashboard/course/${courseId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{courseTitle}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide">
                  <BookOpen className="w-3 h-3 text-sky-400" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{courseTitle}</span>
                </span>
              )}

              {/* Status Indicator */}
              {normalizedStatus === 'LIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-red-500 -ml-3.5" />
                  LIVE NOW
                </span>
              ) : normalizedStatus === 'SCHEDULED' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  UPCOMING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                  COMPLETED
                </span>
              )}

              {/* Real-Time Socket Connection & Online Count */}
              {connectionStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{onlineCount} Online</span>
                </span>
              ) : connectionStatus === 'reconnecting' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Wifi className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>Reconnecting...</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <WifiOff className="w-3 h-3 text-rose-400" />
                  <span>Offline</span>
                </span>
              )}
            </div>

            {/* Live Class Title */}
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight truncate max-w-xl md:max-w-2xl">
              {classTitle}
            </h1>
          </div>
        </div>

        {/* Right: Instructor & Schedule Meta */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
          {/* Scheduled Date */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>{formattedTime}</span>
          </div>

          {/* Instructor Chip */}
          <div className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-inner">
            {instructorAvatar ? (
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-7 h-7 rounded-full object-cover border border-sky-400/40"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {instructorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Instructor</div>
              <div className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                {instructorName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LiveClassHeader;
