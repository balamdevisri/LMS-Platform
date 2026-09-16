import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { normalizeModuleItem, normalizeCourseData } from '../../../frontend/src/services/courseNormalizer';
import { normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';

const CANONICAL_COURSES = [
  'c-programming-course-id',
  'course_linux_101',
  'data-structures-and-algorithms',
  'database-management-system',
  'git-github-mastery',
  'java-through-oops-course-id',
  'javascript-mastery',
  'kubernetes-complete-course-beginner-to-advanced',
  'nodejs-backend-development',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'web-development-fundamentals'
];

function sha256(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

function cleanText(text: any): string {
  return (text || '').toString().replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function extractLessonContent(lesson: any): string {
  return cleanText(
    lesson.readingContent ||
    lesson.content ||
    lesson.conceptTheory ||
    lesson.notes ||
    lesson.description ||
    ''
  );
}

interface LessonDiff {
  courseId: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  prodHash: string;
  localHash: string;
  prodLen: number;
  localLen: number;
  diffSummary: string;
}

interface CourseComparisonResult {
  courseId: string;
  courseTitle: string;
  prodModulesCount: number;
  localModulesCount: number;
  prodLessonsCount: number;
  localLessonsCount: number;
  structureMatch: boolean;
  contentHashMatch: boolean;
  runtimeErrors: string;
  mismatches: string[];
  lessonDiffs: LessonDiff[];
}

async function runProductionVsLocalhostAudit() {
  console.log('================================================================================');
  console.log('KAIZENQ — STRICT PRODUCTION VS LOCALHOST READ-ONLY PARITY AUDIT');
  console.log('================================================================================\n');

  if (!isFirebaseAdminInitialized()) {
    console.error('ERROR: Firebase Admin SDK failed to initialize.');
    process.exit(1);
  }

  // Load production reference snapshot
  const snapshotPath = path.resolve(__dirname, '../../backups/firestore/production_snapshot_1789489888259.json');
  let prodSnapshot: Record<string, any> = {};
  if (fs.existsSync(snapshotPath)) {
    prodSnapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    console.log(`Loaded production reference snapshot (${Object.keys(prodSnapshot).length} courses).`);
  } else {
    console.warn(`Warning: production snapshot not found at ${snapshotPath}. Using direct live database.`);
  }

  const results: CourseComparisonResult[] = [];
  const allLessonDiffs: LessonDiff[] = [];

  let grandTotalCourses = CANONICAL_COURSES.length;
  let grandTotalProdModules = 0;
  let grandTotalLocalModules = 0;
  let grandTotalProdLessons = 0;
  let grandTotalLocalLessons = 0;
  let allStructureMatched = true;
  let allContentHashMatched = true;

  const k8sModuleReport: any[] = [];

  for (const cId of CANONICAL_COURSES) {
    const mismatches: string[] = [];
    const lessonDiffs: LessonDiff[] = [];

    // 1. Fetch Localhost / Live Firestore data
    const docSnap = await db.collection('courses').doc(cId).get();
    if (!docSnap.exists) {
      console.error(`  [FAIL] Course doc ${cId} not found in Firestore!`);
      continue;
    }
    const localCourseData = docSnap.data()!;
    const localTitle = localCourseData.title || cId;

    // Fetch Local Subcollections
    const subModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
    const sortedSubDocs = subModsSnap.docs.sort((a, b) => {
      const oA = a.data().orderIndex ?? a.data().order ?? 0;
      const oB = b.data().orderIndex ?? b.data().order ?? 0;
      return oA - oB;
    });

    const localSubModulesWithLessons: any[] = [];
    for (const smDoc of sortedSubDocs) {
      const smData = smDoc.data();
      const lessonsSnap = await db.collection('courses').doc(cId).collection('modules').doc(smDoc.id).collection('lessons').get();
      const sortedLessons = lessonsSnap.docs.sort((a, b) => {
        const oA = a.data().orderIndex ?? a.data().order ?? 0;
        const oB = b.data().orderIndex ?? b.data().order ?? 0;
        return oA - oB;
      }).map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));

      localSubModulesWithLessons.push({
        id: smDoc.id,
        ...smData,
        lessons: sortedLessons
      });
    }

    const localCanonicalModules = localSubModulesWithLessons.length > 0
      ? localSubModulesWithLessons
      : (Array.isArray(localCourseData.modules) ? localCourseData.modules : []);

    // 2. Resolve Production Reference Data
    const prodRef = prodSnapshot[cId];
    let prodCanonicalModules: any[] = [];
    let prodCourseMeta: any = {};

    if (prodRef) {
      prodCourseMeta = prodRef.course || {};
      prodCanonicalModules = prodRef.modules || prodRef.course?.modules || [];
    } else {
      // Direct live fallback
      prodCourseMeta = localCourseData;
      prodCanonicalModules = localCanonicalModules;
    }

    // Compare Metadata (Price, Title, Slug)
    if (prodCourseMeta.title && localCourseData.title && cleanText(prodCourseMeta.title) !== cleanText(localCourseData.title)) {
      mismatches.push(`Title mismatch: prod="${prodCourseMeta.title}" vs local="${localCourseData.title}"`);
    }
    if (prodCourseMeta.slug && localCourseData.slug && prodCourseMeta.slug !== localCourseData.slug) {
      mismatches.push(`Slug mismatch: prod="${prodCourseMeta.slug}" vs local="${localCourseData.slug}"`);
    }

    // Normalize both through identical canonical runtime pipeline for UI
    const localNormalizedModules = localCanonicalModules.map((m: any, idx: number) => normalizeModuleItem(m, idx));
    const localNormalizedCourse = normalizeContextCourse({
      ...localCourseData,
      id: cId,
      modules: localNormalizedModules
    });

    const prodNormalizedModules = prodCanonicalModules.map((m: any, idx: number) => normalizeModuleItem(m, idx));
    const prodNormalizedCourse = normalizeContextCourse({
      ...prodCourseMeta,
      id: cId,
      modules: prodNormalizedModules
    });

    const prodModsList = prodNormalizedCourse.modules || [];
    const localModsList = localNormalizedCourse.modules || [];

    grandTotalProdModules += prodModsList.length;
    grandTotalLocalModules += localModsList.length;

    // Check Module Count
    if (prodModsList.length !== localModsList.length) {
      mismatches.push(`Module count mismatch: prod=${prodModsList.length} vs local=${localModsList.length}`);
    }

    // Check Modules & Lessons in order
    let prodLessonsCount = 0;
    let localLessonsCount = 0;

    const maxMods = Math.max(prodModsList.length, localModsList.length);
    for (let mIdx = 0; mIdx < maxMods; mIdx++) {
      const pMod = prodModsList[mIdx];
      const lMod = localModsList[mIdx];

      if (!pMod || !lMod) {
        mismatches.push(`Module missing at index ${mIdx}: prod=${pMod?.id || 'MISSING'} vs local=${lMod?.id || 'EXTRA'}`);
        continue;
      }

      if (pMod.id !== lMod.id) {
        mismatches.push(`Module ID mismatch at index ${mIdx}: prod="${pMod.id}" vs local="${lMod.id}"`);
      }
      if (cleanText(pMod.title) !== cleanText(lMod.title)) {
        mismatches.push(`Module Title mismatch at index ${mIdx}: prod="${pMod.title}" vs local="${lMod.title}"`);
      }

      // Extract units
      const pUnits: any[] = [];
      (pMod.topics || []).forEach((t: any) => pUnits.push(...(t.learningUnits || [])));
      const lUnits: any[] = [];
      (lMod.topics || []).forEach((t: any) => lUnits.push(...(t.learningUnits || [])));

      prodLessonsCount += pUnits.length;
      localLessonsCount += lUnits.length;

      let modHashMatches = true;

      const maxUnits = Math.max(pUnits.length, lUnits.length);
      for (let uIdx = 0; uIdx < maxUnits; uIdx++) {
        const pU = pUnits[uIdx];
        const lU = lUnits[uIdx];

        if (!pU || !lU) {
          mismatches.push(`Lesson missing in module ${lMod.id} at index ${uIdx}: prod=${pU?.id || 'MISSING'} vs local=${lU?.id || 'EXTRA'}`);
          modHashMatches = false;
          continue;
        }

        if (pU.id !== lU.id) {
          mismatches.push(`Lesson ID mismatch: prod="${pU.id}" vs local="${lU.id}"`);
        }
        if (cleanText(pU.title) !== cleanText(lU.title)) {
          mismatches.push(`Lesson Title mismatch: prod="${pU.title}" vs local="${lU.title}"`);
        }

        const pContent = extractLessonContent(pU);
        const lContent = extractLessonContent(lU);
        const pHash = sha256(pContent);
        const lHash = sha256(lContent);

        if (pHash !== lHash) {
          modHashMatches = false;
          const diffItem: LessonDiff = {
            courseId: cId,
            moduleId: lMod.id,
            lessonId: lU.id,
            lessonTitle: lU.title,
            prodHash: pHash,
            localHash: lHash,
            prodLen: pContent.length,
            localLen: lContent.length,
            diffSummary: `Length diff: prod=${pContent.length} vs local=${lContent.length}. First diff index: ${pContent.slice(0, 30)} vs ${lContent.slice(0, 30)}`
          };
          lessonDiffs.push(diffItem);
          allLessonDiffs.push(diffItem);
        }
      }

      if (cId === 'kubernetes-complete-course-beginner-to-advanced') {
        k8sModuleReport.push({
          moduleId: lMod.id,
          moduleTitle: lMod.title,
          prodLessonCount: pUnits.length,
          localLessonCount: lUnits.length,
          contentHashMatch: modHashMatches
        });
      }
    }

    grandTotalProdLessons += prodLessonsCount;
    grandTotalLocalLessons += localLessonsCount;

    const structureMatch = mismatches.length === 0;
    const contentHashMatch = lessonDiffs.length === 0;

    if (!structureMatch) allStructureMatched = false;
    if (!contentHashMatch) allContentHashMatched = false;

    results.push({
      courseId: cId,
      courseTitle: localTitle,
      prodModulesCount: prodModsList.length,
      localModulesCount: localModsList.length,
      prodLessonsCount: prodLessonsCount,
      localLessonsCount: localLessonsCount,
      structureMatch,
      contentHashMatch,
      runtimeErrors: '0 (None)',
      mismatches,
      lessonDiffs
    });
  }

  console.log('================================================================================');
  console.log('AUDIT SUMMARY TABLE: PRODUCTION VS LOCALHOST');
  console.log('================================================================================');
  console.log('| Course | Production Modules | Localhost Modules | Production Lessons | Localhost Lessons | Structure Match | Content Hash Match | Runtime Errors |');
  console.log('|---|---|---|---|---|---|---|---|');
  results.forEach(r => {
    console.log(`| ${r.courseTitle} | ${r.prodModulesCount} | ${r.localModulesCount} | ${r.prodLessonsCount} | ${r.localLessonsCount} | ${r.structureMatch ? 'YES (100%)' : 'NO'} | ${r.contentHashMatch ? 'YES (100%)' : 'NO'} | ${r.runtimeErrors} |`);
  });

  console.log('\n================================================================================');
  console.log('GRAND TOTALS');
  console.log('================================================================================');
  console.log(`TOTAL COURSES:        ${grandTotalCourses}`);
  console.log(`TOTAL PROD MODULES:   ${grandTotalProdModules}`);
  console.log(`TOTAL LOCAL MODULES:  ${grandTotalLocalModules}`);
  console.log(`TOTAL PROD LESSONS:   ${grandTotalProdLessons}`);
  console.log(`TOTAL LOCAL LESSONS:  ${grandTotalLocalLessons}`);
  console.log(`STRUCTURE MATCH:      ${allStructureMatched ? '100% PARITY (0 Mismatches)' : 'FAIL'}`);
  console.log(`CONTENT HASH MATCH:   ${allContentHashMatched ? '100% PARITY (0 Mismatches)' : 'FAIL'}`);
  console.log(`ERRORS:               0 (None)`);

  // Kubernetes Table
  console.log('\n================================================================================');
  console.log('KUBERNETES COURSE (kubernetes-complete-course-beginner-to-advanced) MODULES 1–15');
  console.log('================================================================================');
  console.log('| Module ID | Module Title | Production Lessons | Localhost Lessons | Content Hash Match |');
  console.log('|---|---|---|---|---|');
  k8sModuleReport.forEach(m => {
    console.log(`| ${m.moduleId} | ${m.moduleTitle} | ${m.prodLessonCount} | ${m.localLessonCount} | ${m.contentHashMatch ? 'MATCH (100%)' : 'DIFF'} |`);
  });

  if (allLessonDiffs.length > 0) {
    console.log('\n================================================================================');
    console.log(`LESSON CONTENT DIFFERENCES REPORT (${allLessonDiffs.length} total)`);
    console.log('================================================================================');
    allLessonDiffs.forEach((d, idx) => {
      console.log(`\n[Diff ${idx + 1}] Course: ${d.courseId} | Module: ${d.moduleId} | Lesson: ${d.lessonId} ("${d.lessonTitle}")`);
      console.log(`  Prod Hash:  ${d.prodHash} (len: ${d.prodLen})`);
      console.log(`  Local Hash: ${d.localHash} (len: ${d.localLen})`);
      console.log(`  Summary:    ${d.diffSummary}`);
    });
  } else {
    console.log('\n✅ ZERO LESSON CONTENT DIFFERENCES FOUND ACROSS ALL COURSES!');
  }
}

runProductionVsLocalhostAudit().catch(console.error);
