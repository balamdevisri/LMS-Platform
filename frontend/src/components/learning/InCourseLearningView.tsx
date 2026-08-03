import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { LearningHeader } from './LearningHeader';
import { SidebarDrawer } from './SidebarDrawer';
import { LessonViewer } from './LessonViewer';
import type { LessonDetails } from './LessonViewer';
import type { ModuleData } from './ModuleAccordion';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { useCourseTimeTracker } from '@/hooks/useCourseTimeTracker';
import { Sparkles, BookOpen, ChevronLeft, ChevronRight, Award, X, Printer, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { dbmsLessonsData } from '@/data/dbmsLessonsData';
import { LazyViewport } from './LazyViewport';
import { ModulesTab } from './ModulesTab';

const RightSidebar = lazy(() => import('./RightSidebar').then(m => ({ default: m.RightSidebar })));
const AIQuizPortal = lazy(() => import('../courses/AIQuizPortal').then(m => ({ default: m.AIQuizPortal })));
const AITutorDrawer = lazy(() => import('./AITutorDrawer').then(m => ({ default: m.AITutorDrawer })));

const SidebarSkeleton = () => (
  <aside className="w-full lg:w-80 shrink-0 space-y-6 animate-pulse">
    <div className="h-40 bg-slate-900/60 rounded-3xl border border-slate-800" />
    <div className="h-60 bg-slate-900/60 rounded-3xl border border-slate-800" />
  </aside>
);

const QuizPortalSkeleton = () => (
  <div className="w-full min-h-[300px] bg-slate-950/60 rounded-3xl p-6 border border-slate-800 animate-pulse space-y-4">
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

  useEffect(() => {
    if (selectedLessonId) {
      try {
        localStorage.setItem(`shaivika_last_active_${courseId}`, String(selectedLessonId));
      } catch {}
    }
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
    try {
      localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(completedLessonIds));
    } catch (err) {
      console.error('Failed to save completion state', err);
    }
  }, [completedLessonIds, courseId]);

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

        fetch('http://localhost:5000/api/certificates/complete-and-deliver', {
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
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setIsGeneratingCert(false);
            if (data.success) {
              setGeneratedCert(data);
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

  const progressPercent = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;
  const isCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isBookmarked = bookmarkedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isCourseFullyCompleted = allLessons.length > 0 && allLessons.every((l) =>
    completedLessonIds.some((cId) => String(cId) === String(l.id))
  );

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

            fetch('http://localhost:5000/api/certificates/complete-and-deliver', {
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
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                setIsGeneratingCert(false);
                if (data.success) {
                  setGeneratedCert(data);
                }
              })
              .catch(() => {
                setIsGeneratingCert(false);
              });
          }
        }}
      />

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
            completedCount={completedLessonIds.length}
            totalLessons={allLessons.length}
            isNightMode={isNightMode}
          />
        </Suspense>
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
      {showCongrats && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border-2 border-amber-300 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-105 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Congrats Message */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto border-2 border-amber-300 shadow-md">
                <Award className="w-9 h-9 text-amber-500 animate-bounce fill-amber-500/25" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Course Mastered! Congratulations, {userName}! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto font-medium">
                You have successfully completed 100% of the lessons in **{courseTitle}**. Your digital credential has been dynamically created.
              </p>
            </div>

            {/* Certificate Template Card */}
            {isGeneratingCert ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
                <p className="text-sm text-slate-505 dark:text-zinc-450 italic font-semibold">
                  Generating verified high-resolution certificate and uploading to Google Drive...
                </p>
              </div>
            ) : (
              <div className="border border-slate-250 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 bg-slate-50 dark:bg-zinc-950/50 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block">Credential Verification Details</span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                      ID: <span className="font-mono text-amber-600 dark:text-amber-400">{generatedCert?.certificateId || 'KQ-CERT-MOCK-ID'}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Completion Date: {generatedCert?.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  
                  {/* Dynamic QR Code */}
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shrink-0 flex flex-col items-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                        `https://verify.kaizenq.edu/credentials/${generatedCert?.certificateId || 'KQ-CERT-MOCK-ID'}?studentId=${
                          (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104')
                        }`
                      )}&color=0b1a30&bgcolor=ffffff`}
                      alt="Verification QR"
                      className="w-20 h-20"
                    />
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1">Scan to Verify</span>
                  </div>
                </div>

                {/* Email Delivery Notice */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900 rounded-xl text-xs text-emerald-850 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
                  <p>
                    📧 Dynamic PDF certificate emailed to <strong className="underline">{user?.email || userProfile?.email || 'shaivikagroups@gmail.com'}</strong> and synced to Google Drive folder!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                  {generatedCert?.googleDriveLink && (
                    <a
                      href={generatedCert.googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF from Google Drive</span>
                    </a>
                  )}
                  
                  <button
                    onClick={() => {
                      const certId = generatedCert?.certificateId || 'KQ-CERT-MOCK-ID';
                      const studentId = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104');
                      const verificationUrl = `https://verify.kaizenq.edu/credentials/${certId}?studentId=${studentId}`;
                      
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>Certificate - ${courseTitle} - ${userName}</title>
                              <style>
                                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Sora:wght@400;600;700;800&display=swap');
                                @page { size: A4 landscape; margin: 0; }
                                body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Sora', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                                .cert-canvas { width: 1050px; height: 742px; background: #ffffff; position: relative; box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 40px 50px; }
                                .top-left-sweep { position: absolute; top: 0; left: 0; width: 240px; height: 240px; background: linear-gradient(135deg, #002277 0%, #0044cc 60%, #0b55ed 100%); clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 1; }
                                .top-left-gold-trim { position: absolute; top: 0; left: 0; width: 250px; height: 250px; background: linear-gradient(135deg, #d4af37 0%, #f9e076 50%, #b8860b 100%); clip-path: polygon(0 0, 100% 0, 0 100%); z-index: 0; }
                                .bottom-right-sweep { position: absolute; bottom: 0; right: 0; width: 260px; height: 260px; background: linear-gradient(315deg, #002277 0%, #0044cc 60%, #0b55ed 100%); clip-path: polygon(100% 100%, 0 100%, 100% 0); z-index: 1; }
                                .bottom-right-gold-trim { position: absolute; bottom: 0; right: 0; width: 270px; height: 270px; background: linear-gradient(315deg, #d4af37 0%, #f9e076 50%, #b8860b 100%); clip-path: polygon(100% 100%, 0 100%, 100% 0); z-index: 0; }
                                .cert-body { text-align: center; margin-top: 60px; z-index: 2; }
                                .cert-title { font-family: 'Cinzel', serif; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: 4px; text-transform: uppercase; }
                                .subtitle { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #64748b; margin-top: 15px; }
                                .recipient { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 850; color: #002277; margin-top: 25px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 8px; }
                                .statement { font-size: 13px; color: #475569; max-w: 600px; margin: 25px auto 0; leading-relaxed: 1.8; font-weight: 500; }
                                .course { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 15px; }
                                .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding: 0 40px; z-index: 2; }
                                .signature-box { text-align: center; width: 180px; }
                                .signature-line { border-top: 1.5px solid #cbd5e1; margin-top: 8px; padding-top: 6px; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; }
                                .qr-section { text-align: center; }
                                .qr-label { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 4px; font-family: monospace; }
                              </style>
                            </head>
                            <body>
                              <div class="cert-canvas">
                                <div class="top-left-gold-trim"></div>
                                <div class="top-left-sweep"></div>
                                <div class="bottom-right-gold-trim"></div>
                                <div class="bottom-right-sweep"></div>
                                
                                <div class="cert-body">
                                  <div class="cert-title">Certificate of Completion</div>
                                  <div class="subtitle">This is officially certified to recognize that</div>
                                  <div class="recipient">${userName}</div>
                                  <div class="statement">has successfully finished all dynamic labs, quizzes, and modules for the professional developer training course</div>
                                  <div class="course">${courseTitle}</div>
                                </div>

                                <div class="footer-section">
                                  <div class="signature-box">
                                    <div style="font-family: 'Playfair Display', serif; font-style: italic; font-size: 15px; color: #002277; font-weight: bold;">Shaivika Board</div>
                                    <div class="signature-line">Authorized Signatory</div>
                                  </div>

                                  <div class="qr-section">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(verificationUrl)}&color=0b1a30&bgcolor=ffffff" style="width: 80px; height: 80px;" />
                                    <div class="qr-label">ID: ${certId}</div>
                                  </div>

                                  <div class="signature-box">
                                    <div style="font-size: 11px; font-weight: bold; color: #475569;">${new Date().toLocaleDateString()}</div>
                                    <div class="signature-line">Date of Award</div>
                                  </div>
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
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

