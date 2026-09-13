import { db } from '../firebase';
import crypto from 'crypto';

function sha256(data: any): string {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

async function main() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const rootSnap = await db.collection('courses').doc(courseId).get();
  const rootData = rootSnap.data() || {};
  const rootModules: any[] = rootData.modules || [];

  console.log(`=== KUBERNETES COURSE ROOT DOCUMENT ===`);
  console.log(`Title: ${rootData.title}`);
  console.log(`Slug: ${rootData.slug}`);
  console.log(`Price: ${rootData.price}`);
  console.log(`Root modules count: ${rootModules.length}`);

  const subcollectionSnap = await db.collection('courses').doc(courseId).collection('modules').get();
  console.log(`Subcollection modules count: ${subcollectionSnap.size}`);

  const subMods: any[] = [];
  for (const doc of subcollectionSnap.docs) {
    const sData = { id: doc.id, ...doc.data() };
    const lessonsSnap = await doc.ref.collection('lessons').get();
    const lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...l.data() }));
    lessons.sort((a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));
    subMods.push({ ...sData, lessons });
  }
  subMods.sort((a, b) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0));

  console.log(`\n=== DETAILED MODULE COMPARISON ===`);
  for (let i = 0; i < Math.max(rootModules.length, subMods.length); i++) {
    const rm = rootModules[i];
    const sm = subMods[i];
    console.log(`\n----------------- MODULE ${i + 1} -----------------`);
    console.log(`ROOT: ID=${rm?.id} | Order=${rm?.order ?? rm?.orderIndex} | Title="${rm?.title}"`);
    console.log(`  Topics count: ${rm?.topics?.length ?? 0}`);
    if (rm?.topics) {
      rm.topics.forEach((t: any, tIdx: number) => {
        console.log(`    [Root Topic ${tIdx + 1}] ID=${t.id} | Title="${t.title}" | Units=${t.learningUnits?.length ?? 0}`);
        if (t.learningUnits) {
          t.learningUnits.forEach((u: any, uIdx: number) => {
            const content = u.readingContent || u.content || u.conceptTheory || '';
            console.log(`      [Root Unit ${uIdx + 1}] ID=${u.id} | Title="${u.title}" | Type=${u.type} | ContentLen=${content.length} | SHA=${sha256(content).slice(0, 8)}`);
          });
        }
      });
    }

    console.log(`SUB:  ID=${sm?.id} | Order=${sm?.orderIndex ?? sm?.order} | Title="${sm?.title}"`);
    console.log(`  Lessons count: ${sm?.lessons?.length ?? 0}`);
    if (sm?.lessons) {
      sm.lessons.forEach((l: any, lIdx: number) => {
        const content = l.content || l.readingContent || '';
        console.log(`    [Sub Lesson ${lIdx + 1}] ID=${l.id} | Title="${l.title}" | Type=${l.type} | ContentLen=${content.length} | SHA=${sha256(content).slice(0, 8)}`);
      });
    }
  }
}

main().catch(console.error).finally(() => process.exit(0));
