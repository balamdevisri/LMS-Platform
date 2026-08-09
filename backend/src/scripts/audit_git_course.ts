import { db } from '../firebase';

const EXPECTED_TITLES = [
  'Module 1: Introduction to Version Control, Git & GitHub',
  'Module 2: Installing Git and Initial Configuration',
  'Module 3: Git Repository Fundamentals',
  'Module 4: Basic Git Commands',
  'Module 5: Branching and Merging',
  'Module 6: GitHub Basics',
  'Module 7: Remote Repository Management',
  'Module 8: Git Collaboration',
  'Module 9: Advanced Git Commands',
  'Module 10: Git Internals',
  'Module 11: GitHub Features',
  'Module 12: Git Best Practices',
  'Module 13: Real-World Git Workflow',
  'Module 14: Git & GitHub Projects',
  'Module 15: Git & GitHub Interview Preparation'
];

const FOREIGN_KEYWORDS = {
  React: ['jsx', 'virtual dom', 'usestate', 'useeffect', 'redux toolkit'],
  Kubernetes: ['kubelet', 'minikube', 'kubernetes architecture', 'pvc', 'pv claim', 'persistentvolume'],
  Linux: ['systemd background', 'setfacl', 'sudoers visudo', 'chage password', 'monolithic kernel']
};

async function runAudit() {
  console.log('--- STARTING LIVE DATABASE AUDIT (audit_git_course.ts) ---');
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }

  const courseId = 'git-github-mastery-course-id';
  let passedCount = 0;

  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      console.error(`Course "${courseId}" not found in Firestore.`);
      process.exit(1);
    }
    const courseData = courseDoc.data() || {};
    console.log(`Course Found: "${courseData.title}" | ID: ${courseDoc.id}`);
    console.log(`Nested Modules: ${courseData.modules?.length || 0} modules`);

    for (let idx = 1; idx <= 15; idx++) {
      const expectedTitle = EXPECTED_TITLES[idx - 1];
      const modId = `git-mod-${idx}`;
      const topicId = `git-topic-${idx}`;
      const unitId = `git-unit-${idx}-notes`;

      const issues: string[] = [];
      const foreignContent: string[] = [];

      // 1. Verify modules collection document
      const modDoc = await db.collection('modules').doc(modId).get();
      if (!modDoc.exists) {
        issues.push(`Module document "${modId}" is missing in Firestore`);
      } else {
        const modData = modDoc.data() || {};
        if (modData.title !== expectedTitle) {
          issues.push(`Title mismatch: "${modData.title}" vs "${expectedTitle}"`);
        }
        if (modData.courseId !== courseId) {
          issues.push(`Course ID mapping incorrect: expected "${courseId}", got "${modData.courseId}"`);
        }
      }

      // 2. Verify lessons collection document
      const lessonDoc = await db.collection('lessons').doc(unitId).get();
      if (!lessonDoc.exists) {
        issues.push(`Lesson document "${unitId}" is missing in Firestore`);
      } else {
        const lessonData = lessonDoc.data() || {};
        if (lessonData.moduleId !== modId) {
          issues.push(`Lesson moduleId mapping incorrect: expected "${modId}", got "${lessonData.moduleId}"`);
        }
        if (lessonData.courseId !== courseId) {
          issues.push(`Lesson courseId mapping incorrect: expected "${courseId}", got "${lessonData.courseId}"`);
        }
        if (lessonData.type !== 'reading') {
          issues.push(`Lesson type should be "reading", got "${lessonData.type}"`);
        }

        // Check content keywords
        const content = (lessonData.content || '').toLowerCase();
        for (const [category, keywords] of Object.entries(FOREIGN_KEYWORDS)) {
          for (const kw of keywords) {
            if (content.includes(kw)) {
              foreignContent.push(`${category} (${kw})`);
            }
          }
        }
      }

      // 3. Verify nested course.modules array
      const nestedMod = courseData.modules?.find((m: any) => m.id === modId);
      if (!nestedMod) {
        issues.push(`Nested module "${modId}" not found in course document`);
      } else {
        if (nestedMod.title !== expectedTitle) {
          issues.push(`Nested title mismatch: "${nestedMod.title}" vs "${expectedTitle}"`);
        }
        const topic = nestedMod.topics?.[0];
        if (!topic) {
          issues.push('Nested topic is missing');
        } else {
          if (topic.id !== topicId) {
            issues.push(`Nested topic ID mismatch: expected "${topicId}", got "${topic.id}"`);
          }
          if (nestedMod.topics.length > 1) {
            issues.push(`Multiple topics found: expected 1, got ${nestedMod.topics.length}`);
          }
          
          const unit = topic.learningUnits?.[0];
          if (!unit) {
            issues.push('Nested learning unit is missing');
          } else {
            if (unit.id !== unitId) {
              issues.push(`Nested unit ID mismatch: expected "${unitId}", got "${unit.id}"`);
            }
            if (unit.type !== 'Reading') {
              issues.push(`Nested unit type should be "Reading", got "${unit.type}"`);
            }
            if (topic.learningUnits.length > 1) {
              issues.push(`Multiple learning units found: expected 1, got ${topic.learningUnits.length}`);
            }
          }
        }
      }

      const passed = issues.length === 0 && foreignContent.length === 0;
      if (passed) passedCount++;

      console.log(`\nModule ${idx}: "${expectedTitle}"`);
      console.log(`  Live DB Status:   ${modDoc.exists && lessonDoc.exists ? 'PASSED' : 'FAILED'}`);
      console.log(`  Relationships:    ${issues.some(i => i.includes('ID') || i.includes('mapping')) ? 'INCORRECT' : 'CORRECT'}`);
      console.log(`  Foreign Content:  ${foreignContent.length > 0 ? foreignContent.join(', ') : 'None'}`);
      if (issues.length > 0) {
        console.log(`  Issues Detected:`);
        issues.forEach(iss => console.log(`    - ${iss}`));
      }
    }

    console.log(`\n--- SUMMARY (audit_git_course.ts) ---`);
    console.log(`Total Modules Audited: 15`);
    console.log(`Passed Modules:  ${passedCount}/15`);
    console.log(`Overall Result:  ${passedCount === 15 ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

runAudit();
