import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { toast } from 'sonner';
import { CourseDetailsPage } from '@/components/learning/CourseDetailsPage';
import { SEOHead } from '@/components/seo/SEOHead';
import { CourseSchema as StructuredCourseSchema } from '@/components/seo/StructuredData';
import { LottieLoader } from '@/components/common/LottieLoader';

// Lazy loader helper
const lazyComponent = <T extends Record<string, any>, K extends keyof T>(
  importFn: () => Promise<T>,
  name: K
) => {
  const LazyComp = lazy(async () => {
    const mod = await importFn();
    return { default: mod[name] };
  });
  const ComponentWithSuspense = (props: any) => (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] w-full py-12">
          <LottieLoader size="lg" message="Loading course curriculum..." />
        </div>
      }
    >
      <LazyComp {...props} />
    </Suspense>
  );
  return ComponentWithSuspense;
};

const CourseLearningLayout = lazyComponent(() => import('@/components/learning/CourseLearningLayout'), 'CourseLearningLayout');
const CheckoutModal = lazyComponent(() => import('@/components/courses/CheckoutModal'), 'CheckoutModal');

const mapCourseModulesToPlayerModules = (modules?: any[]): any[] => {
  if (!modules) return [];
  return modules.map((m) => {
    let lessonsList: any[] = [];
    if (m.lessons && Array.isArray(m.lessons) && m.lessons.length > 0) {
      lessonsList = m.lessons;
    } else if (m.topics && Array.isArray(m.topics)) {
      m.topics.forEach((t: any) => {
        if (t.learningUnits && Array.isArray(t.learningUnits)) {
          t.learningUnits.forEach((u: any) => {
            lessonsList.push(u);
          });
        }
      });
    }

    // Deduplicate lessons by ID
    const seenLessonIds = new Set<string>();
    const uniqueLessonsList: any[] = [];
    lessonsList.forEach((l: any) => {
      const lId = String(l.id || `lesson-${Date.now()}-${Math.random()}`);
      if (!seenLessonIds.has(lId)) {
        seenLessonIds.add(lId);
        uniqueLessonsList.push(l);
      }
    });

    const enrichedLessons = uniqueLessonsList.map((l: any) => {
      const lId = l.id || `lesson-${Date.now()}-${Math.random()}`;
      const lTitle = l.title || 'Untitled Lesson';
      const lContent = l.readingContent || l.content || l.description || 'Welcome to this lesson.';
      const lDuration = l.duration || '15 mins';
      const lType = l.type?.toLowerCase() || 'reading';
      const lResources = l.resources || [];
      const lQuiz = l.quiz || (l.quizQuestions ? {
        difficulty: l.quizDifficulty || 'Medium',
        passingScore: l.quizPassingScore || 70,
        timer: l.quizTimer || 10,
        questions: l.quizQuestions
      } : null);

      return {
        ...l,
        id: lId,
        title: lTitle,
        content: typeof lContent === 'string' ? lContent : JSON.stringify(lContent),
        duration: lDuration,
        type: lType,
        resources: lResources,
        quiz: lQuiz,
      };
    });

    return {
      id: m.id,
      title: m.title,
      duration: m.duration || '4 hours',
      lessons: enrichedLessons,
    };
  });
};

import { CourseActionConfirmModal, type CourseActionType } from '@/components/courses/CourseActionConfirmModal';

