import { ZodError } from 'zod';
import { coursesCollection } from '../../firebase/collections';
import { Course, CourseValidationSchema } from '../../types/course';
import { ApiError } from '../../utils/ApiError';
import { fromDocument, handleFirestoreError, toDocument } from '../../utils/firestore';
import { FieldValue, Query } from 'firebase-admin/firestore';
import { db } from '../../firebase';
import { courseContentService } from './courseContent.service';

/**
 * Formats Zod validation errors into a human-readable comma-separated string.
 */
const formatZodError = (err: ZodError): string => {
  return err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
};

export class CourseService {
  private collection = coursesCollection;

  /**
   * Helper to look up a course by its slug.
   */
  async getCourseBySlug(slug: string): Promise<Course | null> {
    try {
      const snapshot = await this.collection().where('slug', '==', slug).limit(1).get();
      if (snapshot.empty) return null;
      return fromDocument<Course>(snapshot.docs[0]);
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates a new course in the Firestore database.
   * Validates structure, checks for duplicate slug.
   */
  async createCourse(data: any): Promise<Course> {
    try {
      // 1. Zod Validation
      const parsedData = CourseValidationSchema.parse(data);

      // 2. Prevent duplicate slugs
      if (parsedData.slug) {
        const existing = await this.getCourseBySlug(parsedData.slug);
        if (existing) {
          throw new ApiError(400, `A course with slug '${parsedData.slug}' already exists.`);
        }
      }

      // 3. Prepare document
      const docRef = this.collection().doc(); // Generate auto ID
      const slug = parsedData.slug || parsedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const courseDoc: Course = {
        enrollmentCount: 0,
        rating: 5.0,
        ratingCount: 0,
        ...parsedData,
        slug,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Course;

      // 4. Save to Firestore
      await docRef.set(toDocument(courseDoc));

      return courseDoc;
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new ApiError(400, `Validation Error: ${formatZodError(error)}`);
      }
      return handleFirestoreError(error, 'createCourse');
    }
  }

  /**
   * Updates an existing course in the database.
   * Validates changes and checks for duplicate slugs.
   */
  async updateCourse(id: string, data: any): Promise<Course> {
    try {
      // 1. Check if course exists
      const docRef = this.collection().doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        const partialSchema = CourseValidationSchema.partial();
        const parsedData = partialSchema.parse(data);
        const slug = parsedData.slug || (parsedData.title ? parsedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : id);
        const newCourse: Course = {
          enrollmentCount: 0,
          rating: 5.0,
          ratingCount: 0,
          ...parsedData,
          id,
          slug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Course;
        await docRef.set(toDocument(newCourse), { merge: true });
        return newCourse;
      }

      const existingCourse = fromDocument<Course>(docSnap);

      // 2. Validate partial updates
      const partialSchema = CourseValidationSchema.partial();
      const parsedData = partialSchema.parse(data);

      // 3. Prevent duplicate slugs (if slug is updated)
      if (parsedData.slug && parsedData.slug !== existingCourse.slug) {
        const slugExists = await this.getCourseBySlug(parsedData.slug);
        if (slugExists && slugExists.id !== id) {
          throw new ApiError(400, `A course with slug '${parsedData.slug}' already exists.`);
        }
      }

      // 4. Update the document fields and updatedAt timestamp
      const updatedCourse: Course = {
        ...existingCourse,
        ...parsedData,
        updatedAt: new Date().toISOString(),
      } as Course;

      // 5. Update only the changed fields in Firestore
      await docRef.set({
        ...toDocument(parsedData),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      return updatedCourse;
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new ApiError(400, `Validation Error: ${formatZodError(error)}`);
      }
      return handleFirestoreError(error, 'updateCourse');
    }
  }

  /**
   * Deletes a course from Firestore, including its canonical subcollections.
   */
  async deleteCourse(id: string): Promise<boolean> {
    try {
      const docRef = this.collection().doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new ApiError(404, `Course with ID '${id}' not found.`);
      }

      if (db) {
        const batch = db.batch();

        // 1. Canonical subcollections: courses/{id}/modules and lessons
        const canonicalModulesSnap = await db.collection('courses').doc(id).collection('modules').get().catch(() => null);
        if (canonicalModulesSnap && !canonicalModulesSnap.empty) {
          for (const modDoc of canonicalModulesSnap.docs) {
            const lessonsSnap = await db
              .collection('courses')
              .doc(id)
              .collection('modules')
              .doc(modDoc.id)
              .collection('lessons')
              .get()
              .catch(() => null);

            if (lessonsSnap && !lessonsSnap.empty) {
              lessonsSnap.docs.forEach((lDoc) => batch.delete(lDoc.ref));
            }
            batch.delete(modDoc.ref);
          }
        }

        // 2. Related records
        const assignmentsSnap = await db.collection('assignments').where('courseId', '==', id).get().catch(() => null);
        assignmentsSnap?.forEach((doc) => batch.delete(doc.ref));

        const progressSnap = await db.collection('student_progress').where('courseId', '==', id).get().catch(() => null);
        progressSnap?.forEach((doc) => batch.delete(doc.ref));

        const quizAttemptsSnap = await db.collection('quiz_attempts').where('courseId', '==', id).get().catch(() => null);
        quizAttemptsSnap?.forEach((doc) => batch.delete(doc.ref));

        const quizzesSnap = await db.collection('quizzes').where('courseId', '==', id).get().catch(() => null);
        quizzesSnap?.forEach((doc) => batch.delete(doc.ref));

        const notificationsSnap = await db.collection('notifications').where('courseId', '==', id).get().catch(() => null);
        notificationsSnap?.forEach((doc) => batch.delete(doc.ref));

        // 3. Delete course doc itself
        batch.delete(docRef);

        await batch.commit();
      } else {
        await docRef.delete();
      }

      return true;
    } catch (error) {
      return handleFirestoreError(error, 'deleteCourse');
    }
  }

  /**
   * Retrieves a course by its unique document ID.
   */
  async getCourseById(id: string): Promise<Course | null> {
    try {
      const docRef = this.collection().doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return null;
      }
      return fromDocument<Course>(docSnap);
    } catch (error) {
      return handleFirestoreError(error, 'getCourseById');
    }
  }

  /**
   * Retrieves all courses in the database.
   */
  async getCourses(): Promise<Course[]> {
    try {
      const snapshot = await this.collection().orderBy('createdAt', 'desc').get();
      const courses: Course[] = [];
      snapshot.forEach((doc) => {
        courses.push(fromDocument<Course>(doc));
      });
      return courses;
    } catch (error) {
      return handleFirestoreError(error, 'getCourses');
    }
  }

  /**
   * Retrieves published courses.
   */
  async getPublishedCourses(): Promise<Course[]> {
    try {
      const snapshot = await this.collection()
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();
      const courses: Course[] = [];
      snapshot.forEach((doc) => {
        courses.push(fromDocument<Course>(doc));
      });
      return courses;
    } catch (error) {
      return handleFirestoreError(error, 'getPublishedCourses');
    }
  }

  /**
   * Searches published courses.
   */
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const term = query.toLowerCase().trim();
      const allPublished = await this.getPublishedCourses();

      if (!term) return allPublished;

      return allPublished.filter((course) => {
        const matchTitle = course.title?.toLowerCase().includes(term);
        const matchDesc = course.description?.toLowerCase().includes(term);
        const matchCategory = course.category?.toLowerCase().includes(term);
        const matchTags = course.tags?.some((tag: string) => tag.toLowerCase().includes(term));
        return matchTitle || matchDesc || matchCategory || matchTags;
      });
    } catch (error) {
      return handleFirestoreError(error, 'searchCourses');
    }
  }

  /**
   * Filters courses by category, level, status, or language.
   */
  async filterCourses(filters: {
    category?: string;
    level?: string;
    language?: string;
    status?: string;
  }): Promise<Course[]> {
    try {
      let queryRef: Query = this.collection();

      if (filters.category) {
        queryRef = queryRef.where('category', '==', filters.category);
      }
      if (filters.level) {
        queryRef = queryRef.where('level', '==', filters.level);
      }
      if (filters.language) {
        queryRef = queryRef.where('language', '==', filters.language);
      }
      if (filters.status) {
        queryRef = queryRef.where('status', '==', filters.status);
      }

      const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
      const courses: Course[] = [];
      snapshot.forEach((doc) => {
        courses.push(fromDocument<Course>(doc));
      });
      return courses;
    } catch (error) {
      return handleFirestoreError(error, 'filterCourses');
    }
  }

  /**
   * Gets featured published courses.
   */
  async getFeaturedCourses(): Promise<Course[]> {
    try {
      const snapshot = await this.collection()
        .where('featured', '==', true)
        .where('status', '==', 'published')
        .orderBy('createdAt', 'desc')
        .get();
      const courses: Course[] = [];
      snapshot.forEach((doc) => {
        courses.push(fromDocument<Course>(doc));
      });
      return courses;
    } catch (error) {
      return handleFirestoreError(error, 'getFeaturedCourses');
    }
  }

  /**
   * Startup verification check. All courses and curriculums are canonically managed in Firestore.
   */
  async seedSampleCourses(): Promise<void> {
    // Canonical courses and nested subcollections are maintained persistently in Firestore.
  }

  /**
   * On-demand Content Methods (Delegated to CourseContentService with caching)
   */
  async getCourseModules(courseId: string) {
    return courseContentService.getCourseModules(courseId);
  }

  async getModuleLessons(courseId: string, moduleId: string, options?: any) {
    return courseContentService.getModuleLessons(courseId, moduleId, options);
  }

  async getLessonById(lessonId: string, courseId?: string, moduleId?: string) {
    return courseContentService.getLessonById(lessonId, courseId, moduleId);
  }

  async saveModule(courseId: string, moduleDoc: any) {
    return courseContentService.saveModule(courseId, moduleDoc);
  }

  async saveLesson(courseId: string, moduleId: string, lessonDoc: any) {
    return courseContentService.saveLesson(courseId, moduleId, lessonDoc);
  }

  async deleteLesson(lessonId: string, courseId?: string, moduleId?: string) {
    return courseContentService.deleteLesson(lessonId, courseId, moduleId);
  }
}

export default CourseService;
