import { db } from '../firebase';
import crypto from 'crypto';
import { normalizeModuleItem } from '../../../frontend/src/services/courseNormalizer';
import { normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str || '').digest('hex');
}

function getLessonContent(u: any): string {
  return (u.readingContent || u.conceptTheory || u.content || u.notes || u.description || '').trim();
}

async function check() {
  const cId = 'c-programming-course-id';
  const subModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
  const sortedSubDocs = subModsSnap.docs.sort((a, b) => {
    const oA = a.data().orderIndex ?? a.data().order ?? 0;
    const oB = b.data().orderIndex ?? b.data().order ?? 0;
    return oA - oB;
  });

  const rawModules: any[] = [];
  for (const smDoc of sortedSubDocs) {
    const smData = smDoc.data();
    const lessonsSnap = await db.collection('courses').doc(cId).collection('modules').doc(smDoc.id).collection('lessons').get();
    const sortedLessons = lessonsSnap.docs.sort((a, b) => {
      const oA = a.data().orderIndex ?? a.data().order ?? 0;
      const oB = b.data().orderIndex ?? b.data().order ?? 0;
      return oA - oB;
    }).map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));

    rawModules.push({
      id: smDoc.id,
      ...smData,
      lessons: sortedLessons
    });
  }

  // Raw lessons list
  const rawList: any[] = [];
  rawModules.forEach(m => {
    (m.lessons || []).forEach((l: any) => {
      rawList.push({
        modId: m.id,
        lessonId: l.id,
        title: l.title,
        content: getLessonContent(l),
        hash: sha256(getLessonContent(l))
      });
    });
  });

  // UI normalized
  const normModules = rawModules.map((m, idx) => normalizeModuleItem(m, idx));
  const normCourse = normalizeContextCourse({ id: cId, modules: normModules });
  
  const uiList: any[] = [];
  normCourse.modules!.forEach(m => {
    (m.topics || []).forEach(t => {
      (t.learningUnits || []).forEach(u => {
        uiList.push({
          modId: m.id,
          lessonId: u.id,
          title: u.title,
          content: getLessonContent(u),
          hash: sha256(getLessonContent(u))
        });
      });
    });
  });

  console.log(`Total Raw: ${rawList.length}, Total UI: ${uiList.length}`);
  for (let i = 0; i < Math.max(rawList.length, uiList.length); i++) {
    const r = rawList[i];
    const u = uiList[i];
    const match = r && u && r.hash === u.hash && r.lessonId === u.lessonId;
    console.log(`[${i}] Match: ${match ? 'YES' : 'NO ' } | Raw: [${r?.modId}] ${r?.lessonId} (${r?.title}) (${r?.content?.length} chars) | UI: [${u?.modId}] ${u?.lessonId} (${u?.title}) (${u?.content?.length} chars)`);
  }
}

check().catch(console.error);
