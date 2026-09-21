import { courseContentService } from '../../services/course/courseContent.service';
import { CourseLessonDoc } from '../../types/courseContent.types';

export class LessonService {
  /**
   * Retrieves lesson by ID from Firestore with in-memory caching and revision checking.
   */
  async getLessonById(lessonId: string, courseId?: string, moduleId?: string, minExpectedRevision?: number): Promise<CourseLessonDoc | null> {
    return courseContentService.getLessonById(lessonId, courseId, moduleId, minExpectedRevision);
  }

  /**
   * Creates or updates a lesson document with optimistic concurrency checking.
   */
  async saveLesson(courseId: string, moduleId: string, lessonDoc: CourseLessonDoc, userId?: string, authToken?: string): Promise<CourseLessonDoc> {
    return courseContentService.saveLesson(courseId, moduleId, lessonDoc, userId, authToken);
  }

  /**
   * Atomic batched reorder for affected lessons.
   */
  async batchReorderLessons(
    courseId: string,
    updates: Array<{ lessonId: string; moduleId: string; order: number; orderIndex?: number; moduleTitle?: string }>,
    userId?: string,
    authToken?: string
  ): Promise<void> {
    return courseContentService.batchReorderLessons(courseId, updates, userId, authToken);
  }

  /**
   * Deletes a lesson document.
   */
  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string, userId?: string, authToken?: string): Promise<boolean> {
    return courseContentService.deleteLesson(lessonId, courseId, moduleId, userId, authToken);
  }

  /**
   * Cascades deletion of module and all its nested lessons.
   */
  async deleteModule(courseId: string, moduleId: string, userId?: string, authToken?: string): Promise<boolean> {
    return courseContentService.deleteModule(courseId, moduleId, userId, authToken);
  }
}
