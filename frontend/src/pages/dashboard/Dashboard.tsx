import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Activity,
  Bot,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { CoursePlayerModal } from '../../components/courses/CoursePlayerModal';
import { AssignmentPortal } from '@/components/courses/AssignmentPortal';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { CertificateService } from '@/services/achievementService';
import type { Certificate } from '@/services/achievementService';
import { CertificatePreviewModal } from '../../components/courses/CertificatePreviewModal';
import { AchievementsDashboard } from '../../components/courses/AchievementsDashboard';
import { courseService } from '@/services/courseService';
import type { XPClaimRecord } from '@/services/courseService';
import type { ICourse } from '../../../../shared/types/course';
import { courseTimeService } from '@/services/courseTimeService';
import { useCourseTimeTracker } from '@/hooks/useCourseTimeTracker';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Dynamic Courses State
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // XP & Claims State
  const [totalXP, setTotalXP] = useState(0);
  const [xpClaims, setXpClaims] = useState<XPClaimRecord[]>([]);

  // Completed courses check (only 100% completed courses unlock certificates)
  const completedCourses = enrolledCourses.filter((course) => {
    const checkpoint = courseService.getCourseCheckpoint(course.id, 'default_student');
    return checkpoint && checkpoint.progressPercent >= 100;
  });
  const completedCoursesCount = completedCourses.length;

  // Certificate Modal State
  const [activePreviewCert, setActivePreviewCert] = useState<Certificate | null>(null);

  // Fetch courses and XP claims dynamically from courseService
  const activeUserId = user?.uid || 'default_student';

  // Real-time Course & Platform Active Time Tracker
  useCourseTimeTracker();
  const [realtimeSec, setRealtimeSec] = useState<number>(() => courseTimeService.getTotalActiveSeconds(activeUserId));

  useEffect(() => {
    const handleTimeUpdate = () => {
      setRealtimeSec(courseTimeService.getTotalActiveSeconds(activeUserId));
    };
    window.addEventListener('shaivika_time_updated', handleTimeUpdate);
    return () => window.removeEventListener('shaivika_time_updated', handleTimeUpdate);
  }, [activeUserId]);

  const loadDashboardData = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const enrolled = await courseService.getEnrolledCourses(activeUserId);
      setEnrolledCourses(enrolled);

      // Load XP Points & Claims
      const xp = courseService.getUserXPPoints(activeUserId);
      const claims = courseService.getXPClaimLogs(activeUserId);
      setTotalXP(xp);
      setXpClaims(claims);
    } catch (err) {
      console.warn('Error loading dynamic dashboard courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Active learning player state
  const [activePlayerCourse, setActivePlayerCourse] = useState<any | null>(null);
  const [playerInitialSubtopicId, setPlayerInitialSubtopicId] = useState<string | undefined>(undefined);
  const [playerInitialNotesOpen, setPlayerInitialNotesOpen] = useState<boolean>(false);
  const [playerInitialTab, setPlayerInitialTab] = useState<'notes' | 'bookmarks' | undefined>(undefined);

  const [selectedAssignmentForPortal, setSelectedAssignmentForPortal] = useState<{
    id: string;
    title: string;
    courseId: string;
    dueDate?: string;
  } | null>(null);

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const [aiLessonContext, setAiLessonContext] = useState<{
    courseId: string;
    courseTitle: string;
    moduleId?: string;
    moduleTitle?: string;
    id: string;
    title: string;
    type: string;
    content: string;
  } | null>(null);

  const defaultAiContext = React.useMemo(() => {
    if (courses && courses.length > 0) {
      const activeCourse = courses[0];
      const firstModule = activeCourse.modules?.[0];
      // Check topics or lessons depending on syllabus schema
      const firstTopic = firstModule?.topics?.[0] || (firstModule as any)?.lessons?.[0];
      return {
        courseId: String(activeCourse.id),
        courseTitle: activeCourse.title,
        moduleId: firstModule ? '1' : undefined,
        moduleTitle: firstModule?.title,
        id: firstTopic ? String(firstTopic.id) : 'dashboard_overview',
        title: firstTopic?.title || 'Course Hub Welcome Overview',
        type: 'reading',
        content: 'Overview of courses and dashboard metrics.'
      };
    }
    return {
      courseId: 'dashboard',
      courseTitle: 'Dashboard Overview',
      id: 'dashboard_overview',
      title: 'Course Hub Welcome Overview',
      type: 'reading',
      content: 'Overview of courses and dashboard metrics.'
    };
  }, [courses]);

  // Interactive Activity Chart State
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d'>('7d');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(3);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id));
    }
  }, [courses, activePlayerCourse, userProfile, user]);

  // Helper to parse duration string (e.g. "15 mins", "2 hours") to decimal hours
  const parseDurationToHours = (durationStr: string): number => {
    if (!durationStr) return 0;
    const clean = durationStr.toLowerCase().trim();
    const numMatch = clean.match(/([\d.]+)/);
    if (!numMatch) return 0;
    
    const val = parseFloat(numMatch[1]);
    if (clean.includes('min')) {
      return val / 60;
    }
    return val;
  };

  // ================= CALCULATE LIVE USER LEARNING PROGRESS =================
  const coursesProgress = courses.map((course) => {
    let totalUnits = 0;
    let completedUnits = 0;
    let totalDurationHours = 0;
    let completedDurationHours = 0;
    let totalVideos = 0;
    let completedVideos = 0;
    let totalReadings = 0;
    let completedReadings = 0;
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let totalAssignments = 0;
    let completedAssignments = 0;

    // Load completed units for this course from localStorage
    let completedIds: Record<string, boolean> = {};
    try {
      const stored = localStorage.getItem(`lms_completed_units_${course.id}`);
      if (stored) completedIds = JSON.parse(stored);
    } catch {}

    if (course.modules) {
      course.modules.forEach((m) => {
        m.topics.forEach((t) => {
          t.learningUnits.forEach((u) => {
            totalUnits++;
            const hours = parseDurationToHours(u.duration);
            totalDurationHours += hours;

            if (u.type === 'Video') totalVideos++;
            else if (u.type === 'Reading') totalReadings++;
            else if (u.type === 'Quiz') totalQuizzes++;
            else if (u.type === 'Assignment') totalAssignments++;

            if (completedIds[u.id]) {
              completedUnits++;
              completedDurationHours += hours;
              if (u.type === 'Video') completedVideos++;
              else if (u.type === 'Reading') completedReadings++;
              else if (u.type === 'Quiz') completedQuizzes++;
              else if (u.type === 'Assignment') completedAssignments++;
            }
          });
        });
      });
    }

    const percentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
    
    return {
      course,
      totalUnits,
      completedUnits,
      totalDurationHours,
      completedDurationHours,
      totalVideos,
      completedVideos,
      totalReadings,
      completedReadings,
      totalQuizzes,
      completedQuizzes,
      totalAssignments,
      completedAssignments,
      percentage
    };
  });

  // Analytics Metrics
  const liveHoursCompleted = coursesProgress.reduce((acc, c) => acc + c.completedDurationHours, 0);
  const totalActiveLearningHours = Number(Math.max(realtimeSec / 3600, liveHoursCompleted).toFixed(1));

  // Dynamic study time calculation per day from real student course active tracking
  const weeklyChartData = React.useMemo(() => {
    if (chartTimeframe === '7d') {
      const breakdown = courseTimeService.getWeeklyHoursBreakdown(activeUserId);
      const maxVal = Math.max(...breakdown.map((d) => d.hours), 0.1);
      return breakdown.map((d) => ({
        day: d.day,
        hours: d.hours,
        heightPercent: d.hours > 0 ? Math.max(15, Math.round((d.hours / maxVal) * 100)) : 5,
      }));
    }

    // 30-Day view breakdown dynamically calculated from course units & active learning
    const totalHours = totalActiveLearningHours;
    const weeks = [
      { day: 'Week 1', hours: Number((totalHours * 0.2).toFixed(1)) },
      { day: 'Week 2', hours: Number((totalHours * 0.25).toFixed(1)) },
      { day: 'Week 3', hours: Number((totalHours * 0.3).toFixed(1)) },
      { day: 'Week 4', hours: Number((totalHours * 0.35).toFixed(1)) },
    ];
    const maxWeekVal = Math.max(...weeks.map((w) => w.hours), 0.1);
    return weeks.map((w) => ({
      ...w,
      heightPercent: w.hours > 0 ? Math.max(20, Math.round((w.hours / maxWeekVal) * 100)) : 5,
    }));
  }, [chartTimeframe, realtimeSec, totalActiveLearningHours, activeUserId]);
  


  // Unlocked Certificates (dynamically check eligibility and generate verified credentials)
  const certificateService = React.useMemo(() => new CertificateService(), []);
  const studentName = userProfile?.name || user?.displayName || 'Scholar student';
  const earnedCerts = React.useMemo(() => {
    return certificateService.checkEligibilityAndGenerate(
      coursesProgress,
      studentName,
      userProfile?.uid || user?.uid || 'default_student'
    );
  }, [coursesProgress, studentName, userProfile, user]);

  // Active courses (progress > 0 and < 100)
  let activeLearningCourses = coursesProgress.filter((c) => c.percentage > 0 && c.percentage < 100);
  if (activeLearningCourses.length === 0 && coursesProgress.length > 0) {
    // suggest first 2 courses as suggestions
    activeLearningCourses = coursesProgress.slice(0, 2);
  }

  // Collect all assignments
  const upcomingAssignments: {
    unit: any;
    courseTitle: string;
    courseId: string | number;
  }[] = [];
  courses.forEach((c) => {
    c.modules?.forEach((m) => {
      m.topics.forEach((t) => {
        t.learningUnits.forEach((u) => {
          if (u.type === 'Assignment') {
            // Load if not completed
            let completedIds: Record<string, boolean> = {};
            try {
              const stored = localStorage.getItem(`lms_completed_units_${c.id}`);
              if (stored) completedIds = JSON.parse(stored);
            } catch {}
            if (!completedIds[u.id]) {
              upcomingAssignments.push({
                unit: u,
                courseTitle: c.title,
                courseId: c.id
              });
            }
          }
        });
      });
    });
  });

  // Collect Quiz Grades
  const gradedQuizzes: {
    unit: any;
    courseTitle: string;
    scoreData: { score: number; total: number; percentage: number; date: string };
  }[] = [];
  courses.forEach((c) => {
    c.modules?.forEach((m) => {
      m.topics.forEach((t) => {
        t.learningUnits.forEach((u) => {
          if (u.type === 'Quiz') {
            try {
              const stored = localStorage.getItem(`lms_quiz_score_${u.id}`);
              if (stored) {
                gradedQuizzes.push({
                  unit: u,
                  courseTitle: c.title,
                  scoreData: JSON.parse(stored)
                });
              }
            } catch {}
          }
        });
      });
    });
  });



  const tabLabelMap: Record<string, string> = {
    overview: 'Overview Dashboard',
    assignments: 'Quiz Results & Gradebook',
    certificates: 'Certificates',
    achievements: 'Achievements & Badges',
    'ai-tutor': 'AI Tutor',
  };

  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pt-2 sm:pt-4 pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner & Dedicated Page Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'overview' })}
              className="hover:text-blue-600 font-semibold cursor-pointer text-slate-600 transition-colors flex items-center gap-1"
            >
              <span>Main Dashboard</span>
            </button>
            {currentTab !== 'overview' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize font-bold text-blue-600">
                  {tabLabelMap[currentTab] || currentTab}
                </span>
              </>
            )}
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-3">
            {currentTab === 'overview' ? (
              <span>Welcome back, {userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'} 👋</span>
            ) : (
              <span>{tabLabelMap[currentTab] || 'Dashboard View'}</span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {currentTab === 'overview'
              ? 'Track learning time, complete pending assessments, and print verified digital credentials.'
              : `Viewing dedicated page for ${tabLabelMap[currentTab] || currentTab}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentTab !== 'overview' && (
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'overview' })}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>



      {/* ------------------- 1. OVERVIEW TAB ------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl border border-sky-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <span>Recent Enrolled</span>
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{enrolledCourses.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
            </div>

            {/* Total Claimed XP Points Card */}
            <div className="glass-card-light p-5 border-l-4 border-l-amber-500 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Total Claimed XP</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{totalXP} XP</span>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  Level {Math.floor(totalXP / 100) + 1} Specialist
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-purple-600 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Certificates</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  {completedCoursesCount} Earned
                </span>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                  {completedCoursesCount > 0 ? 'Verified' : 'Locked'}
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-emerald-500 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Learning Time</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
                  {courseTimeService.formatSecondsToReadable(realtimeSec || Math.round(liveHoursCompleted * 3600))}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC: Currently Enrolled Tracks (Only displayed when student is enrolled in courses) */}
          {loadingCourses ? (
            <div className="space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
                <div className="h-44 bg-slate-100 rounded-2xl border border-slate-200" />
              </div>
            </div>
          ) : (
            enrolledCourses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> Continue Learning (Resume Exact Position)
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {enrolledCourses.length} Active Track{enrolledCourses.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((course) => {
                    const checkpoint = courseService.getCourseCheckpoint(course.id, activeUserId);
                    
                    // Calculate dynamic percentage from completed lesson IDs cache if present
                    let dynamicProgress = 0;
                    try {
                      const savedCompletedStr = localStorage.getItem(`shaivika_completed_${course.id}`);
                      if (savedCompletedStr) {
                        const completedIds: any[] = JSON.parse(savedCompletedStr);
                        const isGit = String(course.id).includes('git') || String(course.slug).includes('git');
                        const totalLessons = isGit ? 31 : 20;
                        if (completedIds && completedIds.length > 0) {
                          dynamicProgress = Math.min(100, Math.round((completedIds.length / totalLessons) * 100));
                        }
                      }
                    } catch (e) {}

                    if (dynamicProgress === 0) {
                      dynamicProgress = checkpoint?.progressPercent || course.progress || 0;
                    }

                    const lastModule = checkpoint ? checkpoint.lastModuleIdx + 1 : 1;
                    const lastSubtopicTitle = checkpoint?.lastSubtopicTitle || 'Kernel Architecture & Environment Setup';

                    return (
                      <div
                        key={course.id}
                        className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                              {course.category}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              Saved Checkpoint Active
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white leading-snug">
                            {course.title}
                          </h4>
                          
                          {/* Saved Resume Position Indicator */}
                          <div className="bg-sky-50 dark:bg-zinc-800/80 border border-sky-200/80 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-zinc-100">Last Position: </span>
                              <span className="text-purple-700 dark:text-purple-300 font-medium">Module {lastModule} ➔ {lastSubtopicTitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            <span>Overall Track Completion</span>
                            <span className="text-purple-600 dark:text-purple-400">{dynamicProgress}% Completed</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
                            <div
                              className="h-full bg-linear-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                              style={{ width: `${dynamicProgress}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          to={`/course/${course.slug || course.id}`}
                          className="btn-blue-primary text-xs py-2.5 justify-center font-bold flex items-center gap-2"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>Resume Course Track (Module {lastModule})</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* DYNAMIC INTERACTIVE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weekly Learning Activity SVG Chart */}
            <div className="lg:col-span-12 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4 shadow-3xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                    <span>Study Hours & AI Engagement</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Hover over any bar to inspect daily study hours & AI mentor prompt count</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChartTimeframe('7d')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      chartTimeframe === '7d'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartTimeframe('30d')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      chartTimeframe === '30d'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Chart Render */}
              <div className="bg-slate-50/50 dark:bg-zinc-950/80 p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800 space-y-6">
                
                {/* Active Tooltip Details */}
                {hoveredDayIndex !== null && weeklyChartData[hoveredDayIndex] && (
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl flex items-center justify-between shadow-md animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                      <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">
                        {weeklyChartData[hoveredDayIndex].day} Activity Metrics:
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        ⏱️ <strong className="text-purple-600 dark:text-purple-400">{weeklyChartData[hoveredDayIndex].hours} hrs</strong> total study time
                      </span>
                    </div>
                  </div>
                )}

                {/* Bars Grid */}
                <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                  {weeklyChartData.map((item, idx) => {
                    const isHovered = hoveredDayIndex === idx;
                    return (
                      <div
                        key={item.day}
                        onMouseEnter={() => setHoveredDayIndex(idx)}
                        className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                      >
                        <span className={`text-[10px] font-extrabold transition-colors ${
                          isHovered ? 'text-purple-600 dark:text-purple-400 scale-110' : 'text-slate-400 dark:text-zinc-500'
                        }`}>
                          {item.hours}h
                        </span>

                        <div className="w-full max-w-[48px] bg-slate-200/80 dark:bg-zinc-800/80 rounded-2xl h-full flex items-end p-1 transition-all overflow-hidden relative">
                          <div
                            className={`w-full rounded-xl transition-all duration-500 relative ${
                              isHovered
                                ? 'bg-linear-to-t from-purple-600 via-indigo-600 to-sky-500 shadow-lg shadow-purple-500/30'
                                : 'bg-linear-to-t from-purple-600/80 to-indigo-500/70 group-hover:from-purple-600 group-hover:to-indigo-500'
                            }`}
                            style={{ height: `${item.heightPercent}%` }}
                          >
                            {isHovered && (
                              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            )}
                          </div>
                        </div>

                        <span className={`text-xs font-bold transition-colors ${
                          isHovered ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-zinc-400'
                        }`}>
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC: Claimed Experience (XP) breakdown & logs */}
          <div className="bg-white/95 dark:bg-zinc-900/95 border border-amber-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 fill-current animate-pulse" /> Claimed Experience (XP) breakdown & logs
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Verify your live activity logs and claim history.</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase">Current Level</span>
                <span className="block font-heading font-extrabold text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl mt-0.5">
                  Level {Math.floor(totalXP / 100) + 1}
                </span>
              </div>
            </div>

            {xpClaims.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No XP points claimed yet. Start reading lessons or passing quizzes to earn points!</p>
            ) : (
              <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                {xpClaims.map((claim) => (
                  <div key={claim.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md font-mono">
                          {claim.category}
                        </span>
                        {claim.courseTitle && (
                          <span className="text-[10px] font-semibold text-sky-700 max-w-30 truncate" title={claim.courseTitle}>
                            {claim.courseTitle}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">
                        {claim.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-mono">
                        +{claim.xp} XP
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(claim.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* ------------------- 2. QUIZZES & GRADEBOOK TAB ------------------- */}
      {currentTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Graded Quizzes Log */}
          <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Interactive Quiz Scores Gradebook</span>
            </h3>

            {gradedQuizzes.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400 italic">No quiz grades recorded yet</h4>
                <p className="text-[10px] text-slate-500 leading-normal font-medium max-w-xs mx-auto">
                  Take a simulation quiz in student preview mode inside any course syllabus to record scores here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4">Quiz Name</th>
                      <th className="py-3.5 px-4">Course Track</th>
                      <th className="py-3.5 px-4">Attempt Date</th>
                      <th className="py-3.5 px-4">Scored Marks</th>
                      <th className="py-3.5 px-4">Grade Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradedQuizzes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.unit.title}</td>
                        <td className="py-3.5 px-4 text-slate-500">{item.courseTitle}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{item.scoreData.date}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{item.scoreData.score} / {item.scoreData.total}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            item.scoreData.percentage >= 70
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.scoreData.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------- 4. CERTIFICATES TAB ------------------- */}
      {currentTab === 'certificates' && (() => {
        // Find In-Progress courses (progress between 1% and 99%)
        const inProgressCerts = coursesProgress.filter(c => c.percentage > 0 && c.percentage < 100);

        return (
          <div className="space-y-8 animate-in fade-in duration-200 text-slate-800">
            
            {/* Header Description */}
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center gap-3 select-none">
                <Award className="w-10 h-10 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white">Certificate Center</h3>
                  <p className="text-xs text-slate-455">ISO/IEC 27001 Authenticated Digital Course Credentials</p>
                </div>
              </div>
            </div>
            {/* Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Earned Certificates Left list */}
              <div className="lg:col-span-8 space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span>Earned Digital Certificates ({earnedCerts.length})</span>
                </h4>

                {earnedCerts.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-150 rounded-2xl text-slate-400 space-y-2 py-12 bg-white shadow-3xs max-w-lg">
                    <Award className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold">No Earned Certificates Yet</p>
                    <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                      Complete 100% of any course syllabus, including mandatory quizzes and assignments, to unlock credentials.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {earnedCerts.map((cert) => (
                      <div key={cert.id} className="p-5 bg-white border border-sky-100 rounded-2xl shadow-3xs flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-fit">
                            Verified Graduate Pass
                          </span>
                          <h5 className="font-heading font-bold text-sm text-slate-900 truncate" title={cert.courseTitle}>
                            {cert.courseTitle}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-medium">Instructor: {cert.instructorName}</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Issued: {cert.completionDate}</span>
                        </div>

                        <button
                          onClick={() => setActivePreviewCert(cert)}
                          className="w-full bg-slate-900 hover:bg-slate-850 text-white font-heading font-extrabold text-[11px] py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-cyan-400" />
                          <span>View Verified Credential</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In Progress / Expired sidebar Right */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* In Progress */}
                <div className="space-y-3.5">
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    In Progress Certifications
                  </h4>
                  
                  {inProgressCerts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No course tracks currently in progress.</p>
                  ) : (
                    <div className="space-y-3">
                      {inProgressCerts.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-3xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span className="truncate max-w-40 text-slate-700">{item.course.title}</span>
                            <span className="font-mono text-blue-600 font-extrabold shrink-0">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expired Placeholder */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                    Renewal & Expiration Ranks
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-250 rounded-2xl flex items-start gap-2.5 text-[10px] leading-relaxed text-slate-500 font-semibold select-none">
                    <Award className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <div>
                      <span>No Expired Certifications</span>
                      <p className="mt-0.5 text-[9px] text-slate-400">All Kaizen Q credentials remain indefinitely valid. Future enterprise renewal status will display here.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        );
      })()}


      {/* ------------------- 9. ACHIEVEMENTS & BADGES TAB ------------------- */}
      {currentTab === 'achievements' && (
        <AchievementsDashboard />
      )}

      {/* Leaderboard tab removed from student dashboard */}

      {/* ----------------- CERTIFICATE PREVIEW MODAL ----------------- */}
      {activePreviewCert && (
        <CertificatePreviewModal
          certificate={activePreviewCert}
          onClose={() => setActivePreviewCert(null)}
        />
      )}

      {activePlayerCourse && (
        <CoursePlayerModal
          course={activePlayerCourse}
          initialSubtopicId={playerInitialSubtopicId}
          initialNotesOpen={playerInitialNotesOpen}
          initialTab={playerInitialTab}
          onClose={() => {
            setActivePlayerCourse(null);
            setPlayerInitialSubtopicId(undefined);
            setPlayerInitialNotesOpen(false);
            setPlayerInitialTab(undefined);
          }}
        />
      )}

      {selectedAssignmentForPortal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto">
              <AssignmentPortal
                assignmentId={selectedAssignmentForPortal.id}
                assignmentTitle={selectedAssignmentForPortal.title}
                courseId={selectedAssignmentForPortal.courseId}
                dueDate={selectedAssignmentForPortal.dueDate}
                onClose={() => setSelectedAssignmentForPortal(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Tutor floating dock — single button, clean enterprise style */}
      {!isAiPanelOpen && (
        <button
          onClick={() => {
            if (!aiLessonContext) {
              setAiLessonContext(defaultAiContext);
            }
            setIsAiPanelOpen(true);
            toast.success('AI Tutor activated');
          }}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-zinc-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 text-white border border-slate-700 dark:border-zinc-600 hover:border-indigo-500 transition-all duration-200 cursor-pointer shadow-xl hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 select-none"
          title="Open AI Tutor"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-indigo-300 group-hover:text-white transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide">AI Tutor</span>
        </button>
      )}

      {isAiPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-['Sora'] animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl h-[88vh] max-h-190 rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            <AIAssistantPanel
              courseId={aiLessonContext?.courseId || defaultAiContext.courseId}
              courseTitle={aiLessonContext?.courseTitle || defaultAiContext.courseTitle}
              moduleId={aiLessonContext?.moduleId || defaultAiContext.moduleId}
              moduleTitle={aiLessonContext?.moduleTitle || defaultAiContext.moduleTitle}
              topicId={aiLessonContext?.id || defaultAiContext.id}
              topicTitle={aiLessonContext?.title || defaultAiContext.title}
              lessonId={aiLessonContext?.id || defaultAiContext.id}
              lessonTitle={aiLessonContext?.title || defaultAiContext.title}
              lessonType={aiLessonContext?.type || defaultAiContext.type}
              lessonContent={aiLessonContext?.content || defaultAiContext.content}
              isOpen={isAiPanelOpen}
              onClose={() => setIsAiPanelOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}



    </div>
  );
};
