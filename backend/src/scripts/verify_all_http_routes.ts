const ROUTES = [
  'http://localhost:5173/',
  'http://localhost:5173/courses',
  'http://localhost:5173/admin/courses/kubernetes-complete-course-beginner-to-advanced',
  'http://localhost:5173/admin/courses/c-programming-course-id',
  'http://localhost:5173/admin/courses/course_linux_101',
  'http://localhost:5173/admin/courses/react-js-complete-course',
  'http://localhost:5173/admin/courses/database-management-system',
  'http://localhost:5173/admin/courses/git-github-mastery',
  'http://localhost:5173/admin/courses/java-through-oops-course-id',
  'http://localhost:5173/admin/courses/javascript-mastery',
  'http://localhost:5173/admin/courses/nodejs-backend-development',
  'http://localhost:5173/admin/courses/python-through-oops-course-id',
  'http://localhost:5173/admin/courses/data-structures-and-algorithms',
  'http://localhost:5173/admin/courses/web-development-fundamentals',
  'http://localhost:5000/health',
  'http://localhost:5000/api/courses',
  'http://localhost:5000/api/courses/kubernetes-complete-course-beginner-to-advanced',
  'http://localhost:5000/api/courses/kubernetes-complete-course-beginner-to-advanced/modules',
];

async function checkRoutes() {
  console.log('================================================================================');
  console.log('HTTP ROUTES & API HEALTH VERIFICATION');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const url of ROUTES) {
    try {
      const res = await fetch(url);
      const isOk = res.status >= 200 && res.status < 400;
      console.log(`[HTTP ${res.status}] ${url.padEnd(85)} -> ${isOk ? 'OK (PASS)' : 'FAIL'}`);
      if (isOk) passed++;
      else failed++;
    } catch (err: any) {
      console.error(`[ERROR] ${url.padEnd(85)} -> Error: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed (Total: ${ROUTES.length})`);
}

checkRoutes().catch(console.error);
