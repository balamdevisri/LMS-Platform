import fs from 'fs';
import path from 'path';
import { db } from '../backend/src/firebase';

async function applyFormattedContent() {
  console.log('=== APPLYING CLEAN FORMATTED CONTENT TO GIT COURSE ===');

  const dir = './scripts/formatted_modules';
  const formattedModules: { [key: number]: string } = {};

  for (let i = 1; i <= 15; i++) {
    const filePath = path.join(dir, `mod_${i}.md`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing formatted module file: ${filePath}`);
    }
    formattedModules[i] = fs.readFileSync(filePath, 'utf8');
  }

  // 1. Update github_lms_content.json
  const jsonPath = './github_lms_content.json';
  if (fs.existsSync(jsonPath)) {
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    jsonContent.modules = jsonContent.modules.map((m: any) => {
      const num = m.module_number;
      if (formattedModules[num]) {
        return {
          ...m,
          content: formattedModules[num],
          isFormatted: true,
        };
      }
      return m;
    });
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2), 'utf8');
    console.log('✅ Updated github_lms_content.json with clean formatted modules');
  }

  // 2. Update Firestore course doc: git-github-mastery-course-id
  const courseDocRef = db.collection('courses').doc('git-github-mastery-course-id');
  const courseDocSnap = await courseDocRef.get();

  if (!courseDocSnap.exists) {
    throw new Error('Course doc git-github-mastery-course-id does not exist in Firestore!');
  }

  const courseData = courseDocSnap.data() || {};
  const currentModules = courseData.modules || [];

  const updatedModules = currentModules.map((mod: any, idx: number) => {
    const modNum = idx + 1;
    const formattedText = formattedModules[modNum] || '';

    const updatedTopics = (mod.topics || []).map((topic: any) => {
      const updatedUnits = (topic.learningUnits || []).map((unit: any) => {
        return {
          ...unit,
          readingContent: formattedText,
          conceptTheory: formattedText,
          lastSavedAt: new Date().toISOString(),
        };
      });
      return {
        ...topic,
        learningUnits: updatedUnits,
      };
    });

    return {
      ...mod,
      topics: updatedTopics,
    };
  });

  await courseDocRef.update({
    modules: updatedModules,
    modulesCount: updatedModules.length,
    updatedAt: new Date().toISOString(),
  });
  console.log(`✅ Updated Firestore courses/git-github-mastery-course-id with ${updatedModules.length} formatted modules`);

  // 3. Also update git-github-mastery document if it exists
  const slugDocRef = db.collection('courses').doc('git-github-mastery');
  const slugDocSnap = await slugDocRef.get();
  if (slugDocSnap.exists) {
    await slugDocRef.set({
      ...courseData,
      id: 'git-github-mastery',
      slug: 'git-github-mastery',
      modules: updatedModules,
      modulesCount: updatedModules.length,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('✅ Synchronized Firestore courses/git-github-mastery document');
  }

  // 4. Update any subcollection modules if present
  for (let i = 0; i < updatedModules.length; i++) {
    const mod = updatedModules[i];
    const modNum = i + 1;
    const formattedText = formattedModules[modNum] || '';
    
    // Subcollection under git-github-mastery-course-id
    const subModRef = db.collection('courses').doc('git-github-mastery-course-id').collection('modules').doc(mod.id);
    const subModSnap = await subModRef.get();
    if (subModSnap.exists) {
      await subModRef.update({
        content: formattedText,
        updatedAt: new Date().toISOString(),
      });
    }

    // Subcollection under git-github-mastery
    const subModRef2 = db.collection('courses').doc('git-github-mastery').collection('modules').doc(mod.id);
    const subModSnap2 = await subModRef2.get();
    if (subModSnap2.exists) {
      await subModRef2.update({
        content: formattedText,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  console.log('\n🎉 ALL GITHUB COURSE CONTENT HAS BEEN PROFESSIONALLY FORMATTED AND APPLIED SUCCESSFULLY!');
}

applyFormattedContent().then(() => process.exit(0)).catch(err => {
  console.error('Error applying formatted content:', err);
  process.exit(1);
});
