import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Radio,
  Play,
  FileText,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassAuthorizationService } from '@/services/liveClassAuthorizationService';
import { liveClassService, normalizeLiveClassStatus, type LiveClass } from '@/services/liveClassService';

export const StudentLiveClassroomSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'today' | 'upcoming' | 'completed' | 'missed'>('today');

  // Real-time ticker for countdown timers
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    setLoading(true);
    const unsubscribe = liveClassService.subscribeLiveClasses((data) => {
      setClasses(data);
      setLoading(false);
    });

    const ticker = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(ticker);
    };
  }, []);

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const filteredClasses = useMemo(() => {
    if (activeFilter === 'today') {
      return classes.filter((c) => isToday(c.startTime) || normalizeLiveClassStatus(c.status) === 'live');
    }
    if (activeFilter === 'upcoming') {
      return classes.filter((c) => new Date(c.startTime).getTime() > nowMs && normalizeLiveClassStatus(c.status) !== 'completed');
    }
    if (activeFilter === 'completed') {
      return classes.filter((c) => normalizeLiveClassStatus(c.status) === 'completed');
    }
    if (activeFilter === 'missed') {
      return classes.filter((c) => new Date(c.endTime).getTime() < nowMs && normalizeLiveClassStatus(c.status) !== 'completed');
    }
    return classes;
  }, [classes, activeFilter, nowMs]);

  // Counts
  const todayCount = useMemo(() => classes.filter((c) => isToday(c.startTime) || normalizeLiveClassStatus(c.status) === 'live').length, [classes]);
  const upcomingCount = useMemo(() => classes.filter((c) => new Date(c.startTime).getTime() > nowMs && normalizeLiveClassStatus(c.status) !== 'completed').length, [classes]);
  const completedCount = useMemo(() => classes.filter((c) => normalizeLiveClassStatus(c.status) === 'completed').length, [classes]);
  const missedCount = useMemo(() => classes.filter((c) => new Date(c.endTime).getTime() < nowMs && normalizeLiveClassStatus(c.status) !== 'completed').length, [classes]);

  // Countdown Calculator Helper
  const getCountdown = (targetISO: string) => {
    const diff = new Date(targetISO).getTime() - nowMs;
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isPast: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, mins, secs, isPast: false };
  };

  const handleJoinLive = (c: LiveClass) => {
    const normStatus = normalizeLiveClassStatus(c.status);
    if (normStatus === 'scheduled') {
      toast.info('🕐 NOT STARTED: Waiting for instructor to start the live classroom.');
      return;
    }

    if (normStatus === 'completed' || normStatus === 'cancelled') {
      toast.info(normStatus === 'completed' ? '✓ CLASS COMPLETED: This live session has ended.' : '✕ CANCELLED: This live session was cancelled.');
      return;
    }

    const authRes = liveClassAuthorizationService.authorizeLiveClassAccess(
      c.id,
      userProfile
        ? { uid: userProfile.uid, role: userProfile.role, email: userProfile.email }
        : user
        ? { uid: user.uid, email: user.email || undefined }
        : null,
      c
    );

    if (!authRes.allowed) {
      toast.error(authRes.message || 'You are not authorized to join this live class.');
      return;
    }

    navigate(`/live-classroom/room/${c.id}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-sky-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-['Sora']">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
              <span>ENTERPRISE LIVE CLASSROOMS</span>
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span>Upcoming & Today's Live Sessions</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Join interactive video masterclasses, take live quizzes, vote on polls, and download session recordings.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'today'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-50'
            }`}
          >
            Today ({todayCount})
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'upcoming'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-50'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'completed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-50'
            }`}
          >
            Completed ({completedCount})
          </button>

          <button
            onClick={() => setActiveFilter('missed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'missed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-sky-50'
            }`}
          >
            Missed ({missedCount})
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-xs animate-pulse">
          Syncing live classroom schedule...
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-12 text-center space-y-2 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
          <Video className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">No live sessions currently listed in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((c) => {
            const normStatus = normalizeLiveClassStatus(c.status);
            const isLiveNow = normStatus === 'live';
            const isCompleted = normStatus === 'completed';
            const isScheduled = normStatus === 'scheduled' || normStatus === 'draft';
            const cd = getCountdown(c.startTime);

            return (
              <div
                key={c.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
                  isLiveNow
                    ? 'border-rose-300 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-blue-400'
                }`}
              >
                {/* Banner Header */}
                <div className="relative h-40 bg-slate-900 overflow-hidden">
                  <img
                    src={c.banner || c.thumbnail || 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80'}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold border border-slate-700">
                      {c.meetingProvider.toUpperCase()}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        isLiveNow
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isScheduled
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isLiveNow ? '🔴 LIVE NOW' : isScheduled ? '🕐 NOT STARTED' : '✓ COMPLETED'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider truncate">{c.courseName}</p>
                    <h3 className="font-heading font-extrabold text-sm text-white truncate">{c.title}</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center border border-white">
                        {c.instructorName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{c.instructorName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{c.moduleTitle || 'Core Module'}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                      {c.description}
                    </p>
                  </div>

                  {/* Realtime Countdown Timer Bar */}
                  {!cd.isPast && !isLiveNow && (
                    <div className="bg-sky-50 dark:bg-zinc-800/80 border border-sky-200 dark:border-zinc-700 rounded-xl p-3 text-center space-y-1">
                      <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Stream Begins In</p>
                      <div className="flex items-center justify-center gap-2 text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                        <span>{cd.days}d</span>:<span>{String(cd.hours).padStart(2, '0')}h</span>:<span>{String(cd.mins).padStart(2, '0')}m</span>:
                        <span className="text-blue-600 dark:text-blue-400">{String(cd.secs).padStart(2, '0')}s</span>
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    {c.notesUrl && (
                      <a
                        href={c.notesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-200"
                        title="Download Lecture Notes"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Notes</span>
                      </a>
                    )}

                    {c.recordingUrl && (
                      <a
                        href={c.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center gap-1 border border-purple-200"
                        title="Watch Session Recording"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-600" />
                        <span>Recording</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleJoinLive(c)}
                      disabled={isScheduled}
                      className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isLiveNow
                          ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md shadow-rose-600/30 animate-pulse'
                          : isCompleted
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 cursor-not-allowed opacity-80'
                      }`}
                    >
                      {isLiveNow ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-white" />
                          <span>JOIN LIVE</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current text-white" />
                          <span>View Session</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Waiting for instructor</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
