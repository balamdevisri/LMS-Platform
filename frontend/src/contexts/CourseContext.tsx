import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

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
}

interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
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
    id: 1,
    title: 'Introduction to Linux & System Administration',
    subtitle: '🐧 Linux Essentials',
    instructor: 'Bhanu Prakash Achari',
    role: 'Linux Systems Architect & AI Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviews: 1450,
    students: '28,900',
    duration: '32 hrs',
    category: 'Linux & Systems',
    level: 'Beginner to Advanced',
    badge: 'Featured Track',
    tracks: '4 Modules (32 Hours)',
    status: 'Published',
    thumbnail: '/assets/images/linux_course_thumbnail.png',
    description: `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems. This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands. By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    syllabus: [
      'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
      'Module 2: File System Hierarchy, Permissions & Ownership',
      'Module 3: Process Management, Systemd Services & Cron Jobs',
      'Module 4: Bash Scripting, Networking & Security Hardening',
    ],
  },
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved) as CourseItem[];
        // Auto-heal missing default modules or missing content fields
        const merged = initialDefaultCourses.map((def) => {
          const match = parsed.find((p) => String(p.id) === String(def.id));
          if (!match) return def;
          // Auto-heal modules if missing or significantly different count
          if ((!match.modules || match.modules.length < def.modules!.length) && def.modules && def.modules.length > 0) {
            return enrichCourseMockContent({ ...match, modules: def.modules });
          }
          return enrichCourseMockContent(match);
        });

        // Retain other custom admin courses
        parsed.forEach((p) => {
          if (!merged.find((m) => String(m.id) === String(p.id))) {
            merged.push(enrichCourseMockContent(p));
          }
        });

        return merged;
      } catch (e) {
        console.warn('LocalStorage courses parse warning:', e);
      }
    }
    return initialDefaultCourses;
  });

  // Sync with Firestore if available
  useEffect(() => {
    const syncFirestoreCourses = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        if (!querySnapshot.empty) {
          const loaded: CourseItem[] = [];
          querySnapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as CourseItem);
          });
          setCourses(loaded);
          localStorage.setItem('shaivika_courses_data', JSON.stringify(loaded));
        }
      } catch (err) {
        console.warn('Firestore courses fetch notice:', err);
      }
    };
    syncFirestoreCourses();
  }, []);

  // Update LocalStorage whenever courses state changes
  useEffect(() => {
    localStorage.setItem('shaivika_courses_data', JSON.stringify(courses));
  }, [courses]);

  const publishedCourses = courses.filter((c) => c.status?.toLowerCase() === 'published');

  const addCourse = async (coursePayload: Partial<CourseItem>) => {
    const newId = Date.now();
    const created: CourseItem = {
      id: newId,
      title: coursePayload.title || 'Untitled Technical Course',
      subtitle: coursePayload.subtitle || '⚡ Enterprise Track',
      instructor: coursePayload.instructor || 'Bhanu Prakash Achari',
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
      createdAt: new Date().toISOString(),
    };

    const enriched = enrichCourseMockContent(created);
    const updated = [enriched, ...courses];
    setCourses(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'courses', String(newId)), created);
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }
    }
  };

  const toggleCourseStatus = async (id: number | string) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(id)) {
        const nextStatus: 'Published' | 'Draft' = c.status === 'Published' ? 'Draft' : 'Published';
        return { ...c, status: nextStatus };
      }
      return c;
    });

    setCourses(updated);

    try {
      const target = updated.find((c) => String(c.id) === String(id));
      if (target) {
        await CourseService.updateCourse(id, { status: target.status });
      }
    } catch (e) {
      console.warn('Firestore toggle status notice:', e);
    }
  };

  const deleteCourse = async (id: number | string) => {
    const updated = courses.filter((c) => String(c.id) !== String(id));
    setCourses(updated);

    try {
      await CourseService.deleteCourse(id);
    } catch (e) {
      console.warn('Firestore delete course notice:', e);
    }
  };

  const getCourseById = (id: number | string): CourseItem | undefined => {
    return courses.find((c) => String(c.id) === String(id)) || initialDefaultCourses[0];
  };

  const updateCourse = async (id: number | string, updates: Partial<CourseItem>) => {
    const updated = courses.map((c) => {
      if (String(c.id) === String(id)) {
        return { ...c, ...updates };
      }
      return c;
    });
    setCourses(updated);

    if (db) {
      try {
        await updateDoc(doc(db, 'courses', String(id)), updates);
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
