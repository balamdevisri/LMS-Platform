import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const courseId = 'react-js-complete-course';
  console.log(`Inspecting course: ${courseId}`);
  
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      console.error(`Course ${courseId} not found in Firestore.`);
      process.exit(1);
    }
    
    const courseData = courseDoc.data();
    console.log(`Course Title: "${courseData?.title}"`);
    console.log(`Syllabus Modules Count: ${courseData?.syllabus?.length || 0}`);
    
    // Get all modules for this course
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', courseId)
      .get();
      
    console.log(`Found ${modulesSnapshot.size} modules in 'modules' collection.`);
    
    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Sort modules by order
    modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    for (const mod of modules) {
      console.log(`\nModule ID: ${mod.id} | Order: ${mod.order} | Title: "${mod.title}"`);
      
      // Get all lessons for this module
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', mod.id)
        .get();
        
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Sort lessons by order
      lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      console.log(`  Learning Units (${lessons.length}):`);
      for (const les of lessons) {
        console.log(`  - Lesson ID: ${les.id} | Order: ${les.order} | Title: "${les.title}" | Type: ${les.type}`);
      }
    }
    
  } catch (err) {
    console.error('Error during inspection:', err);
  }
  process.exit(0);
}

main();
