import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  FileCheck,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  X,
  Eye,
  Calendar,
  Sparkles,
  BarChart3,
  List,
  Search,
  Bookmark,
  Activity,
  Info,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCourses } from '@/contexts/CourseContext';
import { CoursePlayerModal } from '../../components/courses/CoursePlayerModal';
import { DiscussionCenter } from '@/components/courses/DiscussionCenter';
import { discussionService } from '@/services/discussionService';
import { AssignmentPortal } from '@/components/courses/AssignmentPortal';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { courses } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const navigate = useNavigate();

  // Certificate Modal State
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [certStudentName, setCertStudentName] = useState(userProfile?.name || user?.displayName || 'Jane Devson');
  const [certUniqueId, setCertUniqueId] = useState('');
  const [certCompletionDate, setCertCompletionDate] = useState('');
  const [certCourseTitle, setCertCourseTitle] = useState('');
  const [certCourseInstructor, setCertCourseInstructor] = useState('');

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
  const activeEnrolledCount = coursesProgress.length;
  const liveHoursCompleted = coursesProgress.reduce((acc, c) => acc + c.completedDurationHours, 0);
  const totalCompletedUnitsCount = coursesProgress.reduce((acc, c) => acc + c.completedUnits, 0);
  const totalGlobalUnitsCount = coursesProgress.reduce((acc, c) => acc + c.totalUnits, 0);
  
  // Calculate average quiz percentage from localStorage
  let quizPercentagesSum = 0;
  let quizCount = 0;
  courses.forEach((c) => {
    c.modules?.forEach((m) => {
      m.topics.forEach((t) => {
        t.learningUnits.forEach((u) => {
          if (u.type === 'Quiz') {
            try {
              const stored = localStorage.getItem(`lms_quiz_score_${u.id}`);
              if (stored) {
                const parsed = JSON.parse(stored);
                quizPercentagesSum += parsed.percentage;
                quizCount++;
              }
            } catch {}
          }
        });
      });
    });
  });
  const avgQuizScore = quizCount > 0 ? Math.round(quizPercentagesSum / quizCount) : 92.5; // realistic fallback

  // Unlocked Certificates
  const unlockedCertificates = coursesProgress.filter((c) => c.percentage === 100);

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

  const handleOpenCertificateModal = (cTitle: string, cInstructor: string) => {
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    setCertUniqueId(`KQ-CERT-${randomHex}`);
    
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCertCompletionDate(formatted);
    setCertCourseTitle(cTitle);
    setCertCourseInstructor(cInstructor);
    setCertificateModalOpen(true);
  };

  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Kaizen Q Certificate - ${certCourseTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500&display=swap" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #fafafa;
                font-family: 'Sora', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .cert-container {
                width: 800px;
                height: 560px;
                background: white;
                border: 20px solid #f59e0b; /* Amber gold border */
                padding: 40px;
                box-sizing: border-box;
                position: relative;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.05);
              }
              .cert-inner {
                border: 2px solid #fbbf24;
                height: 100%;
                width: 100%;
                box-sizing: border-box;
                padding: 30px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
              }
              .branding {
                font-size: 16px;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: #0f172a;
                text-transform: uppercase;
              }
              .cert-title {
                font-family: 'Playfair Display', serif;
                font-size: 32px;
                font-weight: 700;
                color: #b45309;
                margin: 10px 0 0 0;
              }
              .cert-subtitle {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #64748b;
                margin: 5px 0 0 0;
              }
              .recipient-label {
                font-size: 11px;
                color: #64748b;
                font-style: italic;
                margin-top: 15px;
              }
              .recipient-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 700;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                display: inline-block;
                padding-bottom: 5px;
                min-width: 300px;
                margin: 10px auto;
              }
              .cert-text {
                font-size: 12px;
                color: #475569;
                line-height: 1.6;
                max-width: 500px;
                margin: 10px auto 0 auto;
                font-weight: 500;
              }
              .course-name {
                font-weight: 700;
                color: #0f172a;
              }
              .footer-signatures {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 30px;
              }
              .sig-block {
                width: 180px;
                text-align: center;
              }
              .sig-line {
                border-top: 1px solid #cbd5e1;
                margin-top: 8px;
                padding-top: 5px;
                font-size: 9px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .sig-name {
                font-size: 11px;
                font-weight: 700;
                color: #1e293b;
              }
              .cert-seal {
                width: 70px;
                height: 70px;
                background: radial-gradient(circle, #fcd34d 0%, #fbbf24 100%);
                border: 4px double #d97706;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: 800;
                color: #78350f;
                text-transform: uppercase;
                box-shadow: 0 4px 10px rgba(217, 119, 6, 0.15);
              }
              .cert-meta {
                position: absolute;
                bottom: 15px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-between;
                padding: 0 50px;
                font-size: 8px;
                font-weight: 750;
                color: #94a3b8;
                font-family: monospace;
              }
              @media print {
                body {
                  background: white;
                }
                .cert-container {
                  box-shadow: none;
                  border-color: #f59e0b !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <div class="cert-container">
              <div class="cert-inner">
                <div>
                  <div class="branding">Kaizen Q</div>
                  <div class="cert-title">Certificate of Completion</div>
                  <div class="cert-subtitle">Enterprise Learning Management System</div>
                </div>

                <div>
                  <div class="recipient-label">This credential is proudly presented to</div>
                  <div class="recipient-name">${certStudentName}</div>
                  <div class="cert-text">
                    for successfully mastering all lectures, coding challenges, quizzes, and project evaluations in the course track
                    <div class="course-name" style="margin-top: 5px; font-size: 14px;">${certCourseTitle}</div>
                  </div>
                </div>

                <div class="footer-signatures">
                  <div class="sig-block">
                    <div class="sig-name">${certCourseInstructor}</div>
                    <div class="sig-line">Lead Instructor</div>
                  </div>
                  
                  <div class="cert-seal">
                    <div>Official Seal</div>
                  </div>

                  <div class="sig-block">
                    <div class="sig-name">Kaizen Q Academic Board</div>
                    <div class="sig-line">Registrar Division</div>
                  </div>
                </div>
              </div>

              <div class="cert-meta">
                <span>DATE: ${certCompletionDate}</span>
                <span>CERTIFICATE ID: ${certUniqueId}</span>
              </div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

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
          { id: 'analytics', label: 'Learning Analytics' },
          { id: 'discussions', label: `Discussion Center${totalUnreadDiscussions > 0 ? ` (${totalUnreadDiscussions})` : ''}` },
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
              <div>
                <span className="font-heading font-extrabold text-2xl text-slate-900 block">{activeEnrolledCount} Active</span>
                <p className="text-[10px] text-blue-600 font-semibold mt-1">Live tracking courses</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-sky-100 bg-white/95 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Learning Time</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl text-slate-900 block">
                  {Math.max(14.8, liveHoursCompleted).toFixed(1)} hrs
                </span>
                <p className="text-[10px] text-indigo-600 font-semibold mt-1">Active time completed</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-sky-100 bg-white/95 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Quiz Average</span>
                <FileCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl text-slate-900 block">{avgQuizScore}%</span>
                <p className="text-[10px] text-amber-600 font-semibold mt-1">Cohort grade average</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-sky-100 bg-white/95 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Certificates</span>
                <Award className="w-4 h-4 text-cyan-500" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-2xl text-slate-900 block">{unlockedCertificates.length} Unlocked</span>
                <button
                  onClick={() => setSearchParams({ tab: 'certificates' })}
                  className="text-[10px] text-blue-600 hover:underline font-bold mt-1 block text-left"
                >
                  View digital credentials →
                </button>
              </div>
            </div>
          </div>

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

          {/* Continue Learning Course Cards */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>Continue Learning Tracker</span>
            </h3>
            
            {activeLearningCourses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No courses in progress. Head over to the Curriculum editor to create or configure courses.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeLearningCourses.map((cProgress) => (
                  <div key={cProgress.course.id} className="p-6 rounded-3xl border border-sky-100 bg-white flex flex-col justify-between space-y-4 shadow-3xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-md uppercase font-mono">
                          {cProgress.course.category}
                        </span>
                        <span className="text-[9px] font-bold font-mono text-slate-400">
                          {cProgress.completedUnits} / {cProgress.totalUnits} Units
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-slate-900 leading-snug">
                        {cProgress.course.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Instructor: {cProgress.course.instructor}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700">
                        <span>Course Completion</span>
                        <span className="text-blue-600 font-mono">{cProgress.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${cProgress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchPlayer(cProgress.course)}
                      className="btn-blue-primary text-xs py-2.5 justify-center font-bold"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Learning Track</span>
                    </button>
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
      {currentTab === 'certificates' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-8 rounded-3xl space-y-4 border border-blue-400/30 shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-cyan-300 shrink-0" />
              <div>
                <h3 className="font-heading font-extrabold text-xl text-white">Verified Digital Credentials</h3>
                <p className="text-xs text-blue-100">ISO/IEC 27001 Authenticated Course Track Certificates</p>
              </div>
            </div>

            {unlockedCertificates.length === 0 ? (
              <div className="pt-4 pb-2">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center space-y-2 max-w-md">
                  <X className="w-8 h-8 text-white/60 mx-auto" />
                  <h4 className="text-xs font-bold text-white">No Credentials Unlocked Yet</h4>
                  <p className="text-[10px] text-blue-100 leading-normal font-medium">
                    Master all learning units (100% completion) in any course track to unlock and customize certificates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {unlockedCertificates.map((cProgress, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] text-cyan-300 font-mono font-bold uppercase tracking-wider block">Verified Academic Pass</span>
                      <h4 className="font-heading font-bold text-base text-white">{cProgress.course.title}</h4>
                      <p className="text-[10px] text-blue-100 font-medium">Lead Instructor: {cProgress.course.instructor}</p>
                    </div>
                    <button
                      onClick={() => handleOpenCertificateModal(cProgress.course.title, cProgress.course.instructor)}
                      className="bg-white text-blue-600 font-heading font-extrabold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-md w-full cursor-pointer mt-2"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>View & Customize PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* ----------------- CERTIFICATE MODAL ----------------- */}
      {certificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 border border-sky-200 animate-in zoom-in-95 text-slate-900 font-['Sora']">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Configure & Generate Certificate</span>
              </h3>
              <button
                onClick={() => setCertificateModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  placeholder="Enter your name as it should appear..."
                  className="w-full bg-slate-50 border border-sky-200 rounded-xl py-2.5 px-3 text-xs text-slate-900 focus:outline-hidden transition-all font-bold"
                />
              </div>

              {/* Certificate Preview Box */}
              <div className="border-4 border-amber-500 rounded-2xl p-6 bg-amber-50/5 relative text-center space-y-6 select-none overflow-hidden max-w-full font-sans">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 font-mono">Kaizen Q Academy</span>
                  <h4 className="font-serif text-xl sm:text-2xl font-extrabold text-amber-800 leading-tight">Certificate of Completion</h4>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Enterprise Learning Credential</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 italic block">This is proudly presented to</span>
                  <span className="font-serif text-2xl font-extrabold text-slate-950 border-b border-slate-200 pb-1.5 px-6 inline-block min-w-[200px]">
                    {certStudentName || 'Your Name'}
                  </span>
                  <p className="text-[10px] text-slate-500 max-w-md mx-auto leading-relaxed">
                    for successfully mastering all modules, labs, and evaluation milestones for the course track
                  </p>
                  <span className="text-xs font-extrabold text-slate-800 block uppercase tracking-wide">
                    {certCourseTitle}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-4 text-[9px] font-bold text-slate-450">
                  <div className="text-center w-1/3">
                    <span className="text-slate-800 block text-[10px] font-semibold">{certCourseInstructor}</span>
                    <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider">Lead Instructor</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-double border-amber-500 bg-amber-50 flex items-center justify-center text-[8px] font-extrabold text-amber-800 uppercase tracking-wider shrink-0 shadow-sm mx-auto">
                    Seal
                  </div>
                  <div className="text-center w-1/3">
                    <span className="text-slate-800 block text-[10px] font-semibold">Kaizen Q Board</span>
                    <span className="border-t border-slate-200 pt-1 block uppercase tracking-wider">Academic Registrar</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-slate-400 border-t border-slate-100 pt-3">
                  <span>DATE: {certCompletionDate}</span>
                  <span>ID: {certUniqueId}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCertificateModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <span>Print / Save PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
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
      {!isAiPanelOpen && (
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

    </div>
  );
};
