import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const courseId = 'react-js-complete-course';
  
  try {
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', courseId)
      .get();
      
    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log(`Course: ${courseId}`);
    for (const mod of modules) {
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', mod.id)
        .get();
        
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      let totalLength = 0;
      let minLength = 999999;
      let maxLength = 0;
      
      lessons.forEach(l => {
        const len = (l.content || '').length;
        totalLength += len;
        if (len < minLength) minLength = len;
        if (len > maxLength) maxLength = len;
      });
      
      const avgLength = lessons.length > 0 ? Math.round(totalLength / lessons.length) : 0;
      console.log(`- Module ${mod.order} (${mod.id}): "${mod.title}" | Lessons: ${lessons.length} | Avg Length: ${avgLength} chars | Min: ${minLength === 999999 ? 0 : minLength} | Max: ${maxLength}`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
