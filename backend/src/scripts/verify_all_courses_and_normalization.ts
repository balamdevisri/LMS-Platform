import { normalizeModuleItem, normalizeContextCourse } from '../../../frontend/src/contexts/CourseContext';
import { normalizeCourseData } from '../../../frontend/src/services/courseNormalizer';

const CANONICAL_COURSES = [
  'c-programming-course-id',
  'course_linux_101',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'kubernetes-complete-course-beginner-to-advanced',
  'database-management-system',
  'git-github-mastery',
  'java-through-oops-course-id',
  'javascript-mastery',
  'nodejs-backend-development',
  'data-structures-and-algorithms',
  'web-development-fundamentals'
];

async function runAudit() {
  console.log('====================================================');
  console.log('KAIZENQ LMS — COMPREHENSIVE RECOVERY VERIFICATION');
  console.log('====================================================\n');

  let passedCourses = 0;
  let totalModulesChecked = 0;
  let totalUnitsChecked = 0;

  for (const cId of CANONICAL_COURSES) {
    console.log(`Auditing course: ${cId}...`);
    const cRes = await fetch(`https://kaizenq.in/api/courses/${cId}`);
    if (!cRes.ok) {
      throw new Error(`Failed to fetch course doc: ${cId} (status: ${cRes.status})`);
    }
    const cJson = await cRes.json();
    const rawCourse = cJson.data;
    if (!rawCourse) {
      throw new Error(`Course doc has no data payload: ${cId}`);
    }

    const mRes = await fetch(`https://kaizenq.in/api/courses/${cId}/modules`);
    if (!mRes.ok) {
      throw new Error(`Failed to fetch course modules: ${cId} (status: ${mRes.status})`);
    }
    const mJson = await mRes.json();
    const rawModules = mJson.data || [];

    // Test CourseContext normalization
    const contextCourse = normalizeContextCourse({ ...rawCourse, modules: rawModules });
    if (!contextCourse.modules || contextCourse.modules.length === 0) {
      throw new Error(`Normalized context course ${cId} has 0 modules`);
    }

    // Verify all modules and topics
    for (let mIdx = 0; mIdx < contextCourse.modules.length; mIdx++) {
      const mod = contextCourse.modules[mIdx];
      totalModulesChecked++;

      // Strict contract checks:
      if (!Array.isArray(mod.topics)) {
        throw new Error(`Module ${mod.id} (${mod.title}) in ${cId} has non-array topics!`);
      }
      if (typeof mod.topics.length !== 'number') {
        throw new Error(`Module ${mod.id} in ${cId} topics.length is not a number!`);
      }
      if (mod.topics.length === 0) {
        throw new Error(`Module ${mod.id} in ${cId} topics array is empty!`);
      }

      for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
        const top = mod.topics[tIdx];
        if (!Array.isArray(top.learningUnits)) {
          throw new Error(`Topic ${top.id} in module ${mod.id} (${cId}) has non-array learningUnits!`);
        }
        if (typeof top.learningUnits.length !== 'number') {
          throw new Error(`Topic ${top.id} in ${cId} learningUnits.length is not a number!`);
        }
        if (top.learningUnits.length === 0) {
          throw new Error(`Topic ${top.id} in ${cId} learningUnits is empty!`);
        }
        totalUnitsChecked += top.learningUnits.length;
      }
    }

    console.log(`  ✓ ${contextCourse.title} (${cId}): ${contextCourse.modules.length} modules, all topics & units normalized safely.`);
    passedCourses++;
  }

  console.log('\n====================================================');
  console.log(`ALL ${passedCourses}/${CANONICAL_COURSES.length} CANONICAL COURSES VERIFIED SUCCESSFULLY.`);
  console.log(`Total Modules Audited: ${totalModulesChecked}`);
  console.log(`Total Learning Units Audited: ${totalUnitsChecked}`);
  console.log('Zero undefined array accesses detected.');
  console.log('====================================================\n');
}

runAudit().catch((err) => {
  console.error('FATAL VERIFICATION ERROR:', err);
  process.exit(1);
});
