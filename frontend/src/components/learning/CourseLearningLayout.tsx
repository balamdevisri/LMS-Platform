import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import { LearningTopBar } from './LearningTopBar';
import { LearningProgressBar } from './LearningProgressBar';
import { CourseSidebarOutline } from './CourseSidebarOutline';
import { LessonContentPanel } from './LessonContentPanel';

import type { ModuleData } from './ModuleAccordion';

import { CertificatePreviewModal } from '../courses/CertificatePreviewModal';
import { CertificateService } from '@/services/achievementService';
import { CourseActionConfirmModal } from '../courses/CourseActionConfirmModal';
import { QuizPlayer } from '../quiz/QuizPlayer';
import { RibbonLeaderboardWidget } from '@/components/common/RibbonLeaderboardWidget';

const AITutorDrawer = lazy(() => import('./AITutorDrawer').then(m => ({ default: m.AITutorDrawer })));

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Calculate estimated reading duration from content */
function calculateEstimatedDuration(content: string): string {
  if (!content) return '5 mins';
  const cleaned = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`!\[\]()>-]/g, ' ');
  const words = cleaned.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  return `${minutes} min read`;
}

// ─── Component Props ────────────────────────────────────────────────────────

interface CourseLearningLayoutProps {
  courseId: string | number;
  courseTitle: string;
  modules: ModuleData[];
  onBackToCourse?: () => void;
  onBackToCourseDetails?: () => void;
  userAvatar?: string;
  userName?: string;
  isEnrolled?: boolean;
  onEnroll?: () => void;
}

/**
 * CourseLearningLayout — Top-level distraction-free learning environment for KaizenQ.
 * Features:
 * - Hierarchical traversal across Modules -> Topics -> Learning Units
 * - Database-backed progress synchronization with offline/local caching
 * - Clean structured reading view
 */
export const CourseLearningLayout: React.FC<CourseLearningLayoutProps> = ({
  courseId,
  courseTitle,
  modules,
  onBackToCourse,
  onBackToCourseDetails,
  userAvatar: propAvatar,
  userName: propName,
}) => {
  const { user, userProfile } = useAuth();
  const { theme } = useTheme();
  const isNightMode = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);

  const isAdmin = userProfile?.role === 'admin';
  const studentUid = user?.uid || userProfile?.uid || 'default_student';
  const userAvatar = propAvatar || userProfile?.photoURL || user?.photoURL || undefined;
  const userName = propName && propName !== 'Student' && propName !== 'Student User'
    ? propName
    : ((userProfile?.name && userProfile.name !== 'Student User' ? userProfile.name : '') || userProfile?.fullName || user?.displayName || userProfile?.githubUsername || (user?.email ? user.email.split('@')[0] : 'Learner'));

  const handleBackToOverview = useCallback(() => {
    if (onBackToCourseDetails) {
      onBackToCourseDetails();
    } else if (onBackToCourse) {
      onBackToCourse();
    } else {
      window.location.href = `/courses/${courseId}`;
    }
  }, [onBackToCourseDetails, onBackToCourse, courseId]);

  // ── Defensive Access Check ────────────────────────────────────────────────
  useEffect(() => {
    if (isAdmin || userProfile?.role === 'instructor' || user?.email?.includes('admin') || user?.email === 'admin@gmail.com') {
      return;
    }

    if (!user?.uid || studentUid === 'default_student') {
      toast.error('🔒 Please sign in and enroll to access the course classroom.');
      handleBackToOverview();
      return;
    }

    enrollmentService.checkCourseEnrollment(String(courseId), studentUid)
      .then((res) => {
        if (!res.isEnrolled) {
          courseService.unenrollCourse(String(courseId), studentUid);
          toast.error('🔒 Please enroll to access the course classroom.');
          handleBackToOverview();
        }
      })
      .catch(() => {
        courseService.unenrollCourse(String(courseId), studentUid);
        toast.error('🔒 Please enroll to access the course classroom.');
        handleBackToOverview();
      });
  }, [courseId, studentUid, user?.uid, user?.email, isAdmin, userProfile?.role, handleBackToOverview]);

  // ── Flatten all units/lessons hierarchically across modules and topics ────
  const allLessons = useMemo(() => {
    const units: Array<any> = [];
    const seenUnitIds = new Set<string>();

    const addUnit = (item: any) => {
      const uId = String(item.id);
      if (seenUnitIds.has(uId)) return;
      seenUnitIds.add(uId);
      units.push(item);
    };

    (modules || []).forEach((mod: any) => {
      if (mod.topics && mod.topics.length > 0) {
        mod.topics.forEach((top: any) => {
          if (top.learningUnits && top.learningUnits.length > 0) {
            top.learningUnits.forEach((u: any) => {
              if (!u.isDraft || isAdmin) {
                addUnit({
                  ...u,
                  id: u.id,
                  title: u.title,
                  description: u.description,
                  topicTitle: top.title,
                  topicId: top.id,
                  moduleTitle: mod.title,
                  moduleId: mod.id,
                  learningObjectives: u.learningObjectives,
                  conceptTheory: u.conceptTheory || u.readingContent || u.content,
                  codeExamples: u.codeExamples,
                  keyPoints: u.keyPoints,
                  practiceQuestions: u.practiceQuestions,
                  resourceLinks: u.resourceLinks,
                  topicImageUrl: u.topicImageUrl || top.topicImageUrl || mod.topicImageUrl || null,
                  themeColor: u.themeColor || top.themeColor || mod.themeColor || null,
                  themeIcon: u.themeIcon || top.themeIcon || mod.themeIcon || null,
                });
              }
            });
          }
        });
      } else if (mod.lessons && mod.lessons.length > 0) {
        mod.lessons.forEach((l: any) => {
          if (!l.isDraft || isAdmin) {
            addUnit({
              ...l,
              id: l.id,
              title: l.title,
              description: l.description,
              moduleTitle: mod.title,
              moduleId: mod.id,
              learningObjectives: l.learningObjectives,
              conceptTheory: l.conceptTheory || l.readingContent || l.content,
              codeExamples: l.codeExamples,
              keyPoints: l.keyPoints,
              practiceQuestions: l.practiceQuestions,
              resourceLinks: l.resourceLinks,
              topicImageUrl: l.topicImageUrl || mod.topicImageUrl || null,
              themeColor: l.themeColor || mod.themeColor || null,
              themeIcon: l.themeIcon || mod.themeIcon || null,
            });
          }
        });
      }
    });
    return units;
  }, [modules, isAdmin]);

  // ── Completion state ───────────────────────────────────────────────────
  const [completedLessonIds, setCompletedLessonIds] = useState<(string | number)[]>(() => {
    try {
      const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Sync progress from backend API and Firestore on load ───────────────
  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      if (!courseId) return;

      // 1. Try local storage for immediate render
      try {
        const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
        if (saved && isMounted) {
          setCompletedLessonIds(JSON.parse(saved));
        }
      } catch {}

      // 2. Fetch from backend progress endpoint
      try {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        let token: string | null = null;
        if (user) {
          try { token = await user.getIdToken(); } catch {}
        }
        if (!token) {
          token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
        }

        const res = await fetch(`${apiBase}/enrollments/${courseId}/progress`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'x-user-id': studentUid,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.completedLessons) && isMounted) {
            setCompletedLessonIds(data.completedLessons);
            localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(data.completedLessons));
            return;
          }
        }
      } catch (err) {
        console.warn('[CourseLearningLayout] Backend progress fetch notice:', err);
      }

      // 3. Fallback to Firestore directly if available
      try {
        if (db && studentUid) {
          const docRef = doc(db, 'student_progress', `${studentUid}_${courseId}`);
          const snap = await getDoc(docRef);
          if (snap.exists() && isMounted) {
            const data = snap.data();
            if (Array.isArray(data.completedLessons)) {
              setCompletedLessonIds(data.completedLessons);
              localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(data.completedLessons));
            }
          }
        }
      } catch (err) {
        console.warn('[CourseLearningLayout] Firestore progress fetch notice:', err);
      }
    }

    loadProgress();

    return () => { isMounted = false; };
  }, [courseId, studentUid, user]);

  // ── Selected lesson state ──────────────────────────────────────────────
  const [selectedLessonId, setSelectedLessonId] = useState<string | number>(() => {
    try {
      const lastActive = localStorage.getItem(`shaivika_last_active_${courseId}`);
      if (lastActive && allLessons.some((l) => String(l.id) === String(lastActive))) {
        return lastActive;
      }
    } catch {}

    try {
      const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
      const completedIds: (string | number)[] = saved ? JSON.parse(saved) : [];
      const firstUncompleted = allLessons.find((l) => !completedIds.includes(l.id));
      if (firstUncompleted) return firstUncompleted.id;
    } catch {}

    return allLessons[0]?.id || '';
  });

  // Only sync selected lesson if current selectedLessonId is invalid or not found in allLessons
  useEffect(() => {
    if (allLessons.length > 0) {
      const isValidCurrent = allLessons.some((l) => String(l.id) === String(selectedLessonId));
      if (!isValidCurrent) {
        const lastActive = localStorage.getItem(`shaivika_last_active_${courseId}`);
        if (lastActive && allLessons.some((l) => String(l.id) === String(lastActive))) {
          setSelectedLessonId(lastActive);
        } else {
          const saved = localStorage.getItem(`shaivika_completed_${courseId}`);
          let completedIds: (string | number)[] = [];
          try { completedIds = saved ? JSON.parse(saved) : []; } catch {}
          const firstUncompleted = allLessons.find((l) => !completedIds.includes(l.id));
          setSelectedLessonId(firstUncompleted ? firstUncompleted.id : allLessons[0].id);
        }
      }
    }
  }, [courseId, allLessons, selectedLessonId]);

  // ── Sidebar state ──────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Assessment / Quiz Mode ─────────────────────────────────────────────
  const [activeViewMode, setActiveViewMode] = useState<'content' | 'quiz'>('content');

  useEffect(() => {
    const current = allLessons.find((l) => String(l.id) === String(selectedLessonId)) as any;
    if (current?.type === 'Quiz' || current?.type === 'quiz' || current?.isQuiz) {
      setActiveViewMode('quiz');
    } else {
      setActiveViewMode('content');
    }
  }, [selectedLessonId, allLessons]);

  // ── AI Tutor state ─────────────────────────────────────────────────────
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  // ── Exit confirm modal ─────────────────────────────────────────────────
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // ── Certificate state ──────────────────────────────────────────────────
  const [showCongrats, setShowCongrats] = useState(false);
  const [generatedCert, setGeneratedCert] = useState<any>(() => {
    try {
      const certService = new CertificateService();
      const existing = certService.getCertificates(studentUid).find(
        (c) => String(c.courseId) === String(courseId)
      );
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

  // ── Computed values ────────────────────────────────────────────────────
  const activeIndex = useMemo(
    () => allLessons.findIndex((l) => String(l.id) === String(selectedLessonId)),
    [allLessons, selectedLessonId]
  );

  const currentLessonData = activeIndex >= 0 ? allLessons[activeIndex] : allLessons[0];
  const hasPrevLesson = activeIndex > 0;
  const hasNextLesson = activeIndex < allLessons.length - 1;
  const isCompleted = completedLessonIds.some((id) => String(id) === String(selectedLessonId));

  const validCompletedCount = completedLessonIds.filter(
    (id) => allLessons.some((l) => String(l.id) === String(id))
  ).length;

  const progressPercent = allLessons.length > 0
    ? Math.min(100, Math.round((validCompletedCount / allLessons.length) * 100))
    : 0;

  const isCourseFullyCompleted = allLessons.length > 0 && allLessons.every((l) =>
    completedLessonIds.some((cId) => String(cId) === String(l.id))
  );

  const certService = useMemo(() => new CertificateService(), []);
  const currentCert = useMemo(() => {
    const certs = certService.getCertificates(studentUid);
    return certs.find((c) => String(c.courseId) === String(courseId)) || null;
  }, [certService, studentUid, courseId]);

  const normalizeResources = (data: any): any[] | undefined => {
    if (!data) return undefined;
    if (Array.isArray(data.resourceLinks) && data.resourceLinks.length > 0) {
      return data.resourceLinks;
    }
    if (Array.isArray(data.resources) && data.resources.length > 0) {
      return data.resources.map((r: any) => ({
        id: r.id || r.resourceId,
        title: r.title || r.name || 'Resource',
        url: r.url,
        type: r.type || (r.category ? String(r.category).toLowerCase() : 'link'),
        description: r.description,
      }));
    }
    return undefined;
  };

  // ── Build the active lesson's full details ─────────────────────────────
  const activeLessonFull = useMemo((): {
    title: string;
    content: string;
    shortDescription?: string;
    duration: string;
    learningObjectives?: string[];
    codeExamples?: any[];
    keyPoints?: string[];
    practiceQuestions?: any[];
    resourceLinks?: any[];
    topicImageUrl?: string | null;
    themeColor?: string | null;
    themeIcon?: string | null;
  } => {
    if (!currentLessonData) {
      return {
        title: allLessons[0]?.title || 'Course Introduction',
        content: (allLessons[0] as any)?.conceptTheory || (allLessons[0] as any)?.readingContent || (allLessons[0] as any)?.content || 'Welcome to the course.',
        shortDescription: allLessons[0]?.description,
        duration: '15 mins',
        learningObjectives: (allLessons[0] as any)?.learningObjectives,
        codeExamples: (allLessons[0] as any)?.codeExamples,
        keyPoints: (allLessons[0] as any)?.keyPoints,
        practiceQuestions: (allLessons[0] as any)?.practiceQuestions,
        resourceLinks: normalizeResources(allLessons[0]),
        topicImageUrl: (allLessons[0] as any)?.topicImageUrl || null,
        themeColor: (allLessons[0] as any)?.themeColor || null,
        themeIcon: (allLessons[0] as any)?.themeIcon || null,
      };
    }

    const currentAny = currentLessonData as any;
    const contentStr = currentAny.conceptTheory || currentAny.readingContent || currentAny.content || currentAny.description || 'Welcome to this lesson.';
    const duration = currentAny.duration || calculateEstimatedDuration(contentStr);

    return {
      title: currentLessonData.title,
      content: typeof contentStr === 'string' ? contentStr : JSON.stringify(contentStr),
      shortDescription: currentAny.description,
      duration,
      learningObjectives: currentAny.learningObjectives,
      codeExamples: currentAny.codeExamples,
      keyPoints: currentAny.keyPoints,
      practiceQuestions: currentAny.practiceQuestions,
      resourceLinks: normalizeResources(currentAny),
      topicImageUrl: currentAny.topicImageUrl || null,
      themeColor: currentAny.themeColor || null,
      themeIcon: currentAny.themeIcon || null,
    };
  }, [currentLessonData, allLessons]);

  // ── Persist last active lesson & scroll to top ─────────────────────────
  useEffect(() => {
    if (selectedLessonId) {
      try {
        localStorage.setItem(`shaivika_last_active_${courseId}`, String(selectedLessonId));
      } catch {}
    }
    // Scroll content to top immediately on lesson change
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedLessonId, courseId]);

  // ── Persist completion state ───────────────────────────────────────────
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

  // ── Lock body scroll ───────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Certificate generation (preserved from original) ───────────────────
  const triggerCertificateGeneration = useCallback(async () => {
    if (isGeneratingCert) return;
    setIsGeneratingCert(true);

    try {
      let token: string | null = null;
      if (user) {
        try { token = await user.getIdToken(); } catch {}
      }
      if (!token) {
        token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
      }

      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          studentId: studentUid,
          studentName: userName,
          courseId: String(courseId),
          courseTitle,
          instructorName: 'Shaivika Groups Board',
          modulesCount: modules.length || 8,
          courseDuration: '24 Hours',
          completionDate: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.certificate) {
          setGeneratedCert(data.certificate);
          return;
        }
      }

      // Fallback local cert
      const certSvc = new CertificateService();
      const studentCode = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-9921');
      const localCert = certSvc.generateCertificate(
        String(courseId),
        courseTitle,
        'Shaivika Groups Board',
        userName,
        studentUid,
        studentCode,
        '24 Hours',
        modules.length || 8
      );
      setGeneratedCert({
        success: true,
        certificateId: localCert.verificationId,
        completionDate: localCert.completionDate,
        studentId: localCert.studentId,
        studentName: localCert.studentName,
        courseTitle: localCert.courseTitle,
        modulesCount: localCert.modulesCount,
        courseDuration: localCert.courseDuration,
      });
    } catch {
      // Fallback local cert
      const certSvc = new CertificateService();
      const studentCode = (userProfile as any)?.studentId || (user?.uid ? `STU-${user.uid.substring(0, 6).toUpperCase()}` : 'STU-9921');
      const localCert = certSvc.generateCertificate(
        String(courseId),
        courseTitle,
        'Shaivika Groups Board',
        userName,
        studentUid,
        studentCode,
        '24 Hours',
        modules.length || 8
      );
      setGeneratedCert({
        success: true,
        certificateId: localCert.verificationId,
        completionDate: localCert.completionDate,
        studentId: localCert.studentId,
        studentName: localCert.studentName,
        courseTitle: localCert.courseTitle,
        modulesCount: localCert.modulesCount,
        courseDuration: localCert.courseDuration,
      });
    } finally {
      setIsGeneratingCert(false);
    }
  }, [isGeneratingCert, user, userProfile, studentUid, courseId, courseTitle, userName, modules]);

  // ── Sequential unlock check ────────────────────────────────────────────
  const isLessonUnlocked = useCallback((lessonId: string | number): boolean => {
    const targetIdx = allLessons.findIndex((l) => String(l.id) === String(lessonId));
    if (targetIdx <= 0) return true;
    const prevLesson = allLessons[targetIdx - 1];
    return completedLessonIds.some((id) => String(id) === String(prevLesson.id));
  }, [allLessons, completedLessonIds]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson) {
      setSelectedLessonId(allLessons[activeIndex - 1].id);
    }
  }, [hasPrevLesson, allLessons, activeIndex]);

  const handleNextLesson = useCallback(() => {
    if (!hasNextLesson) return;

    // Must complete and claim current lesson first
    if (!isCompleted) {
      toast.warning('🔒 XP Reward Pending! Please click "⚡ Claim +50 XP" to claim your XP before continuing to the next lesson!');
      return;
    }

    const nextLesson = allLessons[activeIndex + 1];
    if (!isLessonUnlocked(nextLesson.id)) {
      toast.info('Complete the previous lesson to unlock this one.');
      return;
    }

    // Check if next lesson crosses into a new module
    const isNextModule = currentLessonData?.moduleId !== undefined &&
      nextLesson.moduleId !== undefined &&
      String(currentLessonData.moduleId) !== String(nextLesson.moduleId);

    if (isNextModule) {
      // Find all lessons belonging to the next module and pick the initial (first) lesson
      const nextModuleLessons = allLessons.filter(l => String(l.moduleId) === String(nextLesson.moduleId));
      const firstLessonOfNextModule = nextModuleLessons[0] || nextLesson;
      setSelectedLessonId(firstLessonOfNextModule.id);
      toast.success(`🎉 ${currentLessonData.moduleTitle || 'Module'} Completed! Welcome to ${firstLessonOfNextModule.moduleTitle || nextLesson.moduleTitle || 'Next Module'}!`);
    } else {
      setSelectedLessonId(nextLesson.id);
    }

    // Scroll viewport to initial position immediately
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hasNextLesson, isCompleted, allLessons, activeIndex, isLessonUnlocked, currentLessonData]);

  const handleMarkComplete = useCallback(async () => {
    if (!completedLessonIds.some((id) => String(id) === String(selectedLessonId))) {
      const updated = [...completedLessonIds, selectedLessonId];
      setCompletedLessonIds(updated);

      // Award XP points and log claim
      try {
        courseService.addXPPoints(50);
        courseService.addXPClaim({
          id: `claim_${Date.now()}`,
          title: `Unit ${selectedLessonId}: ${activeLessonFull.title}`,
          xp: 50,
          category: 'Lesson Completion',
          timestamp: new Date().toISOString(),
          courseId: String(courseId),
          courseTitle: courseTitle,
        });
      } catch (err) {
        console.warn('[CourseLearningLayout] Local XP award notice:', err);
      }

      toast.success('🎉 +50 XP Claimed! Unit marked as complete!');

      try {
        localStorage.setItem(`shaivika_completed_${courseId}`, JSON.stringify(updated));
      } catch {}

      // 1. Sync to backend API
      try {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        let token: string | null = null;
        if (user) {
          try { token = await user.getIdToken(); } catch {}
        }
        if (!token) {
          token = localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token');
        }

        await fetch(`${apiBase}/enrollments/progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'x-user-id': studentUid,
          },
          body: JSON.stringify({
            studentId: studentUid,
            courseId: String(courseId),
            lessonId: String(selectedLessonId),
            totalLessonsInCourse: allLessons.length,
          }),
        });
      } catch (err) {
        console.warn('[CourseLearningLayout] Backend progress sync notice:', err);
      }

      // 2. Direct Firestore Sync
      try {
        if (db && studentUid) {
          const enrollDocId = `${studentUid}_${courseId}`;
          const progressPercentage = Math.min(100, Math.round((updated.length / Math.max(1, allLessons.length)) * 100));
          await setDoc(
            doc(db, 'student_progress', enrollDocId),
            {
              studentId: studentUid,
              courseId: String(courseId),
              completedLessons: updated.map(String),
              progress: progressPercentage,
              lastAccessed: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.warn('[CourseLearningLayout] Firestore progress write notice:', err);
      }

      // Check if this completes the entire course
      const allDone = allLessons.every((l) =>
        updated.some((cId) => String(cId) === String(l.id))
      );
      if (allDone) {
        triggerCertificateGeneration();
        toast.success('🎉 Course complete! Generating your certificate...');
      }
    }
  }, [completedLessonIds, selectedLessonId, allLessons, courseId, studentUid, user, triggerCertificateGeneration]);

  const handleSelectLesson = useCallback((id: string | number) => {
    if (!isLessonUnlocked(id)) {
      toast.info('Complete the previous lesson to unlock this one.');
      return;
    }
    setSelectedLessonId(id);
  }, [isLessonUnlocked]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-200
        ${isNightMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-white text-slate-900'
        }`}
    >
      {/* Top bar */}
      <LearningTopBar
        courseTitle={courseTitle}
        lessonTitle={activeLessonFull.title}
        onBackToCourseDetails={handleBackToOverview}
        isNightMode={isNightMode}
        userAvatar={userAvatar}
        userName={userName}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Progress row */}
      <LearningProgressBar
        completedCount={validCompletedCount}
        totalCount={allLessons.length}
        isNightMode={isNightMode}
      />

      {/* Main body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — desktop */}
        <aside
          className={`hidden md:block w-72 lg:w-80 border-r shrink-0 overflow-hidden
            ${isNightMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}
        >
          <CourseSidebarOutline
            courseTitle={courseTitle}
            modules={modules}
            allLessons={allLessons}
            selectedLessonId={selectedLessonId}
            completedLessonIds={completedLessonIds}
            onSelectLesson={handleSelectLesson}
            onBackToCourseDetails={handleBackToOverview}
            isNightMode={isNightMode}
          />
        </aside>

        {/* Left sidebar — mobile drawer */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div
              className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 shadow-2xl md:hidden
                transform transition-transform duration-300 ease-out
                ${isNightMode ? 'bg-slate-900' : 'bg-white'}`}
              style={{ willChange: 'transform' }}
            >
              <CourseSidebarOutline
                courseTitle={courseTitle}
                modules={modules}
                allLessons={allLessons}
                selectedLessonId={selectedLessonId}
                completedLessonIds={completedLessonIds}
                onSelectLesson={handleSelectLesson}
                onBackToCourseDetails={handleBackToOverview}
                isNightMode={isNightMode}
                isDrawer
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Content panel */}
        <main
          ref={mainScrollRef}
          className={`flex-1 overflow-y-auto overscroll-contain
            ${isNightMode ? 'bg-slate-950' : 'bg-white'}`}
        >
          {activeViewMode === 'quiz' ? (
            <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Course Assessment
                </span>
                {!(currentLessonData as any)?.type || (currentLessonData as any)?.type !== 'Quiz' ? (
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('content')}
                    className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    ← Back to Reading
                  </button>
                ) : null}
              </div>

              <QuizPlayer
                lessonId={String(selectedLessonId)}
                courseId={String(courseId)}
                courseTitle={courseTitle}
                isNightMode={isNightMode}
                onComplete={(attempt) => {
                  if (attempt.passed) {
                    handleMarkComplete();
                  }
                }}
              />
            </div>
          ) : (
            <LessonContentPanel
              key={String(selectedLessonId)}
              lessonTitle={activeLessonFull.title}
              moduleTitle={currentLessonData?.moduleTitle}
              lessonContent={activeLessonFull.content}
              shortDescription={activeLessonFull.shortDescription}
              topicImageUrl={activeLessonFull.topicImageUrl}
              themeColor={activeLessonFull.themeColor}
              themeIcon={activeLessonFull.themeIcon}
              lessonIndex={activeIndex >= 0 ? activeIndex : 0}
              totalLessons={allLessons.length}
              isCompleted={isCompleted}
              hasPrevLesson={hasPrevLesson}
              hasNextLesson={hasNextLesson}
              onPrevLesson={handlePrevLesson}
              onNextLesson={handleNextLesson}
              onMarkComplete={handleMarkComplete}
              isNightMode={isNightMode}
              learningObjectives={activeLessonFull.learningObjectives}
              codeExamples={activeLessonFull.codeExamples}
              keyPoints={activeLessonFull.keyPoints}
              practiceQuestions={activeLessonFull.practiceQuestions}
              resourceLinks={activeLessonFull.resourceLinks}
            />
          )}

          {/* Course completion card */}
          {isCourseFullyCompleted && (
            <div className={`mx-5 sm:mx-8 lg:mx-12 mb-8 max-w-[52rem] mx-auto p-6 rounded-2xl border text-center
              ${isNightMode
                ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
              <h2 className="text-xl font-bold mb-2">🎉 Course Complete!</h2>
              <p className={`text-sm mb-4 ${isNightMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                You've completed all {allLessons.length} lessons in {courseTitle}.
              </p>
              {currentCert ? (
                <button
                  onClick={() => setShowCongrats(true)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors
                    ${isNightMode
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                >
                  View Certificate
                </button>
              ) : (
                <button
                  onClick={triggerCertificateGeneration}
                  disabled={isGeneratingCert}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors
                    disabled:opacity-50
                    ${isNightMode
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                >
                  {isGeneratingCert ? 'Generating...' : 'Claim Certificate'}
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating AI Tutor Button */}
      <button
        onClick={() => setIsAITutorOpen(true)}
        className={`fixed bottom-5 right-5 z-40 p-3 rounded-full shadow-xl
          transition-all duration-200 cursor-pointer active:scale-95
          flex items-center gap-2
          ${isNightMode
            ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30'
            : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
          }`}
        title="AI Learning Assistant"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="text-xs font-medium hidden sm:inline">AI Assistant</span>
      </button>

      {/* AI Tutor Drawer */}
      <Suspense fallback={null}>
        <AITutorDrawer
          isOpen={isAITutorOpen}
          onClose={() => setIsAITutorOpen(false)}
          lessonTitle={activeLessonFull.title}
          courseTitle={courseTitle}
          lessonContent={activeLessonFull.content}
        />
      </Suspense>

      {/* Certificate Preview Modal */}
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

      {/* Generating cert overlay */}
      {showCongrats && isGeneratingCert && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-8 max-w-sm w-full text-center space-y-4
            ${isNightMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className={`w-10 h-10 mx-auto rounded-full border-2 border-t-transparent animate-spin
              ${isNightMode ? 'border-sky-500' : 'border-sky-600'}`} />
            <h3 className={`font-semibold ${isNightMode ? 'text-white' : 'text-slate-900'}`}>
              Generating Certificate...
            </h3>
            <p className={`text-sm ${isNightMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Preparing your verified credential.
            </p>
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
          handleBackToOverview();
        }}
        onCancel={() => setIsExitConfirmOpen(false)}
      />

      {/* Floating Ribbon Hover CSS Leaderboard Widget */}
      <RibbonLeaderboardWidget />
    </div>
  );
};
