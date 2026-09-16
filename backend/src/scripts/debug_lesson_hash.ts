import { db } from '../firebase';
import crypto from 'crypto';
import { normalizeLearningUnitItem, normalizeModuleItem } from '../../../frontend/src/services/courseNormalizer';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str || '').digest('hex');
}

function getLessonContent(u: any): string {
  return (u.readingContent || u.conceptTheory || u.content || u.notes || u.description || '').trim();
}

async function check() {
  const snap = await db.collection('courses').doc('c-programming-course-id').collection('modules').doc('c-mod-13').collection('lessons').doc('c-unit-13-notes').get();
  const raw = snap.data()!;
  
  const rawStr = getLessonContent(raw);
  const rawHash = sha256(rawStr);

  const normMod = normalizeModuleItem({
    id: 'c-mod-13',
    lessons: [{ id: 'c-unit-13-notes', ...raw }]
  });
  const normUnit = normMod.topics[0].learningUnits[0];
  const normStr = getLessonContent(normUnit);
  const normHash = sha256(normStr);

  console.log('Raw string length:', rawStr.length, 'Hash:', rawHash);
  console.log('Norm string length:', normStr.length, 'Hash:', normHash);
  console.log('Strings identical:', rawStr === normStr);
  if (rawStr !== normStr) {
    console.log('Diff! rawStr first 100:', rawStr.slice(0, 100));
    console.log('Diff! normStr first 100:', normStr.slice(0, 100));
  }
}

check().catch(console.error);
