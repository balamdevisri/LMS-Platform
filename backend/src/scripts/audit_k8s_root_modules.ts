import { db } from '../firebase';

async function auditRootModules() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const rootSnap = await db.collection('courses').doc(courseId).get();
  const rootData = rootSnap.data() || {};
  const modules: any[] = rootData.modules || [];

  console.log(`Course: ${rootData.title}`);
  console.log(`Total Modules in root doc: ${modules.length}`);

  modules.forEach((mod, idx) => {
    console.log(`\n[Module ${idx + 1}] ID: ${mod.id} | Title: "${mod.title}" | Duration: "${mod.duration}"`);
    console.log(`  Description: ${mod.description?.slice(0, 80)}...`);
    const topics = mod.topics || [];
    console.log(`  Topics (${topics.length}):`);
    topics.forEach((top: any, tIdx: number) => {
      console.log(`    [Topic ${tIdx + 1}] ID: ${top.id} | Title: "${top.title}" | EstDuration: "${top.estimatedDuration}"`);
      const units = top.learningUnits || top.units || [];
      console.log(`    Units (${units.length}):`);
      units.forEach((u: any, uIdx: number) => {
        const content = u.readingContent || u.content || u.conceptTheory || '';
        console.log(`      [Unit ${uIdx + 1}] ID: ${u.id} | Title: "${u.title}" | Type: "${u.type}" | Duration: "${u.duration}" | ContentLen: ${content.length}`);
      });
    });
  });
}

auditRootModules().catch(console.error).finally(() => process.exit(0));
