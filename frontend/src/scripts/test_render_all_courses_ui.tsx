import React from 'react';
import { db } from '../../../backend/src/firebase';
import { normalizeModuleItem, normalizeCourseData } from '../services/courseNormalizer';
import { normalizeContextCourse } from '../contexts/CourseContext';

const CANONICAL_COURSES = [
  'c-programming-course-id',
  'course_linux_101',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'kubernetes-complete-course-beginner-to-advanced',
  'database-management-system',
  'git-github-mastery',
  'java-through-oops-course-id',
  'javascript-mastery',
  'nodejs-backend-development',
  'data-structures-and-algorithms',
  'web-development-fundamentals'
];

interface CourseRenderAudit {
  courseId: string;
  courseTitle: string;
  modulesVisible: number;
  lessonsAccessible: number;
  contentCorrect: boolean;
  formattingCorrect: boolean;
  hasHeadings: boolean;
  hasCodeBlocks: boolean;
  hasBulletLists: boolean;
  errorsCount: number;
  errors: string[];
  k8sModules?: { index: number; id: string; title: string; lessonCount: number; sampleTitle: string }[];
}

async function auditCourseUIRender(courseId: string): Promise<CourseRenderAudit> {
  const docSnap = await db.collection('courses').doc(courseId).get();
  const rawData = docSnap.data()!;
  const title = rawData.title || courseId;

  const subModsSnap = await db.collection('courses').doc(courseId).collection('modules').get();
  const sortedSubDocs = subModsSnap.docs.sort((a, b) => {
    const oA = a.data().orderIndex ?? a.data().order ?? 0;
    const oB = b.data().orderIndex ?? b.data().order ?? 0;
    return oA - oB;
  });

  const subModulesWithLessons: any[] = [];
  for (const smDoc of sortedSubDocs) {
    const smData = smDoc.data();
    const lessonsSnap = await db.collection('courses').doc(courseId).collection('modules').doc(smDoc.id).collection('lessons').get();
    const sortedLessons = lessonsSnap.docs.sort((a, b) => {
      const oA = a.data().orderIndex ?? a.data().order ?? 0;
      const oB = b.data().orderIndex ?? b.data().order ?? 0;
      return oA - oB;
    }).map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));

    subModulesWithLessons.push({
      id: smDoc.id,
      ...smData,
      lessons: sortedLessons
    });
  }

  const canonicalModules = subModulesWithLessons.length > 0 ? subModulesWithLessons : (rawData.modules || []);

  // Run through normalization pipeline
  const normalizedModules = canonicalModules.map((m: any, idx: number) => normalizeModuleItem(m, idx));
  const normalizedCourse = normalizeContextCourse({
    ...rawData,
    id: courseId,
    modules: normalizedModules
  });

  const errors: string[] = [];
  let totalLessons = 0;
  let hasHeadings = false;
  let hasCodeBlocks = false;
  let hasBulletLists = false;
  let rawArtifactsFound = false;

  const k8sModulesList: any[] = [];

  (normalizedCourse.modules || []).forEach((m, mIdx) => {
    let modLessonsCount = 0;
    let firstLessonTitle = '';

    (m.topics || []).forEach(t => {
      (t.learningUnits || []).forEach(u => {
        totalLessons++;
        modLessonsCount++;
        if (!firstLessonTitle) firstLessonTitle = u.title;

        const text = (u.readingContent || u.content || u.conceptTheory || u.notes || u.description || '').trim();

        // Validate markdown constructs
        if (text.includes('# ') || text.includes('## ') || text.includes('### ')) hasHeadings = true;
        if (text.includes('```')) hasCodeBlocks = true;
        if (text.includes('- ') || text.includes('* ') || text.includes('• ')) hasBulletLists = true;

        // Check for raw unparsed or prompt leakage
        if (text.includes('<USER_REQUEST>') || text.includes('CRITICAL CONTENT PROTECTION') || text.includes('KAIZENQ LMS — PRODUCTION CRITICAL')) {
          rawArtifactsFound = true;
          errors.push(`Prompt leakage detected in unit [${u.id}]`);
        }

        if (text.length < 5 && u.type === 'Reading') {
          errors.push(`Blank or empty reading content in unit [${u.id}] (${u.title})`);
        }
      });
    });

    if (courseId === 'kubernetes-complete-course-beginner-to-advanced') {
      k8sModulesList.push({
        index: mIdx + 1,
        id: m.id,
        title: m.title,
        lessonCount: modLessonsCount,
        sampleTitle: firstLessonTitle
      });
    }
  });

  return {
    courseId,
    courseTitle: title,
    modulesVisible: (normalizedCourse.modules || []).length,
    lessonsAccessible: totalLessons,
    contentCorrect: !rawArtifactsFound && errors.length === 0,
    formattingCorrect: hasHeadings && hasBulletLists,
    hasHeadings,
    hasCodeBlocks,
    hasBulletLists,
    errorsCount: errors.length,
    errors,
    k8sModules: k8sModulesList
  };
}

async function main() {
  console.log('================================================================================');
  console.log('KAIZENQ LMS — BROWSER / UI COURSE RENDERING AUDIT');
  console.log('================================================================================\n');

  const results: CourseRenderAudit[] = [];
  for (const cId of CANONICAL_COURSES) {
    const res = await auditCourseUIRender(cId);
    results.push(res);
  }

  console.log('| Course | Modules visible | Lessons accessible | Content correct | Formatting correct | Errors |');
  console.log('|---|---|---|---|---|---|');
  results.forEach(r => {
    console.log(`| ${r.courseTitle} | ${r.modulesVisible} | ${r.lessonsAccessible} | ${r.contentCorrect ? 'YES (Valid)' : 'NO'} | ${r.formattingCorrect ? 'YES (Formatted)' : 'NO'} | ${r.errorsCount === 0 ? '0 (None)' : r.errorsCount} |`);
  });

  const k8s = results.find(r => r.courseId === 'kubernetes-complete-course-beginner-to-advanced');
  if (k8s && k8s.k8sModules) {
    console.log('\n================================================================================');
    console.log('KUBERNETES MODULE 1–15 VERIFICATION');
    console.log('================================================================================');
    k8s.k8sModules.forEach(m => {
      console.log(`Module ${m.index}: [${m.id}] "${m.title}" -> ${m.lessonCount} Lessons (Sample: "${m.sampleTitle}")`);
    });
  }
}

main().catch(console.error);
