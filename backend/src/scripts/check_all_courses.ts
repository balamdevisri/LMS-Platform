import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('--- LISTING ALL DOCUMENTS IN COURSES COLLECTION ---');
  const snap = await db.collection('courses').get();
  
  console.log(`Total course documents: ${snap.size}`);
  for (const doc of snap.docs) {
    const data = doc.data();
    console.log(`Document ID: ${doc.id}`);
    console.log(`  Title: ${data.title}`);
    console.log(`  Slug: ${data.slug}`);
    console.log(`  Has modules field: ${'modules' in data}`);
    if ('modules' in data) {
      console.log(`  Modules type: ${typeof data.modules}, Length: ${data.modules?.length}`);
    }
  }
  
  process.exit(0);
}

main();
