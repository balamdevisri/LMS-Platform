import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const lessonId = 'react-unit-1-1';
  
  try {
    const doc = await db.collection('lessons').doc(lessonId).get();
    if (!doc.exists) {
      console.error(`Lesson ${lessonId} not found.`);
      process.exit(1);
    }
    
    const data = doc.data();
    console.log(`Lesson ID: ${lessonId}`);
    console.log(`Title: "${data?.title}"`);
    console.log(`updatedAt: ${JSON.stringify(data?.updatedAt)}`);
    console.log(`Content snippet: ${JSON.stringify(data?.content?.substring(0, 150))}`);
  } catch (err) {
    console.error('Error fetching lesson:', err);
  }
  process.exit(0);
}

main();
