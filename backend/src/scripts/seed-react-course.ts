import { db } from '../firebase';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  if (!db) {
    console.error('Firebase DB not initialized');
    process.exit(1);
  }
  
  console.log('Seeding React JS Complete Course dynamically from JSON...');
  
  try {
    const courseId = 'react-js-complete-course';
    const now = new Date().toISOString();

    const jsonPath = path.resolve(__dirname, '../../../react_js_complete_course_content.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`JSON file not found at: ${jsonPath}`);
    }
    const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // 1. Create Syllabus metadata dynamically
    const syllabus = jsonContent.modules.map((m: any) => {
      const title = `Module ${m.moduleNumber}: ${m.title.replace(/[ \t]+/g, ' ').trim()}`;
      // Extract first 100 characters of content for the description
      const description = m.content.substring(0, 150).replace(/[ \t\r\n]+/g, ' ').trim() + '...';
      return {
        id: `react-mod-${m.moduleNumber}`,
        title,
        description,
        lessonsCount: 1,
        duration: '4 Hours'
      };
    });

    // 2. Create Course Record
    const courseData = {
      id: courseId,
      title: 'React JS Complete Course',
      slug: 'react-js-complete-course',
      description: 'A complete beginner-to-advanced React JS course covering React fundamentals, development environment setup, JSX, components, props, state, hooks, events, forms, conditional rendering, routing, API integration, state management, styling, real-time projects, and interview preparation.',
      shortDescription: 'A complete beginner-to-advanced React JS course covering React fundamentals, environment setup, Hooks, Routing, APIs, Redux, and styling.',
      category: 'Web Development / Frontend Development',
      level: 'all_levels',
      duration: '24 Hours',
      language: 'English',
      price: 0,
      instructor: {
        id: 'inst_kaizenq',
        name: 'KaizenQ Systems Team',
        role: 'React Systems Architect & LMS Specialist',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      skills: ['React JS', 'JavaScript', 'JSX', 'Hooks', 'Redux Toolkit', 'Tailwind CSS'],
      prerequisites: ['Basic HTML, CSS, and intermediate JavaScript (ES6+) knowledge'],
      learningOutcomes: [
        'Understand Component-Based Architecture and the Virtual DOM rendering cycle',
        'Use JSX expressions, fragments, and conditional rendering operators',
        'Manage local state with useState and leverage useEffect for lifecycle hooks',
        'Coordinate routing using BrowserRouter, Routes, Route, and useNavigate',
        'Perform remote API fetches and integration using Axios',
        'Implement global state management via the Context API and Redux Toolkit',
      ],
      status: 'published',
      visibility: 'public',
      featured: true,
      tags: ['react', 'frontend', 'javascript', 'webdev', 'redux', 'tailwind'],
      enrollmentCount: 0,
      rating: 5.0,
      ratingCount: 0,
      syllabus,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection('courses').doc(courseId).set(courseData);
    console.log('React Course metadata written successfully.');
    
    // 3. Create Modules & Lessons
    console.log('Writing modules and lessons...');
    
    for (const m of jsonContent.modules) {
      const moduleId = `react-mod-${m.moduleNumber}`;
      const title = `Module ${m.moduleNumber}: ${m.title.replace(/[ \t]+/g, ' ').trim()}`;
      
      await db.collection('modules').doc(moduleId).set({
        id: moduleId,
        title,
        order: m.moduleNumber,
        duration: '4 Hours',
        courseId: courseId,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`Module ${moduleId} written.`);

      const lessonId = `react-unit-${m.moduleNumber}-notes`;
      const lessonTitle = `Module ${m.moduleNumber} - Complete Notes`;
      const lessonDesc = `Module ${m.moduleNumber}: ${m.title.replace(/[ \t]+/g, ' ').trim()} Complete Notes.`;
      
      await db.collection('lessons').doc(lessonId).set({
        id: lessonId,
        title: lessonTitle,
        description: lessonDesc,
        order: 1,
        duration: '4 Hours',
        type: 'reading',
        content: m.content,
        moduleId: moduleId,
        courseId: courseId,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`Lesson ${lessonId} written.`);
    }
    
    console.log('Successfully seeded React JS Complete Course!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding course:', error);
    process.exit(1);
  }
}

main();
