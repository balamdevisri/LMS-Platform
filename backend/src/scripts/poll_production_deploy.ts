async function pollProduction() {
  console.log('==================================================');
  console.log('POLLING PRODUCTION API FOR DEPLOYMENT (commit 35cf459)');
  console.log('==================================================\n');

  const url = 'https://www.kaizenq.in/api/courses/kubernetes-complete-course-beginner-to-advanced/modules';

  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const json: any = await res.json();
      const count = json.data?.length || 0;
      const ids = json.data?.map((m: any) => m.id) || [];
      console.log(`[Attempt ${attempt}/20] Status: ${res.status} | Modules: ${count} | IDs: [${ids.slice(0, 3).join(', ')} ... ${ids.slice(-1)}]`);

      if (count === 15 && ids[0] === 'k8s-mod-1' && ids[14] === 'k8s-mod-15') {
        console.log('\n🎉 PRODUCTION DEPLOYMENT IS LIVE WITH 15 CANONICAL MODULES!');
        console.log(`All 15 Module IDs: [${ids.join(', ')}]`);
        return true;
      }
    } catch (e: any) {
      console.log(`[Attempt ${attempt}/20] Fetch notice: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 12000));
  }

  console.log('\nPolling period complete.');
  return false;
}

pollProduction()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
