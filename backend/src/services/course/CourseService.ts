import { ZodError } from 'zod';
import { coursesCollection } from '../../firebase/collections';
import { Course, CourseValidationSchema } from '../../types/course';
import { ApiError } from '../../utils/ApiError';
import { fromDocument, handleFirestoreError, toDocument } from '../../utils/firestore';
import * as admin from 'firebase-admin';

/**
 * Formats Zod validation errors into a human-readable comma-separated string.
 */
const formatZodError = (err: ZodError): string => {
  return err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
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
      const existing = await this.getCourseBySlug(parsedData.slug);
      if (existing) {
        throw new ApiError(400, `A course with slug '${parsedData.slug}' already exists.`);
      }

      // 3. Prepare document
      const docRef = this.collection().doc(); // Generate auto ID
      const courseDoc: Course = {
        ...parsedData,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
      await docRef.delete();
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
        const matchTags = course.tags?.some((tag) => tag.toLowerCase().includes(term));
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
          title: 'Linux Essentials',
          slug: 'linux-essentials',
          description: 'Learn the fundamentals of Linux operating system, command line interface, filesystem structure, and shell scripting.',
          shortDescription: 'Master the command line and basic Linux administration.',
          category: 'Linux',
          subcategory: 'Administration',
          level: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80',
          duration: '10 hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-1',
            name: 'Shaivika AI Team',
          },
          lessonsCount: 12,
          modulesCount: 3,
          studentsEnrolled: 420,
          rating: 4.8,
          totalRatings: 85,
          tags: ['linux', 'bash', 'cli', 'sysadmin'],
          prerequisites: ['None'],
          learningOutcomes: ['Understand Linux directory structure', 'Confidently run shell commands', 'Write basic bash scripts'],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
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
          title: 'React from Zero to Hero',
          slug: 'react-from-zero-to-hero',
          description: 'Dive deep into React.js including Hooks, Context API, Redux Toolkit, React Router, Custom Hooks, and API integrations with state of the art performance.',
          shortDescription: 'Build modern dynamic web applications with React.',
          category: 'Web Development',
          subcategory: 'Frontend Development',
          level: 'Intermediate',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
          duration: '24 hours',
          price: 499,
          currency: 'INR',
          status: 'published',
          language: 'Telugu',
          instructor: {
            uid: 'instructor-2',
            name: 'Anil Kumar',
          },
          lessonsCount: 32,
          modulesCount: 6,
          studentsEnrolled: 890,
          rating: 4.7,
          totalRatings: 112,
          tags: ['react', 'javascript', 'frontend', 'web-dev'],
          prerequisites: ['HTML, CSS, and basic JavaScript'],
          learningOutcomes: ['Build reusable UI components', 'Manage state with Context/Redux', 'Consume RESTful APIs'],
          certificate: true,
          featured: false,
          createdBy: 'seeder',
        },
        {
          title: 'Node.js Backend Development',
          slug: 'nodejs-backend-development',
          description: 'Learn to build scalable and robust backend architectures using Node.js, Express, and Firestore database. Covers REST APIs, Authentication, Middleware, and Testing.',
          shortDescription: 'Build fast backend APIs with Node.js and Express.',
          category: 'Web Development',
          subcategory: 'Backend Development',
          level: 'Intermediate',
          thumbnail: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
          duration: '18 hours',
          price: 599,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-1',
            name: 'Shaivika AI Team',
          },
          lessonsCount: 22,
          modulesCount: 5,
          studentsEnrolled: 540,
          rating: 4.6,
          totalRatings: 67,
          tags: ['node', 'express', 'backend', 'api'],
          prerequisites: ['Intermediate JavaScript'],
          learningOutcomes: ['Develop secure RESTful services', 'Implement JWT/Firebase Auth', 'Connect to databases'],
          certificate: true,
          featured: false,
          createdBy: 'seeder',
        },
        {
          title: 'AI Fundamentals',
          slug: 'ai-fundamentals',
          description: 'Explore the principles of Artificial Intelligence, including Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision.',
          shortDescription: 'Your gateway to the world of Artificial Intelligence.',
          category: 'Artificial Intelligence',
          subcategory: 'AI Core',
          level: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
          duration: '12 hours',
          price: 0,
          currency: 'INR',
          status: 'published',
          language: 'Hindi',
          instructor: {
            uid: 'instructor-3',
            name: 'Priya Sharma',
          },
          lessonsCount: 10,
          modulesCount: 3,
          studentsEnrolled: 1200,
          rating: 4.8,
          totalRatings: 320,
          tags: ['ai', 'machine-learning', 'nlp', 'data-science'],
          prerequisites: ['Basic math, no coding background required'],
          learningOutcomes: ['Understand AI terminologies', 'Identify use cases for AI', 'Analyze ethical aspects of AI'],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'Prompt Engineering',
          slug: 'prompt-engineering',
          description: 'Master the art of writing highly effective prompts for Large Language Models like GPT-4, Gemini, and Claude. Covers zero-shot, few-shot, chain-of-thought, and system prompts.',
          shortDescription: 'Unlock the full potential of Generative AI.',
          category: 'Artificial Intelligence',
          subcategory: 'Generative AI',
          level: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          duration: '6 hours',
          price: 199,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-1',
            name: 'Shaivika AI Team',
          },
          lessonsCount: 8,
          modulesCount: 2,
          studentsEnrolled: 2500,
          rating: 4.9,
          totalRatings: 610,
          tags: ['prompt-engineering', 'chatgpt', 'gemini', 'gen-ai'],
          prerequisites: ['None'],
          learningOutcomes: ['Design precise instructions for LLMs', 'Reduce model hallucinations', 'Automate workflows with prompts'],
          certificate: true,
          featured: true,
          createdBy: 'seeder',
        },
        {
          title: 'Python Programming',
          slug: 'python-programming',
          description: 'Comprehensive guide to Python. Learn data structures, OOP, file handling, libraries like Pandas & NumPy, and script automation from scratch.',
          shortDescription: 'Learn Python programming language from the ground up.',
          category: 'Programming',
          subcategory: 'Python',
          level: 'Beginner',
          thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80',
          duration: '16 hours',
          price: 399,
          currency: 'INR',
          status: 'draft',
          language: 'English',
          instructor: {
            uid: 'instructor-1',
            name: 'Shaivika AI Team',
          },
          lessonsCount: 20,
          modulesCount: 4,
          studentsEnrolled: 0,
          rating: 0,
          totalRatings: 0,
          tags: ['python', 'programming', 'basics', 'data-structures'],
          prerequisites: ['Basic math skills'],
          learningOutcomes: ['Write standard Python scripts', 'Understand Object-Oriented programming', 'Build basic data pipelines'],
          certificate: true,
          featured: false,
          createdBy: 'seeder',
        },
        {
          title: 'Docker & Kubernetes',
          slug: 'docker-kubernetes',
          description: 'Learn containerization with Docker and container orchestration with Kubernetes. Deploy and scale microservices apps in production environments.',
          shortDescription: 'Master containerization and cluster orchestration.',
          category: 'DevOps',
          subcategory: 'Containers',
          level: 'Advanced',
          thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
          duration: '15 hours',
          price: 699,
          currency: 'INR',
          status: 'published',
          language: 'English',
          instructor: {
            uid: 'instructor-1',
            name: 'Shaivika AI Team',
          },
          lessonsCount: 18,
          modulesCount: 4,
          studentsEnrolled: 150,
          rating: 4.9,
          totalRatings: 18,
          tags: ['docker', 'kubernetes', 'containers', 'devops', 'microservices'],
          prerequisites: ['Basic Linux command line knowledge'],
          learningOutcomes: ['Write Dockerfiles and compose files', 'Deploy multi-container apps on K8s', 'Manage cluster resources & scaling'],
          certificate: true,
          featured: false,
          createdBy: 'seeder',
        },
      ];

      console.log('Checking and seeding sample courses...');
      for (const courseData of sampleCourses) {
        const existing = await this.collection().where('slug', '==', courseData.slug).limit(1).get();
        if (existing.empty) {
          const docRef = this.collection().doc(courseData.slug === 'git-github-mastery' ? 'git-github-mastery-course-id' : this.collection().doc().id);
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
          }
        } else {
          // If the course exists, update its details to ensure the requested instructor/desc etc. are correct.
          if (courseData.slug === 'git-github-mastery') {
            const courseDoc = existing.docs[0];
            await courseDoc.ref.update({
              description: courseData.description,
              level: courseData.level,
              instructor: courseData.instructor,
              studentsEnrolled: courseData.studentsEnrolled,
              updatedAt: new Date(),
            });
            await this.seedGitCourseDetails(courseDoc.id);
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
      const { modulesCollection, lessonsCollection, quizzesCollection, assignmentsCollection } = await import('../../firebase/collections');
      
      const existingModules = await modulesCollection().where('courseId', '==', courseId).limit(1).get();
      // If modules already exist, we still want to make sure they are up to date (specifically Module 6 title)
      // and if empty, we write them.
      
      console.log('Seeding Git & GitHub detailed syllabus collections...');

      const modulesData = [
        { id: 'git-mod-1', title: 'Module 1: Version Control & Git Basics', order: 1, duration: '3 Hours' },
        { id: 'git-mod-2', title: 'Module 2: GitHub Foundations', order: 2, duration: '3 Hours' },
        { id: 'git-mod-3', title: 'Module 3: Advanced Git', order: 3, duration: '4 Hours' },
        { id: 'git-mod-4', title: 'Module 4: Repository Management', order: 4, duration: '3 Hours' },
        { id: 'git-mod-5', title: 'Module 5: GitHub Actions', order: 5, duration: '4 Hours' },
        { id: 'git-mod-6', title: 'Module 6: Modern GitHub Ecosystem', order: 6, duration: '3 Hours' },
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
        'git-mod-1': [
          { id: 'git-les-101', title: '1.1 Introduction to Version Control', order: 1, duration: '15 mins', type: 'reading', readingTime: '15 mins', content: '### Introduction to Version Control\nVersion Control System (VCS) is software that helps software developers track changes to code over time. It keeps a history of modifications, allowing developers to revert files to a previous state, compare changes, and collaborate seamlessly.' },
          { id: 'git-les-102', title: '1.2 Centralized vs Distributed Version Control', order: 2, duration: '15 mins', type: 'reading', readingTime: '15 mins', content: '### Centralized vs Distributed VCS\n- **Centralized VCS (CVCS):** Uses a single central server that stores all versioned files. E.g., SVN, Perforce.\n- **Distributed VCS (DVCS):** Every developer has a full clone of the repository, including its history, on their local machine. E.g., Git, Mercurial.' },
          { id: 'git-les-103', title: '1.3 Why Git', order: 3, duration: '10 mins', type: 'reading', readingTime: '10 mins', content: '### Why Git?\nGit is the most popular distributed version control system. It is fast, handles branches efficiently, operates offline, and ensures data integrity through SHA-1 cryptographic hashing of commits.' },
          { id: 'git-les-104', title: '1.4 Why GitHub', order: 4, duration: '10 mins', type: 'reading', readingTime: '10 mins', content: '### Why GitHub?\nGitHub is a cloud-based hosting service for Git repositories. It adds collaboration features like Pull Requests, Code Reviews, Issues, Projects, Actions (CI/CD), and team management.' },
          { id: 'git-les-105', title: '1.5 Installing Git', order: 5, duration: '20 mins', type: 'lab', readingTime: '10 mins', content: '### Installing Git\nInstall Git on your system:\n- Linux: `sudo apt install git`\n- macOS: `brew install git`\n- Windows: Download from git-scm.com\n\nRun command to verify installation:', commands: [{ command: 'git --version', description: 'Check Git installation version' }] },
          { id: 'git-les-106', title: '1.6 Git Configuration', order: 6, duration: '15 mins', type: 'lab', readingTime: '10 mins', content: '### Git Configuration\nSet your global username and email which will be associated with all commits:', commands: [{ command: 'git config --global user.name "Your Name"', description: 'Set global Git name' }, { command: 'git config --global user.email "your.email@example.com"', description: 'Set global Git email' }, { command: 'git config --list', description: 'List current Git configuration settings' }] },
          { id: 'git-les-107', title: '1.7 SSH Keys', order: 7, duration: '20 mins', type: 'lab', readingTime: '15 mins', content: '### Configuring SSH Keys\nSSH keys allow secure connection to GitHub without entering credentials for every push. Generate an SSH key:', commands: [{ command: 'ssh-keygen -t ed25519 -C "your.email@example.com"', description: 'Generate SSH key' }, { command: 'eval "$(ssh-agent -s)"', description: 'Start the SSH agent in the background' }] },
          { id: 'git-les-108', title: '1.8 Personal Access Tokens', order: 8, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Personal Access Tokens (PAT)\nPATs are fine-grained tokens that act as passwords for HTTPS-based authentication. Learn to create PATs in Developer Settings on GitHub with specific scopes.' },
          { id: 'git-les-109', title: '1.9 git init', order: 9, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git init\nInitialize a new local Git repository in the current folder. This creates a hidden `.git` directory containing configuration databases.', commands: [{ command: 'git init', description: 'Initialize a new Git repository' }] },
          { id: 'git-les-110', title: '1.10 Git Lifecycle', order: 10, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### The Git Lifecycle\nFiles in a Git repository move between states:\n1. **Untracked:** New files not added to index.\n2. **Unmodified:** Tracked files with no changes.\n3. **Modified:** Tracked files with changes not staged.\n4. **Staged:** Changes marked to be committed.' },
          { id: 'git-les-111', title: '1.11 git status', order: 11, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git status\nShows the status of files in the current working directory, including untracked, modified, and staged files.', commands: [{ command: 'git status', description: 'Show workspace status' }] },
          { id: 'git-les-112', title: '1.12 git add', order: 12, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git add\nStages modified or untracked files, moving them into the staging area (index) ready to be committed.', commands: [{ command: 'git add index.html', description: 'Stage a specific file' }, { command: 'git add .', description: 'Stage all files recursively' }] },
          { id: 'git-les-113', title: '1.13 git commit', order: 13, duration: '15 mins', type: 'lab', readingTime: '10 mins', content: '### git commit\nSaves staged changes permanently to local history with a descriptive commit message.', commands: [{ command: 'git commit -m "feat: initial commit"', description: 'Commit staged changes with message' }] },
          { id: 'git-les-114', title: '1.14 git log', order: 14, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git log\nDisplays the history of commits in the repository, including hash, author, date, and commit message.', commands: [{ command: 'git log', description: 'Show commit history' }, { command: 'git log --oneline', description: 'Show compact single-line commit history' }] },
          { id: 'git-les-115', title: '1.15 git diff', order: 15, duration: '15 mins', type: 'lab', readingTime: '10 mins', content: '### git diff\nCompares differences between unstaged modifications and the last committed files.', commands: [{ command: 'git diff', description: 'Compare working directory changes' }, { command: 'git diff --staged', description: 'Compare staged changes against repository' }] },
        ],
        'git-mod-2': [
          { id: 'git-les-201', title: '2.1 Create Repository', order: 1, duration: '10 mins', type: 'reading', readingTime: '10 mins', content: '### Creating a GitHub Repository\nNavigate to GitHub, click the "+" icon, select "New repository", define name, visibility (public/private), and initialize with README/gitignore.' },
          { id: 'git-les-202', title: '2.2 Remote Repository', order: 2, duration: '10 mins', type: 'reading', readingTime: '10 mins', content: '### Remote Repository\nRemote repositories are hosted online (e.g. GitHub). They allow team members to synchronize local work using push, pull, and fetch operations.' },
          { id: 'git-les-203', title: '2.3 git remote add origin', order: 3, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git remote add origin\nLinks your local repository to a remote server on GitHub. The default alias name is `origin`.', commands: [{ command: 'git remote add origin https://github.com/user/repo.git', description: 'Link local repo to GitHub' }, { command: 'git remote -v', description: 'Verify remote URLs' }] },
          { id: 'git-les-204', title: '2.4 git push', order: 4, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git push\nUploads local commits to a remote repository branch.', commands: [{ command: 'git push -u origin main', description: 'Push local main to origin and set upstream' }] },
          { id: 'git-les-205', title: '2.5 git pull', order: 5, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git pull\nFetches remote changes and merges them directly into your current local branch.', commands: [{ command: 'git pull origin main', description: 'Fetch and merge origin main changes' }] },
          { id: 'git-les-206', title: '2.6 git fetch', order: 6, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git fetch\nDownloads remote history updates to local reference database without modifying your current code workspace files.', commands: [{ command: 'git fetch origin', description: 'Download origin changes' }] },
          { id: 'git-les-207', title: '2.7 git clone', order: 7, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git clone\nDownloads an existing repository from GitHub to your local machine, initializing and checking out the main branch.', commands: [{ command: 'git clone https://github.com/user/repo.git', description: 'Clone a remote repository' }] },
          { id: 'git-les-208', title: '2.8 Git Branches', order: 8, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Git Branching\nBranches allow you to isolate development work (like implementing feature/bugfix) without disrupting the production-ready `main` code branch.' },
          { id: 'git-les-209', title: '2.9 git switch', order: 9, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git switch\nEasily switch branches or create new feature branches.', commands: [{ command: 'git switch main', description: 'Switch to main branch' }, { command: 'git switch -c feature/auth', description: 'Create and switch to a new branch' }] },
          { id: 'git-les-210', title: '2.10 git checkout', order: 10, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git checkout\nTraditional branch switching and file restoration command.', commands: [{ command: 'git checkout main', description: 'Switch to main' }, { command: 'git checkout -b feature/auth', description: 'Create and checkout branch' }] },
          { id: 'git-les-211', title: '2.11 git merge', order: 11, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git merge\nCombines the commit history of a source branch directly into the current branch.', commands: [{ command: 'git merge feature/auth', description: 'Merge feature/auth into active branch' }] },
          { id: 'git-les-212', title: '2.12 Pull Requests', order: 12, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Pull Requests (PR)\nPRs are GitHub features that propose changes from a feature branch to `main`. They provide a workspace for discussion and reviews before merging.' },
          { id: 'git-les-213', title: '2.13 Code Reviews', order: 13, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Code Reviews\nReviewing code ensures code quality. Developers leave inline comments, request revisions, or approve the changes.' },
          { id: 'git-les-214', title: '2.14 Reviewers', order: 14, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### Reviewers\nAssign other developers to review your Pull Request. Codeowners can be configured to automatically request reviews from designated experts.' },
          { id: 'git-les-215', title: '2.15 Labels', order: 15, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### Labels\nCategorize Pull Requests and Issues (e.g. `bug`, `enhancement`, `wip`, `documentation`) for easy filtering.' },
          { id: 'git-les-216', title: '2.16 Milestones', order: 16, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### Milestones\nGroup Issues and Pull Requests toward a specific target release date or project phase.' },
        ],
        'git-mod-3': [
          { id: 'git-les-301', title: '3.1 Merge Conflicts', order: 1, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### Merge Conflicts\nA merge conflict occurs when Git cannot automatically reconcile overlapping modifications made to the same lines in a file across merging branches.' },
          { id: 'git-les-302', title: '3.2 Conflict Resolution', order: 2, duration: '20 mins', type: 'lab', readingTime: '12 mins', content: '### Resolving Conflicts\nLocate conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`), edit the file to preserve the correct lines, save, and stage the file.', commands: [{ command: 'git add conflict-file.txt', description: 'Stage resolved file' }, { command: 'git commit -m "chore: resolve merge conflicts"', description: 'Commit the merge resolve' }] },
          { id: 'git-les-303', title: '3.3 git restore', order: 3, duration: '10 mins', type: 'lab', readingTime: '5 mins', content: '### git restore\nDiscards unstaged modifications in your working files, reverting them back to the last committed index.', commands: [{ command: 'git restore file.txt', description: 'Discard modifications in file' }] },
          { id: 'git-les-304', title: '3.4 git reset', order: 4, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git reset\nResets repository state back to a past commit. Soft leaves changes staged; mixed (default) leaves changes unstaged; hard deletes all changes.', commands: [{ command: 'git reset --mixed HEAD~1', description: 'Undo last commit, leave changes unstaged' }, { command: 'git reset --hard HEAD~1', description: 'Undo last commit and delete changes' }] },
          { id: 'git-les-305', title: '3.5 git revert', order: 5, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git revert\nCreates a brand-new commit that applies the exact opposite changes of a specified commit, preserving repository commit history securely.', commands: [{ command: 'git revert HEAD', description: 'Revert last commit' }] },
          { id: 'git-les-306', title: '3.6 git stash', order: 6, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git stash\nTemporarily shelves (stashes) your unstaged modifications so you can work on a clean directory, and restore them later.', commands: [{ command: 'git stash', description: 'Stash changes' }, { command: 'git stash pop', description: 'Restore and remove stashed changes' }] },
          { id: 'git-les-307', title: '3.7 Git Rebase', order: 7, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### Git Rebase\nApplies commits from a branch on top of another branch base. It creates a linear history by updating the base of your branch.', commands: [{ command: 'git rebase main', description: 'Rebase active branch on main' }] },
          { id: 'git-les-308', title: '3.8 Interactive Rebase', order: 8, duration: '20 mins', type: 'lab', readingTime: '10 mins', content: '### Interactive Rebase\nAllows reordering, editing, squashing, or dropping commits in a command interface.', commands: [{ command: 'git rebase -i HEAD~3', description: 'Interactively rebase last 3 commits' }] },
          { id: 'git-les-309', title: '3.9 Squashing Commits', order: 9, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Squashing Commits\nCombines multiple small commits into a single descriptive commit (often via interactive rebase or merge squashing) to maintain a clean git history.' },
          { id: 'git-les-310', title: '3.10 Cherry Pick', order: 10, duration: '15 mins', type: 'lab', readingTime: '8 mins', content: '### git cherry-pick\nSelects a single specific commit from another branch and applies its changes directly onto your current branch.', commands: [{ command: 'git cherry-pick <commit-hash>', description: 'Apply specific commit' }] },
        ],
        'git-mod-4': [
          { id: 'git-les-401', title: '4.1 README.md', order: 1, duration: '10 mins', type: 'reading', readingTime: '10 mins', content: '### README.md\nThe landing page of a repository. It provides documentation on how to build, run, and configure the project.' },
          { id: 'git-les-402', title: '4.2 Markdown', order: 2, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Markdown syntax\nMarkdown is a lightweight markup language. E.g. `# Header`, `**bold**`, `*italic*`, `[Link](url)`, `` `code` ``.' },
          { id: 'git-les-403', title: '4.3 LICENSE', order: 3, duration: '10 mins', type: 'reading', readingTime: '8 mins', content: '### Project Licenses\nSpecifies what permissions and restrictions apply to code redistribution and usage (e.g. MIT, Apache 2.0, GPL).' },
          { id: 'git-les-404', title: '4.4 .gitignore', order: 4, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### .gitignore configuration\nA text file listing patterns of files and directories (like `node_modules/`, `.env`, build/ outputs) that Git should completely ignore.' },
          { id: 'git-les-405', title: '4.5 GitHub Issues', order: 5, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### GitHub Issues\nTrack bug reports, feature requests, and tasks. Integrates labels, assignees, and milestones.' },
          { id: 'git-les-406', title: '4.6 Project Boards', order: 6, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Kanban Boards\nKanban-style boards to manage task workflows. Drag tasks between columns: "To do", "In progress", "Done".' },
          { id: 'git-les-407', title: '4.7 GitHub Pages', order: 7, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### GitHub Pages hosting\nFree hosting for static websites directly from a GitHub repository (e.g. docs, portfolio).' },
        ],
        'git-mod-5': [
          { id: 'git-les-501', title: '5.1 CI/CD', order: 1, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### CI/CD Foundations\n- **Continuous Integration (CI):** Automates building and testing code changes.\n- **Continuous Delivery/Deployment (CD):** Automates releasing code to production servers.' },
          { id: 'git-les-502', title: '5.2 GitHub Actions', order: 2, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### GitHub Actions\nA built-in automation engine in GitHub to run workflows triggered by events (e.g. push, pull_request).' },
          { id: 'git-les-503', title: '5.3 Workflow Files', order: 3, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Workflow files\nWorkflows are stored inside the `.github/workflows/` directory as `.yml` files.' },
          { id: 'git-les-504', title: '5.4 YAML', order: 4, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### YAML Syntax\nYAML (YAML Ain\'t Markup Language) is key-value based, indentation-sensitive, human-readable structure.' },
          { id: 'git-les-505', title: '5.5 Jobs', order: 5, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### Jobs\nWorkflows consist of one or more jobs that run in parallel by default (can be set to run sequentially).' },
          { id: 'git-les-506', title: '5.6 Steps', order: 6, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### Steps\nJobs contain a sequence of steps. Each step executes a shell command or runs a predefined action.' },
          { id: 'git-les-507', title: '5.7 Runners', order: 7, duration: '10 mins', type: 'reading', readingTime: '5 mins', content: '### GitHub Runners\nVirtual machines (Ubuntu, Windows, macOS) hosted by GitHub that execute the workflow jobs.' },
          { id: 'git-les-508', title: '5.8 Automated Testing', order: 8, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### CI Automated Testing\nConfigure actions to run `npm test`, `pytest`, or compilation verification steps automatically on PR submit.' },
          { id: 'git-les-509', title: '5.9 GitHub Secrets', order: 9, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Encrypted Secrets\nStore API keys and deploy tokens securely in repository settings, accessing them via `${{ secrets.MY_TOKEN }}`.' },
          { id: 'git-les-510', title: '5.10 Deploy to Vercel', order: 10, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### Vercel Deployment\nAutomate deployments to Vercel with GitHub Actions using the Vercel Deploy action and secrets.' },
          { id: 'git-les-511', title: '5.11 Deploy to Netlify', order: 11, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### Netlify Deployment\nConfigure Netlify deploy hooks or workflow actions to deploy static assets.' },
          { id: 'git-les-512', title: '5.12 Deploy to AWS', order: 12, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### AWS Deployment\nUsing AWS credentials, configure actions to build and deploy to S3, ECS, or Lambda.' },
        ],
        'git-mod-6': [
          { id: 'git-les-601', title: '6.1 GitHub Codespaces', order: 1, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### GitHub Codespaces\nA cloud-hosted VS Code environment built directly into GitHub. Accessible inside any browser.' },
          { id: 'git-les-602', title: '6.2 Dev Containers', order: 2, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Dev Containers\nDefine development environment parameters (dependencies, OS, extensions) inside a `.devcontainer/devcontainer.json` file.' },
          { id: 'git-les-603', title: '6.3 GitHub Copilot', order: 3, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### GitHub Copilot\nAn AI-powered pair programmer assistant. Suggests code lines and blocks directly inside the editor.' },
          { id: 'git-les-604', title: '6.4 Prompt Engineering', order: 4, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Copilot Prompting\nLearn how to comment and prompt to guide GitHub Copilot to write correct functions and scripts.' },
          { id: 'git-les-605', title: '6.5 Dependabot', order: 5, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Dependabot configuration\nAutomated updates for vulnerable dependencies. Scans package configuration and opens Pull Requests.' },
          { id: 'git-les-606', title: '6.6 Secret Scanning', order: 6, duration: '15 mins', type: 'reading', readingTime: '10 mins', content: '### Secret scanning\nScans code commits for exposed credentials and alerts developers before credentials are leaked publicly.' },
          { id: 'git-les-607', title: '6.7 Branch Protection Rules', order: 7, duration: '20 mins', type: 'reading', readingTime: '15 mins', content: '### Branch Protection Rules\nSecures branches (like `main`) by enforcing PR review approvals, status checks, and preventing force pushes.' },
        ],
      };

      for (const modId of Object.keys(lessonsData)) {
        const lessons = lessonsData[modId];
        for (const les of lessons) {
          await lessonsCollection().doc(les.id).set(toDocument({
            ...les,
            courseId,
            moduleId: modId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }

      const quizzesData = [
        {
          id: 'git-quiz-1',
          moduleId: 'git-mod-1',
          title: 'Module 1 Quiz: Version Control & Git Basics',
          passingScore: 70,
          questions: [
            { id: 1, question: 'What does a Version Control System track?', options: ['Hardware configurations', 'Code changes over time', 'Network latency', 'CPU temperatures'], correct: 1 },
            { id: 2, question: 'Which of the following is a Distributed VCS?', options: ['SVN', 'Perforce', 'Git', 'CVS'], correct: 2 },
            { id: 3, question: 'What hidden folder is initialized when running git init?', options: ['.github', '.gitignore', '.git', '.gitconfig'], correct: 2 },
            { id: 4, question: 'Which command stages all changes in the current directory?', options: ['git add .', 'git commit -a', 'git status', 'git push'], correct: 0 },
            { id: 5, question: 'What is the default tracking remote repository alias name?', options: ['main', 'origin', 'github', 'upstream'], correct: 1 },
            { id: 6, question: 'Which command displays commit history details?', options: ['git diff', 'git log', 'git status', 'git show'], correct: 1 },
            { id: 7, question: 'Which state represents changes registered ready for commit?', options: ['Untracked', 'Modified', 'Staged', 'Committed'], correct: 2 },
            { id: 8, question: 'How does Git ensure data integrity of commits?', options: ['Password hashes', 'SHA-1 hashing', 'Data backups', 'Cloud storage'], correct: 1 },
            { id: 9, question: 'Which command configures global Git username?', options: ['git config user.name', 'git config --global user.name', 'git init name', 'git add name'], correct: 1 },
            { id: 10, question: 'What does git diff display?', options: ['All commit logs', 'Differences between unstaged changes', 'Branch hierarchies', 'Remote URL lists'], correct: 1 },
          ],
        },
        {
          id: 'git-quiz-2',
          moduleId: 'git-mod-2',
          title: 'Module 2 Quiz: GitHub Foundations',
          passingScore: 70,
          questions: [
            { id: 1, question: 'What command downloads a repository from GitHub to local?', options: ['git pull', 'git download', 'git clone', 'git checkout'], correct: 2 },
            { id: 2, question: 'Which command registers a remote origin repository?', options: ['git remote add origin', 'git push origin', 'git pull origin', 'git add origin'], correct: 0 },
            { id: 3, question: 'What does git pull perform?', options: ['git push & fetch', 'git fetch & merge', 'git status & commit', 'git add & merge'], correct: 1 },
            { id: 4, question: 'Which command switches to a branch or creates a new one in modern Git?', options: ['git branch', 'git switch', 'git checkout', 'git merge'], correct: 1 },
            { id: 5, question: 'What feature proposes code integration reviews on GitHub?', options: ['Issues', 'Pull Requests', 'Codespaces', 'Pages'], correct: 1 },
            { id: 6, question: 'What does git fetch download?', options: ['Only text files', 'History logs without changing working directory', 'Entire files overwriting current changes', 'Branches list only'], correct: 1 },
            { id: 7, question: 'What is a branch in Git?', options: ['A separate folder', 'A pointer to a specific commit', 'A backup archive', 'A network connection'], correct: 1 },
            { id: 8, question: 'What does git merge do?', options: ['Splits repositories', 'Combines history of branches', 'Deletes branches', 'Clones remote repository'], correct: 1 },
            { id: 9, question: 'What are GitHub labels used for?', options: ['Styling code files', 'Categorizing issues and PRs', 'Renaming branches', 'Assigning reviewers'], correct: 1 },
            { id: 10, question: 'What is a Milestone on GitHub?', options: ['A branch name', 'A container registry', 'A target grouping of issues/PRs', 'A deployment server'], correct: 2 },
          ],
        },
        {
          id: 'git-quiz-3',
          moduleId: 'git-mod-3',
          title: 'Module 3 Quiz: Advanced Git',
          passingScore: 70,
          questions: [
            { id: 1, question: 'When does a merge conflict occur?', options: ['When renaming files', 'When overlapping changes are made to the same lines in a file', 'When git push fails', 'When branches have different names'], correct: 1 },
            { id: 2, question: 'Which command undoes unstaged local modifications in working files?', options: ['git reset', 'git restore', 'git revert', 'git stash'], correct: 1 },
            { id: 3, question: 'What reset flag undoes commits and completely deletes changes?', options: ['--soft', '--mixed', '--hard', '--clean'], correct: 2 },
            { id: 4, question: 'How is git revert different from git reset?', options: ['It does not change files', 'It creates a new commit undoing changes, preserving history', 'It deletes commits', 'It runs only on remote repositories'], correct: 1 },
            { id: 5, question: 'What command temporarily shelves modified changes?', options: ['git pause', 'git stash', 'git save', 'git backup'], correct: 1 },
            { id: 6, question: 'What command applies commits from a branch on top of another branch?', options: ['git merge', 'git rebase', 'git cherry-pick', 'git stash pop'], correct: 1 },
            { id: 7, question: 'What is commit squashing?', options: ['Compressing file sizes', 'Combining multiple commits into a single commit', 'Deleting history logs', 'Fixing code bugs'], correct: 1 },
            { id: 8, question: 'Which command applies a single specific commit from another branch?', options: ['git merge', 'git rebase', 'git cherry-pick', 'git clone'], correct: 2 },
            { id: 9, question: 'What flag triggers interactive rebase?', options: ['-v', '-a', '-i', '--force'], correct: 2 },
            { id: 10, question: 'How do you restore stashed changes and remove them from the stash list?', options: ['git stash apply', 'git stash pop', 'git stash drop', 'git stash clear'], correct: 1 },
          ],
        },
        {
          id: 'git-quiz-4',
          moduleId: 'git-mod-4',
          title: 'Module 4 Quiz: Repository Management',
          passingScore: 70,
          questions: [
            { id: 1, question: 'What is the default filename for a repository landing page?', options: ['INDEX.html', 'README.md', 'ABOUT.txt', 'LICENSE.md'], correct: 1 },
            { id: 2, question: 'What formatting format is used in README files?', options: ['HTML', 'Markdown', 'XML', 'Plain Text'], correct: 1 },
            { id: 3, question: 'What does a LICENSE file specify?', options: ['Usage and distribution permissions', 'Developer logins', 'Project pricing', 'Build instructions'], correct: 0 },
            { id: 4, question: 'Where do you list file patterns that Git should not track?', options: ['.gitconfig', '.gitignore', '.github', 'README.md'], correct: 1 },
            { id: 5, question: 'What is a GitHub Project Board based on?', options: ['Excel spreadsheets', 'Kanban columns', 'Gantt charts', 'Network diagrams'], correct: 1 },
            { id: 6, question: 'Which service hosts static websites directly from GitHub repositories?', options: ['GitHub Actions', 'GitHub Codespaces', 'GitHub Pages', 'Dependabot'], correct: 2 },
            { id: 7, question: 'Which markdown syntax creates a link?', options: ['[Link](url)', '(Link)[url]', 'link:url', 'href="url"'], correct: 0 },
            { id: 8, question: 'How is a header level 1 declared in markdown?', options: ['Header', '# Header', '==Header==', '<h1>Header'], correct: 1 },
            { id: 9, question: 'What are GitHub Issues used for?', options: ['Hosting websites', 'Tracking bugs, features, and tasks', 'Resolving merge conflicts', 'Running CI/CD jobs'], correct: 1 },
            { id: 10, question: 'Can .gitignore ignore files that are already tracked by Git?', options: ['Yes', 'No, they must be untracked first using git rm --cached', 'Yes, automatically', 'No, .gitignore cannot ignore any files'], correct: 1 },
          ],
        },
        {
          id: 'git-quiz-5',
          moduleId: 'git-mod-5',
          title: 'Module 5 Quiz: GitHub Actions',
          passingScore: 70,
          questions: [
            { id: 1, question: 'What does CI stand for?', options: ['Continuous Integration', 'Code Inspection', 'Cloud Infrastructure', 'Computer Intelligence'], correct: 0 },
            { id: 2, question: 'What does CD stand for?', options: ['Code Delivery', 'Continuous Deployment / Delivery', 'Control Daemon', 'Central Database'], correct: 1 },
            { id: 3, question: 'Where are GitHub Actions workflow files stored?', options: ['.github/workflows/', 'actions/workflows/', '.git/hooks/', 'scripts/ci/'], correct: 0 },
            { id: 4, question: 'What syntax format is used in workflow files?', options: ['JSON', 'XML', 'YAML', 'HTML'], correct: 2 },
            { id: 5, question: 'What component runs the actions in a job?', options: ['The repository', 'A Runner', 'The browser', 'An API gateway'], correct: 1 },
            { id: 6, question: 'What is the secret store on GitHub used for?', options: ['Storing private repository code', 'Storing encrypted deployment keys and tokens', 'Hosting databases', 'Hiding issues'], correct: 1 },
            { id: 7, question: 'Which platform is commonly used to host static web deployments?', options: ['Docker Hub', 'Vercel', 'Jira', 'PyPI'], correct: 1 },
            { id: 8, question: 'How are secrets referenced in a YAML file?', options: ['${{ secrets.TOKEN }}', 'process.env.TOKEN', '$TOKEN', '{{ token }}'], correct: 0 },
            { id: 9, question: 'What workflow block contains the execution steps?', options: ['events', 'jobs', 'runners', 'triggers'], correct: 1 },
            { id: 10, question: 'Can jobs run sequentially by specifying dependencies?', options: ['No, always parallel', 'Yes, using the needs keyword', 'Yes, using the runs-after keyword', 'No, only one job is allowed'], correct: 1 },
          ],
        },
        {
          id: 'git-quiz-6',
          moduleId: 'git-mod-6',
          title: 'Module 6 Quiz: Modern GitHub & Capstone',
          passingScore: 70,
          questions: [
            { id: 1, question: 'What is GitHub Codespaces?', options: ['A project management dashboard', 'A cloud-hosted VS Code environment', 'A chat application', 'A documentation compiler'], correct: 1 },
            { id: 2, question: 'What file configures development container parameters?', options: ['docker-compose.yml', 'devcontainer.json', 'package.json', 'Dockerfile'], correct: 1 },
            { id: 3, question: 'What is GitHub Copilot?', options: ['A branch reviewer', 'An AI pair programmer assistant', 'A CI build compiler', 'A deployment server'], correct: 1 },
            { id: 4, question: 'Which tool automatically opens PRs to fix security vulnerabilities in dependencies?', options: ['Dependabot', 'GitHub Secrets', 'GitHub Copilot', 'Branch Protection'], correct: 0 },
            { id: 5, question: 'What does secret scanning alert developers about?', options: ['Formatting bugs', 'Exposed credentials in commits', 'Inefficient algorithms', 'Deprecated packages'], correct: 1 },
            { id: 6, question: 'What feature prevents force pushing and enforces code review before merging?', options: ['Collaborators list', 'Branch Protection Rules', 'Milestones', 'GitHub Secrets'], correct: 1 },
            { id: 7, question: 'What does Dev Containers enable?', options: ['Faster deployment', 'Standardized and containerized local dev environments', 'Multi-tenant cloud hosting', 'Auto-scaling clusters'], correct: 1 },
            { id: 8, question: 'Which prompts are optimized to direct AI assistants?', options: ['Database scripts', 'Prompt Engineering guidelines', 'Workflow steps', 'Branch names'], correct: 1 },
            { id: 9, question: 'Can branch protection rules require status checks to pass before merging?', options: ['Yes', 'No', 'Only for public repositories', 'Only for admin roles'], correct: 0 },
            { id: 10, question: 'What is the target of the Capstone project?', options: ['Writing a text essay', 'Applying Git, GitHub, PRs, and Actions in a practical workflow', 'Resolving an OS bug', 'Installing Node.js'], correct: 1 },
          ],
        },
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
        { id: 'git-assign-1', moduleId: 'git-mod-1', title: 'Assignment 1: Initialize Git Repository', description: 'Initialize a new Git repository locally, create an index.html file, stage and commit the file. Submit the commit log.' },
        { id: 'git-assign-2', moduleId: 'git-mod-2', title: 'Assignment 2: Push Code to GitHub', description: 'Create a new public repository on GitHub. Link your local repository to GitHub, and push your commits. Submit the GitHub URL.' },
        { id: 'git-assign-3', moduleId: 'git-mod-3', title: 'Assignment 3: Resolve Merge Conflict', description: 'Simulate a merge conflict locally between two branches editing the same line of code. Resolve the conflict, complete the merge commit, and submit the conflict resolution logs.' },
        { id: 'git-assign-4', moduleId: 'git-mod-4', title: 'Assignment 4: Create Pull Request', description: 'Create a new feature branch, modify README.md with markdown guidelines, push it, and create a Pull Request on GitHub. Submit the Pull Request link.' },
        { id: 'git-assign-5', moduleId: 'git-mod-5', title: 'Assignment 5: Deploy GitHub Pages', description: 'Create a simple static landing page, configure GitHub Pages, push the site, and verify it is live. Submit the hosted site URL.' },
        { id: 'git-assign-6', moduleId: 'git-mod-6', title: 'Assignment 6: Capstone Project - Production Pipeline', description: 'Implement a full workspace repository, configure branch protection rules, write a GitHub Actions workflow that executes automated testing on PRs and auto-deploys to static servers. Submit the repository and actions logs.' },
      ];

      for (const assign of assignmentsData) {
        await assignmentsCollection().doc(assign.id).set(toDocument({
          ...assign,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      }

      console.log('Successfully seeded Git & GitHub Mastery course structure.');
    } catch (error) {
      console.error('Error seeding Git & GitHub Mastery course details:', error);
    }
  }
}
export default CourseService;
