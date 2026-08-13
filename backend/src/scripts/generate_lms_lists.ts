import { db } from '../firebase';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const courseId = 'react-js-complete-course';
  let mdContent = `# LMS Course Structure: ${courseId}\n\n`;
  
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      console.error(`Course ${courseId} not found in Firestore.`);
      process.exit(1);
    }
    
    // Get all modules for this course
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', courseId)
      .get();
      
    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    for (const mod of modules) {
      mdContent += `### Module ID: \`${mod.id}\` | Title: "${mod.title}" (Order: ${mod.order})\n`;
      
      // Get all lessons for this module
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', mod.id)
        .get();
        
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      for (const les of lessons) {
        mdContent += `- Unit ID: \`${les.id}\` | Title: "${les.title}" (Order: ${les.order}, Type: ${les.type})\n`;
      }
      mdContent += '\n';
    }
    
    const outputPath = path.join(__dirname, 'lms_react_structure.md');
    fs.writeFileSync(outputPath, mdContent, 'utf8');
    console.log(`Successfully wrote structure to ${outputPath}`);
    
  } catch (err) {
    console.error('Error generating structure:', err);
  }
  process.exit(0);
}

main();
