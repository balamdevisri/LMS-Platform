import { db } from '@/firebase';
import { doc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import type { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult, CourseLevel, CourseStatus } from '../../../shared/types/course';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_COURSES: ICourse[] = [
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    slug: 'git-github-mastery',
    shortDescription: 'Master version control, repository management, and CI/CD pipelines.',
    description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
    thumbnail: '/assets/images/github_course_banner.png',
    banner: '/assets/images/github_course_banner.png',
    category: 'Development Tools',
    level: 'all_levels',
    duration: '20 Hours',
    language: 'English',
    price: 0,
    instructor: {
      id: 'instructor-kaizen-q',
      name: 'Kaizen Q Team',
      role: 'Senior Technical Instructor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: ['Git CLI', 'Branching & Merging', 'Pull Requests', 'GitHub Actions', 'CI/CD Pipelines'],
    prerequisites: ['Basic computer literacy'],
    learningOutcomes: [
      'Create, track and manage repositories locally and on GitHub',
      'Coordinate branches and execute pull requests and code reviews',
      'Solve complex merge conflicts and perform rebasing',
      'Write custom GitHub Actions pipelines for automated testing & Netlify/Vercel deployments',
    ],
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: ['git', 'github', 'ci-cd', 'devops', 'version-control'],
    enrollmentCount: 0,
    rating: 5.0,
    ratingCount: 180,
    syllabus: [
      {
        id: 'git-les-101',
        title: 'Module 1: Version Control & Git Basics',
        description: 'Introduction to git init, add, commit, status, log, diff, config, and remote synchronization.',
        lessonsCount: 15,
        duration: '3 Hours',
      },
      {
        id: 'git-les-201',
        title: 'Module 2: GitHub Foundations',
        description: 'GitHub repositories, branches, checkout, merge, pull requests, and collaborative code reviews.',
        lessonsCount: 16,
        duration: '3 Hours',
      },
    ],
    createdAt: new Date('2026-07-01').toISOString(),
    updatedAt: new Date('2026-07-01').toISOString(),
  }
];

export interface EnrollmentRecord {
  courseId: string;
  progress: number;
  enrolledAt: string;
}

export interface XPClaimRecord {
  id: string;
  title: string;
  xp: number;
  category: 'Subtopic Completion' | 'Module Certificate' | 'AI Terminal Lab' | 'Quiz Evaluation' | 'Daily Login' | 'Module Completion Bonus';
  timestamp: string;
  courseId?: string;
  courseTitle?: string;
}

export interface CourseProgressCheckpoint {
  courseId: string;
  progressPercent: number;
  lastModuleIdx: number;
  lastLessonIdx: number;
  lastSubtopicIdx: number;
  lastSubtopicTitle?: string;
  completedSubtopics: string[];
  completedModules: number[];
  lastUpdated: string;
}

function normalizeCourseToICourse(c: any): ICourse {
  const instructorObj = typeof c.instructor === 'object' && c.instructor !== null
    ? {
        id: c.instructor.id || 'instructor-kaizen-q',
        name: c.instructor.name || 'Kaizen Q Team',
        role: c.instructor.role || 'Senior Technical Instructor',
        avatar: c.instructor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      }
    : {
        id: 'inst_default',
        name: typeof c.instructor === 'string' ? c.instructor : 'Kaizen Q Team',
        role: c.role || 'Senior Technical Instructor',
        avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

  let normalizedStatus: CourseStatus = 'published';
  if (c.status) {
    const s = String(c.status).toLowerCase();
    if (s === 'published') normalizedStatus = 'published';
    else if (s === 'draft') normalizedStatus = 'draft';
    else if (s === 'archived') normalizedStatus = 'archived';
  }

  let normalizedLevel: CourseLevel = 'all_levels';
  if (c.level) {
    const l = String(c.level).toLowerCase();
    if (l.includes('begin') && l.includes('adv')) normalizedLevel = 'all_levels';
    else if (l.includes('all')) normalizedLevel = 'all_levels';
    else if (l.includes('begin')) normalizedLevel = 'beginner';
    else if (l.includes('inter')) normalizedLevel = 'intermediate';
    else if (l.includes('adv')) normalizedLevel = 'advanced';
    else if (['beginner', 'intermediate', 'advanced', 'all_levels'].includes(l)) normalizedLevel = l as CourseLevel;
  }

  let syllabusArray: any[] = [];
  if (Array.isArray(c.syllabus)) {
    syllabusArray = c.syllabus.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return {
          id: `m${idx + 1}`,
          title: item,
          description: '',
          lessonsCount: 4,
          duration: '8 Hours',
        };
      }
      return item;
    });
  } else if (c.title === 'Git & GitHub Mastery') {
    syllabusArray = [
      {
        id: 'git-les-101',
        title: 'Module 1: Version Control & Git Basics',
        description: 'Introduction to git init, add, commit, status, log, diff, config, and remote synchronization.',
        lessonsCount: 15,
        duration: '3 Hours',
      },
      {
        id: 'git-les-201',
        title: 'Module 2: GitHub Foundations',
        description: 'GitHub repositories, branches, checkout, merge, pull requests, and collaborative code reviews.',
        lessonsCount: 16,
        duration: '3 Hours',
      },
    ];
  } else {
    syllabusArray = [
      {
        id: 'm1',
        title: 'Module 1: Fundamental Concepts & Environment Setup',
        description: '',
        lessonsCount: 4,
        duration: '8 Hours',
      },
    ];
  }

  const slug = c.slug || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${c.id}`;

  return {
    id: String(c.id),
    title: c.title || 'Untitled Technical Course',
    slug,
    shortDescription: c.shortDescription || c.description || 'Enterprise technical course.',
    description: c.description || 'Enterprise technical course with hands-on labs.',
    thumbnail: c.thumbnail || '/assets/images/linux_course_thumbnail.png',
    banner: c.banner || '',
    category: c.category || 'Linux & Systems',
    level: normalizedLevel,
    duration: c.duration || '20 hrs',
    language: c.language || 'English',
    price: typeof c.price === 'number' ? c.price : 0,
    instructor: instructorObj,
    skills: Array.isArray(c.skills) ? c.skills : [],
    prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
    learningOutcomes: Array.isArray(c.learningOutcomes) ? c.learningOutcomes : [],
    status: normalizedStatus,
    visibility: c.visibility || 'public',
    featured: Boolean(c.featured),
    tags: Array.isArray(c.tags) ? c.tags : [],
    enrollmentCount: typeof c.enrollmentCount === 'number' ? c.enrollmentCount : Number(c.students || 0),
    rating: typeof c.rating === 'number' ? c.rating : 5.0,
    ratingCount: typeof c.ratingCount === 'number' ? c.ratingCount : (typeof c.reviews === 'number' ? c.reviews : 1),
    syllabus: syllabusArray,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: c.updatedAt || new Date().toISOString(),
  };
}

class CourseService {
  private localCacheKey = 'shaivika_courses_data';
  private enrollmentsKey = 'shaivika_user_enrollments';
  private pointsKey = 'shaivika_user_xp_points';
  private xpClaimsKey = 'shaivika_user_xp_claims';
  private checkpointKey = 'shaivika_user_checkpoint';

  private normalizeCourseToICourse(c: any): ICourse {
    return normalizeCourseToICourse(c);
  }

  private getStoredCourses(): ICourse[] {
    const mergedList: ICourse[] = [];
    const idSet = new Set<string>();

    // 1. Add Default Mock Courses
    for (const c of DEFAULT_COURSES) {
      const normalized = this.normalizeCourseToICourse(c);
      mergedList.push(normalized);
      idSet.add(normalized.id);
    }

    // 2. Read from 'shaivika_courses_data' (Admin Portal local storage key)
    const adminData = localStorage.getItem('shaivika_courses_data');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            const normalized = this.normalizeCourseToICourse(c);
            const existingIdx = mergedList.findIndex(
              (item) => String(item.id) === String(normalized.id) || item.slug === normalized.slug
            );
            if (existingIdx !== -1) {
              mergedList[existingIdx] = normalized;
            } else {
              mergedList.push(normalized);
            }
            idSet.add(normalized.id);
          }
        }
      } catch (e) {
        console.warn('Error parsing shaivika_courses_data:', e);
      }
    }

    // 3. Read from 'shaivika_enterprise_courses' (Student Portal legacy cache key)
    const studentData = localStorage.getItem('shaivika_enterprise_courses');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        if (Array.isArray(parsed)) {
          for (const c of parsed) {
            if (c.id === 'course_ai_llm_202' || c.id === 'course_devops_303') {
              continue;
            }
            const normalized = this.normalizeCourseToICourse(c);
            const existingIdx = mergedList.findIndex(
              (item) => String(item.id) === String(normalized.id) || item.slug === normalized.slug
            );
            if (existingIdx !== -1) {
              mergedList[existingIdx] = {
                ...normalized,
                ...mergedList[existingIdx],
                progress: c.progress !== undefined ? c.progress : mergedList[existingIdx].progress,
                isEnrolled: c.isEnrolled !== undefined ? c.isEnrolled : mergedList[existingIdx].isEnrolled,
              };
            } else {
              mergedList.push(normalized);
            }
            idSet.add(normalized.id);
          }
        }
      } catch (e) {
        console.warn('Error parsing shaivika_enterprise_courses:', e);
      }
    }

    return mergedList;
  }

  private saveStoredCourses(courses: ICourse[]): void {
    localStorage.setItem(this.localCacheKey, JSON.stringify(courses));
  }

  private getStoredEnrollments(): Record<string, EnrollmentRecord[]> {
    const data = localStorage.getItem(this.enrollmentsKey);
    if (data) {
      try {
        const parsed: Record<string, EnrollmentRecord[]> = JSON.parse(data);
        let modified = false;
        Object.keys(parsed).forEach((userKey) => {
          const original = parsed[userKey];
          const filtered = original.filter(
            (e) => e.courseId !== 'course_ai_llm_202' && e.courseId !== 'course_devops_303'
          );
          if (filtered.length !== original.length) {
            parsed[userKey] = filtered;
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(this.enrollmentsKey, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {}
    }
    const defaultEnrollments: Record<string, EnrollmentRecord[]> = {};
    localStorage.setItem(this.enrollmentsKey, JSON.stringify(defaultEnrollments));
    return defaultEnrollments;
  }

  private saveStoredEnrollments(records: Record<string, EnrollmentRecord[]>): void {
    localStorage.setItem(this.enrollmentsKey, JSON.stringify(records));
  }

  getUserXPPoints(userId = 'default_student'): number {
    const claims = this.getXPClaimLogs(userId);
    return claims.reduce((sum, c) => sum + (c.xp || 0), 0);
  }

  addXPPoints(points: number, userId = 'default_student'): number {
    const current = this.getUserXPPoints(userId);
    const updated = current + points;
    localStorage.setItem(`${this.pointsKey}_${userId}`, String(updated));
    return updated;
  }

  getXPClaimLogs(userId = 'default_student'): XPClaimRecord[] {
    const data = localStorage.getItem(`${this.xpClaimsKey}_${userId}`);
    if (data) {
      try {
        const parsed: XPClaimRecord[] = JSON.parse(data);
        const filtered = parsed.filter(
          (c) => c.id !== 'claim_1' && c.id !== 'claim_2' && c.id !== 'claim_3' && c.id !== 'claim_4'
        );
        if (filtered.length !== parsed.length) {
          localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(filtered));
        }
        return filtered;
      } catch (e) {}
    }
    const initialClaims: XPClaimRecord[] = [];
    localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(initialClaims));
    return initialClaims;
  }

  addXPClaim(claim: XPClaimRecord, userId = 'default_student'): XPClaimRecord[] {
    const current = this.getXPClaimLogs(userId);
    const updated = [claim, ...current];
    localStorage.setItem(`${this.xpClaimsKey}_${userId}`, JSON.stringify(updated));
    return updated;
  }

  getCourseCheckpoint(courseId: string, userId = 'default_student'): CourseProgressCheckpoint | null {
    const data = localStorage.getItem(`${this.checkpointKey}_${courseId}_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return null;
  }

  saveCourseCheckpoint(courseId: string, checkpoint: CourseProgressCheckpoint, userId = 'default_student'): void {
    localStorage.setItem(`${this.checkpointKey}_${courseId}_${userId}`, JSON.stringify(checkpoint));

    const enrollments = this.getStoredEnrollments();
    const userRecs = enrollments[userId] || [];
    const updatedRecs = userRecs.map((rec) =>
      rec.courseId === courseId ? { ...rec, progress: checkpoint.progressPercent } : rec
    );
    enrollments[userId] = updatedRecs;
    this.saveStoredEnrollments(enrollments);
  }

  async getCourses(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    // Try API first
    try {
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.category) params.append('category', options.category);
      if (options.level) params.append('level', options.level);
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));

      const res = await fetch(`${API_BASE_URL}/courses?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {}

    // Try Firestore directly if available
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const loaded: ICourse[] = [];
        querySnapshot.forEach((docSnap) => {
          loaded.push(this.normalizeCourseToICourse({ id: docSnap.id, ...docSnap.data() }));
        });
        if (loaded.length > 0) {
          localStorage.setItem('shaivika_courses_data', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn('Firestore fetch in getCourses failed, falling back to localStorage:', err);
      }
    }

    let list = this.getStoredCourses();

    if (options.status && options.status !== 'all') {
      list = list.filter((c) => c.status === options.status);
    }
    if (options.category && options.category !== 'All') {
      const selectedCat = options.category.toLowerCase();
      list = list.filter((c) => {
        const courseCat = c.category.toLowerCase();
        return courseCat === selectedCat ||
               (selectedCat.includes('development') && courseCat.includes('development')) ||
               (selectedCat.includes('linux') && courseCat.includes('linux')) ||
               (selectedCat.includes('sys') && courseCat.includes('sys'));
      });
    }
    if (options.level && options.level !== 'all') {
      list = list.filter((c) => c.level === options.level || c.level === 'all_levels');
    }
    if (options.search) {
      const term = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.shortDescription.toLowerCase().includes(term) ||
          c.category.toLowerCase().includes(term) ||
          c.skills.some((s) => s.toLowerCase().includes(term))
      );
    }

    const page = options.page || 1;
    const limit = options.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      courses: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getCourseBySlugOrId(idOrSlug: string): Promise<ICourse | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${idOrSlug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    return list.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || null;
  }

  async createCourse(dto: CreateCourseDTO): Promise<ICourse> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...dto, price: 0 }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    const id = `course_${Date.now()}`;
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const created: ICourse = {
      ...dto,
      id,
      slug,
      price: 0,
      banner: dto.banner || '',
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      skills: dto.skills || [],
      prerequisites: dto.prerequisites || [],
      learningOutcomes: dto.learningOutcomes || [],
      syllabus: dto.syllabus || [],
      tags: dto.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [created, ...list];
    this.saveStoredCourses(updatedList);

    if (db) {
      try {
        await setDoc(doc(db, 'courses', id), created);
      } catch (err) {}
    }

    return created;
  }

  async updateCourse(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {}

    const list = this.getStoredCourses();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated: ICourse = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    this.saveStoredCourses(list);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', id), updated as any);
      } catch (err) {}
    }

    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('shaivika_auth_token');
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return true;
    } catch (e) {}

    const list = this.getStoredCourses();
    const filtered = list.filter((c) => c.id !== id);
    this.saveStoredCourses(filtered);

    if (db) {
      try {
        await deleteDoc(doc(db, 'courses', id));
      } catch (err) {}
    }

    return true;
  }

  async publishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'published' });
  }

  async unpublishCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'draft' });
  }

  async archiveCourse(id: string): Promise<ICourse | null> {
    return this.updateCourse(id, { status: 'archived' });
  }

  async duplicateCourse(id: string): Promise<ICourse | null> {
    const existing = await this.getCourseBySlugOrId(id);
    if (!existing) return null;

    const dto: CreateCourseDTO = {
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      shortDescription: existing.shortDescription,
      description: existing.description,
      thumbnail: existing.thumbnail,
      banner: existing.banner,
      category: existing.category,
      level: existing.level,
      duration: existing.duration,
      language: existing.language,
      price: 0,
      instructor: existing.instructor,
      skills: existing.skills,
      prerequisites: existing.prerequisites,
      learningOutcomes: existing.learningOutcomes,
      status: 'draft',
      visibility: existing.visibility,
      featured: false,
      tags: existing.tags,
      syllabus: existing.syllabus,
    };

    return this.createCourse(dto);
  }

  // --- Dynamic Enrollment & Completion Methods ---

  isCourseEnrolled(courseId: string, userId = 'default_student'): boolean {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];
    return userRecords.some((r) => r.courseId === courseId);
  }

  async enrollCourse(courseId: string, userId = 'default_student'): Promise<{ success: boolean; message: string; isEnrolled: boolean }> {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];

    const existingIndex = userRecords.findIndex((r) => r.courseId === courseId);
    if (existingIndex !== -1) {
      return {
        success: true,
        message: 'You are already enrolled in this course track!',
        isEnrolled: true,
      };
    }

    const newRecord: EnrollmentRecord = {
      courseId,
      progress: 10,
      enrolledAt: new Date().toISOString(),
    };

    all[userId] = [newRecord, ...userRecords];
    this.saveStoredEnrollments(all);

    const courses = this.getStoredCourses();
    const target = courses.find((c) => c.id === courseId);
    if (target) {
      target.enrollmentCount = (target.enrollmentCount || 0) + 1;
      this.saveStoredCourses(courses);
    }

    return {
      success: true,
      message: 'Enrolled successfully! You now have full access to this course.',
      isEnrolled: true,
    };
  }

  async getEnrolledCourses(userId = 'default_student'): Promise<ICourse[]> {
    const allEnrollments = this.getStoredEnrollments();
    const userRecords = allEnrollments[userId] || [];

    const courses = this.getStoredCourses();
    const enrolledList: ICourse[] = [];

    for (const record of userRecords) {
      const course = courses.find((c) => c.id === record.courseId);
      if (course) {
        enrolledList.push({
          ...course,
          progress: record.progress,
          isEnrolled: true,
        });
      }
    }

    return enrolledList;
  }

  async updateCourseProgress(courseId: string, progress: number, userId = 'default_student'): Promise<void> {
    const all = this.getStoredEnrollments();
    const userRecords = all[userId] || [];
    const index = userRecords.findIndex((r) => r.courseId === courseId);
    if (index !== -1) {
      userRecords[index].progress = Math.min(100, Math.max(0, progress));
      all[userId] = userRecords;
      this.saveStoredEnrollments(all);
    }
  }

  async bookmarkCourse(courseId: string, userId = 'default_student'): Promise<{ bookmarked: boolean }> {
    const key = `bookmark_${userId}_${courseId}`;
    const current = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, String(!current));
    return { bookmarked: !current };
  }
}

export const courseService = new CourseService();
