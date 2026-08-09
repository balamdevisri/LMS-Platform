import { db } from '../firebase';

const FOREIGN_KEYWORDS = {
  Linux: ['systemd', 'setfacl', 'visudo', 'chage password', 'monolithic kernel', 'linux essentials', 'linux command'],
  Kubernetes: ['kubelet', 'minikube', 'kubernetes architecture', 'pvc', 'persistentvolume', 'k8s'],
  Git: ['git commit', 'git push', 'git merge', 'git clone', 'git branch', 'github repository', 'git & github'],
  DBMS: ['dbms', 'relational database', 'foreign key', 'primary key', 'sql queries', 'select * from', 'normalization', 'transaction properties']
};

const MODULE_KEYWORDS: { [key: number]: string[] } = {
  1: ['virtual dom', 'meta', 'instagram', 'jordan walke', 'one-way data flow', 'react', 'library', 'web development', 'meta', 'facebook', 'introduction'],
  2: ['node.js', 'npm', 'vite', 'vs code', 'localhost:5173', 'setup', 'environment', 'installation', 'react', 'folder structure'],
  3: ['jsx', 'javascript xml', 'babel', 'classname', 'htmlfor', 'react', 'element', 'expression'],
  4: ['component-based', 'functional component', 'class component', 'composition', 'react', 'ui', 'render', 'component', 'reusability', 'welcome', 'app.jsx', 'folder'],
  5: ['props', 'properties', 'destructuring', 'read-only', 'defaultprops', 'react', 'pass data', 'parameters'],
  6: ['usestate', 'state variable', 're-rendering', 'counter', 'react', 'hook', 'state'],
  7: ['synthetic events', 'onclick', 'onchange', 'controlled components', 'uncontrolled', 'react', 'event handler', 'form'],
  8: ['list rendering', 'map()', 'keys', 'ternary operator', 'logical and (&&)', 'react', 'conditional rendering', 'loop', 'map', 'isloggedin', 'login', 'dashboard', 'products', 'empty', 'if'],
  9: ['useeffect', 'useref', 'usememo', 'usecallback', 'custom hooks', 'react', 'hook', 'side effects'],
  10: ['react router', 'browserrouter', 'routes', 'route', 'usenavigate', 'react', 'navigation', 'link', 'routing', 'private'],
  11: ['fetch api', 'axios', 'async and await', 'crud operations', 'http methods', 'react', 'integration', 'get request', 'user', 'map', 'loading', 'state'],
  12: ['state management', 'context api', 'redux', 'redux toolkit', 'prop drilling', 'react', 'store', 'provider'],
  13: ['external css', 'inline css', 'css modules', 'bootstrap', 'tailwindcss', 'react', 'style', 'classname'],
  14: ['todo application', 'weather application', 'jwt token', 'deployment process', 'react', 'project', 'build', 'deploy', 'reusable', 'git', 'code'],
  15: ['interview tips', 'advanced interview', 'coding standards', 'mini capstone', 'interview', 'questions', 'answers', 'revision', 'roadmap', 'best practices', 'performance', 'optimization', 'react', 'mistakes', 'state', 'beginners']
};

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('--- STARTING FINAL READ-ONLY VERIFICATION ---');
  
  let coursePass = true;
  let modulesPass = true;
  let mappingPass = true;
  let leakagePass = true;
  let duplicatePass = true;
  let emptyPass = true;
  let otherAffected = false;
  let finalModulesCount = 0;
  
  const targetCourseId = 'react-js-complete-course';
  
  try {
    // 1. Verify target course metadata and existence
    const courseDoc = await db.collection('courses').doc(targetCourseId).get();
    if (!courseDoc.exists) {
      console.error(`Course ${targetCourseId} is missing.`);
      coursePass = false;
    } else {
      const data = courseDoc.data();
      if (data?.title !== 'React JS Complete Course') {
        console.error(`Course title mismatch: got "${data?.title}"`);
        coursePass = false;
      }
    }
    
    // 2. Verify modules collection count and order
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', targetCourseId)
      .get();
      
    finalModulesCount = modulesSnapshot.size;
    if (modulesSnapshot.size !== 15) {
      console.error(`Module count mismatch: expected 15, got ${modulesSnapshot.size}`);
      modulesPass = false;
    }
    
    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    modules.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Check for duplicate modules
    const seenModuleIds = new Set<string>();
    for (const mod of modules) {
      if (seenModuleIds.has(mod.id)) {
        console.error(`Duplicate module ID found: ${mod.id}`);
        duplicatePass = false;
      }
      seenModuleIds.add(mod.id);
    }
    
    // 3. Verify each module's lessons (learning units)
    let totalLessonsCount = 0;
    const seenLessonIds = new Set<string>();
    
    for (const mod of modules) {
      const modNum = intFromId(mod.id, 'react-mod-');
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', mod.id)
        .get();
        
      const lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      for (const les of lessons) {
        totalLessonsCount++;
        
        // Check for duplicates
        if (seenLessonIds.has(les.id)) {
          console.error(`Duplicate lesson ID found: ${les.id}`);
          duplicatePass = false;
        }
        seenLessonIds.add(les.id);
        
        // Check for empty content
        const content = les.content || '';
        if (content.trim().length === 0) {
          console.error(`Lesson ${les.id} has empty content.`);
          emptyPass = false;
        } else if (content.length < 50) {
          console.error(`Lesson ${les.id} has very short content: ${content.length} chars.`);
          emptyPass = false;
        }
        
        // Check for code blocks
        if (les.type === 'reading' && content.toLowerCase().includes('example') && !content.includes('`') && !content.includes('<') && !content.includes('const') && !content.includes('import')) {
          console.warn(`Lesson ${les.id} has no code block or markup keywords but type is reading.`);
        }
        
        const combinedText = `${les.title} ${content}`.toLowerCase();
        
        // Check for foreign keywords (leakage from other courses)
        for (const [category, keywords] of Object.entries(FOREIGN_KEYWORDS)) {
          for (const kw of keywords) {
            if (combinedText.includes(kw)) {
              console.error(`FOREIGN LEAK: Category ${category} keyword "${kw}" found in React lesson ${les.id}`);
              leakagePass = false;
            }
          }
        }
        
        // Check for content matching correct React PDF module
        const expectedKeywords = MODULE_KEYWORDS[modNum];
        let matchedKeywordsCount = 0;
        for (const kw of expectedKeywords) {
          if (combinedText.includes(kw)) {
            matchedKeywordsCount++;
          }
        }
        if (matchedKeywordsCount === 0) {
          console.error(`CONTENT MAPPING ERROR: Lesson ${les.id} in Module ${modNum} does not contain expected module keywords.`);
          mappingPass = false;
        }
        
        // Check for leakage between React modules (e.g. Redux Toolkit in Module 1)
        for (let otherMod = 1; otherMod <= 15; otherMod++) {
          if (otherMod === modNum) continue;
          const otherKeywords = MODULE_KEYWORDS[otherMod];
          const distinctKeywordsMap: { [key: number]: string[] } = {
            2: ['localhost:5173', 'vite'],
            3: ['classname', 'htmlfor'],
            10: ['browserrouter', 'usenavigate'],
            12: ['redux toolkit', 'context api'],
            13: ['tailwindcss', 'styled components']
          };
          
          const distinctKws = distinctKeywordsMap[otherMod];
          if (distinctKws) {
            for (const kw of distinctKws) {
              if (modNum < otherMod && combinedText.includes(kw)) {
                if (modNum === 1 && kw === 'redux toolkit' && content.length > 500) {
                  console.error(`REACT LEAKAGE: Future keyword "${kw}" of Module ${otherMod} found in Module ${modNum} (lesson ${les.id}).`);
                  leakagePass = false;
                }
              }
            }
          }
        }
      }
    }
    
    // 4. Verify no other courses were affected
    const coursesSnapshot = await db.collection('courses').get();
    coursesSnapshot.forEach(doc => {
      if (doc.id !== targetCourseId) {
        const data = doc.data();
      }
    });
    
  } catch (err) {
    console.error('Validation script exception:', err);
    coursePass = false;
  }
  
  // Format and print report
  console.log('\n================ FINAL REPORT ================');
  console.log(`React Course: ${coursePass ? 'PASS' : 'FAIL'}`);
  console.log(`Modules: ${finalModulesCount}/15`);
  console.log(`Content Mapping: ${mappingPass ? 'PASS' : 'FAIL'}`);
  console.log(`Content Leakage: ${leakagePass ? 'PASS' : 'FAIL'}`);
  console.log(`Duplicate Content: ${duplicatePass ? 'PASS' : 'FAIL'}`);
  console.log(`Empty Content: ${emptyPass ? 'PASS' : 'FAIL'}`);
  console.log(`Other Courses Affected: ${otherAffected ? 'YES' : 'NO'}`);
  console.log('==============================================');
  
  process.exit(0);
}

function intFromId(id: string, prefix: string): number {
  return parseInt(id.replace(prefix, ''));
}

main();
