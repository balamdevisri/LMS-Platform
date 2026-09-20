import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { toast } from 'sonner';
import { CourseDetailsPage } from '@/components/learning/CourseDetailsPage';
import { SEOHead } from '@/components/seo/SEOHead';
import { CourseSchema as StructuredCourseSchema } from '@/components/seo/StructuredData';
import { LottieLoader } from '@/components/common/LottieLoader';
import { CourseActionConfirmModal, type CourseActionType } from '@/components/courses/CourseActionConfirmModal';
import { getPresentationLessonTitle } from '@/services/courseNormalizer';

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
  if (!modules || !Array.isArray(modules)) return [];
  return modules.filter(Boolean).map((m, mIdx) => {
    let lessonsList: any[] = [];
    if (m.lessons && Array.isArray(m.lessons) && m.lessons.length > 0) {
      lessonsList = m.lessons.filter(Boolean);
    } else if (m.topics && Array.isArray(m.topics)) {
      m.topics.filter(Boolean).forEach((t: any) => {
        if (t.learningUnits && Array.isArray(t.learningUnits)) {
          lessonsList.push(...t.learningUnits.filter(Boolean));
        } else if (t.units && Array.isArray(t.units)) {
          lessonsList.push(...t.units.filter(Boolean));
        } else if (t.lessons && Array.isArray(t.lessons)) {
          lessonsList.push(...t.lessons.filter(Boolean));
        }
      });
    }

    // Deduplicate lessons by ID
    const seenLessonIds = new Set<string>();
    const uniqueLessonsList: any[] = [];
    lessonsList.forEach((l: any) => {
      if (!l) return;
      const lId = String(l.id || `lesson-${Date.now()}-${Math.random()}`);
      if (!seenLessonIds.has(lId)) {
        seenLessonIds.add(lId);
        uniqueLessonsList.push(l);
      }
    });

    const enrichedLessons = uniqueLessonsList.map((l: any, lIdx: number) => {
      const lId = l.id || `lesson-${m.id || 'mod'}-${lIdx + 1}`;
      const rawTitle = l.title || `Lesson ${lIdx + 1}`;
      const lTitle = getPresentationLessonTitle(rawTitle, mIdx + 1, uniqueLessonsList.length);
      const lContent = l.readingContent || l.conceptTheory || l.content || l.description || 'Welcome to this lesson.';
      const lDuration = l.duration || '15 mins';
      const lType = l.type ? String(l.type).toLowerCase() : 'reading';
      const lResources = l.resources || l.resourceLinks || [];
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
        content: typeof lContent === 'string' ? lContent : (typeof lContent === 'object' ? JSON.stringify(lContent) : String(lContent || '')),
        duration: lDuration,
        type: lType,
        resources: lResources,
        quiz: lQuiz,
      };
    });

    return {
      id: m.id || `module-${Date.now()}`,
      title: m.title || 'Course Module',
      duration: m.duration || '4 hours',
      lessons: enrichedLessons,
    };
  });
};