export const CourseView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentAvatar = userProfile?.photoURL || user?.photoURL || undefined;
  const studentName = (userProfile?.name && userProfile.name !== 'Student User' ? userProfile.name : '') || userProfile?.fullName || user?.displayName || userProfile?.githubUsername || (user?.email ? user.email.split('@')[0] : 'Learner');
  const idOrSlug = (courseId || slug || '').trim();
  const { getCourseById, getCourseModules, refreshCourses } = useCourses();
  const dynamicCourse = getCourseById(idOrSlug);

  // Validation: Mismatched course IDs cannot occur, and fallback is removed
  const isValidCourse = dynamicCourse && (
    String(dynamicCourse.id).toLowerCase().trim() === idOrSlug.toLowerCase() ||
    String((dynamicCourse as any).slug || '').toLowerCase().trim() === idOrSlug.toLowerCase() ||
    (String(dynamicCourse.id) === 'course_linux_101' && idOrSlug === '1') ||
    (String(dynamicCourse.id) === '1' && idOrSlug === 'course_linux_101')
  );

  const targetCourseId = String(dynamicCourse?.id || '');
  const userId = user?.uid || 'default_student';

  const [courseModules, setCourseModules] = useState<any[]>(() => {
    return dynamicCourse?.modules && dynamicCourse.modules.length > 0 ? dynamicCourse.modules : [];
  });
  const [isLoadingModules, setIsLoadingModules] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!dynamicCourse) return;

    if (dynamicCourse.modules && dynamicCourse.modules.length > 0) {
      setCourseModules(dynamicCourse.modules);
    } else {
      setIsLoadingModules(true);
    }

    const courseTarget = String(dynamicCourse.id || idOrSlug);

    getCourseModules(courseTarget, true)
      .then((mods) => {
        if (isMounted && mods && mods.length > 0) {
          setCourseModules(mods);
        }
      })
      .catch((err) => {
        console.warn('Failed to load course modules:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingModules(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dynamicCourse?.id, idOrSlug, getCourseModules]);

  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    return targetCourseId ? courseService.isCourseEnrolled(targetCourseId, userId) : false;
  });

  const [isLearningMode, setIsLearningMode] = useState(() => searchParams.get('mode') === 'learn');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [confirmActionType, setConfirmActionType] = useState<CourseActionType>('enroll');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, isLearningMode]);

  useEffect(() => {
    const handleSync = () => {
      refreshCourses();
    };
    window.addEventListener('shaivika_courses_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('shaivika_courses_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshCourses]);

  useEffect(() => {
    if (targetCourseId) {
      const enrolled = courseService.isCourseEnrolled(targetCourseId, userId);
      setIsEnrolled(enrolled);
    }
  }, [targetCourseId, userId]);

  const handleEnrollClick = () => {
    if (!user) {
      toast.warning('🔒 Please sign in as a student to enroll in this course!');
      navigate('/auth/login', { state: { from: location } });
      return;
    }
    const currentPrice = Number((dynamicCourse as any)?.price ?? 0);
    if (currentPrice > 0) {
      setCheckoutModalOpen(true);
    } else {
      setConfirmActionType('enroll');
      setConfirmModalOpen(true);
    }
  };

  const handleEnrollSuccess = (_enrollmentRecord?: any) => {
    setIsEnrolled(true);
    // Sync local store
    if (dynamicCourse) {
      courseService.enrollCourse(targetCourseId, userId, {
        email: user?.email || undefined,
        name: studentName,
        courseTitle: dynamicCourse.title || 'Course Track',
      });
    }
  };

  const handleStartLearning = () => {
    if (!user) {
      toast.warning('🔒 Please sign in as a student to start learning this course!');
      navigate('/auth/login', { state: { from: location } });
      return;
    }
    setConfirmActionType('enter');
    setConfirmModalOpen(true);
  };

  const handleConfirmModalAction = () => {
    setConfirmModalOpen(false);
    if (confirmActionType === 'enroll') {
      handleEnrollSuccess();
      toast.success(`🎉 Enrolled successfully in "${dynamicCourse?.title || 'this course'}"! All modules unlocked.`);
    } else if (confirmActionType === 'enter') {
      if (!isEnrolled) {
        handleEnrollSuccess();
      }
      setIsLearningMode(true);
      setSearchParams({ mode: 'learn' });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleBackToDetails = () => {
    setIsLearningMode(false);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isValidCourse || !dynamicCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-slate-50 font-['Sora']">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Course Not Found</h2>
        <p className="text-slate-600 mb-6 font-medium">The requested course could not be located on our platform.</p>
        <button onClick={() => navigate('/courses')} className="px-6 py-3 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/25">
          Browse All Courses
        </button>
      </div>
    );
  }

  // Get course-specific introText and outcomes based on course title or id
  const getCourseMeta = (course: any) => {
    const titleLower = (course.title || '').toLowerCase();
    const idLower = String(course.id || '').toLowerCase();
    
    if (idLower === 'course_linux_101' || idLower === '1' || titleLower.includes('linux')) {
      return {
        introText: [
          `Welcome to Linux Systems Mastery! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems.`,
          `This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands.`,
          `By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
        ],
        outcomes: [
          'Master essential Linux CLI terminal navigation commands (cd, ls, pwd, find)',
          'Understand File System Hierarchy Standard (FHS) and directory structure',
          'Manage user accounts, groups, file permissions (chmod, chown) & umask',
          'Monitor processes, manage background jobs & configure Systemd services',
          'Write automated Bash shell scripts with variables, conditionals & loops',
          'Configure SSH hardening, Linux Firewall (UFW) and basic networking tools',
        ]
      };
    }
    
    if (idLower === 'git-github-mastery' || titleLower.includes('git') || titleLower.includes('github')) {
      return {
        introText: [
          `Welcome to Git & GitHub Mastery! Version control is a foundational skill for all developers. This course will take you from Git basics to advanced pipelines.`,
          `You will learn local repository initialization, stage-commit lifecycles, remote repository synchronization, pull requests, code reviews, rebasing, and automated pipelines using GitHub Actions.`,
          `By the end of this course, you will have a production-ready CI/CD setup and will earn your certification.`,
        ],
        outcomes: [
          'Configure Git globally and link local repositories to GitHub securely',
          'Create and merge branches, perform Pull Requests, and do collaborative code reviews',
          'Resolve complex merge conflicts and leverage stashing, rebasing, and cherry-picking',
          'Write custom GitHub Actions pipelines for automated testing & Netlify/Vercel deployments',
        ]
      };
    }
    
    if (idLower === 'database-management-system' || titleLower.includes('database') || titleLower.includes('dbms')) {
      return {
        introText: [
          "Welcome to Database Management System (DBMS)! Databases are the core component of modern software systems, powering everything from small mobile apps to massive cloud services and enterprise systems.",
          "This course is designed to take you from a complete beginner to an advanced database professional. You will learn relational database concepts, SQL fundamentals, database normalization, indexing, transaction management, and administrative best practices.",
          "By the end of this course, you will have a solid understanding of database design, be able to write complex SQL queries, optimize database performance, and understand how to manage production databases safely."
        ],
        outcomes: [
          "Master relational database concepts, schemas, tables, and constraints",
          "Write complex SQL queries including JOINs, subqueries, aggregations, and CTEs",
          "Understand database normalization (1NF, 2NF, 3NF) and ER diagram design",
          "Implement database indexing, transactions (ACID properties), and concurrency control",
          "Learn database administration basics, backup/restore procedures, and security",
          "Optimize slow queries and understand database design patterns"
        ]
      };
    }
    
    if (idLower === 'react-js-complete-course' || titleLower.includes('react')) {
      return {
        introText: [
          "Welcome to React JS Complete Course! React is a popular and powerful open-source JavaScript library developed by Meta (Facebook) for building dynamic, fast, and reusable user interfaces.",
          "This comprehensive course covers everything from React basics to advanced state management and routing. You will learn setting up Vite environments, JSX rules, components, props, state, event handling, routing with React Router, API fetching with Axios, and styling frameworks like Tailwind CSS.",
          "By the end of this course, you will build 5 real-world applications and gain practical interview preparation knowledge."
        ],
        outcomes: [
          "Understand Component-Based Architecture and the Virtual DOM rendering cycle",
          "Use JSX expressions, fragments, and conditional rendering operators",
          "Manage local state with useState and leverage useEffect for lifecycle hooks",
          "Coordinate routing using BrowserRouter, Routes, Route, and useNavigate",
          "Perform remote API fetches and integration using Axios",
          "Implement global state management via the Context API and Redux Toolkit"
        ]
      };
    }

    if (idLower === 'c-programming' || idLower.includes('c-prog') || titleLower.includes('c programming') || titleLower === 'c') {
      return {
        subtitle: 'Programming Fundamentals',
        introText: [
          "Build a strong foundation in C programming through structured lessons, practical examples, and hands-on exercises.",
          "Master memory management, pointers, control flow, functions, dynamic allocation, and low-level system programming essentials."
        ],
        outcomes: [
          "Understand C syntax, data types, operators, and memory representation",
          "Master control flow structures, conditional branches, and iterative loops",
          "Implement modular programs using user-defined functions and recursion",
          "Work with arrays, strings, multi-dimensional structures, and buffers",
          "Understand pointer arithmetic and dynamic memory allocation (malloc/free)",
          "Perform file I/O operations and write robust command-line applications"
        ]
      };
    }

    if (idLower.includes('javascript') || titleLower === 'javascript' || titleLower.includes('javascript')) {
      return {
        subtitle: 'Modern Web Scripting',
        introText: [
          "Master modern JavaScript (ES6+) from fundamental syntax and data structures to asynchronous programming and browser APIs.",
          "Build interactive web applications and gain a comprehensive understanding of the event loop, closures, and object prototypes."
        ],
        outcomes: [
          "Master core JavaScript syntax, types, operators, and functions",
          "Understand closures, scope, prototypes, and ES6+ features",
          "Manipulate the DOM dynamically and handle browser events",
          "Work with Promises, async/await, and REST API integration"
        ]
      };
    }

    if (idLower.includes('node') || titleLower === 'node.js' || titleLower.includes('node.js') || titleLower.includes('nodejs')) {
      return {
        subtitle: 'Backend Development & REST APIs',
        introText: [
          "Build scalable backend services and RESTful APIs using Node.js, Express, and database integrations.",
          "Master authentication with JWT, middleware architecture, database queries, and production backend patterns."
        ],
        outcomes: [
          "Understand the Node.js runtime, Event Loop, and non-blocking I/O",
          "Design and build RESTful APIs using Express.js and middleware",
          "Implement secure authentication and authorization with JWT",
          "Integrate SQL and NoSQL databases and deploy production backends"
        ]
      };
    }

    if (idLower.includes('data-structures') || idLower.includes('dsa') || titleLower.includes('data structures') || titleLower.includes('algorithms')) {
      return {
        subtitle: 'Problem Solving & Technical Interviews',
        introText: [
          "Master essential data structures and algorithms to solve complex computational problems and ace technical coding interviews.",
          "Learn time and space complexity analysis, linear and non-linear data structures, searching, sorting, and dynamic programming."
        ],
        outcomes: [
          "Analyze algorithms using Big-O time and space complexity",
          "Implement Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs",
          "Master sorting, searching, recursion, and backtracking techniques",
          "Apply Dynamic Programming and Greedy algorithms to complex challenges"
        ]
      };
    }

    if (idLower.includes('web-development') || titleLower.includes('web development')) {
      return {
        subtitle: 'Frontend Foundations & Responsive Design',
        introText: [
          "Learn HTML5, CSS3, and JavaScript from scratch to build responsive, accessible, and modern web applications.",
          "Explore Flexbox, CSS Grid, animations, web APIs, and deployment workflows for production web applications."
        ],
        outcomes: [
          "Structure accessible and semantic web pages using HTML5",
          "Style responsive user interfaces with CSS3, Flexbox, and CSS Grid",
          "Add dynamic interactive features using modern JavaScript",
          "Deploy real-world web projects to modern hosting platforms"
        ]
      };
    }
    
    // Generic fallback for custom admin courses
    return {
      introText: (course as any).introText || [course.description || (course as any).shortDescription || 'Welcome to this technical training course track.'],
      outcomes: (course as any).outcomes || (course.learningOutcomes && course.learningOutcomes.length > 0 ? course.learningOutcomes : [
        'Master core course concepts',
        'Build hands-on technical skills',
        'Apply concepts to real-world scenarios'
      ])
    };
  };

  const meta = getCourseMeta(dynamicCourse);

  const cAny = dynamicCourse as any;
  const effectiveModules = (courseModules && courseModules.length > 0)
    ? courseModules
    : (dynamicCourse?.modules && dynamicCourse.modules.length > 0)
    ? dynamicCourse.modules
    : [];

  const activeCourseData = {
    ...dynamicCourse,
    id: dynamicCourse.id,
    title: dynamicCourse.title,
    subtitle: dynamicCourse.subtitle || cAny.shortDescription || '',
    instructor: typeof cAny.instructor === 'object' && cAny.instructor !== null
      ? (cAny.instructor.name || 'KaizenQ Team')
      : (cAny.instructor || 'KaizenQ Team'),
    role: dynamicCourse.role || (typeof cAny.instructor === 'object' && cAny.instructor?.role) || 'Senior Technical Instructor',
    avatar: dynamicCourse.avatar || (typeof cAny.instructor === 'object' && cAny.instructor?.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: dynamicCourse.rating || 5.0,
    reviews: dynamicCourse.reviews || cAny.ratingCount || 120,
    students: dynamicCourse.students || String(cAny.enrollmentCount || 0),
    duration: dynamicCourse.duration || '20 hrs',
    category: dynamicCourse.category || 'Technical Training',
    level: dynamicCourse.level || 'Beginner to Advanced',
    thumbnail: dynamicCourse.thumbnail || '/assets/images/linux_course_thumbnail.webp',
    introText: meta.introText,
    outcomes: meta.outcomes,
    modules: mapCourseModulesToPlayerModules(effectiveModules)
  };

  if (isLearningMode) {
    return (
      <CourseLearningLayout
        courseTitle={activeCourseData.title}
        courseId={activeCourseData.id}
        modules={activeCourseData.modules}
        onBackToCourseDetails={handleBackToDetails}
        userAvatar={studentAvatar}
        userName={studentName}
      />
    );
  }

  return (
    <>
      <SEOHead 
        title={activeCourseData.title}
        description={activeCourseData.subtitle || `Learn ${activeCourseData.title} with Kaizen Q.`}
        ogType="course"
        ogImage={activeCourseData.thumbnail}
      />
      <StructuredCourseSchema 
        name={activeCourseData.title}
        description={activeCourseData.subtitle || `Learn ${activeCourseData.title} with Kaizen Q.`}
        url={`https://www.kaizenq.in/course/${activeCourseData.id}`}
      />
      <CourseDetailsPage
        course={activeCourseData}
        isLoadingModules={isLoadingModules}
        onStartLearning={handleStartLearning}
        isEnrolled={isEnrolled}
        onEnroll={handleEnrollClick}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        courses={[
          {
            id: targetCourseId,
            title: activeCourseData.title,
            price: (dynamicCourse as any)?.price ?? 0,
          },
        ]}
        totalPrice={(dynamicCourse as any)?.price ?? 0}
        onSuccess={() => handleEnrollSuccess()}
      />

      <CourseActionConfirmModal
        isOpen={confirmModalOpen}
        actionType={confirmActionType}
        courseTitle={activeCourseData.title}
        courseCategory={activeCourseData.category || 'Engineering Track'}
        modulesCount={Array.isArray(activeCourseData.modules) ? activeCourseData.modules.length : 6}
        lessonsCount={Array.isArray(activeCourseData.modules) ? activeCourseData.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 4), 0) : 24}
        duration={activeCourseData.duration || '6-8 hours'}
        currentProgress={courseService.getCourseProgressPercent(targetCourseId, userId)}
        onConfirm={handleConfirmModalAction}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </>
  );
};
