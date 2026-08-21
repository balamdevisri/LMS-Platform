import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Radio, Play, ArrowRight, X } from 'lucide-react';
import { liveClassService, normalizeLiveClassStatus, type LiveClass } from '@/services/liveClassService';

export const UpcomingLiveSessionsWidget: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [selectedClassModal, setSelectedClassModal] = useState<LiveClass | null>(null);

  // Real-time ticker
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const unsubscribe = liveClassService.subscribeLiveClasses((data) => {
      // Filter out completed/cancelled sessions automatically
      const active = data.filter((c) => {
        const norm = normalizeLiveClassStatus(c.status);
        return norm === 'live' || norm === 'scheduled';
      });
      setClasses(active);
    });

    const ticker = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(ticker);
    };
  }, []);

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
    navigate(`/student/live-class/${c.id}`);
  };

  if (classes.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-['Sora']">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider mb-2">
            <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
            <span>ENTERPRISE LIVE BROADCASTS</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Upcoming Live Learning Sessions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium">
            Join interactive video masterclasses led by principal architects with live Q&A, code sandboxes, and polls.
          </p>
        </div>

        <button
          onClick={() => navigate('/live-classroom')}
          className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-zinc-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer w-fit"
        >
          <span>View Schedule ({classes.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.slice(0, 3).map((c) => {
          const normStatus = normalizeLiveClassStatus(c.status);
          const isLiveNow = normStatus === 'live';
          const cd = getCountdown(c.startTime);

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={`bg-white dark:bg-zinc-900 rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl ${
                isLiveNow ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-sky-200/80 dark:border-zinc-800 hover:border-blue-400'
              }`}
            >
              {/* Banner */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
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
                      isLiveNow ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {isLiveNow ? '🔴 LIVE NOW' : '🕐 NOT STARTED'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider truncate">{c.courseName}</p>
                  <h3 className="font-heading font-extrabold text-sm text-white truncate">{c.title}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center border border-white">
                      {c.instructorName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{c.instructorName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500">{c.lessonTitle || 'Live Stream Session'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 font-medium leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Realtime Countdown Timer */}
                {!cd.isPast && !isLiveNow && (
                  <div className="bg-sky-50 dark:bg-zinc-800/80 border border-sky-200 dark:border-zinc-700 rounded-xl p-3 text-center space-y-1">
                    <p className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider">Starts In</p>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                      <span>{cd.days}d</span>:<span>{String(cd.hours).padStart(2, '0')}h</span>:<span>{String(cd.mins).padStart(2, '0')}m</span>:
                      <span className="text-blue-600 dark:text-blue-400">{String(cd.secs).padStart(2, '0')}s</span>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedClassModal(c)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-bold text-xs cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleJoinLive(c)}
                    disabled={!isLiveNow}
                    className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all ${
                      isLiveNow
                        ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer animate-pulse'
                        : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 cursor-not-allowed opacity-80'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isLiveNow ? 'Join Live Stream' : 'Waiting for instructor'}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DETAILS MODAL */}
      {selectedClassModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-['Sora'] border border-sky-200 dark:border-zinc-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">Live Classroom Details</h3>
              </div>
              <button onClick={() => setSelectedClassModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedClassModal.title}</h4>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">{selectedClassModal.description}</p>

              <div className="bg-sky-50 dark:bg-zinc-800/80 p-3 rounded-2xl space-y-1.5 text-slate-700 dark:text-zinc-300 font-semibold border border-sky-100 dark:border-zinc-700">
                <p>Course: <strong>{selectedClassModal.courseName}</strong></p>
                <p>Instructor: <strong>{selectedClassModal.instructorName}</strong></p>
                <p>Scheduled: <strong>{new Date(selectedClassModal.startTime).toLocaleString()}</strong></p>
                <p>Provider: <strong className="uppercase font-mono">{selectedClassModal.meetingProvider}</strong></p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button onClick={() => setSelectedClassModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-xs cursor-pointer">
                Close
              </button>
              <button
                onClick={() => navigate(`/live-classroom/room/${selectedClassModal.id}`)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Enter Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
