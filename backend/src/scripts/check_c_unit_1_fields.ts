import { db } from '../firebase';
import { normalizeLearningUnitItem } from '../../../frontend/src/services/courseNormalizer';

async function check() {
  const snap = await db.collection('courses').doc('c-programming-course-id').collection('modules').doc('c-mod-1').collection('lessons').doc('c-unit-1-notes').get();
  const raw = snap.data()!;
  const norm = normalizeLearningUnitItem({ id: 'c-unit-1-notes', ...raw });
  
  console.log('raw.readingContent len:', raw.readingContent?.length);
  console.log('raw.conceptTheory len:', raw.conceptTheory?.length);
  console.log('raw.content len:', raw.content?.length);
  console.log('raw.notes len:', raw.notes?.length);

  console.log('norm.readingContent len:', norm.readingContent?.length);
  console.log('norm.conceptTheory len:', norm.conceptTheory?.length);
  console.log('norm.content len:', norm.content?.length);
  console.log('norm.notes len:', norm.notes?.length);
}

check().catch(console.error);
