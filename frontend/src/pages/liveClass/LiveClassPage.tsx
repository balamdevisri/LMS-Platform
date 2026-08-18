import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Lock,
  ArrowLeft,
  BookOpen,
  Radio,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { liveClassService, type LiveClass } from '@/services/liveClassService';
import { useLiveClassSocket } from '@/hooks/useLiveClassSocket';
import { CustomLiveVideoPlayer } from '@/components/liveClass/CustomLiveVideoPlayer';
import { extractYouTubeVideoId } from '@/components/liveClass/YouTubePlayer';
import { LiveClassHeader } from '@/components/liveClass/LiveClassHeader';
import { LiveClassInfo } from '@/components/liveClass/LiveClassInfo';
import { LiveClassSidebar } from '@/components/liveClass/LiveClassSidebar';
import { LiveAnnouncementBanner } from '@/components/liveClass/LiveAnnouncementBanner';

export const LiveClassPage: React.FC = () => {
  const { liveClassId } = useParams<{ liveClassId: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const classId = liveClassId || 'class_react_101_live';

  // Real-time socket connection & synchronized stream events
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
    const unsub = liveClassService.subscribeLiveClasses((classes) => {
      const updated = classes.find((c) => c.id === classId || c.classId === classId);
      if (updated) {
        setLiveClass(updated);
      }
    });
    return () => unsub();
  }, [classId, user]);

  // Real-Time Synchronized Status
  const normalizedStatus = (classStatus || liveClass?.status || 'SCHEDULED').toUpperCase();

  // Extract clean YouTube video ID securely
  const resolvedVideoId = React.useMemo(() => {
    if (!liveClass) return '';
    return (
      extractYouTubeVideoId(liveClass.youtubeVideoId) ||
      extractYouTubeVideoId(liveClass.meetingUrl) ||
      extractYouTubeVideoId((liveClass as any).videoUrl) ||
      extractYouTubeVideoId((liveClass as any).streamUrl) ||
      (liveClass.youtubeVideoId ? liveClass.youtubeVideoId.trim() : '')
    );
  }, [liveClass]);

  // Format Scheduled Date
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

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sora']">
        {/* Skeleton Header */}
        <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800" />
            <div className="w-48 h-4 bg-slate-800 rounded-md" />
          </div>
          <div className="w-24 h-6 bg-slate-800 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Radio className="w-6 h-6 text-sky-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Loading live class...</h2>
          <p className="text-slate-400 text-sm">Verifying student authorization and initializing custom player...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthorized State (403: Student Not Enrolled in Associated Course)
  if (errorStatus === 403) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Sora']">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6">
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
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
            🔒 Live Class Locked
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This live class is available only to enrolled students. Please enroll in the course to unlock the broadcast and real-time interactive tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(liveClass?.courseId ? `/dashboard/course/${liveClass.courseId}` : '/dashboard/courses')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Course</span>
            </button>

            <button
              onClick={loadLiveClass}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900">
          KaizenQ LMS Platform &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // 3. Not Available State (404 / Missing Session)
  if (errorStatus === 404 || !liveClass) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Sora']">
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center px-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
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
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-900">
          KaizenQ LMS Platform &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  // 4. Authorized Classroom Environment
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white font-['Sora']">
      {/* 1. Classroom Top Sticky Header */}
      <LiveClassHeader
        courseTitle={liveClass.courseName}
        courseId={liveClass.courseId}
        classTitle={liveClass.title}
        instructorName={liveClass.instructor?.name || liveClass.instructorName}
        status={normalizedStatus}
        scheduledAt={liveClass.scheduledAt}
        startTime={liveClass.startTime}
        connectionStatus={connectionStatus}
        onlineCount={onlineCount}
      />

      {/* Main Classroom Grid Container */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-5">
        {/* Live Announcement Marquee Banner */}
        <LiveAnnouncementBanner announcements={socketAnnouncements} />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Video Stage & Course Information */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {/* 16:9 Custom Video Player Shell */}
            <CustomLiveVideoPlayer
              youtubeVideoId={resolvedVideoId}
              title={liveClass.title}
              status={normalizedStatus}
              instructorName={liveClass.instructor?.name || liveClass.instructorName}
              scheduledTimeText={scheduledTimeText}
            />
            {/* Mobile-Only Tabbed Interactive Sidebar */}
            <div className="block lg:hidden">
              <LiveClassSidebar
                classId={classId}
                instructorName={liveClass.instructor?.name || liveClass.instructorName}
                isLive={normalizedStatus === 'LIVE'}
              />
            </div>

            {/* Live Class Detailed Curriculum Information */}
            <LiveClassInfo liveClass={liveClass} />
          </div>

          {/* Right Column: Desktop Sticky Tabbed Interaction Sidebar */}
          <div className="hidden lg:block w-96 shrink-0 sticky top-20">
            <LiveClassSidebar
              classId={classId}
              instructorName={liveClass.instructor?.name || liveClass.instructorName}
              isLive={normalizedStatus === 'LIVE'}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveClassPage;
