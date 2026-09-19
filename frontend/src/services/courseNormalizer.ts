import type {
  ICourse,
  IModuleItem,
  ILessonItem,
  IVideoItem,
  IResourceItem,
  IQuizItem,
  IAssignmentItem,
  IPracticalLabItem,
  CourseRoadmapItem,
  VideoProvider,
  LessonType,
} from '../../../shared/types/course';

/**
 * Utility to parse unformatted text/paragraphs into clean, point-wise string arrays.
 */
export function parsePointWiseList(input: string | string[] | undefined, defaultIfEmpty: string[] = []): string[] {
  if (!input) return defaultIfEmpty;
  if (Array.isArray(input)) {
    const cleaned = input
      .map((item) => item.trim().replace(/^[0-9]+\.\s*/, '').replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : defaultIfEmpty;
  }

  if (typeof input === 'string') {
    const lines = input
      .split(/\n+|\.|;/)
      .map((line) => line.trim().replace(/^[0-9]+\.\s*/, '').replace(/^[•\-\*]\s*/, ''))
      .filter((line) => line.length > 2);

    return lines.length > 0 ? lines : defaultIfEmpty;
  }

  return defaultIfEmpty;
}

/**
 * Detects video provider from URL.
 */
export function detectVideoProvider(url: string): VideoProvider {
  if (!url) return 'direct';
  const lUrl = url.toLowerCase();
  if (lUrl.includes('youtube.com') || lUrl.includes('youtu.be')) return 'youtube';
  if (lUrl.includes('vimeo.com')) return 'vimeo';
  if (lUrl.includes('cloudinary.com')) return 'cloudinary';
  if (lUrl.includes('firebasestorage.googleapis.com')) return 'firebase-storage';
  return 'direct';
}

/**
 * Audits a raw course object and returns a detailed status report.
 */
export interface CourseAuditReport {
  courseId: string;
  title: string;
  isValid: boolean;
  issues: string[];
  duplicateModulesCount: number;
  duplicateLessonsCount: number;
  orphanedLessonsCount: number;
  rawModulesCount: number;
  normalizedModulesCount: number;
  rawLessonsCount: number;
  normalizedLessonsCount: number;
}

export function auditCourseData(rawCourse: any): CourseAuditReport {
  const issues: string[] = [];
  const courseId = rawCourse?.id || rawCourse?.courseId || 'unknown_course';
  const title = rawCourse?.title || 'Untitled Course';

  if (!rawCourse?.title) issues.push('Missing course title');
  if (!rawCourse?.description && !rawCourse?.shortDescription) issues.push('Missing course description');
  if (!rawCourse?.thumbnail) issues.push('Missing course thumbnail');

  const rawModules = rawCourse?.modules || [];
  let duplicateModulesCount = 0;
  let duplicateLessonsCount = 0;
  let orphanedLessonsCount = 0;
  let rawLessonsCount = 0;

  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();

  rawModules.forEach((mod: any, mIdx: number) => {
    const mId = mod.id || mod.moduleId || `m_${mIdx + 1}`;
    if (moduleIds.has(mId)) duplicateModulesCount++;
    moduleIds.add(mId);

    const lessons = mod.lessons || [];
    if (mod.topics) {
      mod.topics.forEach((top: any) => {
        if (top.learningUnits) rawLessonsCount += top.learningUnits.length;
      });
    } else {
      rawLessonsCount += lessons.length;
    }

    lessons.forEach((les: any, lIdx: number) => {
      const lId = les.id || les.lessonId || `l_${lIdx + 1}`;
      if (lessonIds.has(lId)) duplicateLessonsCount++;
      lessonIds.add(lId);

      if (les.moduleId && les.moduleId !== mId) orphanedLessonsCount++;
    });
  });

  return {
    courseId,
    title,
    isValid: issues.length === 0,
    issues,
    duplicateModulesCount,
    duplicateLessonsCount,
    orphanedLessonsCount,
    rawModulesCount: rawModules.length,
    normalizedModulesCount: rawModules.length,
    rawLessonsCount,
    normalizedLessonsCount: rawLessonsCount,
  };
}

/**
 * Idempotently normalizes any raw or legacy course data into the standardized ICourse hierarchy.
 */
export function normalizeCourseData(rawCourse: any): ICourse {
  const courseId = String(rawCourse.id || rawCourse.courseId || 'course_default');
  const title = rawCourse.title || 'Untitled Mastery Course';
  const slug = rawCourse.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const skills = parsePointWiseList(rawCourse.skills, [
    'Fundamentals & Architecture',
    'Core Workflow & Syntax',
    'System Administration',
    'Troubleshooting & Best Practices',
  ]);

  const learningOutcomes = parsePointWiseList(rawCourse.learningOutcomes, [
    '1. Master core theoretical architecture and syntax fundamentals.',
    '2. Execute hands-on practical workflows and real-world commands.',
    '3. Troubleshoot common system failures and build scalable solutions.',
    '4. Implement industry security standards and operational best practices.',
  ]);

  const prerequisites = parsePointWiseList(rawCourse.prerequisites, ['No prerequisites required.']);

  // Format Roadmap
  let roadmap: CourseRoadmapItem[] = [];
  if (Array.isArray(rawCourse.roadmap) && rawCourse.roadmap.length > 0) {
    roadmap = rawCourse.roadmap.map((item: any, idx: number) => ({
      order: item.order || idx + 1,
      title: item.title || `Day ${idx + 1}: Core Mechanics`,
      description: item.description || 'Interactive learning and practical lab walkthrough.',
      estimatedDuration: item.estimatedDuration || item.duration || '2 Hours',
    }));
  } else if (Array.isArray(rawCourse.syllabus) && rawCourse.syllabus.length > 0) {
    roadmap = rawCourse.syllabus.map((item: any, idx: number) => ({
      order: idx + 1,
      title: item.title || `Unit ${idx + 1}`,
      description: item.description || 'Core concepts and hands-on exercises.',
      estimatedDuration: item.duration || '2 Hours',
    }));
  } else {
    roadmap = [
      { order: 1, title: 'Day 01: System Fundamentals', description: 'Core principles and installation setup.', estimatedDuration: '2 Hours' },
      { order: 2, title: 'Day 02: Core Workflow & Mechanics', description: 'Hands-on execution and basic commands.', estimatedDuration: '3 Hours' },
      { order: 3, title: 'Day 03: Advanced Configuration', description: 'Deep dive into options and architecture.', estimatedDuration: '4 Hours' },
      { order: 4, title: 'Day 04: Real-world Practical Lab', description: 'Interactive lab sandbox and assessment.', estimatedDuration: '3 Hours' },
    ];
  }

  // Format Modules & Lessons
  const rawModules = rawCourse.modules || [];
  const normalizedModules: IModuleItem[] = normalizeCourseModulesForDisplay(rawModules);

  // Calculate difficulty
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
  if (rawCourse.difficulty) {
    difficulty = rawCourse.difficulty;
  } else if (rawCourse.level) {
    const lvl = String(rawCourse.level).toLowerCase();
    if (lvl.includes('beginner')) difficulty = 'Beginner';
    else if (lvl.includes('advanced')) difficulty = 'Advanced';
  }

  // Calculate status
  let status: 'draft' | 'review' | 'published' | 'archived' = 'published';
  if (rawCourse.status) {
    const s = String(rawCourse.status).toLowerCase();
    if (s === 'draft') status = 'draft';
    else if (s === 'review') status = 'review';
    else if (s === 'archived') status = 'archived';
    else status = 'published';
  }

  return {
    id: courseId,
    courseId,
    title,
    slug,
    shortDescription: rawCourse.shortDescription || rawCourse.description?.slice(0, 150) || 'Comprehensive learning track.',
    description: rawCourse.description || title,
    thumbnail: rawCourse.thumbnail || '/assets/images/linux_course_thumbnail.webp',
    banner: rawCourse.banner || rawCourse.thumbnail || '/assets/images/linux_os_architecture.webp',
    category: rawCourse.category || 'Engineering',
    level: rawCourse.level || 'all_levels',
    difficulty,
    duration: rawCourse.duration || '20 Hours',
    language: rawCourse.language || 'English',
    price: rawCourse.price || 0,
    instructorId: rawCourse.instructorId || rawCourse.instructor?.id || 'inst_assigned',
    instructorName: rawCourse.instructorName || rawCourse.instructor?.name || (typeof rawCourse.instructor === 'string' ? rawCourse.instructor : '') || 'Assigned Instructor',
    instructor: {
      id: rawCourse.instructor?.id || rawCourse.instructorId || 'inst_assigned',
      name: rawCourse.instructor?.name || rawCourse.instructorName || (typeof rawCourse.instructor === 'string' ? rawCourse.instructor : '') || 'Assigned Instructor',
      role: rawCourse.instructor?.role || 'LMS Architect & Lead Engineer',
      avatar: rawCourse.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills,
    prerequisites,
    learningOutcomes,
    roadmap,
    status,
    visibility: rawCourse.visibility || 'public',
    featured: rawCourse.featured !== undefined ? Boolean(rawCourse.featured) : true,
    tags: Array.isArray(rawCourse.tags) ? rawCourse.tags : ['lms', 'engineering'],
    enrollmentCount: rawCourse.enrollmentCount || 0,
    rating: rawCourse.rating || 5.0,
    ratingCount: rawCourse.ratingCount || 10,
    order: rawCourse.order !== undefined ? Number(rawCourse.order) : 1,
    syllabus: rawCourse.syllabus,
    modules: normalizedModules,
    aiGenerated: rawCourse.aiGenerated || false,
    aiPrompt: rawCourse.aiPrompt,
    aiMetadata: rawCourse.aiMetadata,
    progress: rawCourse.progress || 0,
    isEnrolled: rawCourse.isEnrolled || false,
    createdBy: rawCourse.createdBy || 'Admin',
    createdAt: rawCourse.createdAt || new Date().toISOString(),
    updatedAt: rawCourse.updatedAt || new Date().toISOString(),
  };
}

export function getPresentationLessonTitle(
  rawTitle?: string | null,
  moduleTitleOrIndex?: string | number,
  moduleIndexOrTotal?: number,
  totalLessons?: number
): string {
  const trimmed = (rawTitle || '').trim();

  let moduleTitle = '';
  let moduleIndex = 0;
  let totalLessonsInModule = 1;

  if (typeof moduleTitleOrIndex === 'number') {
    // Called as: getPresentationLessonTitle(rawTitle, moduleNumber (1-based), totalLessons)
    moduleIndex = moduleTitleOrIndex >= 1 ? moduleTitleOrIndex - 1 : moduleTitleOrIndex;
    totalLessonsInModule = typeof moduleIndexOrTotal === 'number' ? moduleIndexOrTotal : 1;
  } else if (typeof moduleTitleOrIndex === 'string') {
    moduleTitle = moduleTitleOrIndex;
    moduleIndex = typeof moduleIndexOrTotal === 'number' ? moduleIndexOrTotal : 0;
    totalLessonsInModule = typeof totalLessons === 'number' ? totalLessons : 1;
  } else if (typeof moduleIndexOrTotal === 'number') {
    moduleIndex = moduleIndexOrTotal;
    totalLessonsInModule = typeof totalLessons === 'number' ? totalLessons : 1;
  }

  // If there are multiple genuine lessons, keep the genuine lesson title unless empty
  if (totalLessonsInModule > 1) {
    if (!trimmed) {
      return `Lesson ${moduleIndex + 1}`;
    }
    return trimmed;
  }

  // If there is exactly 1 lesson in this module:
  // Check if the title is generic / wrapper-like:
  const lower = trimmed.toLowerCase();
  const isGeneric =
    !trimmed ||
    lower === 'learning unit' ||
    lower === 'core lesson' ||
    lower === 'notes' ||
    lower === 'complete notes' ||
    lower.startsWith('unit ') ||
    lower.startsWith('lesson ') ||
    lower.includes('complete notes') ||
    lower.endsWith(' units') ||
    lower === 'k8' ||
    (lower.startsWith('module ') && lower.endsWith(' units'));

  // Extract module number from module title (e.g. "Module 1: Intro", "Module 02 — ...") or use moduleIndex + 1
  let modNum = moduleIndex + 1;
  if (typeof moduleTitle === 'string' && moduleTitle.trim()) {
    const modMatch = moduleTitle.match(/module\s*(\d+)/i);
    if (modMatch && modMatch[1]) {
      modNum = parseInt(modMatch[1], 10);
    }
  }

  if (isGeneric) {
    return `Module ${modNum} - Complete Notes`;
  }

  // If it's already a meaningful title (e.g. "Linux File Permissions", "1.1 Introduction to Kubernetes"), keep it!
  return trimmed;
}

export function normalizeLearningUnitItem(u: any, fallbackId = 'unit-1'): any {
  if (!u) {
    return {
      id: fallbackId,
      title: 'Learning Unit',
      description: '',
      duration: '15 mins',
      type: 'Reading',
      readingContent: '',
      conceptTheory: '',
      quizQuestions: [],
      resourceLinks: [],
    };
  }

  const rawType = String(u.type || 'Reading');
  let type = 'Reading';
  const lowerType = rawType.toLowerCase();
  if (lowerType.includes('video')) type = 'Video';
  else if (lowerType.includes('quiz')) type = 'Quiz';
  else if (lowerType.includes('assign')) type = 'Assignment';
  else type = 'Reading';

  const content = u.readingContent || u.conceptTheory || u.content || u.notes || '';

  return {
    ...u,
    id: String(u.id || fallbackId),
    title: u.title || 'Learning Unit',
    description: u.description || '',
    duration: u.duration || '15 mins',
    type,
    readingContent: content,
    conceptTheory: u.conceptTheory || content,
    videoUrl: u.videoUrl || u.video?.videoUrl || '',
    quizQuestions: Array.isArray(u.quizQuestions) ? u.quizQuestions : (u.quiz?.questions && Array.isArray(u.quiz.questions) ? u.quiz.questions : []),
    quizDifficulty: u.quizDifficulty || 'Medium',
    quizPassingScore: typeof u.quizPassingScore === 'number' ? u.quizPassingScore : 70,
    quizTimer: typeof u.quizTimer === 'number' ? u.quizTimer : 10,
    assignmentInstructions: u.assignmentInstructions || (u.assignment?.instructions || ''),
    resourceLinks: Array.isArray(u.resourceLinks) ? u.resourceLinks : (Array.isArray(u.resources) ? u.resources : []),
    isDraft: Boolean(u.isDraft),
    revision: typeof u.revision === 'number' ? u.revision : 1,
  };
}

export function normalizeTopicItem(t: any, fallbackId = 'topic-1'): any {
  if (!t) {
    return {
      id: fallbackId,
      title: 'Topic',
      description: '',
      estimatedDuration: '45 mins',
      learningUnits: [],
    };
  }

  const rawUnits = Array.isArray(t.learningUnits)
    ? t.learningUnits
    : (Array.isArray(t.units)
    ? t.units
    : (Array.isArray(t.lessons) ? t.lessons : []));

  const learningUnits = rawUnits.filter(Boolean).map((u: any, uIdx: number) =>
    normalizeLearningUnitItem(u, `${fallbackId}-u${uIdx + 1}`)
  );

  return {
    ...t,
    id: String(t.id || fallbackId),
    title: t.title || 'Topic',
    description: t.description || '',
    estimatedDuration: t.estimatedDuration || t.duration || '45 mins',
    learningUnits,
  };
}

/**
 * Standardize course modules and lessons for display across Admin and Student UI.
 * Hierarchy: Course -> Module -> Lessons
 */
export function normalizeCourseModulesForDisplay(rawModules: any[]): any[] {
  if (!Array.isArray(rawModules)) return [];

  const deduplicatedModules: any[] = [];
  const seenModuleIds = new Set<string>();

  rawModules.filter(Boolean).forEach((m, idx) => {
    const mId = String(m.id || m.moduleId || `m_${idx + 1}`);
    if (!seenModuleIds.has(mId)) {
      seenModuleIds.add(mId);
      deduplicatedModules.push(m);
    }
  });

  // Sort modules by orderIndex/order
  deduplicatedModules.sort((a, b) => {
    const aOrder = a.orderIndex !== undefined ? Number(a.orderIndex) : (a.order !== undefined ? Number(a.order) : 0);
    const bOrder = b.orderIndex !== undefined ? Number(b.orderIndex) : (b.order !== undefined ? Number(b.order) : 0);
    return aOrder - bOrder;
  });

  return deduplicatedModules.map((m: any, mIdx: number) => {
    const moduleId = String(m.id || m.moduleId || `m_${mIdx + 1}`);
    const moduleTitle = m.title || `Module ${mIdx + 1}`;
    const moduleOrder = m.orderIndex !== undefined ? Number(m.orderIndex) : (m.order !== undefined ? Number(m.order) : mIdx + 1);
    const moduleDuration = m.duration || m.estimatedDuration || '4 Hours';
    const moduleDesc = m.description || '';

    // Extract raw lessons list:
    // 1. Prefer direct lessons array
    // 2. Otherwise flatten topics -> learningUnits / units / lessons
    let rawLessonsList: any[] = [];
    if (Array.isArray(m.lessons) && m.lessons.length > 0) {
      rawLessonsList = m.lessons.filter(Boolean);
    } else if (Array.isArray(m.topics) && m.topics.length > 0) {
      m.topics.filter(Boolean).forEach((t: any) => {
        const units = Array.isArray(t.learningUnits)
          ? t.learningUnits
          : (Array.isArray(t.units)
          ? t.units
          : (Array.isArray(t.lessons) ? t.lessons : []));
        units.filter(Boolean).forEach((u: any) => {
          rawLessonsList.push(u);
        });
      });
    }

    // Deduplicate lessons by canonical lesson ID
    const seenLessonIds = new Set<string>();
    const uniqueRawLessons: any[] = [];
    rawLessonsList.forEach((l: any, lIdx: number) => {
      if (!l) return;
      const lId = String(l.id || l.lessonId || `unit_${moduleId}_${lIdx + 1}`);
      if (!seenLessonIds.has(lId)) {
        seenLessonIds.add(lId);
        uniqueRawLessons.push(l);
      }
    });

    // Sort lessons by orderIndex / order
    uniqueRawLessons.sort((a, b) => {
      const aOrder = a.orderIndex !== undefined ? Number(a.orderIndex) : (a.order !== undefined ? Number(a.order) : 0);
      const bOrder = b.orderIndex !== undefined ? Number(b.orderIndex) : (b.order !== undefined ? Number(b.order) : 0);
      return aOrder - bOrder;
    });

    const totalLessons = uniqueRawLessons.length;

    const normalizedLessons: any[] = uniqueRawLessons.map((l: any, lIdx: number) => {
      const lessonId = String(l.id || l.lessonId || `unit_${moduleId}_${lIdx + 1}`);
      const lessonOrder = l.orderIndex !== undefined ? Number(l.orderIndex) : (l.order !== undefined ? Number(l.order) : lIdx + 1);

      const rawType = String(l.type || 'Reading');
      let type: 'Reading' | 'Video' | 'Quiz' | 'Assignment' = 'Reading';
      const lowerType = rawType.toLowerCase();
      if (lowerType.includes('video')) type = 'Video';
      else if (lowerType.includes('quiz')) type = 'Quiz';
      else if (lowerType.includes('assign')) type = 'Assignment';
      else type = 'Reading';

      const content = l.readingContent || l.conceptTheory || l.content || l.notes || '';
      const presentationTitle = getPresentationLessonTitle(l.title, moduleTitle, mIdx, totalLessons);

      return {
        ...l,
        id: lessonId,
        lessonId,
        moduleId,
        title: presentationTitle,
        canonicalTitle: l.title || presentationTitle,
        description: l.description || '',
        order: lessonOrder,
        orderIndex: lessonOrder,
        duration: l.duration || '20 mins',
        type,
        readingContent: content,
        conceptTheory: l.conceptTheory || content,
        content: l.content || content,
        notes: l.notes || content,
        videoUrl: l.videoUrl || l.video?.videoUrl || '',
        quizQuestions: Array.isArray(l.quizQuestions) ? l.quizQuestions : (l.quiz?.questions && Array.isArray(l.quiz.questions) ? l.quiz.questions : []),
        quizDifficulty: l.quizDifficulty || l.quiz?.difficulty || 'Medium',
        quizPassingScore: typeof l.quizPassingScore === 'number' ? l.quizPassingScore : (typeof l.quiz?.passingScore === 'number' ? l.quiz.passingScore : 70),
        quizTimer: typeof l.quizTimer === 'number' ? l.quizTimer : (typeof l.quiz?.timeLimit === 'number' ? l.quiz.timeLimit : 10),
        assignmentInstructions: l.assignmentInstructions || (l.assignment?.instructions ? (Array.isArray(l.assignment.instructions) ? l.assignment.instructions.join('\n') : l.assignment.instructions) : ''),
        practiceLabChallenge: l.practiceLabChallenge || l.practical || null,
        resources: Array.isArray(l.resources) ? l.resources : (Array.isArray(l.resourceLinks) ? l.resourceLinks : []),
        resourceLinks: Array.isArray(l.resourceLinks) ? l.resourceLinks : (Array.isArray(l.resources) ? l.resources : []),
        learningObjectives: Array.isArray(l.learningObjectives) ? l.learningObjectives : [],
        keyPoints: Array.isArray(l.keyPoints) ? l.keyPoints : [],
        isDraft: Boolean(l.isDraft),
        isPublished: l.isPublished !== undefined ? Boolean(l.isPublished) : !l.isDraft,
        revision: typeof l.revision === 'number' ? l.revision : 1,
        expectedRevision: typeof l.expectedRevision === 'number' ? l.expectedRevision : (typeof l.revision === 'number' ? l.revision : 1),
        lastSavedAt: l.lastSavedAt || new Date().toISOString(),
        topicImageUrl: l.topicImageUrl || null,
        topicImagePublicId: l.topicImagePublicId || null,
        themeColor: l.themeColor || null,
        themeIcon: l.themeIcon || null,
      };
    });

    return {
      ...m,
      id: moduleId,
      moduleId,
      title: moduleTitle,
      description: moduleDesc,
      duration: moduleDuration,
      estimatedDuration: moduleDuration,
      order: moduleOrder,
      orderIndex: moduleOrder,
      revision: typeof m.revision === 'number' ? m.revision : 1,
      lessons: normalizedLessons,
      topics: [
        {
          id: `${moduleId}-t1`,
          title: moduleTitle,
          description: moduleDesc,
          estimatedDuration: moduleDuration,
          learningUnits: normalizedLessons,
        },
      ],
    };
  });
}

export function normalizeModuleItem(m: any, fallbackId = 'mod-1'): any {
  if (!m) {
    return {
      id: fallbackId,
      moduleId: fallbackId,
      title: 'Module',
      description: '',
      duration: '4 hours',
      estimatedDuration: '4 hours',
      order: 1,
      orderIndex: 1,
      lessons: [],
      topics: [],
    };
  }

  const normalized = normalizeCourseModulesForDisplay([m]);
  return normalized[0] || {
    ...m,
    id: String(m.id || fallbackId),
    moduleId: String(m.id || fallbackId),
    title: m.title || 'Module',
    description: m.description || '',
    duration: m.duration || '4 hours',
    estimatedDuration: m.duration || '4 hours',
    order: m.orderIndex ?? m.order ?? 1,
    orderIndex: m.orderIndex ?? m.order ?? 1,
    lessons: [],
    topics: [],
  };
}

