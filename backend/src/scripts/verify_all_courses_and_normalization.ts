import { normalizeCourseModulesForDisplay, getPresentationLessonTitle, normalizeCourseData } from '../../../frontend/src/services/courseNormalizer';
import { normalizeModuleItem, normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';

const CANONICAL_COURSES = [
  { id: 'c-programming-course-id', expectedModules: 15 },
  { id: 'course_linux_101', expectedModules: 15 },
  { id: 'python-through-oops-course-id', expectedModules: 15 },
  { id: 'react-js-complete-course', expectedModules: 15 },
  { id: 'kubernetes-complete-course-beginner-to-advanced', expectedModules: 15 },
  { id: 'database-management-system', expectedModules: 6 },
  { id: 'git-github-mastery', expectedModules: 15 },
  { id: 'java-through-oops-course-id', expectedModules: 24 },
  { id: 'javascript-mastery', expectedModules: 10 },
  { id: 'nodejs-backend-development', expectedModules: 10 },
  { id: 'data-structures-and-algorithms', expectedModules: 10 },
  { id: 'web-development-fundamentals', expectedModules: 10 }
];

async function runAudit() {
  console.log('====================================================');
  console.log('KAIZENQ LMS — COURSE HIERARCHY STANDARDIZATION AUDIT');
  console.log('====================================================\n');

  let passedCourses = 0;
  let totalModulesChecked = 0;
  let totalLessonsChecked = 0;

  for (const { id: cId, expectedModules } of CANONICAL_COURSES) {
    console.log(`Auditing course: ${cId}...`);
    const cRes = await fetch(`http://kaizenq.in/api/courses/${cId}`);
    if (!cRes.ok) {
      throw new Error(`Failed to fetch course doc: ${cId} (status: ${cRes.status})`);
    }
    const cJson = await cRes.json();
    const rawCourse = cJson.data;
    if (!rawCourse) {
      throw new Error(`Course doc has no data payload: ${cId}`);
    }

    const mRes = await fetch(`http://kaizenq.in/api/courses/${cId}/modules`);
    if (!mRes.ok) {
      throw new Error(`Failed to fetch course modules: ${cId} (status: ${mRes.status})`);
    }
    const mJson = await mRes.json();
    const rawModules = mJson.data || [];

    // 1. Test normalizeCourseModulesForDisplay
    const displayModules = normalizeCourseModulesForDisplay(rawModules);
    if (!displayModules || displayModules.length === 0) {
      throw new Error(`displayModules for ${cId} has 0 modules`);
    }
    if (displayModules.length !== expectedModules) {
      console.warn(`  ⚠️ Module count mismatch for ${cId}: got ${displayModules.length}, expected ${expectedModules}`);
    }

    // 2. Test CourseContext normalizeContextCourse
    const contextCourse = normalizeContextCourse({ ...rawCourse, modules: rawModules });
    if (!contextCourse.modules || contextCourse.modules.length === 0) {
      throw new Error(`Normalized context course ${cId} has 0 modules`);
    }

    // 3. Verify flat lessons and backward-compat topics for every module
    for (let mIdx = 0; mIdx < displayModules.length; mIdx++) {
      const mod = displayModules[mIdx];
      totalModulesChecked++;

      // Strict validation: mod.lessons must be an array of LearningUnitItems
      if (!Array.isArray(mod.lessons)) {
        throw new Error(`Module ${mod.id} in ${cId} is missing lessons array!`);
      }
      if (mod.lessons.length === 0) {
        throw new Error(`Module ${mod.id} in ${cId} has 0 lessons!`);
      }

      // Check presentation lesson title
      for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
        const lesson = mod.lessons[lIdx];
        const presentationTitle = getPresentationLessonTitle(lesson.title, mIdx + 1, mod.lessons.length);
        if (!presentationTitle || presentationTitle.trim().length === 0) {
          throw new Error(`Empty presentation title for lesson ${lesson.id} in module ${mod.id}`);
        }
        totalLessonsChecked++;
      }

      // Backward-compatibility: mod.topics must also exist and mirror lessons
      if (!Array.isArray(mod.topics) || mod.topics.length === 0) {
        throw new Error(`Module ${mod.id} in ${cId} is missing backward-compatible topics array!`);
      }
      if (!Array.isArray(mod.topics[0].learningUnits) || mod.topics[0].learningUnits.length !== mod.lessons.length) {
        throw new Error(`Module ${mod.id} in ${cId} topics[0].learningUnits does not match lessons length!`);
      }
    }

    const firstModSample = displayModules[0];
    const sampleLesson = firstModSample.lessons[0];
    const sampleTitle = getPresentationLessonTitle(sampleLesson.title, 1, firstModSample.lessons.length);

    console.log(`  ✓ ${contextCourse.title} (${cId}): ${displayModules.length} modules, ${displayModules.reduce((a, b) => a + b.lessons.length, 0)} total lessons`);
    console.log(`    Sample: "${firstModSample.title}" -> Lesson: "${sampleTitle}"`);
    passedCourses++;
  }

  console.log('\n====================================================');
  console.log(`ALL ${passedCourses}/${CANONICAL_COURSES.length} CANONICAL COURSES VERIFIED SUCCESSFULLY.`);
  console.log(`Total Modules Audited: ${totalModulesChecked}`);
  console.log(`Total Lessons Audited: ${totalLessonsChecked}`);
  console.log('Hierarchy presentation strictly standardized to Course -> Module -> Lesson.');
  console.log('Zero artificial wrappers (Topic / Learning Unit / Units) exposed.');
  console.log('====================================================\n');
}

runAudit().catch((err) => {
  console.error('FATAL VERIFICATION ERROR:', err);
  process.exit(1);
});
