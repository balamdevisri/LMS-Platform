import { db } from '../firebase';
import crypto from 'crypto';
import { normalizeModuleItem } from '../../../frontend/src/services/courseNormalizer';
import { normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str || '').digest('hex');
}

async function checkCourse(cId: string) {
  const docSnap = await db.collection('courses').doc(cId).get();
  const courseData = docSnap.data()!;

  const subModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
  const sortedSubDocs = subModsSnap.docs.sort((a, b) => {
    const oA = a.data().orderIndex ?? a.data().order ?? 0;
    const oB = b.data().orderIndex ?? b.data().order ?? 0;
    return oA - oB;
  });

  const subModulesWithLessons: any[] = [];
  for (const smDoc of sortedSubDocs) {
    const smData = smDoc.data();
    const lessonsSnap = await db.collection('courses').doc(cId).collection('modules').doc(smDoc.id).collection('lessons').get();
    const sortedLessonDocs = lessonsSnap.docs.sort((a, b) => {
      const oA = a.data().orderIndex ?? a.data().order ?? 0;
      const oB = b.data().orderIndex ?? b.data().order ?? 0;
      return oA - oB;
    });

    const lessons = sortedLessonDocs.map(lDoc => ({
      id: lDoc.id,
      ...lDoc.data()
    }));

    subModulesWithLessons.push({
      id: smDoc.id,
      ...smData,
      lessons: lessons
    });
  }

  const canonicalRawModules = subModulesWithLessons.length > 0 ? subModulesWithLessons : (courseData.modules || []);
  
  // Clone raw modules to prevent any in-place mutation
  const clonedRawModules = JSON.parse(JSON.stringify(canonicalRawModules));

  const rawUnits: any[] = [];
  clonedRawModules.forEach((m: any) => {
    let units: any[] = [];
    if (Array.isArray(m.lessons) && m.lessons.length > 0) units = m.lessons;
    else if (Array.isArray(m.topics) && m.topics.length > 0) {
      m.topics.forEach((t: any) => units.push(...(t.learningUnits || t.units || [])));
    } else if (Array.isArray(m.learningUnits) && m.learningUnits.length > 0) units = m.learningUnits;
    rawUnits.push(...units);
  });

  const normalizedModules = clonedRawModules.map((m: any, idx: number) => {
    const rawLessons = Array.isArray(m.lessons) ? m.lessons : [];
    if (rawLessons.length > 0) {
      return {
        ...m,
        id: m.id || `mod-${idx + 1}`,
        title: m.title,
        topics: [
          {
            id: `${m.id}-topic-1`,
            title: `${m.title} Units`,
            learningUnits: rawLessons.map((l: any, lIdx: number) => {
              const fullText = (l.readingContent || l.content || l.conceptTheory || l.notes || l.description || '').trim();
              return {
                ...l,
                id: l.id || `unit-${lIdx + 1}`,
                title: l.title,
                type: l.type || 'Reading',
                readingContent: fullText,
                conceptTheory: l.conceptTheory || fullText,
                content: fullText
              };
            })
          }
        ]
      };
    }
    return normalizeModuleItem(m, idx);
  });
  const normalizedCourse = normalizeContextCourse({ ...courseData, id: cId, modules: normalizedModules });

  const uiUnits: any[] = [];
  (normalizedCourse.modules || []).forEach((m: any) => {
    (m.topics || []).forEach((t: any) => {
      (t.learningUnits || []).forEach((u: any) => {
        uiUnits.push(u);
      });
    });
  });

  console.log(`Course: ${cId} | Raw units count: ${rawUnits.length} | UI units count: ${uiUnits.length}`);
  let diffCount = 0;
  for (let i = 0; i < Math.max(rawUnits.length, uiUnits.length); i++) {
    const r = rawUnits[i];
    const u = uiUnits[i];
    const rId = r?.id;
    const uId = u?.id;
    const rRaw = (r?.readingContent || r?.content || r?.conceptTheory || r?.notes || r?.description || '').trim();
    const uRaw = (u?.readingContent || u?.content || u?.conceptTheory || u?.notes || u?.description || '').trim();
    const rText = rRaw.replace(/\r\n/g, '\n');
    const uText = uRaw.replace(/\r\n/g, '\n');
    const rHash = sha256(rText);
    const uHash = sha256(uText);

    if (rHash !== uHash || rId !== uId) {
      diffCount++;
      console.log(`  [Unit ${i}] DIFF -> Raw: [${rId}] len=${rText.length}, hash=${rHash.slice(0, 10)} | UI: [${uId}] len=${uText.length}, hash=${uHash.slice(0, 10)}`);
      if (rText !== uText) {
        console.log(`    Raw text start: ${rText.slice(0, 60)}`);
        console.log(`    UI text start:  ${uText.slice(0, 60)}`);
      }
    }
  }

  if (diffCount === 0) {
    console.log(`  => 100% PERFECT PARITY (0 diffs across all ${rawUnits.length} units!)\n`);
  } else {
    console.log(`  => Found ${diffCount} diffs!\n`);
  }
}

async function main() {
  const CANONICAL_COURSES = [
    'c-programming-course-id',
    'course_linux_101',
    'python-through-oops-course-id',
    'react-js-complete-course',
    'kubernetes-complete-course-beginner-to-advanced',
    'database-management-system',
    'git-github-mastery',
    'java-through-oops-course-id',
    'javascript-mastery',
    'nodejs-backend-development',
    'data-structures-and-algorithms',
    'web-development-fundamentals'
  ];

  for (const cId of CANONICAL_COURSES) {
    await checkCourse(cId);
  }
}

main().catch(console.error);
