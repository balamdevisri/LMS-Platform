import { ZodError } from 'zod';
import { coursesCollection } from '../../firebase/collections';
import { Course, CourseValidationSchema } from '../../types/course';
import { ApiError } from '../../utils/ApiError';
import { fromDocument, handleFirestoreError, toDocument } from '../../utils/firestore';
import { FieldValue, Query } from 'firebase-admin/firestore';
import { db } from '../../firebase';
import { LiveClass } from '../../models/mongo/liveClassroom.model';
import { cSyllabusNotes } from './cSyllabusData';
import * as fs from 'fs';
import * as path from 'path';

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
      } as Course;

      // 5. Update only the changed fields in Firestore
      await docRef.update({
        ...toDocument(parsedData),
        updatedAt: FieldValue.serverTimestamp(),
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
          thumbnail: '/assets/images/c_course_thumbnail.png',
          bannerImage: '/assets/images/c_course_thumbnail.png',
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
        },
        {
          title: 'Python Through OOPs',
          slug: 'python-through-oops',
          description: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, object-oriented programming, and practical application.',
          shortDescription: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, and object-oriented programming.',
          category: 'Programming',
          subcategory: 'Python',
          level: 'all_levels',
          thumbnail: '/assets/images/python_course_thumbnail.png',
          bannerImage: '/assets/images/python_course_thumbnail.png',
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
          tags: ['python', 'programming', 'basics', 'oop', 'object-oriented'],
          prerequisites: ['Basic computer knowledge'],
          learningOutcomes: [
            'Understand Python fundamentals, variables, and data types',
            'Master control flow, conditional statements, and loops in Python',
            'Harness functions, modules, packages, and exception handling',
            'Implement object-oriented programming concept pillars (encapsulation, inheritance, polymorphism, abstraction) and projects'
          ],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'Java Through OOPs',
          slug: 'java-through-oops',
          description: 'Complete Java Through OOPs course covering Java fundamentals, core Java, OOPs main section, intermediate Java, and practice & interview preparation.',
          shortDescription: 'Complete Java Through OOPs course covering Java fundamentals, core Java, OOPs main section, intermediate Java, and practice & interview preparation.',
          category: 'Programming',
          subcategory: 'Java',
          level: 'all_levels',
          thumbnail: '/assets/images/java_course_thumbnail.png',
          bannerImage: '/assets/images/java_course_thumbnail.png',
          duration: '35 Hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-kaizen-q',
            name: 'Kaizen Q Team',
          },
          lessonsCount: 24,
          modulesCount: 24,
          studentsEnrolled: 0,
          rating: 5.0,
          totalRatings: 180,
          tags: ['java', 'programming', 'basics', 'oop', 'object-oriented'],
          prerequisites: ['Basic computer knowledge'],
          learningOutcomes: [
            'Understand Java fundamentals, JVM/JRE/JDK differences, variables and data types',
            'Master core Java, loops, methods, arrays, strings and exception handling',
            'Implement Object-Oriented Programming pillars (encapsulation, inheritance, polymorphism, abstraction) and interfaces',
            'Harness Collections framework, wrapper classes, generics, file handling and build projects'
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
          const docRef = this.collection().doc(courseData.slug === 'git-github-mastery' ? 'git-github-mastery-course-id' : (courseData.slug === 'database-management-system' ? 'database-management-system' : (courseData.slug === 'kubernetes-complete-course-beginner-to-advanced' ? 'kubernetes-complete-course-beginner-to-advanced' : (courseData.slug === 'react-js-complete-course' ? 'react-js-complete-course' : (courseData.slug === 'c-programming' ? 'c-programming-course-id' : (courseData.slug === 'python-through-oops' ? 'python-through-oops-course-id' : (courseData.slug === 'java-through-oops' ? 'java-through-oops-course-id' : this.collection().doc().id)))))));
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
          } else if (courseData.slug === 'python-through-oops') {
            await this.seedPythonCourseDetails(docRef.id);
          } else if (courseData.slug === 'java-through-oops') {
            await this.seedJavaCourseDetails(docRef.id);
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
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'react-js-complete-course') {
            await this.seedReactCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'c-programming') {
            await this.seedCCourseDetails(courseDoc.id);
          } else if (courseData.slug === 'java-through-oops') {
            await this.seedJavaCourseDetails(courseDoc.id);
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
      const { modulesCollection, lessonsCollection } = await import('../../firebase/collections');
      
      console.log('Seeding React JS detailed syllabus collections dynamically from JSON...');

      const jsonPath = path.resolve(__dirname, '../../../../react_js_complete_course_content.json');
      if (!fs.existsSync(jsonPath)) {
        throw new Error(`JSON file not found at: ${jsonPath}`);
      }
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // 1. Seed Modules
      const modulesData = jsonContent.modules.map((m: any) => {
        const title = `Module ${m.moduleNumber}: ${m.title.replace(/[ \t]+/g, ' ').trim()}`;
        return {
          id: `react-mod-${m.moduleNumber}`,
          title,
          order: m.moduleNumber,
          duration: '4 Hours', // Default duration
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      for (const mod of modulesData) {
        await modulesCollection().doc(mod.id).set(toDocument(mod));
      }

      // 2. Seed exactly 1 lesson per module with unified notes
      for (const m of jsonContent.modules) {
        const lessonId = `react-unit-${m.moduleNumber}-notes`;
        const lessonTitle = `Module ${m.moduleNumber} - Complete Notes`;
        const lessonDesc = `Module ${m.moduleNumber}: ${m.title.replace(/[ \t]+/g, ' ').trim()} Complete Notes.`;
        
        await lessonsCollection().doc(lessonId).set(toDocument({
          id: lessonId,
          title: lessonTitle,
          description: lessonDesc,
          order: 1,
          duration: '4 Hours',
          type: 'reading',
          content: m.content,
          moduleId: `react-mod-${m.moduleNumber}`,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
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

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the Python Through OOPs course.
   */
  async seedPythonCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection, coursesCollection } = await import('../../firebase/collections');
      
      console.log('Seeding Python Through OOPs detailed syllabus collections...');

      const modulesData = [
        { id: 'python-mod-1', title: 'Module 1: Introduction to Python', order: 1, duration: '2 Hours' },
        { id: 'python-mod-2', title: 'Module 2: Variables & Data Types', order: 2, duration: '2 Hours' },
        { id: 'python-mod-3', title: 'Module 3: Operators', order: 3, duration: '2 Hours' },
        { id: 'python-mod-4', title: 'Module 4: Input, Output & Basic Programs', order: 4, duration: '2 Hours' },
        { id: 'python-mod-5', title: 'Module 5: Conditional Statements', order: 5, duration: '2 Hours' },
        { id: 'python-mod-6', title: 'Module 6: Loops', order: 6, duration: '3 Hours' },
        { id: 'python-mod-7', title: 'Module 7: Strings', order: 7, duration: '2 Hours' },
        { id: 'python-mod-8', title: 'Module 8: Python Collections', order: 8, duration: '3 Hours' },
        { id: 'python-mod-9', title: 'Module 9: Functions', order: 9, duration: '3 Hours' },
        { id: 'python-mod-10', title: 'Module 10: Modules, Packages & Exception Handling', order: 10, duration: '2 Hours' },
        { id: 'python-mod-11', title: 'Module 11: File Handling', order: 11, duration: '2 Hours' },
        { id: 'python-mod-12', title: 'Module 12: OOP Fundamentals', order: 12, duration: '3 Hours' },
        { id: 'python-mod-13', title: 'Module 13: Four Pillars of OOP', order: 13, duration: '3 Hours' },
        { id: 'python-mod-14', title: 'Module 14: Advanced OOP in Python', order: 14, duration: '3 Hours' },
        { id: 'python-mod-15', title: 'Module 15: Intermediate Python & OOP Project', order: 15, duration: '3 Hours' },
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
      const { pythonSyllabusNotes } = await import('./pythonSyllabusData');

      for (const mod of modulesData) {
        const lessonId = `python-unit-${mod.order}-notes`;
        const lessonTitle = `Module ${mod.order} - Complete Notes`;
        const lessonDesc = `${mod.title} Complete Notes.`;
        const lessonContent = pythonSyllabusNotes[mod.order] || `### ${lessonTitle}\n\nContent for ${mod.title} will be added later.`;
        
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
              id: `python-topic-${mod.order}`,
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

      console.log('Successfully seeded Python Through OOPs course structure with 15 modules.');
    } catch (error) {
      console.error('Error seeding Python Through OOPs course details:', error);
    }
  }

  /**
   * Seeds Modules, Lessons, Quizzes, and Assignments for the Java Through OOPs course.
   */
  async seedJavaCourseDetails(courseId: string): Promise<void> {
    try {
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection, coursesCollection } = await import('../../firebase/collections');
      
      console.log('Seeding Java Through OOPs detailed syllabus collections...');

      const modulesData = [
        { id: 'java-mod-1', title: 'Module 1 — Introduction to Java', order: 1, duration: '2 Hours' },
        { id: 'java-mod-2', title: 'Module 2 — Variables & Data Types', order: 2, duration: '2 Hours' },
        { id: 'java-mod-3', title: 'Module 3 — Operators', order: 3, duration: '2 Hours' },
        { id: 'java-mod-4', title: 'Module 4 — Input & Output', order: 4, duration: '2 Hours' },
        { id: 'java-mod-5', title: 'Module 5 — Conditional Statements', order: 5, duration: '2 Hours' },
        { id: 'java-mod-6', title: 'Module 6 — Loops', order: 6, duration: '2 Hours' },
        { id: 'java-mod-7', title: 'Module 7 — Arrays', order: 7, duration: '2 Hours' },
        { id: 'java-mod-8', title: 'Module 8 — Strings', order: 8, duration: '2 Hours' },
        { id: 'java-mod-9', title: 'Module 9 — Methods', order: 9, duration: '2 Hours' },
        { id: 'java-mod-10', title: 'Module 10 — Exception Handling', order: 10, duration: '2 Hours' },
        { id: 'java-mod-11', title: 'Module 11 — Packages & Access Modifiers', order: 11, duration: '2 Hours' },
        { id: 'java-mod-12', title: 'Module 12 — Classes & Objects', order: 12, duration: '3 Hours' },
        { id: 'java-mod-13', title: 'Module 13 — Encapsulation', order: 13, duration: '2 Hours' },
        { id: 'java-mod-14', title: 'Module 14 — Inheritance', order: 14, duration: '2 Hours' },
        { id: 'java-mod-15', title: 'Module 15 — Polymorphism', order: 15, duration: '2 Hours' },
        { id: 'java-mod-16', title: 'Module 16 — Abstraction', order: 16, duration: '2 Hours' },
        { id: 'java-mod-17', title: 'Module 17 — Interfaces', order: 17, duration: '2 Hours' },
        { id: 'java-mod-18', title: 'Module 18 — Collections Framework', order: 18, duration: '2 Hours' },
        { id: 'java-mod-19', title: 'Module 19 — Wrapper Classes & Generics', order: 19, duration: '2 Hours' },
        { id: 'java-mod-20', title: 'Module 20 — File Handling', order: 20, duration: '2 Hours' },
        { id: 'java-mod-21', title: 'Module 21 — Important Java Concepts', order: 21, duration: '2 Hours' },
        { id: 'java-mod-22', title: 'Module 22 — Java Coding Problems', order: 22, duration: '3 Hours' },
        { id: 'java-mod-23', title: 'Module 23 — OOP Mini Project', order: 23, duration: '3 Hours' },
        { id: 'java-mod-24', title: 'Module 24 — Java & OOP Interview Questions', order: 24, duration: '3 Hours' },
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
      const { javaSyllabusNotes } = await import('./javaSyllabusData');

      for (const mod of modulesData) {
        const lessonId = `java-unit-${mod.order}-notes`;
        const lessonTitle = `Module ${mod.order} - Complete Notes`;
        const lessonDesc = `${mod.title} Complete Notes.`;
        const lessonContent = javaSyllabusNotes[mod.order] || `### ${lessonTitle}\n\nContent for ${mod.title} will be added later.`;
        
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
              id: `java-topic-${mod.order}`,
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
        modulesCount: 24,
        lessonsCount: 24,
        updatedAt: new Date()
      });

      console.log('Successfully seeded Java Through OOPs course structure with 24 modules.');
    } catch (error) {
      console.error('Error seeding Java Through OOPs course details:', error);
    }
  }
}
export default CourseService;
