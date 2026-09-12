import { db } from '../firebase';

async function listCoursePrices() {
  console.log('Fetching all courses from Firestore...');
  const snap = await db.collection('courses').get();
  console.log(`Total courses in Firestore: ${snap.size}`);
  snap.docs.forEach((doc) => {
    const d = doc.data();
    console.log(`Doc ID: ${doc.id.padEnd(45)} | Slug: ${(d.slug || '').padEnd(45)} | Price: ${String(d.price).padEnd(6)} | Title: ${d.title}`);
  });
}

listCoursePrices()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
