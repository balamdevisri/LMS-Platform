import * as crypto from 'crypto';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

function hashContent(content: string): string {
  return crypto.createHash('sha256').update((content || '').trim()).digest('hex');
}

async function verifyParity() {
  console.log('====================================================');
  console.log('STEP 17: AUTOMATED C PROGRAMMING PRODUCTION PARITY VALIDATION');
  console.log('====================================================\n');

  const courseId = 'c-programming-course-id';

  // 1. Fetch Localhost Data from Firestore (Course Root + Subcollections)
  console.log('[1] Fetching Localhost Firestore Course Structure...');
  const courseRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    throw new Error(`❌ Localhost Course document "${courseId}" does NOT exist!`);
  }

  const rootData = fromDocument<any>(courseSnap);
  const subModulesSnap = await courseRef.collection('modules').get();
  
  const localModules: any[] = [];
  for (const mDoc of subModulesSnap.docs) {
    const mData = fromDocument<any>(mDoc);
    const lessonsSnap = await mDoc.ref.collection('lessons').get();
    const lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...fromDocument<any>(l) }));
    lessons.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
    localModules.push({
      id: mDoc.id,
      ...mData,
      lessons,
    });
  }
  localModules.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

  console.log(`✓ Localhost: ${localModules.length} subcollection modules, root modules[] count: ${rootData.modules?.length}`);

  // 2. Fetch Production Data from https://www.kaizenq.in
  console.log('\n[2] Fetching Production API Course Structure (https://www.kaizenq.in)...');
  let prodCourseData: any = null;
  let prodModulesData: any[] = [];

  try {
    const prodCourseRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (prodCourseRes.ok) {
      const json = await prodCourseRes.json();
      prodCourseData = json.data;
    } else {
      console.warn(`⚠️ Failed to fetch course from production API: Status ${prodCourseRes.status}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Error fetching production course: ${err.message}`);
  }

  try {
    const prodModulesRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}/modules`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (prodModulesRes.ok) {
      const json = await prodModulesRes.json();
      prodModulesData = json.data || [];
    } else {
      console.warn(`⚠️ Failed to fetch modules from production API: Status ${prodModulesRes.status}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Error fetching production modules: ${err.message}`);
  }

  console.log(`✓ Production API: ${prodModulesData.length} modules returned.`);

  // 3. Validation Checks
  console.log('\n====================================================');
  console.log('RECURSIVE STRUCTURAL & CONTENT COMPARISON');
  console.log('====================================================\n');

  let allChecksPassed = true;
  let matchedContentHashes = 0;
  let totalContentChecks = 0;

  // Verification 1: Module Count
  const moduleCountMatches = localModules.length === 15 && prodModulesData.length === 15;
  console.log(`1. Module Counts: Localhost=${localModules.length}, Prod=${prodModulesData.length} -> ${moduleCountMatches ? '✅ PASS' : '❌ FAIL'}`);
  if (!moduleCountMatches) allChecksPassed = false;

  // Verification 2: Topic & Lesson recursive comparison
  for (let i = 0; i < 15; i++) {
    const localMod = localModules[i];
    const prodMod = prodModulesData[i];

    const expectedModId = `c-mod-${i + 1}`;
    const expectedLessonId = `c-unit-${i + 1}-notes`;

    console.log(`\n--- Validating Module ${i + 1}/15: [${expectedModId}] ---`);

    if (!localMod) {
      console.log(`❌ Localhost module ${i + 1} missing!`);
      allChecksPassed = false;
      continue;
    }
    if (!prodMod) {
      console.log(`❌ Production module ${i + 1} missing!`);
      allChecksPassed = false;
      continue;
    }

    // Module ID & Title
    const modIdMatch = localMod.id === expectedModId && prodMod.id === expectedModId;
    const modTitleMatch = localMod.title === prodMod.title;
    const modOrderMatch = (localMod.orderIndex ?? localMod.order) === (i + 1) && (prodMod.orderIndex ?? prodMod.order) === (i + 1);

    console.log(`  Module ID match: ${modIdMatch ? '✅' : '❌'} (Local: ${localMod.id}, Prod: ${prodMod.id})`);
    console.log(`  Module Title match: ${modTitleMatch ? '✅' : '❌'} ("${localMod.title}")`);
    console.log(`  Module Order match: ${modOrderMatch ? '✅' : '❌'} (Order: ${i + 1})`);

    if (!modIdMatch || !modTitleMatch || !modOrderMatch) allChecksPassed = false;

    // Topics Check
    const localTopics = localMod.topics || [];
    const prodTopics = prodMod.topics || [];
    const topicsCountMatch = localTopics.length === 1 && prodTopics.length === 1;
    console.log(`  Topics Count match: ${topicsCountMatch ? '✅' : '❌'} (Local: ${localTopics.length}, Prod: ${prodTopics.length})`);
    if (!topicsCountMatch) allChecksPassed = false;

    // Lesson / Unit Check
    const localLesson = localMod.lessons?.[0] || localTopics[0]?.learningUnits?.[0];
    const prodLesson = prodMod.lessons?.[0] || prodTopics[0]?.learningUnits?.[0];

    if (!localLesson || !prodLesson) {
      console.log(`  ❌ Lesson unit missing! (Local: ${!!localLesson}, Prod: ${!!prodLesson})`);
      allChecksPassed = false;
      continue;
    }

    const lessonIdMatch = localLesson.id === expectedLessonId && prodLesson.id === expectedLessonId;
    const lessonTitleMatch = localLesson.title === prodLesson.title;
    const localContent = localLesson.readingContent || localLesson.content || localLesson.conceptTheory || '';
    const prodContent = prodLesson.readingContent || prodLesson.content || prodLesson.conceptTheory || '';

    const localHash = hashContent(localContent);
    const prodHash = hashContent(prodContent);
    const hashMatch = localHash === prodHash;

    totalContentChecks++;
    if (hashMatch) matchedContentHashes++;
    else allChecksPassed = false;

    console.log(`  Lesson ID match: ${lessonIdMatch ? '✅' : '❌'} (${localLesson.id})`);
    console.log(`  Lesson Title match: ${lessonTitleMatch ? '✅' : '❌'} ("${localLesson.title}")`);
    console.log(`  Content Length: Local=${localContent.length} chars, Prod=${prodContent.length} chars`);
    console.log(`  Content SHA256 Hash match: ${hashMatch ? '✅' : '❌'} (${localHash.slice(0, 10)}... vs ${prodHash.slice(0, 10)}...)`);
  }

  // 4. Duplicate & Orphan Checks
  console.log('\n--- Duplicate / Orphan Document Checks ---');
  const duplicateModules = localModules.filter((m, idx) => localModules.findIndex(x => x.id === m.id) !== idx);
  console.log(`Duplicate Modules: ${duplicateModules.length === 0 ? '✅ NONE' : `❌ Found ${duplicateModules.length}`}`);

  // 5. Root stats check
  console.log('\n--- Root Course Stats Verification ---');
  console.log(`Total Modules in Doc: ${rootData.totalModules} (${rootData.totalModules === 15 ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`Total Lessons in Doc: ${rootData.totalLessons} (${rootData.totalLessons === 15 ? '✅ PASS' : '❌ FAIL'})`);
  console.log(`Total Duration: ${rootData.duration} (${rootData.totalDurationMinutes} mins)`);
  console.log(`Revision: ${rootData.revision}`);

  // 6. Concurrency / Hydration Protection Check
  console.log('\n--- Concurrency & Hydration Guard Verification ---');
  const { CourseService } = await import('../modules/courses/course.service');
  const { CourseRepository } = await import('../modules/courses/course.repository');
  const courseService = new CourseService(new CourseRepository());

  let emptyOverwriteBlocked = false;
  try {
    await courseService.updateCourse(courseId, {
      modules: []
    } as any);
  } catch (err: any) {
    if (err.message && err.message.includes('Cannot save empty module state')) {
      emptyOverwriteBlocked = true;
    }
  }
  console.log(`Anti-empty overwrite protection: ${emptyOverwriteBlocked ? '✅ PASS (Correctly blocked empty overwrite)' : '❌ FAIL'}`);

  let placeholderOverwriteBlocked = false;
  try {
    await courseService.updateCourse(courseId, {
      modules: [{ id: 'mod_1788248180158', title: 'Module 1: New Curriculum Module', topics: [] }]
    } as any);
  } catch (err: any) {
    if (err.message && err.message.includes('Cannot save unhydrated placeholder module state')) {
      placeholderOverwriteBlocked = true;
    }
  }
  console.log(`Anti-placeholder overwrite protection: ${placeholderOverwriteBlocked ? '✅ PASS (Correctly blocked unhydrated placeholder)' : '❌ FAIL'}`);

  const contentParityPercentage = totalContentChecks > 0 ? (matchedContentHashes / totalContentChecks) * 100 : 0;

  console.log('\n====================================================');
  console.log(`FINAL PARITY STATUS: ${allChecksPassed && contentParityPercentage === 100 ? '✅ 100% PARITY PASSED' : '❌ PARITY MISMATCH'}`);
  console.log(`Content Parity: ${contentParityPercentage.toFixed(1)}% (${matchedContentHashes}/${totalContentChecks} modules matched)`);
  console.log('====================================================\n');

  if (!allChecksPassed || contentParityPercentage !== 100) {
    process.exit(1);
  }
}

verifyParity()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Parity verification failed:', err);
    process.exit(1);
  });
