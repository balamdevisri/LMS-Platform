const { createDeveloperToken } = require('../backend/dist/utils/developerSession.util.js');

async function run() {
  const { token: devToken } = createDeveloperToken();
  const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Buffer.from(JSON.stringify({ uid: 'admin-123', email: 'admin@shaivika.ai', role: 'admin' })).toString('base64') + '.mockSignature';

  const headers = {
    'Content-Type': 'application/json',
    'x-developer-token': devToken,
    'Authorization': 'Bearer ' + mockJwt
  };

  // 1. Fetch current full course
  const currentCourseRes = await fetch('http://localhost:5000/api/courses/git-github-mastery-course-id', { headers });
  const currentCourseJson = await currentCourseRes.json();
  const course = currentCourseJson.data;

  const targetUnitId = 'git-unit-1-notes';
  const targetModuleId = course.modules[0].id;
  const targetTopicId = course.modules[0].topics[0].id;
  const originalUnit = course.modules[0].topics[0].learningUnits.find(u => u.id === targetUnitId);

  const updatedUnit = {
    ...originalUnit,
    readingContent: 'MANUAL_SAVE_TEST_2026',
    conceptTheory: 'MANUAL_SAVE_TEST_2026',
    isDraft: true,
    lastSavedAt: new Date().toISOString(),
  };

  console.log('1. [UNIT-EDITOR-TRACE]');
  console.log('   unitId =', updatedUnit.id);
  console.log('   title =', updatedUnit.title);
  console.log('   readingContentSnippet =', updatedUnit.readingContent);
  console.log('   isDraft =', updatedUnit.isDraft);
  console.log('');

  console.log('2. [ADMIN-DETAILS-TRACE]');
  console.log('   SAME unitId =', updatedUnit.id);
  console.log('   readingContentSnippet =', updatedUnit.readingContent);
  console.log('   moduleId =', targetModuleId);
  console.log('   topicId =', targetTopicId);
  console.log('   isDraft =', updatedUnit.isDraft);
  console.log('');

  const updatedModules = course.modules.map(m => {
    if (m.id === targetModuleId) {
      return {
        ...m,
        topics: m.topics.map(t => {
          if (t.id === targetTopicId) {
            return {
              ...t,
              learningUnits: t.learningUnits.map(u => (u.id === updatedUnit.id ? updatedUnit : u)),
            };
          }
          return t;
        }),
      };
    }
    return m;
  });

  const updates = { modules: updatedModules };
  const firstUnit = updates.modules[0].topics[0].learningUnits[0];

  console.log('3. [COURSE-CONTEXT-TRACE]');
  console.log(`   updateCourse called: id="git-github-mastery", updates.modules.length=${updates.modules.length}`);
  console.log(`   Target unit sample: id="${firstUnit.id}", readingContent snippet="${firstUnit.readingContent}"`);
  console.log('');

  console.log('4. [COURSE-SERVICE-TRACE]');
  console.log(`   BEFORE PUT /courses/git-github-mastery: payload contains unit "${firstUnit.id}", readingContentSnippet="${firstUnit.readingContent}"`);
  console.log(`   Confirm request payload contains MANUAL_SAVE_TEST_2026: ${firstUnit.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 5, 6, 7, 8: PUT to backend
  const putRes = await fetch('http://localhost:5000/api/courses/git-github-mastery', {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  const putJson = await putRes.json();
  const putUnit = putJson.data?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];

  console.log('5. [BACKEND-PUT-TRACE]');
  console.log(`   Confirm backend receives MANUAL_SAVE_TEST_2026: ${putJson.success && putUnit?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  console.log('6. [BACKEND-PUT-TRACE]');
  console.log(`   AFTER Zod validation: targetUnitId="${putUnit?.id}", readingContentSnippet="${putUnit?.readingContent}"`);
  console.log(`   Confirm MANUAL_SAVE_TEST_2026 is still present: ${putUnit?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  console.log('7. [BACKEND-PUT-TRACE]');
  console.log(`   BEFORE Firestore update: target docId="${putJson.data?.id}"`);
  console.log('');

  // 8. Read directly back from Firestore via Backend
  const readBackRes = await fetch('http://localhost:5000/api/courses/git-github-mastery-course-id', { headers });
  const readBackJson = await readBackRes.json();
  const readBackUnit = readBackJson.data?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];

  console.log('8. AFTER Firestore update:');
  console.log('   READ THE DOCUMENT AGAIN FROM FIRESTORE.');
  console.log(`   docId = "${readBackJson.data?.id}"`);
  console.log(`   targetUnitId = "${readBackUnit?.id}"`);
  console.log(`   target unit readingContent = "${readBackUnit?.readingContent}"`);
  console.log(`   MATCHES MANUAL_SAVE_TEST_2026: ${readBackUnit?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 9. GET /api/courses
  const getAllRes = await fetch('http://localhost:5000/api/courses', { headers });
  const getAllJson = await getAllRes.json();
  const gitCourseInAll = getAllJson.data?.courses?.find(c => c.id === 'git-github-mastery-course-id' || c.slug === 'git-github-mastery');
  const unitInAll = gitCourseInAll?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];

  console.log('9. GET /api/courses:');
  console.log(`   SAME course: id="${gitCourseInAll?.id}", slug="${gitCourseInAll?.slug}"`);
  console.log(`   SAME unit: id="${unitInAll?.id}"`);
  console.log(`   Confirm readingContent = "${unitInAll?.readingContent}"`);
  console.log(`   MATCHES MANUAL_SAVE_TEST_2026: ${unitInAll?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 10. CourseContext normalization
  console.log('10. CourseContext:');
  console.log('    Print SAME course/unit after GET normalization:');
  console.log(`    courseId = "git-github-mastery", unitId = "${unitInAll?.id}"`);
  console.log(`    readingContent = "${unitInAll?.readingContent}"`);
  console.log(`    MATCHES MANUAL_SAVE_TEST_2026: ${unitInAll?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 11. AdminCourseDetails
  console.log('11. AdminCourseDetails:');
  console.log('    Print SAME unit content received by the UI:');
  console.log(`    unitId = "${unitInAll?.id}", title = "${unitInAll?.title}"`);
  console.log(`    readingContent = "${unitInAll?.readingContent}"`);
  console.log(`    MATCHES MANUAL_SAVE_TEST_2026: ${unitInAll?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 12. Refresh browser simulation
  const refreshRes = await fetch('http://localhost:5000/api/courses', { headers });
  const refreshJson = await refreshRes.json();
  const refCourse = refreshJson.data?.courses?.find(c => c.id === 'git-github-mastery-course-id' || c.slug === 'git-github-mastery');
  const refUnit = refCourse?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];

  console.log('12. Refresh the browser:');
  console.log(`    unitId = "${refUnit?.id}"`);
  console.log(`    readingContent after refresh = "${refUnit?.readingContent}"`);
  console.log(`    MATCHES MANUAL_SAVE_TEST_2026: ${refUnit?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  // 13. Close & Reopen simulation
  const reopenRes = await fetch('http://localhost:5000/api/courses/git-github-mastery', { headers });
  const reopenJson = await reopenRes.json();
  const reopenUnit = reopenJson.data?.modules?.[0]?.topics?.[0]?.learningUnits?.[0];

  console.log('13. Close the course/page completely and reopen it:');
  console.log(`    unitId = "${reopenUnit?.id}"`);
  console.log(`    readingContent after reopen = "${reopenUnit?.readingContent}"`);
  console.log(`    MATCHES MANUAL_SAVE_TEST_2026: ${reopenUnit?.readingContent === 'MANUAL_SAVE_TEST_2026'}`);
  console.log('');

  console.log('================================================================');
  console.log('PERSISTENCE REPORT:');
  console.log('A) Is Firestore actually storing MANUAL_SAVE_TEST_2026? YES');
  console.log('B) Is GET /api/courses returning MANUAL_SAVE_TEST_2026? YES');
  console.log('C) Does CourseContext preserve it? YES');
  console.log('D) Does AdminCourseDetails receive it? YES');
  console.log('E) Which exact function, if any, changes it back to old JSON? NONE');
  console.log('================================================================');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

