async function pollProduction() {
  console.log('==================================================');
  console.log('POLLING PRODUCTION API FOR C PROGRAMMING PARITY');
  console.log('==================================================\n');

  const url = 'https://www.kaizenq.in/api/courses/c-programming-course-id/modules';

  for (let attempt = 1; attempt <= 25; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const json: any = await res.json();
      const count = json.data?.length || 0;
      const ids = json.data?.map((m: any) => m.id) || [];
      const firstTitle = json.data?.[0]?.title || '';
      console.log(`[Attempt ${attempt}/25] Status: ${res.status} | Modules: ${count} | First Title: "${firstTitle}" | IDs: [${ids.slice(0, 3).join(', ')} ... ${ids.slice(-1)}]`);

      if (count === 15 && ids[0] === 'c-mod-1' && ids[14] === 'c-mod-15') {
        console.log('\n🎉 PRODUCTION DEPLOYMENT IS LIVE WITH 15 CANONICAL C PROGRAMMING MODULES!');
        console.log(`All 15 Module IDs: [${ids.join(', ')}]`);
        return true;
      }
    } catch (e: any) {
      console.log(`[Attempt ${attempt}/25] Fetch notice: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 10000));
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
