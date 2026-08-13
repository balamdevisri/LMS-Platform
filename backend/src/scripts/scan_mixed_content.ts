import { db } from '../firebase';

const FOREIGN_KEYWORDS = {
  Linux: ['systemd', 'setfacl', 'visudo', 'chage password', 'monolithic kernel', 'linux essentials', 'linux command'],
  Kubernetes: ['kubelet', 'minikube', 'kubernetes architecture', 'pvc', 'persistentvolume', 'k8s'],
  Git: ['git commit', 'git push', 'git merge', 'git clone', 'git branch', 'github repository', 'git & github'],
  DBMS: ['dbms', 'relational database', 'foreign key', 'primary key', 'sql queries', 'select * from', 'normalization', 'transaction properties']
};

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  const courseId = 'react-js-complete-course';
  console.log(`Auditing course "${courseId}" for mixed content...`);
  
  try {
    const lessonsSnapshot = await db.collection('lessons')
      .where('courseId', '==', courseId)
      .get();
      
    console.log(`Retrieved ${lessonsSnapshot.size} lessons. Scanning...`);
    
    let mixedFound = false;
    lessonsSnapshot.forEach(doc => {
      const data = doc.data();
      const content = (data.content || '').toLowerCase();
      const title = (data.title || '').toLowerCase();
      const combined = `${title} ${content}`;
      
      const leaks: string[] = [];
      for (const [category, keywords] of Object.entries(FOREIGN_KEYWORDS)) {
        for (const kw of keywords) {
          if (combined.includes(kw)) {
            leaks.push(`${category} ("${kw}")`);
          }
        }
      }
      
      if (leaks.length > 0) {
        console.log(`- Leak found in Lesson ID: ${doc.id} | Title: "${data.title}":`);
        console.log(`  Leaks: ${leaks.join(', ')}`);
        mixedFound = true;
      }
    });
    
    if (!mixedFound) {
      console.log('Clean scan: No foreign Linux, Kubernetes, Git, or DBMS content found in the React JS lessons.');
    }
  } catch (err) {
    console.error('Error during scan:', err);
  }
  process.exit(0);
}

main();
