import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { ICourse, CreateCourseDTO, UpdateCourseDTO, CourseFilterOptions, CoursePaginationResult } from '../../types/course';

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
    const { modules, ...lightweight } = raw || {};
    const title = lightweight.title || 'Untitled Technical Course';
    const thumbnail = lightweight.thumbnail || lightweight.thumbnailUrl || lightweight.image || lightweight.imageUrl || lightweight.banner || '';
    const description = lightweight.description || lightweight.fullDescription || lightweight.shortDescription || lightweight.overview || '';
    const shortDescription = lightweight.shortDescription || description.slice(0, 160) || 'Comprehensive technical learning track.';

    return {
      ...lightweight,
      title,
      thumbnail,
      banner: lightweight.banner || thumbnail,
      description: description || title,
      shortDescription,
      price: typeof lightweight.price === 'number' ? lightweight.price : 0,
      skills: Array.isArray(lightweight.skills) ? lightweight.skills : [],
      prerequisites: Array.isArray(lightweight.prerequisites) ? lightweight.prerequisites : [],
      learningOutcomes: Array.isArray(lightweight.learningOutcomes) ? lightweight.learningOutcomes : [],
    } as ICourse;
  }

  async create(data: CreateCourseDTO): Promise<ICourse> {
    const docRef = this.collection ? this.collection.doc() : null;
    const now = new Date().toISOString();
    const id = docRef ? docRef.id : data.id || `course_${Date.now()}`;

    const newCourse: ICourse = {
      ...data,
      id,
      slug: data.slug || this.generateSlug(data.title),
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
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

  async update(id: string, updates: UpdateCourseDTO): Promise<ICourse | null> {
    if (!this.collection) return null;
    const docRef = this.collection.doc(id);
    const existing = await this.findById(id);

    const updatedData: Partial<ICourse> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title && !updates.slug) {
      updatedData.slug = this.generateSlug(updates.title);
    }

    if (!existing) {
      const newCourseDoc = {
        id,
        enrollmentCount: 0,
        rating: 5.0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        ...updatedData,
      };
      await docRef.set(newCourseDoc, { merge: true });
      this.invalidateCache();
      return newCourseDoc as ICourse;
    }

    await docRef.set(updatedData, { merge: true });
    this.invalidateCache();
    return { ...existing, ...updatedData } as ICourse;
  }

  async delete(id: string): Promise<boolean> {
    if (!this.collection) return false;
    await this.collection.doc(id).delete();
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
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 10));

    // If search term is present, perform bounded fetch with in-memory substring matching
    if (options.search) {
      const term = options.search.toLowerCase().trim();
      const snapshot = await this.collection.limit(100).get();
      let courses: ICourse[] = snapshot.docs.map((doc: QueryDocumentSnapshot) =>
        this.sanitizeForCatalog({
          ...doc.data(),
          id: doc.id,
        })
      );

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

      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(term)) ||
          (c.description && c.description.toLowerCase().includes(term)) ||
          c.category.toLowerCase().includes(term) ||
          (c.skills && c.skills.some((s) => s.toLowerCase().includes(term)))
      );

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

    // Direct Firestore Query with limit() and offset() pagination
    let baseQuery: any = this.collection;

    if (options.status && options.status !== 'all') {
      baseQuery = baseQuery.where('status', '==', options.status.toLowerCase());
    }

    if (options.featured) {
      baseQuery = baseQuery.where('featured', '==', true);
    }

    // Determine total count
    let total = 0;
    try {
      const countSnap = await baseQuery.count().get();
      total = countSnap.data().count;
    } catch (e) {
      const allSnap = await baseQuery.get();
      total = allSnap.size;
    }

    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const pagedSnap = await baseQuery.limit(limit).offset(offset).get();
    const paginatedCourses: ICourse[] = pagedSnap.docs.map((doc: QueryDocumentSnapshot) =>
      this.sanitizeForCatalog({
        ...doc.data(),
        id: doc.id,
      })
    );

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
