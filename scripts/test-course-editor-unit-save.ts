import { serializeFirestorePayload, sanitizeLessonWritePayload } from '../frontend/src/utils/firestoreSerializer';
import { courseService } from '../frontend/src/services/courseService';
import { linuxCourseModules } from '../frontend/src/data/linuxCourseFullData';

console.log('===============================================================');
console.log('TESTING EXACT LESSON SAVE & UPDATE: linux-unit-3-notes');
console.log('===============================================================');

async function testExactLessonSave() {
  const courseId = 'course_linux_101';
  const moduleId = 'linux-mod-3';
  const lessonId = 'linux-unit-3-notes';

  // Find module 3 and the lesson
  const mod3 = linuxCourseModules.find((m) => m.id === moduleId);
  if (!mod3) throw new Error('Module 3 not found in linuxCourseModules');

  const lesson = mod3.lessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error('linux-unit-3-notes not found in module 3');

  console.log('Found target lesson:', {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    moduleId: lesson.moduleId,
    courseId: lesson.courseId,
  });

  // -------------------------------------------------------------------------
  // CASE A: Non-Video Lesson with videoUrl = undefined (from UnitContentEditor)
  // -------------------------------------------------------------------------
  console.log('\n>>> CASE A: Saving with videoUrl = undefined (Reading Notes Lesson)');
  const payloadCaseA = {
    ...lesson,
    videoUrl: undefined, // Simulates UnitContentEditor for Reading lesson
    readingContent: '# Linux File System Complete Notes\n\nFHS details...',
    conceptTheory: '# Linux File System Complete Notes\n\nFHS details...',
    revision: 1,
    expectedRevision: 1,
    lastSavedAt: new Date().toISOString(),
  };

  const serializedCaseA = serializeFirestorePayload(payloadCaseA);
  console.log('Serialized Case A Payload keys:', Object.keys(serializedCaseA));
  console.log('Has undefined videoUrl?:', 'videoUrl' in serializedCaseA);

  if ('videoUrl' in serializedCaseA) {
    throw new Error('FAIL: videoUrl key was not omitted in Case A');
  }

  // Simulate Firestore merge behavior:
  const existingDocInFirestore = {
    id: lessonId,
    title: 'Old Title',
    videoUrl: 'https://youtube.com/watch?v=existingVideo',
    readingContent: 'Old Content',
  };

  const mergedDocInFirestore = {
    ...existingDocInFirestore,
    ...serializedCaseA, // Firestore setDoc({ merge: true }) merges clean payload
  };

  console.log('Merged Firestore Doc videoUrl:', mergedDocInFirestore.videoUrl);
  if (mergedDocInFirestore.videoUrl !== 'https://youtube.com/watch?v=existingVideo') {
    throw new Error('FAIL: Existing videoUrl was wiped out by merge with undefined');
  }
  console.log('✅ CASE A PASS: videoUrl was omitted and existing videoUrl preserved!');

  // -------------------------------------------------------------------------
  // CASE B: Explicit clear (videoUrl = "" or videoUrl = null)
  // -------------------------------------------------------------------------
  console.log('\n>>> CASE B: Explicit Clear by Administrator');
  const payloadCaseB = {
    ...lesson,
    type: 'Video',
    videoUrl: '', // Administrator explicitly clears the video URL input
    lastSavedAt: new Date().toISOString(),
  };

  const serializedCaseB = serializeFirestorePayload(payloadCaseB);
  console.log('Serialized Case B Payload videoUrl:', serializedCaseB.videoUrl);

  const mergedDocCaseB = {
    ...existingDocInFirestore,
    ...serializedCaseB,
  };

  console.log('Merged Firestore Doc Case B videoUrl:', mergedDocCaseB.videoUrl);
  if (mergedDocCaseB.videoUrl !== '') {
    throw new Error('FAIL: Explicitly cleared videoUrl was not updated to empty string');
  }
  console.log('✅ CASE B PASS: Explicit clear correctly cleared the videoUrl field in Firestore!');

  // -------------------------------------------------------------------------
  // TEST 3: Save Draft
  // -------------------------------------------------------------------------
  console.log('\n>>> TEST 3: Save Draft Flow');
  const draftPayload = {
    ...lesson,
    isDraft: true,
    videoUrl: undefined,
    lastSavedAt: new Date().toISOString(),
  };
  const serializedDraft = serializeFirestorePayload(draftPayload);
  if ('videoUrl' in serializedDraft) {
    throw new Error('FAIL: videoUrl in draft payload was not omitted');
  }
  if (serializedDraft.isDraft !== true) {
    throw new Error('FAIL: isDraft flag was not preserved');
  }
  console.log('✅ TEST 3 PASS: Save Draft serialized safely with isDraft: true and no undefined!');

  // -------------------------------------------------------------------------
  // TEST 4: Parent Module and Course Update Sync
  // -------------------------------------------------------------------------
  console.log('\n>>> TEST 4: Parent Module and Course Tree Sync');
  const nextLessons = mod3.lessons.map((u) => (u.id === lessonId ? serializedCaseA : u));
  const updatedModule = {
    ...mod3,
    lessons: nextLessons,
    topics: [{
      id: `${mod3.id}-t1`,
      title: mod3.title,
      description: mod3.description,
      learningUnits: nextLessons,
    }],
    updatedAt: new Date().toISOString(),
  };

  const cleanModule = serializeFirestorePayload(updatedModule);
  // Verify deep clean:
  const jsonStr = JSON.stringify(cleanModule);
  if (jsonStr.includes('undefined')) {
    throw new Error('FAIL: cleanModule JSON contains undefined');
  }
  console.log('✅ TEST 4 PASS: Parent module and course tree serialized safely with zero undefined values!');

  console.log('\n===============================================================');
  console.log('🎉 ALL LESSON-SPECIFIC CMS SAVE TESTS PASSED PERFECTLY!');
  console.log('===============================================================');
}

testExactLessonSave().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
