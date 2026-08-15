import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import { useAuth } from '@/contexts/AuthContext';
import { courseService } from '@/services/courseService';
import { toast } from 'sonner';
import { CourseDetailsPage } from '@/components/learning/CourseDetailsPage';
import { InCourseLearningView } from '@/components/learning/InCourseLearningView';
import { PaymentCheckoutModal } from '@/components/payment/PaymentCheckoutModal';

const mapCourseModulesToPlayerModules = (modules?: any[]): any[] => {
  if (!modules) return [];
  return modules.map((m) => {
    let lessonsList: any[] = [];
    if (m.lessons && Array.isArray(m.lessons)) {
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

    const enrichedLessons = lessonsList.map((l: any) => {
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

export const CourseView: React.FC = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const studentAvatar = userProfile?.photoURL || user?.photoURL || undefined;
  const studentName = userProfile?.name || user?.displayName || userProfile?.githubUsername || 'Student User';
  const idOrSlug = (courseId || slug || '').trim();
  const { getCourseById } = useCourses();
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

  const [isEnrolled, setIsEnrolled] = useState<boolean>(() => {
    return targetCourseId ? courseService.isCourseEnrolled(targetCourseId, userId) : false;
  });

  const [isLearningMode, setIsLearningMode] = useState(() => searchParams.get('mode') === 'learn');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, isLearningMode]);

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
    // Direct free enrollment with payment integration temporarily disabled
    handleEnrollSuccess();
    toast.success(`🎉 Enrolled successfully in "${dynamicCourse?.title || 'this course'}"! Free access is active.`);
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
    if (!isEnrolled) {
      handleEnrollSuccess();
    }
    setIsLearningMode(true);
    setSearchParams({ mode: 'learn' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
    modules: mapCourseModulesToPlayerModules(dynamicCourse.modules)
  };

  if (isLearningMode) {
    return (
      <InCourseLearningView
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
      <CourseDetailsPage
        course={activeCourseData}
        onStartLearning={handleStartLearning}
        isEnrolled={isEnrolled}
        onEnroll={handleEnrollClick}
      />

      <PaymentCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        course={{
          id: targetCourseId,
          title: activeCourseData.title,
          price: (dynamicCourse as any)?.price ?? 999,
          instructor: { name: activeCourseData.instructor },
          duration: activeCourseData.duration,
        }}
        studentInfo={{
          uid: userId,
          email: user?.email || undefined,
          name: studentName,
        }}
        onPaymentSuccess={handleEnrollSuccess}
        onNavigateToLiveClass={() => navigate('/admin/live-classes')}
      />
    </>
  );
};
