import { db } from '../firebase';

async function main() {
  const docSnap = await db.collection('courses').doc('kubernetes-complete-course-beginner-to-advanced').get();
  if (!docSnap.exists) {
    console.log('Document does not exist');
    return;
  }
  const data = docSnap.data();
  console.log('--- DIRECT FIRESTORE DOC SNAPSHOT ---');
  console.log('Keys in doc:', Object.keys(data || {}));
  console.log('id:', docSnap.id);
  console.log('title:', data?.title);
  console.log('slug:', data?.slug);
  console.log('version:', data?.version);
  console.log('updatedAt:', data?.updatedAt);
  console.log('updatedBy:', data?.updatedBy);
  console.log('modules isArray:', Array.isArray(data?.modules));
  console.log('modules length:', data?.modules?.length);
  console.log('modules summary:', data?.modules?.map((m: any) => ({ id: m.id, title: m.title, topics: m.topics?.length })));
  
  console.log('\n--- SUBCOLLECTIONS ---');
  const subModules = await db.collection('courses').doc('kubernetes-complete-course-beginner-to-advanced').collection('modules').get();
  console.log('Subcollection modules count:', subModules.size);
  for (const doc of subModules.docs) {
    const m = doc.data();
    const lessons = await doc.ref.collection('lessons').get();
    console.log(`  SubModule ID: ${doc.id} | title: "${m.title}" | orderIndex: ${m.orderIndex ?? m.order} | lessons: ${lessons.size}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
