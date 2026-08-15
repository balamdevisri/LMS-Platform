import { db } from '../firebase';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }

  const jsonPath = path.resolve(__dirname, '../../../github_lms_content.json');
  console.log(`Loading JSON from: ${jsonPath}`);
  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const courseId = 'git-github-mastery-course-id';
  console.log(`Checking Firestore course: ${courseId}`);

  let totalJsonChars = 0;
  let totalDbChars = 0;
  let mismatchCount = 0;

  for (const mod of jsonContent.modules) {
    const mNum = mod.module_number;
    const jsonText = mod.content;
    totalJsonChars += jsonText.length;

    const lessonId = `git-unit-${mNum}-notes`;
    const doc = await db.collection('lessons').doc(lessonId).get();

    if (!doc.exists) {
      console.error(`ERROR: Lesson document "${lessonId}" is missing in Firestore!`);
      mismatchCount++;
      continue;
    }

    const dbText = doc.data()?.content || '';
    totalDbChars += dbText.length;

    if (jsonText !== dbText) {
      console.error(`ERROR: Content mismatch on module ${mNum}!`);
      console.log(`   JSON length: ${jsonText.length}, DB length: ${dbText.length}`);
      mismatchCount++;
    } else {
      console.log(`OK: Module ${mNum} text matches perfectly (${jsonText.length} chars).`);
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Total Modules Checked: ${jsonContent.modules.length}`);
  console.log(`Total Character Count in JSON: ${totalJsonChars}`);
  console.log(`Total Character Count in DB:   ${totalDbChars}`);
  
  if (mismatchCount === 0 && totalJsonChars === totalDbChars) {
    console.log('OK: Database content matches JSON content perfectly! No content was shortened, omitted, or altered.');
    process.exit(0);
  } else {
    console.error(`ERROR: Detected ${mismatchCount} mismatches or character differences!`);
    process.exit(1);
  }
}

main();
