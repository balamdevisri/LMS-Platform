import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { cleanCourseContent } from '../utils/contentCleaner';
import { toDocument } from '../utils/firestore';

interface CourseImportConfig {
  sourceFile: string;
  courseId: string;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  banner: string;
  skills: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  modulePrefix: string;
  lessonPrefix: string;
}

const COURSES_TO_IMPORT: CourseImportConfig[] = [
  {
    sourceFile: 'Linux_Complete_Course_Content.json',
    courseId: 'course_linux_101',
    slug: 'linux-systems-administration-mastery',
    title: 'Linux Systems & Administration Mastery',
    category: 'Linux & Systems',
    thumbnail: '/assets/images/linux_course_thumbnail.webp',
    banner: '/assets/images/linux_os_architecture.webp',
    skills: ['Linux CLI', 'Kernel Architecture', 'Systemd Services', 'POSIX Permissions', 'Bash Automation', 'SSH & Firewall Security'],
    prerequisites: ['Basic computer literacy', 'Terminal familiarity is helpful'],
    learningOutcomes: [
      'Master Linux Kernel architecture, processes, and memory management',
      'Manage POSIX and ACL file permissions, users, and groups',
      'Configure system daemons, services, and log analysis',
      'Write modular Bash automation scripts',
      'Harden Linux servers and manage SSH security',
    ],
    modulePrefix: 'linux-mod-',
    lessonPrefix: 'linux-lesson-',
  },
  {
    sourceFile: 'github_lms_content.json',
    courseId: 'git-github-mastery',
    slug: 'git-github-mastery',
    title: 'Git & GitHub Mastery',
    category: 'Development Tools',
    thumbnail: '/assets/images/github_course_banner.webp',
    banner: '/assets/images/github_course_banner.webp',
    skills: ['Git Version Control', 'Branching & Merging', 'GitHub Collaboration', 'Pull Requests', 'CI/CD with GitHub Actions', 'Conflict Resolution'],
    prerequisites: ['Basic command line familiarity'],
    learningOutcomes: [
      'Understand Distributed Version Control architecture and Git internals',
      'Master branching, merging, rebasing, and conflict resolution',
      'Collaborate via GitHub Pull Requests, Issues, and Code Reviews',
      'Automate testing and deployment using GitHub Actions CI/CD pipelines',
      'Adopt professional enterprise Git workflows and best practices',
    ],
    modulePrefix: 'git-mod-',
    lessonPrefix: 'git-lesson-',
  },
  {
    sourceFile: 'kubernetes_lms_content.json',
    courseId: 'kubernetes-complete-course-beginner-to-advanced',
    slug: 'kubernetes-complete-course-beginner-to-advanced',
    title: 'Kubernetes Complete Course – Beginner to Advanced',
    category: 'Cloud & DevOps',
    thumbnail: '/assets/images/kubernetes_course_banner.webp',
    banner: '/assets/images/kubernetes_course_banner.webp',
    skills: ['Kubernetes Architecture', 'Pods & Deployments', 'Services & Ingress', 'ConfigMaps & Secrets', 'StatefulSets', 'Helm & Production Clustering'],
    prerequisites: ['Basic Linux and Docker knowledge'],
    learningOutcomes: [
      'Understand Kubernetes Control Plane and Worker Node architecture',
      'Deploy and scale containerized applications using Pods and Deployments',
      'Manage cluster networking, Services, and Ingress controllers',
      'Configure persistent storage, ConfigMaps, Secrets, and security contexts',
      'Manage production Kubernetes clusters with automated scaling and self-healing',
    ],
    modulePrefix: 'k8s-mod-',
    lessonPrefix: 'k8s-lesson-',
  },
  {
    sourceFile: 'react_js_complete_course_content.json',
    courseId: 'react-js-complete-course',
    slug: 'react-js-complete-course',
    title: 'React JS Complete Course',
    category: 'Frontend Development',
    thumbnail: '/assets/images/react_course_banner.webp',
    banner: '/assets/images/react_course_banner.webp',
    skills: ['React Fundamentals', 'JSX & Virtual DOM', 'State & Props', 'React Hooks', 'Context API & Redux', 'React Router & API Integration'],
    prerequisites: ['HTML, CSS, and modern JavaScript (ES6+) basics'],
    learningOutcomes: [
      'Master Component-Based Architecture and Virtual DOM rendering mechanics',
      'Leverage modern React Hooks (useState, useEffect, useMemo, useCallback, useRef)',
      'Manage complex application state using Context API and Redux Toolkit',
      'Implement dynamic client-side routing with React Router',
      'Build fast, responsive, production-ready Single Page Applications (SPAs)',
    ],
    modulePrefix: 'react-mod-',
    lessonPrefix: 'react-lesson-',
  },
  {
    sourceFile: 'python_oops_lms_content.json',
    courseId: 'python-through-oops-course-id',
    slug: 'python-through-oops',
    title: 'Python Through OOPs',
    category: 'Programming & Data Structures',
    thumbnail: '/assets/images/python_course_thumbnail.webp',
    banner: '/assets/images/python_course_thumbnail.webp',
    skills: ['Python Fundamentals', 'Object-Oriented Programming', 'Inheritance & Polymorphism', 'Encapsulation & Abstraction', 'Magic Methods & Dunder', 'Generators & Decorators'],
    prerequisites: ['Basic programming intuition'],
    learningOutcomes: [
      'Master Python memory model, dynamic typing, and core data types',
      'Implement robust Object-Oriented designs using Classes, Objects, and MRO',
      'Leverage advanced OOP concepts: encapsulation, inheritance, polymorphism, and abstract classes',
      'Utilize magic/dunder methods, property decorators, and operator overloading',
      'Build real-world Python OOP projects with clean architecture principles',
    ],
    modulePrefix: 'python-mod-',
    lessonPrefix: 'python-lesson-',
  },
];