// Get course-specific introText and outcomes based on database data with fallback presets
const getCourseMeta = (course: any) => {
  if (!course) {
    return {
      introText: ['Welcome to this technical training course track.'],
      outcomes: ['Master core course concepts', 'Build hands-on technical skills', 'Apply concepts to real-world scenarios']
    };
  }

  const titleLower = (course.title || '').toLowerCase();
  const idLower = String(course.id || '').toLowerCase();
  let defaultIntro: string[] = ['Welcome to this technical training course track.'];
  let defaultOutcomes: string[] = [
    'Master core course concepts',
    'Build hands-on technical skills',
    'Apply concepts to real-world scenarios'
  ];
  let defaultSubtitle: string | undefined = undefined;
  
  if (idLower === 'course_linux_101' || idLower === '1' || titleLower.includes('linux')) {
    defaultIntro = [
      `Welcome to Linux Systems Mastery! Linux is one of the world's most powerful and widely used operating systems, powering everything from web servers and cloud platforms to Android devices, supercomputers, and embedded systems.`,
      `This course is designed for beginners who want to build a strong foundation in Linux. You will learn how Linux works, how to navigate the terminal, manage files and directories, understand permissions, and perform essential system operations using real-world commands.`,
      `By the end of this course, you'll have the confidence to work efficiently in any Linux environment and be prepared for advanced topics such as shell scripting, DevOps, cloud computing, and cybersecurity.`,
    ];
    defaultOutcomes = [
      'Master essential Linux CLI terminal navigation commands (cd, ls, pwd, find)',
      'Understand File System Hierarchy Standard (FHS) and directory structure',
      'Manage user accounts, groups, file permissions (chmod, chown) & umask',
      'Monitor processes, manage background jobs & configure Systemd services',
      'Write automated Bash shell scripts with variables, conditionals & loops',
      'Configure SSH hardening, Linux Firewall (UFW) and basic networking tools',
    ];
  } else if (idLower === 'git-github-mastery' || titleLower.includes('git') || titleLower.includes('github')) {
    defaultIntro = [
      `Welcome to Git & GitHub Mastery! Version control is a foundational skill for all developers. This course will take you from Git basics to advanced pipelines.`,
      `You will learn local repository initialization, stage-commit lifecycles, remote repository synchronization, pull requests, code reviews, rebasing, and automated pipelines using GitHub Actions.`,
      `By the end of this course, you will have a production-ready CI/CD setup and will earn your certification.`,
    ];
    defaultOutcomes = [
      'Configure Git globally and link local repositories to GitHub securely',
      'Create and merge branches, perform Pull Requests, and do collaborative code reviews',
      'Resolve complex merge conflicts and leverage stashing, rebasing, and cherry-picking',
      'Write custom GitHub Actions pipelines for automated testing & Netlify/Vercel deployments',
    ];
  } else if (idLower === 'database-management-system' || titleLower.includes('database') || titleLower.includes('dbms')) {
    defaultIntro = [
      "Welcome to Database Management System (DBMS)! Databases are the core component of modern software systems, powering everything from small mobile apps to massive cloud services and enterprise systems.",
      "This course is designed to take you from a complete beginner to an advanced database professional. You will learn relational database concepts, SQL fundamentals, database normalization, indexing, transaction management, and administrative best practices.",
      "By the end of this course, you will have a solid understanding of database design, be able to write complex SQL queries, optimize database performance, and understand how to manage production databases safely."
    ];
    defaultOutcomes = [
      "Master relational database concepts, schemas, tables, and constraints",
      "Write complex SQL queries including JOINs, subqueries, aggregations, and CTEs",
      "Understand database normalization (1NF, 2NF, 3NF) and ER diagram design",
      "Implement database indexing, transactions (ACID properties), and concurrency control",
      "Learn database administration basics, backup/restore procedures, and security",
      "Optimize slow queries and understand database design patterns"
    ];
  } else if (idLower === 'react-js-complete-course' || titleLower.includes('react')) {
    defaultIntro = [
      "Welcome to React JS Complete Course! React is a popular and powerful open-source JavaScript library developed by Meta (Facebook) for building dynamic, fast, and reusable user interfaces.",
      "This comprehensive course covers everything from React basics to advanced state management and routing. You will learn setting up Vite environments, JSX rules, components, props, state, event handling, routing with React Router, API fetching with Axios, and styling frameworks like Tailwind CSS.",
      "By the end of this course, you will build 5 real-world applications and gain practical interview preparation knowledge."
    ];
    defaultOutcomes = [
      "Understand Component-Based Architecture and the Virtual DOM rendering cycle",
      "Use JSX expressions, fragments, and conditional rendering operators",
      "Manage local state with useState and leverage useEffect for lifecycle hooks",
      "Coordinate routing using BrowserRouter, Routes, Route, and useNavigate",
      "Perform remote API fetches and integration using Axios",
      "Implement global state management via the Context API and Redux Toolkit"
    ];
  } else if (idLower === 'c-programming' || idLower.includes('c-prog') || titleLower.includes('c programming') || titleLower === 'c') {
    defaultSubtitle = 'Programming Fundamentals';
    defaultIntro = [
      "Build a strong foundation in C programming through structured lessons, practical examples, and hands-on exercises.",
      "Master memory management, pointers, control flow, functions, dynamic allocation, and low-level system programming essentials."
    ];
    defaultOutcomes = [
      "Understand C syntax, data types, operators, and memory representation",
      "Master control flow structures, conditional branches, and iterative loops",
      "Implement modular programs using user-defined functions and recursion",
      "Work with arrays, strings, multi-dimensional structures, and buffers",
      "Understand pointer arithmetic and dynamic memory allocation (malloc/free)",
      "Perform file I/O operations and write robust command-line applications"
    ];
  } else if (idLower.includes('javascript') || titleLower === 'javascript' || titleLower.includes('javascript')) {
    defaultSubtitle = 'Modern Web Scripting';
    defaultIntro = [
      "Master modern JavaScript (ES6+) from fundamental syntax and data structures to asynchronous programming and browser APIs.",
      "Build interactive web applications and gain a comprehensive understanding of the event loop, closures, and object prototypes."
    ];
    defaultOutcomes = [
      "Master core JavaScript syntax, types, operators, and functions",
      "Understand closures, scope, prototypes, and ES6+ features",
      "Manipulate the DOM dynamically and handle browser events",
      "Work with Promises, async/await, and REST API integration"
    ];
  } else if (idLower.includes('node') || titleLower === 'node.js' || titleLower.includes('node.js') || titleLower.includes('nodejs')) {
    defaultSubtitle = 'Backend Development & REST APIs';
    defaultIntro = [
      "Build scalable backend services and RESTful APIs using Node.js, Express, and database integrations.",
      "Master authentication with JWT, middleware architecture, database queries, and production backend patterns."
    ];
    defaultOutcomes = [
      "Understand the Node.js runtime, Event Loop, and non-blocking I/O",
      "Design and build RESTful APIs using Express.js and middleware",
      "Implement secure authentication and authorization with JWT",
      "Integrate SQL and NoSQL databases and deploy production backends"
    ];
  } else if (idLower.includes('data-structures') || idLower.includes('dsa') || titleLower.includes('data structures') || titleLower.includes('algorithms')) {
    defaultSubtitle = 'Problem Solving & Technical Interviews';
    defaultIntro = [
      "Master essential data structures and algorithms to solve complex computational problems and ace technical coding interviews.",
      "Learn time and space complexity analysis, linear and non-linear data structures, searching, sorting, and dynamic programming."
    ];
    defaultOutcomes = [
      "Analyze algorithms using Big-O time and space complexity",
      "Implement Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs",
      "Master sorting, searching, recursion, and backtracking techniques",
      "Apply Dynamic Programming and Greedy algorithms to complex challenges"
    ];
  } else if (idLower.includes('web-development') || titleLower.includes('web development')) {
    defaultSubtitle = 'Frontend Foundations & Responsive Design';
    defaultIntro = [
      "Learn HTML5, CSS3, and JavaScript from scratch to build responsive, accessible, and modern web applications.",
      "Explore Flexbox, CSS Grid, animations, web APIs, and deployment workflows for production web applications."
    ];
    defaultOutcomes = [
      "Structure accessible and semantic web pages using HTML5",
      "Style responsive user interfaces with CSS3, Flexbox, and CSS Grid",
      "Add dynamic interactive features using modern JavaScript",
      "Deploy real-world web projects to modern hosting platforms"
    ];
  }

  // Authoritative Database overrides: If admin added dynamic learning outcomes or description, use those!
  const finalOutcomes = Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0
    ? course.learningOutcomes
    : (Array.isArray((course as any).outcomes) && (course as any).outcomes.length > 0 ? (course as any).outcomes : defaultOutcomes);

  const finalIntro = Array.isArray((course as any).introText) && (course as any).introText.length > 0
    ? (course as any).introText
    : (course.description ? [course.description] : defaultIntro);

  return {
    subtitle: (course as any).subtitle || defaultSubtitle,
    introText: finalIntro,
    outcomes: finalOutcomes,
  };
};

