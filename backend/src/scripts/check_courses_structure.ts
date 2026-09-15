import { db } from '../firebase';

async function main() {
  const snap = await db.collection('courses').get();
  console.log(`Found ${snap.size} courses:`);
  for (const doc of snap.docs) {
    const data = doc.data();
    const subMods = await db.collection('courses').doc(doc.id).collection('modules').get();
    console.log(`- Course ID: "${doc.id}" | Title: "${data.title}" | root.modules: ${data.modules?.length ?? 0} | root.syllabus: ${data.syllabus?.length ?? 0} | subcollection modules: ${subMods.size}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
