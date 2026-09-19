import { db } from '../firebase';

async function check() {
  const doc = await db.collection('courses').doc('c-programming-course-id').get();
  const d = doc.data() || {};
  console.log('Root doc has modules array?', Array.isArray(d.modules), 'length:', d.modules?.length);
  
  const subMods = await db.collection('courses').doc('c-programming-course-id').collection('modules').get();
  console.log('Subcollection modules count:', subMods.size);
  
  if (subMods.size > 0) {
    const mod1 = subMods.docs[0];
    const mData = mod1.data();
    console.log('SubMod 0 ID:', mod1.id, 'Title:', mData.title);
    console.log('SubMod 0 has embedded topics?', Array.isArray(mData.topics), 'topics count:', mData.topics?.length);
    if (mData.topics && mData.topics.length > 0) {
      console.log('SubMod 0 Topic 0 units count:', mData.topics[0].learningUnits?.length);
    }
    const lessons = await mod1.ref.collection('lessons').get();
    console.log('SubMod 0 lessons subcollection count:', lessons.size);
  }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
