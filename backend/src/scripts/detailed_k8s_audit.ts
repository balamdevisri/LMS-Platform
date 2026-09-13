import { db, isFirebaseAdminInitialized } from '../firebase';
import { CourseContentService } from '../services/course/courseContent.service';
import { CourseService } from '../modules/courses/course.service';

const courseContentService = new CourseContentService();
const courseService = new CourseService();

async function detailedK8sAudit() {
  console.log('=== DETAILED KUBERNETES COURSE AUDIT ===\n');

  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const docSnap = await db.collection('courses').doc(courseId).get();

  if (!docSnap.exists) {
    console.error('Course document NOT found in Firestore!');
    return;
  }

  const courseData = docSnap.data()!;
  console.log('Course ID:', docSnap.id);
  console.log('Title:', courseData.title);
  console.log('Slug:', courseData.slug);
  console.log('Revision:', courseData.revision || courseData.version);
  console.log('Root doc.modules length:', courseData.modules?.length);

  console.log('\n--- ROOT DOC.MODULES INSPECTION ---');
  if (Array.isArray(courseData.modules)) {
    courseData.modules.forEach((mod: any, idx: number) => {
      console.log(`\n[Module ${idx + 1}] ID: ${mod.id} | Order: ${mod.order} | Title: ${mod.title}`);
      console.log(`  Duration: ${mod.duration}, Description: ${mod.description?.slice(0, 60)}...`);
      console.log(`  Topics Count: ${mod.topics?.length || 0}`);
      if (Array.isArray(mod.topics)) {
        mod.topics.forEach((t: any, tIdx: number) => {
          const units = t.learningUnits || t.units || [];
          console.log(`    [Topic ${tIdx + 1}] ID: ${t.id} | Title: ${t.title} | Units: ${units.length}`);
          units.forEach((u: any, uIdx: number) => {
            const contentLength = (u.content || u.readingContent || u.conceptTheory || '').length;
            console.log(`      [Unit ${uIdx + 1}] ID: ${u.id} | Title: ${u.title} | Type: ${u.type} | Content Length: ${contentLength} chars`);
          });
        });
      }
      if (Array.isArray(mod.lessons)) {
        console.log(`  Embedded Lessons Count: ${mod.lessons.length}`);
        mod.lessons.forEach((l: any, lIdx: number) => {
          console.log(`    [Lesson ${lIdx + 1}] ID: ${l.id} | Title: ${l.title} | Content Length: ${(l.content || l.readingContent || '').length} chars`);
        });
      }
    });
  }

  console.log('\n--- CANONICAL SUBCOLLECTIONS (courses/{courseId}/modules) ---');
  const subModulesSnap = await db.collection('courses').doc(courseId).collection('modules').get();
  console.log(`Total subcollection modules: ${subModulesSnap.size}`);

  const sortedSubDocs = subModulesSnap.docs.sort((a, b) => {
    const oA = a.data().orderIndex ?? a.data().order ?? 0;
    const oB = b.data().orderIndex ?? b.data().order ?? 0;
    return oA - oB;
  });

  for (const modDoc of sortedSubDocs) {
    const mData = modDoc.data();
    console.log(`\n[SubMod] ID: ${modDoc.id} | Order: ${mData.orderIndex ?? mData.order} | Title: ${mData.title}`);
    console.log(`  Duration: ${mData.duration}, Description: ${mData.description?.slice(0, 60)}...`);
    const lessonsSnap = await db.collection('courses').doc(courseId).collection('modules').doc(modDoc.id).collection('lessons').get();
    console.log(`  SubLessons count: ${lessonsSnap.size}`);
    lessonsSnap.docs.forEach((lDoc, lIdx) => {
      const lData = lDoc.data();
      const contentLen = (lData.content || lData.readingContent || lData.conceptTheory || '').length;
      console.log(`    [SubLesson ${lIdx + 1}] ID: ${lDoc.id} | Order: ${lData.orderIndex ?? lData.order} | Title: ${lData.title} | Type: ${lData.type} | Content Length: ${contentLen} chars`);
    });
  }

  console.log('\n--- COURSE SERVICE getCourseModules OUTPUT ---');
  const serviceModules = await courseService.getCourseModules(courseId);
  console.log('Total modules returned by courseService.getCourseModules:', serviceModules.length);
  serviceModules.forEach((m: any, idx: number) => {
    console.log(`[ServiceMod ${idx + 1}] ID: ${m.id} | Order: ${m.orderIndex ?? m.order} | Title: ${m.title} | Topics: ${m.topics?.length} | Lessons: ${m.lessons?.length}`);
  });
}

detailedK8sAudit().catch(console.error);
