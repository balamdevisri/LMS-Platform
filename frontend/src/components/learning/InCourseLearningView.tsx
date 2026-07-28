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

    const lessonTitleLower = currentLessonData.title.toLowerCase();
    const lessonIdStr = String(currentLessonData.id).toLowerCase();

    let moduleImageMarkdown = '';
    let sectionTitle = '1. Core Operating Principles';

    if (
      lessonTitleLower.includes('kernel') ||
      lessonTitleLower.includes('lkm') ||
      lessonIdStr.includes('1.2')
    ) {
      sectionTitle = '1. Kernel Architecture & System Call Execution';
      moduleImageMarkdown = `\n![Linux Kernel Mechanics & LKMs](/assets/images/topic_kernel_mechanics.png)\n`;
    } else if (
      lessonTitleLower.includes('editor') ||
      lessonTitleLower.includes('vim') ||
      lessonTitleLower.includes('nano') ||
      lessonIdStr.includes('1.5')
    ) {
      sectionTitle = '1. Terminal Text Editors & Modal Editing Operations';
      moduleImageMarkdown = `\n![Vim and Nano Terminal Text Editors](/assets/images/topic_text_editors.png)\n`;
    } else if (
      lessonTitleLower.includes('user') ||
      lessonTitleLower.includes('group') ||
      lessonTitleLower.includes('shadow') ||
      lessonIdStr.includes('2.2')
    ) {
      sectionTitle = '1. User & Group Security Administration';
      moduleImageMarkdown = `\n![User & Group Security Administration](/assets/images/topic_user_groups.png)\n`;
    } else if (
      lessonTitleLower.includes('permission') ||
      lessonTitleLower.includes('chmod') ||
      lessonTitleLower.includes('acl') ||
      lessonIdStr.includes('2.3')
    ) {
      sectionTitle = '1. File Permissions & POSIX Access Control Lists';
      moduleImageMarkdown = `\n![Linux File Permissions & ACL Matrix](/assets/images/linux_permissions_fhs.png)\n`;
    } else if (
      lessonTitleLower.includes('storage') ||
      lessonTitleLower.includes('mount') ||
      lessonTitleLower.includes('partition') ||
      lessonIdStr.includes('2.4')
    ) {
      sectionTitle = '1. Storage Drives, Partitioning & Mount Points';
      moduleImageMarkdown = `\n![Storage Drives & Mounting Pipelines](/assets/images/topic_storage_mounting.png)\n`;
    } else if (
      lessonTitleLower.includes('process') ||
      lessonTitleLower.includes('top') ||
      lessonTitleLower.includes('htop') ||
      lessonIdStr.includes('3.1')
    ) {
      sectionTitle = '1. Process Lifecycles & Task Monitoring';
      moduleImageMarkdown = `\n![Linux Process Monitoring & Control](/assets/images/topic_process_control.png)\n`;
    } else if (
      lessonTitleLower.includes('systemd') ||
      lessonTitleLower.includes('service') ||
      lessonTitleLower.includes('cron') ||
      lessonIdStr.includes('3.2') ||
      lessonIdStr.includes('3.3')
    ) {
      sectionTitle = '1. Systemd Daemons & Crontab Automation';
      moduleImageMarkdown = `\n![Systemd Daemons & Service Management](/assets/images/linux_process_systemd.png)\n`;
    } else if (
      lessonTitleLower.includes('bash') ||
      lessonTitleLower.includes('script') ||
      lessonIdStr.includes('4.1')
    ) {
      sectionTitle = '1. Bash Script Control Structures & Loops';
      moduleImageMarkdown = `\n![Bash Scripting Control Structures](/assets/images/topic_bash_control_loops.png)\n`;
    } else if (
      lessonTitleLower.includes('ssh') ||
      lessonTitleLower.includes('key') ||
      lessonIdStr.includes('4.3')
    ) {
      sectionTitle = '1. SSH Cryptographic Keys & Remote Access Security';
      moduleImageMarkdown = `\n![SSH Keys & Remote Access Security](/assets/images/topic_ssh_keys.png)\n`;
    } else if (
      lessonTitleLower.includes('firewall') ||
      lessonTitleLower.includes('ufw') ||
      lessonTitleLower.includes('network') ||
      lessonIdStr.includes('4.2') ||
      lessonIdStr.includes('4.4')
    ) {
      sectionTitle = '1. Network Diagnostics & Host Firewall Hardening';
      moduleImageMarkdown = `\n![Network Diagnostics & Security Hardening](/assets/images/linux_bash_security.png)\n`;
    } else if (
      lessonTitleLower.includes('action') ||
      lessonTitleLower.includes('ci') ||
      lessonTitleLower.includes('pipeline')
    ) {
      sectionTitle = '1. GitHub Actions & Automated CI/CD Pipelines';
      moduleImageMarkdown = `\n![GitHub Actions CI/CD Pipeline](/assets/images/github_actions_ci_cd.png)\n`;
    } else if (
      lessonTitleLower.includes('branch') ||
      lessonTitleLower.includes('pull') ||
      lessonTitleLower.includes('merge') ||
      lessonTitleLower.includes('review')
    ) {
      sectionTitle = '1. Branching Strategies & Pull Request Code Reviews';
      moduleImageMarkdown = `\n![Git Branching & Pull Requests](/assets/images/git_branching_merging.png)\n`;
    } else if (
      lessonTitleLower.includes('git') ||
      lessonTitleLower.includes('commit') ||
      lessonTitleLower.includes('version')
    ) {
      sectionTitle = '1. Git CLI Version Control & Local Workspace Setup';
      moduleImageMarkdown = `\n![Git CLI Version Control Terminal](/assets/images/git_basics_terminal.png)\n`;
    } else if (
      lessonTitleLower.includes('fhs') ||
      lessonTitleLower.includes('hierarchy') ||
      lessonIdStr.includes('2.1')
    ) {
      sectionTitle = '1. Filesystem Hierarchy Standard (FHS)';
      moduleImageMarkdown = `\n![Filesystem Hierarchy Standard Diagram](/assets/images/linux_fhs_hierarchy.png)\n`;
    } else {
      sectionTitle = '1. Core Operating Principles & Layered Architecture';
      moduleImageMarkdown = `\n![Linux OS Architecture Diagram](/assets/images/linux_os_architecture.png)\n`;
    }

    const content = `### ${currentLessonData.title}

Welcome to **${currentLessonData.title}**! In this comprehensive lesson, you will master core concepts, production architecture patterns, and hands-on commands.

> [!NOTE]
> Read through the concepts below, inspect the topic technical architecture diagram, and execute commands in the live terminal sandbox to unlock your **+50 XP** reward!

#### ${sectionTitle}
Linux is built around modular Unix design principles. Everything is represented as a file or stream. Understanding system boundaries, process isolation, and security matrices is essential for system administration and DevOps pipelines.
${moduleImageMarkdown}
#### 2. Kernel Subsystems & Resource Management
The Linux kernel operates as a monolithic architecture running with full supervisor privileges in CPU Ring 0. It manages process scheduling, virtual memory paging, block I/O drivers, and network sockets efficiently.

#### 3. Execution Pipeline & Terminal Diagnostics
System commands execute in unprivileged User Space (CPU Ring 3) and interact with hardware via system calls (syscalls).

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
