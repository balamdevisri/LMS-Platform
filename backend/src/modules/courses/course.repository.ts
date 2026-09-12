import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';
import { ApiError } from '../../utils/ApiError';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CourseRepository {
  private collectionName = 'courses';
  private readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes bounded TTL
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
   * Helper to retrieve from bounded cache
   */
  private getFromCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cacheMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cacheMap.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Helper to save to bounded cache with LRU eviction guard
   */
  private setInCache<T>(cacheMap: Map<string, CacheEntry<T>>, key: string, data: T): void {
    if (cacheMap.size >= this.MAX_CACHE_ENTRIES) {
      const firstKey = cacheMap.keys().next().value;
      if (firstKey) cacheMap.delete(firstKey);
    }
    cacheMap.set(key, {
      data,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }

  /**
   * Invalidates course catalog and individual course caches on mutation
   */
  public invalidateCache(): void {
    this.catalogCache.clear();
    this.courseCache.clear();
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

    return {
      ...rawData,
      title,
      thumbnail,
      banner: rawData.banner || thumbnail,
      description: description || title,
      shortDescription,
      price: typeof rawData.price === 'number' ? rawData.price : 0,
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
    return newCourse;
  }

  async findById(id: string): Promise<ICourse | null> {
    const cacheKey = `id:${id}`;
    const cached = this.getFromCache(this.courseCache, cacheKey);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const docSnap = await this.collection.doc(id).get();
    if (!docSnap.exists) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc({ ...docSnap.data(), id: docSnap.id });
    this.setInCache(this.courseCache, cacheKey, course);
    return course;
  }

  async findBySlug(slug: string): Promise<ICourse | null> {
    const cacheKey = `slug:${slug.toLowerCase()}`;
    const cached = this.getFromCache(this.courseCache, cacheKey);
    if (cached !== null) return cached;

    if (!this.collection) return null;
    const snapshot = await this.collection.where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
      this.setInCache(this.courseCache, cacheKey, null);
      return null;
    }

    const course = this.normalizeCourseDoc({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
    this.setInCache(this.courseCache, cacheKey, course);
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
    const nextVersion = existing ? (((existing.version || existing.revision) || 1) + 1) : 1;

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
      return newCourseDoc as ICourse;
    }

    await docRef.set(updatedData, { merge: true });
    console.log(`[COURSE_UPDATED] courseId="${docId}", newVersion=${nextVersion}, userId="${userId}", timestamp="${now}"`);
    this.invalidateCache();
    return { ...existing, ...updatedData } as ICourse;
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

    if (hardDelete) {
      await this.collection.doc(docId).delete();
      console.log(`[COURSE_HARD_DELETED] courseId="${docId}", userId="${userId}"`);
    } else {
      await this.collection.doc(docId).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: userId || 'admin',
      }, { merge: true });
      console.log(`[COURSE_SOFT_DELETED] courseId="${docId}", userId="${userId}"`);
    }

    this.invalidateCache();
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
