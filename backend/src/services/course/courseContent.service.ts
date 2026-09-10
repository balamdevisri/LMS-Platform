import { db } from '../../firebase';
import { CourseModuleDoc, CourseLessonDoc, CourseContentSummary, LessonQueryOptions } from '../../types/courseContent.types';
import { fromDocument, toDocument } from '../../utils/firestore';
import { ApiError } from '../../utils/ApiError';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class CourseContentService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlMs = this.DEFAULT_TTL_MS): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public invalidateCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retrieves all modules for a given course, ordered by 'orderIndex' ascending.
   * Canonical path: courses/{courseId}/modules
   */
  async getCourseModules(courseId: string): Promise<CourseModuleDoc[]> {
    const cacheKey = `modules:${courseId}`;
    const cached = this.getFromCache<CourseModuleDoc[]>(cacheKey);
    if (cached) return cached;

    try {
      // Canonical Subcollection Query: courses/{courseId}/modules
      const snapshot = await db.collection('courses').doc(courseId).collection('modules').get();

      if (!snapshot || snapshot.empty) {
        return [];
      }

      const modules: CourseModuleDoc[] = [];
      for (const doc of snapshot.docs) {
        const raw = fromDocument<any>(doc);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        let lessons = raw.lessons;
        if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
          try {
            const lessonsSnap = await db
              .collection('courses')
              .doc(courseId)
              .collection('modules')
              .doc(doc.id)
              .collection('lessons')
              .get();
            if (lessonsSnap && !lessonsSnap.empty) {
              lessons = lessonsSnap.docs.map(lDoc => {
                const lRaw = fromDocument<any>(lDoc);
                const lIdx = lRaw.orderIndex ?? lRaw.order ?? 1;
                return {
                  ...lRaw,
                  orderIndex: lIdx,
                  order: lIdx,
                };
              });
              lessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
            }
          } catch (e) {}
        }
        modules.push({
          ...raw,
          orderIndex: idx,
          order: idx,
          revision: raw.revision ?? 1,
          lessons: lessons || [],
        });
      }

      modules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      this.setCache(cacheKey, modules);
      return modules;
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
      return [];
    }
  }

  /**
   * Retrieves lessons for a given module.
   * If includeContent is false (default), excludes massive reading content string.
   * Canonical path: courses/{courseId}/modules/{moduleId}/lessons
   */
  async getModuleLessons(courseId: string, moduleId: string, options: LessonQueryOptions = {}): Promise<CourseLessonDoc[]> {
    const includeContent = options.includeContent === true;
    const cacheKey = `lessons:${courseId}:${moduleId}:${includeContent}`;
    const cached = this.getFromCache<CourseLessonDoc[]>(cacheKey);
    if (cached) return cached;

    try {
      // Canonical Subcollection Query: courses/{courseId}/modules/{moduleId}/lessons
      const snapshot = await db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .get();

      if (!snapshot || snapshot.empty) {
        return [];
      }

      const lessons: CourseLessonDoc[] = [];
      snapshot.forEach((doc) => {
        const raw = fromDocument<any>(doc);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        const normalized: CourseLessonDoc = {
          ...raw,
          orderIndex: idx,
          order: idx,
          revision: raw.revision ?? 1,
        };
        if (!includeContent) {
          // Remove heavy content payload for lightweight summary
          const { content, ...summary } = normalized;
          lessons.push(summary as CourseLessonDoc);
        } else {
          lessons.push(normalized);
        }
      });

      lessons.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      this.setCache(cacheKey, lessons);
      return lessons;
    } catch (error) {
      console.error(`Error fetching lessons for module ${moduleId}:`, error);
      return [];
    }
  }

  /**
   * Retrieves full lesson content by lessonId.
   * Canonical path: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string): Promise<CourseLessonDoc | null> {
    const cacheKey = `lesson:${courseId || 'any'}:${moduleId || 'any'}:${lessonId}`;
    const cached = this.getFromCache<CourseLessonDoc>(cacheKey);
    if (cached) return cached;

    try {
      if (courseId && moduleId) {
        const subDoc = await db
          .collection('courses')
          .doc(courseId)
          .collection('modules')
          .doc(moduleId)
          .collection('lessons')
          .doc(lessonId)
          .get();
        if (subDoc.exists) {
          const raw = fromDocument<any>(subDoc);
          const idx = raw.orderIndex ?? raw.order ?? 1;
          const lesson: CourseLessonDoc = {
            ...raw,
            orderIndex: idx,
            order: idx,
            revision: raw.revision ?? 1,
          };
          this.setCache(cacheKey, lesson);
          return lesson;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching lesson ${lessonId}:`, error);
      return null;
    }
  }

  /**
   * Recalculates totalLessons and durationHours across all modules in this course and updates the course document.
   */
  async syncCourseStats(courseId: string): Promise<void> {
    try {
      const modulesSnapshot = await db.collection('courses').doc(courseId).collection('modules').get();
      let totalLessons = 0;
      let totalReadMinutes = 0;

      for (const modDoc of modulesSnapshot.docs) {
        const lessonsSnap = await modDoc.ref.collection('lessons').get();
        totalLessons += lessonsSnap.size;
        lessonsSnap.forEach((lDoc) => {
          const lData = lDoc.data();
          const readMin = lData.estimatedReadMinutes || lData.durationMinutes || 15;
          totalReadMinutes += Number(readMin) || 15;
        });
      }

      const durationHours = Math.max(1, Math.round(totalReadMinutes / 60));

      await db.collection('courses').doc(courseId).set(
        toDocument({
          totalLessons,
          durationHours,
          totalDurationMinutes: totalReadMinutes,
          updatedAt: new Date(),
        }),
        { merge: true }
      );
    } catch (err) {
      console.warn(`Could not sync course stats for ${courseId}:`, err);
    }
  }

  /**
   * Creates or updates a module document in Firestore with optimistic concurrency check.
   * Canonical write target: courses/{courseId}/modules/{moduleId}
   */
  async saveModule(courseId: string, moduleDoc: CourseModuleDoc): Promise<CourseModuleDoc> {
    const orderIndex = moduleDoc.orderIndex ?? moduleDoc.order ?? 1;
    const docRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleDoc.id);

    const existingSnap = await docRef.get();
    let currentRevision = 0;
    if (existingSnap.exists) {
      const data = existingSnap.data() || {};
      currentRevision = typeof data.revision === 'number' ? data.revision : 1;
    }

    if (moduleDoc.expectedRevision !== undefined && existingSnap.exists) {
      if (currentRevision !== moduleDoc.expectedRevision) {
        throw new ApiError(
          409,
          `Conflict: Module "${moduleDoc.id}" was modified by another session. Current revision is ${currentRevision}, but expected ${moduleDoc.expectedRevision}.`
        );
      }
    }

    const nextRevision = currentRevision + 1;
    const now = new Date().toISOString();

    const cleanDoc = toDocument({
      ...moduleDoc,
      courseId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    });
    delete (cleanDoc as any).expectedRevision;

    // Primary Canonical Subcollection: courses/{courseId}/modules/{moduleId}
    await docRef.set(cleanDoc, { merge: true });

    this.invalidateCache(`modules:${courseId}`);
    await this.syncCourseStats(courseId);

    return {
      ...moduleDoc,
      courseId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates or updates a lesson document in Firestore with optimistic concurrency check and atomic parent stats sync.
   * Canonical write target: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc): Promise<CourseLessonDoc> {
    const orderIndex = lessonDoc.orderIndex ?? lessonDoc.order ?? 1;
    const docRef = db
      .collection('courses')
      .doc(courseId)
      .collection('modules')
      .doc(moduleId)
      .collection('lessons')
      .doc(lessonDoc.id);

    const existingSnap = await docRef.get();
    let currentRevision = 0;
    if (existingSnap.exists) {
      const data = existingSnap.data() || {};
      currentRevision = typeof data.revision === 'number' ? data.revision : 1;
    }

    if (lessonDoc.expectedRevision !== undefined && existingSnap.exists) {
      if (currentRevision !== lessonDoc.expectedRevision) {
        throw new ApiError(
          409,
          `Conflict: Lesson "${lessonDoc.id}" was modified by another session. Current revision is ${currentRevision}, but expected ${lessonDoc.expectedRevision}.`
        );
      }
    }

    const nextRevision = currentRevision + 1;
    const now = new Date().toISOString();

    const cleanDoc = toDocument({
      ...lessonDoc,
      courseId,
      moduleId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    });
    delete (cleanDoc as any).expectedRevision;

    // Primary Canonical Subcollection: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
    await docRef.set(cleanDoc, { merge: true });

    this.invalidateCache(`lessons:${courseId}:${moduleId}`);
    this.invalidateCache(`lesson:${courseId}:${moduleId}:${lessonDoc.id}`);

    // Synchronize parent course metadata
    await this.syncCourseStats(courseId);

    return {
      ...lessonDoc,
      courseId,
      moduleId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    };
  }

  /**
   * Atomic batched reorder for all affected lessons.
   */
  async batchReorderLessons(
    courseId: string,
    updates: Array<{ lessonId: string; moduleId: string; order: number; orderIndex?: number; moduleTitle?: string }>
  ): Promise<void> {
    const batch = db.batch();
    for (const item of updates) {
      const idx = item.orderIndex ?? item.order;
      const lessonRef = db
        .collection('courses')
        .doc(courseId)
        .collection('modules')
        .doc(item.moduleId)
        .collection('lessons')
        .doc(item.lessonId);

      const payload: any = {
        order: idx,
        orderIndex: idx,
        updatedAt: new Date(),
      };
      if (item.moduleTitle) {
        payload.moduleTitle = item.moduleTitle;
      }
      batch.set(lessonRef, toDocument(payload), { merge: true });
    }

    // Also update parent course updatedAt
    const courseRef = db.collection('courses').doc(courseId);
    batch.set(courseRef, toDocument({ updatedAt: new Date() }), { merge: true });

    await batch.commit();
    this.invalidateCache(`lessons:${courseId}`);
    this.invalidateCache(`modules:${courseId}`);
  }

  /**
   * Deletes a canonical lesson, re-sequences remaining lessons in the module with batched write, and updates course stats.
   * Canonical target: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string): Promise<boolean> {
    try {
      if (courseId && moduleId) {
        const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
        const lessonRef = moduleRef.collection('lessons').doc(lessonId);

        // Fetch remaining lessons to re-sequence without gaps
        const remainingLessonsSnap = await moduleRef.collection('lessons').get();
        const batch = db.batch();

        batch.delete(lessonRef);

        let seq = 1;
        const otherDocs = remainingLessonsSnap.docs
          .filter((d) => d.id !== lessonId)
          .sort((a, b) => (a.data().orderIndex ?? a.data().order ?? 0) - (b.data().orderIndex ?? b.data().order ?? 0));

        for (const doc of otherDocs) {
          batch.set(
            doc.ref,
            toDocument({
              order: seq,
              orderIndex: seq,
              updatedAt: new Date(),
            }),
            { merge: true }
          );
          seq++;
        }

        await batch.commit();

        this.invalidateCache(`lesson:${courseId}:${moduleId}:${lessonId}`);
        this.invalidateCache(`lessons:${courseId}:${moduleId}`);

        await this.syncCourseStats(courseId);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting lesson ${lessonId}:`, error);
      return false;
    }
  }

  /**
   * Cascading module deletion: removes all nested lessons, the module doc, and syncs course stats.
   */
  async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
    try {
      const moduleRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId);
      const lessonsSnap = await moduleRef.collection('lessons').get();

      const batch = db.batch();
      lessonsSnap.forEach((lDoc) => {
        batch.delete(lDoc.ref);
      });
      batch.delete(moduleRef);

      await batch.commit();

      this.invalidateCache(`modules:${courseId}`);
      this.invalidateCache(`lessons:${courseId}:${moduleId}`);

      await this.syncCourseStats(courseId);
      return true;
    } catch (error) {
      console.error(`Error deleting module ${moduleId}:`, error);
      return false;
    }
  }
}

export const courseContentService = new CourseContentService();
