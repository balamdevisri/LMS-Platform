import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { gitCourseModules } from '@/data/gitCourseFullData';
import { courseService } from '@/services/courseService';

export type LearningUnitType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  marks?: number;
}

export interface LearningUnitItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: LearningUnitType;
  videoUrl?: string;
  readingContent?: string;
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
}

export interface TopicItem {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  learningUnits: LearningUnitItem[];
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: TopicItem[];
}

export interface CourseItem {
  id: number | string;
  title: string;
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
  status: 'Published' | 'Draft';
  description: string;
  syllabus: string[];
  modules?: ModuleItem[];
  createdAt?: string;
}



interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  refreshCourses: () => Promise<void>;
  updateCourse: (id: number | string, updates: Partial<CourseItem>) => Promise<void>;
}

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
    subtitle: '🐧 Linux Essentials',
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
    tracks: '4 Modules (32 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.png',
    description: `Welcome to Linux Systems & Administration Mastery! Linux powers modern cloud infrastructure, supercomputers, and enterprise AI clusters. In this comprehensive production-ready track, you will explore Linux Kernel mechanics, master file system hierarchy standards (FHS), manage systemd background daemons, automate workflows via Bash scripts, and harden network security using SSH and host firewalls.`,
    syllabus: [
      'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
      'Module 2: File System Hierarchy, Permissions & Ownership',
      'Module 3: Process Management, Systemd Services & Cron Jobs',
      'Module 4: Bash Scripting, Networking & Security Hardening',
    ],
    createdAt: new Date('2026-07-01').toISOString(),
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
        description: 'Learn the architectural layers of Linux operating system and master basic command-line interface fundamentals.',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-1-1',
            title: 'Introduction to Unix & Linux Architecture',
            description: 'Explore hardware interfaces, the Linux Kernel, and various Shell distributions.',
            estimatedDuration: '45 mins',
            learningUnits: [
              { id: 'unit-1-1-1', title: 'History of Unix and Linux OS', description: 'Brief introduction to Linus Torvalds and Unix history.', duration: '15 mins', type: 'Video' },
              { id: 'unit-1-1-2', title: 'Kernel vs User Space Architecture', description: 'Deep dive reading on system call mechanisms.', duration: '20 mins', type: 'Reading' },
              { id: 'unit-1-1-3', title: 'Architecture Basic Review', description: 'Assess comprehension of the kernel layers.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-1-2',
            title: 'Understanding Shell & Command Anatomy',
            description: 'Deconstruct a command into executable name, option flags, and arguments.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-1-2-1', title: 'Deconstructing commands (ls, cd, pwd)', description: 'Video deconstruction of flags.', duration: '12 mins', type: 'Video' },
              { id: 'unit-1-2-2', title: 'Command Options & Arguments Lab', description: 'Hands-on assignment creating files using commands.', duration: '30 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-1-3',
            title: 'Navigating Files & Directories',
            description: 'Print working directory and traverse folders with cd, ls, pwd, and tree.',
            estimatedDuration: '35 mins',
            learningUnits: [
              { id: 'unit-1-3-1', title: 'Standard traversal patterns', description: 'Learn cd absolute vs relative paths.', duration: '10 mins', type: 'Video' },
              { id: 'unit-1-3-2', title: 'Traversing the Citadel Directory Tree', description: 'Practice traversing files.', duration: '25 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-1-4',
            title: 'Creating, Copying & Deleting Files',
            description: 'Manipulate filesystem items using mkdir, touch, cp, mv, and rm.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-1-4-1', title: 'File manipulation essentials', description: 'Overview of touch, mkdir, cp, mv, rm.', duration: '18 mins', type: 'Video' },
              { id: 'unit-1-4-2', title: 'File Operations Practice Quiz', description: 'Quick check on cp recursive options.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-1-5',
            title: 'Terminal Hands-on Practice',
            description: 'Practice live commands inside simulated terminal environments.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-1-5-1', title: 'CLI terminal challenge', description: 'Execute final challenge in bash terminal.', duration: '40 mins', type: 'Assignment' }
            ]
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: File System Hierarchy, Permissions & Ownership',
        description: 'Understand file system layouts, standard directory structures, permissions, and managing files/directory access.',
        duration: '8 hours',
        topics: [
          {
            id: 'topic-2-1',
            title: 'Linux Directory Hierarchy Standard (FHS)',
            description: 'Understand standard directories like /etc, /bin, /var, and /usr.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-2-1-1', title: 'FHS Directory Map walkthrough', description: 'Explore standard directories.', duration: '12 mins', type: 'Video' },
              { id: 'unit-2-1-2', title: 'Directories Matching Quiz', description: 'Match directories to description.', duration: '10 mins', type: 'Quiz' }
            ]
          },
          {
            id: 'topic-2-2',
            title: 'File Permissions (chmod, chown, octal)',
            description: 'Learn numeric permission codes and access badges: Read, Write, and Execute.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-2-2-1', title: 'Octal permission logic (755 vs 600)', description: 'Video lesson explaining permissions math.', duration: '20 mins', type: 'Video' },
              { id: 'unit-2-2-2', title: 'Permissions Assignment', description: 'Modify private key files to chmod 600.', duration: '20 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-2-3',
            title: 'User & Group Management',
            description: 'Create user accounts, groups, assign roles, and use sudo permissions.',
            estimatedDuration: '30 mins',
            learningUnits: [
              { id: 'unit-2-3-1', title: 'Creating Operative accounts (useradd)', description: 'Learn administrative control commands.', duration: '15 mins', type: 'Video' }
            ]
          },
          {
            id: 'topic-2-4',
            title: 'Text Search & Inspection (cat, grep, tail)',
            description: 'Search log files, output content, and monitor files in real-time.',
            estimatedDuration: '40 mins',
            learningUnits: [
              { id: 'unit-2-4-1', title: 'Deep Log Scanning with Grep and Tail', description: 'Monitor logs in real-time.', duration: '25 mins', type: 'Video' },
              { id: 'unit-2-4-2', title: 'Search & Inspection Assessment', description: 'Find error strings in access logs.', duration: '35 mins', type: 'Assignment' }
            ]
          },
          {
            id: 'topic-2-5',
            title: 'Module 2 Assessment',
            description: 'Test knowledge of file structures, octal permissions, and user permissions.',
            estimatedDuration: '25 mins',
            learningUnits: [
              { id: 'unit-2-5-1', title: 'Module 2 Final Exam', description: '10-question evaluation on files, permissions, and users.', duration: '25 mins', type: 'Quiz' }
            ]
          }
        ]
      }
    ]
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
    tracks: '8 Modules (15 Hours)',
    status: 'Published',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80',
    description: 'Transform your development velocity by mastering Git and GitHub. Learn version control, branching, PR review workflows, GitHub Actions, CI/CD, and enterprise release management patterns.',
    thumbnail: '/assets/images/github_course_banner.png',
    description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
    syllabus: [
      'Module 1: Introduction to Git',
      'Module 2: Git Fundamentals',
      'Module 3: Branches',
      'Module 4: GitHub',
      'Module 5: Collaboration',
      'Module 6: Advanced Git',
      'Module 7: GitHub Actions',
      'Module 8: Enterprise Git Workflow',
    ],
    modules: gitCourseModules
  }
];

