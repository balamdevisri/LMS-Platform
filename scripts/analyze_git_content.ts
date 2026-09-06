import fs from 'fs';
import { db } from '../backend/src/firebase';

async function analyzeContent() {
  const jsonContent = JSON.parse(fs.readFileSync('./github_lms_content.json', 'utf8'));
  console.log('JSON Course name:', jsonContent.course_name);
  console.log('JSON Modules count:', jsonContent.modules.length);

  const courseDoc = await db.collection('courses').doc('git-github-mastery-course-id').get();
  const firestoreData = courseDoc.data();
  console.log('\nFirestore modules count:', firestoreData?.modules?.length);

  for (let i = 0; i < 15; i++) {
    const jsonMod = jsonContent.modules[i];
    const fsMod = firestoreData?.modules?.[i];
    const unit = fsMod?.topics?.[0]?.learningUnits?.[0];

    console.log(`\n---------------- MODULE ${i + 1} ----------------`);
    console.log('JSON Title:', jsonMod?.title, '| Len:', jsonMod?.content?.length);
    console.log('Firestore Mod Title:', fsMod?.title);
    console.log('Firestore Unit ID:', unit?.id, '| Title:', unit?.title);
    console.log('Firestore ReadingContent Len:', unit?.readingContent?.length);
    console.log('Firestore ReadingContent first 200 chars:');
    console.log(JSON.stringify(unit?.readingContent?.slice(0, 200)));
  }
}

analyzeContent().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
