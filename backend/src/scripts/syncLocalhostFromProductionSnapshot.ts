import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

function sha256(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

const CANONICAL_COURSES = [
  'c-programming-course-id',
  'course_linux_101',
  'data-structures-and-algorithms',
  'database-management-system',
  'git-github-mastery',
  'git-github-mastery-course-id',
  'java-through-oops-course-id',
  'javascript-mastery',
  'kubernetes-complete-course-beginner-to-advanced',
  'nodejs-backend-development',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'web-development-fundamentals'
];

export async function syncLocalhostFromProductionSnapshot() {
  console.log('======================================================================');
  console.log('🔄 SYNCHRONIZING LOCALHOST FIRESTORE WITH AUTHORITATIVE PRODUCTION DATA');
  console.log('======================================================================\n');

  const snapshotFile = path.resolve(__dirname, '../../backups/firestore/production_snapshot_1789489888259.json');
  if (!fs.existsSync(snapshotFile)) {
    throw new Error(`Production snapshot file not found at: ${snapshotFile}`);
  }

  const prodSnapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  console.log(`Loaded production snapshot with ${Object.keys(prodSnapshot).length} courses.\n`);

  for (const courseId of CANONICAL_COURSES) {
    const prodData = prodSnapshot[courseId];
    if (!prodData || !prodData.course) {
      console.warn(`[SKIP] Course "${courseId}" not found in production snapshot.`);
      continue;
    }

    const pCourse = prodData.course;
    const pSubModules = prodData.modules || [];

    console.log(`Syncing Course: "${pCourse.title}" (${courseId})...`);

    // 1. Prepare exact Root Course Document payload from production
    const courseDocRef = db.collection('courses').doc(courseId);
    
    // Use production course metadata and clean root modules
    const { _id, ...cleanCourseData } = pCourse;
    const rootPayload = {
      ...cleanCourseData,
      id: courseId,
      status: (pCourse.status || 'published').toLowerCase(),
      updatedAt: pCourse.updatedAt || new Date().toISOString(),
    };

    await courseDocRef.set(rootPayload, { merge: true });
    console.log(`  ✓ Updated root course document (${rootPayload.modules?.length || 0} root modules)`);

    // 2. Sync Subcollections (courses/{courseId}/modules and lessons)
    if (pSubModules.length > 0) {
      const existingSubMods = await courseDocRef.collection('modules').get();
      const existingSubModIds = new Set(existingSubMods.docs.map(d => d.id));
      const targetSubModIds = new Set<string>();

      for (const mod of pSubModules) {
        targetSubModIds.add(mod.id);
        const modDocRef = courseDocRef.collection('modules').doc(mod.id);
        
        const { lessons, ...modMeta } = mod;
        const modPayload = {
          ...modMeta,
          id: mod.id,
          courseId,
          orderIndex: mod.orderIndex ?? mod.order ?? 1,
          order: mod.order ?? mod.orderIndex ?? 1,
          revision: mod.revision || 1,
          updatedAt: mod.updatedAt || new Date().toISOString(),
        };

        await modDocRef.set(modPayload, { merge: true });

        // Sync lessons subcollection
        const existingLessonsSnap = await modDocRef.collection('lessons').get();
        const existingLessonIds = new Set(existingLessonsSnap.docs.map(d => d.id));
        const targetLessonIds = new Set<string>();

        const lessonsList = Array.isArray(lessons) ? lessons : [];

        for (const lesson of lessonsList) {
          if (!lesson.id) continue;
          targetLessonIds.add(lesson.id);
          const lessonDocRef = modDocRef.collection('lessons').doc(lesson.id);
          const lessonPayload = {
            ...lesson,
            id: lesson.id,
            courseId,
            moduleId: mod.id,
            orderIndex: lesson.orderIndex ?? lesson.order ?? 1,
            order: lesson.order ?? lesson.orderIndex ?? 1,
            revision: lesson.revision || 1,
            updatedAt: lesson.updatedAt || new Date().toISOString(),
          };

          await lessonDocRef.set(lessonPayload, { merge: true });
        }

        // Cleanup obsolete subcollection lessons
        for (const oldLessonId of existingLessonIds) {
          if (!targetLessonIds.has(oldLessonId)) {
            await modDocRef.collection('lessons').doc(oldLessonId).delete();
            console.log(`    - Cleaned up obsolete lesson "${oldLessonId}" in module "${mod.id}"`);
          }
        }
      }

      // Cleanup obsolete subcollection modules
      for (const oldModId of existingSubModIds) {
        if (!targetSubModIds.has(oldModId)) {
          const oldLessonsSnap = await courseDocRef.collection('modules').doc(oldModId).collection('lessons').get();
          for (const lDoc of oldLessonsSnap.docs) {
            await lDoc.ref.delete();
          }
          await courseDocRef.collection('modules').doc(oldModId).delete();
          console.log(`  - Cleaned up obsolete module "${oldModId}"`);
        }
      }

      console.log(`  ✓ Synchronized ${pSubModules.length} subcollection modules and lessons.`);
    }
  }

  // Clear in-memory service caches
  try {
    const { courseContentService } = await import('../services/course/courseContent.service');
    courseContentService.invalidateCache();
  } catch (e) {}

  console.log('\n======================================================================');
  console.log('🎉 LOCALHOST FIRESTORE SYNCHRONIZATION COMPLETE');
  console.log('======================================================================\n');
}

if (require.main === module) {
  syncLocalhostFromProductionSnapshot()
    .then(() => {
      console.log('✅ Synchronization script finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Synchronization failed:', err);
      process.exit(1);
    });
}
