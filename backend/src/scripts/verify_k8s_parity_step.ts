import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { cleanCourseContent } from '../utils/contentCleaner';

async function inspectAndCompare() {
  const jsonPath = path.resolve(__dirname, '../../../kubernetes_lms_content.json');
  const jsonRaw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('==================================================');
  console.log('COMPARING FIRESTORE VS AUTHORITATIVE SOURCE');
  console.log('==================================================\n');

  const courseDoc = await db.collection('courses').doc('kubernetes-complete-course-beginner-to-advanced').get();
  console.log(`Course Doc Exists: ${courseDoc.exists}`);
  const cData = courseDoc.data() || {};
  console.log(`Course Title: ${cData.title}`);
  console.log(`Course totalModules: ${cData.totalModules}, totalLessons: ${cData.totalLessons}`);
  console.log(`Course Root modules[] count: ${cData.modules?.length}`);

  let allMatch = true;

  for (let i = 1; i <= 15; i++) {
    const modId = `k8s-mod-${i}`;
    const lessonId = `k8s-lesson-${i}-1`;

    const modDoc = await db
      .collection('courses')
      .doc('kubernetes-complete-course-beginner-to-advanced')
      .collection('modules')
      .doc(modId)
      .get();

    const lessonDoc = await db
      .collection('courses')
      .doc('kubernetes-complete-course-beginner-to-advanced')
      .collection('modules')
      .doc(modId)
      .collection('lessons')
      .doc(lessonId)
      .get();

    const rawMod = jsonRaw.modules[i - 1];
    const cleanedAuthContent = cleanCourseContent(rawMod.content || '');

    const firestoreModData = modDoc.data() || {};
    const firestoreLessonData = lessonDoc.data() || {};
    const firestoreContent = firestoreLessonData.readingContent || firestoreLessonData.content || '';

    const matches = firestoreContent === cleanedAuthContent;
    if (!matches) allMatch = false;

    console.log(`Module ${i} (${modId}):`);
    console.log(`  - Module doc exists: ${modDoc.exists} | title: "${firestoreModData.title}" | order: ${firestoreModData.orderIndex ?? firestoreModData.order}`);
    console.log(`  - Lesson doc exists: ${lessonDoc.exists} | id: "${lessonId}" | title: "${firestoreLessonData.title}"`);
    console.log(`  - Content length: Firestore=${firestoreContent.length} chars, Authoritative=${cleanedAuthContent.length} chars`);
    console.log(`  - Exact Match: ${matches ? '✅ YES' : '❌ NO'}`);
  }

  console.log('\n==================================================');
  console.log(`All 15 Modules & Lessons Match Authoritative Source: ${allMatch ? '✅ YES' : '❌ NO'}`);
  console.log('==================================================\n');
}

inspectAndCompare()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