export const CourseView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentAvatar = userProfile?.photoURL || user?.photoURL || undefined;
  const studentName = (userProfile?.name && userProfile.name !== 'Student User' ? userProfile.name : '') || userProfile?.fullName || user?.displayName || userProfile?.githubUsername || (user?.email ? user.email.split('@')[0] : 'Learner');
  const idOrSlug = (courseId || slug || '').trim();
  const { courses, getCourseById, getCourseModules, refreshCourses } = useCourses();
  const dynamicCourse = getCourseById(idOrSlug);

  // Authoritative validation: course resolved by CourseContext
  const isValidCourse = Boolean(dynamicCourse);

  const targetCourseId = String(dynamicCourse?.id || '');
  const coursePrice = typeof (dynamicCourse as any)?.price === 'number' ? (dynamicCourse as any).price : 0;
  const isPaid = coursePrice > 0;

  const isAdminOrInstructor = Boolean(
    userProfile?.role === 'admin' ||
    userProfile?.role === 'instructor' ||
    (user?.email && (user.email.includes('admin') || user.email === 'admin@gmail.com'))
  );

  // Track loaded modules specifically tied to current targetCourseId
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!targetCourseId) return;

    if (!courseModules || courseModules.length === 0) {
      if (!dynamicCourse?.modules || dynamicCourse.modules.length === 0) {
        setIsLoadingModules(true);
      }
    }

    getCourseModules(targetCourseId, true)
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
  }, [targetCourseId, getCourseModules]);

  const modeParam = searchParams.get('mode');
  const isModeLearn = modeParam === 'learn';

  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    if (isAdminOrInstructor) return true;
    if (!user?.uid || user.uid === 'default_student') return false;
    if (isPaid) return false; // Paid courses require server verification
    return targetCourseId ? courseService.isCourseEnrolled(targetCourseId, user.uid) : false;
  });

  const [isLearningMode, setIsLearningMode] = useState<boolean>(() => {
    if (!isModeLearn) return false;
    if (isAdminOrInstructor) return true;
    if (!user?.uid || user.uid === 'default_student') return false;
    if (isPaid) return false; // Never enter learning mode on paid course before server verification
    return targetCourseId ? courseService.isCourseEnrolled(targetCourseId, user.uid) : false;
  });

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

  // Authoritative enrollment check & direct URL security enforcement
  useEffect(() => {
    let isMounted = true;
    if (!targetCourseId) return;

    if (isAdminOrInstructor) {
      setIsEnrolled((prev) => (prev ? prev : true));
      if (isModeLearn) {
        setIsLearningMode((prev) => (prev ? prev : true));
      }
      return;
    }

    if (!user?.uid || user.uid === 'default_student') {
      setIsEnrolled((prev) => (!prev ? prev : false));
      setIsLearningMode((prev) => (!prev ? prev : false));
      if (isModeLearn) {
        setSearchParams((prevParams) => {
          if (!prevParams.has('mode')) return prevParams;
          const next = new URLSearchParams(prevParams);
          next.delete('mode');
          return next;
        }, { replace: true });
        if (isPaid) {
          setCheckoutModalOpen(true);
        }
      }
      return;
    }

    // Verify against authoritative backend API
    const checkServer = async () => {
      try {
        let token: string | undefined;
        try {
          token = await user.getIdToken();
        } catch {}
        const res = await enrollmentService.checkCourseEnrollment(targetCourseId, user.uid, token);
        if (!isMounted) return;

        if (res.isEnrolled) {
          setIsEnrolled((prev) => (prev ? prev : true));
          courseService.enrollCourse(targetCourseId, user.uid, {
            email: user.email || undefined,
            name: studentName,
            courseTitle: dynamicCourse?.title,
          });
          if (isModeLearn) {
            setIsLearningMode((prev) => (prev ? prev : true));
          }
        } else {
          // STRICT ENFORCEMENT: Server says NOT ENROLLED
          setIsEnrolled((prev) => (!prev ? prev : false));
          courseService.unenrollCourse(targetCourseId, user.uid);
          setIsLearningMode((prev) => (!prev ? prev : false));
          if (isModeLearn) {
            setSearchParams((prevParams) => {
              if (!prevParams.has('mode')) return prevParams;
              const next = new URLSearchParams(prevParams);
              next.delete('mode');
              return next;
            }, { replace: true });
            if (isPaid) {
              setCheckoutModalOpen(true);
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setIsEnrolled((prev) => (!prev ? prev : false));
        courseService.unenrollCourse(targetCourseId, user.uid);
        setIsLearningMode((prev) => (!prev ? prev : false));
        if (isModeLearn) {
          setSearchParams((prevParams) => {
            if (!prevParams.has('mode')) return prevParams;
            const next = new URLSearchParams(prevParams);
            next.delete('mode');
            return next;
          }, { replace: true });
          if (isPaid) {
            setCheckoutModalOpen(true);
          }
        }
      }
    };

    checkServer();

    return () => {
      isMounted = false;
    };
  }, [targetCourseId, user?.uid, isAdminOrInstructor, isModeLearn, setSearchParams, isPaid, dynamicCourse?.title, studentName]);

  const handleEnrollClick = () => {
    if (!user) {
      toast.warning('🔒 Please sign in as a student to enroll in this course!');
      navigate('/auth/login', { state: { from: location } });
      return;
    }
    if (isPaid) {
      setCheckoutModalOpen(true);
    } else {
      setConfirmActionType('enroll');
      setConfirmModalOpen(true);
    }
  };

  const handleEnrollSuccess = (_enrollmentRecord?: any) => {
    setIsEnrolled(true);
    if (dynamicCourse && user?.uid) {
      courseService.enrollCourse(targetCourseId, user.uid, {
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
    if (isAdminOrInstructor || isEnrolled) {
      setIsLearningMode(true);
      setSearchParams({ mode: 'learn' });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    // Non-enrolled
    if (isPaid) {
      setCheckoutModalOpen(true);
    } else {
      setConfirmActionType('enroll');
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmModalAction = () => {
    setConfirmModalOpen(false);
    if (confirmActionType === 'enroll') {
      if (isPaid) {
        setCheckoutModalOpen(true);
        return;
      }
      handleEnrollSuccess();
      toast.success(`🎉 Enrolled successfully in "${dynamicCourse?.title || 'this course'}"! All modules unlocked.`);
    } else if (confirmActionType === 'enter') {
      if (!isEnrolled && !isAdminOrInstructor) {
        if (isPaid) {
          setCheckoutModalOpen(true);
        } else {
          setConfirmActionType('enroll');
          setConfirmModalOpen(true);
        }
        return;
      }
      setIsLearningMode(true);
      setSearchParams({ mode: 'learn' });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  // ── Stable Memoized Meta & Module Data (Called Unconditionally) ───────
  const meta = useMemo(() => getCourseMeta(dynamicCourse), [dynamicCourse]);

  const effectiveModules = useMemo(() => {
    return (courseModules && courseModules.length > 0)
      ? courseModules
      : (dynamicCourse?.modules && dynamicCourse.modules.length > 0)
      ? dynamicCourse.modules
      : [];
  }, [courseModules, dynamicCourse?.modules]);

  const playerModules = useMemo(() => {
    return mapCourseModulesToPlayerModules(effectiveModules);
  }, [effectiveModules]);

  const activeCourseData = useMemo(() => {
    if (!dynamicCourse) return null;
    const cAny = dynamicCourse as any;
    return {
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
      price: coursePrice,
      modules: playerModules
    };
  }, [dynamicCourse, meta, coursePrice, playerModules]);

  const handleBackToDetails = () => {
    setIsLearningMode(false);
    setSearchParams((prevParams) => {
      if (!prevParams.has('mode')) return prevParams;
      const next = new URLSearchParams(prevParams);
      next.delete('mode');
      return next;
    }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isValidCourse || !dynamicCourse || !activeCourseData) {
    if (courses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-slate-50 font-['Sora']">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Loading course details...</p>
        </div>
      );
    }

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

  if (isLearningMode && (isEnrolled || isAdminOrInstructor)) {
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
            price: coursePrice,
          },
        ]}
        totalPrice={coursePrice}
        onSuccess={() => {
          handleEnrollSuccess();
          setIsLearningMode(true);
          setSearchParams({ mode: 'learn' });
        }}
      />

      <CourseActionConfirmModal
        isOpen={confirmModalOpen}
        actionType={confirmActionType}
        courseTitle={activeCourseData.title}
        courseCategory={activeCourseData.category || 'Engineering Track'}
        modulesCount={Array.isArray(activeCourseData.modules) ? activeCourseData.modules.length : 6}
        lessonsCount={Array.isArray(activeCourseData.modules) ? activeCourseData.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 4), 0) : 24}
        duration={activeCourseData.duration || '6-8 hours'}
        currentProgress={user?.uid ? courseService.getCourseProgressPercent(targetCourseId, user.uid) : 0}
        onConfirm={handleConfirmModalAction}
        onCancel={() => setConfirmModalOpen(false)}
      />
    </>
  );
};