const initialDefaultCourses = initialDefaultCoursesRaw.map(enrichCourseMockContent);
const sanitizeCourseList = (list: CourseItem[]): CourseItem[] => {
  const map = new Map<string, CourseItem>();
  list.forEach((c) => {
    const title = (c.title || '').toLowerCase();
    if (
      title.includes('linux systems') ||
      title.includes('introduction to linux') ||
      String(c.id) === '1' ||
      String(c.id) === 'course_linux_101'
    ) {
      const key = 'course_linux_101';
      const updatedItem: CourseItem = {
        ...c,
        id: 'course_linux_101',
        title: 'Linux Systems & Administration Mastery',
        subtitle: '🐧 Linux Essentials',
        thumbnail: c.thumbnail || '/assets/images/linux_course_thumbnail.png',
      };
      map.set(key, updatedItem);
    } else if (
      title.includes('git & github') ||
      title.includes('git and github') ||
      String(c.id) === 'git-github-mastery' ||
      String(c.id) === 'git-github-mastery-course-id'
    ) {
      const key = 'git-github-mastery';
      const updatedItem: CourseItem = {
        ...c,
        id: 'git-github-mastery',
        title: 'Git & GitHub Mastery',
        subtitle: '⚡ Git & GitHub Mastery',
        thumbnail: '/assets/images/github_course_banner.png',
      };
      map.set(key, updatedItem);
    } else {
      map.set(String(c.id), c);
    }
  });

  if (!map.has('course_linux_101')) {
    map.set('course_linux_101', initialDefaultCourses[0]);
  }
  if (!map.has('git-github-mastery')) {
    map.set('git-github-mastery', initialDefaultCourses[1]);
  }

  return Array.from(map.values());
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        const normalizedParsed = parsed.map((c: any) => {
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

        // Auto-heal missing default modules or missing content fields
        const merged = initialDefaultCourses.map((def) => {
          const match = normalizedParsed.find((p) => String(p.id) === String(def.id));
          if (!match) return def;
          // Auto-heal modules if missing or significantly different count
          if ((!match.modules || match.modules.length < def.modules!.length) && def.modules && def.modules.length > 0) {
            return enrichCourseMockContent({ ...match, modules: def.modules });
          }
          return enrichCourseMockContent(match);
        });

        // Retain other custom admin courses
        normalizedParsed.forEach((p) => {
          if (!merged.find((m) => String(m.id) === String(p.id))) {
            merged.push(enrichCourseMockContent(p));
          }
        });

        return merged;
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((c: any) => {
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
          const sanitized = sanitizeCourseList(mapped);
          localStorage.setItem('shaivika_courses_data', JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning:', e);
      }
    }
    return initialDefaultCourses;
  });

  const refreshCourses = async () => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    let localList = initialDefaultCourses;
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((c: any) => {
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
          localList = sanitizeCourseList(mapped);
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning in refreshCourses:', e);
      }
    }
    
    setCourses(localList);

    if (!db) return;
    try {
      const loadedResult = await courseService.getCourses();
      const loaded = loadedResult.courses;
      if (loaded && loaded.length > 0) {
        const normalized = loaded.map((c: any) => {
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

        const merged = sanitizeCourseList([...localList, ...normalized]);
        setCourses(merged);
        localStorage.setItem('shaivika_courses_data', JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Firestore courses fetch notice in refreshCourses:', err);
    }
  };

  // Sync with Firestore if available
  useEffect(() => {
    refreshCourses();
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status === 'Published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    const newId = Date.now();
    const created: CourseItem = {
      id: newId,
      title: coursePayload.title || 'Untitled Technical Course',
      subtitle: coursePayload.subtitle || '⚡ Enterprise Track',
      instructor: coursePayload.instructor || 'KaizenQ Team',
      role: coursePayload.role || 'Senior Technical Instructor',
      avatar: coursePayload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviews: 1,
      students: '0',
      duration: coursePayload.duration || '20 hrs',
      category: coursePayload.category || 'Linux & Systems',
      level: coursePayload.level || 'Beginner to Advanced',
      badge: 'New Track',
      status: coursePayload.status || 'Published',
      thumbnail: coursePayload.thumbnail || '/assets/images/linux_course_thumbnail.png',
      description: coursePayload.description || 'Enterprise technical course with hands-on labs and automated AI evaluations.',
      syllabus: coursePayload.syllabus || [
        'Module 1: Fundamental Concepts & Environment Setup',
        'Module 2: Core Command Line & Configuration',
        'Module 3: Advanced Optimization & Security',
        'Module 4: Final Capstone Assessment',
      ],
    };

    const enriched = enrichCourseMockContent(created);
    const updated = [enriched, ...courses];
    setCourses(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'courses', String(newId)), enriched);
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }
    }
  };

  const toggleCourseStatus = async (id: number | string) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.map((c) => {
      if (String(c.id) === targetId) {
        const nextStatus: 'Published' | 'Draft' = c.status === 'Published' ? 'Draft' : 'Published';
        return { ...c, status: nextStatus };
      }
      return c;
    });

    setCourses(updated);

    if (db) {
      try {
        const target = updated.find((c) => String(c.id) === targetId);
        if (target) {
          await updateDoc(doc(db, 'courses', String(targetId)), { status: target.status });
        }
      } catch (e) {
        console.warn('Firestore updateDoc notice:', e);
      }
    }
  };

  const deleteCourse = async (id: number | string) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.filter((c) => String(c.id) !== targetId);
    setCourses(updated);
  };

  const getCourseById = (id: number | string): CourseItem | undefined => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    return courses.find((c) => String(c.id) === targetId) || initialDefaultCourses[0];
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const targetId = String(id) === 'course_linux_101' ? '1' : String(id);
    const updated = courses.map((c) => {
      if (String(c.id) === targetId) {
        return { ...c, ...updates };
      }
      return c;
    });
    setCourses(updated);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', String(targetId)), updates);
      } catch (e) {
        console.warn('Firestore updateCourse notice:', e);
      }
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        publishedCourses,
        addCourse,
        toggleCourseStatus,
        deleteCourse,
        getCourseById,
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
