import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';

/**
 * Legacy compatibility dummy - always resolves to empty array.
 * Database is the single source of truth.
 */
export const loadStaticCourseModules = async (_courseIdOrSlug: string | number): Promise<ModuleItem[]> => {
  return [];
};


export type LearningUnitType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks?: number;
}

export interface CodeExampleItem {
  id?: string;
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface PracticeQuestionItem {
  id?: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export type ResourceItemType = 'pdf' | 'link' | 'video' | 'github' | 'download' | 'doc' | 'url';

export interface ResourceLinkItem {
  id?: string;
  title: string;
  url: string;
  type?: ResourceItemType;
  description?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: LearningUnitType;
  videoUrl?: string;
  readingContent?: string;
  learningObjectives?: string[];
  conceptTheory?: string;
  codeExamples?: CodeExampleItem[];
  keyPoints?: string[];
  practiceQuestions?: PracticeQuestionItem[];
  resourceLinks?: ResourceLinkItem[];
  notes?: string;
  isDraft?: boolean;
  lastSavedAt?: string;
  quizQuestions?: QuizQuestion[];
  quizDifficulty?: 'Easy' | 'Medium' | 'Hard';
  quizPassingScore?: number;
  quizTimer?: number;
  assignmentInstructions?: string;
  assignmentReferenceFiles?: string;
  assignmentMaxMarks?: number;
  assignmentDeadline?: string;
  assignmentAllowedTypes?: string;
  assignmentRubric?: string;
  assignmentSubmissionStatus?: string;
  assignmentTeacherFeedback?: string;
  practiceLabChallenge?: any;
  resources?: any[];
  order?: number;
  orderIndex?: number;
  estimatedReadMinutes?: number;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
  revision?: number;
  expectedRevision?: number;
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  learningUnits: LearningUnitItem[];
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: TopicItem[];
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface CourseItem {
  id: number | string;
  title: string;
  slug?: string;
  subtitle?: string;
  instructor: string;
  role?: string;
  avatar?: string;
  rating: number;
  reviews?: number;
  students: string;
  duration: string;
  category: string;
  level?: string;
  badge?: string;
  tracks?: string;
  thumbnail: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  banner?: string;
  status: 'Published' | 'Draft';
  price?: number;
  description: string;
  shortDescription?: string;
  learningOutcomes?: string[];
  tags?: string[];
  durationHours?: number;
  totalLessons?: number;
  totalDurationMinutes?: number;
  updatedAt?: string;
  createdAt?: string;
  created?: string;
  syllabus: string[];
  modules?: ModuleItem[];
}



interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  getCourseModules: (id: number | string, forceRefresh?: boolean) => Promise<ModuleItem[]>;
  refreshCourses: (forceRefresh?: boolean) => Promise<void>;
  updateCourse: (id: number | string, updates: Partial<CourseItem>) => Promise<void>;
}

export const normalizeContextCourse = (c: any): CourseItem => {
  const id = String(c.id || c.courseId || `course_${Date.now()}`);
  const title = c.title || 'Untitled Course';
  const statusVal: 'Published' | 'Draft' =
    c.status && String(c.status).toLowerCase() === 'published' ? 'Published' : 'Draft';
  const instructorName =
    typeof c.instructor === 'object' && c.instructor !== null
      ? (c.instructor.name || 'Kaizen Q Team')
      : (c.instructor || 'Kaizen Q Team');

  return {
    id,
    title,
    slug: c.slug || id,
    subtitle: c.subtitle || title,
    instructor: instructorName,
    role: c.role || (typeof c.instructor === 'object' ? c.instructor?.role : undefined) || 'Senior Technical Instructor',
    avatar: c.avatar || (typeof c.instructor === 'object' ? c.instructor?.avatar : undefined) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: typeof c.rating === 'number' ? c.rating : 5.0,
    reviews: typeof c.ratingCount === 'number' ? c.ratingCount : (typeof c.reviews === 'number' ? c.reviews : 100),
    students: String(c.enrollmentCount ?? c.students ?? '0'),
    duration: c.duration || '20 Hours',
    category: c.category || 'General',
    level: c.level || 'All Levels',
    badge: c.badge || (c.featured ? 'Featured Track' : undefined),
    tracks: c.tracks || `${c.modules?.length || 0} Modules`,
    status: statusVal,
    thumbnail: c.thumbnail || c.thumbnailUrl || c.banner || '/assets/images/linux_course_thumbnail.webp',
    thumbnailUrl: c.thumbnailUrl || c.thumbnail,
    thumbnailPublicId: c.thumbnailPublicId,
    banner: c.banner || c.thumbnail,
    description: c.description || c.shortDescription || 'Comprehensive technical curriculum.',
    shortDescription: c.shortDescription || (c.description ? c.description.slice(0, 160) : 'Practical learning track.'),
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    tags: Array.isArray(c.tags) ? c.tags : [],
    durationHours: c.durationHours,
    totalLessons: c.totalLessons,
    totalDurationMinutes: c.totalDurationMinutes,
    updatedAt: c.updatedAt || new Date().toISOString(),
    createdAt: c.createdAt || new Date().toISOString(),
    created: c.created || c.createdAt,
    syllabus: Array.isArray(c.syllabus) ? c.syllabus : [],
    modules: Array.isArray(c.modules) ? c.modules : [],
  };
};

export const sanitizeCourseList = (list: CourseItem[]): CourseItem[] => {
  const map = new Map<string, CourseItem>();
  list.forEach((c) => {
    if (!c) return;
    const item = normalizeContextCourse(c);
    const slug = (item.slug || '').toLowerCase();
    const title = (item.title || '').toLowerCase();

    // Ignore legacy test items
    if (title === 'linux essentials' || slug === 'linux-essentials' || String(item.id) === 'linux-essentials') {
      return;
    }

    const key = String(item.id).toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
    } else {
      const existingHasModules = existing.modules && existing.modules.length > 0;
      const incomingHasModules = item.modules && item.modules.length > 0;
      if (incomingHasModules && !existingHasModules) {
        map.set(key, item);
      } else if (new Date(item.updatedAt || 0).getTime() > new Date(existing.updatedAt || 0).getTime()) {
        map.set(key, { ...existing, ...item, modules: incomingHasModules ? item.modules : existing.modules });
      }
    }
  });

  return Array.from(map.values()).filter((item) => (item as any).isDeleted !== true);
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);

