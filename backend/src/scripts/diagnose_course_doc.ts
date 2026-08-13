import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('--- DIAGNOSING COURSE DOCUMENT IN Firestore ---');
  
  const courseId = 'react-js-complete-course';
  const doc = await db.collection('courses').doc(courseId).get();
  
  if (!doc.exists) {
    console.log(`Course document "${courseId}" does not exist in courses collection!`);
    process.exit(1);
  }
  
  const data = doc.data();
  console.log(`Course ID: ${doc.id}`);
  console.log(`Course Title: ${data?.title}`);
  
  const modules = data?.modules;
  if (!modules) {
    console.log('No nested "modules" field found in the course document.');
  } else {
    console.log(`Found nested "modules" field. Type: ${typeof modules}, Length: ${modules.length}`);
    
    // Check Module 1, Topic 1, Learning Unit 1.1
    const m1 = modules[0];
    console.log(`\n--- Module 1: "${m1?.title}" (ID: ${m1?.id}) ---`);
    const t1 = m1?.topics?.[0];
    console.log(`  Topic 1: "${t1?.title}" (ID: ${t1?.id})`);
    const u1 = t1?.learningUnits?.[0];
    console.log(`    Learning Unit 1.1: "${u1?.title}" (ID: ${u1?.id})`);
    console.log(`    Unit fields: ${Object.keys(u1 || {})}`);
    console.log(`    Unit type: ${u1?.type}`);
    console.log(`    Unit description: ${JSON.stringify(u1?.description)}`);
    console.log(`    Unit readingContent length: ${u1?.readingContent?.length} chars`);
    
    // Inspect u1's readingContent for duplicates
    if (u1?.readingContent) {
      const val = u1.readingContent;
      console.log(`    readingContent snippet: ${JSON.stringify(val.substring(0, 300))}`);
      const readingCount = (val.match(/reading markdown content/gi) || []).length;
      console.log(`    Occurrences of "READING MARKDOWN CONTENT": ${readingCount}`);
    }
    
    // Compare with u2 and u3
    const u2 = t1?.learningUnits?.[1];
    const u3 = t1?.learningUnits?.[2];
    console.log(`\n    Learning Unit 1.2: "${u2?.title}" (ID: ${u2?.id})`);
    console.log(`    readingContent length: ${u2?.readingContent?.length} chars`);
    console.log(`\n    Learning Unit 1.3: "${u3?.title}" (ID: ${u3?.id})`);
    console.log(`    readingContent length: ${u3?.readingContent?.length} chars`);
  }
  
  process.exit(0);
}

main();
