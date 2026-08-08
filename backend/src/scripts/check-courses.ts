import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  try {
    const snapshot = await db.collection('courses').get();
    console.log(`Found ${snapshot.size} courses in database:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id} | Title: "${data.title}" | Status: "${data.status}"`);
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
  }
  process.exit(0);
}

main();
