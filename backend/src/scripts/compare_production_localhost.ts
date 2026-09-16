import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

function sha256(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

const prodSnapshot = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../backups/firestore/production_snapshot_1789489888259.json'), 'utf8')
);

const canonicalCourses = [
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

export async function compareProductionLocalhost() {
  console.log('======================================================================');
  console.log('📊 PRODUCTION VS LOCALHOST DEEP PARITY AUDIT');
  console.log('======================================================================\n');

  let totalMismatchesAcrossAllCourses = 0;

  for (const cId of canonicalCourses) {
    const prod = prodSnapshot[cId];
    if (!prod) {
      console.log(`[${cId}] ❌ Not found in production snapshot!`);
      totalMismatchesAcrossAllCourses++;
      continue;
    }
    const pCourse = prod.course;
    const pModules = prod.modules || [];

    // Localhost Firestore
    const localDocSnap = await db.collection('courses').doc(cId).get();
    const lCourse = localDocSnap.exists ? fromDocument<any>(localDocSnap) : null;
    const localSubModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
    const lSubModules: any[] = [];
    for (const mDoc of localSubModsSnap.docs) {
      const mData = fromDocument<any>(mDoc);
      const lSnap = await mDoc.ref.collection('lessons').get();
      const subLessons = lSnap.docs.map(lDoc => fromDocument<any>(lDoc));
      subLessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      lSubModules.push({ ...mData, lessons: subLessons });
    }
    lSubModules.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

    const lRootModules = lCourse?.modules || [];

    console.log(`Course: "${pCourse.title}" (${cId})`);
    console.log(`  Production Modules Count: ${pModules.length}, Root Modules Count: ${pCourse.modules?.length || 0}`);
    console.log(`  Localhost Sub Modules: ${lSubModules.length}, Localhost Root Modules: ${lRootModules.length}`);

    // Check course metadata differences
    const metaDiffs: string[] = [];
    if (pCourse.title !== lCourse?.title) metaDiffs.push(`title: prod="${pCourse.title}" vs local="${lCourse?.title}"`);
    if (pCourse.slug !== lCourse?.slug) metaDiffs.push(`slug: prod="${pCourse.slug}" vs local="${lCourse?.slug}"`);
    if (pCourse.price !== lCourse?.price) metaDiffs.push(`price: prod=${pCourse.price} vs local=${lCourse?.price}`);
    if (pCourse.duration !== lCourse?.duration) metaDiffs.push(`duration: prod="${pCourse.duration}" vs local="${lCourse?.duration}"`);
    if (pCourse.status !== lCourse?.status) metaDiffs.push(`status: prod="${pCourse.status}" vs local="${lCourse?.status}"`);

    if (metaDiffs.length > 0) {
      console.log(`  ⚠️ Metadata Mismatches: ${metaDiffs.join('; ')}`);
      totalMismatchesAcrossAllCourses += metaDiffs.length;
    } else {
      console.log(`  ✅ Metadata matches exactly.`);
    }

    // Module-by-module check
    let moduleMismatchCount = 0;
    const maxMods = Math.max(pModules.length, lSubModules.length, lRootModules.length);
    for (let i = 0; i < maxMods; i++) {
      const pMod = pModules[i];
      const lSub = lSubModules[i];
      const lRoot = lRootModules[i];

      if (!pMod) {
        console.log(`    [Mod ${i+1}] Local has extra module: sub="${lSub?.title || lSub?.id}", root="${lRoot?.title || lRoot?.id}"`);
        moduleMismatchCount++;
        continue;
      }
      if (!lSub && !lRoot) {
        console.log(`    [Mod ${i+1}] Local is MISSING module: "${pMod.title}" (${pMod.id})`);
        moduleMismatchCount++;
        continue;
      }

      // Check title mismatch
      if (lSub && lSub.title !== pMod.title) {
        console.log(`    [Mod ${i+1}] Sub Title mismatch: prod="${pMod.title}" vs local="${lSub.title}"`);
        moduleMismatchCount++;
      }
      if (lRoot && lRoot.title !== pMod.title) {
        console.log(`    [Mod ${i+1}] Root Title mismatch: prod="${pMod.title}" vs local="${lRoot.title}"`);
        moduleMismatchCount++;
      }

      // Check lessons count
      const pLessons = pMod.lessons || (pMod.topics?.[0]?.learningUnits) || [];
      const lSubLessons = lSub?.lessons || [];
      const lRootLessons = lRoot?.lessons || (lRoot?.topics?.[0]?.learningUnits) || [];
      if (lSub && lSubLessons.length !== pLessons.length) {
        console.log(`    [Mod ${i+1}] Sub Lessons count mismatch: prod=${pLessons.length} vs local=${lSubLessons.length}`);
        moduleMismatchCount++;
      }
      if (lRoot && lRootLessons.length !== pLessons.length) {
        console.log(`    [Mod ${i+1}] Root Lessons count mismatch: prod=${pLessons.length} vs local=${lRootLessons.length}`);
        moduleMismatchCount++;
      }
    }

    if (moduleMismatchCount === 0) {
      console.log(`  ✅ Modules & Lessons match 100%.`);
    } else {
      console.log(`  ❌ Total Module/Lesson Mismatches in this course: ${moduleMismatchCount}`);
      totalMismatchesAcrossAllCourses += moduleMismatchCount;
    }
    console.log('----------------------------------------------------------------------');
  }

  console.log(`\n======================================================================`);
  console.log(`TOTAL MISMATCHES ACROSS ALL COURSES: ${totalMismatchesAcrossAllCourses}`);
  console.log(`======================================================================\n`);
  return totalMismatchesAcrossAllCourses;
}

if (require.main === module) {
  compareProductionLocalhost()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
