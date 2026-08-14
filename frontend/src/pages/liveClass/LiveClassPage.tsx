import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Radio,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { YouTubePlayer } from '@/components/liveClass/YouTubePlayer';
import { LiveClassHeader } from '@/components/liveClass/LiveClassHeader';
import { LiveClassInfo } from '@/components/liveClass/LiveClassInfo';
import { LiveClassSidebar } from '@/components/liveClass/LiveClassSidebar';

export const LiveClassPage: React.FC = () => {
  const { liveClassId } = useParams<{ liveClassId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const classId = liveClassId || 'class_react_101_live';

  // Real-time socket connection
  const { connectionStatus, onlineCount, classStatus, announcements: socketAnnouncements } = useLiveClassSocket(
    classId,
    liveClass?.status
  );

  const loadLiveClass = async () => {
    if (!classId) {
      setErrorStatus(404);
      setErrorMessage('Live class is not available.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');

    try {
      let token: string | undefined;
      if (user && typeof user.getIdToken === 'function') {
        token = await user.getIdToken().catch(() => undefined);
      }

      const res = await liveClassService.fetchLiveClassById(classId, token, {
        uid: userProfile?.uid || user?.uid,
        role: userProfile?.role || 'student',
        email: userProfile?.email || user?.email || undefined,
      });

      if (!res.success) {
        setErrorStatus(res.status || 404);
        setErrorMessage(res.error || 'Live class is not available.');
        setLiveClass(null);
      } else if (res.liveClass) {
        setLiveClass(res.liveClass);
        setErrorStatus(null);
        setErrorMessage('');
      } else {
        setErrorStatus(404);
        setErrorMessage('Live class is not available.');
        setLiveClass(null);
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('[LiveClassPage] Fetch error:', err);
      }
      setErrorStatus(500);
      setErrorMessage('Live class is not available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveClass();
  }, [classId, user]);

  // Real-Time Synchronized Status
  const normalizedStatus = (classStatus || liveClass?.status || '').toUpperCase();
  const isLive = normalizedStatus === 'LIVE';
  const isScheduled = normalizedStatus === 'SCHEDULED' || normalizedStatus === 'DRAFT';
  const isEnded = normalizedStatus === 'ENDED' || normalizedStatus === 'COMPLETED';
  const isCancelled = normalizedStatus === 'CANCELLED';

  // Format Scheduled Date for Countdown / Not Started State
  const scheduledTimeText = React.useMemo(() => {
    if (!liveClass?.scheduledAt && !liveClass?.startTime) return 'Today';
    try {
      const d = new Date(liveClass.scheduledAt || liveClass.startTime);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Upcoming Session';
    }
  }, [liveClass]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Skeleton Header */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 animate-pulse">
          <div className="w-48 h-5 bg-slate-800 rounded-md" />
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading live class...</h2>
          <p className="text-slate-400 text-sm">Synchronizing classroom session and security credentials...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (403: Student Not Enrolled)
  if (errorStatus === 403) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6">
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>
        </header>

        <main className="max-w-lg mx-auto w-full px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-xl">
            <Lock className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Access Restricted
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Please enroll in this course to access the live class.
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This live lecture stream is exclusively reserved for students enrolled in the corresponding course program.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard/courses')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Course & Enroll</span>
            </button>

            <button
              onClick={loadLiveClass}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-900">
          Shaivika LMS AI Foundation &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // 3. Not Available State (404 / Missing Session)
  if (errorStatus === 404 || !liveClass) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </header>

        <main className="max-w-md mx-auto w-full px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-400 shadow-xl">
            <AlertCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Live class is not available.</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {errorMessage || `The requested live classroom session ID "${classId}" could not be found or has been removed.`}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
            >
              Return to Student Dashboard
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-900">
          Shaivika LMS AI Foundation
        </footer>
      </div>
    );
  }

  // Active / Ready Classroom Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* 1. LiveClassHeader */}
      <LiveClassHeader
        courseTitle={liveClass.courseName}
        courseId={liveClass.courseId}
        classTitle={liveClass.title}
        instructorName={liveClass.instructor?.name || liveClass.instructorName}
        instructorAvatar={liveClass.instructor?.avatar || liveClass.instructorAvatar}
        status={normalizedStatus}
        scheduledAt={liveClass.scheduledAt}
        startTime={liveClass.startTime}
        connectionStatus={connectionStatus}
        onlineCount={onlineCount}
      />

      {/* Main Classroom View Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6">
        {/* Live Announcement Banner */}
        {socketAnnouncements.length > 0 && (
          <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-500/40 rounded-2xl p-3.5 px-5 shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block">
                Live Announcement from {socketAnnouncements[0]?.senderName || 'Instructor'}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white truncate">
                {socketAnnouncements[0]?.message}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Media & Info Stage */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {/* 4. Not Started State Banner & Placeholder */}
            {isScheduled && (
              <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Session Scheduled
                </span>

                <h3 className="text-2xl font-bold text-white mb-2">Live class hasn't started yet.</h3>
                <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                  Broadcast will go live at <strong className="text-white">{scheduledTimeText}</strong>. Please check back when the instructor initiates the stream.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Auto-sync active — Stream will play immediately when live
                </div>
              </div>
            )}

            {/* Cancelled State Banner */}
            {isCancelled && (
              <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 shadow-inner">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Session Cancelled
                </span>

                <h3 className="text-2xl font-bold text-white mb-2">This live class has been cancelled.</h3>
                <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                  The instructor has cancelled this session. Please check your schedule for upcoming sessions or syllabus recordings.
                </p>
              </div>
            )}

            {/* 5. Ended State Banner & Placeholder */}
            {isEnded && (
              <div className="relative w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden backdrop-blur-md">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-400 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Session Concluded
                </span>

                <h3 className="text-2xl font-bold text-white mb-2">Live class has ended.</h3>
                <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                  Thank you for participating! Review your lesson notes, assignments, or watch the recorded session inside the syllabus.
                </p>

                {liveClass.courseId && (
                  <Link
                    to={`/dashboard/course/${liveClass.courseId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Continue Course Syllabus</span>
                  </Link>
                )}
              </div>
            )}

            {/* 6. Live State: Official YouTube Player Embed */}
            {isLive && (
              <YouTubePlayer
                youtubeVideoId={liveClass.youtubeVideoId}
                title={liveClass.title}
                isLive={true}
                status={liveClass.status}
              />
            )}

            {/* 2. LiveClassInfo Component */}
            <LiveClassInfo liveClass={liveClass} />
          </div>

          {/* 3. LiveClassSidebar Component */}
          <LiveClassSidebar
            classId={classId}
            instructorName={liveClass.instructor?.name || liveClass.instructorName}
            isLive={isLive}
          />
        </div>
      </main>
    </div>
  );
};

export default LiveClassPage;
