async function compare() {
  const prodRes = await fetch('https://www.kaizenq.in/api/courses?limit=100');
  const prodJson = await prodRes.json();
  const prodCourses: any[] = prodJson.data?.courses || [];

  const localRes = await fetch('http://localhost:5000/api/courses?limit=100');
  const localJson = await localRes.json();
  const localCourses: any[] = localJson.data?.courses || [];

  console.log(`=== PRODUCTION API COURSES (${prodCourses.length}) ===`);
  prodCourses.forEach((c: any, i: number) => {
    console.log(`${i+1}. [${c.id}] | slug: ${c.slug} | title: "${c.title}" | status: ${c.status} | createdAt: ${JSON.stringify(c.createdAt)} | updatedAt: ${JSON.stringify(c.updatedAt)}`);
  });

  console.log(`\n=== LOCALHOST API COURSES (${localCourses.length}) ===`);
  localCourses.forEach((c: any, i: number) => {
    console.log(`${i+1}. [${c.id}] | slug: ${c.slug} | title: "${c.title}" | status: ${c.status} | createdAt: ${JSON.stringify(c.createdAt)} | updatedAt: ${JSON.stringify(c.updatedAt)}`);
  });

  const localIds = new Set(localCourses.map((c: any) => c.id));
  const missingInLocal = prodCourses.filter((c: any) => !localIds.has(c.id));
  console.log(`\n=== PROD COURSES MISSING FROM LOCALHOST DB (${missingInLocal.length}) ===`);
  missingInLocal.forEach((c: any, i: number) => {
    console.log(`${i+1}. [${c.id}] | slug: ${c.slug} | title: "${c.title}" | status: ${c.status}`);
  });

  const prodIds = new Set(prodCourses.map((c: any) => c.id));
  const missingInProd = localCourses.filter((c: any) => !prodIds.has(c.id));
  console.log(`\n=== LOCAL COURSES NOT IN PROD DB (${missingInProd.length}) ===`);
  missingInProd.forEach((c: any, i: number) => {
    console.log(`${i+1}. [${c.id}] | slug: ${c.slug} | title: "${c.title}" | status: ${c.status}`);
  });
}
compare();