  const refreshCourses = useCallback(async (forceRefresh = false) => {
    try {
      const loadedResult = await courseService.getCourses({ limit: 100 }, forceRefresh);
      const loaded = loadedResult.courses;
      if (loaded && loaded.length > 0) {
        const merged = sanitizeCourseList(loaded as any);
        setCourses(merged);
        localStorage.setItem('shaivika_courses_data', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('[CourseContext] Server courses fetch notice in refreshCourses:', err);
    }
  }, []);

  // Sync with Backend Server on mount
  useEffect(() => {
    refreshCourses(true);
  }, [refreshCourses]);

  // Real-time synchronization for course updates across all tabs and components
  useEffect(() => {
    const handleCoursesChanged = () => {
      try {
        const stored = localStorage.getItem('shaivika_courses_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(sanitizeCourseList(parsed));
          }
        }
      } catch (e) {}
    };

    window.addEventListener('shaivika_courses_updated', handleCoursesChanged);
    window.addEventListener('storage', handleCoursesChanged);
    return () => {
      window.removeEventListener('shaivika_courses_updated', handleCoursesChanged);
      window.removeEventListener('storage', handleCoursesChanged);
    };
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    if (courses && courses.length > 0) {
      localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
    }
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status === 'Published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    try {
      const created = await courseService.createCourse(coursePayload as any);
      const mapped = normalizeContextCourse(created);
      setCourses((prev) => [mapped, ...prev.filter((c) => String(c.id) !== String(mapped.id))]);
    } catch (e) {
      console.error('Failed to create course in CourseContext:', e);
      throw e;
    }
  };

  const getCourseById = (idOrSlug: number | string): CourseItem | undefined => {
    const target = String(idOrSlug).toLowerCase().trim();
    if (!target) return undefined;
    return courses.find((c) => {
      const cId = String(c.id).toLowerCase().trim();
      const cSlug = String((c as any).slug || '').toLowerCase().trim();
      return (
        cId === target ||
        (cId === 'course_linux_101' && target === '1') ||
        (cId === '1' && target === 'course_linux_101') ||
        (cId === 'git-github-mastery' && target === 'git-github-mastery-course-id') ||
        (cId === 'git-github-mastery-course-id' && target === 'git-github-mastery') ||
        cSlug === target
      );
    });
  };

  const toggleCourseStatus = async (id: number | string) => {
    const target = getCourseById(id);
    if (!target) return;
    const targetId = String(target.id);

    const nextStatus: 'Published' | 'Draft' = target.status === 'Published' ? 'Draft' : 'Published';
    setCourses((prev) => prev.map((c) => (String(c.id) === targetId ? { ...c, status: nextStatus } : c)));

    try {
      await courseService.updateCourse(targetId, { status: nextStatus.toLowerCase() as any });
    } catch (e) {
      console.warn('Backend sync failed in toggleCourseStatus:', e);
    }
  };

  const deleteCourse = async (id: number | string) => {
    const target = getCourseById(id);
    const targetId = target ? String(target.id) : String(id);

    try {
      await courseService.deleteCourse(targetId);
      setCourses((prev) => prev.filter((c) => String(c.id) !== targetId && (c as any).slug !== targetId));
    } catch (e) {
      console.error('Failed to delete course in CourseContext:', e);
      throw e;
    }
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const targetId = String(id);
    const updatesWithTimestamp: Partial<CourseItem> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      const updated = await courseService.updateCourse(targetId, updatesWithTimestamp as any);
      setCourses((prev) => {
        const next = prev.map((c) => {
          const cId = String(c.id);
          const cSlug = String((c as any).slug || '');
          if (
            cId === targetId ||
            cSlug === targetId ||
            (cId === '1' && targetId === 'course_linux_101') ||
            (cId === 'course_linux_101' && targetId === '1') ||
            (cId === 'git-github-mastery' && targetId === 'git-github-mastery-course-id') ||
            (cId === 'git-github-mastery-course-id' && targetId === 'git-github-mastery')
          ) {
            return {
              ...c,
              ...updated,
              status: updated.status?.toLowerCase() === 'published' ? 'Published' : 'Draft',
            } as CourseItem;
          }
          return c;
        });
        localStorage.setItem('shaivika_courses_data', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error('Failed to update course in CourseContext:', e);
      throw e;
    }
  };

  const getCourseModules = useCallback(async (idOrSlug: number | string, forceRefresh = false): Promise<ModuleItem[]> => {
    const target = String(idOrSlug).toLowerCase().trim();
    if (!target) return [];

    const existingCourse = getCourseById(target);
    const targetId = existingCourse ? String(existingCourse.id) : target;

    // 1. Authoritative: Fetch from Backend REST API via courseService
    try {
      const apiMods = await courseService.getCourseModules(targetId, forceRefresh);
      if (apiMods && apiMods.length > 0) {
        setCourses((prev) =>
          prev.map((c) => {
            const cId = String(c.id).toLowerCase().trim();
            const cSlug = String((c as any).slug || '').toLowerCase().trim();
            if (cId === target || cSlug === target || cId === targetId.toLowerCase().trim()) {
              return { ...c, modules: apiMods };
            }
            return c;
          })
        );
        return apiMods;
      }
    } catch (e) {
      console.warn(`[CourseContext] Error loading modules for ${target}:`, e);
    }

    // 2. Offline fallback: use memory modules only if network returned empty or failed
    if (existingCourse?.modules && existingCourse.modules.length > 0) {
      return existingCourse.modules;
    }

    return [];
  }, [getCourseById]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        publishedCourses,
        addCourse,
        toggleCourseStatus,
        deleteCourse,
        getCourseById,
        getCourseModules,
        refreshCourses,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
