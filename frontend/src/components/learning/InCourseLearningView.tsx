import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { LearningHeader } from './LearningHeader';
import { SidebarDrawer } from './SidebarDrawer';
import { LessonViewer } from './LessonViewer';
import type { LessonDetails } from './LessonViewer';
import type { ModuleData } from './ModuleAccordion';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { useCourseTimeTracker } from '@/hooks/useCourseTimeTracker';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { dbmsLessonsData } from '@/data/dbmsLessonsData';
import { LazyViewport } from './LazyViewport';
import { ModulesTab } from './ModulesTab';

const RightSidebar = lazy(() => import('./RightSidebar').then(m => ({ default: m.RightSidebar })));
const AIQuizPortal = lazy(() => import('../courses/AIQuizPortal').then(m => ({ default: m.AIQuizPortal })));
const AITutorDrawer = lazy(() => import('./AITutorDrawer').then(m => ({ default: m.AITutorDrawer })));
import { CertificatePreviewModal } from '../courses/CertificatePreviewModal';
import { CertificateService } from '@/services/achievementService';
import { assignmentService } from '@/services/assignmentService';

const SidebarSkeleton = () => (
  <aside className="w-full lg:w-80 shrink-0 space-y-6 animate-pulse">
    <div className="h-40 bg-slate-900/60 rounded-3xl border border-slate-800" />
    <div className="h-60 bg-slate-900/60 rounded-3xl border border-slate-800" />
  </aside>
);

const QuizPortalSkeleton = () => (
  <div className="w-full min-h-75 bg-slate-950/60 rounded-3xl p-6 border border-slate-800 animate-pulse space-y-4">
    <div className="h-6 w-48 bg-slate-900 rounded-lg" />
    <div className="h-4 w-full bg-slate-900 rounded-md" />
    <div className="h-20 bg-slate-900 rounded-xl" />
    <div className="h-10 w-32 bg-purple-900/40 rounded-xl" />
  </div>
);

