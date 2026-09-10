import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { courseContentService } from '../services/course/courseContent.service';
import { cleanCourseContent } from '../utils/contentCleaner';
import { ApiError } from '../utils/ApiError';

if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'shaivika-ai-lms-platform'
  });
}

const db = getFirestore();

async function runVerification() {
  console.log('====================================================');
  console.log('STARTING PERSISTENCE & CONCURRENCY VERIFICATION TEST');
  console.log('====================================================\n');

  const courseId = 'course_linux_101';
  const moduleId = 'linux-mod-1';
  const lessonId = 'linux-lesson-1-1';

  // 1. Fetch the lesson from Firestore via courseContentService
  console.log(`[Step 1] Fetching canonical lesson ${courseId} / ${moduleId} / ${lessonId}...`);
  const initialLesson = await courseContentService.getLessonById(lessonId, courseId, moduleId);
  if (!initialLesson) {
    throw new Error(`Failed to find lesson: ${lessonId}`);
  }

  console.log(`✓ Lesson fetched successfully!`);
  console.log(`  - Title: ${initialLesson.title}`);
  console.log(`  - Revision: ${initialLesson.revision || 1}`);
  console.log(`  - Content length: ${initialLesson.content?.length || 0} characters`);

  const originalContent = initialLesson.content || '';
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
1.1 Introduction to Linux
`;
  const cleaned = cleanCourseContent(dirtySnippet);
  console.log('Cleaned snippet:\n' + cleaned);
  if (cleaned.includes('PDF PAGE') || cleaned.includes('●')) {
    throw new Error('Content cleaner failed to remove PDF markers or unicode bullets');
  }
  console.log('✓ Content cleaner pipeline verified successfully!');

  // 3. Test Optimistic Concurrency - Valid expectedRevision update
  console.log('\n[Step 3] Testing update with matching expectedRevision...');
  const updatedText = originalContent + '\n\n<!-- VERIFICATION_TEST_MARKER -->';
  const savedLesson = await courseContentService.saveLesson(
    courseId,
    moduleId,
    {
      ...initialLesson,
      content: updatedText,
      expectedRevision: currentRevision,
    }
  );

  console.log(`✓ Saved lesson with valid revision.`);
  console.log(`  - New Revision: ${savedLesson.revision}`);
  if (savedLesson.revision !== currentRevision + 1) {
    throw new Error(`Expected revision ${currentRevision + 1}, got ${savedLesson.revision}`);
  }

  // 4. Test Stale expectedRevision (Optimistic Lock Conflict -> 409)
  console.log('\n[Step 4] Testing update with STALE expectedRevision (must trigger 409)...');
  let conflictCaught = false;
  try {
    await courseContentService.saveLesson(
      courseId,
      moduleId,
      {
        ...savedLesson,
        content: 'This edit should fail due to concurrency conflict',
        expectedRevision: currentRevision, // Stale! Current is now currentRevision + 1
      }
    );
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

  // 5. Restore original content and verify Firestore persistence
  console.log('\n[Step 5] Restoring pristine content and verifying persistence...');
  const revertedLesson = await courseContentService.saveLesson(
    courseId,
    moduleId,
    {
      ...savedLesson,
      content: originalContent,
      expectedRevision: savedLesson.revision,
    }
  );

  const reReadDoc = await courseContentService.getLessonById(lessonId, courseId, moduleId);
  if (!reReadDoc || reReadDoc.content !== originalContent) {
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
