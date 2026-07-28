import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/firebase';
import { CourseService } from '@/services/course/CourseService';

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
  createdAt?: string;
}



interface CourseContextType {
  courses: CourseItem[];
  publishedCourses: CourseItem[];
  addCourse: (course: Partial<CourseItem>) => Promise<void>;
  toggleCourseStatus: (id: number | string) => Promise<void>;
  deleteCourse: (id: number | string) => Promise<void>;
  getCourseById: (id: number | string) => CourseItem | undefined;
  refreshCourses?: () => Promise<void>;
}

const initialDefaultCourses: CourseItem[] = [
  {
    id: 1,
    title: 'Introduction to Linux & System Administration',
    subtitle: '🐧 Linux Essentials',
    instructor: 'Bhanu Prakash Achari',
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
    description: `Welcome to Linux Essentials! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems. This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands. By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    syllabus: [
      'Module 1: Linux Architecture, Kernel & CLI Fundamentals',
      'Module 2: File System Hierarchy, Permissions & Ownership',
      'Module 3: Process Management, Systemd Services & Cron Jobs',
      'Module 4: Bash Scripting, Networking & Security Hardening',
    ],
    createdAt: new Date('2026-07-01').toISOString(),
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
    duration: '20 Hours',
    category: 'Development Tools',
    level: 'Beginner to Advanced',
    badge: 'New Track',
    tracks: '6 Modules (20 Hours)',
    status: 'Published',
    thumbnail: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80",
    description: 'Learn Git & GitHub from beginner to professional, including version control, branching, pull requests, GitHub Actions, CI/CD, Codespaces, and Copilot.',
    syllabus: [
      'Module 1: Version Control & Git Basics',
      'Module 2: GitHub Foundations',
      'Module 3: Advanced Git',
      'Module 4: Repository Management',
      'Module 5: GitHub Actions',
      'Module 6: Modern GitHub Ecosystem',
    ],
    createdAt: new Date().toISOString(),
  }
];

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    const localSaved = localStorage.getItem('shaivika_courses_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: any) => {
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
          localList = parsed.map((c: any) => {
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
        }
      } catch (e) {
        console.warn('LocalStorage courses parse warning in refreshCourses:', e);
      }
    }
    
    setCourses(localList);

    if (!db) return;
    try {
      const loaded = await CourseService.getCourses();
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

        const merged = [...localList];
        for (const c of normalized) {
          const idx = merged.findIndex(item => String(item.id) === String(c.id));
          if (idx !== -1) {
            merged[idx] = c;
          } else {
            merged.push(c);
          }
        }

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

    const updated = [created, ...courses];
    setCourses(updated);

    try {
      await CourseService.addCourse(created);
    } catch (e) {
      console.warn('Firestore addCourse notice:', e);
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
