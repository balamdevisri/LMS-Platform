import { db } from '../firebase';
import { CourseModuleDoc, CourseLessonDoc } from '../types/courseContent.types';
import { toDocument } from '../utils/firestore';

import fs from 'fs';
import path from 'path';

async function reconcileKubernetes() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  console.log(`Starting canonical reconciliation for course "${courseId}"...`);

  const contentJsonPath = path.resolve(__dirname, '../../../kubernetes_lms_content.json');
  let rawJsonContent: any = { modules: [] };
  if (fs.existsSync(contentJsonPath)) {
    rawJsonContent = JSON.parse(fs.readFileSync(contentJsonPath, 'utf8'));
  }

  const courseDocRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseDocRef.get();
  if (!courseSnap.exists) {
    throw new Error(`Course ${courseId} not found in Firestore!`);
  }

  const courseData = courseSnap.data() || {};
  const rawModules: any[] = courseData.modules || [];

  if (rawModules.length !== 15) {
    throw new Error(`Expected 15 modules in root document, but found ${rawModules.length}`);
  }

  // 1. Prepare normalized root modules with 1 Topic & 1 Complete Notes Unit matching Linux/React pattern
  const normalizedRootModules: any[] = rawModules.map((mod, idx) => {
    const modOrder = idx + 1;
    const jsonMod = rawJsonContent.modules?.find((m: any) => m.module_number === modOrder);
    
    // Find existing content or use jsonMod content
    const existingUnit = mod.topics?.[0]?.learningUnits?.[0] || {};
    const fullNotes = (jsonMod?.content && jsonMod.content.length > 500)
      ? jsonMod.content
      : (existingUnit.readingContent || existingUnit.content || mod.description || '');

    const unitId = `k8s-unit-${modOrder}-1`;
    const topicId = `k8s-topic-${modOrder}`;
    const cleanTitle = mod.title.replace(/\s+Units$/, '');

    const unit = {
      id: unitId,
      title: `${cleanTitle} - Complete Notes`,
      description: `${cleanTitle} Complete Notes.`,
      duration: mod.duration || '2.5 Hours',
      type: 'Reading',
      readingContent: fullNotes,
      content: fullNotes,
      conceptTheory: fullNotes,
      order: 1,
      orderIndex: 1,
      learningObjectives: Array.isArray(existingUnit.learningObjectives) && existingUnit.learningObjectives.length > 0
        ? existingUnit.learningObjectives
        : [`Master core concepts of ${cleanTitle}`],
      codeExamples: Array.isArray(existingUnit.codeExamples) ? existingUnit.codeExamples : [],
      keyPoints: Array.isArray(existingUnit.keyPoints) ? existingUnit.keyPoints : [],
      practiceQuestions: Array.isArray(existingUnit.practiceQuestions) ? existingUnit.practiceQuestions : [],
      resourceLinks: Array.isArray(existingUnit.resourceLinks) ? existingUnit.resourceLinks : [],
      resources: [
        {
          id: `res-${unitId}-notes`,
          name: `${cleanTitle} - Study Notes.pdf`,
          description: 'Comprehensive study guide and configuration snippets.',
          category: 'PDF',
          fileSize: '1.4 MB',
          downloadPermission: true,
        },
        {
          id: `res-${unitId}-cheatsheet`,
          name: 'Kubernetes Kubectl Cheat Sheet.pdf',
          description: 'Quick reference sheet for daily kubectl commands.',
          category: 'PDF',
          fileSize: '520 KB',
          downloadPermission: true,
        }
      ],
    };

    const topic = {
      id: topicId,
      title: `${cleanTitle} - Complete Notes`,
      description: `${cleanTitle} Complete Notes.`,
      estimatedDuration: mod.duration || '2.5 Hours',
      order: 1,
      orderIndex: 1,
      learningUnits: [unit],
    };

    return {
      id: `k8s-mod-${modOrder}`,
      order: modOrder,
      orderIndex: modOrder,
      title: cleanTitle,
      description: mod.description || '',
      duration: mod.duration || '2.5 Hours',
      topics: [topic],
    };
  });

  // Calculate total lessons and durations
  let totalLessonsCount = 0;
  normalizedRootModules.forEach((m) => {
    (m.topics || []).forEach((t: any) => {
      totalLessonsCount += (t.learningUnits || []).length;
    });
  });

  // 2. Update Root Course Document
  console.log(`Updating root course document with ${normalizedRootModules.length} ordered modules...`);
  await courseDocRef.set(
    toDocument({
      modules: normalizedRootModules,
      totalModules: normalizedRootModules.length,
      totalLessons: totalLessonsCount,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );

  // 3. Synchronize Subcollections: courses/{courseId}/modules/{modId} and nested lessons
  console.log(`Synchronizing canonical subcollections...`);
  const batch = db.batch();

  for (let mIdx = 0; mIdx < normalizedRootModules.length; mIdx++) {
    const mod = normalizedRootModules[mIdx];
    const modRef = courseDocRef.collection('modules').doc(mod.id);

    // Extract first learning unit to serve as canonical lesson
    const firstTopic = mod.topics?.[0];
    const firstUnit = firstTopic?.learningUnits?.[0];

    const subModulePayload = {
      id: mod.id,
      courseId,
      title: mod.title,
      description: mod.description,
      duration: mod.duration,
      order: mod.order,
      orderIndex: mod.orderIndex,
      revision: 1,
      topics: mod.topics,
      updatedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    };

    batch.set(modRef, toDocument(subModulePayload), { merge: true });

    if (firstUnit) {
      // Primary canonical lesson: k8s-unit-X-1
      const unitLessonRef = modRef.collection('lessons').doc(firstUnit.id);
      const unitLessonPayload: any = {
        id: firstUnit.id,
        courseId,
        moduleId: mod.id,
        title: firstUnit.title,
        description: firstUnit.description || '',
        duration: firstUnit.duration || '25 mins',
        type: (firstUnit.type?.toLowerCase() || 'reading'),
        content: firstUnit.readingContent || firstUnit.content || '',
        readingContent: firstUnit.readingContent || firstUnit.content || '',
        conceptTheory: firstUnit.conceptTheory || firstUnit.readingContent || '',
        order: 1,
        orderIndex: 1,
        revision: 1,
        learningObjectives: firstUnit.learningObjectives || [],
        codeExamples: firstUnit.codeExamples || [],
        keyPoints: firstUnit.keyPoints || [],
        practiceQuestions: firstUnit.practiceQuestions || [],
        resourceLinks: firstUnit.resourceLinks || [],
        resources: firstUnit.resources || [],
        updatedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
      };
      batch.set(unitLessonRef, toDocument(unitLessonPayload), { merge: true });

      // Legacy alias: k8s-lesson-X-1 (with identical content for zero-breakage backwards compatibility)
      const legacyLessonId = `k8s-lesson-${mIdx + 1}-1`;
      const legacyLessonRef = modRef.collection('lessons').doc(legacyLessonId);
      const legacyLessonPayload: any = {
        ...unitLessonPayload,
        id: legacyLessonId,
      };
      batch.set(legacyLessonRef, toDocument(legacyLessonPayload), { merge: true });
    }
  }

  await batch.commit();
  console.log(`✅ Subcollections synchronized successfully for all 15 modules and lessons!`);

  // Clear backend cache if running
  const { courseContentService } = await import('../services/course/courseContent.service');
  courseContentService.invalidateCache(`modules:${courseId}`);
  courseContentService.invalidateCache(`lessons:${courseId}`);

  console.log(`✅ Reconciliation completed!`);
}

reconcileKubernetes()
  .catch(err => {
    console.error('❌ Reconciliation failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
