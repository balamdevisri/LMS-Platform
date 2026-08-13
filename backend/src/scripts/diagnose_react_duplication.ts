import { db } from '../firebase';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('--- STARTING DUPLICATION DIAGNOSTIC ---');
  
  const targetIds = ['react-unit-1-1', 'react-unit-1-2', 'react-unit-1-3'];
  
  for (const id of targetIds) {
    console.log(`\n================ INSPECTING: ${id} ================`);
    const docRef = db.collection('lessons').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log(`Lesson document ${id} does not exist in Firestore!`);
      continue;
    }
    
    const data = doc.data();
    console.log(`Document ID: ${doc.id}`);
    console.log(`Field Names: ${Object.keys(data || {})}`);
    
    if (data) {
      // Print field types and summary
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'string') {
          console.log(`  Field "${key}": String, Length: ${val.length} chars`);
          if (key === 'content') {
            console.log(`  Content snippet: ${JSON.stringify(val.substring(0, 300))}`);
            console.log(`  Content end snippet: ${JSON.stringify(val.substring(val.length - 300))}`);
            
            // Check for repeated patterns
            const paragraphs = val.split('\n').filter(p => p.trim());
            const uniqueParas = new Set(paragraphs);
            console.log(`  Total paragraphs: ${paragraphs.length}, Unique paragraphs: ${uniqueParas.size}`);
            
            // Check for the word "READING MARKDOWN CONTENT"
            const readingCount = (val.match(/reading markdown content/gi) || []).length;
            console.log(`  Occurrences of "READING MARKDOWN CONTENT": ${readingCount}`);
          }
        } else {
          console.log(`  Field "${key}": ${typeof val} / ${JSON.stringify(val)}`);
        }
      }
    }
  }
  
  // Also check if there are duplicate records in the lessons collection with the same title/order/moduleId
  console.log('\n================ CHECKING FOR DUPLICATE DOCUMENTS ================');
  const lessonsSnapshot = await db.collection('lessons')
    .where('moduleId', '==', 'react-mod-1')
    .get();
    
  console.log(`Total lesson documents found for Module 1: ${lessonsSnapshot.size}`);
  const titleCounts: { [title: string]: number } = {};
  lessonsSnapshot.forEach(doc => {
    const title = doc.data().title;
    titleCounts[title] = (titleCounts[title] || 0) + 1;
  });
  
  console.log('Title frequencies:');
  for (const [title, count] of Object.entries(titleCounts)) {
    if (count > 1) {
      console.log(`  ⚠️ DUPLICATE TITLE FOUND: "${title}" occurred ${count} times!`);
    } else {
      console.log(`  "${title}": ${count}`);
    }
  }
  
  process.exit(0);
}

main();
