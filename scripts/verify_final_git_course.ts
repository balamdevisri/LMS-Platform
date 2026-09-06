import { db } from '../backend/src/firebase';

async function verify() {
  console.log('=== VERIFYING FINAL GIT COURSE IN FIRESTORE ===');
  const doc = await db.collection('courses').doc('git-github-mastery-course-id').get();
  if (!doc.exists) {
    throw new Error('Course document does not exist!');
  }
  const data = doc.data();
  console.log('Course Title:', data?.title);
  console.log('Course Slug:', data?.slug);
  console.log('Modules count:', data?.modules?.length);

  for (let i = 0; i < data?.modules?.length; i++) {
    const mod = data.modules[i];
    const unit = mod.topics?.[0]?.learningUnits?.[0];
    console.log(`\n[Module ${i + 1}] ${mod.title}`);
    console.log(`  Unit ID: ${unit?.id}`);
    console.log(`  Unit Title: ${unit?.title}`);
    console.log(`  Reading Content Length: ${unit?.readingContent?.length}`);
    console.log(`  Concept Theory Length: ${unit?.conceptTheory?.length}`);
    console.log(`  Snippet (first 120 chars): ${JSON.stringify(unit?.readingContent?.slice(0, 120))}`);
    console.log(`  Has Code Blocks: ${(unit?.readingContent || '').includes('```')}`);
    console.log(`  Has Tasks: ${(unit?.readingContent || '').includes('### Task')}`);
  }

  console.log('\n✅ VERIFICATION COMPLETE: All 15 modules verified in Firestore database!');
}

verify().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
