import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const courseId = 'react-js-complete-course';
  
  try {
    const lessonsSnapshot = await db.collection('lessons')
      .where('courseId', '==', courseId)
      .limit(3)
      .get();
      
    console.log(`Found ${lessonsSnapshot.size} lessons. Dumping first 3:`);
    lessonsSnapshot.forEach(doc => {
      console.log(`\nLesson ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } catch (err) {
    console.error('Error fetching lessons:', err);
  }
  process.exit(0);
}

main();
