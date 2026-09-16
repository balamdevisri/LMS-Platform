import { db, isFirebaseAdminInitialized } from '../firebase';
import crypto from 'crypto';
import { normalizeLearningUnitItem, normalizeTopicItem, normalizeModuleItem } from '../../../frontend/src/services/courseNormalizer';
import { normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';

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

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str || '').digest('hex');
}

interface CourseAuditResult {
  courseId: string;
  courseTitle: string;
  rawRootModulesCount: number;
  rawSubModulesCount: number;
  rawTotalLessonsCount: number;
  uiModulesCount: number;
  uiLessonsCount: number;
  idsMatch: boolean;
  titlesMatch: boolean;
  orderMatch: boolean;
  contentHashMatch: boolean;
  mismatches: string[];
  k8sBreakdown?: any[];
}

async function runParityAudit() {
  console.log('================================================================================');
  console.log('KAIZENQ LMS — LIVE PRODUCTION READ-ONLY DATA PARITY AUDIT');
  console.log('================================================================================\n');

  if (!isFirebaseAdminInitialized()) {
    console.error('ERROR: Firebase Admin SDK failed to initialize.');
    process.exit(1);
  }

  const results: CourseAuditResult[] = [];

  for (const cId of CANONICAL_COURSES) {
    const docSnap = await db.collection('courses').doc(cId).get();
    if (!docSnap.exists) {
      console.error(`  [FAIL] Course doc ${cId} does not exist in Firestore!`);
      continue;
    }

    const courseData = docSnap.data()!;
    const courseTitle = courseData.title || courseData.name || cId;
    const rootModules = Array.isArray(courseData.modules) ? courseData.modules : [];

    // Fetch Subcollection modules
    const subModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
    const sortedSubDocs = subModsSnap.docs.sort((a, b) => {
      const oA = a.data().orderIndex ?? a.data().order ?? 0;
      const oB = b.data().orderIndex ?? b.data().order ?? 0;
      return oA - oB;
    });

    // Subcollection modules with lessons
    const subModulesWithLessons: any[] = [];
    let totalSubLessons = 0;

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

      totalSubLessons += lessons.length;
      subModulesWithLessons.push({
        id: smDoc.id,
        ...smData,
        lessons: lessons
      });
    }

    // Determine Canonical Source for this course
    const canonicalRawModules = subModulesWithLessons.length > 0 ? subModulesWithLessons : rootModules;
    
    // Extract raw units and their individual field hashes
    let rawLessonsTotal = 0;
    const rawLessonIdList: string[] = [];
    const rawLessonTitleList: string[] = [];
    const rawModuleIdList: string[] = [];
    const rawModuleTitleList: string[] = [];
    const rawContentHashes: string[] = [];

    canonicalRawModules.forEach((m: any) => {
      rawModuleIdList.push(m.id || '');
      rawModuleTitleList.push(m.title || '');
      
      let units: any[] = [];
      if (Array.isArray(m.lessons) && m.lessons.length > 0) {
        units = m.lessons;
      } else if (Array.isArray(m.topics) && m.topics.length > 0) {
        m.topics.forEach((t: any) => {
          const tUnits = Array.isArray(t.learningUnits) ? t.learningUnits : (Array.isArray(t.units) ? t.units : []);
          units.push(...tUnits);
        });
      } else if (Array.isArray(m.learningUnits) && m.learningUnits.length > 0) {
        units = m.learningUnits;
      }

      rawLessonsTotal += units.length;
      units.forEach((u: any) => {
        rawLessonIdList.push(u.id || '');
        rawLessonTitleList.push(u.title || '');
        // Hash the primary text content of the raw lesson
        const primaryText = (u.readingContent || u.content || u.conceptTheory || u.notes || u.description || '').trim();
        rawContentHashes.push(sha256(primaryText));
      });
    });

    // Normalize for UI
    const normalizedModules = canonicalRawModules.map((m: any, idx: number) => normalizeModuleItem(m, idx));
    const normalizedCourse = normalizeContextCourse({
      ...courseData,
      id: cId,
      modules: normalizedModules
    });

    let uiLessonsTotal = 0;
    const uiLessonIdList: string[] = [];
    const uiLessonTitleList: string[] = [];
    const uiModuleIdList: string[] = [];
    const uiModuleTitleList: string[] = [];
    const uiContentHashes: string[] = [];

    (normalizedCourse.modules || []).forEach((m: any) => {
      uiModuleIdList.push(m.id || '');
      uiModuleTitleList.push(m.title || '');
      (m.topics || []).forEach((t: any) => {
        (t.learningUnits || []).forEach((u: any) => {
          uiLessonsTotal++;
          uiLessonIdList.push(u.id || '');
          uiLessonTitleList.push(u.title || '');
          const primaryText = (u.readingContent || u.content || u.conceptTheory || u.notes || u.description || '').trim();
          uiContentHashes.push(sha256(primaryText));
        });
      });
    });

    // Check Parity
    const mismatches: string[] = [];
    if (canonicalRawModules.length !== (normalizedCourse.modules || []).length) {
      mismatches.push(`Module count mismatch: Raw=${canonicalRawModules.length} vs UI=${(normalizedCourse.modules || []).length}`);
    }
    if (rawLessonsTotal !== uiLessonsTotal) {
      mismatches.push(`Lesson count mismatch: Raw=${rawLessonsTotal} vs UI=${uiLessonsTotal}`);
    }

    const idsMatch = JSON.stringify(rawModuleIdList) === JSON.stringify(uiModuleIdList) &&
                     JSON.stringify(rawLessonIdList) === JSON.stringify(uiLessonIdList);
    if (!idsMatch) {
      mismatches.push(`IDs do not match exactly!`);
    }

    const titlesMatch = JSON.stringify(rawModuleTitleList) === JSON.stringify(uiModuleTitleList) &&
                        JSON.stringify(rawLessonTitleList) === JSON.stringify(uiLessonTitleList);
    if (!titlesMatch) {
      mismatches.push(`Titles do not match exactly!`);
    }

    const contentHashMatch = JSON.stringify(rawContentHashes) === JSON.stringify(uiContentHashes);
    if (!contentHashMatch) {
      mismatches.push(`Content hashes mismatch`);
    }

    const auditRes: CourseAuditResult = {
      courseId: cId,
      courseTitle,
      rawRootModulesCount: rootModules.length,
      rawSubModulesCount: subModulesWithLessons.length,
      rawTotalLessonsCount: rawLessonsTotal,
      uiModulesCount: (normalizedCourse.modules || []).length,
      uiLessonsCount: uiLessonsTotal,
      idsMatch,
      titlesMatch,
      orderMatch: idsMatch,
      contentHashMatch,
      mismatches
    };

    if (cId === 'kubernetes-complete-course-beginner-to-advanced') {
      auditRes.k8sBreakdown = canonicalRawModules.map((m: any, idx: number) => {
        let lessonCount = 0;
        let lessons: any[] = [];
        if (Array.isArray(m.lessons) && m.lessons.length > 0) {
          lessonCount = m.lessons.length;
          lessons = m.lessons;
        } else if (Array.isArray(m.topics) && m.topics.length > 0) {
          m.topics.forEach((t: any) => {
            const tUnits = Array.isArray(t.learningUnits) ? t.learningUnits : (Array.isArray(t.units) ? t.units : []);
            lessonCount += tUnits.length;
            lessons.push(...tUnits);
          });
        }
        return {
          moduleIndex: idx + 1,
          moduleId: m.id,
          moduleTitle: m.title,
          order: m.order ?? m.orderIndex,
          lessonCount,
          lessons: lessons.map((l: any, lIdx: number) => ({
            lessonIndex: lIdx + 1,
            lessonId: l.id,
            lessonTitle: l.title,
            type: l.type,
            contentLength: (l.readingContent || l.content || l.conceptTheory || l.notes || '').length,
            contentHash: sha256((l.readingContent || l.content || l.conceptTheory || l.notes || '').trim())
          }))
        };
      });
    }

    results.push(auditRes);
  }

  console.log('================================================================================');
  console.log('AUDIT SUMMARY TABLE (RAW CANONICAL FIRESTORE VS UI NORMALIZED)');
  console.log('================================================================================');
  console.log('| Course ID | Course Title | Raw Modules | UI Modules | Raw Lessons | UI Lessons | IDs Match | Hash Match |');
  console.log('|---|---|---|---|---|---|---|---|');
  results.forEach(r => {
    console.log(`| ${r.courseId} | ${r.courseTitle} | ${r.rawSubModulesCount || r.rawRootModulesCount} | ${r.uiModulesCount} | ${r.rawTotalLessonsCount} | ${r.uiLessonsCount} | ${r.idsMatch ? 'YES (100%)' : 'NO'} | ${r.contentHashMatch ? 'YES (100%)' : 'NO'} |`);
  });

  // Kubernetes Detailed Report
  const k8s = results.find(r => r.courseId === 'kubernetes-complete-course-beginner-to-advanced');
  if (k8s && k8s.k8sBreakdown) {
    console.log('\n================================================================================');
    console.log('KUBERNETES COURSE — AUTHORITATIVE PRODUCTION STRUCTURE');
    console.log('================================================================================');
    console.log(`Course Title: ${k8s.courseTitle}`);
    console.log(`Total Modules: ${k8s.k8sBreakdown.length}`);
    console.log(`Total Lessons: ${k8s.rawTotalLessonsCount}\n`);

    k8s.k8sBreakdown.forEach((mod: any) => {
      console.log(`Module ${mod.moduleIndex}: [ID: ${mod.moduleId}] "${mod.moduleTitle}" (Order: ${mod.order}) — ${mod.lessonCount} Lesson(s)`);
      mod.lessons.forEach((l: any) => {
        console.log(`   └─ Lesson ${l.lessonIndex}: [ID: ${l.lessonId}] "${l.lessonTitle}" (${l.type}) [${l.contentLength} chars, SHA256: ${l.contentHash.slice(0, 10)}...]`);
      });
    });
  }

  // Scanning for duplicates
  console.log('\n================================================================================');
  console.log('SCANNING FOR DUPLICATE OR ALIAS COURSES IN FIRESTORE');
  console.log('================================================================================');
  const allDocsSnap = await db.collection('courses').get();
  console.log(`Total course documents in 'courses' collection: ${allDocsSnap.size}`);
  allDocsSnap.docs.forEach(doc => {
    const d = doc.data();
    const isCanonical = CANONICAL_COURSES.includes(doc.id);
    console.log(`Doc ID: ${doc.id.padEnd(50)} | Canonical: ${isCanonical ? 'YES' : 'NO '} | Title: ${d.title || d.name} | Slug: ${d.slug || 'N/A'}`);
  });
}

runParityAudit().catch(console.error);
