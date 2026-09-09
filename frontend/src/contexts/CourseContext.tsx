import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { courseService } from '../services/courseService';

/**
 * On-demand dynamic loader for static fallback course datasets.
 * Prevents loading megabytes of static curriculum into the root entry bundle.
 */
export const loadStaticCourseModules = async (courseIdOrSlug: string | number): Promise<ModuleItem[]> => {
  const target = String(courseIdOrSlug).toLowerCase().trim();
  if (target === 'course_linux_101' || target === '1' || target.includes('linux')) {
    const mod = await import('../data/linuxCourseFullData');
    return mod.linuxCourseModules;
  }
  if (target.includes('git')) {
    const mod = await import('../data/gitCourseFullData');
    return mod.gitCourseModules;
  }
  if (target.includes('k8s') || target.includes('kubernetes')) {
    const mod = await import('../data/kubernetesCourseFullData');
    return mod.kubernetesCourseModules;
  }
  if (target.includes('react')) {
    const mod = await import('../data/reactCourseFullData');
    return mod.reactCourseModules;
  }
  if (target.includes('c-prog') || target.includes('c-programming') || target === 'c-programming-course-id') {
    const mod = await import('../data/cCourseFullData');
    return mod.cCourseModules;
  }
  if (target.includes('python') || target === 'python-through-oops-course-id') {
    const mod = await import('../data/pythonCourseFullData');
    return mod.pythonCourseModules;
  }
  if (target.includes('java-through') || (target.includes('java') && !target.includes('script'))) {
    const mod = await import('../data/javaCourseFullData');
    return mod.javaCourseModules;
  }
  if (target.includes('javascript') || target.includes('js-mastery')) {
    const mod = await import('../data/javascriptCourseFullData');
    return mod.javascriptCourseModules;
  }
  if (target.includes('node') || target.includes('nodejs')) {
    const mod = await import('../data/nodejsCourseFullData');
    return mod.nodejsCourseModules;
  }
  if (target.includes('data-structures') || target.includes('dsa') || target.includes('algorithm')) {
    const mod = await import('../data/dsaCourseFullData');
    return mod.dsaCourseModules;
  }
  if (target.includes('web-development') || target.includes('web-dev')) {
    const mod = await import('../data/webDevCourseFullData');
    return mod.webDevCourseModules;
  }
  if (target.includes('database') || target.includes('dbms') || target.includes('sql')) {
    const mod = await import('../data/dbmsCourseFullData');
    return mod.dbmsCourseModules;
  }
  return [];
};

export type LearningUnitType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks?: number;
}

