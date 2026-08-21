import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  Download,
  ExternalLink,
  Users,
  Layers,
  Video,
  Calendar,
  Link2,
  FolderSearch,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { API_BASE_URL } from '@/config/api';
import { CoursePlayerModal } from '../../components/courses/CoursePlayerModal';
import { AssignmentPortal } from '@/components/courses/AssignmentPortal';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { CertificateService, BadgeService, AchievementService, STATIC_BADGES } from '@/services/achievementService';
import type { Certificate } from '@/services/achievementService';
import { CertificatePreviewModal } from '../../components/courses/CertificatePreviewModal';
import { AchievementsDashboard } from '../../components/courses/AchievementsDashboard';
import { courseService } from '@/services/courseService';
import type { XPClaimRecord } from '@/services/courseService';
import type { ICourse } from '../../../../shared/types/course';
import { courseTimeService } from '@/services/courseTimeService';
import { useCourseTimeTracker } from '@/hooks/useCourseTimeTracker';
import { studentService, type StudentUser } from '@/services/studentService';
import { soundService } from '@/services/soundService';

import { AnalyticsDashboard } from '../../components/courses/AnalyticsDashboard';
import { LeaderboardView } from '../../components/courses/LeaderboardView';
import { ResumeBuilder } from '../../components/courses/ResumeBuilder';
import { PortfolioBuilder } from '../../components/portfolio/PortfolioBuilder';
import { CareerRoadmap } from '../../components/courses/CareerRoadmap';
import { PracticeHub } from '../../components/courses/PracticeHub';
import { InterviewPrep } from '../../components/courses/InterviewPrep';
import { StudentLiveClassroomSection } from '../../components/liveClassroom/StudentLiveClassroomSection';
import { SubscriptionSettings } from '../../components/settings/SubscriptionSettings';
import { liveClassService, normalizeLiveClassStatus, type LiveClass } from '@/services/liveClassService';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'overview';

  // Dynamic Courses State
  const [enrolledCourses, setEnrolledCourses] = useState<ICourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Real-time Live Classes State
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);

  useEffect(() => {
    const unsubLive = liveClassService.subscribeLiveClasses((data) => {
      setLiveClasses(data || []);
    });
    return () => unsubLive();
  }, []);

  // Instructor Student Roster State
  const [allStudents, setAllStudents] = useState<StudentUser[]>([]);

  useEffect(() => {
    if (userProfile?.role === 'instructor') {
      const unsub = studentService.subscribeToStudents((data) => {
        setAllStudents(data);
      });
      return () => unsub();
    }
  }, [userProfile?.role]);

  // XP & Claims State
  const [totalXP, setTotalXP] = useState(0);
  const [xpClaims, setXpClaims] = useState<XPClaimRecord[]>([]);

  // AI Course Search & Weakness Analyzer States
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<ICourse[]>([]);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);

  const handleAiSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSearchQuery.trim()) return;
    setIsAiSearching(true);
    setTimeout(() => {
      const query = aiSearchQuery.toLowerCase();
      const matches = enrolledCourses.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description?.toLowerCase().includes(query)
      );
      setAiSearchResults(matches);
      setIsAiSearching(false);
    }, 500);
  }, [aiSearchQuery, enrolledCourses]);

  useEffect(() => {
    setWeakTopics([]);
  }, []);

  const badgeService = useMemo(() => new BadgeService(), []);
  const streakService = useMemo(() => new AchievementService(), []);

  const earnedBadgesCount = useMemo(() => {
    return badgeService.getEarnedBadges(user?.uid || 'default_student').length;
  }, [badgeService, user?.uid]);

  const currentStreak = useMemo(() => {
    return streakService.getStreaks(user?.uid || 'default_student').dailyStreak;
  }, [streakService, user?.uid]);

  const earnedBadgesIds = useMemo(() => {
    const list = badgeService.getEarnedBadges(user?.uid || 'default_student');
    return new Set(list.map((b: any) => b.id));
  }, [badgeService, user?.uid]);

  // Completed courses check (only 100% completed courses unlock certificates)
  const completedCourses = enrolledCourses.filter((course) => {
    const checkpoint = courseService.getCourseCheckpoint(course.id, user?.uid || 'default_student');
    return checkpoint && checkpoint.progressPercent >= 100;
  });
  const completedCoursesCount = completedCourses.length;

  // Certificate Modal State
  const [activePreviewCert, setActivePreviewCert] = useState<Certificate | null>(null);
  const [loadingCertId, setLoadingCertId] = useState<string | null>(null);

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
    window.addEventListener('shaivika_ai_prompt_logged', handleTimeUpdate);
    return () => {
      window.removeEventListener('shaivika_time_updated', handleTimeUpdate);
      window.removeEventListener('shaivika_ai_prompt_logged', handleTimeUpdate);
    };
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

  // Phase 5: Daily Mission & Streak Engagement State
  const [dailyCompletedCount, setDailyCompletedCount] = useState(0);
  const [isDailyClaimed, setIsDailyClaimed] = useState(false);
  const [todayXP, setTodayXP] = useState(0);

  useEffect(() => {
    if (!activeUserId) return;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyKey = `shaivika_daily_mission_${activeUserId}_${todayStr}`;
    
    // Load or initialize daily mission tracker
    const rawDaily = localStorage.getItem(dailyKey);
    let dailyData = { completedLessonIds: [] as string[], rewardClaimed: false };
    if (rawDaily) {
      try {
        dailyData = JSON.parse(rawDaily);
      } catch (e) {}
    } else {
      // Clean up older daily mission keys to save local storage space
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`shaivika_daily_mission_${activeUserId}_`) && key !== dailyKey) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {}
      localStorage.setItem(dailyKey, JSON.stringify(dailyData));
    }
    
    setDailyCompletedCount(dailyData.completedLessonIds.length);
    setIsDailyClaimed(dailyData.rewardClaimed);

    // Calculate today's XP from claim logs
    const claims = courseService.getXPClaimLogs(activeUserId);
    const earnedToday = claims
      .filter((c: any) => c.timestamp && c.timestamp.startsWith(todayStr))
      .reduce((sum: number, c: any) => sum + (c.xp || 0), 0);
    setTodayXP(earnedToday);
  }, [activeUserId, totalXP]);

  const nextLessonData = useMemo(() => {
    if (courses.length === 0) return null;
    
    // Find active course (where progress is > 0 and < 100)
    let activeCourse = courses.find(course => {
      const checkpoint = courseService.getCourseCheckpoint(String(course.id), activeUserId);
      return checkpoint && checkpoint.progressPercent > 0 && checkpoint.progressPercent < 100;
    });

    // Fallback to first course in list
    if (!activeCourse) {
      activeCourse = courses[0];
    }

    const modules = (activeCourse.modules || []) as any[];
    const allLessons = modules.flatMap(m => (m.lessons || []) as any[]);
    if (allLessons.length === 0) return null;

    // Get completed lessons for this course
    let completedIds: any[] = [];
    try {
      const saved = localStorage.getItem(`shaivika_completed_${activeCourse.id}`);
      completedIds = saved ? JSON.parse(saved) : [];
    } catch (e) {}

    // Find the first lesson that is NOT completed
    const incompleteLesson = allLessons.find(l => !completedIds.some(cId => String(cId) === String(l.id)));
    if (!incompleteLesson) {
      // Course is fully completed
      return { completed: true, course: activeCourse };
    }

    // Find the module containing this lesson
    const module = modules.find(m => (m.lessons || []).some((l: any) => String(l.id) === String(incompleteLesson.id)));

    return {
      completed: false,
      lesson: incompleteLesson,
      module: module,
      course: activeCourse
    };
  }, [courses, enrolledCourses, activeUserId]);

  const handleContinueMission = () => {
    if (!nextLessonData || nextLessonData.completed) return;
    const { course, lesson } = nextLessonData;
    
    // Set last active lesson in local storage so workspace loads it
    localStorage.setItem(`shaivika_last_active_${course.id}`, String(lesson.id));
    
    // Navigate directly to course workspace mode
    navigate(`/dashboard/course/${(course as any).slug || course.id}?mode=learn`);
  };

  const handleClaimDailyReward = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dailyKey = `shaivika_daily_mission_${activeUserId}_${todayStr}`;
    
    const rawDaily = localStorage.getItem(dailyKey);
    let dailyData = { completedLessonIds: [] as string[], rewardClaimed: false };
    if (rawDaily) {
      try { dailyData = JSON.parse(rawDaily); } catch (e) {}
    }
    
    if (dailyData.rewardClaimed) return;
    
    // Play reward sound
    soundService.play('xp');
    
    // Log the XP claim exactly once
    const updatedClaims = courseService.addXPClaim(
      {
        id: `claim_daily_${todayStr}`,
        title: `🎯 Daily Mission Completion Bonus`,
        xp: 30,
        category: 'Practice Challenge Completion',
        timestamp: new Date().toISOString(),
        courseId: 'daily_mission',
        courseTitle: 'KaizenQ Daily Mission',
      },
      activeUserId
    );
    
    // Synchronize legacy keys and trigger local event
    const updatedXp = updatedClaims.reduce((sum: number, c: any) => sum + (c.xp || 0), 0);
    localStorage.setItem(`shaivika_user_xp_${activeUserId}`, String(updatedXp));
    localStorage.setItem(`shaivika_points_${activeUserId}`, String(updatedXp));
    localStorage.setItem(`shaivika_points_default_student`, String(updatedXp));
    
    window.dispatchEvent(new CustomEvent('shaivika_xp_updated', { detail: { userId: activeUserId, xp: updatedXp } }));
    
    // Mark as claimed
    dailyData.rewardClaimed = true;
    localStorage.setItem(dailyKey, JSON.stringify(dailyData));
    
    setIsDailyClaimed(true);
    toast.success("🎁 Daily Reward Claimed! +30 XP awarded.");
    
    // Reload dashboard stats
    loadDashboardData();
  };

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

    // Load completed units from legacy localStorage
    let completedIds: Record<string, boolean> = {};
    try {
      const stored = localStorage.getItem(`lms_completed_units_${course.id}`);
      if (stored) completedIds = JSON.parse(stored);
    } catch {}

    // Load completed lesson IDs from InCourseLearningView
    let completedLessons: (string | number)[] = [];
    try {
      const savedCompletedStr = localStorage.getItem(`shaivika_completed_${course.id}`);
      if (savedCompletedStr) completedLessons = JSON.parse(savedCompletedStr);
    } catch {}

    // Load checkpoint completed subtopics from CoursePlayerModal
    const checkpoint = courseService.getCourseCheckpoint(String(course.id), activeUserId);
    const completedSubtopics = checkpoint?.completedSubtopics || [];

    if (course.modules) {
      course.modules.forEach((m: any) => {
        // Support m.lessons structure (InCourseLearningView)
        if (m.lessons) {
          m.lessons.forEach((l: any) => {
            totalUnits++;
            const hours = parseDurationToHours(l.duration || '30 mins');
            totalDurationHours += hours;

            const type = l.type || 'Video';
            if (type === 'Video') totalVideos++;
            else if (type === 'Reading') totalReadings++;
            else if (type === 'Quiz') totalQuizzes++;
            else if (type === 'Assignment') totalAssignments++;

            const isDone =
              completedIds[String(l.id)] ||
              completedLessons.some((cId) => String(cId) === String(l.id)) ||
              completedSubtopics.some((sId) => String(sId) === String(l.id)) ||
              (checkpoint && checkpoint.progressPercent >= 100);

            if (isDone) {
              completedUnits++;
              completedDurationHours += hours;
              if (type === 'Video') completedVideos++;
              else if (type === 'Reading') completedReadings++;
              else if (type === 'Quiz') completedQuizzes++;
              else if (type === 'Assignment') completedAssignments++;
            }
          });
        }

        // Support topics/learningUnits structure (Legacy / alternate)
        if (m.topics) {
          m.topics.forEach((t: any) => {
            if (t.learningUnits) {
              t.learningUnits.forEach((u: any) => {
                totalUnits++;
                const hours = parseDurationToHours(u.duration);
                totalDurationHours += hours;

                if (u.type === 'Video') totalVideos++;
                else if (u.type === 'Reading') totalReadings++;
                else if (u.type === 'Quiz') totalQuizzes++;
                else if (u.type === 'Assignment') totalAssignments++;

                const isDone =
                  completedIds[String(u.id)] ||
                  completedLessons.some((cId) => String(cId) === String(u.id)) ||
                  completedSubtopics.some((sId) => String(sId) === String(u.id)) ||
                  (checkpoint && checkpoint.progressPercent >= 100);

                if (isDone) {
                  completedUnits++;
                  completedDurationHours += hours;
                  if (u.type === 'Video') completedVideos++;
                  else if (u.type === 'Reading') completedReadings++;
                  else if (u.type === 'Quiz') completedQuizzes++;
                  else if (u.type === 'Assignment') completedAssignments++;
                }
              });
            }
          });
        }
      });
    }

    let percentage = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;
    if (checkpoint && checkpoint.progressPercent >= 100) {
      percentage = 100;
    }
    if (percentage === 100) {
      completedUnits = totalUnits;
      completedDurationHours = totalDurationHours;
      completedVideos = totalVideos;
      completedReadings = totalReadings;
      completedQuizzes = totalQuizzes;
      completedAssignments = totalAssignments;
    }

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

  // Dynamic study time & AI engagement calculation per day from real rolling calendar dates
  const weeklyChartData = React.useMemo(() => {
    const daysCount = chartTimeframe === '7d' ? 7 : 30;
    const metrics = courseTimeService.getRollingDailyMetrics(activeUserId, daysCount);
    const maxVal = Math.max(...metrics.map((d) => d.hours), 0.1);

    return metrics.map((d) => ({
      ...d,
      day: d.isToday ? 'Today' : d.dayName,
      displayDate: d.shortDate,
      heightPercent: d.hours > 0 ? Math.max(15, Math.round((d.hours / maxVal) * 100)) : 6,
    }));
  }, [chartTimeframe, realtimeSec, activeUserId]);
  


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

  // Synchronize all saved certificates from local storage to Google Sheets backend registry
  React.useEffect(() => {
    const uid = userProfile?.uid || user?.uid || 'default_student';
    const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
    const studentId = uid;

    const fetchAndSyncFromBackend = async () => {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      try {
        const response = await fetch(`${apiBase}/certificates/student/${studentEmail}`);
        if (!response.ok) {
          console.error(`[Dashboard Sync] API Error: ${response.status} ${response.statusText}`);
          return;
        }
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const resData = await response.json();
          if (resData.success && Array.isArray(resData.data)) {
            resData.data.forEach((backendCert: any) => {
              const mappedCert: Certificate = {
                id: `cert_${backendCert.courseId}_${Date.now()}`,
                courseId: backendCert.courseId,
                courseTitle: backendCert.courseName || backendCert.courseTitle || 'Course',
                studentName: backendCert.studentName,
                studentId: backendCert.studentId,
                instructorName: backendCert.instructorName || 'Shaivika Groups Board',
                completionDate: backendCert.completionDate || backendCert.issueDate,
                verificationId: backendCert.certificateId || backendCert.verificationId,
                googleDriveLink: backendCert.pdfUrl || backendCert.googleDriveLink,
              };
              certificateService.saveExternalCertificate(studentId, mappedCert);
              localStorage.setItem(`shaivika_cert_synced_${mappedCert.verificationId}`, 'true');
            });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch certificates from backend registry:', err);
      }
    };

    fetchAndSyncFromBackend().then(() => {
      // Collect certificates from both active user and default student keys
      const certsToSync: Certificate[] = [];
      
      const activeCerts = certificateService.getCertificates(uid);
      if (Array.isArray(activeCerts)) certsToSync.push(...activeCerts);
      
      if (uid !== 'default_student') {
        const defaultCerts = certificateService.getCertificates('default_student');
        if (Array.isArray(defaultCerts)) {
          defaultCerts.forEach((dc) => {
            if (!certsToSync.some((c) => c.verificationId === dc.verificationId)) {
              certsToSync.push(dc);
            }
          });
        }
      }

      if (certsToSync.length === 0) return;

      const syncCertificate = async (cert: any) => {
        const isMockId = String(cert.verificationId).includes('MOCK') || cert.verificationId === 'KQ-CERT-MOCK-ID';
        const syncKey = `shaivika_cert_synced_${cert.verificationId}`;
        if (localStorage.getItem(syncKey) === 'true' && !isMockId) return;

        // Resolve actual modules count dynamically from course progress data
        const progressItem = coursesProgress.find(p => String(p.course.id) === String(cert.courseId));
        const actualModulesCount = (progressItem?.course?.modules && progressItem.course.modules.length) || 
                                   (progressItem?.course?.syllabus && progressItem.course.syllabus.length) || 
                                   cert.modulesCount || 8;

        try {
          let token: string | null = null;
          if (user) {
            try {
              token = await user.getIdToken();
            } catch (tErr) {
              console.warn('Failed to fetch initial ID token:', tErr);
            }
          }
          if (!token) {
            token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
          }

          const getHeaders = (t: string | null) => {
            const h: Record<string, string> = { 'Content-Type': 'application/json' };
            if (t) {
              h['Authorization'] = `Bearer ${t}`;
            }
            return h;
          };

          const apiBase = import.meta.env.VITE_API_URL || '/api';
          const safeFetchJson = async (url: string, options: RequestInit) => {
            try {
              const res = await fetch(url, options);
              if (!res.ok) {
                console.error(`[API ERROR] ${options.method || 'GET'} ${url} returned ${res.status} ${res.statusText}`);
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                  const errData = await res.json();
                  return { success: false, status: res.status, error: errData.error || errData.message || res.statusText };
                }
                return { success: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
              }
              const contentType = res.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                return { success: true, status: res.status, data };
              }
              return { success: true, status: res.status, data: {} };
            } catch (fetchErr) {
              console.error(`[API NETWORK ERROR] Failed to fetch ${url}:`, fetchErr);
              throw fetchErr;
            }
          };

          let syncRes = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({
              studentId,
              studentName,
              studentEmail,
              courseId: cert.courseId,
              courseTitle: cert.courseTitle,
              completionPercentage: 100,
              instructorName: cert.instructorName || 'Shaivika Groups Board',
              courseDuration: cert.courseDuration || '24 Hours',
              modulesCount: actualModulesCount,
              verificationId: cert.verificationId,
              forceRegenerate: false
            }),
          });

          let syncData = syncRes.data || {};
          const isAuthError = syncRes.status === 401 || (syncRes.error && String(syncRes.error).toLowerCase().includes('firebase id token'));

          if (isAuthError && user) {
            console.warn('Sync request unauthorized (token expired/invalid). Refreshing token...');
            try {
              token = await user.getIdToken(true);
              syncRes = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify({
                  studentId,
                  studentName,
                  studentEmail,
                  courseId: cert.courseId,
                  courseTitle: cert.courseTitle,
                  completionPercentage: 100,
                  instructorName: cert.instructorName || 'Shaivika Groups Board',
                  courseDuration: cert.courseDuration || '24 Hours',
                  modulesCount: actualModulesCount,
                  verificationId: cert.verificationId,
                  forceRegenerate: false
                }),
              });
              syncData = syncRes.data || {};
            } catch (refreshErr) {
              console.error('Failed to retry sync with refreshed ID token:', refreshErr);
            }
          }

          if (syncRes.success && syncData.success) {
            localStorage.setItem(syncKey, 'true');
            localStorage.setItem(`shaivika_cert_synced_${syncData.certificateId}`, 'true');

            // Update local certificate with the real backend data
            const allCerts = certificateService.getCertificates(studentId);
            const found = allCerts.find(c => c.courseId === cert.courseId);
            if (found) {
              found.verificationId = syncData.certificateId;
              found.googleDriveLink = syncData.googleDriveLink;
              found.modulesCount = actualModulesCount;
              certificateService.saveExternalCertificate(studentId, found);
            }
          }
        } catch (err) {
          console.warn('Certificate registry sync error:', err);
        }
      };

      certsToSync.forEach((cert) => {
        syncCertificate(cert);
      });
    });
  }, [earnedCerts, user, userProfile, studentName, certificateService]);

  const handleViewCertificate = async (cert: Certificate) => {
    if (loadingCertId) return;
    const isMock = String(cert.verificationId).startsWith('KQ-') || cert.verificationId === 'KQ-CERT-MOCK-ID';
    if (!isMock) {
      setActivePreviewCert(cert);
      return;
    }

    setLoadingCertId(cert.courseId);
    const toastId = toast.loading('Retrieving official verified certificate from registry...');
    try {
      const uid = userProfile?.uid || user?.uid || 'default_student';
      const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
      const studentId = uid;

      const apiBase = import.meta.env.VITE_API_URL || '/api';

      const safeFetchJson = async (url: string, options: RequestInit) => {
        try {
          const res = await fetch(url, options);
          if (!res.ok) {
            console.error(`[API ERROR] ${options.method || 'GET'} ${url} returned ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errData = await res.json();
              return { success: false, status: res.status, error: errData.error || errData.message || res.statusText };
            }
            return { success: false, status: res.status, error: `HTTP ${res.status}: ${res.statusText}` };
          }
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            return { success: true, status: res.status, data };
          }
          return { success: true, status: res.status, data: {} };
        } catch (fetchErr) {
          console.error(`[API NETWORK ERROR] Failed to fetch ${url}:`, fetchErr);
          throw fetchErr;
        }
      };

      const verifyRes = await fetch(`${apiBase}/certificates/student/${studentEmail}`);
      if (verifyRes.ok) {
        const contentType = verifyRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const verifyData = await verifyRes.json();
          if (verifyData.success && Array.isArray(verifyData.data)) {
            const matched = verifyData.data.find((c: any) => String(c.courseId) === String(cert.courseId));
            if (matched && matched.certificateId) {
              const updated: Certificate = {
                ...cert,
                verificationId: matched.certificateId,
                googleDriveLink: matched.pdfUrl || matched.googleDriveLink,
              };
              certificateService.saveExternalCertificate(studentId, updated);
              toast.success('Certificate loaded successfully!', { id: toastId });
              setActivePreviewCert(updated);
              setLoadingCertId(null);
              return;
            }
          }
        }
      }

      // 2. Trigger generation
      const progressItem = coursesProgress.find(p => String(p.course.id) === String(cert.courseId));
      const actualModulesCount = (progressItem?.course?.modules && progressItem.course.modules.length) || 
                                 (progressItem?.course?.syllabus && progressItem.course.syllabus.length) || 
                                 cert.modulesCount || 8;

      let token: string | null = null;
      if (user) {
        try {
          token = await user.getIdToken();
        } catch {}
      }
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
      }

      const getHeaders = (t: string | null) => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' };
        if (t) h['Authorization'] = `Bearer ${t}`;
        return h;
      };

      const deliverRes = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          studentId,
          studentName,
          studentEmail,
          courseId: cert.courseId,
          courseTitle: cert.courseTitle,
          completionPercentage: 100,
          instructorName: cert.instructorName || 'Shaivika Groups Board',
          courseDuration: cert.courseDuration || '24 Hours',
          modulesCount: actualModulesCount,
          verificationId: cert.verificationId,
          forceRegenerate: true
        }),
      });

      const deliverData = deliverRes.data || {};
      if (deliverRes.success && deliverData.success) {
        const updated: Certificate = {
          ...cert,
          verificationId: deliverData.certificateId,
          googleDriveLink: deliverData.googleDriveLink,
          modulesCount: actualModulesCount,
        };
        certificateService.saveExternalCertificate(studentId, updated);
        toast.success('Official Certificate generated successfully!', { id: toastId });
        setActivePreviewCert(updated);
      } else {
        toast.error(deliverRes.error || deliverData.error || 'Failed to retrieve official certificate.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Failed to retrieve official certificate.', { id: toastId });
    } finally {
      setLoadingCertId(null);
    }
  };

  const handleShareToLinkedIn = (cert: Certificate) => {
    let issueYear = new Date().getFullYear();
    let issueMonth = new Date().getMonth() + 1;
    if (cert.completionDate) {
      try {
        const parsedDate = new Date(cert.completionDate);
        if (!isNaN(parsedDate.getTime())) {
          issueYear = parsedDate.getFullYear();
          issueMonth = parsedDate.getMonth() + 1;
        }
      } catch {}
    }
    const certUrl = `${window.location.origin}/verify-certificate/${cert.verificationId}`;
    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION&name=${encodeURIComponent(cert.courseTitle)}&organizationName=KaizenQ&issueYear=${issueYear}&issueMonth=${issueMonth}&certId=${cert.verificationId}&certUrl=${encodeURIComponent(certUrl)}`;
    window.open(linkedinUrl, '_blank');
  };

  const handleShareToTwitter = (cert: Certificate) => {
    const certUrl = `${window.location.origin}/verify-certificate/${cert.verificationId}`;
    const text = `🏆 I am thrilled to share that I have successfully completed the "${cert.courseTitle}" course on KaizenQ LMS! Check out my verified digital certificate here:`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(certUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareToGitHub = (cert: Certificate) => {
    const certUrl = `${window.location.origin}/verify-certificate/${cert.verificationId}`;
    const badgeMarkdown = `[![KaizenQ Certification](https://img.shields.io/badge/KaizenQ-Certified-${encodeURIComponent(cert.courseTitle.includes('Git') ? 'Git_Mastery' : 'Mastery')}-blue?logo=github)](${certUrl})`;
    navigator.clipboard.writeText(badgeMarkdown);
    toast.success("✨ GitHub README Markdown badge copied to clipboard! Paste it into your profile README.md.");
  };

  const handleCopyVerificationLink = (cert: Certificate) => {
    const certUrl = `${window.location.origin}/verify-certificate/${cert.verificationId}`;
    navigator.clipboard.writeText(certUrl);
    toast.success("📋 Verification link copied to clipboard!");
  };

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
    'live-classroom': 'Enterprise Live Classroom Sessions',
    assignments: 'Quiz Results & Gradebook',
    certificates: 'Certificates',
    achievements: 'Achievements & Badges',
    'ai-tutor': 'AI Tutor',
    analytics: 'Learning Analytics',
    leaderboard: 'Cohort Leaderboard',
    'resume-builder': 'Resume Builder',
    'portfolio-builder': 'Developer Portfolio Builder',
    portfolio: 'Developer Portfolio Builder',
    'career-roadmap': 'Career Roadmap',
    'practice-hub': 'Practice Hub',
    'interview-prep': 'Interview Prep',
    settings: 'Settings & Billing',
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

          {/* Phase 5: Daily Mission & Engagement Center */}
          {userProfile?.role !== 'instructor' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 font-['Sora'] animate-in fade-in duration-300">
              {/* Left Column: Daily Mission & Reward */}
              <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span>🎯 TODAY'S DAILY MISSION</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-450 mt-1 font-semibold">
                    Complete 3 challenges to protect your streak and earn bonus rewards.
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold font-mono text-slate-500 dark:text-zinc-400">
                    <span>PROGRESS</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {Math.min(3, dailyCompletedCount)} / 3 CHALLENGES
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-zinc-700/50">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, (dailyCompletedCount / 3) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Reward and Action Button */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-zinc-850">
                  <div className="text-xs">
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">REWARD</span>
                    <span className="font-black text-amber-500 flex items-center gap-1 mt-0.5">
                      ⚡ +30 XP BONUS
                    </span>
                  </div>

                  {dailyCompletedCount >= 3 ? (
                    isDailyClaimed ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        ✓ Reward Claimed (+30 XP)
                      </span>
                    ) : (
                      <button
                        onClick={handleClaimDailyReward}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl hover:shadow-lg transition-all active:scale-95 cursor-pointer uppercase font-mono"
                      >
                        🎁 CLAIM REWARD
                      </button>
                    )
                  ) : (
                    nextLessonData && !nextLessonData.completed && (
                      <button
                        onClick={handleContinueMission}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1 uppercase font-mono"
                      >
                        <span>Continue Mission →</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Right Column: Continue Learning & Streak Motivation */}
              <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
                {/* Streak Motivation details */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455 flex items-center justify-center border border-rose-100 dark:border-rose-800 shrink-0 font-extrabold text-xl">
                    🔥
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black tracking-wider uppercase text-rose-600 dark:text-rose-400 font-mono">
                      {currentStreak} DAY STREAK
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold leading-normal">
                      {dailyCompletedCount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">✓ Streak protected for today! Come back tomorrow to keep it going.</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">🔥 KEEP YOUR STREAK! Complete at least 1 challenge today.</span>
                      )}
                    </p>
                    {/* Milestone check */}
                    {currentStreak > 0 && (
                      <span className="inline-block text-[9px] font-black uppercase font-mono tracking-widest text-slate-400 mt-1">
                        🏆 MILESTONE REACHED: {currentStreak >= 30 ? '30' : currentStreak >= 14 ? '14' : currentStreak >= 7 ? '7' : '3'} DAYS
                      </span>
                    )}
                  </div>
                </div>

                {/* Continue Learning CTA */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-850 flex items-center justify-between gap-4">
                  {nextLessonData ? (
                    nextLessonData.completed ? (
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">🏆 KAIZEN MASTER</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-350">
                          All enrolled courses completed! Choose another course to continue.
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider block">🚀 CONTINUE LEARNING</span>
                          <span className="text-xs font-extrabold text-slate-850 dark:text-zinc-200 block truncate">
                            {nextLessonData.course?.title}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate">
                            {nextLessonData.module?.title.replace(/^\d+\s*:?\s*/, '')} • {nextLessonData.lesson?.title}
                          </span>
                        </div>
                        <button
                          onClick={handleContinueMission}
                          className="px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-850 dark:hover:bg-zinc-700 border border-slate-350 dark:border-zinc-700 text-slate-750 dark:text-zinc-200 font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer uppercase font-mono shrink-0"
                        >
                          Continue →
                        </button>
                      </>
                    )
                  ) : (
                    <div className="text-xs font-bold text-slate-400 italic">
                      No active courses. Browse catalog to enroll!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily Progress Cards Section */}
          {userProfile?.role !== 'instructor' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-['Sora']">
              <div className="p-5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800 text-base font-extrabold">
                  🎯
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 dark:text-zinc-550 font-extrabold uppercase font-mono tracking-wider block">TODAY'S CHALLENGES</span>
                  <span className="text-sm font-extrabold text-slate-850 dark:text-zinc-200">
                    {dailyCompletedCount} Completed
                  </span>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-800 text-base font-extrabold">
                  ⚡
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 dark:text-zinc-550 font-extrabold uppercase font-mono tracking-wider block">TODAY'S XP EARNED</span>
                  <span className="text-sm font-extrabold text-slate-850 dark:text-zinc-200">
                    +{todayXP} XP
                  </span>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-800 text-base font-extrabold">
                  🔥
                </div>
                <div>
                  <span className="text-[9px] text-slate-450 dark:text-zinc-550 font-extrabold uppercase font-mono tracking-wider block">STREAK VALUE</span>
                  <span className="text-sm font-extrabold text-slate-850 dark:text-zinc-200">
                    {currentStreak} Days
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gamification Achievements & Streak Summary Widget */}
          {userProfile?.role !== 'instructor' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 font-mono text-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                  <span>⚡ GAMIFICATION SUMMARY</span>
                </h3>
                <div className="flex gap-4 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="text-amber-500">⚡</span> {totalXP} XP</span>
                  <span className="flex items-center gap-1.5"><span className="text-rose-500">🔥</span> {currentStreak} Days Streak</span>
                  <span className="flex items-center gap-1.5"><span className="text-amber-400">🏆</span> {earnedBadgesCount} / 6 Badges</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {STATIC_BADGES.map(badge => {
                  const isUnlocked = earnedBadgesIds.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${
                        isUnlocked
                          ? 'bg-slate-950/40 border-cyan-500/40 text-white shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                          : 'bg-slate-950/10 border-slate-900/60 text-slate-600 opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        isUnlocked ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-950 text-slate-700'
                      }`}>
                        {isUnlocked ? '🏆' : '🔒'}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-tight truncate w-full font-sans">
                        {badge.name}
                      </div>
                      <div className="text-[8px] text-slate-500 font-sans leading-tight">
                        {badge.description}
                      </div>
                      <div className="text-[9px] font-bold mt-1">
                        {isUnlocked ? (
                          <span className="text-emerald-400">✓ Unlocked</span>
                        ) : (
                          <span className="text-slate-700">🔒 Locked</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI-Powered Semantic Search & Insights Section (Students Only) */}
          {userProfile?.role !== 'instructor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* AI Insights & Weakness Widget */}
              <div className="lg:col-span-8 bg-linear-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl shadow-indigo-900/20 space-y-5 relative overflow-hidden">
                {/* Decorative background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
                
                <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2 relative z-10">
                  <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                    <Bot className="w-5 h-5 text-indigo-300 animate-pulse" />
                  </div>
                  <span>AI Tutor Insights & Revisions</span>
                </h3>
                
                {weakTopics.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-200 font-medium leading-relaxed flex items-start gap-3 backdrop-blur-sm">
                      <span className="text-base mt-0.5">⚠️</span>
                      <p><strong>AI Diagnostics:</strong> We noticed you spent extra time on these topics. Revisit them with the AI Tutor to strengthen your foundation.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {weakTopics.slice(0, 2).map((wt, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 hover:bg-white/10 hover:border-indigo-400/50 transition-all backdrop-blur-xs group">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-sm text-indigo-100 group-hover:text-white transition-colors">{wt.topic}</span>
                            <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 font-mono shrink-0">
                              Score: {wt.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-indigo-200/70 leading-relaxed font-medium">{wt.struggleReason}</p>
                          <div className="text-[10px] font-bold text-emerald-300 pt-2 flex items-center gap-1.5 border-t border-white/5 mt-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Action: {wt.remedyAction}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 relative z-10 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                    <Bot className="w-8 h-8 text-indigo-400/50 mb-1" />
                    <p className="text-sm font-bold text-indigo-100">You're doing great!</p>
                    <p className="text-xs text-indigo-300/70 italic font-medium max-w-sm">Keep reading and taking quizzes. The AI Tutor will compile custom weak topic alerts here if you struggle.</p>
                  </div>
                )}
              </div>

              {/* AI Semantic Search Box */}
              <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderSearch className="w-5 h-5 text-indigo-500" />
                  <span>AI Semantic Course Search</span>
                </h3>
                <form onSubmit={handleAiSearch} className="flex gap-2">
                  <input
                    type="text"
                    value={aiSearchQuery}
                    onChange={(e) => setAiSearchQuery(e.target.value)}
                    placeholder="e.g. Learn how to manage users and access rights..."
                    className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-purple-600"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer">
                    Search
                  </button>
                </form>

                {isAiSearching && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 animate-pulse font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI reasoning matches...</span>
                  </div>
                )}

                {aiSearchResults.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">AI Recommended Matches</span>
                    {aiSearchResults.map(match => (
                      <Link
                        key={match.id}
                        to={`/course/${match.slug || match.id}`}
                        className="block p-2.5 bg-sky-50/50 dark:bg-zinc-800/80 border border-sky-100 dark:border-zinc-700 rounded-xl hover:border-sky-300 text-xs font-bold text-sky-800 dark:text-sky-400 transition-all truncate"
                      >
                        {match.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructor Mode: Student Roster & Profile Cards Widget */}
          {userProfile?.role === 'instructor' && (
            <div className="bg-white dark:bg-zinc-900 border border-sky-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5 font-['Sora']">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Enrolled Students & Learner Profiles</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                    Real-time student roster, profile pictures, academic progress, and learning telemetry.
                  </p>
                </div>
                <Link
                  to="/admin/students"
                  className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 transition-all w-fit cursor-pointer"
                >
                  <span>View Full Roster ({allStudents.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {allStudents.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">Loading enrolled students telemetry...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allStudents.slice(0, 6).map((student) => {
                    const isGithub = student.provider === 'github.com' || Boolean(student.photoURL?.includes('github')) || student.githubUsername;
                    return (
                      <div
                        key={student.id || student.uid}
                        className="p-4 rounded-2xl border border-sky-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 space-y-3 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Student Profile Image */}
                          <div className="relative shrink-0">
                            {student.photoURL ? (
                              <img
                                src={student.photoURL}
                                alt={student.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                            )}
                            {isGithub ? (
                              <span className="absolute -bottom-1 -right-1 text-xs" title="GitHub Account">🐱</span>
                            ) : (
                              <span className="absolute -bottom-1 -right-1 text-xs" title="Email Verified Student">✉️</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 truncate group-hover:text-blue-600">
                                {student.name}
                              </h4>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                {student.learningScore || 85}%
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{student.email}</p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                              {student.branch || 'AI Foundations'} • {student.year || '1st Year'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                            <span>Learning Telemetry</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{student.learningScore || 85}% Score</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                              style={{ width: `${student.learningScore || 85}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


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
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Continue Learning (Resume Exact Position)
                  </h3>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                        let totalLessons = 0;
                        if (course.modules) {
                          course.modules.forEach((m: any) => {
                            if (m.lessons) totalLessons += m.lessons.length;
                          });
                        }
                        if (totalLessons === 0 && course.syllabus && Array.isArray(course.syllabus)) {
                          totalLessons = course.syllabus.length;
                        }
                        if (totalLessons === 0) {
                          totalLessons = 15;
                        }
                        if (completedIds && completedIds.length > 0 && totalLessons > 0) {
                          if (completedIds.length >= totalLessons) {
                            dynamicProgress = 100;
                          } else {
                            dynamicProgress = Math.min(100, Math.round((completedIds.length / totalLessons) * 100));
                          }
                        }
                      }
                    } catch (e) {}

                    if (checkpoint && checkpoint.progressPercent >= 100) {
                      dynamicProgress = 100;
                    } else if (dynamicProgress === 0 || (checkpoint && checkpoint.progressPercent > dynamicProgress)) {
                      dynamicProgress = checkpoint?.progressPercent || dynamicProgress || course.progress || 0;
                    }

                    const lastModule = checkpoint ? checkpoint.lastModuleIdx + 1 : 1;
                    const lastSubtopicTitle = checkpoint?.lastSubtopicTitle || 'Kernel Architecture & Environment Setup';

                    return (
                      <div
                        key={course.id}
                        className="glass-card-light p-6 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-cyan-600 transition-all"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                              {course.category}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                                ✓ Paid (Active)
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Enrolled
                              </span>
                            </div>
                          </div>

                          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white leading-snug">
                            {course.title}
                          </h4>
                          
                          {/* Saved Resume Position Indicator */}
                          <div className="bg-sky-50 dark:bg-slate-950/80 border border-sky-200/80 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">Last Position: </span>
                              <span className="text-blue-700 dark:text-cyan-300 font-medium">Module {lastModule} ➔ {lastSubtopicTitle}</span>
                            </div>
                          </div>

                          {/* DYNAMIC: Module content progression layout with images */}
                          {course.modules && course.modules.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Course Modules Sequence</span>
                              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
                                {course.modules.map((mod: any, idx: number) => {
                                  // Determine visual status for the module
                                  const isActive = idx + 1 === lastModule;
                                  const isCompleted = idx + 1 < lastModule;
                                  return (
                                    <div key={idx} className={`shrink-0 w-[140px] rounded-xl overflow-hidden snap-start group relative border transition-all ${isActive ? 'border-blue-400 dark:border-cyan-400 shadow-md shadow-blue-500/10' : isCompleted ? 'border-emerald-200 dark:border-emerald-800/50 opacity-80' : 'border-slate-200 dark:border-slate-800 opacity-70'}`}>
                                      <div className="h-20 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                                        {mod.image || mod.imageUrl ? (
                                          <img src={mod.image || mod.imageUrl} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                          <div className={`w-full h-full flex items-center justify-center bg-linear-to-br ${isActive ? 'from-blue-500 to-indigo-600' : 'from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800'} group-hover:scale-105 transition-transform duration-500`}>
                                            <Layers className="w-6 h-6 text-white/50" />
                                          </div>
                                        )}
                                        <div className="absolute top-1 right-1">
                                          {isCompleted && <div className="bg-emerald-500 text-white rounded-full p-0.5"><CheckCircle2 className="w-3 h-3" /></div>}
                                          {isActive && <div className="bg-blue-600 dark:bg-cyan-600 text-white rounded-full px-1.5 py-0.5 text-[8px] font-bold">ACTIVE</div>}
                                        </div>
                                      </div>
                                      <div className={`p-2.5 ${isActive ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-slate-50 dark:bg-slate-950'}`}>
                                         <span className={`text-[9px] font-extrabold block mb-1 ${isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>MOD {idx + 1}</span>
                                         <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug" title={mod.title}>{mod.title}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            <span>Overall Track Completion</span>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600 dark:text-purple-400">{dynamicProgress}% Completed</span>
                              {dynamicProgress < 100 && (
                                <button
                                  onClick={async () => {
                                    const confirmApprove = window.confirm("Are you sure you want to mark this course track as 100% completed to claim your certificate?");
                                    if (!confirmApprove) return;
                                    
                                    const totalLessons = 31;
                                    const allIds = Array.from({ length: totalLessons }, (_, i) => `l_${i + 1}`);
                                    localStorage.setItem(`shaivika_completed_${course.id}`, JSON.stringify(allIds));
                                    
                                    courseService.saveCourseCheckpoint(course.id, {
                                      courseId: course.id,
                                      progressPercent: 100,
                                      lastModuleIdx: 14,
                                      lastLessonIdx: 0,
                                      lastSubtopicIdx: 0,
                                      lastSubtopicTitle: 'Course Completed',
                                      completedSubtopics: allIds,
                                      completedModules: Array.from({ length: 15 }, (_, i) => i),
                                      inProgressSubtopics: [],
                                      lastUpdated: new Date().toISOString(),
                                    }, activeUserId);
                                    
                                    const toastId = toast.loading("Marking track completed and triggering certificate compiling...");
                                    try {
                                      let token: string | null = null;
                                      if (user) {
                                        try {
                                          token = await user.getIdToken();
                                        } catch {}
                                      }
                                      
                                      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                                      if (token) headers['Authorization'] = `Bearer ${token}`;
                                      
                                      await fetch(`${API_BASE_URL}/certificates/complete-and-deliver`, {
                                        method: 'POST',
                                        headers,
                                        body: JSON.stringify({
                                          studentId: activeUserId,
                                          studentEmail: user?.email || 'shaivikagroups@gmail.com',
                                          studentName,
                                          courseId: course.id,
                                          courseName: course.title,
                                        }),
                                      });
                                      toast.success("🎉 Course track marked completed! Certificate is ready in the Certificates tab.", { id: toastId });
                                    } catch {
                                      toast.success("💾 Saved completion locally! Go to Certificates tab to view details.", { id: toastId });
                                    }
                                    
                                    setTimeout(() => window.location.reload(), 1000);
                                  }}
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-3xs"
                                  title="Mark this course as completed to claim certificate"
                                >
                                  Complete Track ⚡
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                              style={{ width: `${dynamicProgress}%` }}
                            />
                          </div>
                        </div>

                        {(() => {
                          const courseTitleClean = (course.title || '').toLowerCase().trim();
                          const courseSlugClean = (course.slug || '').toLowerCase().trim();
                          const courseIdStr = String(course.id || '');

                          const isCourseMatch = (lc: LiveClass) => {
                            const lcCourseId = String(lc.courseId || '').trim();
                            const lcCourseName = (lc.courseName || '').toLowerCase().trim();
                            const lcTitle = (lc.title || '').toLowerCase().trim();

                            if (lcCourseId && (lcCourseId === courseIdStr || (courseSlugClean && lcCourseId === courseSlugClean))) return true;
                            if (lcCourseName && courseTitleClean && (lcCourseName === courseTitleClean || lcCourseName.includes(courseTitleClean) || courseTitleClean.includes(lcCourseName))) return true;
                            if (lcTitle && courseTitleClean && (lcTitle.includes(courseTitleClean) || (courseTitleClean.length > 5 && lcTitle.includes(courseTitleClean.slice(0, 8))))) return true;
                            
                            // Keyword matching for specific tech stacks
                            const extractKeywords = (t: string) => {
                              const words = t.toLowerCase().split(/[^a-z0-9+#]+/);
                              return words.filter(w => ['react', 'python', 'java', 'c', 'cpp', 'cloud', 'aws', 'devops', 'cyber', 'security', 'linux', 'sql', 'git', 'docker', 'ai', 'data'].includes(w));
                            };
                            const courseKw = extractKeywords(courseTitleClean);
                            const lcKw = [...extractKeywords(lcCourseName), ...extractKeywords(lcTitle)];
                            if (courseKw.length > 0 && lcKw.length > 0) {
                              return courseKw.some(k => lcKw.includes(k));
                            }
                            return false;
                          };

                          // Filter live classes belonging specifically to THIS course
                          const courseLiveClasses = liveClasses.filter((lc) => isCourseMatch(lc));

                          // 1. Strictly LIVE NOW for this course
                          const liveClassNow = courseLiveClasses.find((lc) => normalizeLiveClassStatus(lc.status) === 'live');

                          // 2. Scheduled upcoming session for this course
                          const scheduledClass = courseLiveClasses.find((lc) => normalizeLiveClassStatus(lc.status) === 'scheduled');

                          // 3. Completed past sessions for this course
                          const completedClasses = courseLiveClasses.filter((lc) => normalizeLiveClassStatus(lc.status) === 'completed');

                          const isClassLiveNow = Boolean(liveClassNow);
                          const isClassScheduled = Boolean(scheduledClass);

                          const liveTargetUrl = liveClassNow
                            ? `/student/live-class/${liveClassNow.id}`
                            : scheduledClass
                            ? `/student/live-class/${scheduledClass.id}`
                            : completedClasses.length > 0
                            ? `/student/live-class/${completedClasses[0].id}`
                            : `/dashboard/live-classroom`;

                          return (
                            <div className="space-y-3 pt-1">
                              {/* 1. Dynamic Live Classroom Alert Strip when Live Now */}
                              {isClassLiveNow && liveClassNow && (
                                <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500/15 via-rose-500/10 to-red-500/15 dark:from-red-950/50 dark:via-rose-950/30 dark:to-red-950/50 border-2 border-red-500/40 dark:border-red-500/60 flex items-center justify-between gap-3 shadow-md shadow-red-500/10 animate-pulse">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-500/40">
                                      <Video className="w-4 h-4 text-white animate-pulse" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black uppercase tracking-wider text-white bg-red-600 px-2 py-0.5 rounded-md">
                                          LIVE CLASS IN SESSION
                                        </span>
                                      </div>
                                      <p className="text-xs font-heading font-black text-slate-900 dark:text-white truncate mt-0.5">
                                        {liveClassNow.title}
                                      </p>
                                      <p className="text-[10px] text-red-600 dark:text-red-300 font-semibold truncate">
                                        Instructor: {liveClassNow.instructorName || 'Lead Faculty'} • Live Hands-on
                                      </p>
                                    </div>
                                  </div>
                                  <Link
                                    to={liveTargetUrl}
                                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-500/30 flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer"
                                  >
                                    <span>Join</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              )}

                              {/* 2. Past Completed Sessions / Recordings Strip */}
                              {!isClassLiveNow && completedClasses.length > 0 && (
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Past Live Sessions ({completedClasses.length} completed)</span>
                                  </span>
                                  <Link
                                    to={liveTargetUrl}
                                    className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-extrabold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <span>Watch Recordings</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Link
                                  to={`/course/${course.slug || course.id}`}
                                  className="btn-blue-primary text-xs py-2.5 justify-center font-bold flex items-center gap-1.5 rounded-xl shadow-sm cursor-pointer"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  <span>Continue Track</span>
                                </Link>

                                <Link
                                  to={liveTargetUrl}
                                  className={`py-2.5 px-3 rounded-xl font-heading font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                                    isClassLiveNow
                                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400/50 hover:scale-102 active:scale-95 select-none animate-pulse'
                                      : isClassScheduled
                                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:scale-102 active:scale-95'
                                      : completedClasses.length > 0
                                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:scale-102 active:scale-95'
                                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 border border-slate-700 hover:scale-102 active:scale-95'
                                  }`}
                                >
                                  {isClassLiveNow ? (
                                    <>
                                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                      <Video className="w-4 h-4 text-white animate-pulse" />
                                      <span>🔴 Join Live Class (LIVE NOW)</span>
                                    </>
                                  ) : isClassScheduled ? (
                                    <>
                                      <Video className="w-4 h-4 text-sky-300" />
                                      <span>Live Classroom ({scheduledClass?.startTime ? new Date(scheduledClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Upcoming'})</span>
                                    </>
                                  ) : completedClasses.length > 0 ? (
                                    <>
                                      <Video className="w-4 h-4 text-emerald-400" />
                                      <span>Past Sessions & Recordings</span>
                                    </>
                                  ) : (
                                    <>
                                      <Video className="w-4 h-4 text-slate-400" />
                                      <span>Live Classroom</span>
                                    </>
                                  )}
                                </Link>
                              </div>
                            </div>
                          );
                        })()}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                      <span>Study Hours & AI Engagement</span>
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Real-Time
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>Hover over any bar to inspect daily study hours & AI prompt count</span>
                  </div>
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
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${weeklyChartData[hoveredDayIndex].isToday ? 'bg-emerald-500 animate-ping' : 'bg-purple-600'}`} />
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-zinc-100">
                          {weeklyChartData[hoveredDayIndex].fullDayName}, {weeklyChartData[hoveredDayIndex].formattedDate}
                        </span>
                        {weeklyChartData[hoveredDayIndex].isToday && (
                          <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Today • Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Study Time: <strong className="text-purple-600 dark:text-purple-400">{weeklyChartData[hoveredDayIndex].hours} hrs</strong> ({weeklyChartData[hoveredDayIndex].formattedDuration})</span>
                      </span>
                      <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI Mentorship: <strong className="text-indigo-600 dark:text-indigo-400">{weeklyChartData[hoveredDayIndex].aiPrompts} prompts</strong></span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Bars Grid */}
                <div className={`h-48 flex items-end justify-between ${chartTimeframe === '7d' ? 'gap-3 sm:gap-6 px-2' : 'gap-3 sm:gap-4 px-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-purple-200 dark:scrollbar-thumb-zinc-800'}`}>
                  {weeklyChartData.map((item, idx) => {
                    const isHovered = hoveredDayIndex === idx;
                    return (
                      <div
                        key={item.dateStr}
                        onMouseEnter={() => setHoveredDayIndex(idx)}
                        className={`flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer shrink-0 ${
                          chartTimeframe === '30d' ? 'w-[40px] sm:w-[48px]' : 'flex-1 max-w-[54px]'
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold transition-all duration-200 ${
                          isHovered 
                            ? 'text-purple-600 dark:text-purple-400 scale-110 font-black' 
                            : item.isToday
                            ? 'text-purple-600 dark:text-cyan-400 font-black'
                            : 'text-slate-400 dark:text-zinc-500'
                        }`}>
                          {item.hours}h
                        </span>

                        <div className={`w-full bg-slate-200/80 dark:bg-zinc-800/80 rounded-2xl h-full flex items-end p-1 transition-all overflow-hidden relative ${
                          item.isToday ? 'ring-2 ring-purple-500/50 dark:ring-cyan-500/50 shadow-md shadow-purple-500/10' : ''
                        }`}>
                          <div
                            className={`w-full rounded-xl transition-all duration-500 relative ${
                              isHovered
                                ? 'bg-gradient-to-t from-purple-600 via-indigo-600 to-sky-400 shadow-lg shadow-purple-500/30'
                                : item.isToday
                                ? 'bg-gradient-to-t from-purple-600 via-indigo-500 to-cyan-400 shadow-md shadow-purple-500/20 animate-pulse'
                                : 'bg-gradient-to-t from-purple-600/70 to-indigo-500/60 group-hover:from-purple-600 group-hover:to-indigo-500'
                            }`}
                            style={{ height: `${item.heightPercent}%` }}
                          >
                            {(isHovered || item.isToday) && (
                              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-bold transition-colors ${
                            isHovered 
                              ? 'text-purple-600 dark:text-purple-400 font-extrabold' 
                              : item.isToday 
                              ? 'text-purple-600 dark:text-cyan-300 font-extrabold' 
                              : 'text-slate-700 dark:text-zinc-300'
                          }`}>
                            {item.day}
                          </span>
                          <span className={`text-[9px] font-medium transition-colors ${
                            item.isToday ? 'text-purple-600 dark:text-cyan-400 font-bold' : 'text-slate-400 dark:text-zinc-500'
                          }`}>
                            {item.displayDate}
                          </span>
                          {item.isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-cyan-400 mt-0.5 animate-pulse" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC: Claimed Experience (XP) breakdown & logs */}
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-200/80 dark:border-amber-500/20 rounded-3xl p-6 space-y-4 shadow-xl shadow-amber-500/5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-slate-800/80 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-amber-500 fill-current animate-pulse" /> Claimed Experience (XP) breakdown & logs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify your live activity logs and claim history.</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Level</span>
                <span className="block font-heading font-extrabold text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 px-3 py-1 rounded-xl mt-0.5 shadow-xs">
                  Level {Math.floor(totalXP / 100) + 1}
                </span>
              </div>
            </div>

            {xpClaims.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">No XP points claimed yet. Start reading lessons or passing quizzes to earn points!</p>
            ) : (
              <div className="max-h-72 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {xpClaims.map((claim) => (
                  <div key={claim.id} className="p-3.5 bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 hover:border-amber-400/40 dark:hover:border-amber-500/30 transition-all duration-150 group">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-md font-mono border border-slate-300/40 dark:border-slate-700/60">
                          {claim.category}
                        </span>
                        {claim.courseTitle && (
                          <span className="text-[10px] font-semibold text-blue-600 dark:text-cyan-400 max-w-44 truncate" title={claim.courseTitle}>
                            {claim.courseTitle}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                        {claim.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700/60 px-2.5 py-1 rounded-lg font-mono shadow-xs">
                        +{claim.xp} XP
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-medium">
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
          <div className="p-6 rounded-3xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-4 shadow-3xs transition-colors">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Interactive Quiz Scores Gradebook</span>
            </h3>

            {gradedQuizzes.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                <FileCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">No quiz grades recorded yet</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium max-w-xs mx-auto">
                  Take a simulation quiz in student preview mode inside any course syllabus to record scores here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                      <th className="py-3.5 px-4">Quiz Name</th>
                      <th className="py-3.5 px-4">Course Track</th>
                      <th className="py-3.5 px-4">Attempt Date</th>
                      <th className="py-3.5 px-4">Scored Marks</th>
                      <th className="py-3.5 px-4">Grade Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {gradedQuizzes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{item.unit.title}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{item.courseTitle}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{item.scoreData.date}</td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">{item.scoreData.score} / {item.scoreData.total}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            item.scoreData.percentage >= 70
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
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
          <div className="space-y-8 animate-in fade-in duration-200 text-slate-800 dark:text-slate-100">
            
            {/* Header Description */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-3 shadow-xl border border-slate-800">
              <div className="flex items-center gap-3 select-none">
                <Award className="w-10 h-10 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white">Certificate Center</h3>
                  <p className="text-xs text-slate-400">ISO/IEC 27001 Authenticated Digital Course Credentials</p>
                </div>
              </div>
            </div>
            {/* Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Earned Certificates Left list */}
              <div className="lg:col-span-8 space-y-4">
                <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <span>Earned Digital Certificates ({earnedCerts.length})</span>
                </h4>

                {earnedCerts.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 space-y-2 py-12 bg-white dark:bg-slate-900/90 shadow-3xs max-w-lg">
                    <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">No Earned Certificates Yet</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xs mx-auto">
                      Complete 100% of any course syllabus, including mandatory quizzes and assignments, to unlock credentials.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {earnedCerts.map((cert) => (
                      <div key={cert.id} className="p-5 bg-white dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 rounded-2xl shadow-3xs flex flex-col justify-between space-y-4 transition-colors">
                        <div className="space-y-2">
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-fit">
                            Verified Graduate Pass
                          </span>
                          <h5 className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate" title={cert.courseTitle}>
                            {cert.courseTitle}
                          </h5>
                          <div className="space-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <div className="flex items-center justify-between">
                              <span>Certificate ID:</span>
                              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{cert.verificationId}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Issue Date:</span>
                              <span className="text-slate-900 dark:text-slate-200 font-semibold">{cert.completionDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-2">
                          <button
                            onClick={() => handleViewCertificate(cert)}
                            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-cyan-400 dark:text-white" />
                            <span>View Certificate</span>
                          </button>

                          {String(cert.verificationId).startsWith('KQ-') || cert.verificationId === 'KQ-CERT-MOCK-ID' ? (
                            <button
                              disabled
                              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
                            >
                              <Download className="w-4 h-4 text-slate-400" />
                              <span>Download PDF (Sync Pending)</span>
                            </button>
                          ) : (
                            <a
                              href={`${import.meta.env.VITE_API_URL || '/api'}/certificates/download?certificateId=${cert.verificationId}&studentId=${cert.studentId}&studentName=${encodeURIComponent(cert.studentName)}&courseTitle=${encodeURIComponent(cert.courseTitle)}&completionDate=${encodeURIComponent(cert.completionDate)}`}
                              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                              <span>Download PDF</span>
                            </a>
                          )}

                          {String(cert.verificationId).startsWith('KQ-') || cert.verificationId === 'KQ-CERT-MOCK-ID' ? (
                            <button
                              disabled
                              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                              <span>Verify Credential (Sync Pending)</span>
                            </button>
                          ) : (
                            <a
                              href={`${import.meta.env.VITE_API_URL || '/api'}/certificates/verify/${cert.verificationId}?studentId=${cert.studentId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer text-center"
                            >
                              <ExternalLink className="w-4 h-4 text-sky-500 dark:text-cyan-400" />
                              <span>Verify Credential</span>
                            </a>
                          )}
                          <a
                            href={`${API_BASE_URL}/certificates/download?certificateId=${cert.verificationId}&studentId=${cert.studentId}&studentName=${encodeURIComponent(cert.studentName)}&courseTitle=${encodeURIComponent(cert.courseTitle)}&completionDate=${encodeURIComponent(cert.completionDate)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                            <span>Download PDF</span>
                          </a>

                          <a
                            href={`/verify-certificate/${cert.verificationId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-heading font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer text-center"
                          >
                            <ExternalLink className="w-4 h-4 text-sky-500 dark:text-cyan-400" />
                            <span>Verify Credential</span>
                          </a>

                          {/* Share Credential Row */}
                          <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-left">Share Credential</span>
                            <div className="grid grid-cols-4 gap-2">
                              {/* LinkedIn Share */}
                              <button
                                onClick={() => handleShareToLinkedIn(cert)}
                                className="py-2 px-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-[#0A66C2] hover:text-white dark:hover:bg-[#0A66C2] text-[#0A66C2] border border-sky-100 dark:border-sky-900/60 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                title="Add to LinkedIn Profile"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                              </button>

                              {/* Twitter Share */}
                              <button
                                onClick={() => handleShareToTwitter(cert)}
                                className="py-2 px-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-slate-800 dark:text-slate-200 border border-sky-100 dark:border-sky-900/60 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                title="Share on X / Twitter"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              </button>

                              {/* GitHub Share */}
                              <button
                                onClick={() => handleShareToGitHub(cert)}
                                className="py-2 px-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-slate-800 dark:text-slate-200 border border-sky-100 dark:border-sky-900/60 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                title="Copy GitHub README Badge"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                                </svg>
                              </button>

                              {/* Copy Link */}
                              <button
                                onClick={() => handleCopyVerificationLink(cert)}
                                className="py-2 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-cyan-600 dark:hover:text-white text-slate-600 dark:text-slate-300 border border-slate-250 dark:border-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-3xs"
                                title="Copy Verification Link"
                              >
                                <Link2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In Progress / Expired sidebar Right */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* In Progress */}
                <div className="space-y-3.5">
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    In Progress Certifications
                  </h4>
                  
                  {inProgressCerts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No course tracks currently in progress.</p>
                  ) : (
                    <div className="space-y-3">
                      {inProgressCerts.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 shadow-3xs transition-colors">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                            <span className="truncate max-w-40 text-slate-700 dark:text-slate-300">{item.course.title}</span>
                            <span className="font-mono text-blue-600 dark:text-cyan-400 font-extrabold shrink-0">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 dark:bg-cyan-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expired Placeholder */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                    Renewal & Expiration Status
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start gap-2.5 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-semibold select-none">
                    <Award className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">Lifetime Verified Credential</span>
                      <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">All Shaivika AI Foundation credentials remain indefinitely valid and verifiable on the public ledger.</p>
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

      {/* ------------------- 10. LEADERBOARD TAB ------------------- */}
      {currentTab === 'leaderboard' && (
        <LeaderboardView />
      )}

      {/* ------------------- 11. ANALYTICS TAB ------------------- */}
      {currentTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {/* ------------------- 12. RESUME BUILDER TAB ------------------- */}
      {currentTab === 'resume-builder' && (
        <ResumeBuilder />
      )}

      {/* ------------------- 12B. DEVELOPER PORTFOLIO BUILDER TAB ------------------- */}
      {(currentTab === 'portfolio-builder' || currentTab === 'portfolio') && (
        <PortfolioBuilder />
      )}

      {/* ------------------- 13. CAREER ROADMAP TAB ------------------- */}
      {currentTab === 'career-roadmap' && (
        <CareerRoadmap />
      )}

      {/* ------------------- 14. PRACTICE HUB TAB ------------------- */}
      {currentTab === 'practice-hub' && (
        <PracticeHub />
      )}

      {/* ------------------- 15. INTERVIEW PREP TAB ------------------- */}
      {currentTab === 'interview-prep' && (
        <InterviewPrep />
      )}

      {/* ------------------- 16. LIVE CLASSROOM TAB ------------------- */}
      {currentTab === 'live-classroom' && (
        <StudentLiveClassroomSection />
      )}

      {/* ------------------- SETTINGS & BILLING TAB ------------------- */}
      {currentTab === 'settings' && (
        <SubscriptionSettings />
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
          className="fixed bottom-8 right-8 z-40 group flex items-center gap-3 px-5 py-3.5 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 text-white border-2 border-white/20 dark:border-zinc-700 hover:border-indigo-300 transition-all duration-300 cursor-pointer shadow-[0_8px_30px_rgb(99,102,241,0.4)] hover:shadow-[0_8px_40px_rgb(99,102,241,0.6)] hover:-translate-y-1 active:scale-95 select-none overflow-hidden"
          title="Open AI Tutor"
        >
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-white/20 w-[150%] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out skew-x-12" />
          
          <div className="relative flex items-center justify-center bg-white/10 p-1.5 rounded-full">
            <Bot className="w-5 h-5 text-indigo-50 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-heading font-bold tracking-wide relative z-10 pr-1">Ask AI Tutor</span>
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
          isModal={true}
        />
      )}



    </div>
  );
};
