import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Award,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  PlayCircle,
  Clock,
  Sparkles,
  Code,
  GraduationCap,
  Radio,
  Video,
  Tag,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { liveClassService, type LiveClass, normalizeLiveClassStatus } from '@/services/liveClassService';

export interface CourseDetailsProps {
  course: {
    id: string | number;
    title: string;
    subtitle?: string;
    instructor: string;
    role?: string;
    avatar?: string;
    rating: number;
    reviews?: number;
    students: string;
    duration: string;
    category: string;
    level?: string;
    thumbnail: string;
    introText: string[];
    outcomes: string[];
    price?: number;
    modules: Array<{
      id: string | number;
      title: string;
      duration?: string;
      lessons: Array<{
        id: string | number;
        title: string;
        duration?: string;
        type?: string;
        content?: string;
        description?: string;
      }>;
    }>;
  };
  isLoadingModules?: boolean;
  onStartLearning: () => void;
  isEnrolled?: boolean;
  onEnroll?: () => void;
}

export const CourseDetailsPage: React.FC<CourseDetailsProps> = ({
  course,
  isLoadingModules: _isLoadingModules = false,
  onStartLearning,
  isEnrolled = false,
  onEnroll,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'outcomes' | 'faq'>('overview');
  const [openModuleId, setOpenModuleId] = useState<string | number | null>(course.modules[0]?.id || null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  React.useEffect(() => {
    if (!openModuleId && course.modules && course.modules.length > 0) {
      setOpenModuleId(course.modules[0].id);
    }
  }, [course.modules, openModuleId]);

  const toggleModule = (id: string | number) => {
    setOpenModuleId(openModuleId === id ? null : id);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const instructorName = typeof course.instructor === 'object' && course.instructor !== null
    ? ((course.instructor as any).name || 'KaizenQ Team')
    : String(course.instructor || 'KaizenQ Team');

  const instructorRole = course.role || (typeof course.instructor === 'object' && (course.instructor as any)?.role) || 'Curriculum Instructor';

  const instructorAvatar = course.avatar || (typeof course.instructor === 'object' && (course.instructor as any)?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const introParagraphs = useMemo(() => {
    if (Array.isArray(course.introText)) {
      return course.introText.map((t) => typeof t === 'string' ? t : String(t));
    }
    if (typeof course.introText === 'string') {
      return [course.introText];
    }
    return [(course as any)?.description || (course as any)?.subtitle || 'Welcome to this course.'];
  }, [course.introText, course]);

  const learningOutcomes = useMemo(() => {
    if (Array.isArray(course.outcomes)) {
      return course.outcomes.map((o) => typeof o === 'string' ? o : String(o));
    }
    return [];
  }, [course.outcomes]);

  // Flatten lessons and calculate progress
  const allLessons = useMemo(() => {
    return (course.modules || []).flatMap((m) => m.lessons || []);
  }, [course.modules]);

  const [courseLiveClasses, setCourseLiveClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    const unsub = liveClassService.subscribeLiveClasses((all) => {
      const matched = all.filter((c) => {
        const cId = String(course.id).toLowerCase();
        const cTitle = course.title.toLowerCase();
        const targetCId = String(c.courseId || '').toLowerCase();
        const targetCName = (c.courseName || '').toLowerCase();
        return (
          (targetCId && (targetCId === cId || targetCId.includes(cId) || cId.includes(targetCId))) ||
          (targetCName && (targetCName === cTitle || targetCName.includes(cTitle) || cTitle.includes(targetCName)))
        );
      });
      setCourseLiveClasses(matched);
    });
    return () => unsub();
  }, [course.id, course.title]);

  const totalLessonsCount = allLessons.length;

  const completedLessonIds = useMemo((): string[] => {
    try {
      const saved = localStorage.getItem(`shaivika_completed_${course.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, [course.id]);

  const completedCount = completedLessonIds.filter((id) =>
    allLessons.some((l) => String(l.id) === String(id))
  ).length;

  const progressPercent = totalLessonsCount > 0
    ? Math.min(100, Math.round((completedCount / totalLessonsCount) * 100))
    : 0;

  const coursePrice = typeof (course as any)?.price === 'number' ? (course as any).price : 0;
  const isPaid = coursePrice > 0;

  const skills = [
    'Structured Program Architecture',
    'Memory Management & Pointers',
    'Algorithm Design & Logic Flow',
    'Modular Functions & Libraries',
    'Data Structures & Buffers',
    'Command Line & System Tools',
  ];

  const prerequisites = [
    'Basic computer literacy and text editor familiarity',
    'No prior C programming background required',
    'Any modern browser (Chrome, Firefox, Safari, Edge)',
  ];

  const milestones = [
    { label: 'Programming Fundamentals', done: completedCount >= 1 },
    { label: 'Control Flow & Logic Decisions', done: progressPercent >= 35 },
    { label: 'Advanced Functions & Memory', done: progressPercent >= 70 },
    { label: 'Course Completion & Verified Certificate', done: progressPercent === 100 },
  ];

  const faqs = [
    {
      q: 'Will I receive a verified certificate upon completion?',
      a: 'Yes. After completing all lessons and required assessments, you will be issued an official, verifiable KaizenQ Certificate of Completion.',
    },
    {
      q: 'Are interactive exercises included in this course?',
      a: 'Yes. Each lesson includes practical examples, syntax walkthroughs, and hands-on exercises to solidify your understanding.',
    },
    {
      q: 'How long do I have access to the curriculum?',
      a: 'You receive full, lifetime access to all course materials, lesson notes, and future updates at your own pace.',
    },
    {
      q: 'Is this course suitable for complete beginners?',
      a: 'Yes. The syllabus begins with foundational concepts and progressively builds towards advanced programming techniques.',
    },
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      comment: 'The structured notes, clear code snippets, and distraction-free interface made learning seamless and engaging.',
    },
    {
      name: 'Alex Chen',
      role: 'Systems Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      comment: 'Cleanest LMS platform I have used. Focused directly on high-yield programming concepts without unnecessary noise.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-[#111827] dark:text-[#F8FAFC] font-sans antialiased transition-colors duration-200 pb-20">
      
      {/* ── Breadcrumb & Back Row ─────────────────────────────────────── */}
      <div className="border-b border-[#E5E7EB] dark:border-[#25324A] bg-[#F8FAFC] dark:bg-[#111827]/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-[#2563EB] dark:hover:text-[#3B82F6] flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Courses</span>
            </button>
            <span>/</span>
            <span className="text-[#111827] dark:text-[#F8FAFC] font-semibold truncate max-w-[200px] sm:max-w-none">
              {course.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isEnrolled && (
              <span className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/50">
                Enrolled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-b from-[#F8FAFC] to-white dark:from-[#111827] dark:to-[#0B1120] border-b border-[#E5E7EB] dark:border-[#25324A] py-10 sm:py-14">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Header Info */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] border border-blue-200 dark:border-blue-900/50">
                  {course.category}
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium flex items-center gap-1.5">
                  <span>•</span>
                  <span>{course.level || 'Beginner • Self-paced'}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </span>
                {isPaid && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> ₹{coursePrice}
                  </span>
                )}
                {isEnrolled && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111827] dark:text-white leading-[1.15]">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-3xl">
                    {course.subtitle || introParagraphs[0]}
                  </p>
                )}
              </div>

              {/* Progress Indicator if Enrolled */}
              {isEnrolled && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] shadow-xs space-y-2.5 max-w-xl">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#111827] dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#3B82F6]" />
                      Course Track Progress
                    </span>
                    <span className="text-[#2563EB] dark:text-[#3B82F6] font-mono">
                      {progressPercent}% Completed ({completedCount}/{totalLessonsCount} Lessons)
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] dark:bg-[#25324A] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    <span>{completedCount} of {totalLessonsCount} lessons completed</span>
                    <span>{totalLessonsCount - completedCount} remaining</span>
                  </div>
                </div>
              )}

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] dark:border-[#25324A]"
                />
                <div>
                  <h4 className="text-xs font-semibold text-[#111827] dark:text-white">
                    {instructorName}
                  </h4>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    {instructorRole}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Summary Card (Desktop) */}
            <div className="lg:col-span-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] shadow-sm space-y-5">
                <div className="aspect-video rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#25324A]">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  {isPaid && (
                    <div className="flex items-center justify-between py-2 border-b border-[#E5E7EB] dark:border-[#25324A] bg-blue-50/50 dark:bg-blue-950/20 px-3 rounded-xl -mx-1">
                      <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Course Track Fee
                      </span>
                      <span className="font-extrabold text-base text-[#111827] dark:text-white font-mono">
                        ₹{coursePrice}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] dark:border-[#25324A]">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Total Lessons
                    </span>
                    <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">{totalLessonsCount} Lessons</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] dark:border-[#25324A]">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Total Duration
                    </span>
                    <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E5E7EB] dark:border-[#25324A]">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" /> Practical Labs
                    </span>
                    <span className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">Included</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Verified Certificate
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Yes</span>
                  </div>
                </div>

                <div className="pt-2">
                  {isEnrolled ? (
                    <button
                      onClick={onStartLearning}
                      className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.99]"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  ) : isPaid ? (
                    <button
                      onClick={onEnroll || onStartLearning}
                      className="w-full py-3.5 px-4 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 cursor-pointer active:scale-[0.99]"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Enroll Now • ₹{coursePrice}</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  ) : (
                    <button
                      onClick={onEnroll || onStartLearning}
                      className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-[0.99]"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Enroll Free to Access</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ─────────────────────────────────────────────── */}
      <div className="border-b border-[#E5E7EB] dark:border-[#25324A] bg-white dark:bg-[#0B1120] sticky top-12 z-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar text-sm font-medium">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'curriculum', label: `Course Content (${totalLessonsCount})` },
              { id: 'outcomes', label: 'Skills & Outcomes' },
              { id: 'faq', label: 'Reviews & FAQ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] dark:border-[#3B82F6] text-[#2563EB] dark:text-[#3B82F6] font-semibold'
                    : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main Content Body ───────────────────────────────────────────── */}
      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              
              {/* Course-associated Upcoming Live Classes Banner */}
              {courseLiveClasses.length > 0 && (
                <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-300/40 dark:border-blue-700/50">
                        <Radio className="w-4 h-4 animate-pulse text-blue-600 dark:text-blue-400" />
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          Live Interactive Classes
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Scheduled live coding sessions with your mentor
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                      {courseLiveClasses.length} {courseLiveClasses.length === 1 ? 'SESSION' : 'SESSIONS'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {courseLiveClasses.map((cls) => {
                      const normalized = normalizeLiveClassStatus(cls.status);
                      const isLive = normalized === 'live';
                      const isCompleted = normalized === 'completed';
                      const isCancelled = normalized === 'cancelled';

                      let dateFormatted = 'Upcoming';
                      try {
                        const d = new Date(cls.startTime || cls.scheduledAt || '');
                        dateFormatted = d.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                      } catch {
                        dateFormatted = 'Scheduled';
                      }

                      return (
                        <div
                          key={cls.id}
                          className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  isLive
                                    ? 'bg-rose-600 text-white animate-pulse'
                                    : isCompleted
                                    ? 'bg-slate-700 text-slate-200'
                                    : isCancelled
                                    ? 'bg-red-950 text-red-400 border border-red-800'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {isLive ? '🔴 LIVE NOW' : isCompleted ? '✓ COMPLETED' : isCancelled ? 'CANCELLED' : 'UPCOMING'}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{dateFormatted}</span>
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {cls.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Instructor: <strong className="text-slate-700 dark:text-zinc-300">{cls.instructorName}</strong>
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isCancelled ? (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-500/10">
                                Cancelled
                              </span>
                            ) : isCompleted ? (
                              <button
                                onClick={() => navigate(`/student/live-class/${cls.id}`)}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
                              >
                                View Recording
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate(`/student/live-class/${cls.id}`)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isLive
                                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 animate-pulse'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                }`}
                              >
                                <Video className="w-3.5 h-3.5 text-white" />
                                <span>{isLive ? 'Join Live Class' : 'Enter Classroom'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Introduction section */}
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#111827] dark:text-white">
                  About this Course
                </h2>
                <div className="space-y-3 text-[#334155] dark:text-[#CBD5E1] text-[15px] leading-relaxed">
                  {introParagraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </section>

              {/* What you'll learn */}
              <section className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <h3 className="text-base font-bold text-[#111827] dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
                  What you will learn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {learningOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#334155] dark:text-[#CBD5E1]">
                      <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold mt-0.5">•</span>
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Course Curriculum Preview list */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#111827] dark:text-white">
                    Curriculum Summary
                  </h3>
                  <button
                    onClick={() => setActiveTab('curriculum')}
                    className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
                  >
                    View all {totalLessonsCount} lessons →
                  </button>
                </div>

                <div className="border border-[#E5E7EB] dark:border-[#25324A] rounded-2xl divide-y divide-[#E5E7EB] dark:divide-[#25324A] overflow-hidden">
                  {course.modules.slice(0, 4).map((mod, mIdx) => (
                    <div key={mod.id} className="p-4 bg-white dark:bg-[#111827] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-[#F8FAFC] dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#25324A] text-xs font-mono font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center justify-center shrink-0">
                          {String(mIdx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#111827] dark:text-white truncate">
                            {mod.title.replace(/^(🟢|🟡|🔵|🔴)\s*/, '')}
                          </h4>
                          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {mod.lessons.length} lessons {mod.duration ? `• ${mod.duration}` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setOpenModuleId(mod.id);
                          setActiveTab('curriculum');
                        }}
                        className="text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] shrink-0"
                      >
                        Explore
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Right column: Learning Roadmap & Milestones */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Learning Roadmap Milestones */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4">
                <h4 className="text-sm font-bold text-[#111827] dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                  Learning Milestones
                </h4>
                <div className="space-y-3 text-xs">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                        m.done
                          ? 'bg-emerald-500 text-white'
                          : 'border border-[#CBD5E1] dark:border-[#475569] text-transparent'
                      }`}>
                        {m.done ? '✓' : ''}
                      </span>
                      <span className={m.done ? 'text-[#111827] dark:text-white font-medium' : 'text-[#64748B] dark:text-[#94A3B8]'}>
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites Card */}
              <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-3">
                <h4 className="text-sm font-bold text-[#111827] dark:text-white">
                  Prerequisites
                </h4>
                <ul className="space-y-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                  {prerequisites.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CURRICULUM (COURSE CONTENT) */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] dark:text-white">
                  Course Content
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
                  {course.modules.length} Modules • {totalLessonsCount} Total Lessons
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod, modIdx) => {
                const isOpen = openModuleId === mod.id;
                return (
                  <div
                    key={mod.id}
                    className="rounded-2xl border border-[#E5E7EB] dark:border-[#25324A] bg-white dark:bg-[#111827] overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full p-4 flex items-center justify-between text-left bg-[#F8FAFC] dark:bg-[#172033] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] text-xs font-mono font-bold text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
                          {String(modIdx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-white truncate">
                            {mod.title.replace(/^(🟢|🟡|🔵|🔴)\s*/, '')}
                          </h3>
                          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {mod.lessons.length} lessons {mod.duration ? `• ${mod.duration}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="divide-y divide-[#E5E7EB] dark:divide-[#25324A] border-t border-[#E5E7EB] dark:border-[#25324A]"
                        >
                          {mod.lessons.map((lesson, lIdx) => {
                            const isDone = completedLessonIds.some((id) => String(id) === String(lesson.id));
                            return (
                              <div
                                key={lesson.id}
                                className="p-3.5 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#172033]/60 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                    isDone
                                      ? 'bg-emerald-500 text-white font-bold'
                                      : 'border border-[#CBD5E1] dark:border-[#475569] text-[#94A3B8]'
                                  }`}>
                                    {isDone ? '✓' : lIdx + 1}
                                  </span>

                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-medium text-[#111827] dark:text-white truncate">
                                      {lesson.title}
                                    </h4>
                                    {lesson.description && (
                                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-lg">
                                        {lesson.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  {lesson.duration && (
                                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono hidden sm:inline">
                                      {lesson.duration}
                                    </span>
                                  )}
                                  <button
                                    onClick={isEnrolled ? onStartLearning : (onEnroll || onStartLearning)}
                                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                                  >
                                    {isDone ? 'Review' : isEnrolled ? 'Start' : isPaid ? 'Enroll' : 'Start'} →
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS & OUTCOMES */}
        {activeTab === 'outcomes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
                Measurable Learning Outcomes
              </h3>
              <ol className="space-y-3 text-sm text-[#334155] dark:text-[#CBD5E1] leading-relaxed">
                {learningOutcomes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#3B82F6] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900/50">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] space-y-4 shadow-xs">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
                Core Technical Competencies
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {skills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#172033] border border-[#E5E7EB] dark:border-[#25324A] text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS & FAQ */}
        {activeTab === 'faq' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                Student Reviews
              </h3>
              <div className="space-y-3">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#25324A] shadow-xs space-y-2.5">
                    <div className="flex items-center gap-3">
                      <img src={rev.avatar} alt={rev.name} className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB] dark:border-[#25324A]" />
                      <div>
                        <h4 className="text-xs font-bold text-[#111827] dark:text-white">{rev.name}</h4>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{rev.role}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#334155] dark:text-[#CBD5E1] leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2563EB] dark:text-[#3B82F6]" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="rounded-2xl border border-[#E5E7EB] dark:border-[#25324A] bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#111827] dark:text-white cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-[#64748B] dark:text-[#94A3B8] border-t border-[#E5E7EB] dark:border-[#25324A] pt-3 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Sleek Professional AI Assistant Floating Button ─────────────── */}
      <button
        onClick={onStartLearning}
        className="fixed bottom-5 right-5 z-40 px-3.5 py-2.5 rounded-full bg-[#111827] dark:bg-[#172033] hover:bg-[#1F2937] dark:hover:bg-[#1E293B] text-white border border-[#E5E7EB]/20 dark:border-[#25324A] shadow-lg flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 text-xs font-medium"
        title="Open Course Learning Workspace"
      >
        <Sparkles className="w-4 h-4 text-[#3B82F6]" />
        <span className="hidden sm:inline">AI Assistant</span>
      </button>

    </div>
  );
};
