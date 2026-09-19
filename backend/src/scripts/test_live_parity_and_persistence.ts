import { db } from '../firebase';
import { courseContentService } from '../services/course/courseContent.service';
import * as crypto from 'crypto';

function computeHash(content: string): string {
  return crypto.createHash('sha256').update(content || '').digest('hex');
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

async function runLiveParityTest() {
  console.log('================================================================');
  console.log('   KAIZENQ LIVE BACKEND & PRODUCTION PARITY VERIFICATION        ');
  console.log('================================================================\n');

  const courseId = 'c-programming-course-id';
  const moduleId = 'c-mod-1';
  const lessonId = 'c-unit-1-notes';

  // 1. Initial State
  const courseDocBefore = await db.collection('courses').doc(courseId).get();
  const cDataBefore = courseDocBefore.data() || {};
  const revBefore = cDataBefore.version || 23;
  console.log(`Initial Revision: ${revBefore}`);

  const lessonRef = db.collection('courses').doc(courseId).collection('modules').doc(moduleId).collection('lessons').doc(lessonId);
  const lessonSnapBefore = await lessonRef.get();
  const initialLesson = lessonSnapBefore.data() || {};
  const originalReadingContent = (initialLesson.readingContent || initialLesson.conceptTheory || '').replace('\n\n[CMS-PERSISTENCE-TEST]', '');
  const originalHash = computeHash(originalReadingContent);
  console.log(`Original Content Hash: ${originalHash}`);

  // 2. Controlled Edit: Append marker
  console.log('\n--- 1. APPLYING CONTROLLED TEST MARKER ---');
  const testMarker = '\n\n[CMS-PERSISTENCE-TEST]';
  const modifiedContent = originalReadingContent + testMarker;

  const modifiedPayload = {
    ...initialLesson,
    id: lessonId,
    title: initialLesson.title || 'Module 1 - Complete Notes',
    readingContent: modifiedContent,
    conceptTheory: modifiedContent,
    content: modifiedContent,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@kaizenq.in',
  };

  await courseContentService.saveLesson(courseId, moduleId, modifiedPayload, 'admin-tester');
  console.log('✅ Saved modified lesson to canonical database & synced hierarchy.');

  // Update course version
  const newRev = revBefore + 1;
  await db.collection('courses').doc(courseId).set({
    version: newRev,
    revision: newRev,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin@kaizenq.in',
  }, { merge: true });

  console.log(`✅ Incremented course version to: ${newRev}`);

  // Short pause for cross-region propagation
  await new Promise((r) => setTimeout(r, 1500));

  // 3. Verify Localhost & Production APIs
  console.log('\n--- 2. VERIFYING LOCALHOST & PRODUCTION API RESPONSES ---');

  // Localhost Check
  let localContent = '';
  let localHash = '';
  try {
    const localRes = await fetchJson(`http://127.0.0.1:5000/api/courses/${courseId}`);
    const localModules = localRes.data?.modules || [];
    const localMod = localModules.find((m: any) => m.id === moduleId);
    const localLesson = (localMod?.topics || []).flatMap((t: any) => t.learningUnits || []).find((u: any) => u.id === lessonId);
    localContent = localLesson?.readingContent || localLesson?.conceptTheory || '';
    localHash = computeHash(localContent);
    console.log('Localhost contains marker:', localContent.includes('[CMS-PERSISTENCE-TEST]'));
    console.log('Localhost Hash:', localHash);
  } catch (e: any) {
    console.error('Localhost error:', e.message);
  }

  // Production Check
  let prodContent = '';
  let prodHash = '';
  try {
    const prodRes = await fetchJson(`http://kaizenq.in/api/courses/${courseId}`);
    const prodModules = prodRes.data?.modules || [];
    const prodMod = prodModules.find((m: any) => m.id === moduleId);
    const prodLesson = (prodMod?.topics || []).flatMap((t: any) => t.learningUnits || []).find((u: any) => u.id === lessonId);
    prodContent = prodLesson?.readingContent || prodLesson?.conceptTheory || '';
    prodHash = computeHash(prodContent);
    console.log('Production contains marker:', prodContent.includes('[CMS-PERSISTENCE-TEST]'));
    console.log('Production Hash:', prodHash);
  } catch (e: any) {
    console.error('Production error:', e.message);
  }

  const markerInLocal = localContent.includes('[CMS-PERSISTENCE-TEST]');
  const markerInProd = prodContent.includes('[CMS-PERSISTENCE-TEST]');
  const parityMatch = localHash === prodHash && localHash.length > 0;

  console.log(`\nLocalhost Test: ${markerInLocal ? 'PASS' : 'FAIL'}`);
  console.log(`Production Test: ${markerInProd ? 'PASS' : 'FAIL'}`);
  console.log(`Hash Parity: ${parityMatch ? 'PASS' : 'FAIL'}`);

  // 4. Rollback
  console.log('\n--- 3. PERFORMING SAFE ROLLBACK ---');
  const restoredPayload = {
    ...initialLesson,
    id: lessonId,
    title: initialLesson.title || 'Module 1 - Complete Notes',
    readingContent: originalReadingContent,
    conceptTheory: originalReadingContent,
    content: originalReadingContent,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin-rollback',
  };

  await courseContentService.saveLesson(courseId, moduleId, restoredPayload, 'admin-rollback');
  const rollbackRev = newRev + 1;
  await db.collection('courses').doc(courseId).set({
    version: rollbackRev,
    revision: rollbackRev,
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin-rollback',
  }, { merge: true });

  console.log(`✅ Restored original content. Final Revision: ${rollbackRev}`);

  // Verify rollback in DB
  const lessonSnapFinal = await lessonRef.get();
  const isClean = !(lessonSnapFinal.data()?.readingContent || '').includes('[CMS-PERSISTENCE-TEST]');
  console.log(`Rollback Verified in Database: ${isClean ? 'PASS' : 'FAIL'}`);

  console.log('\n================================================================');
  console.log('                     FINAL SUMMARY                             ');
  console.log('================================================================');
  console.log(`Test Course ID: ${courseId}`);
  console.log(`Test Lesson ID: ${lessonId}`);
  console.log(`Revision Before: ${revBefore}`);
  console.log(`Revision After Publish: ${newRev}`);
  console.log(`Revision After Rollback: ${rollbackRev}`);
  console.log(`Localhost Content Hash: ${localHash}`);
  console.log(`Production Content Hash: ${prodHash}`);
  console.log(`Parity Status: ${parityMatch ? 'PERFECT 1:1 MATCH' : 'MISMATCH'}`);
  console.log('================================================================\n');
}

runLiveParityTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
