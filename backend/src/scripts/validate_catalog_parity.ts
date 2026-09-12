import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CANONICAL_12_IDS = [
  'c-programming-course-id',
  'course_linux_101',
  'data-structures-and-algorithms',
  'database-management-system',
  'git-github-mastery',
  'java-through-oops-course-id',
  'javascript-mastery',
  'kubernetes-complete-course-beginner-to-advanced',
  'nodejs-backend-development',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'web-development-fundamentals',
];

async function validateParity() {
  console.log('====================================================');
  console.log('STARTING CANONICAL CATALOG & DUPLICATION VALIDATION');
  console.log('====================================================\n');

  // 1. Fetch courses from API
  console.log('[Test 1] Querying GET http://localhost:5000/api/courses...');
  const res = await fetch('http://localhost:5000/api/courses');
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
  const json = await res.json();
  const courses: any[] = json.data?.courses || [];
  console.log(`✓ Total courses returned by API: ${courses.length}`);

  if (courses.length !== 12) {
    throw new Error(`Expected exactly 12 canonical courses, got ${courses.length}`);
  }

  // 2. Validate all 12 canonical IDs
  console.log('\n[Test 2] Validating presence of all 12 canonical track IDs...');
  const returnedIds = new Set(courses.map(c => c.id));
  const missing = CANONICAL_12_IDS.filter(id => !returnedIds.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing canonical course IDs: ${missing.join(', ')}`);
  }
  console.log('✓ All 12 canonical course IDs are present:');
  courses.forEach((c, idx) => {
    console.log(`  ${idx + 1}. [${c.id}] "${c.title}" (slug: ${c.slug}, status: ${c.status})`);
  });

  // 3. Validate Linux Course for zero duplicate lessons
  console.log('\n[Test 3] Validating Linux Course (course_linux_101) modules & lessons...');
  const linuxRes = await fetch('http://localhost:5000/api/courses/course_linux_101/modules');
  const linuxJson = await linuxRes.json();
  const linuxMods: any[] = linuxJson.data || [];
  console.log(`✓ Linux modules count: ${linuxMods.length}`);
  if (linuxMods.length !== 15) {
    throw new Error(`Expected 15 modules for Linux course, got ${linuxMods.length}`);
  }

  const seenLinuxLessonIds = new Set<string>();
  for (const m of linuxMods) {
    const lessons = m.lessons || [];
    console.log(`  Module: [${m.id}] "${m.title}" -> ${lessons.length} lesson(s)`);
    if (lessons.length !== 1) {
      throw new Error(`Expected exactly 1 lesson in Linux module ${m.id}, found ${lessons.length}`);
    }
    const l = lessons[0];
    if (seenLinuxLessonIds.has(l.id)) {
      throw new Error(`Duplicate lesson ID found in Linux course: ${l.id}`);
    }
    seenLinuxLessonIds.add(l.id);
  }
  console.log('✓ Linux course verified: exactly 15 modules, 15 unique lessons, 0 duplicates!');

  // 4. Validate Git, React, Python, Kubernetes
  console.log('\n[Test 4] Validating Git, React, Python, and Kubernetes courses for zero duplicate lessons...');
  const otherTracks = [
    'git-github-mastery',
    'react-js-complete-course',
    'python-through-oops-course-id',
    'kubernetes-complete-course-beginner-to-advanced'
  ];

  for (const cId of otherTracks) {
    const trackRes = await fetch(`http://localhost:5000/api/courses/${cId}/modules`);
    const trackJson = await trackRes.json();
    const mods: any[] = trackJson.data || [];
    const seenIds = new Set<string>();
    let totalLessons = 0;

    for (const m of mods) {
      for (const l of (m.lessons || [])) {
        totalLessons++;
        if (seenIds.has(l.id)) {
          throw new Error(`Duplicate lesson ID in ${cId}: ${l.id}`);
        }
        seenIds.add(l.id);
      }
    }
    console.log(`✓ Track [${cId}]: ${mods.length} modules, ${totalLessons} unique lessons, 0 duplicate IDs.`);
  }

  console.log('\n====================================================');
  console.log('ALL CATALOG PARITY & DEDUPLICATION TESTS PASSED!');
  console.log('====================================================');
}

validateParity()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Validation failed:', err);
    process.exit(1);
  });
