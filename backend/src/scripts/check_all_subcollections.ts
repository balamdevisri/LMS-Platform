import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkDuplicates() {
  const { db } = await import('../firebase');
  const snapshot = await db.collection('courses').get();

  console.log('=== FIRESTORE COURSES SUMMARY ===');
  console.log('Total course docs in Firestore:', snapshot.docs.length);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const modsSnap = await doc.ref.collection('modules').get();
    let totalSubLessons = 0;
    const moduleDetails: any[] = [];

    for (const mDoc of modsSnap.docs) {
      const lessonsSnap = await mDoc.ref.collection('lessons').get();
      totalSubLessons += lessonsSnap.docs.length;
      const lessonTitles = lessonsSnap.docs.map(l => `[${l.id}] ${l.data().title}`);
      moduleDetails.push({
        id: mDoc.id,
        title: mDoc.data().title,
        lessonCount: lessonsSnap.docs.length,
        lessons: lessonTitles,
      });
    }

    console.log(`\nCourse: [${doc.id}] "${data.title}" (slug: ${data.slug}, status: ${data.status})`);
    console.log(`  - Root modules[] length: ${data.modules?.length ?? 0}`);
    console.log(`  - Subcollection modules count: ${modsSnap.docs.length}, total sub-lessons: ${totalSubLessons}`);
    if (modsSnap.docs.length > 0) {
      moduleDetails.slice(0, 3).forEach(m => {
        console.log(`    Mod [${m.id}] "${m.title}" -> ${m.lessonCount} lessons: ${m.lessons.join(', ')}`);
      });
      if (moduleDetails.length > 3) {
        console.log(`    ... and ${moduleDetails.length - 3} more modules`);
      }
    }
  }
}

checkDuplicates();
