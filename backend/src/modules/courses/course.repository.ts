import { db, isFirebaseAdminInitialized } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';
import { ApiError } from '../../utils/ApiError';
import { firestoreRest } from '../../services/firestore/firestoreRestClient';

export const CANONICAL_ALIASES: Record<string, string> = {
  'git-github-mastery': 'git-github-mastery-course-id',
  'linux-systems-administration-mastery': 'course_linux_101',
  '1': 'course_linux_101',
  'dbms-beginner-to-advanced': 'database-management-system',
  'c-programming': 'c-programming-course-id',
  'kubernetes-complete-course': 'kubernetes-complete-course-beginner-to-advanced',
  'python-through-oops': 'python-through-oops-course-id',
  'java-through-oops': 'java-through-oops-course-id',
  'web-development': 'web-development-fundamentals',
  'javascript': 'javascript-mastery',
  'nodejs': 'nodejs-backend-development',
};

export function resolveCanonicalId(idOrSlug: string): string {
  if (!idOrSlug) return idOrSlug;
  const target = idOrSlug.trim();
  return CANONICAL_ALIASES[target] || CANONICAL_ALIASES[target.toLowerCase()] || target;
}

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

  async create(data: CreateCourseDTO, userId?: string, authToken?: string): Promise<ICourse> {
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

    if (docRef && isFirebaseAdminInitialized()) {
      try {
        await docRef.set(newCourse);
      } catch (err: any) {
        console.warn(`[CourseRepository] Admin SDK create notice for ${id}:`, err?.message || err);
        await firestoreRest.setDocument(`courses/${id}`, newCourse, { merge: true }, authToken);
      }
    } else {
      await firestoreRest.setDocument(`courses/${id}`, newCourse, { merge: true }, authToken);
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
        }, authToken).catch(() => {});
      })
      .catch(() => {});

    return newCourse;
  }

  async findById(id: string, minExpectedVersion?: number, authToken?: string): Promise<ICourse | null> {
    const canonicalId = resolveCanonicalId(id);
    const cacheKey = `id:${canonicalId}`;
    const cached = this.getFromCache(this.courseCache, cacheKey, minExpectedVersion);
    if (cached !== null) return cached;

    let docData: any = null;
    let docId = canonicalId;

    if (this.collection && isFirebaseAdminInitialized()) {
      try {
        let docSnap = await this.collection.doc(canonicalId).get();
        if (!docSnap.exists && canonicalId !== id) {
          docSnap = await this.collection.doc(id).get();
          if (docSnap.exists) docId = id;
        }
        if (docSnap.exists) {
          docData = { ...docSnap.data(), id: docId };
        }
      } catch (err: any) {
        // Fall through to Firestore REST client
      }
    }

    if (!docData) {
      const restDoc = await firestoreRest.getDocument(`courses/${canonicalId}`, authToken);
      if (restDoc) {
        docData = restDoc;
      } else if (canonicalId !== id) {
        docData = await firestoreRest.getDocument(`courses/${id}`, authToken);
      }
    }

    if (!docData) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc(docData);
    const version = course.version ?? course.revision ?? 1;
    this.setInCache(this.courseCache, cacheKey, course, version);
    if (course.slug) {
      this.setInCache(this.courseCache, `slug:${course.slug.toLowerCase()}`, course, version);
    }
    return course;
  }

  async findBySlug(slug: string, minExpectedVersion?: number, authToken?: string): Promise<ICourse | null> {
    const canonicalSlug = resolveCanonicalId(slug);
    const cacheKey = `slug:${canonicalSlug.toLowerCase()}`;
    const cached = this.getFromCache(this.courseCache, cacheKey, minExpectedVersion);
    if (cached !== null) return cached;

    let docData: any = null;

    if (this.collection && isFirebaseAdminInitialized()) {
      try {
        let snapshot = await this.collection.where('slug', '==', canonicalSlug).limit(1).get();
        if (snapshot.empty && canonicalSlug !== slug) {
          snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
        }
        if (!snapshot.empty) {
          docData = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id };
        }
      } catch (err: any) {
        // Fall through to REST / findById
      }
    }

    if (!docData) {
      const byId = await this.findById(canonicalSlug, minExpectedVersion, authToken);
      if (byId) return byId;

      const allCourses = await this.findAll({ limit: 100 }, authToken);
      const found = allCourses.courses.find(
        (c) => c.slug === canonicalSlug || c.slug === slug || c.id === canonicalSlug || c.id === slug
      );
      if (found) {
        docData = found;
      }
    }

    if (!docData) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc(docData);
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
    userId?: string,
    authToken?: string
  ): Promise<ICourse | null> {
    let existing = await this.findById(id, undefined, authToken);
    let docId = id;
    if (!existing) {
      existing = await this.findBySlug(id, undefined, authToken);
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

    const docRef = this.collection ? this.collection.doc(docId) : null;
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

      let created = false;
      if (docRef && isFirebaseAdminInitialized()) {
        try {
          await docRef.set(newCourseDoc, { merge: true });
          created = true;
        } catch (err: any) {
          console.warn(`[CourseRepository] Admin SDK set failed for ${docId}:`, err?.message || err);
        }
      }
      if (!created) {
        await firestoreRest.setDocument(`courses/${docId}`, newCourseDoc, { merge: true }, authToken);
      }

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
          }, authToken).catch(() => {});
        })
        .catch(() => {});

      return newCourseDoc as ICourse;
    }

    let saved = false;
    if (docRef && isFirebaseAdminInitialized()) {
      try {
        await docRef.set(updatedData, { merge: true });
        saved = true;
      } catch (err: any) {
        console.warn(`[CourseRepository] Admin SDK set failed for ${docId} (${err?.message || err}). Falling back to Firestore REST...`);
      }
    }
    if (!saved) {
      await firestoreRest.setDocument(`courses/${docId}`, updatedData, { merge: true }, authToken);
    }

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
        }, authToken).catch(() => {});
      })
      .catch(() => {});

    return finalMerged;
  }

  async delete(id: string, userId?: string, hardDelete: boolean = false, authToken?: string): Promise<boolean> {
    let existing = await this.findById(id, undefined, authToken);
    let docId = id;
    if (!existing) {
      existing = await this.findBySlug(id, undefined, authToken);
      if (existing) docId = existing.id;
    }

    if (!existing) return false;

    const now = new Date().toISOString();
    let deleted = false;

    if (this.collection && isFirebaseAdminInitialized()) {
      try {
        if (hardDelete) {
          await this.collection.doc(docId).delete();
        } else {
          await this.collection.doc(docId).set({
            isDeleted: true,
            deletedAt: now,
            deletedBy: userId || 'admin',
          }, { merge: true });
        }
        deleted = true;
      } catch (err: any) {
        console.warn(`[CourseRepository] Admin SDK delete notice for ${docId}:`, err?.message || err);
      }
    }

    if (!deleted) {
      if (hardDelete) {
        await firestoreRest.deleteDocument(`courses/${docId}`, authToken);
      } else {
        await firestoreRest.setDocument(`courses/${docId}`, {
          isDeleted: true,
          deletedAt: now,
          deletedBy: userId || 'admin',
        }, { merge: true }, authToken);
      }
    }

    console.log(`[COURSE_DELETED] courseId="${docId}", hard=${hardDelete}, userId="${userId}"`);
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
        }, authToken).catch(() => {});
      })
      .catch(() => {});

    return true;
  }

  async findAll(options: CourseFilterOptions = {}, authToken?: string): Promise<CoursePaginationResult> {
    const cacheKey = `catalog:${JSON.stringify(options)}`;
    const cached = this.getFromCache(this.catalogCache, cacheKey);
    if (cached) return cached;

    const page = Math.max(1, Number(options.page) || 1);
    const limit = options.limit !== undefined && options.limit !== null
      ? Math.max(1, Math.min(100, Number(options.limit)))
      : 100;

    let rawDocs: any[] = [];

    if (this.collection && isFirebaseAdminInitialized()) {
      try {
        const snapshot = await this.collection.get();
        if (snapshot && !snapshot.empty) {
          rawDocs = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
            ...doc.data(),
            id: doc.id,
          }));
        }
      } catch (err: any) {
        console.warn('[CourseRepository] Admin SDK findAll notice:', err?.message || err);
      }
    }

    if (rawDocs.length === 0) {
      rawDocs = await firestoreRest.getCollection('courses', {}, authToken);
    }

    let courses: ICourse[] = rawDocs
      .map((doc: any) =>
        this.sanitizeForCatalog({
          ...doc,
          id: doc.id,
        })
      )
      // Exclude soft-deleted courses and duplicate/mock courses
      .filter((c: any) => {
        if (c.isDeleted === true) return false;
        const id = String(c.id || '');
        const isAutoGeneratedId = /^[A-Za-z0-9]{20}$/.test(id);
        const isTestTitle = /test|draft|dummy|sample/i.test(c.title || '');
        if (isAutoGeneratedId && (isTestTitle || (!c.modules || c.modules.length === 0))) {
          return false;
        }
        return true;
      });

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

export const courseRepository = new CourseRepository();

