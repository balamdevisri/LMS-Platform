import { db } from '../firebase';

async function checkGitAndLinux() {
  for (const courseId of ['git-github-mastery', 'course_linux_101']) {
    console.log(`\n================= COURSE: ${courseId} =================`);
    const rootSnap = await db.collection('courses').doc(courseId).get();
    const rootData = rootSnap.data() || {};
    const rootMods = rootData.modules || [];
    console.log(`Root modules count: ${rootMods.length}`);
    if (rootMods[0]) {
      console.log(`Root mod 1 ID: ${rootMods[0].id} | title: ${rootMods[0].title}`);
      console.log(`  topics: ${rootMods[0].topics?.length}`);
      if (rootMods[0].topics?.[0]) {
        console.log(`  topic 1 ID: ${rootMods[0].topics[0].id} | units: ${rootMods[0].topics[0].learningUnits?.length}`);
        if (rootMods[0].topics[0].learningUnits?.[0]) {
          console.log(`    unit 1 ID: ${rootMods[0].topics[0].learningUnits[0].id} | title: ${rootMods[0].topics[0].learningUnits[0].title}`);
        }
      }
    }

    const subSnap = await db.collection('courses').doc(courseId).collection('modules').get();
    console.log(`Subcollection modules count: ${subSnap.size}`);
    if (subSnap.docs[0]) {
      const sm = subSnap.docs[0].data();
      console.log(`Sub mod 1 ID: ${subSnap.docs[0].id} | title: ${sm.title}`);
      console.log(`  topics on sub mod doc: ${sm.topics?.length}`);
      const lSnap = await subSnap.docs[0].ref.collection('lessons').get();
      console.log(`  sub lessons count: ${lSnap.size}`);
      if (lSnap.docs[0]) {
        console.log(`  sub lesson 1 ID: ${lSnap.docs[0].id} | title: ${lSnap.docs[0].data().title}`);
      }
    }
  }
}

checkGitAndLinux().catch(console.error).finally(() => process.exit(0));
