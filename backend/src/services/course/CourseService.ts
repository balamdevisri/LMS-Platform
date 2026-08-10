import { ZodError } from 'zod';
import { coursesCollection } from '../../firebase/collections';
import { Course, CourseValidationSchema } from '../../types/course';
import { ApiError } from '../../utils/ApiError';
import { fromDocument, handleFirestoreError, toDocument } from '../../utils/firestore';
import * as admin from 'firebase-admin';
import { db } from '../../firebase';
import { LiveClass } from '../../models/mongo/liveClassroom.model';
import { cSyllabusNotes } from './cSyllabusData';

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
      };

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
        throw new ApiError(404, `Course with ID '${id}' not found.`);
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
      };

      // 5. Update only the changed fields in Firestore
      await docRef.update({
        ...toDocument(parsedData),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return updatedCourse;
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new ApiError(400, `Validation Error: ${formatZodError(error)}`);
      }
      return handleFirestoreError(error, 'updateCourse');
    }
  }

  /**
   * Deletes a course from Firestore.
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

        // 1. Modules
        const modulesSnap = await db.collection('course_modules').where('courseId', '==', id).get();
        modulesSnap.forEach((doc) => batch.delete(doc.ref));

        // 2. Lessons
        const lessonsSnap = await db.collection('course_lessons').where('courseId', '==', id).get();
        lessonsSnap.forEach((doc) => batch.delete(doc.ref));

        // 3. Assignments
        const assignmentsSnap = await db.collection('assignments').where('courseId', '==', id).get();
        assignmentsSnap.forEach((doc) => batch.delete(doc.ref));

        // 4. Progress records
        const progressSnap = await db.collection('student_progress').where('courseId', '==', id).get();
        progressSnap.forEach((doc) => batch.delete(doc.ref));

        // 5. Quiz attempts & Quizzes
        const quizAttemptsSnap = await db.collection('quiz_attempts').where('courseId', '==', id).get();
        quizAttemptsSnap.forEach((doc) => batch.delete(doc.ref));
        
        const quizzesSnap = await db.collection('quizzes').where('courseId', '==', id).get();
        quizzesSnap.forEach((doc) => batch.delete(doc.ref));

        // 6. Course notifications
        const notificationsSnap = await db.collection('notifications').where('courseId', '==', id).get();
        notificationsSnap.forEach((doc) => batch.delete(doc.ref));

        // 7. Delete course doc itself
        batch.delete(docRef);

        await batch.commit();
      } else {
        await docRef.delete();
      }

      // 8. Mongo Live Class Schedules
      try {
        await LiveClass.deleteMany({ courseId: id }).catch(() => null);
      } catch (mongoErr) {
        console.warn('Failed to clean Mongo live classes for course:', mongoErr);
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
   * Performs substring searches on title, tags, description, or category.
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
      let queryRef: admin.firestore.Query = this.collection();

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
   * Automatically seeds Firestore with sample courses if empty.
   */
  async seedSampleCourses(): Promise<void> {
    try {
      const { isFirestoreInitialized } = await import('../../firebase/collections');
      if (!isFirestoreInitialized()) {
        console.warn('Firebase / Firestore is not configured. Skipping seeding.');
        return;
      }

      const sampleCourses: any[] = [
        {
          title: 'Git & GitHub Mastery',
          slug: 'git-github-mastery',
          description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
          shortDescription: 'Master version control, repository management, and CI/CD pipelines.',
          category: 'Development Tools',
          subcategory: 'Git',
          level: 'Beginner to Advanced',
          thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
          duration: '20 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'Kaizen Q Team',
          },
          lessonsCount: 66,
          modulesCount: 6,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 180,
          tags: ['git', 'github', 'ci-cd', 'devops', 'version-control'],
          prerequisites: ['Basic computer knowledge'],
          learningOutcomes: [
            'Create, track and manage repositories locally and on GitHub',
            'Coordinate branches and execute pull requests and code reviews',
            'Solve complex merge conflicts and perform rebasing',
            'Write custom GitHub Actions pipelines for automated testing & deployment'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'Database Management System (DBMS): Beginner to Advanced',
          slug: 'database-management-system',
          description: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
          shortDescription: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
          category: 'Database',
          subcategory: 'DBMS',
          level: 'all_levels',
          thumbnail: '/assets/images/dbms_course_thumbnail.png',
          bannerImage: '/assets/images/dbms_course_thumbnail.png',
          duration: '25 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'Kaizen-Q Academy',
          },
          lessonsCount: 46,
          modulesCount: 6,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 120,
          tags: ['database', 'dbms', 'sql', 'normalization', 'acid'],
          prerequisites: ['Basic computer knowledge'],
          learningOutcomes: [
            'Understand relational database design and normalization rules',
            'Write efficient SQL queries including joins, aggregations, and subqueries',
            'Handle database transactions and ACID properties',
            'Build real-world database projects from scratch'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'Kubernetes Complete Course – Beginner to Advanced',
          slug: 'kubernetes-complete-course-beginner-to-advanced',
          description: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning. Understand Kubernetes architecture, Pods, Deployments, Services, Networking, Storage, Security, Scheduling, Helm, CI/CD, and real-world application deployment.',
          shortDescription: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning.',
          category: 'DevOps / Cloud / Containers',
          subcategory: 'Kubernetes',
          level: 'all_levels',
          thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
          duration: '30 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'Kaizen-Q Academy',
          },
          lessonsCount: 46,
          modulesCount: 6,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 100,
          tags: ['kubernetes', 'k8s', 'devops', 'docker', 'containers', 'helm'],
          prerequisites: ['Basic Linux commands', 'Basic Docker knowledge', 'Basic networking concepts', 'Basic YAML knowledge'],
          learningOutcomes: [
            'Understand Kubernetes architecture and core worker components',
            'Deploy and scale applications using Pods, ReplicaSets, and Deployments',
            'Expose applications with ClusterIP, NodePort, LoadBalancer Services and Ingress',
            'Manage persistent storage with PersistentVolumes and Claims',
            'Secure clusters using ServiceAccounts, RBAC, and Security Contexts',
            'Deploy microservices in cloud Kubernetes clusters using CI/CD and Helm'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'React JS Complete Course',
          slug: 'react-js-complete-course',
          description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
          shortDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, environment setup, Hooks, Routing, APIs, Redux, and styling.',
          category: 'Web Development / Frontend Development',
          subcategory: 'React',
          level: 'all_levels',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
          duration: '24 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'KaizenQ Systems Team',
          },
          lessonsCount: 216,
          modulesCount: 15,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 120,
          tags: ['react', 'frontend', 'javascript', 'webdev', 'redux', 'tailwind'],
          prerequisites: ['Basic HTML, CSS, and intermediate JavaScript (ES6+) knowledge'],
          learningOutcomes: [
            'Understand Component-Based Architecture and the Virtual DOM rendering cycle',
            'Use JSX expressions, fragments, and conditional rendering operators',
            'Manage local state with useState and leverage useEffect for lifecycle hooks',
            'Coordinate routing using BrowserRouter, Routes, Route, and useNavigate',
            'Perform remote API fetches and integration using Axios',
            'Implement global state management via the Context API and Redux Toolkit'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'React JS Complete Course',
          slug: 'react-js-complete-course',
          description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
          shortDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, environment setup, Hooks, Routing, APIs, Redux, and styling.',
          category: 'Web Development / Frontend Development',
          subcategory: 'React',
          level: 'all_levels',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
          duration: '24 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'KaizenQ Systems Team',
          },
          lessonsCount: 216,
          modulesCount: 15,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 120,
          tags: ['react', 'frontend', 'javascript', 'webdev', 'redux', 'tailwind'],
          prerequisites: ['Basic HTML, CSS, and intermediate JavaScript (ES6+) knowledge'],
          learningOutcomes: [
            'Understand Component-Based Architecture and the Virtual DOM rendering cycle',
            'Use JSX expressions, fragments, and conditional rendering operators',
            'Manage local state with useState and leverage useEffect for lifecycle hooks',
            'Coordinate routing using BrowserRouter, Routes, Route, and useNavigate',
            'Perform remote API fetches and integration using Axios',
            'Implement global state management via the Context API and Redux Toolkit'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'C Programming',
          slug: 'c-programming',
          description: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
          shortDescription: 'Complete C Programming course covering fundamentals, programming concepts, and advanced C.',
          category: 'Programming',
          subcategory: 'C',
          level: 'all_levels',
          thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
          duration: '35 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'Kaizen Q Team',
          },
          lessonsCount: 15,
          modulesCount: 15,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 180,
          tags: ['c', 'programming', 'basics', 'pointers', 'data-structures'],
          prerequisites: ['Basic computer knowledge'],
          learningOutcomes: [
            'Understand C fundamentals, compiler mechanics, variables and data types',
            'Master control flow, loops, functions and recursion in C',
            'Harness pointers, arrays, strings and dynamic memory allocation',
            'Implement data structures like lists, stacks, and queues, and manage files'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        }
      ];

      console.log('Checking and seeding sample courses...');
      for (const courseData of sampleCourses) {
        const existing = await this.collection().where('slug', '==', courseData.slug).limit(1).get();
        if (existing.empty) {
          const docRef = this.collection().doc(courseData.slug === 'git-github-mastery' ? 'git-github-mastery-course-id' : (courseData.slug === 'database-management-system' ? 'database-management-system' : (courseData.slug === 'kubernetes-complete-course-beginner-to-advanced' ? 'kubernetes-complete-course-beginner-to-advanced' : (courseData.slug === 'react-js-complete-course' ? 'react-js-complete-course' : (courseData.slug === 'c-programming' ? 'c-programming-course-id' : this.collection().doc().id)))));
          const course: Course = {
            ...courseData,
            id: docRef.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await docRef.set(toDocument(course));
          console.log(`Seeded course: ${course.title}`);
          
          if (courseData.slug === 'git-github-mastery') {
            await this.seedGitCourseDetails(docRef.id);
          } else if (courseData.slug === 'database-management-system') {
            await this.seedDbmsCourseDetails(docRef.id);
          } else if (courseData.slug === 'kubernetes-complete-course-beginner-to-advanced') {
            await this.seedKubernetesCourseDetails(docRef.id);
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(docRef.id);
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(docRef.id);
          } else if (courseData.slug === 'c-programming') {
            await this.seedCCourseDetails(docRef.id);
          }
        } else {
          // If the course exists, update its details to ensure the requested instructor/desc etc. are correct.
          const courseDoc = existing.docs[0];
          await courseDoc.ref.update({
            description: courseData.description,
            level: courseData.level,
            instructor: courseData.instructor,
            studentsEnrolled: courseData.studentsEnrolled,
            updatedAt: new Date(),
          });
          if (courseData.slug === 'git-github-mastery') {
            await this.seedGitCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'database-management-system') {
            await this.seedDbmsCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'kubernetes-complete-course-beginner-to-advanced') {
            await this.seedKubernetesCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'c-programming') {
            await this.seedCCourseDetails(courseDoc.id);
          }
        }
      }
      console.log('Seeding process checked and completed.');
    } catch (error) {
      console.error('Error seeding sample courses:', error);
    }
  }

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the Git & GitHub course.
   */
  async seedGitCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection, coursesCollection } = await import('../../firebase/collections');
      
      console.log('Seeding Git & GitHub detailed syllabus collections...');

      const modulesData = [
        { id: 'git-mod-1', title: 'Module 1: Introduction to Version Control, Git & GitHub', order: 1, duration: '1 Hour', description: 'Introduction to Version Control, Git & GitHub' },
        { id: 'git-mod-2', title: 'Module 2: Installing Git and Initial Configuration', order: 2, duration: '1 Hour', description: 'Installing Git and Initial Configuration' },
        { id: 'git-mod-3', title: 'Module 3: Git Repository Fundamentals', order: 3, duration: '1 Hour', description: 'Git Repository Fundamentals' },
        { id: 'git-mod-4', title: 'Module 4: Basic Git Commands', order: 4, duration: '1 Hour', description: 'Basic Git Commands' },
        { id: 'git-mod-5', title: 'Module 5: Branching and Merging', order: 5, duration: '1 Hour', description: 'Branching and Merging' },
        { id: 'git-mod-6', title: 'Module 6: GitHub Basics', order: 6, duration: '1 Hour', description: 'GitHub Basics' },
        { id: 'git-mod-7', title: 'Module 7: Remote Repository Management', order: 7, duration: '1 Hour', description: 'Remote Repository Management' },
        { id: 'git-mod-8', title: 'Module 8: Git Collaboration', order: 8, duration: '1 Hour', description: 'Git Collaboration' },
        { id: 'git-mod-9', title: 'Module 9: Advanced Git Commands', order: 9, duration: '1 Hour', description: 'Advanced Git Commands' },
        { id: 'git-mod-10', title: 'Module 10: Git Internals', order: 10, duration: '1 Hour', description: 'Git Internals' },
        { id: 'git-mod-11', title: 'Module 11: GitHub Features', order: 11, duration: '1 Hour', description: 'GitHub Features' },
        { id: 'git-mod-12', title: 'Module 12: Git Best Practices', order: 12, duration: '1 Hour', description: 'Git Best Practices' },
        { id: 'git-mod-13', title: 'Module 13: Real-World Git Workflow', order: 13, duration: '1 Hour', description: 'Real-World Git Workflow' },
        { id: 'git-mod-14', title: 'Module 14: Git & GitHub Projects', order: 14, duration: '1 Hour', description: 'Git & GitHub Projects' },
        { id: 'git-mod-15', title: 'Module 15: Git & GitHub Interview Preparation', order: 15, duration: '1 Hour', description: 'Git & GitHub Interview Preparation' },
      ];

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument({
          id: mod.id,
          title: mod.title,
          order: mod.order,
          duration: mod.duration,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      // Create exactly 1 reading unit per module
      const modulesForCourseDoc: any[] = [];
      const { gitSyllabusNotes } = await import('./gitSyllabusData');

      for (const mod of modulesData) {
        const lessonId = `git-unit-${mod.order}-notes`;
        const lessonTitle = `Module ${mod.order} - Complete Notes`;
        const lessonDesc = `${mod.title} Complete Notes.`;
        const lessonContent = gitSyllabusNotes[mod.order] || `### ${lessonTitle}\n\nContent for ${mod.title} will be added later.`;
        
        // Write to lessons collection in Firestore
        await lessonsCollection().doc(lessonId).set(toDocument({
          id: lessonId,
          title: lessonTitle,
          description: lessonDesc,
          order: 1,
          duration: '45 mins',
          type: 'reading',
          readingTime: '45 mins',
          content: lessonContent,
          courseId,
          moduleId: mod.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Build nested structure
        modulesForCourseDoc.push({
          id: mod.id,
          title: mod.title,
          description: mod.description,
          duration: mod.duration,
          topics: [
            {
              id: `git-topic-${mod.order}`,
              title: `Topic ${mod.order}: Module ${mod.order} Content`,
              description: `Module ${mod.order} Content`,
              estimatedDuration: '45 mins',
              learningUnits: [
                {
                  id: lessonId,
                  title: lessonTitle,
                  description: lessonDesc,
                  duration: '45 mins',
                  type: 'Reading',
                  readingContent: lessonContent
                }
              ]
            }
          ]
        });
      }

      // Save nested structure directly to course document
      await coursesCollection().doc(courseId).update({
        modules: modulesForCourseDoc,
        modulesCount: 15,
        lessonsCount: 15,
        updatedAt: new Date()
      });

      console.log('Successfully seeded Git & GitHub Mastery course structure with 15 modules.');
    } catch (error) {
      console.error('Error seeding Git & GitHub Mastery course details:', error);
    }
  }

  async seedDbmsCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection } = await import('../../firebase/collections');
      
      console.log('Seeding/Updating Database Management System (DBMS) detailed syllabus collections...');

      const modulesData = [
        { id: 'dbms-mod-1', title: 'Module 1 - Database Fundamentals', order: 1, duration: '4 Hours' },
        { id: 'dbms-mod-2', title: 'Module 2 - Relational Database Concepts', order: 2, duration: '4 Hours' },
        { id: 'dbms-mod-3', title: 'Module 3 - SQL Fundamentals', order: 3, duration: '4 Hours' },
        { id: 'dbms-mod-4', title: 'Module 4 - Advanced SQL', order: 4, duration: '4 Hours' },
        { id: 'dbms-mod-5', title: 'Module 5 - Database Design', order: 5, duration: '5 Hours' },
        { id: 'dbms-mod-6', title: 'Module 6 - Real World Database Project', order: 6, duration: '4 Hours' },
      ];

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument({
          ...mod,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const lessonsData: Record<string, any[]> = {
        'dbms-mod-1': [
          { id: 'dbms-les-101', title: '1.1 What is Data?', order: 1, duration: '15 mins', type: 'reading', content: '### What is Data?\nData is a collection of raw, unorganized facts, figures, symbols, or observations that can be processed to produce meaningful information. In computing, data is represented in binary format and structured in databases.' },
          { id: 'dbms-les-102', title: '1.2 What is Database?', order: 2, duration: '20 mins', type: 'video', content: '### What is a Database?\nA database is an organized collection of structured data stored electronically in a computer system. Databases are controlled by a Database Management System (DBMS).' },
          { id: 'dbms-les-103', title: '1.3 DBMS Introduction', order: 3, duration: '25 mins', type: 'reading', content: '### Introduction to DBMS\nA Database Management System (DBMS) is software that manages databases, allowing users to store, retrieve, update, and organize information efficiently while ensuring data integrity.' },
          { id: 'dbms-les-104', title: '1.4 Database vs File System', order: 4, duration: '20 mins', type: 'video', content: '### Database vs File System\nUnlike traditional file systems, a DBMS handles data redundancy, concurrency control, security, data integrity, and complex queries seamlessly.' },
          { id: 'dbms-les-105', title: '1.5 Advantages of DBMS', order: 5, duration: '15 mins', type: 'reading', content: '### Advantages of DBMS\nKey benefits include: minimized data redundancy, data sharing, data consistency, transactional safety, secure access, and backup & recovery services.' },
          { id: 'dbms-les-106', title: '1.6 Types of Databases', order: 6, duration: '15 mins', type: 'reading', content: '### Types of Databases\nDatabases are categorized into Relational (RDBMS), NoSQL (Key-Value, Document, Graph), Distributed, Cloud, and Object-Oriented databases.' }
        ],
        'dbms-mod-2': [
          { id: 'dbms-les-201', title: '2.1 Tables, Rows & Columns', order: 1, duration: '15 mins', type: 'reading', content: '### Tables, Rows & Columns\nIn a relational database, data is organized into tables (relations), where columns represent attributes and rows (tuples) represent individual data records.' },
          { id: 'dbms-les-202', title: '2.2 Keys', order: 2, duration: '25 mins', type: 'video', content: '### Keys in Relational Databases\nKeys uniquely identify rows in a table. Types include Primary Keys, Foreign Keys, Super Keys, Candidate Keys, and Composite Keys.' },
          { id: 'dbms-les-203', title: '2.3 Constraints', order: 3, duration: '20 mins', type: 'reading', content: '### Integrity Constraints\nConstraints enforce database rules. Examples include: NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK, and DEFAULT.' },
          { id: 'dbms-les-204', title: '2.4 ER Model', order: 4, duration: '20 mins', type: 'video', content: '### Entity-Relationship Model\nThe ER Model describes database structures using Entities, Attributes, and Relationships, serving as the blueprint for relational designs.' },
          { id: 'dbms-les-205', title: '2.5 ER Diagram', order: 5, duration: '20 mins', type: 'reading', content: '### Entity-Relationship Diagrams\nER diagrams visually represent entity relationships, detailing attributes, primary keys, and cardinality (1:1, 1:N, N:M).' }
        ],
        'dbms-mod-3': [
          { id: 'dbms-les-301', title: '3.1 SQL Introduction', order: 1, duration: '15 mins', type: 'reading', content: '### SQL Introduction\nStructured Query Language (SQL) is the standard language to manage and query relational databases, divided into DDL, DML, DCL, and TCL.' },
          { id: 'dbms-les-302', title: '3.2 CREATE', order: 2, duration: '20 mins', type: 'video', content: '### CREATE Statement\nThe DDL CREATE statement builds databases, tables, indexes, or views: `CREATE TABLE users (id INT, name VARCHAR(100));`' },
          { id: 'dbms-les-303', title: '3.3 INSERT', order: 3, duration: '15 mins', type: 'video', content: '### INSERT Statement\nInserts new records into a table: `INSERT INTO users (id, name) VALUES (1, "Alice");`' },
          { id: 'dbms-les-304', title: '3.4 SELECT', order: 4, duration: '25 mins', type: 'video', content: '### SELECT Statement\nRetrieves columns from a table: `SELECT * FROM users;`' },
          { id: 'dbms-les-305', title: '3.5 UPDATE', order: 5, duration: '15 mins', type: 'video', content: '### UPDATE Statement\nModifies existing records matching a condition: `UPDATE users SET name = "Bob" WHERE id = 1;`' },
          { id: 'dbms-les-306', title: '3.6 DELETE', order: 6, duration: '15 mins', type: 'video', content: '### DELETE Statement\nRemoves records matching a condition: `DELETE FROM users WHERE id = 1;`' },
          { id: 'dbms-les-307', title: '3.7 WHERE', order: 7, duration: '15 mins', type: 'video', content: '### WHERE Clause\nFilters records conditionally: `SELECT * FROM users WHERE id > 5;`' },
          { id: 'dbms-les-308', title: '3.8 ORDER BY', order: 8, duration: '15 mins', type: 'video', content: '### ORDER BY Clause\nSorts results ascending or descending: `SELECT * FROM users ORDER BY name DESC;`' }
        ],
        'dbms-mod-4': [
          { id: 'dbms-les-401', title: '4.1 GROUP BY', order: 1, duration: '15 mins', type: 'video', content: '### GROUP BY Clause\nGroups rows sharing identical values: `SELECT category, COUNT(*) FROM products GROUP BY category;`' },
          { id: 'dbms-les-402', title: '4.2 HAVING', order: 2, duration: '15 mins', type: 'video', content: '### HAVING Clause\nFilters group results (unlike WHERE which filters rows): `SELECT category FROM products GROUP BY category HAVING COUNT(*) > 5;`' },
          { id: 'dbms-les-403', title: '4.3 JOINS', order: 3, duration: '30 mins', type: 'video', content: '### SQL JOINS\nCombines columns from multiple tables. Types: INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN.' },
          { id: 'dbms-les-404', title: '4.4 UNION', order: 4, duration: '15 mins', type: 'video', content: '### UNION Operator\nCombines query results into one distinct list: `SELECT id FROM customers UNION SELECT id FROM employees;`' },
          { id: 'dbms-les-405', title: '4.5 Subqueries', order: 5, duration: '20 mins', type: 'video', content: '### Subqueries\nQueries nested inside other queries: `SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);`' },
          { id: 'dbms-les-406', title: '4.6 Views', order: 6, duration: '15 mins', type: 'video', content: '### Database Views\nA virtual table built from a SELECT statement: `CREATE VIEW active_users AS SELECT * FROM users WHERE active = true;`' },
          { id: 'dbms-les-407', title: '4.7 Indexes', order: 7, duration: '20 mins', type: 'video', content: '### Indexes\nStructures that speed up query execution: `CREATE INDEX idx_name ON users(name);`' }
        ],
        'dbms-mod-5': [
          { id: 'dbms-les-501', title: '5.1 Functional Dependency', order: 1, duration: '20 mins', type: 'reading', content: '### Functional Dependency\nOccurs when one attribute uniquely determines another attribute. Denoted as X -> Y, where X is determinant.' },
          { id: 'dbms-les-502', title: '5.2 Normalization', order: 2, duration: '30 mins', type: 'video', content: '### Database Normalization\nProcess to structure database schemas to eliminate insertion, update, and deletion anomalies. Forms: 1NF, 2NF, 3NF, BCNF.' },
          { id: 'dbms-les-503', title: '5.3 Transactions', order: 3, duration: '15 mins', type: 'video', content: '### Transactions\nExecutions of SQL statements treated as a single logical unit of work (all-or-nothing execution).' },
          { id: 'dbms-les-504', title: '5.4 ACID Properties', order: 4, duration: '20 mins', type: 'reading', content: '### ACID Properties\nEnsures transactional safety:\n- **Atomicity:** Complete success or total rollback.\n- **Consistency:** Moves database from one valid state to another.\n- **Isolation:** Concurrent transactions do not interfere.\n- **Durability:** Committed changes persist even during power loss.' },
          { id: 'dbms-les-505', title: '5.5 Concurrency Control', order: 5, duration: '25 mins', type: 'reading', content: '### Concurrency Control\nManages concurrent transaction conflicts using Locking protocols (shared/exclusive) and timestamp ordering.' },
          { id: 'dbms-les-506', title: '5.6 Database Security', order: 6, duration: '20 mins', type: 'reading', content: '### Database Security\nProtects data using access control privileges (GRANT/REVOKE), database encryption, and SQL injection prevention.' }
        ],
        'dbms-mod-6': [
          { id: 'dbms-les-601', title: '6.1 Student Management System', order: 1, duration: '20 mins', type: 'reading', content: '### Student Management Schema\nDesign a database schema to track student details, class enrollments, and academic grades.' },
          { id: 'dbms-les-602', title: '6.2 Library Management System', order: 2, duration: '20 mins', type: 'reading', content: '### Library Management Schema\nDesign a database schema to track book catalog databases, author relationships, member details, and borrow transactions.' },
          { id: 'dbms-les-603', title: '6.3 E-Commerce Database', order: 3, duration: '30 mins', type: 'reading', content: '### E-Commerce Schema\nDesign a comprehensive database model tracking users, product catalogs, customer shopping carts, checkout orders, and payments.' },
          { id: 'dbms-les-604', title: '6.4 SQL Mini Project', order: 4, duration: '40 mins', type: 'reading', content: '### Capstone Mini SQL Project\nCreate the E-commerce schema locally, run sample tables, populate them with test records, and execute complex nested query reports.' }
        ]
      };

      for (const [modId, lessons] of Object.entries(lessonsData)) {
        for (const les of lessons) {
          await lessonsCollection().doc(les.id).set(toDocument({
            ...les,
            moduleId: modId,
            courseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }

      const quizzesData = [
        { id: 'dbms-quiz-1', moduleId: 'dbms-mod-1', title: 'Types of Databases Quiz', questions: [] },
        { id: 'dbms-quiz-2', moduleId: 'dbms-mod-6', title: 'Final Assessment Quiz', questions: [] },
      ];
      for (const quiz of quizzesData) {
        await quizzesCollection().doc(quiz.id).set(toDocument({
          ...quiz,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const assignmentsData = [
        { id: 'dbms-assign-1', moduleId: 'dbms-mod-1', title: 'Practice Terminal (For Practice Only)', description: 'Simulated environment exercises.' },
        { id: 'dbms-assign-2', moduleId: 'dbms-mod-2', title: 'Practice Terminal (For Practice Only)', description: 'ER diagram database schemas.' },
        { id: 'dbms-assign-3', moduleId: 'dbms-mod-3', title: 'Practice Terminal (For Practice Only)', description: 'Write SQL query scripts.' },
        { id: 'dbms-assign-4', moduleId: 'dbms-mod-4', title: 'Practice Terminal (For Practice Only)', description: 'Join queries.' },
        { id: 'dbms-assign-5', moduleId: 'dbms-mod-5', title: 'Practice Terminal (For Practice Only)', description: 'Transaction isolation queries.' },
        { id: 'dbms-assign-6', moduleId: 'dbms-mod-6', title: 'SQL Mini Project', description: 'Implement capstone schemas.' },
      ];
      for (const assign of assignmentsData) {
        await assignmentsCollection().doc(assign.id).set(toDocument({
          ...assign,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      console.log('Successfully seeded DBMS course structure.');
    } catch (error) {
      console.error('Error seeding DBMS course details:', error);
    }
  }

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the Kubernetes Complete Course.
   */
  async seedKubernetesCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection } = await import('../../firebase/collections');
      
      console.log('Seeding Kubernetes detailed syllabus collections...');

      const modulesData = [
        { id: 'k8s-mod-1', title: 'Module 1 — Kubernetes Basics', order: 1, duration: '5 Hours' },
        { id: 'k8s-mod-2', title: 'Module 2 — Pods & Deployments', order: 2, duration: '6 Hours' },
        { id: 'k8s-mod-3', title: 'Module 3 — Networking & Services', order: 3, duration: '5 Hours' },
        { id: 'k8s-mod-4', title: 'Module 4 — Configuration & Storage', order: 4, duration: '6 Hours' },
        { id: 'k8s-mod-5', title: 'Module 5 — Security & Administration', order: 5, duration: '6 Hours' },
        { id: 'k8s-mod-6', title: 'Module 6 — Production & DevOps', order: 6, duration: '6 Hours' },
      ];

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument({
          ...mod,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const lessonsList = [
        {
          moduleId: 'k8s-mod-1',
          lessons: [
            { id: 'k8s-unit-1-1', title: '1.1 Introduction to Kubernetes', order: 1, duration: '35 mins', type: 'reading', content: '## Introduction to Kubernetes (K8s)\nKubernetes is an open-source container orchestration platform designed to automate application deployment, scaling, and management.' },
            { id: 'k8s-unit-1-2', title: '1.2 Kubernetes Architecture', order: 2, duration: '45 mins', type: 'reading', content: '## Kubernetes Architecture\nLearn control plane components (API Server, etcd, Scheduler, Controller Manager) and worker node components (Kubelet, Kube-proxy).' },
            { id: 'k8s-unit-1-3', title: '1.3 Kubernetes Cluster & Components', order: 3, duration: '40 mins', type: 'reading', content: '## Cluster Components\nDeep dive into Kubelet agent, Kube-proxy networking, and container runtime components that power worker nodes.' },
            { id: 'k8s-unit-1-4', title: '1.4 Kubernetes Objects & YAML', order: 4, duration: '40 mins', type: 'reading', content: '## Objects & YAML\nUnderstand declarative configuration architecture, metadata properties, specs, and status.' },
            { id: 'k8s-unit-1-5', title: '1.5 Installing Minikube & kubectl', order: 5, duration: '35 mins', type: 'reading', content: '## Installing Minikube & kubectl\nSetting up a local single-node cluster environment and configuring the kubectl command-line tool.' },
            { id: 'k8s-unit-1-6', title: '1.6 Basic kubectl Commands', order: 6, duration: '45 mins', type: 'reading', content: '## Basic kubectl Commands\nMaster essential CLI syntax including get, describe, create, apply, delete, and logs.' },
            { id: 'k8s-unit-1-7', title: '1.7 Practice: Create Your First Pod', order: 7, duration: '60 mins', type: 'assignment', content: '## ⚠️ Practice Only\nDeploy containers using YAML manifests and test Pod logs.' }
          ]
        },
        {
          moduleId: 'k8s-mod-2',
          lessons: [
            { id: 'k8s-unit-2-1', title: '2.1 Pods & Pod Lifecycle', order: 1, duration: '45 mins', type: 'reading', content: '## Pod Lifecycle\nLearn pod lifecycle states (Pending, Running, Succeeded, Failed, Unknown) and multi-container Pod layouts.' },
            { id: 'k8s-unit-2-2', title: '2.2 Labels, Selectors & Namespaces', order: 2, duration: '45 mins', type: 'reading', content: '## Labels, Selectors & Namespaces\nOrganize resources with label selectors and create virtual cluster partitions using namespaces.' },
            { id: 'k8s-unit-2-3', title: '2.3 ReplicaSets & Deployments', order: 3, duration: '45 mins', type: 'reading', content: '## Deployments & ReplicaSets\nManage replication levels and define declarative updates using deployment workloads.' },
            { id: 'k8s-unit-2-4', title: '2.4 Scaling Applications', order: 4, duration: '40 mins', type: 'reading', content: '## Scaling Applications\nPerform manual workload scaling using replicas parameter commands.' },
            { id: 'k8s-unit-2-5', title: '2.5 Rolling Updates & Rollbacks', order: 5, duration: '50 mins', type: 'reading', content: '## Rolling Updates & Rollbacks\nExecute zero-downtime application releases and roll back deployment history.' },
            { id: 'k8s-unit-2-6', title: '2.6 Jobs & CronJobs', order: 6, duration: '40 mins', type: 'reading', content: '## Jobs & CronJobs\nExecute batch processing scripts and periodic scheduled tasks.' },
            { id: 'k8s-unit-2-7', title: '2.7 Health Checks & Probes', order: 7, duration: '45 mins', type: 'reading', content: '## Probes\nConfigure liveness, readiness, and startup checks to auto-restart containers.' },
            { id: 'k8s-unit-2-8', title: '2.8 Practice: Deploy an Application', order: 8, duration: '50 mins', type: 'assignment', content: '## ⚠️ Practice Only\nDeploy, scale, and update replication workloads inside the sandbox environment.' }
          ]
        },
        {
          moduleId: 'k8s-mod-3',
          lessons: [
            { id: 'k8s-unit-3-1', title: '3.1 Kubernetes Networking Basics', order: 1, duration: '40 mins', type: 'reading', content: '## Networking Model\nExplore container communication and IP-per-Pod networking principles.' },
            { id: 'k8s-unit-3-2', title: '3.2 Services Overview', order: 2, duration: '40 mins', type: 'reading', content: '## Services Overview\nUnderstand Service stable endpoint abstractions and selector discovery.' },
            { id: 'k8s-unit-3-3', title: '3.3 ClusterIP, NodePort & LoadBalancer', order: 3, duration: '45 mins', type: 'reading', content: '## Service Types\nCompare internal ClusterIP, NodePort routing, and external LoadBalancer bindings.' },
            { id: 'k8s-unit-3-4', title: '3.4 Service Discovery & DNS', order: 4, duration: '40 mins', type: 'reading', content: '## Service DNS\nLearn cluster internal CoreDNS resolution naming rules.' },
            { id: 'k8s-unit-3-5', title: '3.5 Ingress & Ingress Controller', order: 5, duration: '50 mins', type: 'reading', content: '## Ingress reverse proxy\nConfigure path-based reverse routing rules using Ingress Controllers.' },
            { id: 'k8s-unit-3-6', title: '3.6 Network Policies', order: 6, duration: '45 mins', type: 'reading', content: '## Network Policies\nManage internal container connection firewalls using ingress and egress policies.' },
            { id: 'k8s-unit-3-7', title: '3.7 Practice: Expose an Application', order: 7, duration: '40 mins', type: 'assignment', content: '## ⚠️ Practice Only\nConfigure Services and map Ingress routing rules.' }
          ]
        },
        {
          moduleId: 'k8s-mod-4',
          lessons: [
            { id: 'k8s-unit-4-1', title: '4.1 ConfigMaps', order: 1, duration: '45 mins', type: 'reading', content: '## ConfigMaps\nStore non-sensitive environment configuration files and maps.' },
            { id: 'k8s-unit-4-2', title: '4.2 Secrets', order: 2, duration: '45 mins', type: 'reading', content: '## Secrets\nSecure sensitive parameters, passwords, and connection hashes.' },
            { id: 'k8s-unit-4-3', title: '4.3 Environment Variables', order: 3, duration: '40 mins', type: 'reading', content: '## Env Variables\nInject configurations into container environments from ConfigMaps/Secrets.' },
            { id: 'k8s-unit-4-4', title: '4.4 Kubernetes Volumes', order: 4, duration: '40 mins', type: 'reading', content: '## Volumes\nMount host paths or ephemeral emptyDirs directly to container runtimes.' },
            { id: 'k8s-unit-4-5', title: '4.5 PersistentVolumes & PVC', order: 5, duration: '50 mins', type: 'reading', content: '## PV & PVC\nProvision persistent storage resources and bind them to container claims.' },
            { id: 'k8s-unit-4-6', title: '4.6 StorageClasses', order: 6, duration: '45 mins', type: 'reading', content: '## StorageClasses\nConfigure dynamic provisioning parameters to allocate cloud storage.' },
            { id: 'k8s-unit-4-7', title: '4.7 Resource Requests & Limits', order: 7, duration: '45 mins', type: 'reading', content: '## Resource Limits\nPrevent container resource leaks by setting CPU/Memory requests and bounds.' },
            { id: 'k8s-unit-4-8', title: '4.8 Practice: Deploy App with Storage', order: 8, duration: '50 mins', type: 'assignment', content: '## ⚠️ Practice Only\nBind PVCs and deploy stateful web apps.' }
          ]
        },
        {
          moduleId: 'k8s-mod-5',
          lessons: [
            { id: 'k8s-unit-5-1', title: '5.1 Kubernetes Security Basics', order: 1, duration: '40 mins', type: 'reading', content: '## Security Basics\nUnderstand cloud native security and restrict access to control interfaces.' },
            { id: 'k8s-unit-5-2', title: '5.2 Users, ServiceAccounts & RBAC', order: 2, duration: '45 mins', type: 'reading', content: '## ServiceAccounts & RBAC\nSet up workload identities and manage access rules.' },
            { id: 'k8s-unit-5-3', title: '5.3 Roles & RoleBindings', order: 3, duration: '45 mins', type: 'reading', content: '## Roles & Bindings\nConfigure Role and ClusterRoles verbs permissions and map them.' },
            { id: 'k8s-unit-5-4', title: '5.4 Security Context & Pod Security', order: 4, duration: '45 mins', type: 'reading', content: '## Security Contexts\nRun container processes as non-root users and set root limits.' },
            { id: 'k8s-unit-5-5', title: '5.5 Node Scheduling', order: 5, duration: '40 mins', type: 'reading', content: '## Node Scheduling\nControl workload node assignment scopes using selectors.' },
            { id: 'k8s-unit-5-6', title: '5.6 Taints, Tolerations & Affinity', order: 6, duration: '50 mins', type: 'reading', content: '## Advanced Scheduling\nConfigure node taints, tolerations, and affinity rules.' },
            { id: 'k8s-unit-5-7', title: '5.7 Troubleshooting Kubernetes', order: 7, duration: '45 mins', type: 'reading', content: '## Troubleshooting\nDiagnose CrashLoopBackOff, ImagePullBackOff, and Pending states.' },
            { id: 'k8s-unit-5-8', title: '5.8 Practice: Secure & Troubleshoot a Cluster', order: 8, duration: '50 mins', type: 'assignment', content: '## ⚠️ Practice Only\nConfigure ServiceAccounts, RBAC roles, and troubleshoot failed Pod configurations.' }
          ]
        },
        {
          moduleId: 'k8s-mod-6',
          lessons: [
            { id: 'k8s-unit-6-1', title: '6.1 Kubernetes Production Basics', order: 1, duration: '45 mins', type: 'reading', content: '## Production Guidelines\nEstablish multi-master HA control planes and set up anti-affinity replica placements.' },
            { id: 'k8s-unit-6-2', title: '6.2 Autoscaling', order: 2, duration: '45 mins', type: 'reading', content: '## HPA\nConfigure CPU-based Horizontal Pod Autoscaling triggers.' },
            { id: 'k8s-unit-6-3', title: '6.3 Monitoring & Logging', order: 3, duration: '40 mins', type: 'reading', content: '## Monitoring & Logging\nIntegrate Prometheus scraper agents, Grafana analytics, and Fluentd aggregate log collectors.' },
            { id: 'k8s-unit-6-4', title: '6.4 Helm & Helm Charts', order: 4, duration: '45 mins', type: 'reading', content: '## Helm Charts\nLearn the Kubernetes package manager to install templated releases.' },
            { id: 'k8s-unit-6-5', title: '6.5 Kubernetes with Docker & Git', order: 5, duration: '45 mins', type: 'reading', content: '## Registries & Workflows\nDockerize source files, push image tags to repositories, and deploy to K8s.' },
            { id: 'k8s-unit-6-6', title: '6.6 CI/CD with Kubernetes', order: 6, duration: '40 mins', type: 'reading', content: '## CI/CD Pipelines\nConfigure Jenkins pipelines and ArgoCD GitOps sync loops.' },
            { id: 'k8s-unit-6-7', title: '6.7 Cloud Kubernetes — EKS, AKS & GKE', order: 7, duration: '40 mins', type: 'reading', content: '## Cloud Kubernetes\nDeploy workloads to managed cloud clusters (EKS, AKS, GKE).' },
            { id: 'k8s-unit-6-8', title: '6.8 Final Project: Deploy Full-Stack Application', order: 8, duration: '60 mins', type: 'assignment', content: '## ⚠️ Practice Only\nDeploy a complete full-stack architecture inside the final project lab.' }
          ]
        }
      ];

      for (const group of lessonsList) {
        for (const les of group.lessons) {
          await lessonsCollection().doc(les.id).set(toDocument({
            ...les,
            moduleId: group.moduleId,
            courseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }

      const quizzesData = [
        { id: 'k8s-quiz-1', moduleId: 'k8s-mod-1', title: 'Kubernetes Basics Quiz', questions: [] },
        { id: 'k8s-quiz-2', moduleId: 'k8s-mod-6', title: 'Final Capstone Quiz', questions: [] },
      ];
      for (const quiz of quizzesData) {
        await quizzesCollection().doc(quiz.id).set(toDocument({
          ...quiz,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const assignmentsData = [
        { id: 'k8s-assign-1', moduleId: 'k8s-mod-1', title: 'Practice: Create Your First Pod (For Practice Only)', description: 'Deploy container pods using YAML manifests.' },
        { id: 'k8s-assign-2', moduleId: 'k8s-mod-2', title: 'Practice: Deploy an Application (For Practice Only)', description: 'Deploy and scale replica workloads.' },
        { id: 'k8s-assign-3', moduleId: 'k8s-mod-3', title: 'Practice: Expose an Application (For Practice Only)', description: 'Configure internal services and Ingress rules.' },
        { id: 'k8s-assign-4', moduleId: 'k8s-mod-4', title: 'Practice: Deploy App with Storage (For Practice Only)', description: 'Bind storage claims to app pods.' },
        { id: 'k8s-assign-5', moduleId: 'k8s-mod-5', title: 'Practice: Secure & Troubleshoot a Cluster (For Practice Only)', description: 'Configure Role bindings and troubleshoot failed states.' },
        { id: 'k8s-assign-6', moduleId: 'k8s-mod-6', title: 'Final Project: Deploy Full-Stack Application', description: 'Capstone deployment project.' },
      ];
      for (const assign of assignmentsData) {
        await assignmentsCollection().doc(assign.id).set(toDocument({
          ...assign,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      console.log('Successfully seeded Kubernetes course structure.');
    } catch (error) {
      console.error('Error seeding Kubernetes course details:', error);
    }
  }

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the React JS Complete Course.
   */
  async seedReactCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection } = await import('../../firebase/collections');
      
      console.log('Seeding React JS detailed syllabus collections...');

      const modulesData = [
        { id: 'react-mod-1', title: 'Module 1: Introduction to React JS', order: 1, duration: '4 Hours' },
        { id: 'react-mod-2', title: 'Module 2: Setting Up the React', order: 2, duration: '4 Hours' },
        { id: 'react-mod-3', title: 'Module 3: JSX (JavaScript XML)', order: 3, duration: '4 Hours' },
        { id: 'react-mod-4', title: 'Module 4: React Components', order: 4, duration: '4 Hours' },
        { id: 'react-mod-5', title: 'Module 5: React Props (Properties)', order: 5, duration: '4 Hours' },
        { id: 'react-mod-6', title: 'Module 6: React State and Hooks', order: 6, duration: '4 Hours' },
        { id: 'react-mod-7', title: 'Module 7: React Events and Forms', order: 7, duration: '4 Hours' },
        { id: 'react-mod-8', title: 'Module 8: Lists and Conditional', order: 8, duration: '4 Hours' },
        { id: 'react-mod-9', title: 'Module 9: React Hooks', order: 9, duration: '4 Hours' },
        { id: 'react-mod-10', title: 'Module 10: React Router', order: 10, duration: '4 Hours' },
        { id: 'react-mod-11', title: 'Module 11: API Integration in React', order: 11, duration: '4 Hours' },
        { id: 'react-mod-12', title: 'Module 12: State Management in React', order: 12, duration: '4 Hours' },
        { id: 'react-mod-13', title: 'Module 13: Styling React Applications', order: 13, duration: '4 Hours' },
        { id: 'react-mod-14', title: 'Module 14: Building Real-World React', order: 14, duration: '4 Hours' },
        { id: 'react-mod-15', title: 'Module 15: React Interview Preparation', order: 15, duration: '4 Hours' },
      ];

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument({
          ...mod,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      const lessonsList = [
        {
          moduleId: 'react-mod-1',
          lessons: [
            {
              id: 'react-unit-1-1',
              title: '1.1 Introduction to React JS',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern websites need to be fast, interactive, and user-friendly. Traditional JavaScript can 
build
 
websites,
 
but
 
as
 
applications
 
become
 
larger,
 
managing
 
the
 
code
 
becomes
 
difficult.
 
To solve this problem, React JS was introduced. 
React helps developers build fast, reusable, and interactive user interfaces (UI) . 
Today, React is one of the most popular JavaScript libraries used in web development. 
 
What is React JS? 
React JS is a JavaScript library used to build user interfaces (UI), especially for Single 
Page
 
Applications
 
(SPAs)
.
 
--- PAGE 5 ---
It was developed by Meta (formerly Facebook) and first released in 2013 . 
Simple Definition 
React is a JavaScript library used to build fast, interactive, and reusable user 
interfaces.
 
 
Real-Time Example 
Think about Instagram . 
When you like a photo: 
● Only the Like button changes. ● The whole page does not reload. 
React updates only the changed part of the page, making the application faster.`
            },
            {
              id: 'react-unit-1-2',
              title: '1.2 History of React JS',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `React was created by Jordan Walke , a software engineer at Facebook. 
Facebook needed a better way to build large web applications with dynamic user interfaces. 
React was first used internally at Facebook and later released as an open-source project in 
2013
.
 
Today, React is maintained by Meta and a large community of developers.`
            },
            {
              id: 'react-unit-1-3',
              title: '1.3 Why React JS?',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Before React, developers used plain HTML, CSS, and JavaScript. 
As applications became bigger: 
● Code became difficult to manage. ● Updating the UI became slow. ● Reusing code was difficult. ● Large applications became complex. 
--- PAGE 6 ---
React solves these problems using reusable components and efficient rendering. 
 
Problems Before React 
● Full page reloads ● Duplicate code ● Poor performance ● Difficult maintenance ● Complex DOM manipulation 
 
Why Developers Choose React 
● Fast performance ● Reusable components ● Easy to learn ● Large community ● Strong ecosystem ● Used by top companies`
            },
            {
              id: 'react-unit-1-4',
              title: '1.4 Features of React JS',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `1. Component-Based Architecture 
React applications are built using Components . 
A component is a reusable piece of UI. 
Example: 
A shopping website has: 
● Header ● Navbar ● Product Card ● Footer 
Each can be created as a separate component. 
Advantages 
--- PAGE 7 ---
● Reusable code ● Easy maintenance ● Better organization 
 
2. Virtual DOM 
React uses a Virtual DOM instead of directly updating the browser's DOM. 
How It Works 
1. User performs an action. 2. React updates the Virtual DOM. 3. React compares the old and new Virtual DOM. 4. Only the changed part is updated in the Real DOM. 
 
Diagram User Action │ ▼ Virtual DOM │ Compare Changes │ ▼ Real DOM Updated 
Benefits 
● Faster rendering ● Better performance ● Efficient updates 
 
3. Declarative Programming 
In React, developers describe what the UI should look like , and React handles updating 
the
 
screen.
 
This makes code simpler and easier to understand. 
 
--- PAGE 8 ---
4. Reusable Components 
Once a component is created, it can be used multiple times. 
Example: 
A Button Component can be used in: 
● Login Page ● Signup Page ● Dashboard ● Settings Page 
 
5. One-Way Data Flow 
Data in React flows from Parent Component to Child Component . 
This makes applications easier to debug and maintain.`
            },
            {
              id: 'react-unit-1-5',
              title: '1.5 Advantages of React JS',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `● Fast rendering using Virtual DOM. ● Reusable components reduce development time. ● Easy to learn for JavaScript developers. ● Large developer community. ● SEO-friendly with server-side rendering support. ● Strong ecosystem with many libraries. ● Easy integration with APIs.`
            },
            {
              id: 'react-unit-1-6',
              title: '1.6 Disadvantages of React JS',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `● React only handles the UI. ● Additional libraries are needed for routing and state management. ● Beginners may find JSX confusing initially. ● Frequent updates require developers to keep learning. 
 
--- PAGE 9 ---`
            },
            {
              id: 'react-unit-1-7',
              title: '1.7 React JS vs Traditional JavaScript',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Traditional JavaScript React JS 
Updates the entire page Updates only changed parts 
More manual DOM manipulation Virtual DOM handles updates 
Harder to maintain large apps Easier with reusable components 
Less reusable Highly reusable 
Slower for complex UIs Better performance`
            },
            {
              id: 'react-unit-1-8',
              title: '1.8 Applications Built with React',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Many popular companies use React. 
Examples: 
● Facebook ● Instagram ● Netflix ● WhatsApp Web ● Airbnb ● Dropbox 
These companies use React because it helps build fast and scalable user interfaces.`
            },
            {
              id: 'react-unit-1-9',
              title: '1.9 React Ecosystem',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `React works with many supporting tools. 
 React JS │ ┌────────────┼────────────┐ │ │ │ React Router Redux Axios │ │ │ Navigation State Mgmt API Calls 
--- PAGE 10 ---`
            },
            {
              id: 'react-unit-1-10',
              title: '1.10 Best Practices',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `● Build small and reusable components. ● Keep components simple. ● Follow proper naming conventions. ● Write clean and readable code. ● Use the latest stable React version. ● Organize project folders properly.`
            },
            {
              id: 'react-unit-1-11',
              title: '1.11 Common Mistakes',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Writing all code in one component. 
❌ Repeating the same code instead of creating reusable components. 
❌ Directly modifying state. 
❌ Ignoring component structure. 
❌ Using unnecessary re-renders. 
 
Real-Time Scenario 
A company wants to build an Online Food Delivery App . 
Instead of creating separate pages manually, they build reusable React components: 
● Header ● Navigation Bar ● Restaurant Card ● Menu ● Cart ● Footer 
When a customer adds an item to the cart, only the Cart component updates, while the rest 
of
 
the
 
page
 
remains
 
unchanged.
 
This
 
provides
 
a
 
fast
 
and
 
smooth
 
user
 
experience.`
            },
            {
              id: 'react-unit-1-12',
              title: 'Interview Questions (Common Mistakes)',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

--- PAGE 11 ---
1. What is React JS? 
Answer: 
 
React
 
JS
 
is
 
a
 
JavaScript
 
library
 
used
 
to
 
build
 
fast,
 
interactive,
 
and
 
reusable
 
user
 
interfaces.
 
 
2. Who developed React? 
Answer: 
 
React
 
was
 
developed
 
by
 
Meta
 
(Facebook)
 
and
 
created
 
by
 
Jordan
 
Walke
.
 
 
3. What is the Virtual DOM? 
Answer: 
 
The
 
Virtual
 
DOM
 
is
 
a
 
lightweight
 
copy
 
of
 
the
 
Real
 
DOM.
 
React
 
compares
 
changes
 
in
 
the
 
Virtual
 
DOM
 
and
 
updates
 
only
 
the
 
required
 
parts
 
of
 
the
 
Real
 
DOM,
 
improving
 
performance.
 
 
4. What is a Component? 
Answer: 
 
A
 
Component
 
is
 
a
 
reusable
 
and
 
independent
 
piece
 
of
 
UI
 
that
 
can
 
be
 
used
 
multiple
 
times
 
in
 
a
 
React
 
application.
 
 
5. Why is React faster than traditional JavaScript? 
Answer: 
 
React
 
is
 
faster
 
because
 
it
 
uses
 
the
 
Virtual
 
DOM
 
to
 
update
 
only
 
the
 
changed
 
parts
 
of
 
the
 
page
 
instead
 
of
 
reloading
 
the
 
entire
 
page.`
            },
            {
              id: 'react-unit-1-13',
              title: 'Practical Exercise (Common Mistakes)',
              order: 13,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Exercise - Common Mistakes

Task 1 
Visit the official React website and explore the homepage. 
Task 2 
List five companies that use React. 
--- PAGE 12 ---
Task 3 
Write three advantages of React. 
Task 4 
Explain the difference between the Real DOM and Virtual DOM in your own words. 
Task 5 
Draw a simple diagram showing: 
User Action │ Virtual DOM │ Real DOM │ Updated Web Page`
            },
          ]
        },
        {
          moduleId: 'react-mod-2',
          lessons: [
            {
              id: 'react-unit-2-1',
              title: '2.1 Introduction',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Before building React applications, we need to set up the development environment. 
A React application cannot run directly in the browser because it requires JavaScript tools to 
build
 
and
 
manage
 
the
 
project.
 
--- PAGE 13 ---
The main tools required are: 
● Node.js ● npm (Node Package Manager) ● Visual Studio Code ● Vite (Build Tool) 
 
Real-Time Example 
Imagine you want to build a house. 
Before construction, you need: 
● Bricks ● Cement ● Sand ● Tools 
Similarly, before developing React applications, you need to install the required software.`
            },
            {
              id: 'react-unit-2-2',
              title: '2.2 Software Requirements',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `To develop React applications, install the following software. 
Software Purpose 
Node.js JavaScript Runtime 
npm Package Manager 
VS Code Code Editor 
Vite React Project Creator 
Chrome Browser Run and Test Applications`
            },
            {
              id: 'react-unit-2-3',
              title: '2.3 What is Node.js?',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Node.js is a JavaScript runtime environment that allows JavaScript to run outside the 
browser.
 
--- PAGE 14 ---
Without Node.js, React applications cannot be created or executed. 
 
Why Node.js is Required? 
Node.js provides: 
● JavaScript Runtime ● npm Package Manager ● Project Build Support ● Development Server 
 
Features of Node.js 
● Fast execution ● Cross-platform ● Lightweight ● Open Source ● Large Community`
            },
            {
              id: 'react-unit-2-4',
              title: '2.4 What is npm?',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `npm stands for Node Package Manager . 
It helps developers install external libraries and packages. 
Examples: 
● React ● Axios ● Bootstrap ● Tailwind CSS 
 
Example 
Install React package: 
npm install react 
--- PAGE 15 ---
Install Axios: 
npm install axios`
            },
            {
              id: 'react-unit-2-5',
              title: '2.5 Installing Node.js',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Step 1 
Visit the official Node.js website. 
Download the LTS (Long-Term Support) version. 
Step 2 
Run the installer. 
Click: 
Next → Next → Install → Finish 
Step 3 
Restart the computer if required.`
            },
            {
              id: 'react-unit-2-6',
              title: '2.6 Verify Installation',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Open Terminal or Command Prompt. 
Check Node.js version. 
node -v 
Example Output 
v22.5.0 
Check npm version. 
npm -v 
Example 
10.8.2 
--- PAGE 16 ---
If both commands show version numbers, the installation is successful.`
            },
            {
              id: 'react-unit-2-7',
              title: '2.7 Installing Visual Studio Code',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Visual Studio Code (VS Code) is one of the most popular editors for React development. 
Why VS Code? 
● Free ● Lightweight ● Fast ● Supports Extensions ● Excellent React Support 
 
Recommended Extensions 
● ES7+ React Snippets ● Prettier ● ESLint ● Auto Rename Tag ● Auto Close Tag ● Live Server (optional)`
            },
            {
              id: 'react-unit-2-8',
              title: '2.8 What is Vite?',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Vite is a modern build tool used to create React applications. 
It is faster than Create React App because it starts the development server almost instantly. 
 
Advantages of Vite 
● Faster startup ● Lightweight ● Hot Module Replacement (HMR) ● Easy configuration ● Better performance 
--- PAGE 17 ---`
            },
            {
              id: 'react-unit-2-9',
              title: '2.9 Creating Your First React Project',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Open Terminal. 
Run: 
npm create vite@latest 
Enter: 
Project Name : react-app 
Select: 
Framework : React 
Select: 
Variant : JavaScript 
Go inside the project folder. 
cd react-app 
Install dependencies. 
npm install 
Run the application. 
npm run dev 
Example Output 
Local: http://localhost:5173/ 
Open this URL in your browser. 
Your first React application will appear.`
            },
            {
              id: 'react-unit-2-10',
              title: '2.10 React Project Folder Structure',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `react-app/ │ 
--- PAGE 18 ---
├── node_modules/ ├── public/ ├── src/ │ ├── App.jsx │ ├── main.jsx │ ├── assets/ │ ├── package.json ├── package-lock.json ├── vite.config.js └── index.html`
            },
            {
              id: 'react-unit-2-11',
              title: '2.11 Important Files',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `src/ 
Contains the application's source code. 
 
App.jsx 
Main React component where most UI is developed. 
 
main.jsx 
Entry point of the React application. 
It renders the App component. 
 
public/ 
Stores static files. 
Examples: 
● Images ● Icons ● PDFs 
--- PAGE 19 ---
 
package.json 
Contains: 
● Project name ● Dependencies ● Scripts ● Version information 
 
node_modules/ 
Stores installed npm packages. 
Developers should not edit this folder manually.`
            },
            {
              id: 'react-unit-2-12',
              title: '2.12 Running the React Application',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `Start the development server. 
npm run dev 
Stop the server. 
Press: 
CTRL + C 
Restart: 
npm run dev`
            },
            {
              id: 'react-unit-2-13',
              title: '2.13 Common Errors',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `Error 'node' is not recognized 
Reason 
--- PAGE 20 ---
Node.js is not installed or not added to the system PATH. 
Solution 
Reinstall Node.js and restart the computer. 
 
Error npm command not found 
Reason 
npm installation failed. 
Solution 
Reinstall Node.js. 
 
Error Module not found 
Reason 
Dependencies are missing. 
Solution 
Run: 
npm install`
            },
            {
              id: 'react-unit-2-14',
              title: '2.14 Best Practices',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `● Install the LTS version of Node.js. ● Use VS Code for development. ● Keep npm packages updated. ● Use meaningful project names. ● Do not modify the node_modules folder. ● Organize project files properly. 
 
--- PAGE 21 ---
Real-Time Scenario 
A software company wants to build an E-Commerce Website . 
The development team: 
1. Installs Node.js. 2. Installs VS Code. 3. Creates a React project using Vite. 4. Installs required packages. 5. Starts the development server. 6. Begins building the website. 
This setup allows the team to develop, test, and update the application efficiently.`
            },
            {
              id: 'react-unit-2-15',
              title: 'Interview Questions (Best Practices)',
              order: 15,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Best Practices

1. What is Node.js? 
Answer: 
 
Node.js
 
is
 
a
 
JavaScript
 
runtime
 
environment
 
that
 
allows
 
JavaScript
 
code
 
to
 
run
 
outside
 
the
 
browser.
 
 
2. What is npm? 
Answer: 
 
npm
 
(Node
 
Package
 
Manager)
 
is
 
used
 
to
 
install
 
and
 
manage
 
JavaScript
 
libraries
 
and
 
packages.
 
 
3. Why is Vite preferred over Create React App? 
Answer: 
 
Vite
 
provides
 
faster
 
startup,
 
better
 
performance,
 
and
 
Hot
 
Module
 
Replacement
 
(HMR),
 
making
 
development
 
quicker.
 
 
4. Which command creates a React project using Vite? npm create vite@latest 
--- PAGE 22 ---
5. Which command starts the React development server? npm run dev`
            },
            {
              id: 'react-unit-2-16',
              title: 'Practical Exercise (Best Practices)',
              order: 16,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Exercise - Best Practices

Task 1 
Install Node.js (LTS version). 
Task 2 
Verify the installation using: 
node -v npm -v 
Task 3 
Install Visual Studio Code. 
Task 4 
Create a React project using Vite. 
Task 5 
Run the application using: 
npm run dev 
Task 6 
Open the project in VS Code and identify: 
● src ● App.jsx ● main.jsx ● package.json`
            },
          ]
        },
        {
          moduleId: 'react-mod-3',
          lessons: [
            {
              id: 'react-unit-3-1',
              title: '3.1 Introduction to JSX',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `JSX (JavaScript XML) is one of the most important concepts in React. 
Although React is a JavaScript library, developers rarely write React applications using only 
JavaScript.
 
Instead,
 
React
 
introduces
 
JSX,
 
a
 
syntax
 
extension
 
that
 
allows
 
developers
 
to
 
write
 
HTML-like
 
code
 
directly
 
inside
 
JavaScript.
 
JSX simplifies UI development by making the code more readable, maintainable, and 
expressive.
 
It enables developers to describe the user interface declaratively rather than writing multiple 
JavaScript
 
function
 
calls.
 
 
Definition 
JSX (JavaScript XML) is a syntax extension for JavaScript that allows developers to write 
HTML-like
 
markup
 
inside
 
JavaScript
 
code.
 
JSX
 
is
 
not
 
understood
 
directly
 
by
 
browsers;
 
instead,
 
it
 
is
 
transformed
 
into
 
JavaScript
 
using
 
a
 
compiler
 
such
 
as
 
Babel
.
 
 
Why JSX Was Introduced 
Before JSX, creating user interfaces required developers to manually call React APIs. 
Example without JSX: 
const element = React.createElement( "h1", 
--- PAGE 24 ---
 { className: "title" }, "Welcome to React" ); 
The same code using JSX: 
const element = ( <h1 className="title"> Welcome to React </h1> ); 
The JSX version is: 
● More readable ● Easier to understand ● Easier to maintain ● Similar to HTML`
            },
            {
              id: 'react-unit-3-2',
              title: '3.2 History of JSX',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `JSX was introduced by the React development team at Meta (Facebook) . 
Before React, developers manipulated the DOM manually using JavaScript. 
Large applications became difficult because developers had to repeatedly create HTML 
elements,
 
update
 
the
 
DOM,
 
and
 
manage
 
UI
 
changes
 
manually.
 
React introduced JSX to simplify UI development and allow developers to describe the 
interface
 
using
 
declarative
 
syntax.
 
Today JSX is one of the most widely used syntaxes for frontend development.`
            },
            {
              id: 'react-unit-3-3',
              title: '3.3 Why Do We Need JSX?',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Modern applications contain hundreds of UI elements. 
Examples: 
● Login Forms ● Navigation Bars 
--- PAGE 25 ---
● Product Cards ● Dashboards ● Tables ● Charts 
Writing these using only JavaScript becomes complicated. 
JSX allows developers to create these interfaces quickly with less code. 
 
Problems Without JSX 
Without JSX: 
● Long JavaScript code ● Difficult DOM manipulation ● Less readability ● Hard to debug ● Difficult maintenance 
With JSX: 
● Cleaner syntax ● Better readability ● Faster UI development ● Easier maintenance ● Better developer productivity`
            },
            {
              id: 'react-unit-3-4',
              title: '3.4 How JSX Works',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Many beginners think browsers understand JSX. 
This is incorrect . 
Browsers only understand: 
● HTML ● CSS ● JavaScript 
JSX is neither HTML nor JavaScript. 
It is first converted into JavaScript. 
 
--- PAGE 26 ---
JSX Compilation Process JSX Code │ ▼ Babel Compiler │ ▼ React.createElement() │ ▼ React Element Object │ ▼ Virtual DOM │ ▼ Real DOM │ ▼ Browser 
Step-by-Step Process 
Step 1 
Developer writes JSX. 
<h1>Hello React</h1> 
↓ 
Step 2 
Babel converts JSX. 
React.createElement( "h1", null, "Hello React" ); 
↓ 
Step 3 
React creates a React Element. 
--- PAGE 27 ---
↓ 
Step 4 
Virtual DOM is updated. 
↓ 
Step 5 
React compares changes. 
↓ 
Step 6 
Only changed elements are updated in the Real DOM.`
            },
            {
              id: 'react-unit-3-5',
              title: '3.5 What is Babel?',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Babel is a JavaScript compiler. 
Its job is to convert modern JavaScript and JSX into browser-compatible JavaScript. 
Without Babel: 
<h1>Hello</h1> 
will generate an error because browsers cannot understand JSX. 
 
Advantages of Babel 
● Converts JSX ● Supports modern JavaScript ● Browser compatibility ● Optimized code generation`
            },
            {
              id: 'react-unit-3-6',
              title: '3.6 React Elements',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `When JSX is compiled, it creates React Elements . 
--- PAGE 28 ---
A React Element is a JavaScript object describing what should appear on the screen. 
Example 
const element = ( <h1>Hello</h1> ); 
After compilation 
const element = React.createElement( "h1", null, "Hello" ); 
This creates a React Element object.`
            },
            {
              id: 'react-unit-3-7',
              title: '3.7 JSX Syntax',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Basic Example 
function App(){ return( <h1> Welcome to React </h1> ); } export default App; 
Output 
Welcome to React`
            },
            {
              id: 'react-unit-3-8',
              title: '3.8 Rules of JSX',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 29 ---
Rule 1 
Return only one parent element. 
Correct 
return( <div> <h1>Hello</h1> <p>React</p> </div> ); 
Rule 2 
Every tag must be closed. 
Correct 
<img src="logo.png" /> 
Rule 3 
Use camelCase attributes. 
Correct 
onClick tabIndex readOnly 
Rule 4 
Use className instead of class. 
Wrong 
class="box" 
--- PAGE 30 ---
Correct 
className="box" 
Rule 5 
Use htmlFor instead of for. 
Wrong 
<label for="email"> 
Correct 
<label htmlFor="email">`
            },
            {
              id: 'react-unit-3-9',
              title: '3.9 JavaScript Expressions inside JSX',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `JSX allows JavaScript expressions inside curly braces {}. 
Example 
const name="Prasanna"; <h1> {name} </h1> 
Output 
Prasanna 
Example 
const a=20; const b=30; <h2> {a+b} </h2> 
Output 
50 
--- PAGE 31 ---
Functions 
function greet(){ return "Good Morning"; } <h2> {greet()} </h2> 
Output 
Good Morning`
            },
            {
              id: 'react-unit-3-10',
              title: '3.10 Dynamic Rendering',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `One of the biggest advantages of JSX is dynamic rendering. 
Example 
const isLoggedIn=true; return( <h2> { isLoggedIn ? "Welcome User" : "Please Login" } </h2> ); 
The UI changes automatically based on the condition. 
--- PAGE 32 ---`
            },
            {
              id: 'react-unit-3-11',
              title: '3.11 Advantages of JSX',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `● Easy to understand. ● Looks similar to HTML. ● Supports JavaScript expressions. ● Improves code readability. ● Makes UI development faster. ● Reduces boilerplate code. ● Encourages reusable components. ● Easy debugging.`
            },
            {
              id: 'react-unit-3-12',
              title: '3.12 Common Mistakes',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Using class instead of className 
❌ Returning multiple parent elements 
❌ Forgetting to close tags 
❌ Writing JavaScript without {} 
❌ Using inline logic excessively 
 
Real-Time Example 
Consider an E-Commerce Website . 
The Product Card component is written using JSX. 
<ProductCard name="Laptop" price={65000} stock={10} /> 
--- PAGE 33 ---
Instead of manually creating product HTML multiple times, React reuses the same 
component
 
with
 
different
 
data,
 
reducing
 
code
 
duplication
 
and
 
making
 
the
 
application
 
easier
 
to
 
maintain.`
            },
            {
              id: 'react-unit-3-13',
              title: 'Interview Questions (Common Mistakes)',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is JSX? 
Answer: 
 
JSX
 
(JavaScript
 
XML)
 
is
 
a
 
syntax
 
extension
 
for
 
JavaScript
 
that
 
allows
 
developers
 
to
 
write
 
HTML-like
 
code
 
inside
 
JavaScript.
 
It
 
is
 
compiled
 
into
 React.createElement() calls 
before
 
execution.
 
 
2. Does the browser understand JSX directly? 
Answer: 
 
No.
 
Browsers
 
do
 
not
 
understand
 
JSX.
 
It
 
must
 
first
 
be
 
compiled
 
into
 
JavaScript
 
using
 
Babel.
 
 
3. What is Babel? 
Answer: 
 
Babel
 
is
 
a
 
JavaScript
 
compiler
 
that
 
converts
 
JSX
 
and
 
modern
 
JavaScript
 
into
 
browser-compatible
 
JavaScript.
 
 
4. Why is className used instead of class? 
Answer: 
 
Because
 class is a reserved keyword in JavaScript, React uses className to define 
CSS
 
classes.
 
 
5. What is the role of React.createElement()? 
Answer: 
 
It
 
creates
 
React
 
Element
 
objects
 
that
 
describe
 
the
 
UI.
 
JSX
 
is
 
internally
 
converted
 
into
 React.createElement() calls. 
--- PAGE 34 ---`
            },
            {
              id: 'react-unit-3-14',
              title: 'Practical Lab (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a JSX page displaying: 
● Name ● College ● Branch 
 
Task 2 
Display the sum of two numbers using JSX expressions. 
 
Task 3 
Create a login message using the ternary operator. 
 
Task 4 
Create a Product Card using JSX.`
            },
          ]
        },
        {
          moduleId: 'react-mod-4',
          lessons: [
            {
              id: 'react-unit-4-1',
              title: '4.1 Introduction to React Components',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `React applications are built using Components . A component is an independent, reusable 
piece
 
of
 
user
 
interface
 
(UI)
 
that
 
encapsulates
 
its
 
own
 
structure,
 
logic,
 
and
 
behavior.
 
Instead of creating an entire web page as one large file, React divides the application into 
small
 
reusable
 
components.
 
This approach makes applications easier to develop, maintain, test, and scale. 
 
Definition 
A React Component is a reusable JavaScript function or class that returns JSX and 
represents
 
a
 
part
 
of
 
the
 
user
 
interface.
 
 
Real-Time Example 
Consider an E-Commerce Website . 
The homepage contains: 
● Navigation Bar ● Search Bar ● Product Card ● Shopping Cart ● Footer 
Instead of writing all the code in one file, each section is created as a separate component. 
E-Commerce Website │ ┌──────┼────────┐ │ │ │ Navbar Banner Products │ ┌───────┼────────┐ │ │ │ Product1 Product2 Product3 
Each Product Card is the same component but displays different product data. 
 
--- PAGE 36 ---`
            },
            {
              id: 'react-unit-4-2',
              title: '4.2 Why Components?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Large applications may contain thousands of lines of code. 
Without components: 
● Difficult to maintain ● Code duplication ● Hard debugging ● Low reusability 
With components: 
● Better organization ● Code reusability ● Easy maintenance ● Faster development`
            },
            {
              id: 'react-unit-4-3',
              title: '4.3 Characteristics of Components',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `A React component should be: 
● Independent ● Reusable ● Modular ● Easy to test ● Easy to maintain 
Each component performs one specific responsibility.`
            },
            {
              id: 'react-unit-4-4',
              title: '4.4 Types of Components',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `React mainly provides two types of components. 
1. Functional Components 
Modern React applications use Functional Components. 
They are JavaScript functions that return JSX. 
Example: 
--- PAGE 37 ---
function Welcome(){ return( <h1>Welcome to React</h1> ); } export default Welcome; 
Output 
Welcome to React 
Advantages 
● Simple syntax ● Easy to understand ● Supports Hooks ● Better performance ● Less code 
 
2. Class Components 
Before React Hooks were introduced, developers used Class Components. 
Example: 
import React,{Component} from "react"; class Welcome extends Component{ render(){ return( <h1>Welcome to React</h1> ); } } 
--- PAGE 38 ---
 export default Welcome; 
Although Class Components are still supported, Functional Components are recommended 
for
 
modern
 
development.
 
 
Functional Components vs Class 
Components
 
Functional Component Class Component 
JavaScript Function ES6 Class 
Uses Hooks Uses Lifecycle Methods 
Less Code More Code 
Easier to Learn More Complex 
Preferred in Modern React 
Mostly Legacy Projects`
            },
            {
              id: 'react-unit-4-5',
              title: '4.5 Component Architecture',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `React follows a hierarchical component architecture. 
App │ ├── Navbar │ ├── Sidebar │ ├── Dashboard │ │ │ ├── Card │ ├── Chart │ └── Table │ └── Footer 
The App component acts as the root component. 
--- PAGE 39 ---`
            },
            {
              id: 'react-unit-4-6',
              title: '4.6 Creating Your First Component',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Create a file named: 
Welcome.jsx 
Code: 
function Welcome(){ return( <h2>Hello Students</h2> ); } export default Welcome; 
Import inside App.jsx 
import Welcome from "./Welcome"; function App(){ return( <div> <Welcome/> </div> ); } export default App; 
Output 
Hello Students 
--- PAGE 40 ---`
            },
            {
              id: 'react-unit-4-7',
              title: '4.7 Component Naming Rules',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `React components must: 
✅ Start with a Capital Letter 
Correct 
Navbar Footer Dashboard 
Wrong 
navbar footer dashboard 
React treats lowercase names as HTML tags.`
            },
            {
              id: 'react-unit-4-8',
              title: '4.8 Reusable Components',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `One of React's biggest strengths is component reusability. 
Example 
Instead of writing three Product Cards separately, 
Create one ProductCard component. 
<ProductCard/> <ProductCard/> <ProductCard/> 
The same component is reused multiple times. 
 
--- PAGE 41 ---`
            },
            {
              id: 'react-unit-4-9',
              title: '4.9 Component Composition',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Component Composition means combining multiple smaller components to create larger 
applications.
 
Example 
App │ ├── Header ├── Navbar ├── Content ├── Footer 
Instead of one large component, many small components work together.`
            },
            {
              id: 'react-unit-4-10',
              title: '4.10 Folder Structure',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Professional React projects organize components like this. 
src │ ├── components │ ├── Navbar.jsx │ ├── Footer.jsx │ ├── Sidebar.jsx │ ├── ProductCard.jsx │ ├── pages │ ├── assets │ 
--- PAGE 42 ---
├── App.jsx │ └── main.jsx 
This structure improves maintainability.`
            },
            {
              id: 'react-unit-4-11',
              title: '4.11 Component Lifecycle (Overview)',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `Every component goes through three phases. 
Component Created ↓ Component Updated ↓ Component Removed 
These phases are known as: 
● Mounting ● Updating ● Unmounting 
Functional Components use Hooks like useEffect() to perform actions during these 
phases.`
            },
            {
              id: 'react-unit-4-12',
              title: '4.12 Best Practices',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `● Keep components small. ● One component should perform one responsibility. ● Use meaningful names. ● Reuse components whenever possible. ● Store components inside the components folder. ● Avoid writing all code in App.jsx. 
 
--- PAGE 43 ---`
            },
            {
              id: 'react-unit-4-13',
              title: '4.13 Common Mistakes',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Creating one huge component. 
❌ Using lowercase component names. 
❌ Duplicating component code. 
❌ Mixing UI and business logic. 
❌ Forgetting to export components. 
 
Real-Time Scenario 
A company develops a Hospital Management System . 
Instead of creating the dashboard in one file, 
they divide it into components. 
Dashboard │ ├── Doctor List ├── Patient List ├── Appointment List ├── Reports └── Billing 
Each team works independently on different components. 
This improves collaboration and development speed.`
            },
            {
              id: 'react-unit-4-14',
              title: 'Interview Questions (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is a React Component? 
--- PAGE 44 ---
Answer: 
A React Component is a reusable and independent piece of UI that returns JSX and 
represents
 
a
 
part
 
of
 
the
 
user
 
interface.
 
 
2. What are the two types of React Components? 
Answer: 
● Functional Components ● Class Components 
 
3. Why are Functional Components preferred? 
Answer: 
Because they are simpler, use Hooks, require less code, and provide better readability. 
 
4. What is Component Composition? 
Answer: 
Component Composition is the process of combining multiple smaller components to build a 
larger
 
application.
 
 
5. Why should components start with a capital letter? 
Answer: 
React treats lowercase names as HTML elements. Capitalized names are recognized as 
custom
 
React
 
components.`
            },
            {
              id: 'react-unit-4-15',
              title: 'Practical Lab (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a Header Component . 
--- PAGE 45 ---
Task 2 
Create a Footer Component . 
Task 3 
Import both into App.jsx . 
Task 4 
Create a reusable StudentCard Component . 
Task 5 
Display the StudentCard component three times.`
            },
          ]
        },
        {
          moduleId: 'react-mod-5',
          lessons: [
            {
              id: 'react-unit-5-1',
              title: '5.1 Introduction to Props',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `In React, applications are divided into multiple components. These components often need 
to
 
exchange
 
information
 
with
 
each
 
other.
 
Props (Properties) are used to pass data from one component to another. 
Props make components dynamic and reusable. Instead of hardcoding values inside a 
component,
 
we
 
can
 
pass
 
different
 
values
 
whenever
 
the
 
component
 
is
 
used.
 
 
--- PAGE 46 ---
Definition 
Props are read-only inputs passed from a parent component to a child component. They 
allow
 
components
 
to
 
receive
 
dynamic
 
data
 
and
 
render
 
different
 
outputs
 
based
 
on
 
the
 
values
 
received.
 
 
Real-Time Example 
Consider an E-Commerce website. 
Instead of creating separate Product Cards for each product: 
● Laptop ● Mobile ● Headphones 
We create one ProductCard component and pass different product details using Props. 
App Component │ ├───────────────┐ │ │ ▼ ▼ ProductCard ProductCard (Name: Laptop) (Name: Mobile) 
This avoids code duplication and improves maintainability.`
            },
            {
              id: 'react-unit-5-2',
              title: '5.2 Why Do We Need Props?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Without Props: 
● Duplicate code ● Hardcoded values ● Poor reusability ● Difficult maintenance 
With Props: 
● Dynamic UI ● Reusable Components ● Better code organization ● Easier maintenance 
--- PAGE 47 ---`
            },
            {
              id: 'react-unit-5-3',
              title: '5.3 Creating Props',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Parent Component import Student from "./Student"; function App() { return ( <div> <Student name="Prasanna"/> </div> ); } export default App; 
Child Component function Student(props){ return( <h2> Welcome {props.name} </h2> ); } export default Student; 
Output Welcome Prasanna 
--- PAGE 48 ---`
            },
            {
              id: 'react-unit-5-4',
              title: '5.4 Passing Multiple Props',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `React allows multiple values to be passed. 
Parent Component <Student name="Prasanna" branch="CSE" college="ABC Engineering College" /> 
Child Component function Student(props){ return( <div> <h2>{props.name}</h2> <p>{props.branch}</p> <p>{props.college}</p> </div> ); } 
Output Prasanna CSE ABC Engineering College 
--- PAGE 49 ---`
            },
            {
              id: 'react-unit-5-5',
              title: '5.5 Props Destructuring',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Instead of writing: 
props.name props.branch props.college 
We can destructure Props. 
function Student({ name, branch, college }){ return( <div> <h2>{name}</h2> <p>{branch}</p> <p>{college}</p> </div> ); } 
Advantages: 
● Cleaner code ● Better readability ● Less repetition 
 
--- PAGE 50 ---`
            },
            {
              id: 'react-unit-5-6',
              title: '5.6 Passing Different Data Types',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Props are not limited to strings. 
They can store: 
String name="Prasanna" 
Number age={21} 
Boolean isPlaced={true} 
Array subjects={["React","Node","Java"]} 
Object student={{ name:"Prasanna", branch:"CSE" }} 
Function onClick={handleClick}`
            },
            {
              id: 'react-unit-5-7',
              title: '5.7 Default Props',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Sometimes a parent component may not pass a value. 
Default Props provide a fallback value. 
function Student({ 
--- PAGE 51 ---
 name="Guest" }){ return( <h2> {name} </h2> ); } 
Output 
Guest`
            },
            {
              id: 'react-unit-5-8',
              title: '5.8 Read-Only Nature of Props',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Props are immutable . 
A child component should never modify Props received from the parent. 
Wrong Example 
props.name="Rahul"; 
This is not allowed. 
If data needs to change, use State , not Props.`
            },
            {
              id: 'react-unit-5-9',
              title: '5.9 One-Way Data Flow',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `React follows One-Way Data Binding . 
Data always flows: 
Parent Component 
--- PAGE 52 ---
↓ Child Component 
Child components receive data but should not directly modify it. 
This architecture improves predictability and debugging.`
            },
            {
              id: 'react-unit-5-10',
              title: '5.10 Props vs State',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Props State 
Passed from Parent Managed inside Component 
Read-only Can be updated 
Used for communication Used for dynamic data 
Immutable Mutable`
            },
            {
              id: 'react-unit-5-11',
              title: '5.11 Real-Time Example',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `Suppose a company builds a Student Management System. 
Instead of creating separate student pages: 
Student 1 Student 2 Student 3 Student 4 
React creates one reusable Student component. 
<Student name="Rahul" branch="ECE" /> 
--- PAGE 53 ---
 <Student name="Prasanna" branch="CSE" /> <Student name="Anitha" branch="IT" /> 
Each component displays different information while using the same code.`
            },
            {
              id: 'react-unit-5-12',
              title: '5.12 Best Practices',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `● Keep Props read-only. ● Use meaningful Prop names. ● Use Props Destructuring. ● Keep components reusable. ● Validate Props when necessary. ● Avoid passing unnecessary Props.`
            },
            {
              id: 'react-unit-5-13',
              title: '5.13 Common Mistakes',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Modifying Props directly. 
❌ Passing too many Props. 
❌ Using unclear Prop names. 
❌ Confusing Props with State. 
❌ Hardcoding values instead of using Props. 
 
--- PAGE 54 ---`
            },
            {
              id: 'react-unit-5-14',
              title: '5.14 Interview Questions',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `1. What are Props? 
Answer: 
Props are read-only inputs used to pass data from a parent component to a child 
component.
 
 
2. Why are Props used? 
Answer: 
Props allow components to receive dynamic data, making them reusable and maintainable. 
 
3. Can Props be modified? 
Answer: 
No. Props are immutable. To manage changing data, React uses State. 
 
4. What is Props Destructuring? 
Answer: 
Props Destructuring is a JavaScript feature that extracts individual Prop values directly from 
the
 
Props
 
object,
 
making
 
code
 
cleaner
 
and
 
more
 
readable.
 
 
5. What is the difference between Props and State? 
Answer: 
Props are passed from parent to child and cannot be modified, whereas State is managed 
within
 
a
 
component
 
and
 
can
 
change
 
over
 
time.`
            },
            {
              id: 'react-unit-5-15',
              title: 'Practical Lab (Interview Questions)',
              order: 15,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Interview Questions

--- PAGE 55 ---
Task 1 
Create an Employee component. 
Pass: 
● Name ● Department ● Salary 
using Props. 
 
Task 2 
Create a Product Card component using Props. 
 
Task 3 
Pass an array of skills to a component and display them. 
 
Task 4 
Use Props Destructuring in a Student component. 
 
Task 5 
Create three reusable Course Cards by passing different Prop values.`
            },
          ]
        },
        {
          moduleId: 'react-mod-6',
          lessons: [
            {
              id: 'react-unit-6-1',
              title: '6.1 Introduction to State',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern web applications are dynamic. Data changes continuously based on user 
interactions.
 
Examples: 
● Login Status ● Shopping Cart ● Counter ● Search Results ● Theme (Dark/Light Mode) ● User Profile 
To manage such changing data, React provides State . 
State allows components to remember information and update the UI whenever the data 
changes.
 
 
Definition 
State is a built-in React object that stores dynamic data within a component. Whenever the 
State
 
changes,
 
React
 
automatically
 
re-renders
 
the
 
component
 
to
 
display
 
the
 
updated
 
information.
 
 
Real-Time Example 
Consider an Online Shopping Website . 
Initially: 
Cart Items: 0 
After adding one product: 
--- PAGE 57 ---
Cart Items: 1 
After adding another product: 
Cart Items: 2 
The cart value changes dynamically. This changing value is managed using State .`
            },
            {
              id: 'react-unit-6-2',
              title: '6.2 Why Do We Need State?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Without State: 
● Data cannot change dynamically. ● UI remains static. ● User interactions cannot update the screen. 
With State: 
● Dynamic user interfaces ● Automatic UI updates ● Better user experience ● Easier data management`
            },
            {
              id: 'react-unit-6-3',
              title: '6.3 What is the useState Hook?',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `In modern React, Functional Components use Hooks . 
The most commonly used Hook is useState . 
Syntax: 
import { useState } from "react"; 
Creating State: 
const [count, setCount] = useState(0); 
Understanding the Syntax const [count, setCount] = useState(0); 
Here: 
--- PAGE 58 ---
● count → Current State value ● setCount → Function used to update the State ● 0 → Initial value`
            },
            {
              id: 'react-unit-6-4',
              title: '6.4 Creating a Counter',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
import { useState } from "react"; function Counter() { const [count, setCount] = useState(0); return ( <div> <h2>{count}</h2> <button onClick={() => setCount(count + 1)}> Increment </button> </div> ); } export default Counter; 
Output 
Initially: 
0 
After clicking: 
1 
After clicking again: 
--- PAGE 59 ---
2`
            },
            {
              id: 'react-unit-6-5',
              title: '6.5 Updating State',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `State should never be modified directly. 
❌ Wrong 
count = count + 1; 
✅ Correct 
setCount(count + 1); 
React updates the UI only when the setter function is used.`
            },
            {
              id: 'react-unit-6-6',
              title: '6.6 Multiple State Variables',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `A component can contain multiple State variables. 
const [name, setName] = useState("Prasanna"); const [age, setAge] = useState(21); const [city, setCity] = useState("Hyderabad"); 
Each State variable stores independent data.`
            },
            {
              id: 'react-unit-6-7',
              title: '6.7 State with Objects',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `State can store objects. 
Example: 
const [student, setStudent] = useState({ name: "Prasanna", branch: "CSE" 
--- PAGE 60 ---
}); 
Updating Object State: 
setStudent({ ...student, branch: "AI & DS" }); 
The spread operator (...) preserves existing values while updating only the specified 
property.`
            },
            {
              id: 'react-unit-6-8',
              title: '6.8 State with Arrays',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `State can also store arrays. 
const [subjects, setSubjects] = useState([ "React", "Node", "MongoDB" ]); 
Adding a new subject: 
setSubjects([ ...subjects, "Express" ]);`
            },
            {
              id: 'react-unit-6-9',
              title: '6.9 React Re-rendering',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Whenever State changes: 
--- PAGE 61 ---
User Click ↓ State Changes ↓ React Re-renders Component ↓ Updated UI 
React compares the previous Virtual DOM with the updated Virtual DOM and updates only 
the
 
necessary
 
parts
 
of
 
the
 
Real
 
DOM.`
            },
            {
              id: 'react-unit-6-10',
              title: '6.10 State vs Props',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `State Props 
Stores dynamic data Receives data from Parent 
Can be modified Read-only 
Managed inside Component 
Passed by Parent 
Uses useState Passed as attributes`
            },
            {
              id: 'react-unit-6-11',
              title: '6.11 Best Practices',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `● Keep State minimal. ● Avoid duplicate State. ● Never modify State directly. ● Use descriptive State names. ● Split unrelated data into separate State variables. ● Use functional updates when the next State depends on the previous State. 
 
--- PAGE 62 ---`
            },
            {
              id: 'react-unit-6-12',
              title: '6.12 Common Mistakes',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Modifying State directly. 
❌ Creating unnecessary State variables. 
❌ Storing derived values in State. 
❌ Forgetting to use the setter function. 
❌ Mutating arrays or objects instead of creating new copies. 
 
Real-Time Scenario 
A company develops an Online Examination System . 
Features: 
● Start Exam ● Next Question ● Previous Question ● Timer ● Score Counter 
Each of these values changes while the student uses the application. 
React State manages: 
● Current Question ● Timer ● Marks ● Selected Answer ● Remaining Time 
Whenever any value changes, React updates only the affected part of the interface.`
            },
            {
              id: 'react-unit-6-13',
              title: 'Interview Questions (Common Mistakes)',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is State in React? 
Answer: 
--- PAGE 63 ---
State is a built-in React object used to store dynamic data within a component. Updating 
State
 
automatically
 
re-renders
 
the
 
component.
 
 
2. What is the useState Hook? 
Answer: 
useState is a React Hook used in Functional Components to create and manage State. 
 
3. Why should State not be modified directly? 
Answer: 
React detects changes through the setter function. Direct modification does not trigger a 
re-render
 
and
 
can
 
lead
 
to
 
inconsistent
 
UI.
 
 
4. What is the difference between Props and State? 
Answer: 
Props are read-only values passed from a parent component, while State is managed within 
the
 
component
 
and
 
can
 
change
 
over
 
time.
 
 
5. What happens when State changes? 
Answer: 
React re-renders the component, compares the Virtual DOM with the previous version, and 
updates
 
only
 
the
 
changed
 
elements
 
in
 
the
 
Real
 
DOM.`
            },
            {
              id: 'react-unit-6-14',
              title: 'Practical Lab (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a Counter application using useState. 
 
--- PAGE 64 ---
Task 2 
Create a Like button that increments the number of likes. 
 
Task 3 
Create a Student component that stores Name and Branch using an object in State. 
 
Task 4 
Create an array of skills using State and add a new skill when a button is clicked. 
 
Task 5 
Create a Light/Dark Theme toggle using useState.`
            },
          ]
        },
        {
          moduleId: 'react-mod-7',
          lessons: [
            {
              id: 'react-unit-7-1',
              title: '7.1 Introduction to React Events',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern web applications are interactive. Every user action, such as clicking a button, typing 
in
 
an
 
input
 
field,
 
or
 
submitting
 
a
 
form,
 
generates
 
an
 
Event
.
 
React provides an event handling system that allows developers to respond to these user 
interactions
 
efficiently.
 
--- PAGE 65 ---
Unlike traditional JavaScript, React uses Synthetic Events , which provide a consistent 
interface
 
across
 
all
 
browsers.
 
 
Definition 
An Event is an action triggered by the user or browser, such as a mouse click, keyboard 
input,
 
or
 
form
 
submission.
 
 
Real-Time Example 
Consider an Online Banking Application. 
User actions include: 
● Clicking the Login button ● Entering Account Number ● Typing Password ● Submitting the Login Form 
Each action generates an event that React handles.`
            },
            {
              id: 'react-unit-7-2',
              title: '7.2 React Event System',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `React wraps native browser events inside SyntheticEvent . 
Advantages: 
● Cross-browser compatibility ● Better performance ● Same API across all browsers ● Easier event management`
            },
            {
              id: 'react-unit-7-3',
              title: '7.3 Handling Events',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
function App() { 
--- PAGE 66 ---
 function handleClick() { alert("Button Clicked"); } return ( <button onClick={handleClick}> Click Me </button> ); } export default App; 
Output: 
When the button is clicked, an alert box appears.`
            },
            {
              id: 'react-unit-7-4',
              title: '7.4 Common React Events',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Event Description 
onClick Mouse Click 
onDoubleClick Double Click 
onChange Input Change 
onSubmit Form Submission 
onKeyDown Key Press 
onKeyUp Key Release 
onMouseEnter Mouse Hover 
onMouseLeave 
Mouse Leaves 
onFocus Input Focus 
onBlur Input Loses Focus 
--- PAGE 67 ---`
            },
            {
              id: 'react-unit-7-5',
              title: '7.5 Passing Parameters to Events',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
function App() { function greet(name) { alert("Welcome " + name); } return ( <button onClick={() => greet("Prasanna")} > Click </button> ); } 
Output: 
Welcome Prasanna`
            },
            {
              id: 'react-unit-7-6',
              title: '7.6 Event Object',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `React automatically passes an event object. 
Example: 
function App() { function handleClick(event) { console.log(event); } return ( 
--- PAGE 68 ---
 <button onClick={handleClick}> Click </button> ); } 
The event object contains information such as: 
● Event type ● Target element ● Mouse position ● Keyboard key`
            },
            {
              id: 'react-unit-7-7',
              title: '7.7 Introduction to React Forms',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Forms are used to collect user information. 
Examples: 
● Login Form ● Registration Form ● Contact Form ● Feedback Form 
React provides complete control over form data using State .`
            },
            {
              id: 'react-unit-7-8',
              title: '7.8 Controlled Components',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `A Controlled Component is a form element whose value is controlled by React State. 
Example: 
import { useState } from "react"; function Login() { const [name, setName] = useState(""); return ( 
--- PAGE 69 ---
 <input type="text" value={name} onChange={(e) => setName(e.target.value)} /> ); } 
Advantages: 
● Easy validation ● Real-time updates ● Predictable behavior ● Better control`
            },
            {
              id: 'react-unit-7-9',
              title: '7.9 Uncontrolled Components',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `An Uncontrolled Component stores its own data inside the DOM instead of React State. 
Example: 
import { useRef } from "react"; function Login() { const inputRef = useRef(); return ( <input type="text" ref={inputRef} /> ); 
--- PAGE 70 ---
 } 
Generally, Controlled Components are recommended for most applications.`
            },
            {
              id: 'react-unit-7-10',
              title: '7.10 Form Submission',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
import { useState } from "react"; function Login() { const [name, setName] = useState(""); function handleSubmit(e) { e.preventDefault(); alert(name); } return ( <form onSubmit={handleSubmit}> <input value={name} onChange={(e)=>setName(e.target.value)} /> <button> Submit </button> </form> ); 
--- PAGE 71 ---
}`
            },
            {
              id: 'react-unit-7-11',
              title: '7.11 Form Validation',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `Validation ensures that users enter correct information. 
Example: 
if(name===""){ alert("Name Required"); } 
Common validations: 
● Required fields ● Email format ● Password length ● Phone number format`
            },
            {
              id: 'react-unit-7-12',
              title: '7.12 Controlled vs Uncontrolled',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `Components
 
Controlled Uncontrolled 
Uses State Uses DOM 
Easy Validation Less Validation 
Recommended Used in special cases 
Predictable Less Predictable`
            },
            {
              id: 'react-unit-7-13',
              title: '7.13 Best Practices',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `● Use Controlled Components. ● Prevent unnecessary page reloads using preventDefault(). 
--- PAGE 72 ---
● Validate user input. ● Keep forms simple. ● Display meaningful error messages. ● Avoid unnecessary re-renders.`
            },
            {
              id: 'react-unit-7-14',
              title: '7.14 Common Mistakes',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Forgetting preventDefault(). 
❌ Not updating State using onChange. 
❌ Storing sensitive information insecurely. 
❌ Using uncontrolled inputs without necessity. 
❌ Performing validation only after submission. 
 
Real-Time Scenario 
A company develops an Online Job Portal . 
The Registration Form includes: 
● Name ● Email ● Password ● Phone Number 
As the user types, React updates the State. 
When the user clicks Register : 
● Input is validated. ● Invalid fields display error messages. ● Valid data is sent to the server. 
This provides a smooth user experience.`
            },
            {
              id: 'react-unit-7-15',
              title: 'Interview Questions (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

--- PAGE 73 ---
1. What is Event Handling in React? 
Answer: 
Event Handling is the process of responding to user actions such as clicks, typing, and form 
submissions
 
using
 
React's
 
event
 
system.
 
 
2. What is a Synthetic Event? 
Answer: 
A Synthetic Event is React's wrapper around the native browser event, providing consistent 
behavior
 
across
 
different
 
browsers.
 
 
3. What is the difference between Controlled and Uncontrolled 
Components?
 
Answer: 
Controlled Components use React State to manage form data, while Uncontrolled 
Components
 
rely
 
on
 
the
 
DOM
 
using
 
references
 
(useRef). 
 
4. Why is preventDefault() used? 
Answer: 
It prevents the browser's default form submission behavior, allowing React to control the 
submission
 
process.
 
 
5. Which approach is recommended for React Forms? 
Answer: 
Controlled Components are recommended because they provide better control, validation, 
and
 
predictable
 
behavior.`
            },
            {
              id: 'react-unit-7-16',
              title: 'Practical Lab (Common Mistakes)',
              order: 16,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

--- PAGE 74 ---
Task 1 
Create a Login Form with Name and Password fields. 
 
Task 2 
Display the entered Name below the input field. 
 
Task 3 
Validate that the Name field is not empty. 
 
Task 4 
Create a Feedback Form using Controlled Components. 
 
Task 5 
Implement a Registration Form with: 
● Name ● Email ● Password ● Phone Number 
Validate all fields before submission.`
            },
          ]
        },
        {
          moduleId: 'react-mod-8',
          lessons: [
            {
              id: 'react-unit-8-1',
              title: '8.1 Introduction',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern applications display large amounts of dynamic data. 
Examples: 
● Product Lists ● Student Records ● Employee Details ● News Articles ● Notifications ● Comments 
Instead of writing HTML repeatedly, React generates these UI elements dynamically using 
List
 
Rendering
.
 
Similarly, applications often display different content depending on conditions. 
Example: 
● Logged In → Show Dashboard ● Logged Out → Show Login Page 
This is achieved using Conditional Rendering .`
            },
            {
              id: 'react-unit-8-2',
              title: '8.2 What is List Rendering?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `List Rendering is the process of displaying multiple elements from an array or collection of 
data.
 
Instead of manually creating every item, React automatically generates components from 
data.
 
 
Real-Time Example 
--- PAGE 76 ---
Consider an E-Commerce website. 
Database contains: 
Laptop Mobile Keyboard Mouse Headphones 
React creates Product Cards automatically. 
Products │ ├── Laptop ├── Mobile ├── Keyboard ├── Mouse └── Headphones`
            },
            {
              id: 'react-unit-8-3',
              title: '8.3 JavaScript map() Method',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `React commonly uses the JavaScript map() method to render lists. 
Example: 
const fruits = [ "Apple", "Orange", "Mango" ]; 
--- PAGE 77 ---
function App(){ return( <div> { fruits.map( (fruit)=> ( <h2> {fruit} </h2> ) ) } </div> ); } 
Output Apple Orange Mango`
            },
            {
              id: 'react-unit-8-4',
              title: '8.4 Rendering Objects',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Most real-world applications receive data as objects. 
Example: 
const students = [ 
--- PAGE 78 ---
 { id:1, name:"Prasanna", branch:"CSE" }, { id:2, name:"Rahul", branch:"ECE" } ]; 
Rendering: 
{ students.map( (student)=>( <div> <h3> {student.name} </h3> <p> {student.branch} </p> </div> ) 
--- PAGE 79 ---
 ) }`
            },
            {
              id: 'react-unit-8-5',
              title: '8.5 Understanding Keys',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `When rendering lists, React requires a Key . 
A Key uniquely identifies each element. 
Example: 
students.map( (student)=>( <div key={student.id} > <h2> {student.name} </h2> </div> ) ) 
Why Keys are Important? 
React uses Keys to: 
● Identify elements. ● Improve rendering performance. ● Update only changed items. ● Avoid unnecessary re-rendering. 
 
--- PAGE 80 ---
Characteristics of a Good Key 
A Key should be: 
● Unique ● Stable ● Predictable 
Best Example: 
key={student.id} 
Avoid: 
key={index} 
unless no unique ID is available.`
            },
            {
              id: 'react-unit-8-6',
              title: '8.6 Conditional Rendering',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Conditional Rendering means displaying different UI based on conditions. 
Example: 
const isLoggedIn = true; 
If true: 
Display Dashboard. 
Otherwise: 
Display Login Page.`
            },
            {
              id: 'react-unit-8-7',
              title: '8.7 Using if Statement',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
function App(){ const isLoggedIn=true; if(isLoggedIn){ 
--- PAGE 81 ---
 return( <h2> Welcome User </h2> ); } return( <h2> Login First </h2> ); }`
            },
            {
              id: 'react-unit-8-8',
              title: '8.8 Using Ternary Operator',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
const isLoggedIn=true; return( <h2> { isLoggedIn ? "Dashboard" : 
--- PAGE 82 ---
"Login" } </h2> ); 
Output 
Dashboard`
            },
            {
              id: 'react-unit-8-9',
              title: '8.9 Using Logical AND (&&)',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Useful when displaying content only if a condition is true. 
Example: 
const isAdmin=true; return( <div> { isAdmin && <h2> Admin Panel </h2> } </div> ); 
Output 
Admin Panel 
--- PAGE 83 ---`
            },
            {
              id: 'react-unit-8-10',
              title: '8.10 Rendering Components',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Conditionally
 
{ isLoggedIn ? <Dashboard/> : <Login/> } 
This technique is commonly used in: 
● Authentication ● Role-Based Access ● Dashboards`
            },
            {
              id: 'react-unit-8-11',
              title: '8.11 Empty List Handling',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `Sometimes APIs return no data. 
Example: 
const products=[]; 
Display: 
{ products.length===0 ? "No Products Found" : products.map(...) 
--- PAGE 84 ---
 }`
            },
            {
              id: 'react-unit-8-12',
              title: '8.12 Best Practices',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `● Always use unique Keys. ● Avoid using array indexes as Keys. ● Keep rendering logic simple. ● Use reusable components. ● Handle empty lists gracefully. ● Avoid deeply nested conditions.`
            },
            {
              id: 'react-unit-8-13',
              title: '8.13 Common Mistakes',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Forgetting Keys. 
❌ Using duplicate Keys. 
❌ Writing complex nested ternary operators. 
❌ Rendering large lists without optimization. 
❌ Ignoring empty data conditions. 
 
Real-Time Scenario 
A company develops an Online Food Delivery Application . 
Restaurant data is fetched from an API. 
Restaurants │ ├── KFC ├── Domino's ├── Pizza Hut 
--- PAGE 85 ---
 ├── Subway └── Burger King 
React uses map() to generate Restaurant Cards. 
If the API returns no restaurants: 
No Restaurants Available 
If the user logs in: 
Display: 
Welcome User 
Otherwise: 
Display: 
Please Login`
            },
            {
              id: 'react-unit-8-14',
              title: 'Interview Questions (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is List Rendering? 
Answer: 
List Rendering is the process of displaying multiple UI elements dynamically from an array of 
data.
 
 
2. Which JavaScript method is commonly used for List Rendering? 
Answer: 
The map() method. 
 
3. Why are Keys required in React? 
Answer: 
--- PAGE 86 ---
Keys uniquely identify list items, helping React efficiently update only the changed elements 
during
 
re-rendering.
 
 
4. What is Conditional Rendering? 
Answer: 
Conditional Rendering is the technique of displaying different UI elements based on 
conditions.
 
 
5. Name three methods used for Conditional Rendering. 
Answer: 
● if Statement ● Ternary Operator (? :) ● Logical AND (&&)`
            },
            {
              id: 'react-unit-8-15',
              title: 'Practical Lab (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create an array of five student names and display them using map(). 
 
Task 2 
Display employee details from an array of objects. 
 
Task 3 
Create a Login component that shows: 
● Dashboard when logged in. ● Login Page when logged out. 
 
--- PAGE 87 ---
Task 4 
Display "No Products Available" if the products array is empty. 
 
Task 5 
Create a Student Card component and render it dynamically using map().`
            },
          ]
        },
        {
          moduleId: 'react-mod-9',
          lessons: [
            {
              id: 'react-unit-9-1',
              title: '9.1 Introduction to React Hooks',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Before React 16.8, developers primarily used Class Components to manage state and 
lifecycle
 
methods.
 
Functional
 
Components
 
were
 
limited
 
because
 
they
 
could
 
not
 
manage
 
state
 
or
 
lifecycle
 
operations.
 
To solve this limitation, React introduced Hooks in version 16.8 . 
Hooks allow Functional Components to use React features such as: 
● State Management ● Lifecycle Management ● DOM References ● Performance Optimization ● Context Management 
As a result, Functional Components became the standard approach for React development. 
 
--- PAGE 88 ---
Definition 
A Hook is a special React function that allows Functional Components to use React features 
such
 
as
 
State,
 
Lifecycle
 
methods,
 
Context,
 
and
 
references
 
without
 
writing
 
Class
 
Components.
 
 
Why Hooks? 
Without Hooks: 
● Developers relied heavily on Class Components. ● Lifecycle methods were complex. ● Code reuse was difficult. ● Logic became scattered across lifecycle methods. 
With Hooks: 
● Simpler code. ● Better readability. ● Easier code reuse. ● Improved maintainability. ● Better performance optimization.`
            },
            {
              id: 'react-unit-9-2',
              title: '9.2 Rules of Hooks',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `React Hooks must follow specific rules. 
Rule 1 
Always call Hooks at the top level of a component. 
Correct: 
function App() { const [count, setCount] = useState(0); } 
Wrong: 
if(true){ 
--- PAGE 89 ---
useState(0); } 
Rule 2 
Hooks should only be called inside: 
● Functional Components ● Custom Hooks 
Not inside: 
● Loops ● Conditions ● Nested functions`
            },
            {
              id: 'react-unit-9-3',
              title: '9.3 useEffect Hook',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `useEffect() is used to perform side effects in React. 
Examples: 
● Fetch API data ● Update document title ● Start timers ● Access browser APIs ● Subscribe to events 
 
Syntax useEffect(() => { console.log("Component Loaded"); }, []); 
The empty dependency array ([]) means the effect runs only once after the component is 
mounted.
 
 
Example 
--- PAGE 90 ---
import { useEffect } from "react"; function App() { useEffect(() => { document.title = "React Hooks"; }, []); return <h2>Welcome</h2>; } 
Dependency Array 
Dependency 
Execution 
[] Runs once after mounting 
[count] Runs when count changes 
Omitted Runs after every render`
            },
            {
              id: 'react-unit-9-4',
              title: '9.4 useRef Hook',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `useRef() provides a way to access DOM elements directly or store mutable values that do 
not
 
trigger
 
re-renders.
 
Example: 
import { useRef } from "react"; function App() { const inputRef = useRef(); function focusInput() { inputRef.current.focus(); } 
--- PAGE 91 ---
 return ( <> <input ref={inputRef} /> <button onClick={focusInput}> Focus </button> </> ); } 
Applications 
● Focusing input fields. ● Accessing DOM elements. ● Storing previous values. ● Managing timers.`
            },
            {
              id: 'react-unit-9-5',
              title: '9.5 useMemo Hook',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Large applications often perform expensive calculations. 
useMemo() stores (memoizes) the calculated result and recalculates it only when 
dependencies
 
change.
 
Example: 
const total = useMemo(() => { return price * quantity; }, [price, quantity]); 
Advantages 
--- PAGE 92 ---
● Improves performance. ● Avoids unnecessary calculations. ● Optimizes rendering.`
            },
            {
              id: 'react-unit-9-6',
              title: '9.6 useCallback Hook',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Functions are recreated every time a component re-renders. 
useCallback() memoizes a function, preventing unnecessary recreation. 
Example: 
const handleClick = useCallback(() => { console.log("Clicked"); }, []); 
Why useCallback? 
Useful when: 
● Passing functions to child components. ● Optimizing rendering. ● Preventing unnecessary re-renders.`
            },
            {
              id: 'react-unit-9-7',
              title: '9.7 Custom Hooks',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `React allows developers to create their own reusable Hooks. 
Example: 
import { useState } from "react"; function useCounter() { const [count, setCount] = useState(0); const increment = () => setCount(count + 1); 
--- PAGE 93 ---
return { count, increment }; } 
Using the Hook: 
const { count, increment } = useCounter(); 
Benefits 
● Reusable logic. ● Cleaner components. ● Better maintainability. ● Less code duplication.`
            },
            {
              id: 'react-unit-9-8',
              title: '9.8 React Hook Flow',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Component Render │ ▼ React Hook │ ▼ State / Effect / Ref │ ▼ UI Updated`
            },
            {
              id: 'react-unit-9-9',
              title: '9.9 Performance Optimization',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Large applications may re-render frequently. 
React provides Hooks for optimization: 
● useMemo → Memoizes values. 
--- PAGE 94 ---
● useCallback → Memoizes functions. ● useRef → Stores mutable values without re-rendering. 
These Hooks improve application performance.`
            },
            {
              id: 'react-unit-9-10',
              title: '9.10 Best Practices',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `● Use Hooks only when required. ● Keep dependency arrays accurate. ● Create Custom Hooks for reusable logic. ● Avoid unnecessary useMemo and useCallback. ● Keep components small and focused.`
            },
            {
              id: 'react-unit-9-11',
              title: '9.11 Common Mistakes',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Calling Hooks inside loops. 
❌ Calling Hooks inside conditions. 
❌ Forgetting dependency arrays. 
❌ Overusing useMemo. 
❌ Misusing useRef for state management. 
 
Real-Time Scenario 
A company develops an Online Banking Dashboard . 
Features: 
● Fetch account details using useEffect. ● Focus the search box using useRef. ● Calculate total balance using useMemo. ● Optimize button handlers using useCallback. ● Reuse authentication logic through a Custom Hook. 
By using Hooks, the application becomes more modular, efficient, and easier to maintain. 
--- PAGE 95 ---`
            },
            {
              id: 'react-unit-9-12',
              title: 'Interview Questions (Common Mistakes)',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What are React Hooks? 
Answer: 
Hooks are special React functions that allow Functional Components to use React features 
such
 
as
 
State,
 
Lifecycle
 
methods,
 
and
 
Context
 
without
 
writing
 
Class
 
Components.
 
 
2. Why were Hooks introduced? 
Answer: 
Hooks simplify component logic, promote code reuse, and eliminate the need for Class 
Components
 
in
 
most
 
cases.
 
 
3. What is the purpose of useEffect()? 
Answer: 
useEffect() is used to perform side effects such as API calls, subscriptions, timers, and 
DOM
 
updates.
 
 
4. What is the difference between useMemo() and useCallback()? 
Answer: 
● useMemo() memoizes a computed value . ● useCallback() memoizes a function . 
 
5. What is a Custom Hook? 
Answer: 
A Custom Hook is a reusable JavaScript function that starts with use and contains React 
Hook
 
logic,
 
allowing
 
the
 
same
 
functionality
 
to
 
be
 
shared
 
across
 
multiple
 
components.
 
--- PAGE 96 ---`
            },
            {
              id: 'react-unit-9-13',
              title: 'Practical Lab (Common Mistakes)',
              order: 13,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a Counter using useState. 
 
Task 2 
Use useEffect() to change the page title whenever the counter changes. 
 
Task 3 
Create an input field and focus it using useRef(). 
 
Task 4 
Calculate the total price of products using useMemo(). 
 
Task 5 
Create a reusable Custom Hook named useCounter.`
            },
          ]
        },
        {
          moduleId: 'react-mod-10',
          lessons: [
            {
              id: 'react-unit-10-1',
              title: '10.1 Introduction to Routing',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern web applications contain multiple pages such as: 
● Home ● About ● Contact ● Login ● Dashboard ● Profile 
In traditional websites, navigating between pages reloads the entire page. 
React applications work differently. 
Since React is a Single Page Application (SPA) , it updates only the required content 
instead
 
of
 
reloading
 
the
 
complete
 
page.
 
This is achieved using React Router . 
 
Definition 
React Router is a standard routing library for React that enables navigation between 
different
 
components
 
without
 
refreshing
 
the
 
browser.
 
 
Real-Time Example 
Consider an E-Commerce Website . 
It contains: 
● Home Page ● Products Page ● Cart Page ● Login Page ● Profile Page 
--- PAGE 98 ---
Instead of loading separate HTML pages, React Router loads different components. 
Browser │ ▼ React Router │ ├── Home ├── Products ├── Cart ├── Profile └── Login`
            },
            {
              id: 'react-unit-10-2',
              title: '10.2 Why React Router?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Without React Router: 
● Entire page reloads ● Slow navigation ● Poor user experience 
With React Router: 
● Fast navigation ● No page refresh ● Better performance ● Smooth user experience`
            },
            {
              id: 'react-unit-10-3',
              title: '10.3 Installing React Router',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Install React Router using npm. 
npm install react-router-dom 
--- PAGE 99 ---
Verify installation: 
npm list react-router-dom`
            },
            {
              id: 'react-unit-10-4',
              title: '10.4 Basic Routing',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Wrap the application using BrowserRouter . 
Example: 
import { BrowserRouter } from "react-router-dom"; import App from "./App"; root.render( <BrowserRouter> <App /> </BrowserRouter> );`
            },
            {
              id: 'react-unit-10-5',
              title: '10.5 Creating Routes',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
import { Routes, Route } from "react-router-dom"; import Home from "./Home"; import About from "./About"; function App(){ return( 
--- PAGE 100 ---
 <Routes> <Route path="/" element={<Home/>} /> <Route path="/about" element={<About/>} /> </Routes> ); }`
            },
            {
              id: 'react-unit-10-6',
              title: '10.6 Navigation using Link',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Instead of HTML <a> tags, React Router uses Link . 
Example: 
import { Link } from "react-router-dom"; <Link to="/"> Home </Link> <Link to="/about"> About 
--- PAGE 101 ---
</Link> 
Advantages: 
● No page refresh ● Faster navigation ● Better performance`
            },
            {
              id: 'react-unit-10-7',
              title: '10.7 Navigation using useNavigate',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `React Router provides the useNavigate Hook for programmatic navigation. 
Example: 
import { useNavigate } from "react-router-dom"; function Login(){ const navigate = useNavigate(); function handleLogin(){ navigate("/dashboard"); } }`
            },
            {
              id: 'react-unit-10-8',
              title: '10.8 Dynamic Routing',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Dynamic Routing allows URLs to contain parameters. 
Example: 
/student/101 /student/102 
--- PAGE 102 ---
 /student/103 
Route: 
<Route path="/student/:id" element={<Student/>} /> 
Access Parameter: 
import { useParams } from "react-router-dom"; const { id } = useParams();`
            },
            {
              id: 'react-unit-10-9',
              title: '10.9 Nested Routing',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Large applications contain nested pages. 
Example: 
Dashboard │ ├── Students ├── Faculty ├── Courses └── Reports 
Nested Routes: 
<Route 
--- PAGE 103 ---
 path="/dashboard" element={<Dashboard/>} > <Route path="students" element={<Students/>} /> <Route path="courses" element={<Courses/>} /> </Route>`
            },
            {
              id: 'react-unit-10-10',
              title: '10.10 Private Routing',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Some pages require authentication. 
Example: 
Login ↓ Dashboard ↓ Profile 
Unauthenticated users should not access Dashboard. 
Example: 
if(user){ 
--- PAGE 104 ---
 return <Dashboard/>; } return <Login/>;`
            },
            {
              id: 'react-unit-10-11',
              title: '10.11 Route Parameters vs Query',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `Parameters
 
Route Parameters 
Query Parameters 
/student/10 /student?id=10 
Uses useParams() 
Uses useSearchParams() 
Cleaner URLs Useful for filters/search`
            },
            {
              id: 'react-unit-10-12',
              title: '10.12 Best Practices',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `● Use BrowserRouter as the root router. ● Organize routes into separate files. ● Use Link instead of anchor tags. ● Protect sensitive routes. ● Use lazy loading for large applications. ● Keep route names meaningful.`
            },
            {
              id: 'react-unit-10-13',
              title: '10.13 Common Mistakes',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Using HTML <a> instead of <Link>. 
❌ Forgetting BrowserRouter. 
❌ Hardcoding URLs. 
❌ Not handling 404 pages. 
--- PAGE 105 ---
❌ Exposing protected routes without authentication. 
 
Real-Time Scenario 
A company develops an Online Learning Platform . 
Pages include: 
Home Courses Login Dashboard Profile Certificates 
React Router handles navigation. 
When a student clicks: 
Courses 
↓ 
React Router loads only the Courses component. 
The browser does not reload, providing a smooth user experience.`
            },
            {
              id: 'react-unit-10-14',
              title: 'Interview Questions (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is React Router? 
Answer: 
React Router is a routing library that enables navigation between different React 
components
 
without
 
refreshing
 
the
 
browser.
 
 
--- PAGE 106 ---
2. Why is BrowserRouter used? 
Answer: 
BrowserRouter enables client-side routing by managing the browser's history using the 
HTML5
 
History
 
API.
 
 
3. What is the difference between Link and <a>? 
Answer: 
● <Link> performs client-side navigation without refreshing the page. ● <a> reloads the entire page. 
 
4. What is Dynamic Routing? 
Answer: 
Dynamic Routing allows URL parameters such as /student/:id to display dynamic 
content
 
based
 
on
 
the
 
parameter
 
value.
 
 
5. What is useNavigate? 
Answer: 
useNavigate is a React Router Hook used to navigate programmatically from one route to 
another.`
            },
            {
              id: 'react-unit-10-15',
              title: 'Practical Lab (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Install React Router. 
 
Task 2 
Create: 
--- PAGE 107 ---
● Home Page ● About Page ● Contact Page 
 
Task 3 
Navigate using Link. 
 
Task 4 
Create a Student Details page using Dynamic Routing. 
 
Task 5 
Implement a Login page that redirects users to the Dashboard using useNavigate.`
            },
          ]
        },
        {
          moduleId: 'react-mod-11',
          lessons: [
            {
              id: 'react-unit-11-1',
              title: '11.1 Introduction to APIs',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Modern web applications rarely work with static data. Instead, they communicate with 
servers
 
to
 
fetch
 
or
 
update
 
information.
 
Examples: 
--- PAGE 108 ---
● E-commerce products ● Student records ● Weather information ● Banking transactions ● Social media posts 
This communication is done using APIs (Application Programming Interfaces). 
 
Definition 
An API (Application Programming Interface) is a set of rules that allows two software 
applications
 
to
 
communicate
 
and
 
exchange
 
data.
 
In React, APIs are commonly used to: 
● Fetch data from a server ● Send user information ● Update existing records ● Delete records 
 
Real-Time Example 
Consider an Online Shopping Application. 
User │ ▼ React Application │ ▼ REST API │ ▼ Database 
--- PAGE 109 ---
 │ ▼ Product Information 
When the user opens the Products page: 
● React sends a request. ● Server processes it. ● Database returns product details. ● React displays them.`
            },
            {
              id: 'react-unit-11-2',
              title: '11.2 Why API Integration?',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Without APIs: 
● Static applications ● Hardcoded data ● No real-time updates 
With APIs: 
● Dynamic content ● Real-time information ● Database connectivity ● Better user experience`
            },
            {
              id: 'react-unit-11-3',
              title: '11.3 HTTP Methods',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `React communicates with servers using HTTP methods. 
Method Purpose 
GET Retrieve data 
POST Create new data 
PUT Update existing data 
--- PAGE 110 ---
DELETE Remove data`
            },
            {
              id: 'react-unit-11-4',
              title: '11.4 Fetch API',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `The Fetch API is a built-in JavaScript feature used to make HTTP requests. 
Example: 
fetch("https://jsonplaceholder.typicode.com/users") .then(response => response.json()) .then(data => console.log(data)); 
Advantages: 
● Built into JavaScript ● No installation required ● Lightweight`
            },
            {
              id: 'react-unit-11-5',
              title: '11.5 Async and Await',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Instead of .then(), modern React applications use async/await . 
Example: 
async function getUsers(){ const response = await fetch( "https://jsonplaceholder.typicode.com/users" ); const data = await response.json(); console.log(data); } 
Advantages: 
--- PAGE 111 ---
● Cleaner code ● Better readability ● Easier error handling`
            },
            {
              id: 'react-unit-11-6',
              title: '11.6 Axios',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Axios is a popular third-party library used for API communication. 
Install Axios: 
npm install axios 
Example: 
import axios from "axios"; async function getUsers(){ const response = await axios.get( "https://jsonplaceholder.typicode.com/users" ); console.log(response.data); } 
Fetch API vs Axios 
Fetch API Axios 
Built into JavaScript External Library 
Manual JSON conversion 
Automatic JSON conversion 
More code Cleaner syntax 
Basic features Advanced features`
            },
            {
              id: 'react-unit-11-7',
              title: '11.7 Fetching Data using useEffect',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 112 ---
API requests are generally made inside useEffect(). 
Example: 
import { useEffect, useState } from "react"; function Users(){ const [users, setUsers] = useState([]); useEffect(()=>{ fetch( "https://jsonplaceholder.typicode.com/users" ) .then(response=>response.json()) .then(data=>setUsers(data)); },[]); } 
The empty dependency array ensures the API request runs only once when the component 
mounts.`
            },
            {
              id: 'react-unit-11-8',
              title: '11.8 Displaying API Data',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Example: 
{ users.map(user=>( 
--- PAGE 113 ---
<div key={user.id}> <h2>{user.name}</h2> <p>{user.email}</p> </div> )) }`
            },
            {
              id: 'react-unit-11-9',
              title: '11.9 Loading State',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Users should know when data is loading. 
Example: 
const [loading, setLoading] = useState(true); 
Before API completes: 
Loading... 
After completion: 
Display the data.`
            },
            {
              id: 'react-unit-11-10',
              title: '11.10 Error Handling',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `Network requests may fail. 
Example: 
try{ const response = await axios.get(url); } catch(error){ console.log(error); 
--- PAGE 114 ---
} 
Always display meaningful error messages instead of crashing the application.`
            },
            {
              id: 'react-unit-11-11',
              title: '11.11 CRUD Operations',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `React applications commonly perform CRUD operations. 
GET 
Retrieve data. 
POST 
Create new data. 
axios.post(url,data); 
PUT 
Update existing data. 
axios.put(url,data); 
DELETE 
Delete data. 
axios.delete(url);`
            },
            {
              id: 'react-unit-11-12',
              title: '11.12 API Architecture',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `React Component ↓ API Request ↓ Server 
--- PAGE 115 ---
 ↓ Database ↓ JSON Response ↓ React UI`
            },
            {
              id: 'react-unit-11-13',
              title: '11.13 Best Practices',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `● Keep API URLs in configuration files. ● Use Async/Await. ● Handle Loading and Error states. ● Validate API responses. ● Avoid duplicate API calls. ● Secure sensitive API keys. ● Use Axios Interceptors for large applications.`
            },
            {
              id: 'react-unit-11-14',
              title: '11.14 Common Mistakes',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Calling APIs on every render. 
❌ Ignoring error handling. 
❌ Not showing loading indicators. 
❌ Hardcoding API URLs. 
❌ Storing API keys inside source code. 
 
Real-Time Scenario 
A company develops a Hospital Management System . 
--- PAGE 116 ---
The application performs: 
● GET → Fetch patient records. ● POST → Register a new patient. ● PUT → Update patient details. ● DELETE → Remove patient information. 
React communicates with the backend API and updates the interface without reloading the 
page.`
            },
            {
              id: 'react-unit-11-15',
              title: 'Interview Questions (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is an API? 
Answer: 
An API is a communication interface that enables two software applications to exchange 
data.
 
 
2. Why is useEffect() used for API calls? 
Answer: 
Because it allows API requests to execute after the component is rendered, preventing 
unnecessary
 
repeated
 
requests.
 
 
3. What is the difference between Fetch API and Axios? 
Answer: 
Fetch is built into JavaScript and requires manual JSON parsing, while Axios is an external 
library
 
that
 
provides
 
automatic
 
JSON
 
parsing
 
and
 
additional
 
features
 
like
 
interceptors.
 
 
4. What are the four main HTTP methods? 
Answer: 
GET, POST, PUT, and DELETE. 
 
--- PAGE 117 ---
5. Why should Loading and Error states be implemented? 
Answer: 
They improve user experience by providing feedback during network requests and handling 
failures
 
gracefully.`
            },
            {
              id: 'react-unit-11-16',
              title: 'Practical Lab (Common Mistakes)',
              order: 16,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Fetch user data using the Fetch API. 
 
Task 2 
Display fetched users using map(). 
 
Task 3 
Repeat the same task using Axios. 
 
Task 4 
Implement a Loading indicator. 
 
Task 5 
Display an Error message if the API request fails.`
            },
          ]
        },
        {
          moduleId: 'react-mod-12',
          lessons: [
            {
              id: 'react-unit-12-1',
              title: '12.1 Introduction to State Management',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Every React application stores and manages data. Initially, this data is managed using useState(). However, as applications grow, sharing data across multiple components 
becomes
 
difficult.
 
This challenge is solved using State Management . 
State Management is the process of storing, updating, and sharing data efficiently across an 
application.
 
 
Definition 
State Management is a technique used to manage application data in a predictable and 
centralized
 
manner,
 
ensuring
 
that
 
multiple
 
components
 
can
 
access
 
and
 
update
 
shared
 
information
 
without
 
unnecessary
 
complexity.
 
 
Real-Time Example 
Consider an E-Commerce Website . 
The application contains: 
● Home ● Products ● Cart ● Wishlist ● Profile 
--- PAGE 119 ---
● Orders 
When a user adds a product to the cart, the cart count should update in the Navbar, Cart 
page,
 
and
 
Checkout
 
page.
 
Instead of passing data through every component, a global state management solution is 
used.
 
App │ ├── Navbar │ │ │ └── Cart Count │ ├── Products │ ├── Cart │ └── Checkout`
            },
            {
              id: 'react-unit-12-2',
              title: '12.2 Local State vs Global State',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Local State 
● Managed inside one component. ● Uses useState(). ● Accessible only within that component. 
Example: 
const [count, setCount] = useState(0); 
Global State 
● Shared across multiple components. ● Accessible anywhere in the application. ● Managed using Context API or Redux Toolkit. 
 
Comparison 
Local State Global State 
--- PAGE 120 ---
Component-specific Shared across components 
Uses useState Uses Context/Redux 
Small applications Large applications 
Limited scope Application-wide scope`
            },
            {
              id: 'react-unit-12-3',
              title: '12.3 What is Prop Drilling?',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `One of the biggest problems in React is Prop Drilling . 
Suppose data is required by a deeply nested component. 
App │ ▼ Dashboard │ ▼ Student │ ▼ Profile │ ▼ Avatar 
If the Avatar component needs user information, every intermediate component must pass 
the
 
data.
 
This unnecessary passing of props is called Prop Drilling . 
Problems: 
● Difficult maintenance. ● Unnecessary code. ● Poor scalability.`
            },
            {
              id: 'react-unit-12-4',
              title: '12.4 Context API',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 121 ---
The Context API is React's built-in solution for sharing data globally without manually 
passing
 
props
 
through
 
every
 
component.
 
 
How Context API Works Context Provider │ ▼ Shared Data │ ┌─────┼─────┐ ▼ ▼ ▼ Navbar Cart Profile 
Creating Context import { createContext } from "react"; const UserContext = createContext(); export default UserContext; 
Providing Context <UserContext.Provider value={"Prasanna"}> <App /> </UserContext.Provider> 
Consuming Context import { useContext } from "react"; const user = useContext(UserContext); return <h2>{user}</h2>;`
            },
            {
              id: 'react-unit-12-5',
              title: '12.5 Advantages of Context API',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 122 ---
● Eliminates Prop Drilling. ● Built into React. ● Easy to implement. ● Suitable for medium-sized applications. ● Centralized data access.`
            },
            {
              id: 'react-unit-12-6',
              title: '12.6 Introduction to Redux',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `For enterprise-level applications, Context API may become difficult to manage. 
To solve this, developers use Redux . 
Redux is a predictable state management library that stores application data in a centralized 
Store
.
 
 
Redux Architecture Component ↓ Dispatch(Action) ↓ Reducer ↓ Store Updated ↓ UI Re-rendered`
            },
            {
              id: 'react-unit-12-7',
              title: '12.7 Redux Toolkit',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Redux Toolkit (RTK) is the official and recommended way to write Redux code. 
It reduces boilerplate code and simplifies state management. 
--- PAGE 123 ---
Install Redux Toolkit: 
npm install @reduxjs/toolkit react-redux 
Core Concepts of Redux Toolkit 
Store 
Stores the application's global state. 
 
Slice 
Contains: 
● Initial State ● Reducers ● Actions 
 
Reducer 
Specifies how the state changes based on dispatched actions. 
 
Dispatch 
Sends actions to the Redux Store. 
 
Selector 
Retrieves data from the Store.`
            },
            {
              id: 'react-unit-12-8',
              title: '12.8 Context API vs Redux Toolkit',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Context API Redux Toolkit 
Built into React External Library 
--- PAGE 124 ---
Easy to learn More advanced 
Medium applications Large enterprise applications 
Less boilerplate Structured architecture 
No DevTools by default Excellent Redux DevTools support`
            },
            {
              id: 'react-unit-12-9',
              title: '12.9 Best Practices',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `● Use Local State for component-specific data. ● Use Context API for shared application settings. ● Use Redux Toolkit for complex applications. ● Avoid storing unnecessary data globally. ● Organize Redux slices properly. ● Keep state immutable.`
            },
            {
              id: 'react-unit-12-10',
              title: '12.10 Common Mistakes',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Using Redux for very small applications. 
❌ Storing every variable in global state. 
❌ Mutating Redux state directly. 
❌ Creating too many Context Providers. 
❌ Ignoring Redux DevTools during debugging. 
 
Real-Time Scenario 
A company develops an Online Banking Application . 
Shared data includes: 
● User Profile ● Account Balance ● Notifications ● Theme 
--- PAGE 125 ---
● Language ● Authentication Status 
Instead of passing these values through dozens of components, the application stores them 
in
 
Redux
 
Toolkit.
 
Whenever the balance changes: 
● Dashboard updates. ● Transaction History updates. ● Navbar updates. ● Account Summary updates. 
All components remain synchronized automatically.`
            },
            {
              id: 'react-unit-12-11',
              title: 'Interview Questions (Common Mistakes)',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What is State Management? 
Answer: 
State Management is the process of storing and managing application data efficiently across 
components.
 
 
2. What is Prop Drilling? 
Answer: 
Prop Drilling is the process of passing props through multiple intermediate components to 
reach
 
a
 
deeply
 
nested
 
component.
 
 
3. Why is Context API used? 
Answer: 
Context API is used to share global data between components without passing props 
manually
 
through
 
every
 
level
 
of
 
the
 
component
 
tree.
 
 
4. What is Redux Toolkit? 
--- PAGE 126 ---
Answer: 
Redux Toolkit is the official, recommended library for managing global state in React 
applications
 
with
 
less
 
boilerplate
 
code.
 
 
5. When should Redux Toolkit be used instead of Context API? 
Answer: 
Redux Toolkit is preferred for large-scale applications with complex state management, while 
Context
 
API
 
is
 
suitable
 
for
 
medium-sized
 
applications
 
with
 
simpler
 
shared
 
state.`
            },
            {
              id: 'react-unit-12-12',
              title: 'Practical Lab (Common Mistakes)',
              order: 12,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a Theme Context using Context API. 
 
Task 2 
Share the logged-in user's name using Context API. 
 
Task 3 
Create a Redux Store. 
 
Task 4 
Create a Counter Slice using Redux Toolkit. 
 
Task 5 
Display and update the Counter value using Redux Toolkit. 
--- PAGE 127 ---`
            },
          ]
        },
        {
          moduleId: 'react-mod-13',
          lessons: [
            {
              id: 'react-unit-13-1',
              title: '13.1 Introduction',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Styling is one of the most important aspects of frontend development. While React focuses 
on
 
building
 
dynamic
 
user
 
interfaces,
 
CSS
 
is
 
responsible
 
for
 
making
 
those
 
interfaces
 
visually
 
appealing.
 
React supports multiple styling approaches, allowing developers to choose the method that 
best
 
fits
 
their
 
project
 
requirements.
 
 
Definition 
React Styling is the process of applying visual design, layout, colors, typography, spacing, 
and
 
responsiveness
 
to
 
React
 
components
 
using
 
CSS
 
or
 
CSS-based
 
libraries.
 
 
Real-Time Example 
Consider an Online Shopping Website . 
Without CSS: 
Product Name Price 
--- PAGE 128 ---
 Buy Button 
With CSS: 
Beautiful Product Card Image Price Add to Cart Button Hover Effects 
Professional styling improves user experience and increases usability.`
            },
            {
              id: 'react-unit-13-2',
              title: '13.2 Ways to Style React Applications',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `React supports multiple styling techniques. 
React Styling │ ├── External CSS ├── Inline CSS ├── CSS Modules ├── Bootstrap ├── Tailwind CSS └── Styled Components`
            },
            {
              id: 'react-unit-13-3',
              title: '13.3 External CSS',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `This is the most common styling approach. 
Create: 
--- PAGE 129 ---
App.css 
Example: 
.title{ color:blue; font-size:30px; text-align:center; } 
Import CSS 
import "./App.css"; 
Use 
<h1 className="title"> Welcome React </h1> 
Advantages 
● Easy to manage ● Reusable ● Clean code`
            },
            {
              id: 'react-unit-13-4',
              title: '13.4 Inline CSS',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `React allows styles to be written directly inside components. 
Example 
<h2 style={{ color:"red", 
--- PAGE 130 ---
fontSize:"25px" }} > Hello </h2> 
Notice: 
React uses camelCase. 
Example 
backgroundColor fontSize textAlign 
Advantages 
● Quick styling ● Dynamic styles ● No separate CSS file 
 
Disadvantages 
● Difficult maintenance ● Repeated code ● Poor scalability`
            },
            {
              id: 'react-unit-13-5',
              title: '13.5 CSS Modules',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Large applications may contain multiple CSS files with the same class names. 
CSS Modules solve this problem. 
Example 
--- PAGE 131 ---
Button.module.css .button{ background:blue; color:white; } 
Import 
import styles from "./Button.module.css"; 
Use 
<button className={styles.button} > Submit </button> 
Advantages 
● No CSS conflicts ● Scoped styles ● Better maintainability`
            },
            {
              id: 'react-unit-13-6',
              title: '13.6 Bootstrap',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Bootstrap is one of the most popular CSS frameworks. 
Installation 
npm install bootstrap 
Import 
import 
--- PAGE 132 ---
 "bootstrap/dist/css/bootstrap.min.css"; 
Example 
<button className="btn btn-primary" > Login </button> 
Features 
● Responsive Grid ● Buttons ● Cards ● Navigation Bars ● Forms ● Alerts`
            },
            {
              id: 'react-unit-13-7',
              title: '13.7 Tailwind CSS',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Tailwind CSS is a utility-first CSS framework. 
Installation 
npm install tailwindcss 
Example 
<button className=" bg-blue-600 text-white px-5 
--- PAGE 133 ---
py-2 rounded " > Submit </button> 
Advantages 
● Faster UI development ● Utility classes ● Responsive ● Highly customizable`
            },
            {
              id: 'react-unit-13-8',
              title: '13.8 Styled Components',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Styled Components is a CSS-in-JS library. 
Installation 
npm install styled-components 
Example 
import styled from "styled-components"; const Button = styled.button\` background:blue; color:white; padding:10px; \`; 
--- PAGE 134 ---
Use 
<Button> Login </Button> 
Advantages 
● Component-level styling ● Dynamic styling ● Better organization`
            },
            {
              id: 'react-unit-13-9',
              title: '13.9 Responsive Design',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `Modern websites must work on: 
● Mobile ● Tablet ● Laptop ● Desktop 
Responsive design adjusts layouts automatically. 
Bootstrap and Tailwind provide built-in responsive utilities.`
            },
            {
              id: 'react-unit-13-10',
              title: '13.10 Styling Architecture',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `React Component │ ▼ CSS / Tailwind / Bootstrap │ ▼ 
--- PAGE 135 ---
 Browser Rendering │ ▼ Styled UI`
            },
            {
              id: 'react-unit-13-11',
              title: '13.11 Best Practices',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `● Use CSS Modules for medium projects. ● Use Tailwind CSS for rapid development. ● Use Bootstrap for dashboard applications. ● Avoid excessive Inline CSS. ● Organize styles logically. ● Follow consistent naming conventions. ● Keep styles reusable.`
            },
            {
              id: 'react-unit-13-12',
              title: '13.12 Common Mistakes',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Mixing multiple styling approaches unnecessarily. 
❌ Using Inline CSS for large applications. 
❌ Duplicate CSS classes. 
❌ Ignoring responsive design. 
❌ Hardcoding colors and spacing. 
 
Real-Time Scenario 
A company develops an Online Banking Portal . 
Features include: 
● Dashboard ● Transactions 
--- PAGE 136 ---
● Profile ● Loan Details 
The development team: 
● Uses Tailwind CSS for fast UI development. ● Uses CSS Modules for reusable components. ● Uses Bootstrap Grid for responsive layouts. 
This combination creates a modern, responsive, and maintainable application.`
            },
            {
              id: 'react-unit-13-13',
              title: 'Interview Questions (Common Mistakes)',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. What are the different ways to style React applications? 
Answer: 
React applications can be styled using: 
● External CSS ● Inline CSS ● CSS Modules ● Bootstrap ● Tailwind CSS ● Styled Components 
 
2. What are CSS Modules? 
Answer: 
CSS Modules provide locally scoped CSS, preventing class name conflicts between 
components.
 
 
3. Why is Tailwind CSS popular? 
Answer: 
Tailwind CSS is popular because it uses utility classes, enables rapid development, and 
makes
 
it
 
easy
 
to
 
build
 
responsive
 
user
 
interfaces.
 
 
--- PAGE 137 ---
4. What is Styled Components? 
Answer: 
Styled Components is a CSS-in-JS library that allows developers to write 
component-specific
 
styles
 
directly
 
in
 
JavaScript.
 
 
5. Which styling method is recommended for enterprise applications? 
Answer: 
The choice depends on project requirements. CSS Modules, Tailwind CSS, and Styled 
Components
 
are
 
commonly
 
used
 
in
 
enterprise
 
React
 
applications
 
because
 
they
 
improve
 
maintainability
 
and
 
scalability.`
            },
            {
              id: 'react-unit-13-14',
              title: 'Practical Lab (Common Mistakes)',
              order: 14,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Create a Login page using External CSS. 
 
Task 2 
Apply Inline CSS to a heading. 
 
Task 3 
Create a reusable Button component using CSS Modules. 
 
Task 4 
Design a Registration Form using Bootstrap. 
 
Task 5 
--- PAGE 138 ---
Create a responsive Product Card using Tailwind CSS.`
            },
          ]
        },
        {
          moduleId: 'react-mod-14',
          lessons: [
            {
              id: 'react-unit-14-1',
              title: '14.1 Introduction',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Learning React concepts alone is not enough. The true value of React lies in building 
real-world
 
applications.
 
Projects help developers: 
● Apply theoretical knowledge. ● Improve problem-solving skills. ● Understand project architecture. ● Learn component reusability. ● Gain industry experience. 
Every React developer is expected to build projects before attending interviews. 
 
Why Projects Are Important? 
Projects help you: 
● Improve coding skills. ● Understand React architecture. ● Build a professional portfolio. 
--- PAGE 139 ---
● Prepare for technical interviews. ● Learn debugging techniques.`
            },
            {
              id: 'react-unit-14-2',
              title: '14.2 React Project Development',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Lifecycle
 
A React project follows a structured development process. 
Requirement Analysis │ ▼ UI Design │ ▼ Component Planning │ ▼ Routing Setup │ ▼ State Management │ ▼ API Integration │ ▼ Testing │ ▼ Deployment`
            },
            {
              id: 'react-unit-14-3',
              title: '14.3 Professional Project Folder',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Structure
 
Large React applications follow a clean folder structure. 
src/ │ 
--- PAGE 140 ---
├── assets/ │ ├── components/ │ ├── pages/ │ ├── hooks/ │ ├── context/ │ ├── redux/ │ ├── services/ │ ├── utils/ │ ├── styles/ │ ├── App.jsx │ └── main.jsx 
Folder Explanation 
assets/ 
--- PAGE 141 ---
Stores: 
● Images ● Icons ● Videos ● Fonts 
 
components/ 
Reusable UI components. 
Examples: 
● Navbar ● Footer ● Button ● Card ● Sidebar 
 
pages/ 
Application pages. 
Examples: 
● Home ● About ● Login ● Dashboard ● Contact 
 
hooks/ 
Stores Custom Hooks. 
 
context/ 
Stores Context API files. 
 
--- PAGE 142 ---
redux/ 
Contains: 
● Store ● Slices ● Reducers 
 
services/ 
Contains API functions. 
Example: 
userService.js productService.js 
utils/ 
Utility functions. 
Examples: 
● Validation ● Date Formatting ● Helper Functions 
 
styles/ 
Contains global CSS files.`
            },
            {
              id: 'react-unit-14-4',
              title: '14.4 Project Architecture',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `User │ ▼ React UI 
--- PAGE 143 ---
 │ ▼ Components │ ▼ React Router │ ▼ Context API / Redux │ ▼ API Services │ ▼ Backend Server │ ▼ Database`
            },
            {
              id: 'react-unit-14-5',
              title: '14.5 Project 1 – Todo Application',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Features 
● Add Tasks ● Delete Tasks ● Update Tasks ● Mark Completed 
--- PAGE 144 ---
Concepts Used 
● useState ● map() ● Events ● Forms ● Components`
            },
            {
              id: 'react-unit-14-6',
              title: '14.6 Project 2 – Weather Application',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Features 
● Search City ● Fetch Weather API ● Display Temperature ● Humidity ● Wind Speed 
Concepts Used 
● Axios ● useEffect ● API Integration ● Conditional Rendering`
            },
            {
              id: 'react-unit-14-7',
              title: '14.7 Project 3 – Student Management',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `System
 
Features 
● Add Student ● Update Student ● Delete Student ● Search Student ● Filter Students 
Concepts Used 
● React Router ● Context API 
--- PAGE 145 ---
● Forms ● CRUD Operations`
            },
            {
              id: 'react-unit-14-8',
              title: '14.8 Project 4 – E-Commerce Website',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Modules: 
Home Products Cart Wishlist Checkout Orders Profile 
React Concepts Used 
● Routing ● Props ● State ● Redux Toolkit ● Axios ● Context API ● Hooks`
            },
            {
              id: 'react-unit-14-9',
              title: '14.9 API Integration Architecture',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `React Component ↓ Axios ↓ 
--- PAGE 146 ---
REST API ↓ Node.js Server ↓ MongoDB ↓ JSON Response ↓ React UI`
            },
            {
              id: 'react-unit-14-10',
              title: '14.10 State Management Architecture',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `User Action ↓ Redux Dispatch ↓ Reducer ↓ Redux Store ↓ React Component ↓ Updated UI`
            },
            {
              id: 'react-unit-14-11',
              title: '14.11 Authentication Flow',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 147 ---
Login Form ↓ API Request ↓ Server Validation ↓ JWT Token ↓ Local Storage ↓ Dashboard Access`
            },
            {
              id: 'react-unit-14-12',
              title: '14.12 Deployment Process',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `React applications can be deployed on: 
● Vercel ● Netlify ● GitHub Pages ● Firebase Hosting 
Deployment Steps: 
1. Build the application 
npm run build 
2. Upload build files. 3. Configure hosting. 4. Publish the application.`
            },
            {
              id: 'react-unit-14-13',
              title: '14.13 Best Practices',
              order: 13,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 148 ---
● Use reusable components. ● Follow proper folder structure. ● Keep components small. ● Use environment variables for API URLs. ● Write clean code. ● Handle API errors. ● Optimize performance. ● Use Git for version control.`
            },
            {
              id: 'react-unit-14-14',
              title: '14.14 Common Mistakes',
              order: 14,
              duration: '5 mins',
              type: 'reading',
              content: `❌ Writing everything inside App.jsx. 
❌ Ignoring folder structure. 
❌ Hardcoding API URLs. 
❌ Repeating components. 
❌ Ignoring responsive design. 
❌ Not handling loading and error states. 
 
Real-Time Scenario 
A software company develops an Online Learning Platform . 
Features include: 
● Student Login ● Course Management ● Video Lectures ● Assignments ● Certificates ● Progress Tracking 
The React application uses: 
● React Router for navigation. ● Redux Toolkit for global state. ● Axios for API communication. ● Context API for theme switching. 
--- PAGE 149 ---
● Tailwind CSS for styling. 
The application is deployed on Vercel , allowing students to access it from anywhere.`
            },
            {
              id: 'react-unit-14-15',
              title: 'Interview Questions (Common Mistakes)',
              order: 15,
              duration: '5 mins',
              type: 'reading',
              content: `### Interview Questions - Common Mistakes

1. Why are React projects important? 
Answer: 
Projects help developers apply React concepts, improve problem-solving skills, build 
portfolios,
 
and
 
prepare
 
for
 
real-world
 
software
 
development.
 
 
2. What is the recommended folder structure for a React project? 
Answer: 
A professional React project separates code into folders such as components, pages, assets, hooks, context, redux, services, utils, and styles. 
 
3. Why are reusable components important? 
Answer: 
Reusable components reduce code duplication, improve maintainability, and make 
applications
 
easier
 
to
 
scale.
 
 
4. Which React concepts are commonly used in real-world projects? 
Answer: 
React Router, Hooks, Context API, Redux Toolkit, API Integration (Axios/Fetch), Forms, 
Conditional
 
Rendering,
 
List
 
Rendering,
 
and
 
Styling.
 
 
5. Where can React applications be deployed? 
Answer: 
--- PAGE 150 ---
Common deployment platforms include Vercel , Netlify , GitHub Pages , and Firebase 
Hosting
.`
            },
            {
              id: 'react-unit-14-16',
              title: 'Practical Lab (Common Mistakes)',
              order: 16,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Common Mistakes

Task 1 
Build a Todo Application using useState. 
 
Task 2 
Create a Weather Application using Axios. 
 
Task 3 
Develop a Student Management System with CRUD operations. 
 
Task 4 
Create an E-Commerce Product Listing page using React Router. 
 
Task 5 
Deploy any React project to Vercel or Netlify.`
            },
          ]
        },
        {
          moduleId: 'react-mod-15',
          lessons: [
            {
              id: 'react-unit-15-1',
              title: '15.1 Introduction',
              order: 1,
              duration: '5 mins',
              type: 'reading',
              content: `Learning React is only the first step. A successful React developer should know how to: 
● Explain React concepts clearly. ● Build scalable applications. ● Debug React applications. ● Optimize performance. ● Follow coding standards. 
This module helps students prepare for technical interviews and real-world software 
development.`
            },
            {
              id: 'react-unit-15-2',
              title: '15.2 React Revision Roadmap',
              order: 2,
              duration: '5 mins',
              type: 'reading',
              content: `Before attending interviews, revise the following topics. 
React Fundamentals │ ▼ JSX │ ▼ Components │ ▼ Props │ ▼ State │ ▼ Hooks │ 
--- PAGE 152 ---
 ▼ Forms │ ▼ Routing │ ▼ API Integration │ ▼ Redux Toolkit │ ▼ Projects`
            },
            {
              id: 'react-unit-15-3',
              title: '15.3 React Interview Tips',
              order: 3,
              duration: '5 mins',
              type: 'reading',
              content: `Before answering interview questions: 
● Listen carefully to the question. ● Explain the concept before giving examples. ● Use real-world scenarios. ● Mention best practices. ● Avoid memorized definitions. ● Write clean and readable code.`
            },
            {
              id: 'react-unit-15-4',
              title: '15.4 Frequently Asked Interview',
              order: 4,
              duration: '5 mins',
              type: 'reading',
              content: `Questions
 
Q1. What is React? 
Answer: 
React is an open-source JavaScript library developed by Meta for building fast, interactive, 
and
 
reusable
 
user
 
interfaces
 
using
 
a
 
component-based
 
architecture.
 
 
Q2. What are the features of React? 
--- PAGE 153 ---
Answer: 
● Component-Based Architecture ● Virtual DOM ● JSX ● One-Way Data Binding ● Reusable Components ● Declarative UI ● Strong Ecosystem 
 
Q3. What is JSX? 
Answer: 
JSX (JavaScript XML) is a syntax extension for JavaScript that allows developers to write 
HTML-like
 
code
 
inside
 
JavaScript.
 
It
 
is
 
compiled
 
into
 React.createElement() before 
execution.
 
 
Q4. What is Virtual DOM? 
Answer: 
Virtual DOM is a lightweight JavaScript representation of the Real DOM. React compares 
the
 
previous
 
and
 
current
 
Virtual
 
DOM
 
using
 
the
 
reconciliation
 
algorithm
 
and
 
updates
 
only
 
the
 
changed
 
elements.
 
 
Q5. Difference Between Props and State? 
Props State 
Read-only Mutable 
Parent to Child Managed by Component 
External Data Internal Data 
Cannot be modified Can be updated 
Q6. What are React Hooks? 
--- PAGE 154 ---
Answer: 
Hooks are special functions that allow Functional Components to use State, Lifecycle 
methods,
 
Context,
 
and
 
other
 
React
 
features.
 
 
Q7. Explain useEffect. 
Answer: 
useEffect() performs side effects such as: 
● API Calls ● Timers ● Event Listeners ● DOM Updates 
 
Q8. What is Context API? 
Answer: 
Context API is React's built-in mechanism for sharing global data between components 
without
 
Prop
 
Drilling.
 
 
Q9. What is Redux Toolkit? 
Answer: 
Redux Toolkit is the official library for managing global state in React applications with less 
boilerplate
 
code
 
and
 
better
 
developer
 
experience.
 
 
Q10. What is React Router? 
Answer: 
React Router enables client-side navigation between pages without refreshing the browser. 
 
--- PAGE 155 ---`
            },
            {
              id: 'react-unit-15-5',
              title: '15.5 Advanced Interview Questions',
              order: 5,
              duration: '5 mins',
              type: 'reading',
              content: `Explain React Reconciliation. 
What is React Fiber? 
Explain Memoization. 
Difference between useMemo and useCallback. 
What is Lazy Loading? 
Explain Code Splitting. 
What is Higher Order Component (HOC)? 
What are Render Props? 
Explain Server-Side Rendering (SSR). 
Difference between CSR and SSR.`
            },
            {
              id: 'react-unit-15-6',
              title: '15.6 React Coding Standards',
              order: 6,
              duration: '5 mins',
              type: 'reading',
              content: `Professional developers follow these practices: 
● Use Functional Components. ● Keep components small. ● Follow PascalCase naming. ● Organize folders properly. ● Use ESLint and Prettier. ● Avoid duplicate code. ● Write reusable components.`
            },
            {
              id: 'react-unit-15-7',
              title: '15.7 Performance Optimization',
              order: 7,
              duration: '5 mins',
              type: 'reading',
              content: `Large React applications require optimization. 
Techniques include: 
--- PAGE 156 ---
● React.memo() ● useMemo() ● useCallback() ● Lazy Loading ● Code Splitting ● Image Optimization ● Virtualization for large lists 
 
Performance Flow User Action │ ▼ Component Render │ ▼ Optimization │ ▼ Faster Rendering`
            },
            {
              id: 'react-unit-15-8',
              title: '15.8 Common Interview Coding',
              order: 8,
              duration: '5 mins',
              type: 'reading',
              content: `Questions
 
Practice building: 
● Counter App ● Todo List ● Login Form ● Calculator ● Weather App ● Product Search ● Student Management ● Notes Application ● Shopping Cart ● Quiz Application`
            },
            {
              id: 'react-unit-15-9',
              title: '15.9 Common Mistakes by Beginners',
              order: 9,
              duration: '5 mins',
              type: 'reading',
              content: `--- PAGE 157 ---
❌ Writing everything inside App.jsx 
❌ Ignoring folder structure 
❌ Using too many State variables 
❌ Not handling API errors 
❌ Hardcoding values 
❌ Ignoring reusable components 
❌ Not using unique Keys 
❌ Directly modifying State`
            },
            {
              id: 'react-unit-15-10',
              title: '15.10 Best Practices',
              order: 10,
              duration: '5 mins',
              type: 'reading',
              content: `● Use reusable components. ● Keep State minimal. ● Handle Loading and Error states. ● Write meaningful component names. ● Optimize rendering. ● Follow folder structure. ● Keep UI responsive. ● Write clean, maintainable code.`
            },
            {
              id: 'react-unit-15-11',
              title: '15.11 React Developer Roadmap',
              order: 11,
              duration: '5 mins',
              type: 'reading',
              content: `HTML │ ▼ CSS │ ▼ JavaScript (ES6+) │ ▼ React Fundamentals │ ▼ Hooks 
--- PAGE 158 ---
 │ ▼ React Router │ ▼ API Integration │ ▼ Context API │ ▼ Redux Toolkit │ ▼ Projects │ ▼ Testing │ ▼ Deployment │ ▼ Next.js`
            },
            {
              id: 'react-unit-15-12',
              title: '15.12 Mini Capstone Project',
              order: 12,
              duration: '5 mins',
              type: 'reading',
              content: `Develop a Learning Management System (LMS) . 
Features 
● Student Login ● Course Dashboard ● Video Lessons ● Assignments ● Quiz Module ● Progress Tracking ● User Profile ● Responsive Design 
Technologies 
● React ● React Router ● Axios 
--- PAGE 159 ---
● Redux Toolkit ● Context API ● Tailwind CSS ● REST API`
            },
            {
              id: 'react-unit-15-13',
              title: 'Practical Lab (Mini Capstone Project)',
              order: 13,
              duration: '5 mins',
              type: 'assignment',
              content: `### Practical Lab - Mini Capstone Project

Task 1 
Create a React Portfolio Website. 
 
Task 2 
Optimize an existing React application using React.memo() and useMemo(). 
 
Task 3 
Implement Lazy Loading for a page. 
 
Task 4 
Create reusable UI components. 
 
Task 5 
Deploy a React application on Vercel or Netlify.`
            },
          ]
        },
      ];

      for (const group of lessonsList) {
        for (const les of group.lessons) {
          await lessonsCollection().doc(les.id).set(toDocument({
            ...les,
            moduleId: group.moduleId,
            courseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }

      console.log('Successfully seeded React JS course structure.');
    } catch (error) {
      console.error('Error seeding React JS course details:', error);
    }
  }

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the C Programming course.
   */
  async seedCCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection, coursesCollection } = await import('../../firebase/collections');
      
      console.log('Seeding C Programming detailed syllabus collections...');

      const modulesData = [
        { id: 'c-mod-1', title: 'Module 1: Introduction to C Programming', order: 1, duration: '2 Hours' },
        { id: 'c-mod-2', title: 'Module 2: Variables, Constants & Data Types', order: 2, duration: '2 Hours' },
        { id: 'c-mod-3', title: 'Module 3: Operators & Expressions', order: 3, duration: '2 Hours' },
        { id: 'c-mod-4', title: 'Module 4: Input, Output & Decision-Making Statements', order: 4, duration: '2 Hours' },
        { id: 'c-mod-5', title: 'Module 5: Loops & Iteration', order: 5, duration: '3 Hours' },
        { id: 'c-mod-6', title: 'Module 6: Functions', order: 6, duration: '3 Hours' },
        { id: 'c-mod-7', title: 'Module 7: Arrays', order: 7, duration: '3 Hours' },
        { id: 'c-mod-8', title: 'Module 8: Strings', order: 8, duration: '2 Hours' },
        { id: 'c-mod-9', title: 'Module 9: Pointers', order: 9, duration: '3 Hours' },
        { id: 'c-mod-10', title: 'Module 10: Structures, Unions & Enumerations', order: 10, duration: '3 Hours' },
        { id: 'c-mod-11', title: 'Module 11: Dynamic Memory Allocation', order: 11, duration: '3 Hours' },
        { id: 'c-mod-12', title: 'Module 12: File Handling', order: 12, duration: '2 Hours' },
        { id: 'c-mod-13', title: 'Module 13: Preprocessor & Advanced C', order: 13, duration: '2 Hours' },
        { id: 'c-mod-14', title: 'Module 14: Data Structures & C Projects', order: 14, duration: '3 Hours' },
        { id: 'c-mod-15', title: 'Module 15: Advanced C Concepts & Final Revision', order: 15, duration: '3 Hours' },
      ];

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument({
          id: mod.id,
          title: mod.title,
          order: mod.order,
          duration: mod.duration,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      // Create exactly 1 reading unit per module
      const modulesForCourseDoc: any[] = [];
      const { cSyllabusNotes } = await import('./cSyllabusData');

      for (const mod of modulesData) {
        const lessonId = `c-unit-${mod.order}-notes`;
        const lessonTitle = `Module ${mod.order} - Complete Notes`;
        const lessonDesc = `${mod.title} Complete Notes.`;
        const lessonContent = cSyllabusNotes[mod.order] || `### ${lessonTitle}\n\nContent for ${mod.title} will be added later.`;
        
        // Write to lessons collection in Firestore
        await lessonsCollection().doc(lessonId).set(toDocument({
          id: lessonId,
          title: lessonTitle,
          description: lessonDesc,
          order: 1,
          duration: '45 mins',
          type: 'reading',
          readingTime: '45 mins',
          content: lessonContent,
          courseId,
          moduleId: mod.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Build nested structure
        modulesForCourseDoc.push({
          id: mod.id,
          title: mod.title,
          description: mod.title,
          duration: mod.duration,
          topics: [
            {
              id: `c-topic-${mod.order}`,
              title: `Topic ${mod.order}: Module ${mod.order} Content`,
              description: `Module ${mod.order} Content`,
              estimatedDuration: '45 mins',
              learningUnits: [
                {
                  id: lessonId,
                  title: lessonTitle,
                  description: lessonDesc,
                  duration: '45 mins',
                  type: 'Reading',
                  readingContent: lessonContent
                }
              ]
            }
          ]
        });
      }

      // Save nested structure directly to course document
      await coursesCollection().doc(courseId).update({
        modules: modulesForCourseDoc,
        modulesCount: 15,
        lessonsCount: 15,
        updatedAt: new Date()
      });

      console.log('Successfully seeded C Programming course structure with 15 modules.');
    } catch (error) {
      console.error('Error seeding C Programming course details:', error);
    }
  }
}
export default CourseService;
