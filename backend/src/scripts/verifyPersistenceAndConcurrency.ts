import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { courseContentService } from '../services/course/courseContent.service';
import { CourseService } from '../modules/courses/course.service';
import { cleanCourseContent } from '../utils/contentCleaner';
import { ApiError } from '../utils/ApiError';

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'shaivika-ai-lms-platform',
  });
}

const db = getFirestore();
const courseService = new CourseService();

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING PERSISTENCE, CONCURRENCY & ANTI-OVERWRITE TEST');
  console.log('====================================================\n');

  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const moduleId = 'k8s-mod-1';
  const lessonId = 'k8s-lesson-1-1';

  // 1. Fetch the lesson from Firestore via courseContentService
  console.log(`[Step 1] Fetching canonical Kubernetes lesson ${courseId} / ${moduleId} / ${lessonId}...`);
  const initialLesson = await courseContentService.getLessonById(lessonId, courseId, moduleId);
  if (!initialLesson) {
    throw new Error(`Failed to find lesson: ${lessonId}`);
  }

  console.log(`✓ Lesson fetched successfully!`);
  console.log(`  - Title: ${initialLesson.title}`);
  console.log(`  - Revision: ${initialLesson.revision || 1}`);
  console.log(`  - Content length: ${initialLesson.content?.length || 0} characters`);

  const originalContent = initialLesson.content || initialLesson.readingContent || '';
  const currentRevision = initialLesson.revision || 1;

  // 2. Test Content Cleaner
  console.log('\n[Step 2] Verifying content cleaner output...');
  const dirtySnippet = `
=== PDF PAGE 1 ===
● Point 1 ● Point 2
cloud

computing,

and

DevOps.
1.1 Introduction to Kubernetes
`;
  const cleaned = cleanCourseContent(dirtySnippet);
  if (cleaned.includes('PDF PAGE') || cleaned.includes('●')) {
    throw new Error('Content cleaner failed to remove PDF markers or unicode bullets');
  }
  console.log('✓ Content cleaner pipeline verified successfully!');

  // 3. Test Optimistic Concurrency - Valid expectedRevision update
  console.log('\n[Step 3] Testing lesson update with matching expectedRevision...');
  const updatedText = originalContent + '\n\n<!-- VERIFICATION_TEST_MARKER -->';
  const savedLesson = await courseContentService.saveLesson(courseId, moduleId, {
    ...initialLesson,
    content: updatedText,
    readingContent: updatedText,
    expectedRevision: currentRevision,
  });

  console.log(`✓ Saved lesson with valid revision.`);
  console.log(`  - New Revision: ${savedLesson.revision}`);
  if (savedLesson.revision !== currentRevision + 1) {
    throw new Error(`Expected revision ${currentRevision + 1}, got ${savedLesson.revision}`);
  }

  // 4. Test Stale expectedRevision (Optimistic Lock Conflict -> 409)
  console.log('\n[Step 4] Testing lesson update with STALE expectedRevision (must trigger 409)...');
  let conflictCaught = false;
  try {
    await courseContentService.saveLesson(courseId, moduleId, {
      ...savedLesson,
      content: 'This edit should fail due to concurrency conflict',
      readingContent: 'This edit should fail due to concurrency conflict',
      expectedRevision: currentRevision, // Stale! Current is now currentRevision + 1
    });
  } catch (err: any) {
    if (err instanceof ApiError && err.statusCode === 409) {
      conflictCaught = true;
      console.log(`✓ Successfully caught 409 Conflict: "${err.message}"`);
    } else {
      throw new Error(`Unexpected error thrown: ${err}`);
    }
  }

  if (!conflictCaught) {
    throw new Error('FAILED: Stale revision update was NOT rejected with 409 Conflict!');
  }

  // 5. Test Anti-Overwrite Guard - Empty Module Array
  console.log('\n[Step 5] Testing course anti-overwrite guard with empty module array (must throw 400)...');
  let emptyOverwriteBlocked = false;
  try {
    await courseService.updateCourse(courseId, {
      modules: [],
    } as any);
  } catch (err: any) {
    if (err instanceof ApiError && err.statusCode === 400 && err.message.includes('Cannot save empty module state')) {
      emptyOverwriteBlocked = true;
      console.log(`✓ Successfully blocked empty module overwrite: "${err.message}"`);
    } else {
      throw new Error(`Unexpected error on empty module overwrite test: ${err}`);
    }
  }
  if (!emptyOverwriteBlocked) {
    throw new Error('FAILED: Course update allowed empty modules array to overwrite populated course!');
  }

  // 6. Test Anti-Overwrite Guard - Unhydrated Placeholder Module
  console.log('\n[Step 6] Testing course anti-overwrite guard with unhydrated placeholder module (must throw 400)...');
  let placeholderOverwriteBlocked = false;
  try {
    await courseService.updateCourse(courseId, {
      modules: [
        {
          id: 'mod_1788931370817',
          title: 'Module 1: New Curriculum Module',
          description: 'Module overview',
          topics: [],
        },
      ],
    } as any);
  } catch (err: any) {
    if (err instanceof ApiError && err.statusCode === 400 && err.message.includes('Cannot save unhydrated placeholder module state')) {
      placeholderOverwriteBlocked = true;
      console.log(`✓ Successfully blocked placeholder module overwrite: "${err.message}"`);
    } else {
      throw new Error(`Unexpected error on placeholder overwrite test: ${err}`);
    }
  }
  if (!placeholderOverwriteBlocked) {
    throw new Error('FAILED: Course update allowed unhydrated placeholder to overwrite populated course!');
  }

  // 7. Test Course-level Optimistic Concurrency (409 Conflict on Course update)
  console.log('\n[Step 7] Testing course-level optimistic concurrency (must trigger 409 on stale version)...');
  const courseDoc = await courseService.getCourseById(courseId);
  const currentCourseVer = courseDoc?.revision ?? courseDoc?.version ?? 1;
  let courseConflictCaught = false;
  try {
    await courseService.updateCourse(
      courseId,
      {
        shortDescription: 'Concurrent edit test',
      } as any,
      currentCourseVer - 1 // Stale expected version
    );
  } catch (err: any) {
    if (err.status === 409 || err.code === 409 || (err.message && err.message.includes('modified by another'))) {
      courseConflictCaught = true;
      console.log(`✓ Successfully caught 409 Conflict on course update: "${err.message}"`);
    } else {
      throw new Error(`Unexpected error on course concurrency test: ${err}`);
    }
  }
  if (!courseConflictCaught) {
    throw new Error('FAILED: Course update with stale version was NOT rejected with 409 Conflict!');
  }

  // 8. Restore original content and verify Firestore persistence
  console.log('\n[Step 8] Restoring pristine content and verifying persistence...');
  const revertedLesson = await courseContentService.saveLesson(courseId, moduleId, {
    ...savedLesson,
    content: originalContent,
    readingContent: originalContent,
    expectedRevision: savedLesson.revision,
  });

  const reReadDoc = await courseContentService.getLessonById(lessonId, courseId, moduleId);
  if (!reReadDoc || (reReadDoc.content !== originalContent && reReadDoc.readingContent !== originalContent)) {
    throw new Error('Failed to verify restored Firestore content');
  }
  console.log(`✓ Restored pristine content. Final Revision in Firestore: ${reReadDoc.revision}`);

  console.log('\n====================================================');
  console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  });
