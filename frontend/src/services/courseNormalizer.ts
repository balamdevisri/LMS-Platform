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
  const normalizedModules: IModuleItem[] = rawModules.map((m: any, mIdx: number) => {
    const moduleId = String(m.id || m.moduleId || `m_${courseId}_${mIdx + 1}`);
    const moduleOrder = m.order !== undefined ? Number(m.order) : mIdx + 1;

    let rawLessonsList: any[] = [];
    if (Array.isArray(m.lessons) && m.lessons.length > 0) {
      rawLessonsList = m.lessons;
    } else if (Array.isArray(m.topics) && m.topics.length > 0) {
      // Flatten legacy topics -> learningUnits into clean lessons
      m.topics.forEach((t: any, tIdx: number) => {
        const units = t.learningUnits || [];
        units.forEach((u: any, uIdx: number) => {
          rawLessonsList.push({
            id: u.id || `unit_${mIdx + 1}_${tIdx + 1}_${uIdx + 1}`,
            title: `${t.title ? t.title + ': ' : ''}${u.title}`,
            description: u.description || t.description || 'Lesson topic walk-through.',
            duration: u.duration || t.estimatedDuration || '30 mins',
            type: u.type === 'Reading' ? 'reading' : u.type === 'Video' ? 'video' : u.type === 'Quiz' ? 'quiz' : u.type === 'Assignment' ? 'assignment' : 'reading',
            videoUrl: u.videoUrl,
            notes: u.readingContent || u.content,
            resources: u.resources,
            quizQuestions: u.quizQuestions,
            assignmentInstructions: u.assignmentInstructions,
            practiceLabChallenge: u.practiceLabChallenge,
          });
        });
      });
    }

    if (rawLessonsList.length === 0) {
      rawLessonsList = [
        {
          id: `l_${moduleId}_1`,
          title: `Lesson 1: Introduction to ${m.title || 'Module'}`,
          description: 'Fundamental principles and key concepts walkthrough.',
          duration: '25 mins',
          type: 'reading',
          notes: `# Lesson Overview\n\nWelcome to ${m.title}. This lesson covers core architectural foundations.`,
        },
      ];
    }

    const normalizedLessons: ILessonItem[] = rawLessonsList.map((l: any, lIdx: number) => {
      const lessonId = String(l.id || l.lessonId || `l_${moduleId}_${lIdx + 1}`);
      const lessonOrder = l.order !== undefined ? Number(l.order) : lIdx + 1;
      const lessonType: LessonType = (l.type || 'video').toLowerCase() as LessonType;

      // Format Video metadata if present
      let video: IVideoItem | null = null;
      if (l.videoUrl || l.video || lessonType === 'video') {
        const vUrl = l.videoUrl || l.video?.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
        video = {
          videoId: l.video?.videoId || `v_${lessonId}`,
          lessonId,
          courseId,
          moduleId,
          title: l.video?.title || l.title || 'Interactive Lesson Video',
          description: l.video?.description || l.description || '',
          videoUrl: vUrl,
          thumbnailUrl: l.video?.thumbnailUrl || rawCourse.thumbnail || '',
          duration: l.video?.duration || l.duration || '15:00',
          provider: l.video?.provider || detectVideoProvider(vUrl),
          order: 1,
          isPreview: l.video?.isPreview ?? false,
          isPublished: l.video?.isPublished ?? true,
        };
      }

      // Format Resources
      const rawResources = l.resources || [];
      const resources: IResourceItem[] = rawResources.map((r: any, rIdx: number) => ({
        resourceId: String(r.id || r.resourceId || `res_${lessonId}_${rIdx + 1}`),
        lessonId,
        courseId,
        moduleId,
        title: r.title || `Resource ${rIdx + 1}`,
        description: r.description || '',
        type: r.type || 'pdf',
        url: r.url || '#',
        order: r.order !== undefined ? Number(r.order) : rIdx + 1,
        downloadable: r.downloadable !== undefined ? Boolean(r.downloadable) : true,
      }));

      // Format Practical / Lab
      let practical: IPracticalLabItem | null = null;
      if (l.practical || l.practiceLabChallenge || l.commands || lessonType === 'lab') {
        const rawLab = l.practical || l.practiceLabChallenge || {};
        practical = {
          objective: rawLab.objective || l.description || `Master practical lab tasks for ${l.title}.`,
          requirements: parsePointWiseList(rawLab.requirements, ['Terminal sandbox access', 'Completed prerequisite reading']),
          steps: parsePointWiseList(rawLab.steps || rawLab.instructions, [
            '1. Open the interactive command-line sandbox.',
            '2. Execute the required setup commands.',
            '3. Verify configuration output and test correctness.',
          ]),
          commands: rawLab.commands || l.commands || [{ command: 'help', description: 'Display available sandbox options' }],
          expectedOutput: rawLab.expectedOutput || 'Command executed successfully with zero exit errors.',
          expectedResult: rawLab.expectedResult || 'System state updated as intended.',
          troubleshooting: parsePointWiseList(rawLab.troubleshooting, ['Check command syntax and permission flags.']),
          bestPractices: parsePointWiseList(rawLab.bestPractices, ['Always test scripts in isolated environments before deployment.']),
        };
      }

      // Format Quiz
      let quiz: IQuizItem | null = null;
      if (l.quiz || l.quizQuestions || lessonType === 'quiz') {
        const rawQ = l.quiz || {};
        const qList = rawQ.questions || l.quizQuestions || [];
        quiz = {
          quizId: rawQ.quizId || `quiz_${lessonId}`,
          lessonId,
          title: rawQ.title || `Quiz: ${l.title}`,
          description: rawQ.description || 'Test your knowledge on this lesson.',
          questions: qList.map((qItem: any, qIdx: number) => ({
            questionId: qItem.id || qItem.questionId || `q_${lessonId}_${qIdx + 1}`,
            questionNumber: qIdx + 1,
            question: qItem.questionText || qItem.question || `Question ${qIdx + 1}`,
            type: qItem.type || 'mcq',
            options: qItem.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: qItem.correctAnswerIndex !== undefined ? qItem.correctAnswerIndex : qItem.correctAnswer || 0,
            explanation: qItem.explanation || 'Review lesson notes for detailed breakdown.',
            points: qItem.marks || qItem.points || 10,
            difficulty: qItem.difficulty || 'medium',
          })),
          totalPoints: rawQ.totalPoints || qList.length * 10 || 20,
          passingScore: rawQ.passingScore || 70,
          timeLimit: rawQ.timeLimit || 15,
          attemptLimit: rawQ.attemptLimit || 3,
        };
      }

      // Format Assignment
      let assignment: IAssignmentItem | null = null;
      if (l.assignment || l.assignmentInstructions || lessonType === 'assignment') {
        const rawA = l.assignment || {};
        assignment = {
          assignmentId: rawA.assignmentId || `assign_${lessonId}`,
          lessonId,
          title: rawA.title || `Assignment: ${l.title}`,
          description: rawA.description || l.description || 'Complete the hands-on project assignment.',
          objective: rawA.objective || 'Apply course principles to solve a real-world scenario.',
          instructions: parsePointWiseList(rawA.instructions || l.assignmentInstructions, [
            '1. Carefully read the scenario specification and requirement checklist.',
            '2. Create your solution files in your workspace.',
            '3. Test your code thoroughly and commit your work.',
            '4. Submit your completed repository link or code file.',
          ]),
          requirements: parsePointWiseList(rawA.requirements, ['Clean code structure', 'Includes documentation notes']),
          submissionType: rawA.submissionType || 'text',
          deadline: rawA.deadline || l.assignmentDeadline || '7 days after lesson unlock',
          points: rawA.points || l.assignmentMaxMarks || 100,
          rubric: rawA.rubric || l.assignmentRubric || 'Graded on correctness (50%), code quality (30%), and documentation (20%).',
          resources: rawA.resources || [],
        };
      }

      return {
        lessonId,
        courseId,
        moduleId,
        title: l.title || `Lesson ${lIdx + 1}`,
        description: l.description || '',
        order: lessonOrder,
        type: lessonType,
        duration: l.duration || '20 mins',
        learningObjectives: parsePointWiseList(l.learningObjectives || l.objectives, [
          `Understand key concepts of ${l.title || 'lesson'}`,
        ]),
        video,
        notes: l.notes || l.readingContent || l.content || null,
        resources,
        practical,
        quiz,
        quizId: quiz ? quiz.quizId : null,
        assignment,
        assignmentId: assignment ? assignment.assignmentId : null,
        isPublished: l.isPublished !== undefined ? Boolean(l.isPublished) : true,
      };
    });

    return {
      moduleId,
      courseId,
      title: m.title || `Module ${mIdx + 1}`,
      description: m.description || '',
      order: moduleOrder,
      estimatedDuration: m.duration || m.estimatedDuration || '4 Hours',
      learningObjectives: parsePointWiseList(m.learningObjectives, [
        `Master module concepts and practical implementations for ${m.title || 'module'}.`,
      ]),
      lessons: normalizedLessons,
    };
  });

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
    instructorId: rawCourse.instructorId || rawCourse.instructor?.id || 'inst_kaizenq',
    instructorName: rawCourse.instructorName || rawCourse.instructor?.name || 'Prof. Manoj Acharya',
    instructor: {
      id: rawCourse.instructor?.id || 'inst_kaizenq',
      name: rawCourse.instructor?.name || rawCourse.instructorName || 'Prof. Manoj Acharya',
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
