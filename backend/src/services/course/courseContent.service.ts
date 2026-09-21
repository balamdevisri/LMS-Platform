import { db } from '../../firebase';
import { CourseModuleDoc, CourseLessonDoc, CourseContentSummary, LessonQueryOptions } from '../../types/courseContent.types';
import { fromDocument, toDocument } from '../../utils/firestore';
import { ApiError } from '../../utils/ApiError';
import { resolveCanonicalId } from '../../modules/courses/course.repository';
import { firestoreRest } from '../firestore/firestoreRestClient';

interface CacheEntry<T> {
  data: T;
  revision?: number;
  version?: number;
  maxRevision?: number;
  cachedAt: number;
  expiresAt: number;
}

export class CourseContentService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL_MS = 10 * 1000; // 10 seconds bounded TTL

  private getFromCache<T>(key: string, minExpectedRevision?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    // Revision-Aware Invalidation: If entry revision is older than required/database revision, discard immediately
    if (typeof minExpectedRevision === 'number') {
      const entryRev = entry.revision ?? entry.version ?? entry.maxRevision;
      if (typeof entryRev === 'number' && entryRev < minExpectedRevision) {
        this.cache.delete(key);
        return null;
      }
    }
    return entry.data as T;
  }

  private setCache<T>(
    key: string,
    data: T,
    options?: { revision?: number; version?: number; maxRevision?: number; ttlMs?: number }
  ): void {
    const existing = this.cache.get(key);
    const incomingRev = options?.revision ?? options?.version ?? options?.maxRevision;
    const existingRev = existing?.revision ?? existing?.version ?? existing?.maxRevision;

    // Rule: Cache entries must never overwrite newer database revisions
    if (existing && typeof existingRev === 'number' && typeof incomingRev === 'number') {
      if (incomingRev < existingRev) {
        return;
      }
    }

    const ttlMs = options?.ttlMs ?? this.DEFAULT_TTL_MS;
    this.cache.set(key, {
      data,
      revision: options?.revision,
      version: options?.version,
      maxRevision: options?.maxRevision,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  }

  public invalidateCache(target?: string): void {
    if (!target) {
      this.cache.clear();
      return;
    }
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(target) || key.includes(`:${target}`) || key.includes(`${target}:`) || key.includes(target)) {
        this.cache.delete(key);
      }
    }
  }

  public invalidateCourseCache(courseId: string, moduleId?: string, lessonId?: string): void {
    const canonicalCourseId = resolveCanonicalId(courseId);
    for (const key of Array.from(this.cache.keys())) {
      if (!courseId || courseId === 'all') {
        this.cache.delete(key);
        continue;
      }
      if (key.includes(courseId) || key.includes(canonicalCourseId)) {
        this.cache.delete(key);
        continue;
      }
      if (moduleId && key.includes(moduleId)) {
        this.cache.delete(key);
        continue;
      }
      if (lessonId && key.includes(lessonId)) {
        this.cache.delete(key);
        continue;
      }
    }
  }

  /**
   * Retrieves all modules for a given course, ordered by 'orderIndex' ascending.
   * Canonical path: courses/{courseId}/modules
   */
  async getCourseModules(courseId: string, minExpectedRevision?: number): Promise<CourseModuleDoc[]> {
    const targetCourseId = resolveCanonicalId(courseId);
    const cacheKey = `modules:${targetCourseId}`;
    const cached = this.getFromCache<CourseModuleDoc[]>(cacheKey, minExpectedRevision);
    if (cached) return cached;

    try {
      // Canonical Subcollection Query: courses/{targetCourseId}/modules
      let snapshot = await db.collection('courses').doc(targetCourseId).collection('modules').get();
      if ((!snapshot || snapshot.empty) && targetCourseId !== courseId) {
        snapshot = await db.collection('courses').doc(courseId).collection('modules').get();
      }

      if (!snapshot || snapshot.empty) {
        return [];
      }

      const modules: CourseModuleDoc[] = [];
      for (const doc of snapshot.docs) {
        const raw = fromDocument<any>(doc);
        const idx = raw.orderIndex ?? raw.order ?? 1;
        let lessons: any[] = [];

        // 1. Authoritative: Fetch from subcollection courses/{courseId}/modules/{moduleId}/lessons
        try {
          const lessonsSnap = await db
            .collection('courses')
            .doc(courseId)
            .collection('modules')
            .doc(doc.id)
            .collection('lessons')
            .get();
          if (lessonsSnap && !lessonsSnap.empty) {
            lessons = lessonsSnap.docs.map((lDoc) => {
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

        // 2. Fallback to raw.lessons only if subcollection is empty
        if (lessons.length === 0 && Array.isArray(raw.lessons) && raw.lessons.length > 0) {
          lessons = raw.lessons;
        }

        // 3. Format topics and learningUnits for compatibility with full-featured LMS editors and viewers
        let topics = raw.topics;
        if (lessons.length > 0) {
          const lessonMap = new Map(lessons.map((l) => [l.id, l]));
          if (Array.isArray(topics) && topics.length > 0) {
            topics = topics.map((top: any) => ({
              ...top,
              learningUnits: (top.learningUnits || []).map((u: any) => {
                const subLesson = lessonMap.get(u.id);
                if (subLesson) {
                  return {
                    ...u,
                    ...subLesson,
                    title: subLesson.title || u.title,
                    duration: subLesson.duration || u.duration,
                    type: subLesson.type ? (subLesson.type.charAt(0).toUpperCase() + subLesson.type.slice(1)) : (u.type || 'Reading'),
                    readingContent: subLesson.readingContent || subLesson.conceptTheory || subLesson.content || u.readingContent || '',
                    conceptTheory: subLesson.readingContent || subLesson.conceptTheory || subLesson.content || u.conceptTheory || '',
                    content: subLesson.readingContent || subLesson.content || u.content || '',
                    resources: subLesson.resources || subLesson.resourceLinks || u.resources || [],
                    learningObjectives: subLesson.learningObjectives || u.learningObjectives || [],
                    keyPoints: subLesson.keyPoints || u.keyPoints || [],
                    revision: subLesson.revision ?? u.revision,
                    orderIndex: subLesson.orderIndex ?? u.orderIndex ?? subLesson.order,
                    order: subLesson.order ?? u.order ?? subLesson.orderIndex,
                  };
                }
                return u;
              }),
            }));
          } else {
            topics = [
              {
                id: raw.id ? raw.id.replace('mod-', 'topic-').replace('-mod', '-topic') : `${doc.id}-topic-1`,
                title: `${raw.title || 'Module'} - Complete Notes`,
                description: raw.description || '',
                estimatedDuration: raw.duration || '30 mins',
                learningUnits: lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  description: l.description || '',
                  duration: l.duration || '15 mins',
                  type: l.type ? (l.type.charAt(0).toUpperCase() + l.type.slice(1)) : 'Reading',
                  readingContent: l.readingContent || l.conceptTheory || l.content || l.notes || '',
                  content: l.readingContent || l.conceptTheory || l.content || l.notes || '',
                  conceptTheory: l.readingContent || l.conceptTheory || l.content || '',
                  videoUrl: l.videoUrl || l.video?.videoUrl || '',
                  quizQuestions: l.quizQuestions || (l.quiz ? l.quiz.questions : []),
                  assignmentInstructions: l.assignmentInstructions || (l.assignment ? l.assignment.instructions : ''),
                  practiceLabChallenge: l.practiceLabChallenge || l.practical || null,
                  resources: l.resources || [],
                  learningObjectives: l.learningObjectives || [],
                  keyPoints: l.keyPoints || [],
                  revision: l.revision,
                  orderIndex: l.orderIndex ?? l.order,
                  order: l.order ?? l.orderIndex,
                })),
              },
            ];
          }
        }

        modules.push({
          ...raw,
          orderIndex: idx,
          order: idx,
          revision: raw.revision ?? 1,
          lessons: lessons || [],
          topics: topics || raw.topics || [],
        });
      }

      modules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      const maxRevision = modules.reduce((max, m) => {
        const modRev = m.revision ?? 1;
        const rawLessons = (m as any).lessons || [];
        const lessonMax = rawLessons.reduce((lMax: number, l: any) => Math.max(lMax, l.revision ?? 1), 1);
        return Math.max(max, modRev, lessonMax);
      }, 1);
      this.setCache(cacheKey, modules, { maxRevision });
      return modules;
    } catch (error) {
      console.warn(`[CourseContentService] db getCourseModules error for course ${courseId}, using firestoreRest fallback:`, error);
      try {
        const rawDocs = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules`);
        if (rawDocs && rawDocs.length > 0) {
          const modules: CourseModuleDoc[] = [];
          for (const raw of rawDocs) {
            const idx = raw.orderIndex ?? raw.order ?? 1;
            let lessons = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules/${raw.id}/lessons`);
            if (!lessons || lessons.length === 0) {
              lessons = Array.isArray(raw.lessons) ? raw.lessons : [];
            }
            lessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
            modules.push({
              ...raw,
              orderIndex: idx,
              order: idx,
              revision: raw.revision ?? 1,
              lessons: lessons || [],
              topics: raw.topics || [],
            });
          }
          modules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
          return modules;
        }
      } catch (restErr) {
        console.error(`[CourseContentService] firestoreRest fallback error for course ${courseId}:`, restErr);
      }
      return [];
    }
  }

  /**
   * Retrieves lessons for a given module.
   * If includeContent is false (default), excludes massive reading content string.
   * Canonical path: courses/{courseId}/modules/{moduleId}/lessons
   */
  async getModuleLessons(courseId: string, moduleId: string, options: LessonQueryOptions = {}, minExpectedRevision?: number): Promise<CourseLessonDoc[]> {
    const targetCourseId = resolveCanonicalId(courseId);
    const includeContent = options.includeContent === true;
    const cacheKey = `lessons:${targetCourseId}:${moduleId}:${includeContent}`;
    const cached = this.getFromCache<CourseLessonDoc[]>(cacheKey, minExpectedRevision);
    if (cached) return cached;

    try {
      // Canonical Subcollection Query: courses/{targetCourseId}/modules/{moduleId}/lessons
      let snapshot = await db
        .collection('courses')
        .doc(targetCourseId)
        .collection('modules')
        .doc(moduleId)
        .collection('lessons')
        .get();

      if ((!snapshot || snapshot.empty) && targetCourseId !== courseId) {
        snapshot = await db
          .collection('courses')
          .doc(courseId)
          .collection('modules')
          .doc(moduleId)
          .collection('lessons')
          .get();
      }

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
      const maxRevision = lessons.reduce((max, l) => Math.max(max, l.revision ?? 1), 1);
      this.setCache(cacheKey, lessons, { maxRevision });
      return lessons;
    } catch (error) {
      console.warn(`[CourseContentService] db getModuleLessons error for module ${moduleId}, using firestoreRest fallback:`, error);
      try {
        const rawLessons = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules/${moduleId}/lessons`);
        if (rawLessons && rawLessons.length > 0) {
          const lessons = rawLessons.map((l) => {
            const idx = l.orderIndex ?? l.order ?? 1;
            const normalized: CourseLessonDoc = {
              ...l,
              orderIndex: idx,
              order: idx,
              revision: l.revision ?? 1,
            };
            if (!includeContent) {
              const { content, ...summary } = normalized;
              return summary as CourseLessonDoc;
            }
            return normalized;
          });
          lessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
          return lessons;
        }
      } catch (restErr) {
        console.error(`[CourseContentService] firestoreRest fallback error for lessons of module ${moduleId}:`, restErr);
      }
      return [];
    }
  }

  /**
   * Retrieves full lesson content by lessonId.
   * Canonical path: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string, minExpectedRevision?: number): Promise<CourseLessonDoc | null> {
    const targetCourseId = courseId ? resolveCanonicalId(courseId) : undefined;
    const cacheKey = `lesson:${targetCourseId || 'any'}:${moduleId || 'any'}:${lessonId}`;
    const cached = this.getFromCache<CourseLessonDoc>(cacheKey, minExpectedRevision);
    if (cached) return cached;

    try {
      if (targetCourseId && moduleId) {
        let subDoc = await db
          .collection('courses')
          .doc(targetCourseId)
          .collection('modules')
          .doc(moduleId)
          .collection('lessons')
          .doc(lessonId)
          .get();
        if (!subDoc.exists && courseId && targetCourseId !== courseId) {
          subDoc = await db
            .collection('courses')
            .doc(courseId)
            .collection('modules')
            .doc(moduleId)
            .collection('lessons')
            .doc(lessonId)
            .get();
        }
        if (subDoc.exists) {
          const raw = fromDocument<any>(subDoc);
          const idx = raw.orderIndex ?? raw.order ?? 1;
          const lesson: CourseLessonDoc = {
            ...raw,
            orderIndex: idx,
            order: idx,
            revision: raw.revision ?? 1,
          };
          this.setCache(cacheKey, lesson, { revision: lesson.revision });
          return lesson;
        }
      }

      return null;
    } catch (error) {
      console.warn(`[CourseContentService] db getLessonById error for ${lessonId}, using firestoreRest fallback:`, error);
      if (targetCourseId && moduleId) {
        try {
          const raw = await firestoreRest.getDocument<any>(`courses/${targetCourseId}/modules/${moduleId}/lessons/${lessonId}`);
          if (raw) {
            const idx = raw.orderIndex ?? raw.order ?? 1;
            const lesson: CourseLessonDoc = {
              ...raw,
              orderIndex: idx,
              order: idx,
              revision: raw.revision ?? 1,
            };
            this.setCache(cacheKey, lesson, { revision: lesson.revision });
            return lesson;
          }
        } catch (restErr) {
          console.error(`[CourseContentService] firestoreRest fallback error for lesson ${lessonId}:`, restErr);
        }
      }
      return null;
    }
  }

  /**
   * Recalculates totalLessons and durationHours across all modules in this course and updates the course document.
   */
  async syncCourseStats(courseId: string, authToken?: string): Promise<void> {
    const targetCourseId = resolveCanonicalId(courseId);
    try {
      const modulesSnapshot = await db.collection('courses').doc(targetCourseId).collection('modules').get();
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

      await db.collection('courses').doc(targetCourseId).set(
        toDocument({
          totalLessons,
          durationHours,
          totalDurationMinutes: totalReadMinutes,
          updatedAt: new Date(),
        }),
        { merge: true }
      );
    } catch (err) {
      console.warn(`[CourseContentService] Could not sync course stats via db for ${targetCourseId}, using firestoreRest fallback:`, err);
      try {
        const rawMods = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules`, {}, authToken);
        let totalLessons = 0;
        let totalReadMinutes = 0;
        for (const mod of rawMods) {
          const lessons = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules/${mod.id}/lessons`, {}, authToken);
          totalLessons += lessons.length;
          lessons.forEach((l) => {
            const readMin = l.estimatedReadMinutes || l.durationMinutes || 15;
            totalReadMinutes += Number(readMin) || 15;
          });
        }
        const durationHours = Math.max(1, Math.round(totalReadMinutes / 60));
        await firestoreRest.setDocument(
          `courses/${targetCourseId}`,
          {
            totalLessons,
            durationHours,
            totalDurationMinutes: totalReadMinutes,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
          authToken
        );
      } catch (restErr) {
        console.warn(`[CourseContentService] firestoreRest syncCourseStats fallback failed:`, restErr);
      }
    }
  }

  /**
   * Creates or updates a module document in Firestore with optimistic concurrency check.
   * Canonical write target: courses/{courseId}/modules/{moduleId}
   */
  async saveModule(courseId: string, moduleDoc: CourseModuleDoc, userId?: string, authToken?: string): Promise<CourseModuleDoc> {
    const targetCourseId = resolveCanonicalId(courseId);
    const orderIndex = moduleDoc.orderIndex ?? moduleDoc.order ?? 1;
    const docRef = db.collection('courses').doc(targetCourseId).collection('modules').doc(moduleDoc.id);

    let existingSnap: any = { exists: false };
    let currentRevision = 0;
    try {
      existingSnap = await docRef.get();
      if (existingSnap.exists) {
        const data = existingSnap.data() || {};
        currentRevision = typeof data.revision === 'number' ? data.revision : 1;
      }
    } catch (getErr) {
      try {
        const restDoc = await firestoreRest.getDocument<any>(`courses/${targetCourseId}/modules/${moduleDoc.id}`, authToken);
        if (restDoc) {
          existingSnap = { exists: true };
          currentRevision = typeof restDoc.revision === 'number' ? restDoc.revision : 1;
        }
      } catch {}
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
      courseId: targetCourseId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    });
    delete (cleanDoc as any).expectedRevision;

    // Primary Canonical Subcollection: courses/{targetCourseId}/modules/{moduleId}
    try {
      await docRef.set(cleanDoc, { merge: true });
    } catch (setErr) {
      console.warn(`[CourseContentService] db docRef.set failed for module ${moduleDoc.id}, using firestoreRest:`, setErr);
      await firestoreRest.setDocument(`courses/${targetCourseId}/modules/${moduleDoc.id}`, cleanDoc, { merge: true }, authToken);
    }

    this.invalidateCourseCache(targetCourseId, moduleDoc.id);
    this.invalidateCache(`modules:${targetCourseId}`);
    await this.syncCourseStats(targetCourseId, authToken);

    const savedResult = {
      ...moduleDoc,
      courseId: targetCourseId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    };

    await this.recordAuditLog({
      courseId: targetCourseId,
      moduleId: moduleDoc.id,
      entityType: 'module',
      action: existingSnap.exists ? 'save' : 'create',
      title: moduleDoc.title || moduleDoc.id,
      previousRevision: currentRevision,
      newRevision: nextRevision,
      adminId: (moduleDoc as any).updatedBy || 'admin',
      timestamp: now,
      changesSummary: existingSnap.exists
        ? `Updated module "${moduleDoc.title}" (Rev ${currentRevision} -> ${nextRevision}).`
        : `Created new module "${moduleDoc.title}" (Rev 1).`,
      snapshot: cleanDoc,
    }, authToken);

    return savedResult;
  }

  /**
   * Creates or updates a lesson document in Firestore with optimistic concurrency check and atomic parent stats sync.
   * Canonical write target: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc, userId?: string, authToken?: string): Promise<CourseLessonDoc> {
    const targetCourseId = resolveCanonicalId(courseId);
    const orderIndex = lessonDoc.orderIndex ?? lessonDoc.order ?? 1;
    const docRef = db
      .collection('courses')
      .doc(targetCourseId)
      .collection('modules')
      .doc(moduleId)
      .collection('lessons')
      .doc(lessonDoc.id);

    let existingSnap: any = { exists: false };
    let currentRevision = 0;
    try {
      existingSnap = await docRef.get();
      if (existingSnap.exists) {
        const data = existingSnap.data() || {};
        currentRevision = typeof data.revision === 'number' ? data.revision : 1;
      }
    } catch (getErr) {
      try {
        const restDoc = await firestoreRest.getDocument<any>(`courses/${targetCourseId}/modules/${moduleId}/lessons/${lessonDoc.id}`, authToken);
        if (restDoc) {
          existingSnap = { exists: true };
          currentRevision = typeof restDoc.revision === 'number' ? restDoc.revision : 1;
        }
      } catch {}
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
      updatedBy: userId || (lessonDoc as any).updatedBy || 'admin',
    });
    delete (cleanDoc as any).expectedRevision;

    // Primary Canonical Subcollection: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
    try {
      await docRef.set(cleanDoc, { merge: true });
    } catch (setErr) {
      console.warn(`[CourseContentService] db docRef.set failed for lesson ${lessonDoc.id}, using firestoreRest:`, setErr);
      await firestoreRest.setDocument(`courses/${targetCourseId}/modules/${moduleId}/lessons/${lessonDoc.id}`, cleanDoc, { merge: true }, authToken);
    }

    // Sync to parent module document and root course document for full cross-system compatibility
    try {
      const modRef = db.collection('courses').doc(targetCourseId).collection('modules').doc(moduleId);
      const modSnap = await modRef.get();
      if (modSnap.exists) {
        const modData = modSnap.data() || {};
        if (Array.isArray(modData.topics) && modData.topics.length > 0) {
          const updatedTopics = modData.topics.map((top: any) => ({
            ...top,
            learningUnits: (top.learningUnits || []).map((u: any) => {
              if (u.id === lessonDoc.id) {
                return {
                  ...u,
                  ...cleanDoc,
                };
              }
              return u;
            }),
          }));
          await modRef.set(toDocument({ topics: updatedTopics, updatedAt: now }), { merge: true });
        }
      }

      const courseRef = db.collection('courses').doc(targetCourseId);
      const courseSnap = await courseRef.get();
      if (courseSnap.exists) {
        const cData = courseSnap.data() || {};
        if (Array.isArray(cData.modules) && cData.modules.length > 0) {
          const updatedModules = cData.modules.map((m: any) => {
            if (m.id === moduleId) {
              return {
                ...m,
                topics: (m.topics || []).map((top: any) => ({
                  ...top,
                  learningUnits: (top.learningUnits || []).map((u: any) => {
                    if (u.id === lessonDoc.id) {
                      return {
                        ...u,
                        ...cleanDoc,
                      };
                    }
                    return u;
                  }),
                })),
              };
            }
            return m;
          });
          await courseRef.set(toDocument({ modules: updatedModules, updatedAt: now }), { merge: true });
        }
      }
    } catch (syncErr) {
      console.warn('[SYNC_MODULE_DOC_NOTICE]', syncErr);
    }

    this.invalidateCourseCache(targetCourseId, moduleId, lessonDoc.id);
    this.invalidateCache(`lessons:${targetCourseId}:${moduleId}`);
    this.invalidateCache(`lesson:${targetCourseId}:${moduleId}:${lessonDoc.id}`);
    this.invalidateCache(`modules:${targetCourseId}`);

    // Synchronize parent course metadata
    await this.syncCourseStats(targetCourseId, authToken);

    const savedResult = {
      ...lessonDoc,
      courseId: targetCourseId,
      moduleId,
      orderIndex,
      order: orderIndex,
      revision: nextRevision,
      lastSavedAt: now,
      updatedAt: now,
    };

    await this.recordAuditLog({
      courseId: targetCourseId,
      moduleId,
      lessonId: lessonDoc.id,
      entityType: 'lesson',
      action: existingSnap.exists ? ((lessonDoc as any).isDraft ? 'save' : 'publish') : 'create',
      title: lessonDoc.title || lessonDoc.id,
      previousRevision: currentRevision,
      newRevision: nextRevision,
      adminId: userId || (lessonDoc as any).updatedBy || 'admin',
      timestamp: now,
      changesSummary: existingSnap.exists
        ? `Saved lesson "${lessonDoc.title}" in module "${moduleId}" (Rev ${currentRevision} -> ${nextRevision}).`
        : `Created new lesson "${lessonDoc.title}" in module "${moduleId}" (Rev 1).`,
      snapshot: cleanDoc,
    }, authToken);

    return savedResult;
  }

  /**
   * Atomic batched reorder for all affected lessons.
   */
  async batchReorderLessons(
    courseId: string,
    updates: Array<{ lessonId: string; moduleId: string; order: number; orderIndex?: number; moduleTitle?: string }>,
    userId?: string,
    authToken?: string
  ): Promise<void> {
    const targetCourseId = resolveCanonicalId(courseId);
    try {
      const batch = db.batch();
      for (const item of updates) {
        const idx = item.orderIndex ?? item.order;
        const lessonRef = db
          .collection('courses')
          .doc(targetCourseId)
          .collection('modules')
          .doc(item.moduleId)
          .collection('lessons')
          .doc(item.lessonId);

        const payload: any = {
          order: idx,
          orderIndex: idx,
          updatedAt: new Date(),
          updatedBy: userId || 'admin',
        };
        if (item.moduleTitle) {
          payload.moduleTitle = item.moduleTitle;
        }
        batch.set(lessonRef, toDocument(payload), { merge: true });
      }

      // Also update parent course updatedAt
      const courseRef = db.collection('courses').doc(targetCourseId);
      batch.set(courseRef, toDocument({ updatedAt: new Date(), updatedBy: userId || 'admin' }), { merge: true });

      await batch.commit();
    } catch (batchErr) {
      console.warn(`[CourseContentService] batch commit failed, saving reorder via firestoreRest:`, batchErr);
      for (const item of updates) {
        const idx = item.orderIndex ?? item.order;
        await firestoreRest.setDocument(
          `courses/${targetCourseId}/modules/${item.moduleId}/lessons/${item.lessonId}`,
          { order: idx, orderIndex: idx, updatedAt: new Date().toISOString(), updatedBy: userId || 'admin' },
          { merge: true },
          authToken
        );
      }
      await firestoreRest.setDocument(`courses/${targetCourseId}`, { updatedAt: new Date().toISOString(), updatedBy: userId || 'admin' }, { merge: true }, authToken);
    }

    this.invalidateCourseCache(targetCourseId);
    this.invalidateCache(`lessons:${targetCourseId}`);
    this.invalidateCache(`modules:${targetCourseId}`);

    await this.recordAuditLog({
      courseId: targetCourseId,
      entityType: 'lesson',
      action: 'reorder',
      title: `Batch Reorder (${updates.length} lessons)`,
      adminId: userId || 'admin',
      timestamp: new Date().toISOString(),
      changesSummary: `Reordered ${updates.length} lessons across modules in course "${targetCourseId}".`,
    }, authToken);
  }

  /**
   * Deletes a canonical lesson, re-sequences remaining lessons in the module with batched write, and updates course stats.
   * Canonical target: courses/{courseId}/modules/{moduleId}/lessons/{lessonId}
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string, userId?: string, authToken?: string): Promise<boolean> {
    try {
      const targetCourseId = courseId ? resolveCanonicalId(courseId) : undefined;
      if (targetCourseId && moduleId) {
        const moduleRef = db.collection('courses').doc(targetCourseId).collection('modules').doc(moduleId);
        const lessonRef = moduleRef.collection('lessons').doc(lessonId);

        try {
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
        } catch (dbErr) {
          console.warn(`[CourseContentService] db batch deleteLesson failed, using firestoreRest fallback:`, dbErr);
          await firestoreRest.deleteDocument(`courses/${targetCourseId}/modules/${moduleId}/lessons/${lessonId}`, authToken);
        }

        this.invalidateCourseCache(targetCourseId, moduleId, lessonId);
        this.invalidateCache(`lessons:${targetCourseId}`);
        this.invalidateCache(`modules:${targetCourseId}`);

        await this.syncCourseStats(targetCourseId, authToken);

        await this.recordAuditLog({
          courseId: targetCourseId,
          moduleId,
          lessonId,
          entityType: 'lesson',
          action: 'delete',
          title: lessonId,
          adminId: userId || 'admin',
          timestamp: new Date().toISOString(),
          changesSummary: `Deleted lesson "${lessonId}" from module "${moduleId}".`,
        }, authToken);
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
  async deleteModule(courseId: string, moduleId: string, userId?: string, authToken?: string): Promise<boolean> {
    const targetCourseId = resolveCanonicalId(courseId);
    try {
      let modTitle = moduleId;
      try {
        const moduleRef = db.collection('courses').doc(targetCourseId).collection('modules').doc(moduleId);
        const modSnap = await moduleRef.get();
        modTitle = modSnap.exists ? (modSnap.data()?.title || moduleId) : moduleId;
        const lessonsSnap = await moduleRef.collection('lessons').get();

        const batch = db.batch();
        lessonsSnap.forEach((lDoc) => {
          batch.delete(lDoc.ref);
        });
        batch.delete(moduleRef);

        await batch.commit();
      } catch (dbErr) {
        console.warn(`[CourseContentService] db deleteModule failed, using firestoreRest fallback:`, dbErr);
        const lessons = await firestoreRest.getCollection<any>(`courses/${targetCourseId}/modules/${moduleId}/lessons`, {}, authToken);
        for (const l of lessons) {
          await firestoreRest.deleteDocument(`courses/${targetCourseId}/modules/${moduleId}/lessons/${l.id}`, authToken);
        }
        await firestoreRest.deleteDocument(`courses/${targetCourseId}/modules/${moduleId}`, authToken);
      }

      this.invalidateCourseCache(targetCourseId, moduleId);
      this.invalidateCache(`modules:${targetCourseId}`);
      this.invalidateCache(`lessons:${targetCourseId}:${moduleId}`);

      await this.syncCourseStats(targetCourseId, authToken);

      await this.recordAuditLog({
        courseId: targetCourseId,
        moduleId,
        entityType: 'module',
        action: 'delete',
        title: modTitle,
        adminId: userId || 'admin',
        timestamp: new Date().toISOString(),
        changesSummary: `Deleted module "${modTitle}".`,
      }, authToken);

      return true;
    } catch (error) {
      console.error(`Error deleting module ${moduleId}:`, error);
      return false;
    }
  }

  /**
   * Records an audit log entry in the canonical audit_logs subcollection.
   */
  async recordAuditLog(entry: {
    courseId: string;
    moduleId?: string;
    lessonId?: string;
    entityType: 'course' | 'module' | 'lesson';
    action: 'create' | 'update' | 'save' | 'publish' | 'unpublish' | 'reorder' | 'delete' | 'restore';
    title: string;
    previousRevision?: number;
    newRevision?: number;
    adminId?: string;
    adminEmail?: string;
    timestamp?: string;
    changesSummary?: string;
    snapshot?: any;
  }, authToken?: string): Promise<void> {
    try {
      if (!entry.courseId) return;
      const logId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logDoc = toDocument({
        id: logId,
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
        adminId: entry.adminId || 'admin',
      });

      try {
        if (db) {
          await db
            .collection('courses')
            .doc(entry.courseId)
            .collection('audit_logs')
            .doc(logId)
            .set(logDoc);
        } else {
          await firestoreRest.setDocument(`courses/${entry.courseId}/audit_logs/${logId}`, logDoc, { merge: true }, authToken);
        }
      } catch (err) {
        await firestoreRest.setDocument(`courses/${entry.courseId}/audit_logs/${logId}`, logDoc, { merge: true }, authToken).catch(() => {});
      }
    } catch (err) {
      console.warn(`[AUDIT_LOG_WARNING] Could not persist audit log for course ${entry.courseId}:`, err);
    }
  }

  /**
   * Retrieves chronological audit history logs for a course.
   */
  async getCourseAuditLogs(courseId: string, limitCount = 50, authToken?: string): Promise<any[]> {
    try {
      if (!courseId) return [];
      try {
        if (db) {
          const snap = await db
            .collection('courses')
            .doc(courseId)
            .collection('audit_logs')
            .orderBy('timestamp', 'desc')
            .limit(limitCount)
            .get();

          if (snap && !snap.empty) {
            return snap.docs.map((doc) => fromDocument<any>(doc));
          }
        }
      } catch (dbErr) {
        console.warn(`[AUDIT_LOG_FETCH_NOTICE] db failed, using firestoreRest fallback:`, dbErr);
      }

      const logs = await firestoreRest.getCollection<any>(`courses/${courseId}/audit_logs`, { pageSize: limitCount }, authToken);
      return logs || [];
    } catch (err) {
      console.warn(`[AUDIT_LOG_FETCH_ERROR] Could not fetch audit logs for ${courseId}:`, err);
      return [];
    }
  }

  /**
   * Restores a previous snapshot from audit logs, creating a brand new revision without mutating history.
   */
  async restoreRevision(courseId: string, auditLogId: string, userId?: string, authToken?: string): Promise<any> {
    if (!courseId || !auditLogId) {
      throw new ApiError(400, 'courseId and auditLogId are required for restore.');
    }

    let logData: any = null;
    try {
      const logRef = db.collection('courses').doc(courseId).collection('audit_logs').doc(auditLogId);
      const logSnap = await logRef.get();
      if (logSnap.exists) {
        logData = logSnap.data() || {};
      }
    } catch (dbErr) {
      logData = await firestoreRest.getDocument<any>(`courses/${courseId}/audit_logs/${auditLogId}`, authToken);
    }

    if (!logData) {
      throw new ApiError(404, `Audit log entry ${auditLogId} not found.`);
    }

    if (!logData.snapshot) {
      throw new ApiError(400, `Audit log entry ${auditLogId} does not contain a restorable snapshot.`);
    }

    const snapshot = logData.snapshot;
    if (logData.entityType === 'lesson' && logData.moduleId && logData.lessonId) {
      return this.saveLesson(courseId, logData.moduleId, snapshot, userId, authToken);
    } else if (logData.entityType === 'module' && logData.moduleId) {
      return this.saveModule(courseId, snapshot, userId, authToken);
    }

    throw new ApiError(400, `Unsupported entity type for revision restore: ${logData.entityType}`);
  }
}

export const courseContentService = new CourseContentService();