async function importCourse(config: CourseImportConfig) {
  const filePath = path.resolve(__dirname, '../../../', config.sourceFile);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Source file not found: ${filePath}`);
    return;
  }

  console.log(`\n==================================================`);
  console.log(`🚀 Importing Authoritative Course: ${config.title}`);
  console.log(`   Source: ${config.sourceFile}`);
  console.log(`   Canonical ID: ${config.courseId}`);
  console.log(`   Slug: ${config.slug}`);
  console.log(`==================================================`);

  const rawJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const rawModules = rawJson.modules || [];
  console.log(`Found ${rawModules.length} modules in source JSON.`);

  const now = new Date().toISOString();
  const courseDocRef = db.collection('courses').doc(config.courseId);
  const existingCourseSnap = await courseDocRef.get();
  const existingCourseData = existingCourseSnap.exists ? existingCourseSnap.data() || {} : {};
  const currentCourseRevision = typeof existingCourseData.revision === 'number' ? existingCourseData.revision : 1;

  // 1. Upsert Root Course Document
  const coursePayload = {
    id: config.courseId,
    title: config.title,
    slug: config.slug,
    shortDescription: existingCourseData.shortDescription || `Comprehensive enterprise-grade mastery course in ${config.title}.`,
    description: existingCourseData.description || `Welcome to ${config.title}! Master essential concepts, practical tasks, architecture, and real-world implementations.`,
    thumbnail: config.thumbnail,
    banner: config.banner,
    category: config.category,
    level: 'all_levels',
    duration: `${rawModules.length * 2} hrs`,
    language: 'English',
    price: 0,
    instructor: {
      id: 'inst_kaizenq',
      name: 'KaizenQ Engineering Team',
      role: 'Senior Technical Lead & Curriculum Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    skills: config.skills,
    prerequisites: config.prerequisites,
    learningOutcomes: config.learningOutcomes,
    status: 'published',
    visibility: 'public',
    featured: true,
    tags: [config.category.toLowerCase().replace(/\s+/g, '-'), config.slug],
    enrollmentCount: existingCourseData.enrollmentCount || 0,
    rating: existingCourseData.rating || 5.0,
    ratingCount: existingCourseData.ratingCount || 10,
    totalModules: rawModules.length,
    totalLessons: rawModules.length,
    revision: currentCourseRevision,
    createdAt: existingCourseData.createdAt || now,
    updatedAt: now,
  };

  await courseDocRef.set(toDocument(coursePayload), { merge: true });
  console.log(`✅ Upserted root course document: courses/${config.courseId}`);

  // 2. Upsert Canonical Modules & Lessons
  for (let i = 0; i < rawModules.length; i++) {
    const rawMod = rawModules[i];
    const modNumber = rawMod.moduleNumber || rawMod.module_number || i + 1;
    const moduleId = `${config.modulePrefix}${modNumber}`;
    const lessonId = `${config.lessonPrefix}${modNumber}-1`;

    let modTitle = (rawMod.title || `Module ${modNumber}`).trim();
    // Clean redundant double spaces in title
    modTitle = modTitle.replace(/\s+/g, ' ');

    const rawContent = rawMod.content || rawMod.readingContent || '';
    const cleanedContent = cleanCourseContent(rawContent);

    const moduleDocRef = courseDocRef.collection('modules').doc(moduleId);
    const existingModSnap = await moduleDocRef.get();
    const existingModData = existingModSnap.exists ? existingModSnap.data() || {} : {};
    const modRevision = typeof existingModData.revision === 'number' ? existingModData.revision : 1;

    // Module document
    const modulePayload = {
      id: moduleId,
      courseId: config.courseId,
      moduleNumber: modNumber,
      orderIndex: modNumber,
      order: modNumber,
      title: modTitle.startsWith('Module') ? modTitle : `Module ${modNumber}: ${modTitle}`,
      description: `Comprehensive module covering ${modTitle}.`,
      duration: '2 hrs',
      published: true,
      lessonsCount: 1,
      revision: modRevision,
      createdAt: existingModData.createdAt || now,
      updatedAt: now,
    };

    await moduleDocRef.set(toDocument(modulePayload), { merge: true });

    // Lesson document
    const lessonDocRef = moduleDocRef.collection('lessons').doc(lessonId);
    const existingLessonSnap = await lessonDocRef.get();
    const existingLessonData = existingLessonSnap.exists ? existingLessonSnap.data() || {} : {};
    const lessonRevision = typeof existingLessonData.revision === 'number' ? existingLessonData.revision : 1;

    const lessonPayload = {
      id: lessonId,
      courseId: config.courseId,
      moduleId: moduleId,
      title: modTitle,
      orderIndex: 1,
      order: 1,
      type: 'reading',
      duration: '45 mins',
      readingTime: '45 mins',
      readingContent: cleanedContent,
      content: cleanedContent,
      published: true,
      isFree: modNumber === 1,
      revision: lessonRevision,
      lastSavedAt: now,
      createdAt: existingLessonData.createdAt || now,
      updatedAt: now,
    };

    await lessonDocRef.set(toDocument(lessonPayload), { merge: true });
    console.log(`  - [Module ${modNumber}/15] Saved module "${moduleId}" & lesson "${lessonId}" (Content length: ${cleanedContent.length} chars)`);
  }

  console.log(`🎉 Completed import for ${config.title}: ${rawModules.length} modules, ${rawModules.length} lessons.`);
}

async function runDeterministicImport() {
  console.log('==================================================');
  console.log('KAIZEN Q DETERMINISTIC IDEMPOTENT COURSE IMPORTER');
  console.log('==================================================');

  for (const config of COURSES_TO_IMPORT) {
    await importCourse(config);
  }

  console.log('\n==================================================');
  console.log('✅ ALL 5 AUTHORITATIVE COURSES IMPORTED SUCCESSFULLY!');
  console.log('==================================================');
}

if (require.main === module) {
  runDeterministicImport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Import failed with error:', err);
      process.exit(1);
    });
}

export { runDeterministicImport, COURSES_TO_IMPORT };
