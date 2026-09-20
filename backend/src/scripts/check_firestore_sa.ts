import { db } from '../firebase';

async function main() {
  try {
    const snapshot = await db.collection('courses').get();
    console.log(`Successfully connected! Found ${snapshot.size} courses:`);
    snapshot.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.data().title}`);
    });
  } catch (err) {
    console.error('Failed to fetch courses with Service Account:', err);
  }
  process.exit(0);
}

main();
