import { db } from '../backend/src/firebase';

async function check() {
  const collections = await db.listCollections();
  console.log('Root collections:', collections.map(c => c.id));
  
  for (const col of collections) {
    try {
      const snap1 = await col.where('courseId', '==', 'git-github-mastery-course-id').get();
      if (!snap1.empty) {
        console.log(`Collection ${col.id} has ${snap1.docs.length} docs for git-github-mastery-course-id`);
        console.log(`  Sample:`, snap1.docs[0].id, JSON.stringify(snap1.docs[0].data()).slice(0, 300));
      }
      const snap2 = await col.where('courseId', '==', 'git-github-mastery').get();
      if (!snap2.empty) {
        console.log(`Collection ${col.id} has ${snap2.docs.length} docs for git-github-mastery`);
        console.log(`  Sample:`, snap2.docs[0].id, JSON.stringify(snap2.docs[0].data()).slice(0, 300));
      }
    } catch (e) {
      // not indexed or query error
    }
  }

  // Also check course doc
  const courseDoc = await db.collection('courses').doc('git-github-mastery-course-id').get();
  if (courseDoc.exists) {
    const data = courseDoc.data();
    console.log('--- Course Doc git-github-mastery-course-id ---');
    console.log('Modules count:', data?.modules?.length);
    if (data?.modules) {
      data.modules.forEach((m: any, mIdx: number) => {
        console.log(`Module [${mIdx}] ${m.id}: ${m.title}`);
        m.topics?.forEach((t: any, tIdx: number) => {
          console.log(`  Topic [${tIdx}] ${t.id}: ${t.title}`);
          t.learningUnits?.forEach((u: any, uIdx: number) => {
            console.log(`    Unit [${uIdx}] ${u.id}: ${u.title} (${u.type}) - readingContent len: ${u.readingContent?.length || 0}, conceptTheory len: ${u.conceptTheory?.length || 0}`);
          });
        });
      });
    }
  }
}

check().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
