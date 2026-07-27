import React, { useState, useEffect, useMemo } from 'react';
import { LearningHeader } from './LearningHeader';
import { SidebarDrawer } from './SidebarDrawer';
import { LessonViewer } from './LessonViewer';
import type { LessonDetails } from './LessonViewer';
import { RightSidebar } from './RightSidebar';
import type { ModuleData } from './ModuleAccordion';
import { gitLessonsData } from '@/data/gitLessonsData';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { FloatingBubbles } from './FloatingBubbles';
import { toast } from 'sonner';

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
  const userAvatar = propAvatar || userProfile?.photoURL || user?.photoURL || undefined;
  const userName = propName && propName !== 'Student' ? propName : (userProfile?.name || user?.displayName || userProfile?.githubUsername || 'Bhanu Prakash Achari');
  
  const [isNightMode, setIsNightMode] = useState(false);

  const isGitCourse =
    String(courseId) === 'git-github-mastery-course-id' ||
    String(courseId) === 'git-github-mastery' ||
    courseTitle.toLowerCase().includes('git');

  const allLessons = useMemo(() => {
    return modules.flatMap((mod) => mod.lessons);
  }, [modules]);

  const [selectedLessonId, setSelectedLessonId] = useState<string | number>(
    allLessons[0]?.id || (isGitCourse ? 'git-les-101' : 101)
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState('modules');

  const [completedLessonIds, setCompletedLessonIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(`shaivika_bookmarks_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      setSelectedLessonId(allLessons[activeIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      setSelectedLessonId(allLessons[activeIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeLessonFull = useMemo((): LessonDetails => {
    if (!currentLessonData) {
      return {
        id: 101,
        title: '1.1 Introduction to Unix & Linux Operating System Architecture',
        duration: '45 mins',
        type: 'video',
        badge: 'Module 1 • Lesson 1',
        content: 'Loading lesson details...',
      };
    }

    if (isGitCourse) {
      const foundInGit = gitLessonsData[String(currentLessonData.id)];
      if (foundInGit) {
        const autoDuration = calculateEstimatedDuration(foundInGit.content, foundInGit.commands?.length || 0);
        return { ...foundInGit, duration: autoDuration };
      }
    }

    const content = `### ${currentLessonData.title}

Welcome to **${currentLessonData.title}**! In this comprehensive lesson, you will master core concepts, production architecture patterns, and hands-on commands.

> [!NOTE]
> Read through the concepts below, inspect the architecture diagrams, and execute commands in the live terminal sandbox to unlock your **+50 XP** reward!

#### 1. Core Operating Principles
Linux is built around modular Unix design principles. Everything is represented as a file or stream. Understanding file descriptors, process isolation, and permission matrices is essential for system administration and DevOps pipelines.

![Linux OS Architecture Diagram](/assets/images/linux_os_architecture.png)

#### 2. Kernel Subsystems & Resource Management
The Linux kernel operates as a monolithic architecture running with full supervisor privileges in CPU Ring 0. It manages process scheduling, virtual memory paging, block I/O drivers, and network sockets efficiently.

![Linux Kernel Managers Diagram](/assets/images/linux_kernel_managers.png)

#### 3. Monolithic vs Microkernel Architecture
Monolithic kernels execute core services inside a unified kernel memory space, ensuring near-zero IPC latency and maximum throughput compared to microkernels.

![Monolithic vs Microkernel Architecture](/assets/images/linux_monolithic_vs_microkernel.png)

#### 4. Critical Administration Commands
Use the interactive terminal below to practice these commands:
- \`uname -a\` : Print system architecture & kernel version
- \`whoami\` : Print current logged-in user username
- \`pwd\` : Display active working directory path
- \`ls -la\` : List directory contents with hidden files and permission flags
- \`clear\` : Clear terminal screen output buffer
`;

    const commands = [
      { command: 'uname -a', description: 'Print kernel version & arch' },
      { command: 'whoami', description: 'Check active student user' },
      { command: 'pwd', description: 'Display current directory path' },
      { command: 'ls -la', description: 'List files with permissions' },
      { command: 'clear', description: 'Clear terminal screen' },
    ];

    const autoDuration = calculateEstimatedDuration(content, commands.length);

    return {
      id: currentLessonData.id,
      title: currentLessonData.title,
      duration: autoDuration,
      type: currentLessonData.type || 'lab',
      badge: `Lesson ${currentLessonData.id}`,
      content,
      commands,
      resources: [
        { title: 'Official Linux Kernel Documentation', url: 'https://www.kernel.org/doc/html/latest/' },
        { title: 'GNU Coreutils Reference Manual', url: 'https://www.gnu.org/software/coreutils/manual/' },
      ],
    };
  }, [currentLessonData, isGitCourse]);

  const handleToggleComplete = () => {
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

      toast.success(`🎉 Lesson complete! +50 XP awarded.`);
    }
  };

  const handleToggleBookmark = () => {
    if (bookmarkedLessonIds.some((id) => String(id) === String(selectedLessonId))) {
      setBookmarkedLessonIds((prev) => prev.filter((id) => String(id) !== String(selectedLessonId)));
      toast.info('Bookmark removed.');
    } else {
      setBookmarkedLessonIds((prev) => [...prev, selectedLessonId]);
      toast.success('Lesson bookmarked successfully!');
    }
  };

  const progressPercent = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0;
  const isCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isBookmarked = bookmarkedLessonIds.some((id) => String(id) === String(selectedLessonId));

  return (
    <div
      className={`fixed inset-0 z-60 font-sans flex flex-col overflow-y-auto transition-colors duration-300 ${
        isNightMode
          ? 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
          : 'bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white'
      }`}
    >
      <FloatingBubbles isNightMode={isNightMode} />

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
      />

      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        courseTitle={courseTitle}
        modules={modules}
        selectedLessonId={selectedLessonId}
        completedLessonIds={completedLessonIds}
        onSelectLesson={(id) => {
          setSelectedLessonId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-10 relative z-10">
        <main className="flex-1 min-w-0">
          <LessonViewer
            lesson={activeLessonFull}
            isGitCourse={isGitCourse}
            onMarkComplete={handleToggleComplete}
            onNextLesson={handleNextLesson}
            isCompleted={isCompleted}
            isNightMode={isNightMode}
          />
        </main>

        <RightSidebar
          lessonId={selectedLessonId}
          lessonTitle={activeLessonFull.title}
          isCompleted={isCompleted}
          isBookmarked={isBookmarked}
          resources={activeLessonFull.resources}
          onToggleComplete={handleToggleComplete}
          onNextLesson={handleNextLesson}
          onToggleBookmark={handleToggleBookmark}
          completedCount={completedLessonIds.length}
          totalLessons={allLessons.length}
          isNightMode={isNightMode}
        />
      </div>
    </div>
  );
};
