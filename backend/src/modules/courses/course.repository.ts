import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';
import { ApiError } from '../../utils/ApiError';

interface CacheEntry<T> {
  data: T;
  version?: number;
  revision?: number;
  cachedAt: number;
  expiresAt: number;
}

export class CourseRepository {
  private collectionName = 'courses';
  private readonly CACHE_TTL_MS = 30 * 1000; // 30 seconds bounded TTL
  private readonly MAX_CACHE_ENTRIES = 100; // Safe bounded memory limit (<1MB RAM)

  private catalogCache = new Map<string, CacheEntry<CoursePaginationResult>>();
  private courseCache = new Map<string, CacheEntry<ICourse | null>>();

  private get collection() {
    if (!db || typeof db.collection !== 'function') {
      return null;
    }
    return db.collection(this.collectionName);
  }

  /**
   * Helper to retrieve from bounded cache with revision monotonicity checking
   */
  private getFromCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string, minExpectedVersion?: number): T | null {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheMap.delete(key);
      return null;
    }
    // Revision-Aware Invalidation: If cached version is older than requested minimum revision, discard immediately
    if (typeof minExpectedVersion === 'number') {
      const entryVer = entry.version ?? entry.revision;
      if (typeof entryVer === 'number' && entryVer < minExpectedVersion) {
        cacheMap.delete(key);
        return null;
      }
    }
    return entry.data;
  }

  /**
   * Helper to save to bounded cache with LRU eviction guard and anti-stale overwrite guard
   */
  private setInCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string, data: T, version?: number): void {
    const existing = cacheMap.get(key);
    const existingVer = existing?.version ?? existing?.revision;
    const incomingVer = version ?? (data as any)?.version ?? (data as any)?.revision;

    // Rule: Cache entries must never overwrite newer database revisions
    if (existing && typeof existingVer === 'number' && typeof incomingVer === 'number') {
      if (incomingVer < existingVer) {
        return;
      }
    }

    if (cacheMap.size >= this.MAX_CACHE_ENTRIES) {
      const firstKey = cacheMap.keys().next().value;
      if (firstKey) cacheMap.delete(firstKey);
    }
    cacheMap.set(key, {
      data,
      version: incomingVer,
      revision: incomingVer,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  /**
   * Invalidates course catalog, individual course caches, and content subcollection caches on mutation
   */
  public invalidateCache(courseIdOrSlug?: string): void {
    this.catalogCache.clear();
    if (!courseIdOrSlug) {
      this.courseCache.clear();
    } else {
      for (const key of Array.from(this.courseCache.keys())) {
        if (key.includes(courseIdOrSlug) || key.startsWith(`id:${courseIdOrSlug}`) || key.startsWith(`slug:${courseIdOrSlug}`)) {
          this.courseCache.delete(key);
        }
      }
    }

    // Invalidate course content cache synchronously/asynchronously
    import('../../services/course/courseContent.service')
      .then(({ courseContentService }) => {
        if (courseIdOrSlug) {
          courseContentService.invalidateCourseCache(courseIdOrSlug);
        } else {
          courseContentService.invalidateCache();
        }
      })
      .catch(() => {});
  }

  /**
   * Sanitizes and normalizes course document for lightweight catalog transport
   */
  private sanitizeForCatalog(raw: any): ICourse {
    return this.normalizeCourseDoc(raw);
  }

  private normalizeCourseDoc(raw: any): ICourse {
    const rawData = raw || {};
    const title = rawData.title || 'Untitled Technical Course';
    const thumbnail = rawData.thumbnail || rawData.thumbnailUrl || rawData.image || rawData.imageUrl || rawData.banner || '';
    const description = rawData.description || rawData.fullDescription || rawData.shortDescription || rawData.overview || '';
    const shortDescription = rawData.shortDescription || description.slice(0, 160) || 'Comprehensive technical learning track.';

    const CANONICAL_PRICES: Record<string, number> = {
      'course_linux_101': 399,
      'linux-systems-administration-mastery': 399,
      '1': 399,
      'c-programming-course-id': 199,
      'c-programming': 199,
      'git-github-mastery': 199,
      'git-github-mastery-course-id': 199,
      'database-management-system': 299,
      'dbms-beginner-to-advanced': 299,
      'kubernetes-complete-course-beginner-to-advanced': 499,
      'kubernetes-complete-course': 499,
      'react-js-complete-course': 299,
      'python-through-oops-course-id': 299,
      'python-through-oops': 299,
      'java-through-oops-course-id': 299,
      'java-through-oops': 299,
      'web-development-fundamentals': 299,
      'web-development': 299,
      'prompt-engineering': 199,
    };

    const id = String(rawData.id || rawData.courseId || '');
    const slug = String(rawData.slug || '');
    const fallbackPrice =
      CANONICAL_PRICES[id] ??
      CANONICAL_PRICES[slug] ??
      CANONICAL_PRICES[slug.toLowerCase().trim()] ??
      CANONICAL_PRICES[id.toLowerCase().trim()] ??
      0;

    const rawPrice = typeof rawData.price === 'number' ? rawData.price : undefined;
    const price = (rawPrice !== undefined && rawPrice > 0)
      ? rawPrice
      : (fallbackPrice > 0 ? fallbackPrice : (rawPrice !== undefined ? rawPrice : 0));

    return {
      ...rawData,
      title,
      thumbnail,
      banner: rawData.banner || thumbnail,
      description: description || title,
      shortDescription,
      price,
      skills: Array.isArray(rawData.skills) ? rawData.skills : [],
      prerequisites: Array.isArray(rawData.prerequisites) ? rawData.prerequisites : [],
      learningOutcomes: Array.isArray(rawData.learningOutcomes) ? rawData.learningOutcomes : [],
      modules: rawData.modules || [],
    } as ICourse;
  }

  async create(data: CreateCourseDTO, userId?: string): Promise<ICourse> {
    const docRef = this.collection ? (data.id ? this.collection.doc(data.id) : this.collection.doc()) : null;
    const now = new Date().toISOString();
    const id = docRef ? docRef.id : data.id || `course_${Date.now()}`;

    const newCourse: ICourse = {
      ...data,
      id,
      slug: data.slug || this.generateSlug(data.title),
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      version: 1,
      isDeleted: false,
      createdBy: userId || (data as any).createdBy || 'admin',
      updatedBy: userId || (data as any).updatedBy || 'admin',
      banner: data.banner || '',
      syllabus: data.syllabus || [],
      tags: data.tags || [],
      skills: data.skills || [],
      prerequisites: data.prerequisites || [],
      learningOutcomes: data.learningOutcomes || [],
      createdAt: now,
      updatedAt: now,
    };

    if (docRef) {
      await docRef.set(newCourse);
    }

    console.log(`[COURSE_CREATED] courseId="${id}", title="${newCourse.title}", version=1, userId="${userId || 'system'}", timestamp="${now}"`);
    this.invalidateCache();

    // Audit log
    import('../../services/course/courseContent.service')
      .then(({ courseContentService }) => {
        courseContentService.recordAuditLog({
          courseId: id,
          entityType: 'course',
          action: 'create',
          title: newCourse.title,
          newRevision: 1,
          adminId: userId || 'admin',
          timestamp: now,
          changesSummary: `Created course "${newCourse.title}" (Rev 1).`,
          snapshot: newCourse,
        }).catch(() => {});
      })
      .catch(() => {});

    return newCourse;
  }

  async findById(id: string, minExpectedVersion?: number): Promise<ICourse | null> {
    const cacheKey = `id:${id}`;
    const cached = this.getFromCache(this.courseCache, cacheKey, minExpectedVersion);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc({ ...docSnap.data(), id: docSnap.id });
    const version = course.version ?? course.revision ?? 1;
    this.setInCache(this.courseCache, cacheKey, course, version);
    if (course.slug) {
      this.setInCache(this.courseCache, `slug:${course.slug.toLowerCase()}`, course, version);
    }
    return course;
  }

  async findBySlug(slug: string, minExpectedVersion?: number): Promise<ICourse | null> {
    const cacheKey = `slug:${slug.toLowerCase()}`;
    const cached = this.getFromCache(this.courseCache, cacheKey, minExpectedVersion);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
    const version = course.version ?? course.revision ?? 1;
    this.setInCache(this.courseCache, cacheKey, course, version);
    if (course.id) {
      this.setInCache(this.courseCache, `id:${course.id}`, course, version);
    }
    return course;
  }

  async update(
    id: string,
    updates: UpdateCourseDTO,
    expectedVersion?: number,
    userId?: string
  ): Promise<ICourse | null> {
    if (!this.collection) return null;
    let existing = await this.findById(id);
    let docId = id;
    if (!existing) {
      existing = await this.findBySlug(id);
      if (existing) docId = existing.id;
    }

    // Concurrency Check: optimistic locking
    const targetExpectedVersion = expectedVersion ?? updates.expectedRevision;
    if (existing && typeof targetExpectedVersion === 'number' && typeof (existing.version ?? existing.revision) === 'number') {
      const currVersion = existing.version ?? existing.revision ?? 1;
      if (currVersion !== targetExpectedVersion) {
        console.warn(`[COURSE_CONFLICT] courseId="${docId}", currentVersion=${currVersion}, expectedVersion=${targetExpectedVersion}, userId="${userId}"`);
        const conflictErr: any = new Error(
          `Course was modified by another session (current version: ${currVersion}, attempted version: ${targetExpectedVersion}). Please reload latest version before saving.`
        );
        conflictErr.status = 409;
        conflictErr.code = 409;
        conflictErr.currentVersion = currVersion;
        throw conflictErr;
      }
    }

    const docRef = this.collection.doc(docId);
    const now = new Date().toISOString();
    const currentVersion = existing ? ((existing.version || existing.revision) || 1) : 0;
    const nextVersion = currentVersion + 1;

    const updatedData: Partial<ICourse> = {
      ...updates,
      version: nextVersion,
      revision: nextVersion,
      updatedBy: userId || existing?.updatedBy || 'admin',
      updatedAt: now,
    };
    delete (updatedData as any).expectedRevision;

    if (updates.title && !updates.slug) {
      updatedData.slug = this.generateSlug(updates.title);
    }

    if (!existing) {
      const newCourseDoc = {
        id: docId,
        enrollmentCount: 0,
        rating: 5.0,
        ratingCount: 0,
        version: 1,
        revision: 1,
        isDeleted: false,
        createdBy: userId || 'admin',
        createdAt: now,
        ...updatedData,
      };
      await docRef.set(newCourseDoc, { merge: true });
      console.log(`[COURSE_CREATED_ON_UPDATE] courseId="${docId}", version=1, userId="${userId}"`);
      this.invalidateCache();

      import('../../services/course/courseContent.service')
        .then(({ courseContentService }) => {
          courseContentService.recordAuditLog({
            courseId: docId,
            entityType: 'course',
            action: 'create',
            title: (newCourseDoc as any).title || docId,
            newRevision: 1,
            adminId: userId || 'admin',
            timestamp: now,
            changesSummary: `Created course document "${(newCourseDoc as any).title}".`,
            snapshot: newCourseDoc,
          }).catch(() => {});
        })
        .catch(() => {});

      return newCourseDoc as ICourse;
    }

    await docRef.set(updatedData, { merge: true });
    console.log(`[COURSE_UPDATED] courseId="${docId}", newVersion=${nextVersion}, userId="${userId}", timestamp="${now}"`);
    this.invalidateCache();

    const finalMerged = { ...existing, ...updatedData } as ICourse;

    const isPublishAction = updates.status && updates.status !== existing.status;
    const auditAction = isPublishAction
      ? (updates.status === 'published' ? 'publish' : 'unpublish')
      : 'update';

    import('../../services/course/courseContent.service')
      .then(({ courseContentService }) => {
        courseContentService.recordAuditLog({
          courseId: docId,
          entityType: 'course',
          action: auditAction,
          title: finalMerged.title,
          previousRevision: currentVersion,
          newRevision: nextVersion,
          adminId: userId || 'admin',
          timestamp: now,
          changesSummary: isPublishAction
            ? `Changed course status to "${updates.status}" (Rev ${currentVersion} -> ${nextVersion}).`
            : `Updated course details (Rev ${currentVersion} -> ${nextVersion}).`,
          snapshot: updatedData,
        }).catch(() => {});
      })
      .catch(() => {});

    return finalMerged;
  }

  async delete(id: string, userId?: string, hardDelete: boolean = false): Promise<boolean> {
    if (!this.collection) return false;
    let existing = await this.findById(id);
    let docId = id;
    if (!existing) {
      existing = await this.findBySlug(id);
      if (existing) docId = existing.id;
    }

    if (!existing) return false;

    const now = new Date().toISOString();
    if (hardDelete) {
      await this.collection.doc(docId).delete();
      console.log(`[COURSE_HARD_DELETED] courseId="${docId}", userId="${userId}"`);
    } else {
      await this.collection.doc(docId).set({
        isDeleted: true,
        deletedAt: now,
        deletedBy: userId || 'admin',
      }, { merge: true });
      console.log(`[COURSE_SOFT_DELETED] courseId="${docId}", userId="${userId}"`);
    }

    this.invalidateCache();

    import('../../services/course/courseContent.service')
      .then(({ courseContentService }) => {
        courseContentService.recordAuditLog({
          courseId: docId,
          entityType: 'course',
          action: 'delete',
          title: existing?.title || docId,
          adminId: userId || 'admin',
          timestamp: now,
          changesSummary: hardDelete ? `Hard deleted course "${docId}".` : `Soft deleted course "${existing?.title}".`,
        }).catch(() => {});
      })
      .catch(() => {});

    return true;
  }

  async findAll(options: CourseFilterOptions = {}): Promise<CoursePaginationResult> {
    const cacheKey = `catalog:${JSON.stringify(options)}`;
    const cached = this.getFromCache(this.catalogCache, cacheKey);
    if (cached) return cached;

    if (!this.collection) {
      return { courses: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    const page = Math.max(1, Number(options.page) || 1);
    const limit = options.limit !== undefined && options.limit !== null
      ? Math.max(1, Math.min(100, Number(options.limit)))
      : 100;

    const snapshot = await this.collection.get();
    let courses: ICourse[] = snapshot.docs
      .map((doc: QueryDocumentSnapshot) =>
        this.sanitizeForCatalog({
          ...doc.data(),
          id: doc.id,
        })
      )
      // Exclude soft-deleted courses from normal queries
      .filter((c: any) => c.isDeleted !== true);

    if (options.status && options.status !== 'all') {
      const sStatus = options.status.toLowerCase();
      courses = courses.filter((c) => c.status && c.status.toLowerCase() === sStatus);
    }
    if (options.category && options.category !== 'All') {
      const sCat = options.category.toLowerCase();
      courses = courses.filter((c) => c.category && c.category.toLowerCase().includes(sCat));
    }
    if (options.level && options.level !== 'all') {
      const sLvl = options.level.toLowerCase();
      courses = courses.filter((c) => c.level && (c.level.toLowerCase() === 'all_levels' || c.level.toLowerCase() === sLvl));
    }
    if (options.featured) {
      courses = courses.filter((c) => c.featured === true);
    }

    if (options.search) {
      const term = options.search.toLowerCase().trim();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(term)) ||
          (c.description && c.description.toLowerCase().includes(term)) ||
          c.category.toLowerCase().includes(term) ||
          (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
      );
    }

    const total = courses.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit);

    const result: CoursePaginationResult = {
      courses: paginatedCourses,
      total,
      page,
      limit,
      totalPages,
    };

    this.setInCache(this.catalogCache, cacheKey, result);
    return result;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
