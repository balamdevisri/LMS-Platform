import { db } from '../firebase';

async function testModuleDocExistence() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  
  console.log('=== CHECKING ALL MODULE DOCS IN SUBCOLLECTION ===');
  const snap = await db.collection('courses').doc(courseId).collection('modules').get();
  console.log(`db.collection('courses').doc('${courseId}').collection('modules').get().size = ${snap.size}`);
  snap.docs.forEach(d => {
    console.log(`  Found doc in collection: ID = "${d.id}", title = "${d.data().title}", exists = ${d.exists}`);
  });

  console.log('\n=== CHECKING INDIVIDUAL MODULE DOC REFS FOR k8s-mod-1 to 15 ===');
  for (let i = 1; i <= 15; i++) {
    const modId = `k8s-mod-${i}`;
    const docSnap = await db.collection('courses').doc(courseId).collection('modules').doc(modId).get();
    const lessonsSnap = await docSnap.ref.collection('lessons').get();
    console.log(`  [${modId}] doc.exists = ${docSnap.exists} | lessonsCount = ${lessonsSnap.size}`);
  }
}

testModuleDocExistence().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
