import { db } from '../firebase';
import * as fs from 'fs';
import * as path from 'path';

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
    
    const lessonsData: any[] = [];
    
    for (const mod of modules) {
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', mod.id)
        .get();
        
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        order: doc.data().order,
        type: doc.data().type,
        moduleId: doc.data().moduleId
      }));
      
      lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      lessonsData.push({
        moduleId: mod.id,
        moduleTitle: mod.title,
        lessons: lessons
      });
    }
    
    const outputPath = path.join(__dirname, 'lms_lessons_metadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(lessonsData, null, 2), 'utf8');
    console.log(`Successfully exported lessons metadata to ${outputPath}`);
    
  } catch (err) {
    console.error('Error exporting metadata:', err);
  }
  process.exit(0);
}

main();