export interface CodeExampleItem {
  id?: string;
  title?: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface PracticeQuestionItem {
  id?: string;
  question: string;
  answer: string;
  explanation?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export type ResourceItemType = 'pdf' | 'link' | 'video' | 'github' | 'download' | 'doc' | 'url';

export interface ResourceLinkItem {
  id?: string;
  title: string;
  url: string;
  type?: ResourceItemType;
  description?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: LearningUnitType;
  videoUrl?: string;
  readingContent?: string;
  learningObjectives?: string[];
  conceptTheory?: string;
  codeExamples?: CodeExampleItem[];
  keyPoints?: string[];
  practiceQuestions?: PracticeQuestionItem[];
  resourceLinks?: ResourceLinkItem[];
  notes?: string;
  isDraft?: boolean;
  lastSavedAt?: string;
  quizQuestions?: QuizQuestion[];
  quizDifficulty?: 'Easy' | 'Medium' | 'Hard';
  quizPassingScore?: number;
  quizTimer?: number;
  assignmentInstructions?: string;
  assignmentReferenceFiles?: string;
  assignmentMaxMarks?: number;
  assignmentDeadline?: string;
  assignmentAllowedTypes?: string;
  assignmentRubric?: string;
  assignmentSubmissionStatus?: string;
  assignmentTeacherFeedback?: string;
  practiceLabChallenge?: any;
  resources?: any[];
  order?: number;
  orderIndex?: number;
  estimatedReadMinutes?: number;
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  learningUnits: LearningUnitItem[];
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: TopicItem[];
  topicImageUrl?: string | null;
  topicImagePublicId?: string | null;
  themeColor?: string | null;
  themeIcon?: string | null;
}

export interface CourseItem {
  id: number | string;
  title: string;
  slug?: string;
  subtitle?: string;
  instructor: string;
  role?: string;
  avatar?: string;
  rating: number;
  reviews?: number;
  students: string;
  duration: string;
  category: string;
  level?: string;
  badge?: string;
  tracks?: string;
  thumbnail: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  banner?: string;
  status: 'Published' | 'Draft';
  price?: number;
  description: string;
  shortDescription?: string;
  learningOutcomes?: string[];
  tags?: string[];
  durationHours?: number;
  totalLessons?: number;
  totalDurationMinutes?: number;
  updatedAt?: string;
  createdAt?: string;
  created?: string;
  syllabus: string[];
  modules?: ModuleItem[];
}



interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  getCourseModules: (id: number | string) => Promise<ModuleItem[]>;
  refreshCourses: () => Promise<void>;
  updateCourse: (id: number | string, updates: Partial<CourseItem>) => Promise<void>;
}

const mergeCourseModules = (defModules?: ModuleItem[], cachedModules?: any[]): ModuleItem[] => {
  if (cachedModules && cachedModules.length > 0) return cachedModules;
  if (defModules && defModules.length > 0) return defModules;
  return [];
};

// Helper to enrich learning units with default content if missing
const enrichCourseMockContent = (course: CourseItem): CourseItem => {
  if (!course.modules) return course;
  const enrichedModules = course.modules.map(m => {
    const enrichedTopics = m.topics.map(t => {
      const enrichedUnits = t.learningUnits.map(u => {
        const enrichedUnit = { ...u };
        if (u.type === 'Video' && !u.videoUrl) {
          enrichedUnit.videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        } else if (u.type === 'Reading' && !u.readingContent) {
          enrichedUnit.readingContent = `## ${u.title}\n\n${u.description}\n\n### Core Study Guide\nGit and system configurations are essential to maintain workspace integrity. Ensure that you follow step-by-step instructions carefully.\n\n#### Key Takeaways\n- Verify configuration details using validation flags.\n- Log descriptive commit titles to ease review actions.\n- Push changes early to prevent merge conflicts.`;
        } else if (u.type === 'Quiz' && (!u.quizQuestions || u.quizQuestions.length === 0)) {
          enrichedUnit.quizDifficulty = 'Medium';
          enrichedUnit.quizPassingScore = 70;
          enrichedUnit.quizTimer = 10;
          enrichedUnit.quizQuestions = [
            {
              id: `q-${u.id}-1`,
              questionText: `Which of the following describes the core goal of "${u.title}"?`,
              options: [
                'Establishing structural configuration guidelines',
                'Simulating production environments locally',
                'Optimizing workspace pipeline runs',
                'All of the above'
              ],
              correctAnswerIndex: 3,
              explanation: 'This topic covers configurations, local simulations, and optimization pipelines, which are all part of the core goals.',
              marks: 5
            },
            {
              id: `q-${u.id}-2`,
              questionText: `What is a common best practice associated with this topic?`,
              options: [
                'Committing directly without branch validations',
                'Using descriptive commit logs and peer reviews',
                'Disabling branch protections for fast merges',
                'Ignoring configuration scopes'
              ],
              correctAnswerIndex: 1,
              explanation: 'Descriptive commit logs and robust peer review workflows maintain software codebase quality and tracking history.',
              marks: 5
            }
          ];
        } else if (u.type === 'Assignment' && !u.assignmentInstructions) {
          enrichedUnit.assignmentMaxMarks = 100;
          enrichedUnit.assignmentDeadline = '7 days after module start';
          enrichedUnit.assignmentAllowedTypes = 'PDF, ZIP, MD';
          enrichedUnit.assignmentReferenceFiles = 'git-cheat-sheet.pdf, lab-setup-guide.md';
          enrichedUnit.assignmentRubric = 'Completeness (50%), Correctness (30%), Quality (20%)';
          enrichedUnit.assignmentSubmissionStatus = 'Not Submitted';
          enrichedUnit.assignmentTeacherFeedback = 'Assignment pending student upload response.';
          enrichedUnit.assignmentInstructions = `### Practical Assignment: ${u.title}\n\n**Goal**: Implement the tasks described in the description: *${u.description}*.\n\n#### Instructions & Deliverables:\n1. Open your terminal or workspace panel.\n2. Perform the required steps as outlined in the lessons.\n3. Verify your configuration outputs run without errors.\n4. Write a short summary (150-300 words) describing your findings and commit your configuration file.\n\n#### Grading Rubric:\n- **Completeness (50%)**: All steps executed and logged.\n- **Correctness (30%)**: Correct parameters and inputs.\n- **Documentation (20%)**: Clean descriptions and summaries.`;
        }
        return enrichedUnit;
      });
      return { ...t, learningUnits: enrichedUnits };
    });
    return { ...m, topics: enrichedTopics };
  });
  return { ...course, modules: enrichedModules };
};

const initialDefaultCoursesRaw: CourseItem[] = [
  {
    id: 'course_linux_101',
    title: 'Linux Systems & Administration Mastery',
    subtitle: '🐧 Linux Systems Mastery',
    instructor: 'KaizenQ Team',
    role: 'Linux Systems Architect & AI Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 145,
    students: '3',
    duration: '32 hrs',
    category: 'Linux & Systems',
    level: 'Beginner to Advanced',
    badge: 'Featured Track',
    tracks: '15 Modules',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.webp',
    description: `Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.`,
    syllabus: [
      "Module 1 – Introduction to Linux",
      "Module 2 – Installing Linux",
      "Module 3 – Linux File System",
      "Module 4 – Linux File Management Commands",
      "Module 5 – File Permissions and Ownership",
      "Module 6 – Text Processing Commands",
      "Module 7 – Package Management",
      "Module 8 – Process Management",
      "Module 9 – Shell Scripting",
      "Module 10 – Networking in Linux",
      "Module 11 – Disk Management",
      "Module 12 – User & Group Management",
      "Module 13 – Linux Services & System Administration",
      "Module 14 – Linux Security & Best Practices",
      "Module 15 – Linux Interview Preparation & Projects"
    ],
    createdAt: new Date('2026-07-01').toISOString(),
    modules: []
  },
  {
    id: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    subtitle: '⚡ Git & GitHub Mastery',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '15 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (15 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/github_course_banner.webp',
    description: 'Transform your development velocity by mastering Git and GitHub. Learn version control, branching, PR review workflows, GitHub Actions, CI/CD, and enterprise release management patterns.',
    syllabus: [
      'Module 1: Introduction to Version Control, Git & GitHub',
      'Module 2: Installing Git and Initial Configuration',
      'Module 3: Git Repository Fundamentals',
      'Module 4: Basic Git Commands',
      'Module 5: Branching and Merging',
      'Module 6: GitHub Basics',
      'Module 7: Remote Repository Management',
      'Module 8: Git Collaboration',
      'Module 9: Advanced Git Commands',
      'Module 10: Git Internals',
      'Module 11: GitHub Features',
      'Module 12: Git Best Practices',
      'Module 13: Real-World Git Workflow',
      'Module 14: Git & GitHub Projects',
      'Module 15: Git & GitHub Interview Preparation'
    ],
    modules: []
  },
  {
    id: 'database-management-system',
    title: 'Database Management System (DBMS): Beginner to Advanced',
    subtitle: '🗄️ Database Management System',
    instructor: 'Kaizen-Q Academy',
    role: 'Database Systems Specialists',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 120,
    students: '0',
    duration: '25 Hours',
    category: 'Database',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '6 Modules (25 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/dbms_course_thumbnail.png',
    description: 'Learn Database Management System from fundamentals to advanced concepts including SQL, normalization, transactions, database design, optimization, and real-world projects.',
    syllabus: [
      'Module 1: Database Fundamentals',
      'Module 2: Relational Database Concepts',
      'Module 3: SQL Fundamentals',
      'Module 4: Advanced SQL',
      'Module 5: Database Design',
      'Module 6: Real World Database Project',
    ],
    modules: []
  },
  {
    id: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course – Beginner to Advanced',
    subtitle: '☸️ Kubernetes Complete Course',
    instructor: 'Kaizen-Q Academy',
    role: 'DevOps & Cloud Engineers',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 100,
    students: '0',
    duration: '30 Hours',
    category: 'DevOps / Cloud / Containers',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (30 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
    description: 'Learn Kubernetes from the fundamentals to production-level deployment through practical, hands-on learning. Understand Kubernetes architecture, Pods, Deployments, Services, Networking, Storage, Security, Scheduling, Helm, CI/CD, and real-world application deployment.',
    syllabus: [
      'Module 1: Introduction to Kubernetes',
      'Module 2: Kubernetes Architecture',
      'Module 3: Installing Kubernetes',
      'Module 4: Basic Kubernetes Objects & Pods',
      'Module 5: Services & Networking',
      'Module 6: Kubernetes Storage',
      'Module 7: Configuration Management',
      'Module 8: Advanced Workloads',
      'Module 9: Kubernetes Security',
      'Module 10: Monitoring & Logging',
      'Module 11: Helm — Package Manager',
      'Module 12: CI/CD with Kubernetes',
      'Module 13: Troubleshooting Kubernetes',
      'Module 14: Real-World Projects',
      'Module 15: Interview Preparation & Cheat Sheet'
    ],
    createdAt: new Date('2026-08-08').toISOString(),
    modules: []
  },
  {
    id: 'react-js-complete-course',
    title: 'React JS Complete Course',
    subtitle: '⚛️ React JS Complete Course',
    instructor: 'KaizenQ Systems Team',
    role: 'React Systems Architect & LMS Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 120,
    students: '0',
    duration: '24 Hours',
    category: 'Web Development / Frontend Development',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '15 Modules (24 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
    syllabus: [
      'Module 1: Introduction to React JS',
      'Module 2: Setting Up React Environment',
      'Module 3: JSX (JavaScript XML)',
      'Module 4: React Components',
      'Module 5: React Props',
      'Module 6: React State & Hooks',
      'Module 7: React Events & Forms',
      'Module 8: Lists & Conditional Rendering',
      'Module 9: React Hooks',
      'Module 10: React Router',
      'Module 11: API Integration',
      'Module 12: State Management',
      'Module 13: Styling React',
      'Module 14: Real-Time Projects',
      'Module 15: Interview Preparation',
    ],
    createdAt: new Date('2026-08-08').toISOString(),
    modules: []
  },
  {
    id: 'c-programming-course-id',
    title: 'C Programming',
    subtitle: '💻 C Programming',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '15 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/c_course_thumbnail.png',
    description: 'Complete C Programming course covering fundamentals, programming concepts, advanced C, data structures, practical programs, interview preparation, and final revision.',
    syllabus: [
      'Module 1: Introduction to C Programming',
      'Module 2: Variables, Constants & Data Types',
      'Module 3: Operators & Expressions',
      'Module 4: Input, Output & Decision-Making Statements',
      'Module 5: Loops & Iteration',
      'Module 6: Functions',
      'Module 7: Arrays',
      'Module 8: Strings',
      'Module 9: Pointers',
      'Module 10: Structures, Unions & Enumerations',
      'Module 11: Dynamic Memory Allocation',
      'Module 12: File Handling',
      'Module 13: Preprocessor & Advanced C',
      'Module 14: Data Structures & C Projects',
      'Module 15: Advanced C Concepts & Final Revision',
    ],
    createdAt: new Date('2026-08-10').toISOString(),
    modules: []
  },
  {
    id: 'python-through-oops-course-id',
    title: 'Python Through OOPs',
    subtitle: '💻 Python Through OOPs',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '15 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/python_course_thumbnail.png',
    description: 'Complete Python Through OOPs course covering Python fundamentals, control flow, functions, intermediate concepts, object-oriented programming, and practical application.',
    syllabus: [
      'Module 1: Introduction to Python',
      'Module 2: Variables & Data Types',
      'Module 3: Operators',
      'Module 4: Input, Output & Basic Programs',
      'Module 5: Conditional Statements',
      'Module 6: Loops',
      'Module 7: Strings',
      'Module 8: Python Collections',
      'Module 9: Functions',
      'Module 10: Modules, Packages & Exception Handling',
      'Module 11: File Handling',
      'Module 12: OOP Fundamentals',
      'Module 13: Four Pillars of OOP',
      'Module 14: Advanced OOP in Python',
      'Module 15: Intermediate Python & OOP Project',
    ],
    createdAt: new Date('2026-08-11').toISOString(),
    modules: []
  },
  {
    id: 'java-through-oops-course-id',
    title: 'Java Through OOPs',
    subtitle: '💻 Java Through OOPs',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 180,
    students: '0',
    duration: '35 Hours',
    category: 'Programming',
    level: 'All Levels',
    badge: 'Standard Track',
    tracks: '24 Modules (35 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/java_course_thumbnail.png',
    description: 'Complete Java Through OOPs course covering Java fundamentals, core Java, OOPs main section, intermediate Java, and practice & interview preparation.',
    syllabus: [
      'Module 1 — Introduction to Java',
      'Module 2 — Variables & Data Types',
      'Module 3 — Operators',
      'Module 4 — Input & Output',
      'Module 5 — Conditional Statements',
      'Module 6 — Loops',
      'Module 7 — Arrays',
      'Module 8 — Strings',
      'Module 9 — Methods',
      'Module 10 — Exception Handling',
      'Module 11 — Packages & Access Modifiers',
      'Module 12 — Classes & Objects',
      'Module 13 — Encapsulation',
      'Module 14 — Inheritance',
      'Module 15 — Polymorphism',
      'Module 16 — Abstraction',
      'Module 17 — Interfaces',
      'Module 18 — Collections Framework',
      'Module 19 — Wrapper Classes & Generics',
      'Module 20 — File Handling',
      'Module 21 — Important Java Concepts',
      'Module 22 — Java Coding Problems',
      'Module 23 — OOP Mini Project',
      'Module 24 — Java & OOP Interview Questions'
    ],
    createdAt: new Date('2026-08-11').toISOString(),
    modules: []
  },
  {
    id: 'javascript-mastery',
    title: 'JavaScript',
    slug: 'javascript',
    subtitle: '⚡ JavaScript Programming',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 140,
    students: '0',
    duration: '25 Hours',
    category: 'Web Development',
    level: 'Beginner to Intermediate',
    badge: 'Standard Track',
    tracks: '10 Modules (25 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    description: 'Learn modern JavaScript including variables, functions, arrays, objects, ES6+, asynchronous programming, promises, modules and browser APIs.',
    syllabus: [
      'Module 1: JavaScript Fundamentals & Syntax',
      'Module 2: Variables, Data Types & Operators',
      'Module 3: Control Flow & Functions',
      'Module 4: Arrays & Object Manipulation',
      'Module 5: DOM & Browser Event Handling',
      'Module 6: Asynchronous JavaScript & Promises',
      'Module 7: Modern ES6+ Features & Modules',
      'Module 8: Object-Oriented JS & Prototypes',
      'Module 9: Practical JavaScript Projects',
      'Module 10: JavaScript Interview Mastery'
    ],
    createdAt: new Date('2026-08-12').toISOString(),
    modules: []
  },
  {
    id: 'nodejs-backend-development',
    title: 'Node.js',
    slug: 'nodejs',
    subtitle: '🟢 Node.js Backend Development',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 110,
    students: '0',
    duration: '28 Hours',
    category: 'Backend Development',
    level: 'Intermediate',
    badge: 'Standard Track',
    tracks: '10 Modules (28 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
    description: 'Learn backend development with Node.js, Express, REST APIs, authentication, middleware, databases and production backend patterns.',
    syllabus: [
      'Module 1: Introduction to Node.js & V8 Engine',
      'Module 2: Node Modules, NPM & File System',
      'Module 3: Asynchronous Programming & Event Loop',
      'Module 4: Express.js Framework & Routing',
      'Module 5: Middleware & Request Processing',
      'Module 6: RESTful API Design & Validation',
      'Module 7: Database Integration (SQL & MongoDB)',
      'Module 8: Authentication, Authorization & JWT',
      'Module 9: Error Handling, Logging & Security',
      'Module 10: Production Backend Project & Deployment'
    ],
    createdAt: new Date('2026-08-13').toISOString(),
    modules: []
  },
  {
    id: 'data-structures-and-algorithms',
    title: 'Data Structures & Algorithms',
    slug: 'data-structures-and-algorithms',
    subtitle: '🌲 Data Structures & Algorithms',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 190,
    students: '0',
    duration: '40 Hours',
    category: 'Computer Science',
    level: 'Intermediate',
    badge: 'Standard Track',
    tracks: '10 Modules (40 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    description: 'Learn arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, recursion and algorithmic problem solving.',
    syllabus: [
      'Module 1: Algorithm Analysis & Big-O Notation',
      'Module 2: Arrays & Two-Pointer Techniques',
      'Module 3: Linked Lists (Singly & Doubly)',
      'Module 4: Stacks & Queues',
      'Module 5: Recursion & Backtracking',
      'Module 6: Sorting & Searching Algorithms',
      'Module 7: Binary Trees & BST',
      'Module 8: Heaps & Priority Queues',
      'Module 9: Graphs & Graph Traversals',
      'Module 10: Dynamic Programming & Greedy Algorithms'
    ],
    createdAt: new Date('2026-08-14').toISOString(),
    modules: []
  },
  {
    id: 'web-development-fundamentals',
    title: 'Web Development',
    slug: 'web-development',
    subtitle: '🌐 Full Stack Web Development',
    instructor: 'Kaizen Q Team',
    role: 'Senior Technical Instructor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 160,
    students: '0',
    duration: '30 Hours',
    category: 'Web Development',
    level: 'Beginner',
    badge: 'Standard Track',
    tracks: '10 Modules (30 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
    description: 'Learn HTML, CSS and JavaScript fundamentals and build responsive modern web applications.',
    syllabus: [
      'Module 1: Introduction to Web Development',
      'Module 2: HTML5 Semantic Structure & Forms',
      'Module 3: CSS3 Styling & Box Model',
      'Module 4: Responsive Design with Flexbox & Grid',
      'Module 5: CSS Animations & Modern Layouts',
      'Module 6: JavaScript for Web Interactivity',
      'Module 7: Working with Web APIs & Data Fetching',
      'Module 8: Building a Real-World Website Project',
      'Module 9: Web Performance & SEO Optimization',
      'Module 10: Hosting, Deployment & Portfolio Building'
    ],
    createdAt: new Date('2026-08-15').toISOString(),
    modules: []
  }
];

const initialDefaultCourses = initialDefaultCoursesRaw.map(enrichCourseMockContent);

const getLatestUnitTimestamp = (modules?: ModuleItem[]): number => {
  if (!modules || modules.length === 0) return 0;
  let latest = 0;
  for (const m of modules) {
    for (const t of m.topics || []) {
      for (const u of t.learningUnits || []) {
        if (u.lastSavedAt) {
          const time = new Date(u.lastSavedAt).getTime();
          if (!isNaN(time) && time > latest) latest = time;
        }
      }
    }
  }
  return latest;
};

const chooseEffectiveModules = (
  logicalKey: string,
  existingCourse?: CourseItem,
  incomingCourse?: CourseItem,
  defaultModules?: ModuleItem[]
): ModuleItem[] => {
  const existingMods = existingCourse?.modules || [];
  const incomingMods = incomingCourse?.modules || [];

  let selectedMods: ModuleItem[] = [];
  let sourceReason = 'default';

  if (existingMods.length === 0 && incomingMods.length === 0) {
    selectedMods = defaultModules || [];
    sourceReason = 'both_empty_fallback_default';
  } else if (existingMods.length > 0 && incomingMods.length === 0) {
    selectedMods = existingMods;
    sourceReason = 'existing_has_modules_incoming_empty';
  } else if (existingMods.length === 0 && incomingMods.length > 0) {
    selectedMods = incomingMods;
    sourceReason = 'incoming_has_modules_existing_empty';
  } else {
    // Both have modules -> determine which one is genuinely newer
    const existingTime = Math.max(
      getLatestUnitTimestamp(existingMods),
      new Date(existingCourse?.updatedAt || 0).getTime()
    );
    const incomingTime = Math.max(
      getLatestUnitTimestamp(incomingMods),
      new Date(incomingCourse?.updatedAt || 0).getTime()
    );

    if (incomingTime > existingTime) {
      selectedMods = incomingMods;
      sourceReason = 'incoming_newer_timestamp';
    } else {
      selectedMods = existingMods;
      sourceReason = 'existing_newer_or_equal_timestamp';
    }
  }

  console.log('[COURSE-MERGE]', {
    logicalCourseKey: logicalKey,
    source: sourceReason,
    existingModules: existingMods.length,
    incomingModules: incomingMods.length,
    selectedModules: selectedMods.length,
    targetUnitContentSnippet: (selectedMods[0]?.topics?.[0]?.learningUnits?.[0]?.readingContent || selectedMods[0]?.topics?.[0]?.learningUnits?.[0]?.conceptTheory || '').slice(0, 40),
  });

  return selectedMods;
};

export const sanitizeCourseList = (list: CourseItem[]): CourseItem[] => {
  const map = new Map<string, CourseItem>();
  list.forEach((c) => {
    const title = (c.title || '').toLowerCase();
    const slug = ((c as any).slug || '').toLowerCase();

    // Completely remove/ignore 'Linux Essentials' sample course
    if (title === 'linux essentials' || slug === 'linux-essentials' || String(c.id) === 'linux-essentials') {
      return;
    }

    if (
      title.includes('linux systems') ||
      title.includes('introduction to linux') ||
      String(c.id) === '1' ||
      String(c.id) === 'course_linux_101'
    ) {
      const key = 'course_linux_101';
      const defaultLinuxCourse = initialDefaultCourses.find(item => item.id === 'course_linux_101') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultLinuxCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultLinuxCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'course_linux_101',
        title: c.title || defaultLinuxCourse.title,
        subtitle: c.subtitle || defaultLinuxCourse.subtitle,
        thumbnail: c.thumbnail || defaultLinuxCourse.thumbnail || '/assets/images/linux_course_thumbnail.webp',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultLinuxCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('git & github') ||
      title.includes('git and github') ||
      String(c.id) === 'git-github-mastery' ||
      String(c.id) === 'git-github-mastery-course-id'
    ) {
      const key = 'git-github-mastery';
      const defaultGitCourse = initialDefaultCourses[1];
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultGitCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultGitCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'git-github-mastery',
        title: c.title || defaultGitCourse.title,
        subtitle: c.subtitle || defaultGitCourse.subtitle,
        thumbnail: defaultGitCourse.thumbnail || '/assets/images/github_course_banner.webp',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultGitCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('database management system') ||
      title.includes('dbms') ||
      String(c.id) === 'database-management-system'
    ) {
      const key = 'database-management-system';
      const defaultDbmsCourse = initialDefaultCourses.find(item => item.id === 'database-management-system') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultDbmsCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultDbmsCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'database-management-system',
        title: c.title || defaultDbmsCourse.title,
        subtitle: c.subtitle || defaultDbmsCourse.subtitle,
        thumbnail: defaultDbmsCourse.thumbnail || '/assets/images/dbms_course_thumbnail.png',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultDbmsCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('kubernetes') ||
      String(c.id) === 'kubernetes-complete-course-beginner-to-advanced'
    ) {
      const key = 'kubernetes-complete-course-beginner-to-advanced';
      const defaultK8sCourse = initialDefaultCourses.find(item => item.id === 'kubernetes-complete-course-beginner-to-advanced') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultK8sCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultK8sCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'kubernetes-complete-course-beginner-to-advanced',
        title: c.title || defaultK8sCourse.title,
        subtitle: c.subtitle || defaultK8sCourse.subtitle,
        thumbnail: c.thumbnail || defaultK8sCourse.thumbnail || 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultK8sCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('react js') ||
      title.includes('react complete') ||
      String(c.id) === 'react-js-complete-course'
    ) {
      const key = 'react-js-complete-course';
      const defaultReactCourse = initialDefaultCourses.find(item => item.id === 'react-js-complete-course') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultReactCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultReactCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'react-js-complete-course',
        title: c.title || defaultReactCourse.title,
        subtitle: c.subtitle || defaultReactCourse.subtitle,
        thumbnail: defaultReactCourse.thumbnail || '/assets/images/react_course_banner.webp',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultReactCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('c programming') ||
      title.includes('c language') ||
      String(c.id) === 'c-programming-course-id'
    ) {
      const key = 'c-programming-course-id';
      const defaultCCourse = initialDefaultCourses.find(item => item.id === 'c-programming-course-id') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultCCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultCCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'c-programming-course-id',
        title: c.title || defaultCCourse.title,
        subtitle: c.subtitle || defaultCCourse.subtitle,
        thumbnail: defaultCCourse.thumbnail || '/assets/images/c_course_thumbnail.png',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultCCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('python through oops') ||
      title.includes('python') ||
      String(c.id) === 'python-through-oops-course-id'
    ) {
      const key = 'python-through-oops-course-id';
      const defaultPythonCourse = initialDefaultCourses.find(item => item.id === 'python-through-oops-course-id') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultPythonCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultPythonCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'python-through-oops-course-id',
        title: c.title || defaultPythonCourse.title,
        subtitle: c.subtitle || defaultPythonCourse.subtitle,
        thumbnail: defaultPythonCourse.thumbnail || '/assets/images/python_course_thumbnail.png',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultPythonCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('java through oops') ||
      title.includes('java') ||
      String(c.id) === 'java-through-oops-course-id'
    ) {
      const key = 'java-through-oops-course-id';
      const defaultJavaCourse = initialDefaultCourses.find(item => item.id === 'java-through-oops-course-id') || c;
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, defaultJavaCourse.modules);
      const updatedItem: CourseItem = {
        ...defaultJavaCourse,
        ...(existingInMap || {}),
        ...c,
        id: 'java-through-oops-course-id',
        title: c.title || defaultJavaCourse.title,
        subtitle: c.subtitle || defaultJavaCourse.subtitle,
        thumbnail: defaultJavaCourse.thumbnail || '/assets/images/java_course_thumbnail.png',
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt || defaultJavaCourse.updatedAt,
      };
      map.set(key, updatedItem);
    } else {
      const key = String(c.id);
      const existingInMap = map.get(key);
      const effectiveModules = chooseEffectiveModules(key, existingInMap, c, existingInMap?.modules);
      const courseTitle = c.title || existingInMap?.title || 'Technical Course Track';
      const defaultThumb = (c as any).thumbnail || (c as any).thumbnailUrl || (c as any).image || (c as any).imageUrl || (c as any).banner || existingInMap?.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80';
      const defaultDesc = (c as any).description || (c as any).fullDescription || (c as any).shortDescription || (c as any).subtitle || existingInMap?.description || 'Comprehensive technical curriculum with hands-on labs and projects.';
      const defaultShortDesc = (c as any).shortDescription || (c as any).description?.slice(0, 160) || existingInMap?.shortDescription || 'Practical learning track with hands-on exercises.';
      map.set(key, {
        ...(existingInMap || {}),
        ...c,
        title: courseTitle,
        thumbnail: defaultThumb,
        banner: (c as any).banner || defaultThumb,
        description: defaultDesc,
        shortDescription: defaultShortDesc,
        price: typeof c.price === 'number' ? c.price : (existingInMap?.price || 0),
        modules: effectiveModules,
        updatedAt: c.updatedAt || existingInMap?.updatedAt,
      });
    }
  });

  if (!map.has('course_linux_101')) {
    map.set('course_linux_101', initialDefaultCourses[0]);
  }
  if (!map.has('git-github-mastery')) {
    map.set('git-github-mastery', initialDefaultCourses[1]);
  }
  if (!map.has('database-management-system')) {
    map.set('database-management-system', initialDefaultCourses[2]);
  }
  if (!map.has('kubernetes-complete-course-beginner-to-advanced')) {
    map.set('kubernetes-complete-course-beginner-to-advanced', initialDefaultCourses.find(item => item.id === 'kubernetes-complete-course-beginner-to-advanced') || initialDefaultCourses[3]);
  }
  if (!map.has('react-js-complete-course')) {
    map.set('react-js-complete-course', initialDefaultCourses.find(item => item.id === 'react-js-complete-course') || initialDefaultCourses[4]);
  }
  if (!map.has('c-programming-course-id')) {
    map.set('c-programming-course-id', initialDefaultCourses.find(item => item.id === 'c-programming-course-id') || initialDefaultCourses[5]);
  }
  if (!map.has('python-through-oops-course-id')) {
    map.set('python-through-oops-course-id', initialDefaultCourses.find(item => item.id === 'python-through-oops-course-id') || initialDefaultCourses[6]);
  }
  if (!map.has('java-through-oops-course-id')) {
    map.set('java-through-oops-course-id', initialDefaultCourses.find(item => item.id === 'java-through-oops-course-id') || initialDefaultCourses[7]);
  }
  if (!map.has('javascript-mastery')) {
    const defaultJs = initialDefaultCourses.find(item => item.id === 'javascript-mastery');
    if (defaultJs) map.set('javascript-mastery', defaultJs);
  }
  if (!map.has('nodejs-backend-development')) {
    const defaultNode = initialDefaultCourses.find(item => item.id === 'nodejs-backend-development');
    if (defaultNode) map.set('nodejs-backend-development', defaultNode);
  }
  if (!map.has('data-structures-and-algorithms')) {
    const defaultDsa = initialDefaultCourses.find(item => item.id === 'data-structures-and-algorithms');
    if (defaultDsa) map.set('data-structures-and-algorithms', defaultDsa);
  }
  if (!map.has('web-development-fundamentals')) {
    const defaultWeb = initialDefaultCourses.find(item => item.id === 'web-development-fundamentals');
    if (defaultWeb) map.set('web-development-fundamentals', defaultWeb);
  }

  return Array.from(map.values()).filter((item) => (item as any).isDeleted !== true);
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalizedParsed = parsed
            .filter((c: any) => c.isDeleted !== true)
            .map((c: any) => {
              const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
              const instructorName = typeof c.instructor === 'object' && c.instructor !== null
                ? (c.instructor.name || 'Kaizen Q Team')
                : (c.instructor || 'Kaizen Q Team');
              return {
                ...c,
                status: statusVal,
                instructor: instructorName,
              } as CourseItem;
            });

          return sanitizeCourseList(normalizedParsed);
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning:', e);
      }
    }
    return initialDefaultCourses;
  });

  const refreshCourses = useCallback(async () => {
    try {
      const loadedResult = await courseService.getCourses();
      const loaded = loadedResult.courses;
      if (loaded && loaded.length > 0) {
        const normalized = loaded
          .filter((c: any) => (c as any).isDeleted !== true)
          .map((c: any) => {
            const statusVal = c.status && c.status.toLowerCase() === 'published' ? 'Published' : 'Draft';
            const instructorName = typeof c.instructor === 'object' && c.instructor !== null
              ? (c.instructor.name || 'Kaizen Q Team')
              : (c.instructor || 'Kaizen Q Team');
            return {
              ...c,
              status: statusVal,
              instructor: instructorName,
            } as CourseItem;
          });

        const merged = sanitizeCourseList(normalized);
        setCourses(merged);
        localStorage.setItem('shaivika_courses_data', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Firestore courses fetch notice in refreshCourses:', err);
    }
  }, []);

  // Sync with Firestore if available
  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  // Real-time synchronization for course updates across all tabs and components
  useEffect(() => {
    const handleCoursesChanged = () => {
      try {
        const stored = localStorage.getItem('shaivika_courses_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('shaivika_courses_updated', handleCoursesChanged);
    window.addEventListener('storage', handleCoursesChanged);
    return () => {
      window.removeEventListener('shaivika_courses_updated', handleCoursesChanged);
      window.removeEventListener('storage', handleCoursesChanged);
    };
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    if (courses && courses.length > 0) {
      localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
    }
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status === 'Published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    try {
      const created = await courseService.createCourse(coursePayload as any);
      const mapped: CourseItem = {
        ...created,
        id: created.id,
        status: created.status && created.status.toLowerCase() === 'published' ? 'Published' : 'Draft',
        instructor:
          typeof created.instructor === 'object' && created.instructor !== null
            ? (created.instructor.name || 'Kaizen Q Team')
            : (created.instructor || 'Kaizen Q Team'),
      } as CourseItem;

      setCourses((prev) => [mapped, ...prev.filter((c) => String(c.id) !== String(mapped.id))]);
    } catch (e) {
      console.error('Failed to create course in CourseContext:', e);
      throw e;
    }
  };

  const getCourseById = (idOrSlug: number | string): CourseItem | undefined => {
    const target = String(idOrSlug).toLowerCase().trim();
    if (!target) return undefined;
    return courses.find((c) => {
      const cId = String(c.id).toLowerCase().trim();
      const cSlug = String((c as any).slug || '').toLowerCase().trim();
      return (
        cId === target ||
        (cId === 'course_linux_101' && target === '1') ||
        (cId === '1' && target === 'course_linux_101') ||
        (cId === 'git-github-mastery' && target === 'git-github-mastery-course-id') ||
        (cId === 'git-github-mastery-course-id' && target === 'git-github-mastery') ||
        cSlug === target
      );
    });
  };

  const toggleCourseStatus = async (id: number | string) => {
    const target = getCourseById(id);
    if (!target) return;
    const targetId = String(target.id);

    const nextStatus: 'Published' | 'Draft' = target.status === 'Published' ? 'Draft' : 'Published';
    setCourses((prev) => prev.map((c) => (String(c.id) === targetId ? { ...c, status: nextStatus } : c)));

    try {
      await courseService.updateCourse(targetId, { status: nextStatus.toLowerCase() as any });
    } catch (e) {
      console.warn('Firestore sync failed in toggleCourseStatus:', e);
    }
  };

  const deleteCourse = async (id: number | string) => {
    const target = getCourseById(id);
    const targetId = target ? String(target.id) : String(id);

    try {
      await courseService.deleteCourse(targetId);
      setCourses((prev) => prev.filter((c) => String(c.id) !== targetId && (c as any).slug !== targetId));
    } catch (e) {
      console.error('Failed to delete course in CourseContext:', e);
      throw e;
    }
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const targetId = String(id);
    const updatesWithTimestamp: Partial<CourseItem> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      const updated = await courseService.updateCourse(targetId, updatesWithTimestamp as any);
      setCourses((prev) => {
        const next = prev.map((c) => {
          const cId = String(c.id);
          const cSlug = String((c as any).slug || '');
          if (
            cId === targetId ||
            cSlug === targetId ||
            (cId === '1' && targetId === 'course_linux_101') ||
            (cId === 'course_linux_101' && targetId === '1') ||
            (cId === 'git-github-mastery' && targetId === 'git-github-mastery-course-id') ||
            (cId === 'git-github-mastery-course-id' && targetId === 'git-github-mastery')
          ) {
            return {
              ...c,
              ...updated,
              status: updated.status?.toLowerCase() === 'published' ? 'Published' : 'Draft',
            } as CourseItem;
          }
          return c;
        });
        localStorage.setItem('shaivika_courses_data', JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error('Failed to update course in CourseContext:', e);
      throw e;
    }
  };

  const getCourseModules = useCallback(async (idOrSlug: number | string): Promise<ModuleItem[]> => {
    const target = String(idOrSlug).toLowerCase().trim();
    if (!target) return [];

    const existingCourse = getCourseById(target);

    // 1. Check existing cached course modules first as the source of truth for user edits
    if (existingCourse?.modules && existingCourse.modules.length > 0) {
      console.log(`[COURSE-CONTEXT-TRACE] 10. getCourseModules: loaded ${existingCourse.modules.length} modules from CourseContext state for "${target}"`);
      return existingCourse.modules;
    }

    // 2. Check backend API modules
    try {
      const targetId = existingCourse ? String(existingCourse.id) : target;
      const apiMods = await courseService.getCourseModules(targetId);
      if (apiMods && apiMods.length > 0) {
        console.log(`[COURSE-CONTEXT-TRACE] 10. getCourseModules: loaded ${apiMods.length} modules from database/API for "${target}"`);
        if (existingCourse) {
          updateCourse(existingCourse.id, { modules: apiMods });
        }
        return apiMods;
      }
    } catch (e) {}

    // 3. Check static authoritative full module datasets ONLY if no modules exist in state
    try {
      const staticMods = await loadStaticCourseModules(target);
      if (staticMods && staticMods.length > 0) {
        console.log(`[COURSE-CONTEXT-TRACE] 10. getCourseModules: fallback to static JSON for uninitialized course "${target}"`);
        if (!existingCourse?.modules || existingCourse.modules.length === 0) {
          if (existingCourse) {
            updateCourse(existingCourse.id, { modules: staticMods });
          }
          return staticMods;
        }
      }
    } catch (e) {}

    return [];
  }, [getCourseById, updateCourse]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        publishedCourses,
        addCourse,
        toggleCourseStatus,
        deleteCourse,
        getCourseById,
        getCourseModules,
        refreshCourses,
        updateCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
