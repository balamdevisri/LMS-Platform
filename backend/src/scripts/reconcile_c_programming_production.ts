import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function reconcileCProgramming() {
  console.log('====================================================');
  console.log('STEP 5: RECONCILE C PROGRAMMING PRODUCTION DATA');
  console.log('====================================================\n');

  const courseId = 'c-programming-course-id';
  const courseRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    throw new Error(`Course document "${courseId}" not found in Firestore!`);
  }

  const courseData = fromDocument<any>(courseSnap);
  const modulesList = courseData.modules || [];

  if (!Array.isArray(modulesList) || modulesList.length < 15) {
    throw new Error(`Localhost course data is invalid or incomplete! Found ${modulesList.length} modules, expected 15.`);
  }

  console.log(`Authoritative source loaded with ${modulesList.length} canonical modules.`);

  // Clean any old/placeholder subcollection modules
  const existingSubModulesSnap = await courseRef.collection('modules').get();
  console.log(`Checking existing subcollection modules: ${existingSubModulesSnap.size} found.`);
  
  for (const mDoc of existingSubModulesSnap.docs) {
    // If not matching canonical IDs c-mod-1..15, remove obsolete doc and lessons
    const isCanonical = /^c-mod-(?:[1-9]|1[0-5])$/.test(mDoc.id);
    if (!isCanonical) {
      console.log(`⚠️ Removing non-canonical subcollection module: ${mDoc.id}`);
      const lessonsSnap = await mDoc.ref.collection('lessons').get();
      for (const lDoc of lessonsSnap.docs) {
        await lDoc.ref.delete();
      }
      await mDoc.ref.delete();
    }
  }

  const synchronizedModules: any[] = [];
  let totalCalculatedMinutes = 0;
  let totalLessonsCount = 0;

  for (let i = 0; i < 15; i++) {
    const rawMod = modulesList[i];
    const modIndex = i + 1;
    const modId = `c-mod-${modIndex}`;
    const topicId = `c-topic-${modIndex}`;
    const unitId = `c-unit-${modIndex}-notes`;

    const topic = rawMod.topics?.[0] || {};
    const unit = topic.learningUnits?.[0] || {};

    const fullContent = (unit.readingContent || unit.content || unit.conceptTheory || '').trim();
    if (!fullContent || fullContent.length < 500) {
      throw new Error(`Content for module ${modIndex} (${unitId}) is missing or too short (${fullContent.length} chars)!`);
    }

    const modTitle = rawMod.title || `Module ${modIndex}`;
    const modDesc = rawMod.description || modTitle;
    const modDuration = rawMod.duration || '2 Hours';

    // Parse duration minutes
    let durMinutes = 120;
    if (modDuration.includes('3')) durMinutes = 180;
    else if (modDuration.includes('2')) durMinutes = 120;
    totalCalculatedMinutes += durMinutes;

    const unitTitle = unit.title || `${modTitle} - Complete Notes`;
    const unitDesc = unit.description || `Comprehensive theory, architecture, syntax, examples, and interview questions for ${modTitle}.`;

    console.log(`\nSyncing Module ${modIndex}/15: [${modId}] "${modTitle}"`);
    console.log(`  - Unit: [${unitId}] "${unitTitle}" | Content length: ${fullContent.length} chars`);

    // 1. Write nested lesson document to subcollection
    const modRef = courseRef.collection('modules').doc(modId);
    const lessonRef = modRef.collection('lessons').doc(unitId);

    const lessonDocData = {
      id: unitId,
      courseId,
      moduleId: modId,
      topicId,
      title: unitTitle,
      description: unitDesc,
      type: 'reading',
      readingContent: fullContent,
      content: fullContent,
      conceptTheory: fullContent,
      duration: '60 mins',
      order: 1,
      orderIndex: 1,
      isPublished: true,
      status: 'published',
      resources: unit.resources || [],
      quizQuestions: unit.quizQuestions || [],
      assignmentInstructions: unit.assignmentInstructions || '',
      updatedAt: new Date().toISOString(),
    };

    await lessonRef.set(lessonDocData, { merge: true });
    totalLessonsCount++;

    // Clean any non-canonical lesson documents in this module subcollection
    const allModuleLessonsSnap = await modRef.collection('lessons').get();
    for (const lDoc of allModuleLessonsSnap.docs) {
      if (lDoc.id !== unitId) {
        console.log(`  ⚠️ Removing non-canonical lesson in ${modId}: ${lDoc.id}`);
        await lDoc.ref.delete();
      }
    }

    // 2. Write module document to subcollection
    const moduleDocData = {
      id: modId,
      courseId,
      title: modTitle,
      description: modDesc,
      duration: modDuration,
      estimatedDuration: modDuration,
      order: modIndex,
      orderIndex: modIndex,
      isPublished: true,
      status: 'published',
      topics: [
        {
          id: topicId,
          title: topic.title || `Topic ${modIndex}: ${modTitle}`,
          description: topic.description || modDesc,
          order: 1,
          orderIndex: 1,
          estimatedDuration: modDuration,
          learningUnits: [
            {
              id: unitId,
              title: unitTitle,
              description: unitDesc,
              type: 'Reading',
              duration: '60 mins',
              order: 1,
              orderIndex: 1,
              readingContent: fullContent,
              content: fullContent,
              conceptTheory: fullContent,
              resources: unit.resources || [],
              quizQuestions: unit.quizQuestions || [],
              assignmentInstructions: unit.assignmentInstructions || '',
            }
          ]
        }
      ],
      lessons: [
        {
          id: unitId,
          title: unitTitle,
          description: unitDesc,
          type: 'Reading',
          duration: '60 mins',
          order: 1,
          orderIndex: 1,
        }
      ],
      updatedAt: new Date().toISOString(),
    };

    await modRef.set(moduleDocData, { merge: true });

    // Store in clean root modules array for synchronization
    synchronizedModules.push({
      id: modId,
      title: modTitle,
      description: modDesc,
      duration: modDuration,
      estimatedDuration: modDuration,
      order: modIndex,
      orderIndex: modIndex,
      isPublished: true,
      topics: moduleDocData.topics,
      lessons: moduleDocData.lessons,
    });
  }

  // 3. Update root course document with canonical synchronized metadata and modules array
  const durationHours = Math.round(totalCalculatedMinutes / 60);
  const currentRevision = (courseData.revision || courseData.version || 1) + 1;

  console.log('\nUpdating root course document stats and revision...');
  console.log(`  - Total Modules: 15`);
  console.log(`  - Total Lessons: ${totalLessonsCount}`);
  console.log(`  - Total Duration: ${durationHours} Hours (${totalCalculatedMinutes} mins)`);
  console.log(`  - New Revision: ${currentRevision}`);

  await courseRef.update({
    totalModules: 15,
    modulesCount: 15,
    totalLessons: totalLessonsCount,
    lessonsCount: totalLessonsCount,
    totalDurationMinutes: totalCalculatedMinutes,
    durationHours: durationHours,
    duration: `${durationHours} Hours`,
    modules: synchronizedModules,
    revision: currentRevision,
    version: currentRevision,
    updatedAt: new Date().toISOString(),
  });

  console.log('\n====================================================');
  console.log('✅ RECONCILIATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================\n');
}

reconcileCProgramming()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Reconciliation failed:', err);
    process.exit(1);
  });
