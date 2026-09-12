import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function inspect() {
  const courseDoc = await db.collection('courses').doc('c-programming-course-id').get();
  if (!courseDoc.exists) {
    console.log('Course does not exist');
    return;
  }
  const data = fromDocument<any>(courseDoc);
  console.log('Course Doc Keys:', Object.keys(data));
  console.log('Title:', data.title);
  console.log('Slug:', data.slug);
  console.log('Modules count:', data.modules?.length);
  
  if (data.modules) {
    data.modules.forEach((m: any, i: number) => {
      console.log(`\nModule [${i + 1}] ID: ${m.id} | title: "${m.title}" | order: ${m.order ?? m.orderIndex}`);
      console.log(`  description: "${m.description?.slice(0, 60)}..."`);
      console.log(`  duration: ${m.duration || m.estimatedDuration}`);
      console.log(`  topics: ${m.topics?.length}`);
      m.topics?.forEach((t: any, ti: number) => {
        console.log(`    Topic [${ti + 1}] ID: ${t.id} | title: "${t.title}" | order: ${t.order ?? t.orderIndex}`);
        console.log(`    units: ${t.learningUnits?.length}`);
        t.learningUnits?.forEach((u: any, ui: number) => {
          const content = u.readingContent || u.content || u.conceptTheory || '';
          console.log(`      Unit [${ui + 1}] ID: ${u.id} | title: "${u.title}" | type: ${u.type} | len: ${content.length} chars | order: ${u.order ?? u.orderIndex}`);
        });
      });
    });
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
