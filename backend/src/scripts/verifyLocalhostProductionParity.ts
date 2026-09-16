import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';
import { CourseService } from '../services/course/CourseService';
import { courseContentService } from '../services/course/courseContent.service';

function sha256(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

export interface CourseParityResult {
  courseId: string;
  title: string;
  metadataMatch: boolean;
  moduleCountMatch: boolean;
  moduleOrderMatch: boolean;
  moduleTitlesMatch: boolean;
  lessonCountMatch: boolean;
  lessonOrderMatch: boolean;
  lessonContentMatch: boolean;
  overallParity: '100%' | 'FAILED';
  prodModulesCount: number;
  localModulesCount: number;
  prodLessonsCount: number;
  localLessonsCount: number;
  contentHashProd: string;
  contentHashLocal: string;
  mismatches: string[];
}

export interface FullParityReport {
  timestamp: string;
  totalCoursesAudited: number;
  coursesPassing100Percent: number;
  courseStructureParity: string;
  moduleStructureParity: string;
  unitTopicStructureParity: string;
  lessonStructureParity: string;
  orderingParity: string;
  contentHashParity: string;
  overallSystemParity: string;
  courseResults: CourseParityResult[];
}

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

export async function verifyLocalhostProductionParity(): Promise<FullParityReport> {
  console.log('======================================================================');
  console.log('🔍 RUNNING COMPREHENSIVE LOCALHOST ↔ PRODUCTION PARITY VERIFICATION');
  console.log('======================================================================\n');

  const snapshotFile = path.resolve(__dirname, '../../backups/firestore/production_snapshot_1789489888259.json');
  if (!fs.existsSync(snapshotFile)) {
    throw new Error(`Production snapshot file not found at: ${snapshotFile}`);
  }

  const prodSnapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  const results: CourseParityResult[] = [];

  let metadataPassCount = 0;
  let moduleCountPassCount = 0;
  let moduleOrderPassCount = 0;
  let moduleTitlesPassCount = 0;
  let lessonCountPassCount = 0;
  let lessonOrderPassCount = 0;
  let contentHashPassCount = 0;

  for (const courseId of CANONICAL_COURSES) {
    const prodData = prodSnapshot[courseId];
    if (!prodData || !prodData.course) {
      throw new Error(`Missing course "${courseId}" in production snapshot!`);
    }

    const pCourse = prodData.course;
    const pModules = (prodData.modules || pCourse.modules || []).slice();
    pModules.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

    // 1. Fetch Localhost Data via Firestore
    const localDocSnap = await db.collection('courses').doc(courseId).get();
    if (!localDocSnap.exists) {
      throw new Error(`Localhost course document "${courseId}" does not exist in Firestore!`);
    }
    const lCourse = fromDocument<any>(localDocSnap);

    // 2. Fetch Localhost Modules via courseContentService / subcollections
    const lModules = await courseContentService.getCourseModules(courseId);
    lModules.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

    const mismatches: string[] = [];

    // Metadata Verification
    let metaMatch = true;
    if (pCourse.title !== lCourse.title) {
      metaMatch = false;
      mismatches.push(`Title mismatch: prod="${pCourse.title}" vs local="${lCourse.title}"`);
    }
    if (pCourse.slug !== lCourse.slug) {
      metaMatch = false;
      mismatches.push(`Slug mismatch: prod="${pCourse.slug}" vs local="${lCourse.slug}"`);
    }
    if (pCourse.price !== lCourse.price) {
      metaMatch = false;
      mismatches.push(`Price mismatch: prod=${pCourse.price} vs local=${lCourse.price}`);
    }
    if (pCourse.duration !== lCourse.duration) {
      metaMatch = false;
      mismatches.push(`Duration mismatch: prod="${pCourse.duration}" vs local="${lCourse.duration}"`);
    }
    if ((pCourse.status || '').toLowerCase() !== (lCourse.status || '').toLowerCase()) {
      metaMatch = false;
      mismatches.push(`Status mismatch: prod="${pCourse.status}" vs local="${lCourse.status}"`);
    }
    if (metaMatch) metadataPassCount++;

    // Module Count Verification
    const modCountMatch = pModules.length === lModules.length;
    if (!modCountMatch) {
      mismatches.push(`Module count mismatch: prod=${pModules.length} vs local=${lModules.length}`);
    } else {
      moduleCountPassCount++;
    }

    // Module Details & Lessons Verification
    let modOrderMatch = true;
    let modTitlesMatch = true;
    let lessonsCountMatch = true;
    let lessonsOrderMatch = true;
    let contentMatch = true;

    let totalProdLessons = 0;
    let totalLocalLessons = 0;
    const prodContentStrings: string[] = [];
    const localContentStrings: string[] = [];

    const maxMods = Math.max(pModules.length, lModules.length);
    for (let i = 0; i < maxMods; i++) {
      const pm: any = pModules[i];
      const lm: any = lModules[i];

      if (!pm || !lm) {
        modOrderMatch = false;
        continue;
      }

      // Check module ID & order
      const pmOrder = pm.orderIndex ?? pm.order ?? i + 1;
      const lmOrder = lm.orderIndex ?? lm.order ?? i + 1;
      if (pmOrder !== lmOrder || pm.id !== lm.id) {
        modOrderMatch = false;
        mismatches.push(`Module order/ID mismatch at index ${i}: prod=(${pmOrder}, ${pm.id}) vs local=(${lmOrder}, ${lm.id})`);
      }

      // Check module title
      if (pm.title !== lm.title) {
        modTitlesMatch = false;
        mismatches.push(`Module title mismatch for ${pm.id}: prod="${pm.title}" vs local="${lm.title}"`);
      }

      // Get Lessons
      const pLessons: any[] = (pm.topics && pm.topics[0]?.learningUnits?.length > 0)
        ? pm.topics[0].learningUnits
        : (pm.lessons || []);

      const lLessons: any[] = (lm.topics && lm.topics[0]?.learningUnits?.length > 0)
        ? lm.topics[0].learningUnits
        : (lm.lessons || []);

      totalProdLessons += pLessons.length;
      totalLocalLessons += lLessons.length;

      if (pLessons.length !== lLessons.length) {
        lessonsCountMatch = false;
        mismatches.push(`Module ${pm.id} lessons count mismatch: prod=${pLessons.length} vs local=${lLessons.length}`);
      }

      const maxLessons = Math.max(pLessons.length, lLessons.length);
      for (let j = 0; j < maxLessons; j++) {
        const pl = pLessons[j];
        const ll = lLessons[j];

        if (!pl || !ll) {
          lessonsOrderMatch = false;
          continue;
        }

        const plOrder = pl.orderIndex ?? pl.order ?? j + 1;
        const llOrder = ll.orderIndex ?? ll.order ?? j + 1;
        if (plOrder !== llOrder || pl.id !== ll.id) {
          lessonsOrderMatch = false;
          mismatches.push(`Lesson order/ID mismatch in ${pm.id} at index ${j}: prod=(${plOrder}, ${pl.id}) vs local=(${llOrder}, ${ll.id})`);
        }

        const pText = pl.readingContent || pl.content || pl.conceptTheory || '';
        const lText = ll.readingContent || ll.content || ll.conceptTheory || '';

        prodContentStrings.push(pText);
        localContentStrings.push(lText);

        const pHash = sha256(pText);
        const lHash = sha256(lText);

        if (pHash !== lHash) {
          contentMatch = false;
          mismatches.push(`Lesson content hash mismatch in ${pm.id}/${pl.id}: prod=${pHash.slice(0, 10)} (len ${pText.length}) vs local=${lHash.slice(0, 10)} (len ${lText.length})`);
        }
      }
    }

    if (modOrderMatch) moduleOrderPassCount++;
    if (modTitlesMatch) moduleTitlesPassCount++;
    if (lessonsCountMatch) lessonCountPassCount++;
    if (lessonsOrderMatch) lessonOrderPassCount++;

    const fullProdHash = sha256(prodContentStrings.join('::'));
    const fullLocalHash = sha256(localContentStrings.join('::'));
    if (fullProdHash === fullLocalHash && contentMatch) {
      contentHashPassCount++;
    } else {
      contentMatch = false;
    }

    const coursePassed =
      metaMatch &&
      modCountMatch &&
      modOrderMatch &&
      modTitlesMatch &&
      lessonsCountMatch &&
      lessonsOrderMatch &&
      contentMatch;

    results.push({
      courseId,
      title: pCourse.title,
      metadataMatch: metaMatch,
      moduleCountMatch: modCountMatch,
      moduleOrderMatch: modOrderMatch,
      moduleTitlesMatch: modTitlesMatch,
      lessonCountMatch: lessonsCountMatch,
      lessonOrderMatch: lessonsOrderMatch,
      lessonContentMatch: contentMatch,
      overallParity: coursePassed ? '100%' : 'FAILED',
      prodModulesCount: pModules.length,
      localModulesCount: lModules.length,
      prodLessonsCount: totalProdLessons,
      localLessonsCount: totalLocalLessons,
      contentHashProd: fullProdHash,
      contentHashLocal: fullLocalHash,
      mismatches,
    });

    console.log(
      `[Course ${results.length.toString().padStart(2)}/12] ${courseId.padEnd(45)} | Mods: ${lModules.length.toString().padStart(2)}/${pModules.length.toString().padStart(2)} | Lessons: ${totalLocalLessons.toString().padStart(3)}/${totalProdLessons.toString().padStart(3)} | SHA: ${fullLocalHash.slice(0, 10)}... | ${coursePassed ? '100% PARITY ✅' : 'FAILED ❌'}`
    );
    if (!coursePassed) {
      mismatches.forEach(m => console.log(`    ⚠️ ${m}`));
    }
  }

  const totalCourses = CANONICAL_COURSES.length;
  const passingCourses = results.filter(r => r.overallParity === '100%').length;

  const report: FullParityReport = {
    timestamp: new Date().toISOString(),
    totalCoursesAudited: totalCourses,
    coursesPassing100Percent: passingCourses,
    courseStructureParity: `${Math.round((metadataPassCount / totalCourses) * 100)}%`,
    moduleStructureParity: `${Math.round((moduleCountPassCount / totalCourses) * 100)}%`,
    unitTopicStructureParity: `${Math.round((moduleTitlesPassCount / totalCourses) * 100)}%`,
    lessonStructureParity: `${Math.round((lessonCountPassCount / totalCourses) * 100)}%`,
    orderingParity: `${Math.round((moduleOrderPassCount / totalCourses) * 100)}%`,
    contentHashParity: `${Math.round((contentHashPassCount / totalCourses) * 100)}%`,
    overallSystemParity: passingCourses === totalCourses ? '100%' : `${Math.round((passingCourses / totalCourses) * 100)}%`,
    courseResults: results,
  };

  console.log(`\n======================================================================`);
  console.log(`🎯 PRODUCTION ↔ LOCALHOST PARITY VERIFICATION SUMMARY`);
  console.log(`======================================================================`);
  console.log(`COURSE STRUCTURE:         ${report.courseStructureParity}`);
  console.log(`MODULE STRUCTURE:         ${report.moduleStructureParity}`);
  console.log(`UNIT/TOPIC STRUCTURE:     ${report.unitTopicStructureParity}`);
  console.log(`LESSON STRUCTURE:         ${report.lessonStructureParity}`);
  console.log(`ORDERING:                 ${report.orderingParity}`);
  console.log(`CONTENT HASH:             ${report.contentHashParity}`);
  console.log(`OVERALL SYSTEM PARITY:    ${report.overallSystemParity}`);
  console.log(`COURSES PASSING (100%):   ${report.coursesPassing100Percent} / ${report.totalCoursesAudited}`);
  console.log(`======================================================================\n`);

  return report;
}

if (require.main === module) {
  verifyLocalhostProductionParity()
    .then((report) => {
      if (report.overallSystemParity !== '100%') {
        console.error(`❌ System parity verification failed with ${report.totalCoursesAudited - report.coursesPassing100Percent} courses failing.`);
        process.exit(1);
      }
      console.log('✅ 100% Exact Localhost ↔ Production Parity Verified.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Parity verification error:', err);
      process.exit(1);
    });
}
