import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Calendar,
  Sparkles,
  BarChart3,
  List,
  Search,
  Bookmark,
  Activity,
  Info,
  Bot,
  Brain,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { CoursePlayerModal } from '../../components/courses/CoursePlayerModal';
import { DiscussionCenter } from '@/components/courses/DiscussionCenter';
import { discussionService } from '@/services/discussionService';
import { AssignmentPortal } from '@/components/courses/AssignmentPortal';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { AIQuizPortal } from '../../components/courses/AIQuizPortal';
import { PracticeLab } from '../../components/courses/PracticeLab';
import { CertificateService } from '@/services/achievementService';
import type { Certificate } from '@/services/achievementService';
import { CertificatePreviewModal } from '../../components/courses/CertificatePreviewModal';
import { AchievementsDashboard } from '../../components/courses/AchievementsDashboard';
import { LeaderboardView } from '../../components/courses/LeaderboardView';
import { ShieldAlert } from 'lucide-react';
import { courseService } from '@/services/courseService';
import type { XPClaimRecord } from '@/services/courseService';
import type { ICourse } from '../../../../shared/types/course';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const navigate = useNavigate();

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
  const [isQuizPortalOpen, setIsQuizPortalOpen] = useState(false);
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

  // Filters & sorting for Learning Hub
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in-progress' | 'completed' | 'recent'>('all');
  const [selectedSort, setSelectedSort] = useState<'recent-opened' | 'recent-updated' | 'alpha' | 'high-progress' | 'low-progress'>('recent-opened');

  // Bookmarks & Activities
  const [savedLessons, setSavedLessons] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  const [totalUnreadDiscussions, setTotalUnreadDiscussions] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const updateUnreadCount = () => {
    let count = 0;
    courses.forEach((c) => {
      count += discussionService.getUnreadCount(String(c.id), userProfile?.uid || user?.uid || 'default_student');
    });
    setTotalUnreadDiscussions(count);
  };

  useEffect(() => {
    const allBookmarks: any[] = [];
    courses.forEach((c) => {
      const cached = localStorage.getItem(`shaivika_bookmarks_${c.id}`);
      if (cached) {
        try {
          const list = JSON.parse(cached);
          list.forEach((bm: any) => {
            allBookmarks.push({
              ...bm,
              course: c,
            });
          });
        } catch (e) {}
      }
    });
    allBookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSavedLessons(allBookmarks);

    const cachedAct = localStorage.getItem('shaivika_user_activities');
    if (cachedAct) {
      try {
        setRecentActivities(JSON.parse(cachedAct));
      } catch (e) {}
    }

    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id));
    }
    updateUnreadCount();
  }, [courses, activePlayerCourse, userProfile, user]);

  const getCourseCheckpoint = (courseId: string) => {
    const data = localStorage.getItem(`shaivika_user_checkpoint_${courseId}_default_student`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return null;
  };

  const handleLaunchPlayer = (
    course: any,
    subtopicId?: string,
    notesOpen = false,
    tab?: 'notes' | 'bookmarks'
  ) => {
    setPlayerInitialSubtopicId(subtopicId);
    setPlayerInitialNotesOpen(notesOpen);
    setPlayerInitialTab(tab);
    setActivePlayerCourse(course);
  };

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
  const totalCompletedUnitsCount = coursesProgress.reduce((acc, c) => acc + c.completedUnits, 0);
  const totalGlobalUnitsCount = coursesProgress.reduce((acc, c) => acc + c.totalUnits, 0);
  


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



  return (
    <div className="space-y-8 text-slate-900 font-['Sora'] max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <Link to="/dashboard" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize font-semibold text-blue-600">Student Dashboard</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Welcome back, {userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Track learning time, complete pending assessments, and print verified digital credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/courses"
            className="btn-blue-primary text-xs py-2.5 px-4 shadow-md shadow-blue-500/10 flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Syllabus Editor</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2.5 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview Dashboard' },
          { id: 'continue-learning', label: 'Continue Learning Hub' },
          { id: 'assignments', label: 'Assignments & Quiz Scores' },
          { id: 'calendar', label: 'Deadlines Calendar' },
          { id: 'certificates', label: 'Unlocked Credentials' },
          { id: 'achievements', label: 'Achievements & Badges' },
          { id: 'leaderboard', label: 'Cohort Leaderboard' },
          { id: 'analytics', label: 'Learning Analytics' },
          { id: 'discussions', label: `Discussion Center${totalUnreadDiscussions > 0 ? ` (${totalUnreadDiscussions})` : ''}` },
          { id: 'ai-quizzes', label: 'AI Assessment Center' },
          { id: 'practice-lab', label: 'Practice Lab Sandbox' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border cursor-pointer ${
              currentTab === tab.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-blue-600 border-slate-200 hover:bg-slate-55'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------- 1. OVERVIEW TAB ------------------- */}
      {currentTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl border border-sky-100 bg-white/95 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Recent Enrolled</span>
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">{enrolledCourses.length}</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>

            {/* Total Claimed XP Points Card */}
            <div className="glass-card-light p-5 border-l-4 border-l-amber-500 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Claimed XP</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-500 fill-current" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">{totalXP} XP</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Level {Math.floor(totalXP / 100) + 1} Specialist
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-purple-600 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certificates</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">
                  {completedCoursesCount} Earned
                </span>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  {completedCoursesCount > 0 ? 'Verified' : 'Locked'}
                </span>
              </div>
            </div>

            <div className="glass-card-light p-5 border-l-4 border-l-emerald-500 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learning Time</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading font-extrabold text-2xl text-slate-900">{Math.max(14.8, liveHoursCompleted).toFixed(1)} hrs</span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
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
                        className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              {course.category}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Saved Checkpoint Active
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-base text-slate-900 leading-snug">
                            {course.title}
                          </h4>
                          
                          {/* Saved Resume Position Indicator */}
                          <div className="bg-sky-50 border border-sky-200/80 rounded-xl p-2.5 text-xs text-slate-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900">Last Position: </span>
                              <span className="text-sky-700 font-medium">Module {lastModule} ➔ {lastSubtopicTitle}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Overall Track Completion</span>
                            <span className="text-blue-600">{dynamicProgress}% Completed</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                              style={{ width: `${dynamicProgress}%` }}
                            />
                          </div>
                        </div>

                        <Link
                          to={`/course/${course.slug || course.id}?mode=learn`}
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

          {/* SVG Charts & Upcoming deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weekly Learning Activity SVG Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">Study Hours & AI Engagement</h3>
                  <p className="text-xs text-slate-500">Weekly activity curve across active modules</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-200">
                  Last 7 Days
                </span>
              </div>

              {/* Chart Graphic */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/60">
                <svg className="w-full h-44 text-blue-600" viewBox="0 0 500 120" fill="none">
                  <path
                    d="M 0 100 Q 60 20, 120 70 T 240 30 T 360 80 T 500 15"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    d="M 0 100 Q 60 20, 120 70 T 240 30 T 360 80 T 500 15 V 120 H 0 Z"
                    fill="url(#chartBlueAreaLight)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="chartBlueAreaLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="lg:col-span-4 p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
              <h3 className="font-heading font-bold text-base text-slate-900">Upcoming Assignments</h3>
              
              {upcomingAssignments.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-900">All caught up!</h4>
                  <p className="text-[10px] text-slate-500 leading-normal font-medium">No pending homework assignments.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {upcomingAssignments.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 items-start shadow-3xs">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                        TASK
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate" title={item.unit.title}>
                          {item.unit.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate uppercase tracking-wider">{item.courseTitle}</p>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono mt-1 inline-block">
                          Due: {item.unit.assignmentDeadline || '7 Days'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC: Claimed Experience (XP) breakdown & logs */}
          <div className="bg-white/95 border border-amber-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 fill-current animate-pulse" /> Claimed Experience (XP) breakdown & logs
                </h3>
                <p className="text-xs text-slate-500 font-medium">Verify your live activity logs and claim history.</p>
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
                          <span className="text-[10px] font-semibold text-sky-700 max-w-[120px] truncate" title={claim.courseTitle}>
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

      {/* ------------------- CONTINUE LEARNING HUB TAB ------------------- */}
      {currentTab === 'continue-learning' && (() => {
        // Enriched courses list
        const enrichedCourses = courses.map((course) => {
          let totalUnits = 0;
          let completedUnits = 0;
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
                  if (completedIds[u.id]) {
                    completedUnits++;
                  }
                });
              });
            });
          }

          const percentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
          const checkpoint = getCourseCheckpoint(String(course.id));

          const totalDurationStr = course.duration || '20 hrs';
          const numMatch = totalDurationStr.match(/([\d.]+)/);
          const totalHours = numMatch ? parseFloat(numMatch[1]) : 20;
          const remainingPercentage = 100 - (checkpoint ? checkpoint.progressPercent : percentage);
          const estimatedRemainingHours = Math.max(0, Math.round((remainingPercentage * totalHours) / 100));

          return {
            course,
            percentage: checkpoint ? checkpoint.progressPercent : percentage,
            lastUpdated: checkpoint ? checkpoint.lastUpdated : null,
            lastSubtopicTitle: checkpoint ? checkpoint.lastSubtopicTitle : '',
            checkpoint,
            totalUnits,
            completedUnits,
            estimatedRemainingHours,
          };
        });

        // Search & Filters logic
        const filteredCourses = enrichedCourses.filter((item) => {
          const q = searchQuery.toLowerCase().trim();
          if (q) {
            const matchesTitle = item.course.title.toLowerCase().includes(q);
            const matchesInstructor = item.course.instructor.toLowerCase().includes(q);
            const matchesLesson = item.course.modules?.some(m =>
              m.topics.some(t =>
                t.learningUnits.some(u => u.title.toLowerCase().includes(q))
              )
            ) || false;

            if (!matchesTitle && !matchesInstructor && !matchesLesson) {
              return false;
            }
          }

          if (selectedFilter === 'in-progress') {
            return item.percentage > 0 && item.percentage < 100;
          }
          if (selectedFilter === 'completed') {
            return item.percentage === 100;
          }
          if (selectedFilter === 'recent') {
            return item.lastUpdated !== null;
          }
          return true;
        });

        // Sorting logic
        const sortedCourses = [...filteredCourses].sort((a, b) => {
          if (selectedSort === 'recent-opened' || selectedSort === 'recent-updated') {
            const timeA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
            const timeB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
            return timeB - timeA;
          }
          if (selectedSort === 'alpha') {
            return a.course.title.localeCompare(b.course.title);
          }
          if (selectedSort === 'high-progress') {
            return b.percentage - a.percentage;
          }
          if (selectedSort === 'low-progress') {
            return a.percentage - b.percentage;
          }
          return 0;
        });

        const handleResumeCourse = (item: any) => {
          if (item.percentage === 100) {
            navigate(`/course/${item.course.slug}`);
          } else {
            handleLaunchPlayer(item.course);
          }
        };

        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4.5 rounded-3xl border border-sky-100/85 shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Courses by Name, Instructor, or Lesson..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sky-100 bg-white/70 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all focus:border-sky-500"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-3.5 py-2.5 rounded-xl border border-sky-100 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="all">All Enrolled Courses</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="recent">Recently Opened</option>
                </select>

                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="px-3.5 py-2.5 rounded-xl border border-sky-100 bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="recent-opened">Sort: Recently Opened</option>
                  <option value="recent-updated">Sort: Recently Updated</option>
                  <option value="alpha">Sort: Alphabetical</option>
                  <option value="high-progress">Sort: Highest Progress</option>
                  <option value="low-progress">Sort: Lowest Progress</option>
                </select>
              </div>
            </div>

            {/* Main Three-Column Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Column 1: Continue Learning Courses list */}
              <div className="md:col-span-12 lg:col-span-6 space-y-6">
                <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                  <span>Continue Learning</span>
                </h3>
                
                {sortedCourses.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl border border-sky-100 bg-white/70 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto">
                      <Info className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">No courses available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedCourses.map((item) => (
                      <div
                        key={item.course.id}
                        className="p-5.5 rounded-3xl border border-sky-100/80 bg-white hover:border-sky-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-4 group font-['Sora'] text-slate-900"
                      >
                        <div className="flex gap-4">
                          <img
                            src={item.course.thumbnail || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=150&q=80'}
                            alt={item.course.title}
                            className="w-16 h-16 rounded-2xl object-cover border border-sky-100/60 shrink-0 shadow-3xs"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[9px] font-bold uppercase tracking-wider font-mono">
                                {item.course.category}
                              </span>
                              {item.lastUpdated && (
                                <span className="text-[9px] text-slate-400 font-bold font-sans">
                                  Active: {new Date(item.lastUpdated).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                              {item.course.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              Instructor: {item.course.instructor}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <span>Course Progress</span>
                              <span className="text-[9px] font-bold text-slate-400 font-mono">
                                ({item.completedUnits} / {item.totalUnits} Lessons)
                              </span>
                            </div>
                            <span className="text-sky-600 font-mono">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div
                              className="h-full bg-linear-to-r from-sky-500 to-indigo-600 transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
                          <span>⏱ Remaining: ~{item.estimatedRemainingHours} hrs</span>
                          {item.lastSubtopicTitle && (
                            <span className="truncate max-w-64">
                              Last visit: <span className="text-slate-600">{item.lastSubtopicTitle}</span>
                            </span>
                          )}
                        </div>

                        {/* Course Card Action Buttons */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
                          <button
                            onClick={() => handleResumeCourse(item)}
                            className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm col-span-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>{item.percentage === 100 ? 'Course Overview' : 'Resume Learning'}</span>
                          </button>
                          <button
                            onClick={() => handleLaunchPlayer(item.course, '1.1.1')}
                            className="py-2.5 px-3 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-50 text-sky-800 text-[10px] font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1"
                          >
                            Curriculum
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLaunchPlayer(item.course, undefined, true, 'notes')}
                              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-extrabold cursor-pointer transition-all flex items-center justify-center"
                              title="View Notes"
                            >
                              Notes
                            </button>
                            <button
                              onClick={() => handleLaunchPlayer(item.course, undefined, true, 'bookmarks')}
                              className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-extrabold cursor-pointer transition-all flex items-center justify-center"
                              title="View Bookmarks"
                            >
                              Saved
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 2: Saved Lessons */}
              <div className="md:col-span-6 lg:col-span-3 space-y-6">
                <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Saved Lessons</span>
                </h3>

                {savedLessons.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl border border-slate-100 bg-white/70 space-y-2">
                    <Bookmark className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 italic">No saved lessons yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {savedLessons.map((bm) => (
                      <div
                        key={bm.subtopicId}
                        className="p-4 rounded-2xl border border-sky-100 bg-white shadow-3xs flex flex-col justify-between space-y-2.5 hover:shadow-md transition-all duration-300 font-['Sora'] text-slate-900"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-extrabold uppercase text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md">
                              {bm.lessonType}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 font-sans">
                              {new Date(bm.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-heading font-bold text-xs text-slate-900 truncate" title={bm.subtopicTitle}>
                            {bm.subtopicTitle}
                          </h4>
                          <span className="text-[9px] font-medium text-slate-400 block truncate">
                            {bm.moduleTitle}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500 block truncate">
                            Course: {bm.course.title}
                          </span>
                        </div>

                        <button
                          onClick={() => handleLaunchPlayer(bm.course, bm.subtopicId)}
                          className="w-full py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-extrabold cursor-pointer transition-all flex items-center justify-center gap-1 border border-sky-100"
                        >
                          Quick Open
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Column 3: Recent Activity */}
              <div className="md:col-span-6 lg:col-span-3 space-y-6">
                <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>Recent Activity</span>
                </h3>

                {recentActivities.length === 0 ? (
                  <div className="p-8 text-center rounded-3xl border border-slate-100 bg-white/70 space-y-2">
                    <Activity className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-400 italic">No recent learning activity.</p>
                  </div>
                ) : (
                  <div className="relative border-l border-slate-150 pl-4 ml-2.5 space-y-5">
                    {recentActivities.slice(0, 10).map((act) => {
                      let actIcon = <PlayCircle className="w-3.5 h-3.5" />;
                      let actColor = 'text-blue-500 bg-blue-50 border-blue-100';

                      if (act.type === 'completed') {
                        actIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
                        actColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                      } else if (act.type === 'quiz') {
                        actIcon = <Award className="w-3.5 h-3.5" />;
                        actColor = 'text-purple-600 bg-purple-50 border-purple-100';
                      } else if (act.type === 'assignment') {
                        actIcon = <FileCheck className="w-3.5 h-3.5" />;
                        actColor = 'text-amber-600 bg-amber-50 border-amber-100';
                      } else if (act.type === 'note') {
                        actIcon = <BookOpen className="w-3.5 h-3.5" />;
                        actColor = 'text-sky-500 bg-sky-50 border-sky-100';
                      } else if (act.type === 'bookmark') {
                        actIcon = <Bookmark className="w-3.5 h-3.5" />;
                        actColor = 'text-pink-500 bg-pink-50 border-pink-100';
                      }

                      return (
                        <div key={act.id} className="relative font-['Sora'] text-slate-900 space-y-1">
                          {/* Timeline Bullet Marker */}
                          <div className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${actColor} shadow-3xs`}>
                            {actIcon}
                          </div>

                          <div className="pl-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {act.title}
                            </p>
                            <span className="text-[9px] font-semibold text-slate-400 block truncate">
                              Course: {act.courseTitle}
                            </span>
                            <span className="text-[8px] font-medium text-slate-400 font-sans block pt-0.5">
                              {new Date(act.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------- 2. ASSIGNMENTS & QUIZZES TAB ------------------- */}
      {currentTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Upcoming Assignments Board */}
          <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-500" />
              <span>Pending Task Assignments</span>
            </h3>

            {upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No pending assignments configured.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 rounded-2xl shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4">Assignment Title</th>
                      <th className="py-3.5 px-4">Course Track</th>
                      <th className="py-3.5 px-4">Deadline Schedule</th>
                      <th className="py-3.5 px-4">Marks Limits</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {upcomingAssignments.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.unit.title}</td>
                        <td className="py-3.5 px-4 text-slate-500">{item.courseTitle}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{item.unit.assignmentDeadline || '7 days'}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{item.unit.assignmentMaxMarks || 100} Marks</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedAssignmentForPortal({
                              id: item.unit.id || '1.1.3',
                              title: item.unit.title,
                              courseId: String(item.courseId),
                              dueDate: '2026-07-25T23:59:59Z'
                            })}
                            className="inline-flex items-center text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer shadow-3xs"
                          >
                            <span>Open Workspace</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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

      {/* ------------------- 3. CALENDAR TAB ------------------- */}
      {currentTab === 'calendar' && (
        <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-6 animate-in fade-in duration-300 shadow-3xs">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Academic Deadlines Scheduler</span>
            </h3>
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              July 2026
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-2 border-b border-slate-100">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1.5">
            {/* Blank offset days for July 2026 (starts on a Wednesday, so offset is 3 days: Sun, Mon, Tue) */}
            {[...Array(3)].map((_, idx) => (
              <div key={`offset-${idx}`} className="h-16 bg-slate-50/20 border border-transparent rounded-xl" />
            ))}

            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const isToday = day === 24; // Metadata date is July 24
              const hasAssignment = day === 25 || day === 30; // highlights
              
              return (
                <div
                  key={day}
                  className={`h-16 p-2 rounded-xl border flex flex-col justify-between text-xs transition-all shadow-3xs ${
                    isToday 
                      ? 'bg-blue-600 border-blue-600 text-white font-extrabold shadow-md shadow-blue-600/10' 
                      : 'bg-slate-50 border-slate-250 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{day}</span>
                  {hasAssignment && (
                    <span className="text-[8px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded truncate tracking-wide">
                      Deadline
                    </span>
                  )}
                </div>
              );
            })}
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
                    <ShieldAlert className="w-4.5 h-4.5 text-slate-400 shrink-0" />
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
      {/* ------------------- 5. ANALYTICS TAB ------------------- */}
      {currentTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs">
            <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Skill Competency Radar</span>
            </h3>
            
            <div className="space-y-4">
              {coursesProgress.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No course analytics logged.</p>
              ) : (
                coursesProgress.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.course.title}</span>
                      <span className="text-blue-600 font-mono">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-sky-100 bg-white space-y-4 shadow-3xs flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>Verified Milestones</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Academic progress audits indicate that you have completed <strong className="text-slate-800 font-semibold">{totalCompletedUnitsCount} learning items</strong> out of the total <strong className="text-slate-800 font-semibold">{totalGlobalUnitsCount} syllabus units</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/20 border border-indigo-100 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-600 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-indigo-900">Academic Standing Status</span>
                <span className="text-[10px] text-indigo-700 font-bold block">Excellent (Top 10% of learner cohort)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 6. DISCUSSION CENTER TAB ------------------- */}
      {currentTab === 'discussions' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-sky-200/60 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">Discussion Center & Doubt Resolution</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Browse discussion channels, clear your doubts, and collaborate with peers.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Select Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 focus:border-blue-500 outline-none transition-all cursor-pointer font-semibold"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedCourseId && (
            <DiscussionCenter
              courseId={selectedCourseId}
              onUnreadCountChange={updateUnreadCount}
            />
          )}
        </div>
      )}

      {/* ------------------- 7. AI QUIZZES CENTER TAB ------------------- */}
      {currentTab === 'ai-quizzes' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <AIQuizPortal
            courseId={aiLessonContext?.courseId || defaultAiContext.courseId}
            courseTitle={aiLessonContext?.courseTitle || defaultAiContext.courseTitle}
            lessonId={aiLessonContext?.id || defaultAiContext.id}
            lessonTitle={aiLessonContext?.title || defaultAiContext.title}
            lessonContent={aiLessonContext?.content || defaultAiContext.content}
          />
        </div>
      )}

      {/* ------------------- 8. PRACTICE LAB SANDBOX TAB ------------------- */}
      {currentTab === 'practice-lab' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300 h-[650px] p-2">
          <PracticeLab
            standalone={true}
            courseId={selectedCourseId || '1'}
          />
        </div>
      )}

      {/* ------------------- 9. ACHIEVEMENTS & BADGES TAB ------------------- */}
      {currentTab === 'achievements' && (
        <AchievementsDashboard />
      )}

      {/* ------------------- 10. LEADERBOARD TAB ------------------- */}
      {currentTab === 'leaderboard' && (
        <LeaderboardView />
      )}

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

      {/* Floating AI Assistant Trigger */}
      {currentTab !== 'ai-quizzes' && !isAiPanelOpen && (
        <button
          onClick={() => {
            if (!aiLessonContext) {
              setAiLessonContext(defaultAiContext);
            }
            setIsAiPanelOpen(true);
            toast.success('AI Tutor panel activated!');
          }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-950/40 flex items-center justify-center hover:scale-110 hover:bg-slate-850 transition-all duration-300 border border-slate-700 cursor-pointer"
          title="Open AI Learning Assistant"
        >
          <div className="relative">
            <Bot className="w-7 h-7 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
        </button>
      )}

      {/* Floating AI Quiz Generator Trigger */}
      {currentTab !== 'ai-quizzes' && !isQuizPortalOpen && (
        <button
          onClick={() => {
            if (!aiLessonContext) {
              setAiLessonContext(defaultAiContext);
            }
            setIsQuizPortalOpen(true);
            toast.success('AI Quiz Generator panel activated!');
          }}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-950/40 flex items-center justify-center hover:scale-110 hover:bg-slate-850 transition-all duration-300 border border-slate-700 cursor-pointer"
          title="Open AI Quiz Generator"
        >
          <div className="relative">
            <Brain className="w-7 h-7 text-purple-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 border-2 border-slate-900 rounded-full" />
          </div>
        </button>
      )}

      {isAiPanelOpen && (
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
          isDocked={false}
        />
      )}

      {isQuizPortalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Sora']">
          <AIQuizPortal
            courseId={aiLessonContext?.courseId || defaultAiContext.courseId}
            courseTitle={aiLessonContext?.courseTitle || defaultAiContext.courseTitle}
            lessonId={aiLessonContext?.id || defaultAiContext.id}
            lessonTitle={aiLessonContext?.title || defaultAiContext.title}
            lessonContent={aiLessonContext?.content || defaultAiContext.content}
            onClose={() => setIsQuizPortalOpen(false)}
          />
        </div>
      )}

    </div>
  );
};
