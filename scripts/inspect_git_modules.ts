import { db } from '../backend/src/firebase';

async function checkModules() {
  const courseDoc = await db.collection('courses').doc('git-github-mastery-course-id').get();
  const data = courseDoc.data();
  console.log('=== COURSE DOC MODULES ===');
  if (data?.modules) {
    for (let i = 0; i < data.modules.length; i++) {
      const m = data.modules[i];
      const unit = m.topics?.[0]?.learningUnits?.[0];
      console.log(`Module ${i + 1} (${m.id}): ${m.title}`);
      console.log(`  Unit ID: ${unit?.id}, Title: ${unit?.title}`);
      console.log(`  readingContent len: ${unit?.readingContent?.length || 0}`);
      console.log(`  readingContent snippet: ${JSON.stringify(unit?.readingContent?.slice(0, 200))}`);
    }
  }

  // Also check if there are other courses or documents
  const allCoursesSnap = await db.collection('courses').get();
  for (const doc of allCoursesSnap.docs) {
    if (doc.id.includes('git') || (doc.data()?.slug && doc.data()?.slug.includes('git'))) {
      console.log(`\nFound Course Doc: ${doc.id}`);
      console.log(`  Title: ${doc.data()?.title}`);
      console.log(`  Slug: ${doc.data()?.slug}`);
      console.log(`  Modules in doc: ${doc.data()?.modules?.length}`);
    }
  }
}

checkModules().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
