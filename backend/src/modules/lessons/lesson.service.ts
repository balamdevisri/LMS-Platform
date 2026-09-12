import { courseContentService } from '../../services/course/courseContent.service';
import { CourseLessonDoc } from '../../types/courseContent.types';

export class LessonService {
  /**
   * Retrieves lesson by ID from Firestore with in-memory caching.
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string): Promise<CourseLessonDoc | null> {
    return courseContentService.getLessonById(lessonId, courseId, moduleId);
  }

  /**
   * Creates or updates a lesson document with optimistic concurrency checking.
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc): Promise<CourseLessonDoc> {
    return courseContentService.saveLesson(courseId, moduleId, lessonDoc);
  }

  /**
   * Atomic batched reorder for affected lessons.
   */
  async batchReorderLessons(
    courseId: string,
    updates: Array<{ lessonId: string; moduleId: string; order: number; orderIndex?: number; moduleTitle?: string }>
  ): Promise<void> {
    return courseContentService.batchReorderLessons(courseId, updates);
  }

  /**
   * Deletes a lesson document.
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string): Promise<boolean> {
    return courseContentService.deleteLesson(lessonId, courseId, moduleId);
  }

  /**
   * Cascades deletion of module and all its nested lessons.
   */
  async deleteModule(courseId: string, moduleId: string): Promise<boolean> {
    return courseContentService.deleteModule(courseId, moduleId);
  }
}
