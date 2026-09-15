import { db } from '../firebase';
import { CourseModuleDoc, CourseLessonDoc } from '../types/courseContent.types';
import { toDocument } from '../utils/firestore';

async function reconcileKubernetes() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  console.log(`Starting canonical reconciliation for course "${courseId}"...`);

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

  // 1. Prepare normalized root modules with explicit order and orderIndex
  const normalizedRootModules: any[] = rawModules.map((mod, idx) => {
    const modOrder = idx + 1;
    const normalizedTopics = (mod.topics || []).map((top: any, tIdx: number) => {
      const topOrder = tIdx + 1;
      const normalizedUnits = (top.learningUnits || top.units || []).map((u: any, uIdx: number) => {
        const uOrder = uIdx + 1;
        const readingContent = u.readingContent || u.content || u.conceptTheory || '';
        return {
          ...u,
          id: u.id || `k8s-unit-${modOrder}-${uOrder}`,
          title: u.title,
          description: u.description || '',
          duration: u.duration || '25 mins',
          type: u.type ? (u.type.charAt(0).toUpperCase() + u.type.slice(1).toLowerCase()) : 'Reading',
          readingContent,
          content: readingContent,
          conceptTheory: readingContent,
          order: uOrder,
          orderIndex: uOrder,
          learningObjectives: Array.isArray(u.learningObjectives) ? u.learningObjectives : [u.title],
          codeExamples: Array.isArray(u.codeExamples) ? u.codeExamples : [],
          keyPoints: Array.isArray(u.keyPoints) ? u.keyPoints : [],
          practiceQuestions: Array.isArray(u.practiceQuestions) ? u.practiceQuestions : [],
          resourceLinks: Array.isArray(u.resourceLinks) ? u.resourceLinks : [],
          resources: Array.isArray(u.resources) ? u.resources : [],
        };
      });

      return {
        ...top,
        id: top.id || `k8s-topic-${modOrder}`,
        title: top.title,
        description: top.description || '',
        estimatedDuration: top.estimatedDuration || '120 mins',
        order: topOrder,
        orderIndex: topOrder,
        learningUnits: normalizedUnits,
      };
    });

    return {
      ...mod,
      id: mod.id || `k8s-mod-${modOrder}`,
      order: modOrder,
      orderIndex: modOrder,
      title: mod.title,
      description: mod.description || '',
      duration: mod.duration || '3 Hours',
      topics: normalizedTopics,
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
