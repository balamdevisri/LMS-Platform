import { serializeFirestorePayload, sanitizeLessonWritePayload } from '../frontend/src/utils/firestoreSerializer';

// Import canonical module arrays
import { linuxCourseModules } from '../frontend/src/data/linuxCourseFullData';
import { cCourseModules } from '../frontend/src/data/cCourseFullData';
import { gitCourseModules } from '../frontend/src/data/gitCourseFullData';
import { dbmsCourseModules } from '../frontend/src/data/dbmsCourseFullData';
import { kubernetesCourseModules } from '../frontend/src/data/kubernetesCourseFullData';
import { reactCourseModules } from '../frontend/src/data/reactCourseFullData';
import { pythonCourseModules } from '../frontend/src/data/pythonCourseFullData';
import { javaCourseModules } from '../frontend/src/data/javaCourseFullData';
import { nodejsCourseModules } from '../frontend/src/data/nodejsCourseFullData';
import { webDevCourseModules } from '../frontend/src/data/webDevCourseFullData';
import { javascriptCourseModules } from '../frontend/src/data/javascriptCourseFullData';
import { dsaCourseModules } from '../frontend/src/data/dsaCourseFullData';

console.log('===============================================================');
console.log('KAIZENQ FIRESTORE CMS WRITE PAYLOAD SERIALIZATION AUDIT');
console.log('AUDITING ALL 12 CANONICAL COURSES (160 MODULES, 481 LESSONS)');
console.log('===============================================================');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}`, detail || '');
    failCount++;
  }
}

// -------------------------------------------------------------
// TEST 1: CASE A — Undefined Optional Field (e.g. videoUrl: undefined)
// -------------------------------------------------------------
console.log('\n--- TEST 1: CASE A — Undefined Optional Field ---');
const caseAPayload = {
  id: 'linux-unit-3-notes',
  courseId: 'course_linux_101',
  moduleId: 'linux-mod-3',
  title: 'Module 3 — Linux File System - Complete Notes',
  description: 'Detailed FHS and inode architecture notes',
  duration: '30 mins',
  type: 'Reading',
  videoUrl: undefined,
  readingContent: '# Linux File System Hierarchy\n\nNotes content...',
  quizQuestions: undefined,
  assignmentInstructions: undefined,
  resources: [
    { id: 'res1', title: 'FHS Guide.pdf', url: 'https://example.com/fhs.pdf' },
    { id: 'res2', title: 'Cheat Sheet.pdf', url: undefined } // nested undefined in array object
  ],
  revision: 1
};

const cleanCaseA = serializeFirestorePayload(caseAPayload);

assert(cleanCaseA.videoUrl === undefined, 'videoUrl is omitted from clean payload (not defined as a key)');
assert(!('videoUrl' in cleanCaseA), 'cleanCaseA does not contain key "videoUrl"');
assert(!('quizQuestions' in cleanCaseA), 'cleanCaseA does not contain key "quizQuestions"');
assert(!('assignmentInstructions' in cleanCaseA), 'cleanCaseA does not contain key "assignmentInstructions"');
assert(cleanCaseA.title === 'Module 3 — Linux File System - Complete Notes', 'title is preserved');
assert(cleanCaseA.resources.length === 2, 'resources array length is preserved');
assert(!('url' in cleanCaseA.resources[1]), 'nested undefined property in array object is stripped');

// Verify JSON serialization doesn't produce undefined
assert(!JSON.stringify(cleanCaseA).includes('undefined'), 'cleanCaseA stringify has no undefined');

// -------------------------------------------------------------
// TEST 2: CASE B — Explicit Clear (videoUrl: "" or videoUrl: null)
// -------------------------------------------------------------
console.log('\n--- TEST 2: CASE B — Explicit Clear Semantics ---');
const caseBPayloadEmpty = {
  id: 'linux-unit-3-video',
  courseId: 'course_linux_101',
  moduleId: 'linux-mod-3',
  title: 'Module 3 Video Lecture',
  type: 'Video',
  videoUrl: '', // Explicit clear via empty string
};

const cleanCaseBEmpty = serializeFirestorePayload(caseBPayloadEmpty);
assert('videoUrl' in cleanCaseBEmpty, 'cleanCaseBEmpty contains key "videoUrl"');
assert(cleanCaseBEmpty.videoUrl === '', 'cleanCaseBEmpty preserves explicit empty string ""');

const caseBPayloadNull = {
  id: 'linux-unit-3-video',
  courseId: 'course_linux_101',
  moduleId: 'linux-mod-3',
  title: 'Module 3 Video Lecture',
  type: 'Video',
  videoUrl: null, // Explicit clear via null
};

const cleanCaseBNull = serializeFirestorePayload(caseBPayloadNull);
assert('videoUrl' in cleanCaseBNull, 'cleanCaseBNull contains key "videoUrl"');
assert(cleanCaseBNull.videoUrl === null, 'cleanCaseBNull preserves explicit null');

// -------------------------------------------------------------
// TEST 3: Preservation of Valid Values (0, false, Arrays, Dates)
// -------------------------------------------------------------
console.log('\n--- TEST 3: Preservation of Falsy & Complex Valid Values ---');
const complexPayload = {
  zeroVal: 0,
  falseVal: false,
  emptyStr: '',
  nullVal: null,
  validStr: 'Hello World',
  dateObj: new Date('2026-09-18T12:00:00.000Z'),
  nested: {
    a: undefined,
    b: 0,
    c: false,
    d: null,
    e: {
      deepUndefined: undefined,
      deepValid: 'yes'
    }
  },
  arr: [1, undefined, 0, false, null, { itemUndefined: undefined, itemValid: 42 }]
};

const cleanComplex = serializeFirestorePayload(complexPayload);
assert(cleanComplex.zeroVal === 0, 'Zero 0 is preserved');
assert(cleanComplex.falseVal === false, 'Boolean false is preserved');
assert(cleanComplex.emptyStr === '', 'Empty string "" is preserved');
assert(cleanComplex.nullVal === null, 'Null is preserved');
assert(typeof cleanComplex.dateObj === 'string', 'Date is converted to ISO string');
assert(!('a' in cleanComplex.nested), 'nested.a (undefined) is omitted');
assert(cleanComplex.nested.b === 0, 'nested.b (0) is preserved');
assert(!('deepUndefined' in cleanComplex.nested.e), 'deeply nested undefined is omitted');
assert(cleanComplex.nested.e.deepValid === 'yes', 'deeply nested valid property is preserved');
assert(cleanComplex.arr.length === 5, 'undefined entry in array is filtered out (6 -> 5 items)');
assert(!('itemUndefined' in cleanComplex.arr[4]), 'undefined inside array object is omitted');
assert(cleanComplex.arr[4].itemValid === 42, 'valid property inside array object is preserved');

// -------------------------------------------------------------
// TEST 4: Audit of EXACT 12 CANONICAL COURSES (160 Modules, 481 Lessons)
// -------------------------------------------------------------
console.log('\n--- TEST 4: Audit of All 12 Canonical Courses CMS Save Payloads ---');

const CANONICAL_COURSES = [
  { id: 'c-programming-course-id', slug: 'c-programming', title: 'C Programming', modules: cCourseModules },
  { id: 'course_linux_101', slug: 'linux-systems-administration-mastery', title: 'Linux Systems & Administration Mastery', modules: linuxCourseModules },
  { id: 'python-through-oops-course-id', slug: 'python-through-oops', title: 'Python Through OOPs', modules: pythonCourseModules },
  { id: 'react-js-complete-course', slug: 'react-js-complete-course', title: 'React JS Complete Course', modules: reactCourseModules },
  { id: 'kubernetes-complete-course-beginner-to-advanced', slug: 'kubernetes-complete-course-beginner-to-advanced', title: 'Kubernetes Complete Course', modules: kubernetesCourseModules },
  { id: 'database-management-system', slug: 'database-management-system', title: 'Database Management System (DBMS)', modules: dbmsCourseModules },
  { id: 'git-github-mastery', slug: 'git-github-mastery', title: 'Git & GitHub Mastery', modules: gitCourseModules },
  { id: 'java-through-oops-course-id', slug: 'java-through-oops', title: 'Java Through OOPs', modules: javaCourseModules },
  { id: 'javascript-mastery', slug: 'javascript', title: 'JavaScript', modules: javascriptCourseModules },
  { id: 'nodejs-backend-development', slug: 'nodejs', title: 'Node.js', modules: nodejsCourseModules },
  { id: 'data-structures-and-algorithms', slug: 'data-structures-and-algorithms', title: 'Data Structures & Algorithms', modules: dsaCourseModules },
  { id: 'web-development-fundamentals', slug: 'web-development', title: 'Web Development', modules: webDevCourseModules },
];

let totalCoursesTested = 0;
let totalModulesTested = 0;
let totalLessonsTested = 0;
let undefinedViolations = 0;

for (const course of CANONICAL_COURSES) {
  totalCoursesTested++;
  const cleanCourse = serializeFirestorePayload(course);

  // Check course level
  for (const [k, v] of Object.entries(cleanCourse)) {
    if (v === undefined) {
      console.error(`Violation in course ${course.id}: field ${k} is undefined`);
      undefinedViolations++;
    }
  }

  for (const mod of course.modules) {
    totalModulesTested++;
    const cleanMod = serializeFirestorePayload(mod);

    for (const [k, v] of Object.entries(cleanMod)) {
      if (v === undefined) {
        console.error(`Violation in course ${course.id}, module ${mod.id}: field ${k} is undefined`);
        undefinedViolations++;
      }
    }

    // Check lessons / learningUnits
    const units = mod.lessons || mod.topics?.flatMap((t: any) => t.learningUnits || []) || [];
    for (const unit of units) {
      totalLessonsTested++;
      // Simulate editor payload creation with optional undefined fields
      const simulatedEditorPayload = {
        ...unit,
        videoUrl: unit.type === 'Video' ? (unit.videoUrl || '') : (unit.videoUrl || undefined),
        quizQuestions: unit.type === 'Quiz' ? unit.quizQuestions : undefined,
        assignmentInstructions: unit.type === 'Assignment' ? unit.assignmentInstructions : undefined,
        lastSavedAt: new Date().toISOString()
      };

      const cleanLesson = serializeFirestorePayload(simulatedEditorPayload);

      for (const [k, v] of Object.entries(cleanLesson)) {
        if (v === undefined) {
          console.error(`Violation in course ${course.id}, lesson ${unit.id}: field ${k} is undefined`);
          undefinedViolations++;
        }
      }
    }
  }
}

assert(totalCoursesTested === 12, `Tested all 12 canonical courses (${totalCoursesTested}/12)`);
assert(totalModulesTested === 160, `Tested all 160 canonical modules (${totalModulesTested}/160)`);
assert(totalLessonsTested === 481, `Tested all 481 canonical lessons (${totalLessonsTested}/481)`);
assert(undefinedViolations === 0, `Zero undefined values found in any CMS save payload across all courses`);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('===============================================================');

if (failCount > 0) {
  process.exit(1);
}
