async function testProd() {
  const cId = 'c-programming-course-id';
  const mRes = await fetch(`https://www.kaizenq.in/api/courses/${cId}/modules`);
  const mJson: any = await mRes.json();
  const m1 = mJson.data?.[0];
  console.log('Module 1 raw from API:');
  console.log('m1.lessons:', m1?.lessons);
  console.log('m1.topics:', JSON.stringify(m1?.topics, null, 2));

  const lRes = await fetch(`https://www.kaizenq.in/api/courses/${cId}/modules/c-mod-1/lessons?includeContent=true`);
  const lJson: any = await lRes.json();
  console.log('\nSubcollection Lesson Query (includeContent=true):');
  console.log('lJson.data:', lJson?.data);
  if (lJson?.data?.[0]) {
    const content = lJson.data[0].readingContent || lJson.data[0].content || '';
    console.log('Lesson 1 Content Length:', content.length, 'chars');
    console.log('Lesson 1 Content Preview:', content.slice(0, 150));
  }
}

testProd().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
