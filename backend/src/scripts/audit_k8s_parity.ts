import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function auditKubernetes() {
  if (!db) {
    console.error('Firebase DB is not initialized');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('READ-ONLY AUDIT: KUBERNETES COURSE PARITY IN FIRESTORE');
  console.log('================================================================');

  const canonicalId = 'kubernetes-complete-course-beginner-to-advanced';

  // 1. Search for all courses related to Kubernetes
  console.log('\n--- 1. SCANNING ALL COURSES IN FIRESTORE ---');
  const allCoursesSnap = await db.collection('courses').get();
  console.log(`Total courses in Firestore: ${allCoursesSnap.size}`);

  const k8sCourses: any[] = [];
  allCoursesSnap.docs.forEach((doc) => {
    const data = doc.data();
    const str = `${doc.id} ${data.slug || ''} ${data.title || ''}`.toLowerCase();
    if (str.includes('kuber') || str.includes('k8s')) {
      k8sCourses.push({
        id: doc.id,
        title: data.title,
        slug: data.slug,
        status: data.status,
        rootModulesCount: Array.isArray(data.modules) ? data.modules.length : 0,
        syllabusCount: Array.isArray(data.syllabus) ? data.syllabus.length : 0,
        totalLessons: data.totalLessons,
        updatedAt: data.updatedAt,
      });
    }
  });

  console.log(`Found ${k8sCourses.length} Kubernetes-related course document(s):`);
  console.log(JSON.stringify(k8sCourses, null, 2));

  // 2. Deep inspect canonical course root document
  console.log(`\n--- 2. ROOT COURSE DOCUMENT: "${canonicalId}" ---`);
  const courseDocRef = db.collection('courses').doc(canonicalId);
  const courseDocSnap = await courseDocRef.get();

  if (!courseDocSnap.exists) {
    console.log(`❌ Root document "${canonicalId}" DOES NOT EXIST in Firestore!`);
  } else {
    const data = courseDocSnap.data() || {};
    console.log(`✅ Root document exists.`);
    console.log(`Title: ${data.title}`);
    console.log(`Slug: ${data.slug}`);
    console.log(`Status: ${data.status}`);
    console.log(`Version: ${data.version}`);
    console.log(`Total Lessons field: ${data.totalLessons}`);
    console.log(`Duration Hours field: ${data.durationHours}`);
    console.log(`CreatedAt: ${data.createdAt}`);
    console.log(`UpdatedAt: ${data.updatedAt}`);
    console.log(`Root modules array length: ${Array.isArray(data.modules) ? data.modules.length : 'NOT AN ARRAY'}`);

    if (Array.isArray(data.modules)) {
      console.log('Root modules breakdown:');
      data.modules.forEach((m: any, idx: number) => {
        console.log(`  [${idx + 1}] ID: ${m.id} | Title: "${m.title}" | Topics: ${m.topics?.length || 0} | Units: ${m.topics?.[0]?.learningUnits?.length || 0}`);
      });
    }
  }

  // 3. Deep inspect canonical course subcollections: courses/{canonicalId}/modules
  console.log(`\n--- 3. MODULES SUBCOLLECTION: courses/${canonicalId}/modules ---`);
  const modulesSnap = await courseDocRef.collection('modules').get();
  console.log(`Total module documents in subcollection: ${modulesSnap.size}`);

  let totalSubcollectionLessons = 0;
  const subModulesList: any[] = [];

  for (const modDoc of modulesSnap.docs) {
    const modData = fromDocument<any>(modDoc);
    const lessonsSnap = await modDoc.ref.collection('lessons').get();
    totalSubcollectionLessons += lessonsSnap.size;

    const lessonsList: any[] = [];
    lessonsSnap.docs.forEach((lDoc) => {
      const lData = fromDocument<any>(lDoc);
      lessonsList.push({
        id: lDoc.id,
        title: lData.title,
        orderIndex: lData.orderIndex ?? lData.order,
        type: lData.type,
        hasReadingContent: Boolean(lData.readingContent || lData.content),
        contentLength: (lData.readingContent || lData.content || '').length,
      });
    });

    lessonsList.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    subModulesList.push({
      id: modDoc.id,
      title: modData.title,
      orderIndex: modData.orderIndex ?? modData.order,
      order: modData.order ?? modData.orderIndex,
      published: modData.published ?? modData.status ?? 'N/A',
      createdAt: modData.createdAt,
      updatedAt: modData.updatedAt,
      lessonsCount: lessonsSnap.size,
      lessons: lessonsList,
    });
  }

  subModulesList.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  console.log(`\nModules Subcollection Details (${subModulesList.length} modules):`);
  subModulesList.forEach((m, idx) => {
    console.log(`  Module ${idx + 1}:`);
    console.log(`    ID: ${m.id}`);
    console.log(`    Title: "${m.title}"`);
    console.log(`    OrderIndex: ${m.orderIndex}`);
    console.log(`    Status/Published: ${m.published}`);
    console.log(`    CreatedAt: ${m.createdAt}`);
    console.log(`    UpdatedAt: ${m.updatedAt}`);
    console.log(`    Lessons count: ${m.lessonsCount}`);
    m.lessons.forEach((l: any, lIdx: number) => {
      console.log(`      Lesson ${lIdx + 1}: [${l.id}] "${l.title}" (order: ${l.orderIndex}, type: ${l.type}, contentLen: ${l.contentLength})`);
    });
  });

  console.log(`\n================================================================`);
  console.log(`TOTAL SUBCOLLECTION MODULES: ${modulesSnap.size}`);
  console.log(`TOTAL SUBCOLLECTION LESSONS: ${totalSubcollectionLessons}`);
  console.log(`================================================================`);

  process.exit(0);
}

auditKubernetes().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
