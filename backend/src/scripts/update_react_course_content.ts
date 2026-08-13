import { db } from '../firebase';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const jsonPath = path.join(__dirname, 'lms_lessons_with_content.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: Content file not found at ${jsonPath}`);
    process.exit(1);
  }
  
  const modulesList = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  console.log('--- STARTING FIRESTORE UPDATE PROCESS ---');
  const now = new Date().toISOString();
  let updateCount = 0;
  
  try {
    for (const mod of modulesList) {
      console.log(`\nUpdating Module: "${mod.moduleTitle}" (${mod.moduleId})...`);
      for (const les of mod.lessons) {
        if (!les.content) {
          console.warn(`  Warning: Lesson ${les.id} has empty content. Skipping.`);
          continue;
        }
        
        // Update lesson document in Firestore
        await db.collection('lessons').doc(les.id).update({
          content: les.content,
          updatedAt: now
        });
        
        updateCount++;
        if (updateCount % 10 === 0) {
          console.log(`  Progress: Updated ${updateCount} lessons...`);
        }
      }
    }
    
    console.log(`\n--- SUCCESS: Updated ${updateCount} lessons in Firestore. ---`);
    
  } catch (err) {
    console.error('Error during Firestore updates:', err);
    process.exit(1);
  }
  process.exit(0);
}

main();
