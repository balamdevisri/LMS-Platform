import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';

async function backupAllCourses() {
  console.log('📦 Starting pre-migration backup of all Firestore courses...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFile = path.join(backupDir, `courses_backup_${timestamp}.json`);

  const coursesSnapshot = await db.collection('courses').get();
  const backupData: any[] = [];

  console.log(`Found ${coursesSnapshot.size} course document(s) in Firestore.`);

  for (const doc of coursesSnapshot.docs) {
    const courseData: any = { id: doc.id, ...doc.data() };
    const modulesData: any[] = [];

    // Check nested modules subcollection
    const modulesSnapshot = await doc.ref.collection('modules').get();
    for (const modDoc of modulesSnapshot.docs) {
      const moduleItem: any = { id: modDoc.id, ...modDoc.data() };
      const lessonsData: any[] = [];

      // Check nested lessons subcollection
      const lessonsSnapshot = await modDoc.ref.collection('lessons').get();
      for (const lessonDoc of lessonsSnapshot.docs) {
        lessonsData.push({ id: lessonDoc.id, ...lessonDoc.data() });
      }

      moduleItem.lessons = lessonsData;
      modulesData.push(moduleItem);
    }

    courseData.subcollectionModules = modulesData;
    backupData.push(courseData);
    console.log(`  - Backed up course: "${courseData.title || courseData.id}" with ${modulesData.length} subcollection modules.`);
  }

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✅ Backup successfully saved to ${backupFile}`);
  console.log(`   Total size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
}

if (require.main === module) {
  backupAllCourses()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Pre-migration backup failed:', err);
      process.exit(1);
    });
}

export { backupAllCourses };