export function calculateEstimatedDuration(content: string, commandCount: number = 0): string {
  if (!content) return '5 mins';
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`!\[\]()>-]/g, ' ');
  const words = cleanContent.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const readingMinutes = Math.ceil(words / 180);
  const practiceMinutes = commandCount * 1;
  const totalMinutes = Math.max(3, readingMinutes + practiceMinutes);
  return `${totalMinutes} mins`;
}

export function extractPracticeCommands(courseTitle: string, _lessonTitle: string, content: string): Array<{ command: string; description: string }> {
  const courseLower = courseTitle.toLowerCase();
  const codeBlockRegex = /```(?:bash|sh|sql|python|java|javascript|tsx|jsx)?\n([\s\S]*?)\n```/g;
  const found: Array<{ command: string; description: string }> = [];
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const block = match[1].trim();
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//') && !l.startsWith('--'));
    lines.forEach(line => {
      if (found.length < 5 && !found.some(item => item.command === line)) {
        found.push({ command: line, description: `Execute ${line}` });
      }
    });
  }
  
  if (found.length > 0) return found;

  if (courseLower.includes('git')) {
    return [
      { command: 'git status', description: 'Check status of files' },
      { command: 'git log --oneline', description: 'View linear commit history' },
      { command: 'git branch', description: 'List local branches' }
    ];
  } else if (courseLower.includes('database') || courseLower.includes('sql') || courseLower.includes('dbms')) {
    return [
      { command: 'SHOW TABLES;', description: 'List all active tables' },
      { command: 'SELECT * FROM users;', description: 'Query user accounts' }
    ];
  } else if (courseLower.includes('python')) {
    return [
      { command: 'print("Hello Python")', description: 'Run stdout command' }
    ];
  } else if (courseLower.includes('java')) {
    return [
      { command: 'System.out.println("Hello Java");', description: 'Standard stdout print' }
    ];
  } else {
    return [
      { command: 'pwd', description: 'Print working directory' },
      { command: 'whoami', description: 'Print active username' },
      { command: 'ls -la', description: 'List all files in details' }
    ];
  }
}

export function generateDynamicResources(courseTitle: string, _lessonTitle: string, lessonResources?: any[]): Array<{ title: string; url: string }> {
  if (lessonResources && lessonResources.length > 0) {
    return lessonResources.map(r => ({
      title: r.title || r.name || 'Resource Link',
      url: r.url || r.fileUrl || '#'
    }));
  }
  
  const courseLower = courseTitle.toLowerCase();
  if (courseLower.includes('git')) {
    return [
      { title: 'Official Git Documentation', url: 'https://git-scm.com/doc' },
      { title: 'GitHub Cheatsheet (PDF)', url: 'https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf' }
    ];
  } else if (courseLower.includes('database') || courseLower.includes('sql') || courseLower.includes('dbms')) {
    return [
      { title: 'W3Schools SQL Tutorial Reference', url: 'https://www.w3schools.com/sql/' },
      { title: 'PostgreSQL Cheat Sheet', url: 'https://www.postgresqltutorial.com/postgresql-cheat-sheet/' }
    ];
  } else if (courseLower.includes('python')) {
    return [
      { title: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/index.html' },
      { title: 'Python Cheat Sheet', url: 'https://perso.limsi.fr/pointal/_media/python:cours:memento_v2_refcard.pdf' }
    ];
  } else if (courseLower.includes('java')) {
    return [
      { title: 'Oracle Java Tutorials', url: 'https://docs.oracle.com/javase/tutorial/' },
      { title: 'Java Cheatsheet (PDF)', url: 'https://www.cheat-sheets.org/saved-copy/java-cheat-sheet-v2.pdf' }
    ];
  } else if (courseLower.includes('react')) {
    return [
      { title: 'Official React Documentation', url: 'https://react.dev' },
      { title: 'React Cheatsheet', url: 'https://devhints.io/react' }
    ];
  } else {
    return [
      { title: 'Official Linux Kernel Documentation', url: 'https://www.kernel.org/doc/html/latest/' },
      { title: 'GNU Coreutils Reference Manual', url: 'https://www.gnu.org/software/coreutils/manual/' }
    ];
  }
}

export function generateDynamicDownloads(courseTitle: string, lessonTitle: string) {
  const courseLower = courseTitle.toLowerCase();
  const titleSlug = lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  
  if (courseLower.includes('git')) {
    return [
      { title: 'Download Git Cheat Sheet', url: '#', filename: 'git_cheat_sheet.pdf', size: '1.2 MB' },
      { title: 'Download Starter Code (ZIP)', url: '#', filename: `${titleSlug}_starter.zip`, size: '4.8 MB' }
    ];
  } else if (courseLower.includes('database') || courseLower.includes('sql') || courseLower.includes('dbms')) {
    return [
      { title: 'Download SQL Practice Schema', url: '#', filename: 'dbms_practice_schema.sql', size: '240 KB' },
      { title: 'Download Database Design Guide (PDF)', url: '#', filename: 'db_design_patterns.pdf', size: '2.5 MB' }
    ];
  } else if (courseLower.includes('python')) {
    return [
      { title: 'Download Python Reference Sheet', url: '#', filename: 'python_quick_reference.pdf', size: '920 KB' }
    ];
  } else if (courseLower.includes('java')) {
    return [
      { title: 'Download Java Reference Guide', url: '#', filename: 'java_reference_guide.pdf', size: '1.4 MB' }
    ];
  } else if (courseLower.includes('react')) {
    return [
      { title: 'Download React cheatsheet', url: '#', filename: 'react_cheatsheet.pdf', size: '850 KB' }
    ];
  } else {
    return [
      { title: 'Download Linux Command Reference', url: '#', filename: 'linux_commands_reference.pdf', size: '1.8 MB' }
    ];
  }
}

interface InCourseLearningViewProps {
  courseTitle: string;
  courseId: string | number;
  modules: ModuleData[];
  onBackToCourseDetails: () => void;
  userAvatar?: string;
  userName?: string;
}

export const InCourseLearningView: React.FC<InCourseLearningViewProps> = ({
  courseTitle,
  courseId,
  modules,
  onBackToCourseDetails,
  userAvatar: propAvatar,
  userName: propName,
}) => {
  const { user, userProfile } = useAuth();
  useCourseTimeTracker(String(courseId));
  const userAvatar = propAvatar || userProfile?.photoURL || user?.photoURL || undefined;
  const userName = propName && propName !== 'Student' ? propName : (userProfile?.name || user?.displayName || userProfile?.githubUsername || 'Student User');
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shaivika_reading_mode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return true; // Default to Reading Mode on enter!
  });

  useEffect(() => {
    try {
      localStorage.setItem('shaivika_reading_mode', JSON.stringify(isNightMode));
    } catch (e) {}
  }, [isNightMode]);

  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shaivika_right_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shaivika_right_sidebar_collapsed', JSON.stringify(isRightSidebarCollapsed));
    } catch (e) {}
  }, [isRightSidebarCollapsed]);

  const isGitCourse = courseTitle.toLowerCase().includes('git');

  const allLessons = useMemo(() => {
    return modules.flatMap((mod) => mod.lessons);
  }, [modules]);

  const [completedLessonIds, setCompletedLessonIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string | number>(() => {
    try {
      const lastActive = localStorage.getItem(`shaivika_last_active_${courseId}`);
      if (lastActive) return lastActive;
    } catch {}

    try {
      const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
      const completedIds: (string | number)[] = saved ? JSON.parse(saved) : [];
      const firstUncompleted = allLessons.find(l => !completedIds.includes(l.id));
      if (firstUncompleted) return firstUncompleted.id;
    } catch {}

    return allLessons[0]?.id || 101;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState('modules');
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<any>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(`shaivika_bookmarks_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (selectedLessonId) {
      try {
        localStorage.setItem(`shaivika_last_active_${courseId}`, String(selectedLessonId));
      } catch {}
    }
    setScrollProgress(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedLessonId, courseId]);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const totalHeight = container.scrollHeight - container.clientHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const scrolled = (container.scrollTop / totalHeight) * 100;
      setScrollProgress(scrolled);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [selectedLessonId]);

  useEffect(() => {
    try {
      localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(completedLessonIds));
    } catch (err) {
      console.error('Failed to save completion state', err);
    }
  }, [completedLessonIds, courseId]);

  // Fully automated certificate generator trigger
  useEffect(() => {
    let active = true;

    const checkAndTrigger = () => {
      // 1. Course Progress = 100% and All lessons done
      const allCourseLessonsDone = allLessons.length > 0 && allLessons.every((l) =>
        completedLessonIds.some((cId) => String(cId) === String(l.id))
      );
      if (!allCourseLessonsDone) return;

      // 2. All Quizzes Passed & All Assignments Submitted
      const quizUnits: any[] = [];
      const assignmentUnits: any[] = [];
      modules.forEach((mod) => {
        mod.lessons?.forEach((lesson) => {
          const typeLower = (lesson.type || '').toLowerCase();
          if (typeLower === 'quiz') quizUnits.push(lesson);
          else if (typeLower === 'assignment') assignmentUnits.push(lesson);
        });
      });

      const studentUid = user?.uid || userProfile?.uid || 'default_student';

      const allQuizzesPassed = quizUnits.every((quiz) => {
        const scoreDataRaw = localStorage.getItem(`lms_quiz_score_${quiz.id}`);
        if (!scoreDataRaw) return false;
        try {
          const scoreData = JSON.parse(scoreDataRaw);
          const passingScore = (quiz as any).quizPassingScore || 60;
          return scoreData.percentage >= passingScore;
        } catch {
          return false;
        }
      });

      const allAssignmentsSubmitted = assignmentUnits.every((assignment) => {
        const submission = assignmentService.getStudentSubmission(assignment.id, studentUid);
        return submission && ['Submitted', 'Under Review', 'Graded'].includes(submission.status);
      });

      const isEligible = allQuizzesPassed && allAssignmentsSubmitted;
      if (!isEligible) return;

      // 3. Check if certificate is already generated
      const certService = new CertificateService();
      const existingCerts = certService.getCertificates(studentUid);
      const alreadyGenerated = existingCerts.some(c => String(c.courseId) === String(courseId));
      if (alreadyGenerated) return;

      if (!active) return;
      
      setIsGeneratingCert(true);
      const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
      const studentId = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104');
      const studentName = userName;

      // Extract synced completed modules list
      const completedModules = modules.filter(mod => 
        mod.lessons?.every(l => completedLessonIds.some(cId => String(cId) === String(l.id)))
      ).map(mod => String(mod.id));

      // Extract synced quiz scores
      const quizScores = quizUnits.map(q => {
        const scoreDataRaw = localStorage.getItem(`lms_quiz_score_${q.id}`);
        if (!scoreDataRaw) return null;
        try {
          const scoreData = JSON.parse(scoreDataRaw);
          return { quizId: String(q.id), percentage: Number(scoreData.percentage) };
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Extract synced assignment submissions
      const assignmentSubmissions = assignmentUnits.map(a => {
        const submission = assignmentService.getStudentSubmission(a.id, studentUid);
        return submission ? { assignmentId: String(a.id), status: submission.status } : null;
      }).filter(Boolean);

      // Sync state to backend before generation trigger
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/sync-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          courseId: String(courseId),
          completedLessons: completedLessonIds.map(String),
          completedModules,
          quizScores,
          assignmentSubmissions,
        }),
      })
      .then(() => {
        return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/complete-and-deliver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            studentName,
            studentEmail,
            courseId: String(courseId),
            courseTitle,
            completionPercentage: 100,
            instructorName: 'Shaivika Groups Board',
            courseDuration: '24 Hours',
            modulesCount: modules.length || 8,
            forceRegenerate: true
          }),
        });
      })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setIsGeneratingCert(false);
        if (data.success) {
          setGeneratedCert(data);
          try {
            certService.saveExternalCertificate(studentUid, {
              id: data.id || `cert_${courseId}_${Date.now()}`,
              courseId: String(courseId),
              courseTitle: data.courseTitle || courseTitle,
              studentName: data.studentName || userName,
              studentId: data.studentId || studentId,
              instructorName: 'Shaivika Groups Board',
              completionDate: data.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              verificationId: data.certificateId,
              courseDuration: '24 Hours',
              modulesCount: modules.length || 8,
              googleDriveLink: data.googleDriveLink,
            });
          } catch (saveErr) {
            console.warn('Error saving server certificate to local storage:', saveErr);
          }
          toast.success(`🎓 Official Certificate Generated & Delivered to ${studentEmail}! (Check Inbox)`);
          setShowCongrats(true);
        } else {
          toast.error(data.error || 'Failed to generate certificate.');
        }
      })
      .catch((err) => {
        if (active) setIsGeneratingCert(false);
        console.error('Automated Certificate Delivery error:', err);
      });
    };

    checkAndTrigger();
    const interval = setInterval(checkAndTrigger, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [completedLessonIds, user, userProfile, userName, courseId, courseTitle, modules, allLessons]);

  useEffect(() => {
    try {
      localStorage.setItem(`shaivika_bookmarks_${courseId}`, JSON.stringify(bookmarkedLessonIds));
    } catch (err) {
      console.error('Failed to save bookmark state', err);
    }
  }, [bookmarkedLessonIds, courseId]);

  const activeIndex = useMemo(() => {
    return allLessons.findIndex((l) => String(l.id) === String(selectedLessonId));
  }, [allLessons, selectedLessonId]);

  const currentLessonData = activeIndex !== -1 ? allLessons[activeIndex] : allLessons[0];
  const hasPrevLesson = activeIndex > 0;
  const hasNextLesson = activeIndex < allLessons.length - 1;

  const isLessonUnlocked = useCallback((lessonId: string | number): boolean => {
    const modIdx = modules.findIndex((m) =>
      m.lessons.some((l) => String(l.id) === String(lessonId))
    );
    if (modIdx <= 0) return true;

    const prevMod = modules[modIdx - 1];
    return prevMod ? prevMod.lessons.every((l) =>
      completedLessonIds.some((id) => String(id) === String(l.id))
    ) : true;
  }, [modules, completedLessonIds]);

  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson) {
      setSelectedLessonId(allLessons[activeIndex - 1].id);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [hasPrevLesson, allLessons, activeIndex]);

  const handleNextLesson = useCallback(() => {
    if (hasNextLesson) {
      const isCurrentCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));
      if (!isCurrentCompleted) {
        toast.warning(
          `🔒 XP Reward Pending! Please click "⚡ Claim +50 XP" to claim your XP before continuing to the next lesson!`
        );
        return;
      }

      const nextLesson = allLessons[activeIndex + 1];
      if (!isLessonUnlocked(nextLesson.id)) {
        const currentMod = modules.find((m) =>
          m.lessons.some((l) => String(l.id) === String(selectedLessonId))
        );
        const nextMod = modules.find((m) =>
          m.lessons.some((l) => String(l.id) === String(nextLesson.id))
        );
        toast.warning(
          `🔒 Module Locked! Complete all lessons in "${currentMod?.title || 'Current Module'}" & claim XP rewards first to unlock "${nextMod?.title || 'Next Module'}"!`
        );
        return;
      }
      setSelectedLessonId(nextLesson.id);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [hasNextLesson, completedLessonIds, selectedLessonId, allLessons, activeIndex, modules, isLessonUnlocked]);

  const activeLessonFull = useMemo((): LessonDetails => {
    if (!currentLessonData) {
      return {
        id: 101,
        title: 'Introduction',
        duration: '15 mins',
        type: 'reading',
        badge: 'Module 1 • Lesson 1',
        content: 'Loading lesson details...',
        commands: [],
        resources: []
      };
    }

    const currentAny = currentLessonData as any;
    const isDbms = courseTitle.toLowerCase().includes('database') || courseTitle.toLowerCase().includes('dbms') || courseTitle.toLowerCase().includes('sql');

    let contentStr = currentAny.content || currentAny.readingContent || currentAny.description || 'Welcome to this lesson.';
    let initialCommands = currentAny.commands || [];
    let initialResources = currentAny.resources || [];

    if (isDbms) {
      const foundInDbms = dbmsLessonsData[String(currentLessonData.id)];
      if (foundInDbms) {
        contentStr = foundInDbms.content;
        if (foundInDbms.commands) initialCommands = foundInDbms.commands;
        if (foundInDbms.resources) initialResources = foundInDbms.resources;
      }
    }

    const autoDuration = calculateEstimatedDuration(contentStr, initialCommands.length || 0);

    const generatedCommands = initialCommands.length > 0
      ? initialCommands
      : extractPracticeCommands(courseTitle, currentLessonData.title, contentStr);

    const generatedResources = initialResources.length > 0
      ? initialResources
      : generateDynamicResources(courseTitle, currentLessonData.title, initialResources);

    const generatedDownloads = generateDynamicDownloads(courseTitle, currentLessonData.title);

    return {
      id: currentLessonData.id,
      title: currentLessonData.title,
      duration: currentLessonData.duration || autoDuration,
      type: currentLessonData.type || 'reading',
      badge: currentAny.badge || `Lesson ${currentLessonData.id}`,
      content: contentStr,
      commands: generatedCommands,
      resources: generatedResources,
      downloads: generatedDownloads,
    } as any;
  }, [currentLessonData, courseTitle]);

  const handleToggleComplete = useCallback(() => {
    if (!completedLessonIds.some((id) => String(id) === String(selectedLessonId))) {
      const updated = [...completedLessonIds, selectedLessonId];
      setCompletedLessonIds(updated);

      const activeUserId = user?.uid || 'default_student';

      // 1. Award +50 XP for completing lesson
      const earnedXP = 50;
      courseService.addXPPoints(earnedXP, activeUserId);
      courseService.addXPClaim(
        {
          id: `claim_${Date.now()}`,
          title: `Completed ${activeLessonFull.title}`,
          xp: earnedXP,
          category: 'Subtopic Completion',
          timestamp: new Date().toISOString(),
          courseId: String(courseId),
          courseTitle: courseTitle,
        },
        activeUserId
      );

      // 2. Check if completing this lesson completes a full module
      const currentModule = modules.find((m) =>
        m.lessons.some((l) => String(l.id) === String(selectedLessonId))
      );
      if (currentModule) {
        const moduleLessonIds = currentModule.lessons.map((l) => String(l.id));
        const allModuleDone = moduleLessonIds.every((id) =>
          updated.some((cId) => String(cId) === id)
        );
        if (allModuleDone) {
          const bonusXP = 100;
          courseService.addXPPoints(bonusXP, activeUserId);
          courseService.addXPClaim(
            {
              id: `claim_mod_${Date.now()}`,
              title: `🎉 Module Mastered: ${currentModule.title}`,
              xp: bonusXP,
              category: 'Module Completion Bonus',
              timestamp: new Date().toISOString(),
              courseId: String(courseId),
              courseTitle: courseTitle,
            },
            activeUserId
          );
          toast.success(`🏆 Module Bonus! Earned +100 XP for completing ${currentModule.title}!`);
        }
      }

      // 3. Check if all lessons in the course are completed (100% Course Completion)
      const allCourseLessonsDone = allLessons.every((l) =>
        updated.some((cId) => String(cId) === String(l.id))
      );

      if (allCourseLessonsDone) {
        setShowCongrats(true);
        setIsGeneratingCert(true);
        const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
        const studentId = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104');
        const studentName = userName;

        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/complete-and-deliver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            studentName,
            studentEmail,
            courseId: String(courseId),
            courseTitle,
            completionPercentage: 100,
            instructorName: 'Shaivika Groups Board',
            courseDuration: '24 Hours',
            modulesCount: modules.length || 8,
            forceRegenerate: true
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setIsGeneratingCert(false);
            if (data.success) {
              setGeneratedCert(data);
              try {
                const certService = new CertificateService();
                certService.saveExternalCertificate(user?.uid || userProfile?.uid || 'default_student', {
                  id: data.id || `cert_${courseId}_${Date.now()}`,
                  courseId: String(courseId),
                  courseTitle: data.courseTitle || courseTitle,
                  studentName: data.studentName || userName,
                  studentId: data.studentId || studentId,
                  instructorName: 'Shaivika Groups Board',
                  completionDate: data.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  verificationId: data.certificateId,
                  courseDuration: '24 Hours',
                  modulesCount: modules.length || 8,
                  googleDriveLink: data.googleDriveLink,
                });
              } catch (saveErr) {
                console.warn('Error saving server certificate to local storage:', saveErr);
              }
              toast.success(`🎓 Official Certificate Generated & Delivered to ${studentEmail}! (Check Google Drive & Inbox)`);
            } else {
              toast.error('Failed to auto-deliver certificate via email.');
            }
          })
          .catch((err) => {
            setIsGeneratingCert(false);
            console.error('Automated Certificate Delivery error:', err);
            toast.error('Could not connect to certificate delivery service.');
          });
      }

      toast.success(`🎉 Lesson complete! +50 XP awarded.`);
    }
  }, [completedLessonIds, selectedLessonId, user, userProfile, userName, activeLessonFull.title, courseId, courseTitle, modules, allLessons]);

  const handleToggleBookmark = useCallback(() => {
    if (bookmarkedLessonIds.some((id) => String(id) === String(selectedLessonId))) {
      setBookmarkedLessonIds((prev) => prev.filter((id) => String(id) !== String(selectedLessonId)));
      toast.info('Bookmark removed.');
    } else {
      setBookmarkedLessonIds((prev) => [...prev, selectedLessonId]);
      toast.success('Lesson bookmarked successfully!');
    }
  }, [bookmarkedLessonIds, selectedLessonId]);

  const validCompletedCount = completedLessonIds.filter(id => allLessons.some(l => String(l.id) === String(id))).length;
  const progressPercent = allLessons.length > 0 ? Math.min(100, Math.round((validCompletedCount / allLessons.length) * 100)) : 0;
  const isCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isBookmarked = bookmarkedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isCourseFullyCompleted = allLessons.length > 0 && allLessons.every((l) =>
    completedLessonIds.some((cId) => String(cId) === String(l.id))
  );

  const studentUid = user?.uid || userProfile?.uid || 'default_student';
  const certService = useMemo(() => new CertificateService(), []);
  const currentCert = useMemo(() => {
    const certs = certService.getCertificates(studentUid);
    return certs.find((c) => String(c.courseId) === String(courseId)) || null;
  }, [certService, studentUid, courseId, generatedCert]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-60 font-sans flex flex-col overflow-y-auto transition-colors duration-300 ${
        isNightMode
          ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
          : 'bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white'
      }`}
    >
      <LearningHeader
        courseTitle={courseTitle}
        currentCert={currentCert}
        lessonTitle={activeLessonFull.title}
        progressPercent={progressPercent}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onPrevLesson={handlePrevLesson}
        onNextLesson={handleNextLesson}
        hasPrevLesson={hasPrevLesson}
        hasNextLesson={hasNextLesson}
        onBackToCourseDetails={onBackToCourseDetails}
        userAvatar={userAvatar}
        userName={userName}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        isCourseFullyCompleted={isCourseFullyCompleted}
        onViewCertificate={() => {
          // If certificate hasn't been generated yet, let's fetch it, otherwise open modal
          setShowCongrats(true);
          if (!generatedCert && !isGeneratingCert) {
            setIsGeneratingCert(true);
            const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
            const studentId = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104');
            const studentName = userName;

            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/complete-and-deliver`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId,
                studentName,
                studentEmail,
                courseId: String(courseId),
                courseTitle,
                completionPercentage: 100,
                instructorName: 'Shaivika Groups Board',
                courseDuration: '24 Hours',
                modulesCount: modules.length || 8,
                forceRegenerate: true
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                setIsGeneratingCert(false);
                if (data.success) {
                  setGeneratedCert(data);
                  try {
                    const certService = new CertificateService();
                    certService.saveExternalCertificate(user?.uid || userProfile?.uid || 'default_student', {
                      id: data.id || `cert_${courseId}_${Date.now()}`,
                      courseId: String(courseId),
                      courseTitle: data.courseTitle || courseTitle,
                      studentName: data.studentName || userName,
                      studentId: data.studentId || studentId,
                      instructorName: 'Shaivika Groups Board',
                      completionDate: data.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                      verificationId: data.certificateId,
                      courseDuration: '24 Hours',
                      modulesCount: modules.length || 8,
                      googleDriveLink: data.googleDriveLink,
                    });
                  } catch (saveErr) {
                    console.warn('Error saving server certificate to local storage:', saveErr);
                  }
                }
              })
              .catch(() => {
                setIsGeneratingCert(false);
              });
          }
        }}
      />
      {/* Scroll Progress Bar */}
      <div className="w-full h-0.75 bg-slate-800/10 shrink-0">
        <div
          className={`h-full transition-all duration-75 ${
            isNightMode ? 'bg-linear-to-r from-cyan-400 to-blue-500' : 'bg-linear-to-r from-sky-500 to-indigo-600'
          }`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        courseTitle={courseTitle}
        modules={modules}
        selectedLessonId={selectedLessonId}
        completedLessonIds={completedLessonIds}
        onSelectLesson={(id) => {
          if (!isLessonUnlocked(id)) {
            const targetMod = modules.find((m) =>
              m.lessons.some((l) => String(l.id) === String(id))
            );
            const modIdx = modules.findIndex((m) =>
              m.lessons.some((l) => String(l.id) === String(id))
            );
            const prevMod = modIdx > 0 ? modules[modIdx - 1] : null;
            toast.warning(
              `🔒 Module Locked! Complete all lessons in "${prevMod?.title || 'Previous Module'}" & claim XP rewards first to unlock "${targetMod?.title || 'Next Module'}"!`
            );
            return;
          }
          setSelectedLessonId(id);
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        progressPercent={progressPercent}
        activeCourseTab={activeCourseTab}
        onSelectCourseTab={(tabKey) => {
          setActiveCourseTab(tabKey);
          if (tabKey === 'overview') {
            onBackToCourseDetails();
          }
        }}
        isNightMode={isNightMode}
      />

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col xl:flex-row gap-8 relative z-10">
        {/* Docked Left Sidebar for Desktop: Modules & Lessons */}
        {!isDesktopSidebarCollapsed && (
          <aside className={`hidden xl:block w-80 shrink-0 rounded-3xl border p-4 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto transition-all ${
            isNightMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-sky-100 shadow-sm'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <BookOpen className={`w-5 h-5 ${isNightMode ? 'text-cyan-400' : 'text-sky-600'}`} />
                <h3 className={`font-heading font-extrabold text-sm ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
                  Course Navigation
                </h3>
              </div>
              <button
                onClick={() => setIsDesktopSidebarCollapsed(true)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isNightMode
                    ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Hide Left Navigation Sidebar for Full-Screen Distraction-Free Reading"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <ModulesTab
              courseTitle={courseTitle}
              modules={modules}
              selectedLessonId={selectedLessonId}
              completedLessonIds={completedLessonIds}
              onSelectLesson={(id) => {
                if (!isLessonUnlocked(id)) {
                  const targetMod = modules.find((m) =>
                    m.lessons.some((l) => String(l.id) === String(id))
                  );
                  const modIdx = modules.findIndex((m) =>
                    m.lessons.some((l) => String(l.id) === String(id))
                  );
                  const prevMod = modIdx > 0 ? modules[modIdx - 1] : null;
                  toast.warning(
                    `🔒 Module Locked! Complete all lessons in "${prevMod?.title || 'Previous Module'}" & claim XP rewards first to unlock "${targetMod?.title || 'Next Module'}"!`
                  );
                  return;
                }
                setSelectedLessonId(id);
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              progressPercent={progressPercent}
              isNightMode={isNightMode}
            />
          </aside>
        )}

        {/* Floating Expand Sidebar Button when Desktop Sidebar is Collapsed */}
        {isDesktopSidebarCollapsed && (
          <div className="hidden xl:block shrink-0">
            <button
              onClick={() => setIsDesktopSidebarCollapsed(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-lg sticky top-28 z-30 cursor-pointer active:scale-95 transition-all ${
                isNightMode
                  ? 'bg-slate-900/95 border-slate-700 text-cyan-400 hover:bg-slate-800'
                  : 'bg-white/95 border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}
              title="Show / Expand Course Navigation Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
              <span className="text-xs font-extrabold tracking-wide">Show Navigation</span>
            </button>
          </div>
        )}

        <main className="flex-1 min-w-0 space-y-8">
          <LessonViewer
            lesson={activeLessonFull}
            isGitCourse={isGitCourse}
            onMarkComplete={handleToggleComplete}
            onNextLesson={handleNextLesson}
            isCompleted={isCompleted}
            isNightMode={isNightMode}
            courseTitle={courseTitle}
            courseId={String(courseId)}
            isCourseFullyCompleted={isCourseFullyCompleted}
          />

          {/* AI Quiz Generator & Assessment Portal Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-extrabold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>AI Quiz Generator & Adaptive Assessment</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Generate instant AI quizzes for <strong>{activeLessonFull.title}</strong> to test your mastery & claim XP!
                </p>
              </div>
            </div>

            <LazyViewport placeholder={<QuizPortalSkeleton />}>
              <Suspense fallback={<QuizPortalSkeleton />}>
                <AIQuizPortal
                  courseId={String(courseId)}
                  courseTitle={courseTitle}
                  lessonId={String(selectedLessonId)}
                  lessonTitle={activeLessonFull.title}
                  lessonContent={activeLessonFull.content}
                />
              </Suspense>
            </LazyViewport>
          </div>
        </main>

        {/* Docked Right Sidebar or Floating Expand Button */}
        {isRightSidebarCollapsed ? (
          <div className="hidden xl:block shrink-0">
            <button
              onClick={() => setIsRightSidebarCollapsed(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border shadow-lg sticky top-28 z-30 cursor-pointer active:scale-95 transition-all ${
                isNightMode
                  ? 'bg-slate-900/95 border-slate-700 text-cyan-400 hover:bg-slate-800'
                  : 'bg-white/95 border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}
              title="Show / Expand Lesson Controls, Notes & Progress Side Panel"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs font-extrabold tracking-wide">Lesson Panel</span>
            </button>
          </div>
        ) : (
          <Suspense fallback={<SidebarSkeleton />}>
            <RightSidebar
              lessonId={selectedLessonId}
              lessonTitle={activeLessonFull.title}
              isCompleted={isCompleted}
              isBookmarked={isBookmarked}
              resources={activeLessonFull.resources}
              downloads={(activeLessonFull as any).downloads}
              onToggleComplete={handleToggleComplete}
              onNextLesson={handleNextLesson}
              onToggleBookmark={handleToggleBookmark}
              completedCount={validCompletedCount}
              totalLessons={allLessons.length}
              isNightMode={isNightMode}
              onCollapse={() => setIsRightSidebarCollapsed(true)}
            />
          </Suspense>
        )}
      </div>

      {/* Floating AI Learning Assistant Trigger Button */}
      <button
        onClick={() => setIsAITutorOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-3 sm:p-4 rounded-full bg-linear-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold shadow-2xl shadow-amber-500/40 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-amber-300/80 cursor-pointer"
        title="Open AI Learning Assistant"
      >
        <Sparkles className="w-5 h-5 fill-slate-950 animate-pulse shrink-0" />
        <span className="text-xs tracking-wide hidden sm:inline">AI Learning Assistant</span>
        <span className="text-xs tracking-wide sm:hidden">AI Tutor</span>
      </button>

      {/* AI Learning Assistant Drawer */}
      <Suspense fallback={null}>
        <AITutorDrawer
          isOpen={isAITutorOpen}
          onClose={() => setIsAITutorOpen(false)}
          lessonTitle={activeLessonFull.title}
          courseTitle={courseTitle}
          lessonContent={activeLessonFull.content}
        />
      </Suspense>

      {/* ------------------- CONGRATULATIONS & CERTIFICATE MODAL ------------------- */}
      {showCongrats && isGeneratingCert && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <h3 className="font-heading font-black text-lg text-white">Generating Certificate...</h3>
            <p className="text-xs text-slate-400 font-medium">
              Generating your verified high-resolution credential, uploading to Google Drive and delivering to your inbox...
            </p>
          </div>
        </div>
      )}

      {showCongrats && !isGeneratingCert && (
        <CertificatePreviewModal
          certificate={{
            id: generatedCert?.certificateId || 'KQ-CERT-MOCK-ID',
            verificationId: generatedCert?.certificateId || generatedCert?.verificationId || 'KQ-CERT-MOCK-ID',
            studentId: generatedCert?.studentId || (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104'),
            studentName: generatedCert?.studentName || userName,
            courseId: String(courseId),
            courseTitle: generatedCert?.courseTitle || courseTitle,
            instructorName: 'Shaivika Groups Board',
            completionDate: generatedCert?.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            courseDuration: generatedCert?.courseDuration || '24 Hours',
            modulesCount: generatedCert?.modulesCount || modules.length || 8,
            googleDriveLink: generatedCert?.googleDriveLink,
          }}
          onClose={() => setShowCongrats(false)}
        />
      )}
    </div>
  );
};

