import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function auditCProgramming() {
  console.log('====================================================');
  console.log('STEP 2: READ-ONLY AUDIT OF C PROGRAMMING COURSE');
  console.log('====================================================\n');

  const courseId = 'c-programming-course-id';

  // 1. LOCALHOST FIRESTORE AUDIT
  console.log('[1. LOCALHOST FIRESTORE DATA]');
  const courseRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseRef.get();

  let localhostData: any = null;

  if (!courseSnap.exists) {
    console.log(`❌ Course document "${courseId}" NOT found in Firestore!`);
  } else {
    const rawData = fromDocument<any>(courseSnap);
    console.log(`✓ Course Document Found:`);
    console.log(`  - Title: "${rawData.title}"`);
    console.log(`  - Slug: "${rawData.slug}"`);
    console.log(`  - Total Modules in doc: ${rawData.totalModules}`);
    console.log(`  - Total Lessons in doc: ${rawData.totalLessons}`);
    console.log(`  - Root modules[] length: ${rawData.modules?.length || 0}`);
    console.log(`  - Root syllabus[] length: ${rawData.syllabus?.length || 0}`);
    console.log(`  - Revision: ${rawData.revision || rawData.version || 1}`);

    // Fetch subcollections
    const subModulesSnap = await courseRef.collection('modules').get();
    console.log(`  - Subcollection modules count: ${subModulesSnap.size}`);

    const subModules: any[] = [];
    for (const mDoc of subModulesSnap.docs) {
      const mData = fromDocument<any>(mDoc);
      const lessonsSnap = await mDoc.ref.collection('lessons').get();
      const lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...fromDocument<any>(l) }));
      lessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
      subModules.push({
        id: mDoc.id,
        ...mData,
        lessons,
      });
    }
    subModules.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

    localhostData = {
      rootDoc: rawData,
      subcollectionModules: subModules,
    };

    console.log('\n  Localhost Subcollection Modules Summary:');
    subModules.forEach((m, idx) => {
      console.log(`    [${idx + 1}] ID: ${m.id} | Title: "${m.title}" | Order: ${m.orderIndex ?? m.order} | Lessons: ${m.lessons?.length || 0} | Topics: ${m.topics?.length || 0}`);
      m.lessons?.forEach((l: any, lIdx: number) => {
        const cLen = (l.content || l.readingContent || '').length;
        console.log(`        (${lIdx + 1}) Lesson ID: ${l.id} | Title: "${l.title}" | Content Length: ${cLen} chars | Type: ${l.type}`);
      });
    });

    if (rawData.modules && rawData.modules.length > 0) {
      console.log('\n  Localhost Root Doc modules[] Summary:');
      rawData.modules.forEach((m: any, idx: number) => {
        const topCount = m.topics?.length || 0;
        const unitCount = m.topics?.reduce((sum: number, t: any) => sum + (t.learningUnits?.length || 0), 0) || 0;
        console.log(`    [${idx + 1}] ID: ${m.id} | Title: "${m.title}" | Topics: ${topCount} | LearningUnits: ${unitCount}`);
        m.topics?.forEach((t: any, tIdx: number) => {
          console.log(`        Topic [${tIdx + 1}] ID: ${t.id} | Title: "${t.title}" | Units: ${t.learningUnits?.length || 0}`);
          t.learningUnits?.forEach((u: any, uIdx: number) => {
            const uLen = (u.readingContent || u.content || u.conceptTheory || '').length;
            console.log(`            Unit (${uIdx + 1}) ID: ${u.id} | Title: "${u.title}" | Content: ${uLen} chars`);
          });
        });
      });
    }
  }

  // 2. PRODUCTION API AUDIT
  console.log('\n====================================================');
  console.log('[2. PRODUCTION API DATA (https://www.kaizenq.in)]');
  console.log('====================================================\n');

  let prodCourseData: any = null;
  let prodModulesData: any = null;

  try {
    const courseRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    console.log(`Production Course API Status: ${courseRes.status}`);
    if (courseRes.ok) {
      const json = await courseRes.json();
      prodCourseData = json.data;
      console.log(`✓ Production Course Document:`);
      console.log(`  - Title: "${prodCourseData?.title}"`);
      console.log(`  - Total Modules: ${prodCourseData?.totalModules}`);
      console.log(`  - Total Lessons: ${prodCourseData?.totalLessons}`);
      console.log(`  - modules[] length: ${prodCourseData?.modules?.length || 0}`);
      console.log(`  - syllabus[] length: ${prodCourseData?.syllabus?.length || 0}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ Error fetching production course: ${err.message}`);
  }

  try {
    const modulesRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}/modules`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    console.log(`\nProduction Modules API Status: ${modulesRes.status}`);
    if (modulesRes.ok) {
      const json = await modulesRes.json();
      prodModulesData = json.data || [];
      console.log(`✓ Production Modules Count: ${prodModulesData.length}`);
      prodModulesData.forEach((m: any, idx: number) => {
        const topCount = m.topics?.length || 0;
        const lessonCount = m.lessons?.length || 0;
        console.log(`  [${idx + 1}] ID: ${m.id} | Title: "${m.title}" | Order: ${m.orderIndex ?? m.order} | Lessons: ${lessonCount} | Topics: ${topCount}`);
      });
    }
  } catch (err: any) {
    console.warn(`⚠️ Error fetching production modules: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log('READ-ONLY AUDIT COMPLETED');
  console.log('====================================================\n');
}

auditCProgramming()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
