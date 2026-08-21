import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { soundService } from '@/services/soundService';
import { LearningHeader } from './LearningHeader';
import { SidebarDrawer } from './SidebarDrawer';

import type { LessonDetails } from './LessonViewer';
import type { ModuleData } from './ModuleAccordion';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { useCourseTimeTracker } from '@/hooks/useCourseTimeTracker';
import { Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { dbmsLessonsData } from '@/data/dbmsLessonsData';
import { ChallengeArena } from './ChallengeArena';
import { getChallengeForLesson } from '@/services/challengeEngine';

const AITutorDrawer = lazy(() => import('./AITutorDrawer').then(m => ({ default: m.AITutorDrawer })));
import { CertificatePreviewModal } from '../courses/CertificatePreviewModal';
import { CertificateService, BadgeService, AchievementService, XPService, STATIC_BADGES } from '@/services/achievementService';
import { CourseActionConfirmModal } from '../courses/CourseActionConfirmModal';

import { assignmentService } from '@/services/assignmentService';

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
  } else if (courseLower.includes('kubernetes') || courseLower.includes('k8s')) {
    return [
      { command: 'kubectl get pods', description: 'List active pods' },
      { command: 'kubectl cluster-info', description: 'Display cluster connection parameters' }
    ];
  } else if (courseLower.includes('c-programming') || courseLower.includes('c programming') || courseLower.trim() === 'c') {
    return [
      { command: 'gcc program.c -o program', description: 'Compile source code with GCC compiler' },
      { command: './program', description: 'Execute binary executable' }
    ];
  } else if (courseLower.includes('linux')) {
    return [
      { command: 'pwd', description: 'Print working directory' },
      { command: 'whoami', description: 'Print active username' },
      { command: 'ls -la', description: 'List all files in details' }
    ];
  } else {
    return [
      { command: 'help', description: 'Display system command guidelines' }
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
  } else if (courseLower.includes('kubernetes') || courseLower.includes('k8s')) {
    return [
      { title: 'Official Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/' },
      { title: 'Kubectl Cheat Sheet', url: 'https://kubernetes.io/docs/reference/kubectl/cheatsheet/' }
    ];
  } else if (courseLower.includes('c-programming') || courseLower.includes('c programming') || courseLower.trim() === 'c') {
    return [
      { title: 'cppreference.com C Reference', url: 'https://en.cppreference.com/w/c' },
      { title: 'C Reference Cheat Sheet (PDF)', url: 'https://www.cheat-sheets.org/saved-copy/c_reference_card.pdf' }
    ];
  } else if (courseLower.includes('linux')) {
    return [
      { title: 'Official Linux Kernel Documentation', url: 'https://www.kernel.org/doc/html/latest/' },
      { title: 'GNU Coreutils Reference Manual', url: 'https://www.gnu.org/software/coreutils/manual/' }
    ];
  } else {
    return [
      { title: 'KaizenQ System Reference Guide', url: '#' },
      { title: 'KaizenQ Professional Training Cheatsheet', url: '#' }
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
  } else if (courseLower.includes('kubernetes') || courseLower.includes('k8s')) {
    return [
      { title: 'Download Kubectl Command Cheat Sheet', url: '#', filename: 'kubectl_cheat_sheet.pdf', size: '1.5 MB' }
    ];
  } else if (courseLower.includes('c-programming') || courseLower.includes('c programming') || courseLower.trim() === 'c') {
    return [
      { title: 'Download C Syntax Reference Card', url: '#', filename: 'c_syntax_reference.pdf', size: '780 KB' }
    ];
  } else if (courseLower.includes('linux')) {
    return [
      { title: 'Download Linux Command Reference', url: '#', filename: 'linux_commands_reference.pdf', size: '1.8 MB' }
    ];
  } else {
    return [
      { title: 'Download Course Resource Guide', url: '#', filename: 'course_resource_guide.pdf', size: '1.2 MB' }
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
  const studentUid = user?.uid || userProfile?.uid || 'default_student';
  useCourseTimeTracker(String(courseId));
  const userAvatar = propAvatar || userProfile?.photoURL || user?.photoURL || undefined;
  const userName = propName && propName !== 'Student' ? propName : (user?.displayName || userProfile?.name || userProfile?.githubUsername || 'Student User');
  
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

  const [activeView, setActiveView] = useState<'map' | 'workspace'>('map');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => !soundService.isMuted());

  const handleToggleSound = () => {
    const nextMute = soundEnabled;
    soundService.setMuted(nextMute);
    setSoundEnabled(!nextMute);
    if (!nextMute) {
      soundService.play('select');
    }
  };

  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  useEffect(() => {
    if (unlockedBadge) {
      const timer = setTimeout(() => {
        setUnlockedBadge(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [unlockedBadge]);

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

    return allLessons[0]?.id || '';
  });



  // Sync completed & bookmarked lessons when courseId changes to isolate course state
  useEffect(() => {
    try {
      const savedCompletions = localStorage.getItem(`shaivika_completed_${courseId}`);
      setCompletedLessonIds(savedCompletions ? JSON.parse(savedCompletions) : []);
    } catch {
      setCompletedLessonIds([]);
    }

    try {
      const savedBookmarks = localStorage.getItem(`shaivika_bookmarks_${courseId}`);
      setBookmarkedLessonIds(savedBookmarks ? JSON.parse(savedBookmarks) : []);
    } catch {
      setBookmarkedLessonIds([]);
    }
  }, [courseId]);

  // Reset selectedLessonId to a valid lesson of the current course when courseId changes to ensure strict isolation
  useEffect(() => {
    if (allLessons.length > 0) {
      const lastActive = localStorage.getItem(`shaivika_last_active_${courseId}`);
      if (lastActive && allLessons.some(l => String(l.id) === String(lastActive))) {
        setSelectedLessonId(lastActive);
      } else {
        const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
        let completedIds = [];
        try {
          completedIds = saved ? JSON.parse(saved) : [];
        } catch {}
        const firstUncompleted = allLessons.find(l => !completedIds.includes(l.id));
        setSelectedLessonId(firstUncompleted ? firstUncompleted.id : allLessons[0].id);
      }
    }
  }, [courseId, allLessons]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCourseTab, setActiveCourseTab] = useState('modules');
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<any>(() => {
    try {
      const certService = new CertificateService();
      const existing = certService.getCertificates(studentUid).find(c => String(c.courseId) === String(courseId));
      if (existing && !String(existing.verificationId).startsWith('KQ-') && existing.verificationId !== 'KQ-CERT-MOCK-ID') {
        return {
          success: true,
          certificateId: existing.verificationId,
          googleDriveLink: existing.googleDriveLink || '',
          completionDate: existing.completionDate,
          studentId: existing.studentId,
          studentName: existing.studentName,
          courseTitle: existing.courseTitle,
          modulesCount: existing.modulesCount,
          courseDuration: existing.courseDuration,
        };
      }
    } catch {}
    return null;
  });
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

  // Lock body scroll when learning view is open (prevents scrolling conflicts on mobile browsers)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(completedLessonIds));
      const totalCount = allLessons.length || 15;
      const pct = Math.min(100, Math.round((completedLessonIds.length / totalCount) * 100));
      courseService.saveCourseCheckpoint(String(courseId), {
        courseId: String(courseId),
        progressPercent: pct,
        lastModuleIdx: 0,
        lastLessonIdx: 0,
        lastSubtopicIdx: 0,
        lastSubtopicTitle: 'Course Learning View',
        completedSubtopics: completedLessonIds.map(String),
        completedModules: [],
        inProgressSubtopics: [],
        lastUpdated: new Date().toISOString(),
      }, studentUid);
    } catch (err) {
      console.error('Failed to save completion state', err);
    }
  }, [completedLessonIds, courseId, allLessons, studentUid]);

  // Memoize quiz and assignment units
  const { quizUnits, assignmentUnits } = useMemo(() => {
    const quiz: any[] = [];
    const assign: any[] = [];
    modules.forEach((mod) => {
      mod.lessons?.forEach((lesson) => {
        const typeLower = (lesson.type || '').toLowerCase();
        if (typeLower === 'quiz') quiz.push(lesson);
        else if (typeLower === 'assignment') assign.push(lesson);
      });
    });
    return { quizUnits: quiz, assignmentUnits: assign };
  }, [modules]);

  // Unified production trigger for certificate state synchronization & delivery
  const triggerCertificateGeneration = useCallback(async () => {
    if (isGeneratingCert) return;
    setIsGeneratingCert(true);
    const studentEmail = user?.email || userProfile?.email || 'shaivikagroups@gmail.com';
    const studentName = userName;

    try {
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
          const response = await fetch(url, options);
          if (!response.ok) {
            console.error(`[API ERROR] ${options.method || 'GET'} ${url} returned ${response.status} ${response.statusText}`);
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errData = await response.json();
              return { success: false, status: response.status, error: errData.error || errData.message || response.statusText };
            }
            return { success: false, status: response.status, error: `HTTP ${response.status}: ${response.statusText}` };
          }
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { success: true, status: response.status, data };
          }
          return { success: true, status: response.status, data: {} };
        } catch (fetchErr: any) {
          console.error(`[API NETWORK ERROR] Failed to fetch ${url}:`, fetchErr);
          throw fetchErr;
        }
      };

      // Sync state to backend before generation trigger
      let syncResult = await safeFetchJson(`${apiBase}/certificates/sync-state`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          studentId: studentUid,
          courseId: String(courseId),
          completedLessons: completedLessonIds.map(String),
          completedModules,
          quizScores,
          assignmentSubmissions,
        }),
      });

      let isSyncAuthError = syncResult.status === 401 || (syncResult.error && String(syncResult.error).toLowerCase().includes('firebase id token'));

      if (isSyncAuthError && user) {
        console.warn('Sync request unauthorized (token expired/invalid). Refreshing token...');
        try {
          token = await user.getIdToken(true);
          syncResult = await safeFetchJson(`${apiBase}/certificates/sync-state`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({
              studentId: studentUid,
              courseId: String(courseId),
              completedLessons: completedLessonIds.map(String),
              completedModules,
              quizScores,
              assignmentSubmissions,
            }),
          });
        } catch (refreshErr) {
          console.error('Failed to retry sync with refreshed ID token:', refreshErr);
        }
      }

      // Complete and deliver
      let deliveryResult = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({
          studentId: studentUid,
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

      let isDeliverAuthError = deliveryResult.status === 401 || (deliveryResult.error && String(deliveryResult.error).toLowerCase().includes('firebase id token'));

      if (isDeliverAuthError && user) {
        console.warn('Delivery request unauthorized (token expired/invalid). Refreshing token...');
        try {
          token = await user.getIdToken(true);
          deliveryResult = await safeFetchJson(`${apiBase}/certificates/complete-and-deliver`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({
              studentId: studentUid,
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
        } catch (refreshErr) {
          console.error('Failed to retry delivery with refreshed ID token:', refreshErr);
        }
      }

      setIsGeneratingCert(false);
      const deliveryData = deliveryResult.data || {};
      if (deliveryResult.success && deliveryData.success) {
        setGeneratedCert(deliveryData);
        try {
          const certService = new CertificateService();
          certService.saveExternalCertificate(studentUid, {
            id: deliveryData.certificateId || `cert_${courseId}_${Date.now()}`,
            courseId: String(courseId),
            courseTitle: courseTitle,
            studentName,
            instructorName: 'Shaivika Groups Board',
            completionDate: deliveryData.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            googleDriveLink: deliveryData.googleDriveLink || '',
            verificationId: deliveryData.certificateId,
            studentId: deliveryData.studentId || `STU-${studentUid.substring(0, 6).toUpperCase()}`,
          });
        } catch (saveErr) {
          console.warn('Error saving server certificate to local storage:', saveErr);
        }
        toast.success(`🎓 Official Certificate Generated! (Check Inbox)`);
        setShowCongrats(true);
      } else {
        toast.error(deliveryResult.error || deliveryData.error || 'Failed to generate certificate.');
      }
    } catch (err: any) {
      setIsGeneratingCert(false);
      console.error('Automated Certificate Delivery error:', err);
      toast.error('Could not connect to certificate delivery service.');
    }
  }, [completedLessonIds, user, userProfile, userName, courseId, courseTitle, modules, quizUnits, assignmentUnits, studentUid, isGeneratingCert]);

  // Fully automated certificate generator trigger
  useEffect(() => {
    let active = true;

    const checkAndTrigger = () => {
      // 1. Course Progress = 100% and All lessons done
      const allCourseLessonsDone = allLessons.length > 0 && allLessons.every((l) =>
        completedLessonIds.some((cId) => String(cId) === String(l.id))
      );
      if (!allCourseLessonsDone) return;

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
      triggerCertificateGeneration();
    };

    checkAndTrigger();
    const interval = setInterval(checkAndTrigger, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [completedLessonIds, studentUid, courseId, modules, allLessons, quizUnits, assignmentUnits, triggerCertificateGeneration]);

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
    const targetIdx = allLessons.findIndex((l) => String(l.id) === String(lessonId));
    if (targetIdx <= 0) return true;

    const prevLesson = allLessons[targetIdx - 1];
    return completedLessonIds.some((id) => String(id) === String(prevLesson.id));
  }, [allLessons, completedLessonIds]);

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

  const handleNextChallenge = useCallback(() => {
    soundService.play('unlock');
    handleNextLesson();
  }, [handleNextLesson]);

  const activeLessonFull = useMemo((): LessonDetails => {
    if (!currentLessonData) {
      return {
        id: allLessons[0]?.id || 'intro',
        title: allLessons[0]?.title || 'Course Introduction',
        duration: allLessons[0]?.duration || '15 mins',
        type: allLessons[0]?.type || 'reading',
        badge: 'Mission 01 • Challenge 01',
        content: (allLessons[0] as any)?.content || (allLessons[0] as any)?.readingContent || 'Welcome to the course. Select a challenge node to begin.',
        commands: (allLessons[0] as any)?.commands || [],
        resources: (allLessons[0] as any)?.resources || [],
        difficulty: (allLessons[0] as any)?.difficulty || 'Easy'
      } as any;
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

    if (isGitCourse) {
      const mNum = activeIndex !== -1 ? activeIndex + 1 : 1;
      
      // 1. Slice contentStr from the start of the current Module's header
      const currentRegex = new RegExp(`Module\\s+${mNum}\\s*:`, 'i');
      const currentMatch = contentStr.match(currentRegex);
      if (currentMatch && currentMatch.index !== undefined) {
        contentStr = contentStr.substring(currentMatch.index);
      }
      
      // 2. If there is a next lesson, grab its prefix content before the next Module's header
      if (mNum < 15 && allLessons[activeIndex + 1]) {
        const nextAny = allLessons[activeIndex + 1] as any;
        const nextStr = nextAny.content || nextAny.readingContent || nextAny.description || '';
        const nextRegex = new RegExp(`Module\\s+${mNum + 1}\\s*:`, 'i');
        const nextMatch = nextStr.match(nextRegex);
        let prefix = '';
        if (nextMatch && nextMatch.index !== undefined) {
          prefix = nextStr.substring(0, nextMatch.index);
        } else {
          prefix = nextStr;
        }
        if (prefix.trim()) {
          contentStr = contentStr.trim() + '\n\n' + prefix.trim();
        }
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
      difficulty: currentAny.difficulty || 'Easy'
    } as any;
  }, [currentLessonData, courseTitle, activeIndex, allLessons, isGitCourse]);

  const getXPRewardForDifficulty = useCallback((_difficulty?: string): number => {
    return 50;
  }, []);

  const handleToggleComplete = useCallback(() => {
    if (!completedLessonIds.some((id) => String(id) === String(selectedLessonId))) {
      const updated = [...completedLessonIds, selectedLessonId];
      setCompletedLessonIds(updated);

      const activeUserId = user?.uid || 'default_student';
      const badgeService = new BadgeService();
      const statsService = new AchievementService();
      const xpService = new XPService();

      const beforeBadges = badgeService.getEarnedBadges(activeUserId);

      // 1. Calculate and award dynamic XP based on difficulty
      const diff = (activeLessonFull as any).difficulty || 'Easy';
      const earnedXP = getXPRewardForDifficulty(diff);
      xpService.addXP(earnedXP, `Completed ${activeLessonFull.title}`, activeUserId);
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

      // Increment lesson completions stat
      statsService.incrementStat('lessonsCompleted', 1, activeUserId);

      // 2. Learning Streak calculation
      statsService.checkAndUpdateStreak(activeUserId);

      // 4. Check if all lessons in the course are completed (100% Course Completion)
      const allCourseLessonsDone = allLessons.every((l) =>
        updated.some((cId) => String(cId) === String(l.id))
      );

      // 3. Check if completing this lesson completes a full module (Mission)
      const currentModule = modules.find((m) =>
        m.lessons.some((l) => String(l.id) === String(selectedLessonId))
      );
      
      let allModuleDone = false;
      if (currentModule) {
        const moduleLessonIds = currentModule.lessons.map((l) => String(l.id));
        allModuleDone = moduleLessonIds.every((id) =>
          updated.some((cId) => String(cId) === id)
        );
        if (allModuleDone) {
          const bonusXP = 50;
          xpService.addXP(bonusXP, `🎯 Mission Completed: ${currentModule.title}`, activeUserId);
          courseService.addXPClaim(
            {
              id: `claim_mod_${Date.now()}`,
              title: `🎯 MISSION COMPLETE! +50 XP BONUS`,
              xp: bonusXP,
              category: 'Module Completion Bonus',
              timestamp: new Date().toISOString(),
              courseId: String(courseId),
              courseTitle: courseTitle,
            },
            activeUserId
          );
          statsService.incrementStat('modulesCompleted' as any, 1, activeUserId);
          toast.success(`🎯 MISSION COMPLETE! +50 XP BONUS`);
          if (!allCourseLessonsDone) {
            soundService.play('mission');
          }
        }
      }

      if (allCourseLessonsDone) {
        statsService.incrementStat('coursesCompleted', 1, activeUserId);
        triggerCertificateGeneration();
        soundService.play('course');
      }

      // Check for badge unlocks
      const afterBadges = badgeService.checkAndAwardBadges(activeUserId);
      const newBadges = afterBadges.filter(b => !beforeBadges.some(old => old.id === b.id));
      if (newBadges.length > 0) {
        setUnlockedBadge(newBadges[0]);
        soundService.play('badge');
      }

      soundService.play('xp');
      toast.success(`🎉 Challenge complete! +${earnedXP} XP awarded.`);
    }
  }, [completedLessonIds, selectedLessonId, user, userProfile, userName, activeLessonFull, courseId, courseTitle, modules, allLessons, getXPRewardForDifficulty]);

  const validCompletedCount = completedLessonIds.filter(id => allLessons.some(l => String(l.id) === String(id))).length;
  const progressPercent = allLessons.length > 0 ? Math.min(100, Math.round((validCompletedCount / allLessons.length) * 100)) : 0;
  const isCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));
  const isCourseFullyCompleted = allLessons.length > 0 && allLessons.every((l) =>
    completedLessonIds.some((cId) => String(cId) === String(l.id))
  );

  const certService = useMemo(() => new CertificateService(), []);
  const currentCert = useMemo(() => {
    const certs = certService.getCertificates(studentUid);
    return certs.find((c) => String(c.courseId) === String(courseId)) || null;
  }, [certService, studentUid, courseId]);







  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-60 font-sans flex flex-col overflow-y-auto overflow-x-hidden [overscroll-behavior-y:contain] [-webkit-overflow-scrolling:touch] transition-colors duration-300 ${
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
        hasNextLesson={hasNextLesson && isCompleted}
        onBackToCourseDetails={() => setIsExitConfirmOpen(true)}
        userAvatar={userAvatar}
        userName={userName}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode(!isNightMode)}
        isCourseFullyCompleted={isCourseFullyCompleted}
        onViewCertificate={() => {
          // If certificate hasn't been generated yet, let's fetch it, otherwise open modal
          setShowCongrats(true);
          if (!generatedCert && !isGeneratingCert) {
            const certService = new CertificateService();
            const existing = certService.getCertificates(studentUid).find(c => String(c.courseId) === String(courseId));
            if (existing && !String(existing.verificationId).startsWith('KQ-') && existing.verificationId !== 'KQ-CERT-MOCK-ID') {
              setGeneratedCert({
                success: true,
                certificateId: existing.verificationId,
                googleDriveLink: existing.googleDriveLink || '',
                completionDate: existing.completionDate,
                studentId: existing.studentId,
                studentName: existing.studentName,
                courseTitle: existing.courseTitle,
                modulesCount: existing.modulesCount,
                courseDuration: existing.courseDuration,
              });
            } else {
              triggerCertificateGeneration();
            }
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
            const targetIdx = allLessons.findIndex((l) => String(l.id) === String(id));
            const prevLesson = targetIdx > 0 ? allLessons[targetIdx - 1] : null;
            if (prevLesson && !completedLessonIds.some((cId) => String(cId) === String(prevLesson.id))) {
              toast.warning(
                `🔒 XP Reward Pending! Please click "⚡ Claim +50 XP" to claim your XP before continuing to "${allLessons[targetIdx]?.title || 'Next Lesson'}"!`
              );
              return;
            }
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
            setIsExitConfirmOpen(true);
          }
        }}
        isNightMode={isNightMode}
      />

      <div className="w-full bg-slate-950 border-b border-slate-900 py-2.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 select-none shrink-0 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            SYSTEM CONTEXT:
          </span>
          <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            CHALLENGE SANDBOX ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeView === 'workspace' && (
            <button
              onClick={() => {
                setActiveView('map');
                soundService.play('select');
              }}
              className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:text-cyan-400 text-slate-450 text-[10px] font-black rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1"
            >
              ◀ MISSION MAP
            </button>
          )}
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide cursor-pointer transition-all active:scale-95 ${
soundEnabled
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? '🔊 Sound: ON' : '🔇 Sound: MUTED'}
          </button>
        </div>
      </div>

      {activeView === 'map' ? (
        <div className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 relative z-10 font-mono text-slate-200">
          {/* Mission Map Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute inset-0 bg-radial-gradient(circle at top right, rgba(6,182,212,0.1), transparent) pointer-events-none" />
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono bg-cyan-950/40 border border-cyan-900/50 px-2.5 py-1 rounded-md">
                MISSION OVERVIEW CONTROL
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1 uppercase font-sans">
                {courseTitle}
              </h2>
              <p className="text-xs text-slate-400 font-sans font-medium">
                Complete each challenge node sequentially to master the path and unlock your credentials.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[220px] space-y-2 text-xs font-bold text-slate-400 font-mono shadow-inner">
              <div className="flex justify-between">
                <span>PATH PROGRESS</span>
                <span className="text-cyan-400">{validCompletedCount} / {allLessons.length} CHALLENGES</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  style={{ width: `${(validCompletedCount / Math.max(1, allLessons.length)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between border-t border-slate-900 pt-2 text-[10px]">
                <span>TOTAL SCORE</span>
                <span className="text-amber-400 flex items-center gap-1">⚡ {courseService.getUserXPPoints(studentUid)} XP</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>LEARNING STREAK</span>
                <span className="text-rose-400 flex items-center gap-1">🔥 {new AchievementService().getStreaks(studentUid).dailyStreak} DAYS</span>
              </div>
            </div>
          </div>

          {/* Connected Path Map */}
          <div className="space-y-12 relative before:absolute before:left-[19px] md:before:left-[35px] before:top-8 before:bottom-8 before:w-[2px] before:bg-slate-800 before:-z-10 animate-in fade-in duration-500 delay-150">
            {modules.map((mod, modIdx) => {
              const missionNum = String(modIdx + 1).padStart(2, '0');
              const isModLocked = modIdx > 0 && !modules[modIdx - 1].lessons.every(l => completedLessonIds.some(cId => String(cId) === String(l.id)));

              return (
                <div key={mod.id} className="relative space-y-4">
                  {/* Mission Label */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 md:w-18 md:h-18 rounded-2xl flex items-center justify-center border font-black text-xs md:text-sm font-mono shadow-md transition-all shrink-0 ${
                      isModLocked
                        ? 'bg-slate-950 border-slate-900 text-slate-650'
                        : 'bg-slate-900/90 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    }`}>
                      M{missionNum}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase font-mono tracking-widest block ${isModLocked ? 'text-slate-650' : 'text-cyan-400'}`}>
                        MISSION {missionNum}
                      </span>
                      <h3 className="text-sm md:text-base font-extrabold text-white font-sans tracking-tight">
                        {mod.title.replace(/^Module\s+\d+\s*:?\s*/i, '').replace(/^🟢|^🟡|^🔵|^🔴/, '').trim()}
                      </h3>
                    </div>
                  </div>

                  {/* Challenge Nodes List */}
                  <div className="pl-6 md:pl-22 space-y-3">
                    {mod.lessons.map((lesson, lessonIdx) => {
                      const challengeNum = String(lessonIdx + 1).padStart(2, '0');
                      const isCurrent = String(lesson.id) === String(selectedLessonId);
                      const isDone = completedLessonIds.some(cId => String(cId) === String(lesson.id));
                      const isLocked = !isLessonUnlocked(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            if (isLocked) {
                              soundService.play('error');
                              toast.warning(`🔒 Complete previous challenges to unlock this mission!`);
                              return;
                            }
                            setSelectedLessonId(lesson.id);
                            setActiveView('workspace');
                            soundService.play('select');
                          }}
                          className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 select-none cursor-pointer ${
                            isCurrent
                              ? 'bg-cyan-950/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white'
                              : isDone
                              ? 'bg-emerald-950/10 border-emerald-600/60 hover:bg-emerald-950/15 text-emerald-300'
                              : isLocked
                              ? 'bg-slate-950/30 border-slate-900 text-slate-650 cursor-not-allowed opacity-50'
                              : 'bg-slate-900/50 border-slate-800 hover:bg-slate-850/60 text-slate-350 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCurrent
                                ? 'bg-cyan-500 text-slate-950'
                                : isDone
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isLocked
                                ? 'bg-slate-950 text-slate-700 border border-slate-900'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              {challengeNum}
                            </div>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-black tracking-wider uppercase font-mono ${
                                  isCurrent ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-slate-500'
                                }`}>
                                  CHALLENGE {challengeNum}
                                </span>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.25 text-[8px] font-black bg-cyan-500 text-slate-950 uppercase rounded tracking-wider animate-pulse">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <h4 className={`text-xs md:text-sm font-bold truncate font-sans ${isCurrent ? 'text-white' : isDone ? 'text-emerald-150' : 'text-slate-300'}`}>
                                {lesson.title.replace(/^git-unit-\d+-\d+\s*:?\s*/i, '').replace(/^unit-[\d-]+\s*:?\s*/i, '')}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto font-mono text-[10px] font-bold">
                            <span className="text-slate-500">
                              ⏳ {lesson.duration || '15 mins'}
                            </span>

                            <span className="text-amber-500 font-extrabold font-mono shrink-0">
                              +{getXPRewardForDifficulty((lesson as any).difficulty)} XP
                            </span>

                            <span className={`px-2 py-0.5 rounded border uppercase ${
                              lesson.type?.toLowerCase() === 'quiz'
                                ? 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                                : lesson.type?.toLowerCase() === 'assignment'
                                ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-400'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}>
                              {lesson.type || 'Reading'}
                            </span>

                            <div className="w-6 flex justify-center">
                              {isDone ? (
                                <span className="text-emerald-400 text-sm font-black">✓</span>
                              ) : isLocked ? (
                                <span className="text-slate-700 text-xs">🔒</span>
                              ) : (
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Achievements Badge Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 font-mono text-slate-200 mt-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <span>🏆 UNLOCKED ACHIEVEMENTS</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STATIC_BADGES.map(badge => {
                const isUnlocked = new BadgeService().getEarnedBadges(studentUid).some(b => b.id === badge.id);
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
                        <span className="text-emerald-400 font-sans">✓ Unlocked</span>
                      ) : (
                        <span className="text-slate-700 font-sans">🔒 Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Completion Congratulations Card */}
          {isCourseFullyCompleted && (
            <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-8 font-mono text-slate-200 mt-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] text-center space-y-6 relative overflow-hidden animate-in zoom-in duration-300">
              <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(6,182,212,0.1), transparent) pointer-events-none" />
              <div className="text-4xl">🏆</div>
              <h2 className="text-2xl font-black text-cyan-400 tracking-wider">COURSE COMPLETE!</h2>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white uppercase">{courseTitle}</h3>
                <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">100% COMPLETE</p>
              </div>
              
              <div className="max-w-xs mx-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-inner">
                <div className="text-[10px] text-slate-500 font-black uppercase">Total XP Earned</div>
                <div className="text-2xl font-black text-amber-400">⚡ {courseService.getUserXPPoints(studentUid)} XP</div>
              </div>

              {currentCert ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-emerald-400 font-bold">🎓 Certificate Unlocked & Generated!</span>
                  <button
                    onClick={() => {
                      setShowCongrats(true);
                      soundService.play('select');
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer transition-all active:scale-95 text-xs uppercase"
                  >
                    View Certificate
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold">Ready to claim your credential?</span>
                  <button
                    onClick={() => {
                      triggerCertificateGeneration();
                      soundService.play('unlock');
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black rounded-xl hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition-all active:scale-95 text-xs uppercase"
                  >
                    Claim Certificate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <ChallengeArena
          challenge={getChallengeForLesson(
            courseTitle,
            String(selectedLessonId),
            activeLessonFull.title,
            activeLessonFull.content,
            allLessons
          )}
          isCompleted={isCompleted}
          onToggleComplete={handleToggleComplete}
          onNextLesson={handleNextChallenge}
          hasNextLesson={hasNextLesson}
          onBackToMap={() => {
            setActiveView('map');
            soundService.play('select');
          }}
          lessonContent={activeLessonFull.content}
          courseId={String(courseId)}
        />
      )}


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

      {showCongrats && !isGeneratingCert && generatedCert && (
        <CertificatePreviewModal
          certificate={{
            id: generatedCert.certificateId || 'KQ-CERT-MOCK-ID',
            verificationId: generatedCert.certificateId || generatedCert.verificationId || 'KQ-CERT-MOCK-ID',
            studentId: generatedCert.studentId || (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-992104'),
            studentName: generatedCert.studentName || userName,
            courseId: String(courseId),
            courseTitle: generatedCert.courseTitle || courseTitle,
            instructorName: 'Shaivika Groups Board',
            completionDate: generatedCert.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            courseDuration: generatedCert.courseDuration || '24 Hours',
            modulesCount: generatedCert.modulesCount || modules.length || 8,
            googleDriveLink: generatedCert.googleDriveLink,
          }}
          onClose={() => setShowCongrats(false)}
        />
      )}

      {/* Badge Unlock Celebration Overlay */}
      {unlockedBadge && (
        <div className="fixed inset-0 z-80 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-350 relative font-mono text-slate-200">
            <button
              onClick={() => {
                setUnlockedBadge(null);
                soundService.play('select');
              }}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-305 font-black cursor-pointer text-xs"
            >
              ✕
            </button>
            <div className="text-3xl">🏆</div>
            <h3 className="text-xs font-black tracking-widest text-amber-500 uppercase font-mono">
              BADGE UNLOCKED!
            </h3>
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white uppercase font-sans">
                {unlockedBadge.name}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {unlockedBadge.description}
              </p>
            </div>
            <button
              onClick={() => {
                setUnlockedBadge(null);
                soundService.play('select');
              }}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-amber-400 font-bold rounded-xl text-xs uppercase cursor-pointer transition-all active:scale-95 font-mono"
            >
              AWESOME!
            </button>
          </div>
        </div>
      )}
      {/* Course Exit Confirmation Modal */}
      <CourseActionConfirmModal
        isOpen={isExitConfirmOpen}
        actionType="exit"
        courseTitle={courseTitle}
        courseCategory="Engineering Track"
        currentProgress={progressPercent}
        currentLessonTitle={activeLessonFull.title}
        onConfirm={() => {
          setIsExitConfirmOpen(false);
          onBackToCourseDetails();
        }}
        onCancel={() => setIsExitConfirmOpen(false)}
      />
    </div>
  );
};

