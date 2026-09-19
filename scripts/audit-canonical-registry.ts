import { db, isFirebaseAdminInitialized } from '../backend/src/firebase';

console.log('================================================================================');
console.log('KAIZENQ LMS — READ-ONLY CANONICAL COURSE REGISTRY & FIRESTORE AUDIT');
console.log('================================================================================\n');

const CANONICAL_COURSE_IDS = [
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

async function runReadOnlyAudit() {
  if (!isFirebaseAdminInitialized()) {
    console.error('ERROR: Firebase Admin SDK failed to initialize.');
    process.exit(1);
  }

  // 1. Fetch all documents from Firestore 'courses' collection
  console.log('>>> 1. Fetching all documents in Firestore "courses" collection...');
  const allCoursesSnap = await db.collection('courses').get();
  console.log(`Total documents in "courses" collection: ${allCoursesSnap.size}\n`);

  const allDocs = allCoursesSnap.docs.map(doc => ({
    id: doc.id,
    data: doc.data()
  }));

  console.log('--------------------------------------------------------------------------------');
  console.log('ALL FIRESTORE COURSE DOCUMENTS FOUND:');
  console.log('--------------------------------------------------------------------------------');
  for (const doc of allDocs) {
    const isCanonical = CANONICAL_COURSE_IDS.includes(doc.id);
    const title = doc.data.title || doc.data.name || 'Untitled';
    const slug = doc.data.slug || 'N/A';
    const status = doc.data.status || 'N/A';
    const isDeleted = Boolean(doc.data.isDeleted);
    const rootModCount = Array.isArray(doc.data.modules) ? doc.data.modules.length : 0;
    
    console.log(`- ID: ${doc.id.padEnd(48)} | Canonical: ${isCanonical ? 'YES' : 'NO '} | Status: ${status.padEnd(9)} | Deleted: ${isDeleted ? 'YES' : 'NO '} | Slug: ${slug.padEnd(45)} | Title: ${title}`);
  }

  // 2. Deep canonical subcollection & root modules audit for the 12 canonical courses
  console.log('\n--------------------------------------------------------------------------------');
  console.log('2. DEEP CANONICAL INVENTORY AUDIT (12 CANONICAL COURSES)');
  console.log('--------------------------------------------------------------------------------');

  let totalCanonicalModules = 0;
  let totalCanonicalLessons = 0;
  const canonicalBreakdown: any[] = [];

  for (const cId of CANONICAL_COURSE_IDS) {
    const docRef = db.collection('courses').doc(cId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.error(`❌ [MISSING] Canonical Course "${cId}" does not exist in Firestore!`);
      continue;
    }

    const cData = docSnap.data()!;
    const title = cData.title || cData.name || cId;
    const slug = cData.slug || cId;
    const status = cData.status || 'published';
    const isDeleted = Boolean(cData.isDeleted);

    // Query Subcollection: courses/{cId}/modules
    const subModsSnap = await docRef.collection('modules').get();
    let subcollectionModulesCount = subModsSnap.size;
    let subcollectionLessonsCount = 0;

    for (const modDoc of subModsSnap.docs) {
      const lessonsSnap = await modDoc.ref.collection('lessons').get();
      subcollectionLessonsCount += lessonsSnap.size;
    }

    // Query Root Embedded modules: cData.modules
    const rootModules = Array.isArray(cData.modules) ? cData.modules : [];
    const rootModulesCount = rootModules.length;
    let rootLessonsCount = 0;
    for (const m of rootModules) {
      const uCount = m.lessons?.length || m.topics?.flatMap((t: any) => t.learningUnits || []).length || 0;
      rootLessonsCount += uCount;
    }

    // Canonical source of truth count (subcollection first, fallback to root)
    const effectiveModCount = subcollectionModulesCount > 0 ? subcollectionModulesCount : rootModulesCount;
    const effectiveLessonCount = subcollectionLessonsCount > 0 ? subcollectionLessonsCount : rootLessonsCount;

    totalCanonicalModules += effectiveModCount;
    totalCanonicalLessons += effectiveLessonCount;

    canonicalBreakdown.push({
      courseId: cId,
      slug,
      title,
      status: isDeleted ? 'deleted' : status,
      subcollectionModulesCount,
      subcollectionLessonsCount,
      rootModulesCount,
      rootLessonsCount,
      effectiveModCount,
      effectiveLessonCount
    });

    console.log(`\n[COURSE] ${title}`);
    console.log(`  - ID:                      ${cId}`);
    console.log(`  - Slug:                    ${slug}`);
    console.log(`  - Status:                  ${isDeleted ? 'DELETED' : status.toUpperCase()}`);
    console.log(`  - Subcollection Modules:   ${subcollectionModulesCount} modules, ${subcollectionLessonsCount} lessons`);
    console.log(`  - Root Embedded Modules:   ${rootModulesCount} modules, ${rootLessonsCount} lessons`);
    console.log(`  - Authoritative Total:     ${effectiveModCount} modules, ${effectiveLessonCount} lessons`);
  }

  console.log('\n================================================================================');
  console.log('CANONICAL INVENTORY SUMMARY (FIRESTORE SOURCE OF TRUTH):');
  console.log('================================================================================');
  console.log(`Total Canonical Courses:  ${CANONICAL_COURSE_IDS.length}`);
  console.log(`Total Canonical Modules:  ${totalCanonicalModules}`);
  console.log(`Total Canonical Lessons:  ${totalCanonicalLessons}`);
  console.log('================================================================================\n');

  // 3. Comparison with Frontend Static Data Files
  console.log('--------------------------------------------------------------------------------');
  console.log('3. FRONTEND STATIC FIXTURES BREAKDOWN (frontend/src/data/*.ts):');
  console.log('--------------------------------------------------------------------------------');

  const { linuxCourseModules } = await import('../frontend/src/data/linuxCourseFullData');
  const { cCourseModules } = await import('../frontend/src/data/cCourseFullData');
  const { gitCourseModules } = await import('../frontend/src/data/gitCourseFullData');
  const { dbmsCourseModules } = await import('../frontend/src/data/dbmsCourseFullData');
  const { kubernetesCourseModules } = await import('../frontend/src/data/kubernetesCourseFullData');
  const { reactCourseModules } = await import('../frontend/src/data/reactCourseFullData');
  const { pythonCourseModules } = await import('../frontend/src/data/pythonCourseFullData');
  const { javaCourseModules } = await import('../frontend/src/data/javaCourseFullData');
  const { nodejsCourseModules } = await import('../frontend/src/data/nodejsCourseFullData');
  const { webDevCourseModules } = await import('../frontend/src/data/webDevCourseFullData');
  const { javascriptCourseModules } = await import('../frontend/src/data/javascriptCourseFullData');
  const { dsaCourseModules } = await import('../frontend/src/data/dsaCourseFullData');

  const staticFixtures = [
    { name: 'linuxCourseModules', list: linuxCourseModules },
    { name: 'cCourseModules', list: cCourseModules },
    { name: 'gitCourseModules', list: gitCourseModules },
    { name: 'dbmsCourseModules', list: dbmsCourseModules },
    { name: 'kubernetesCourseModules', list: kubernetesCourseModules },
    { name: 'reactCourseModules', list: reactCourseModules },
    { name: 'pythonCourseModules', list: pythonCourseModules },
    { name: 'javaCourseModules', list: javaCourseModules },
    { name: 'nodejsCourseModules', list: nodejsCourseModules },
    { name: 'webDevCourseModules', list: webDevCourseModules },
    { name: 'javascriptCourseModules', list: javascriptCourseModules },
    { name: 'dsaCourseModules', list: dsaCourseModules }
  ];

  let staticTotalMods = 0;
  let staticTotalLessons = 0;

  for (const fix of staticFixtures) {
    const modCount = fix.list.length;
    let lCount = 0;
    for (const m of fix.list) {
      lCount += (m as any).lessons?.length || (m as any).topics?.flatMap((t: any) => t.learningUnits || []).length || 0;
    }
    staticTotalMods += modCount;
    staticTotalLessons += lCount;
    console.log(`- ${fix.name.padEnd(28)}: ${String(modCount).padStart(3)} modules, ${String(lCount).padStart(3)} lessons`);
  }

  console.log(`\nStatic Fixtures Total: ${staticTotalMods} modules, ${staticTotalLessons} lessons\n`);

  console.log('================================================================================');
  console.log('AUDIT COMPLETED (READ-ONLY: 0 DATABASE MUTATIONS)');
  console.log('================================================================================');
}

runReadOnlyAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
