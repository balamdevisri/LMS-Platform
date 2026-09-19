import { db } from '../firebase';
import { courseContentService } from '../services/course/courseContent.service';

async function findTestTarget() {
  console.log('=== FINDING CONTROLLED TEST LESSON ===');
  const courseId = 'c-programming-course-id';
  const courseDoc = await db.collection('courses').doc(courseId).get();
  const courseData = courseDoc.data();
  console.log('Course ID:', courseId);
  console.log('Course Title:', courseData?.title);
  console.log('Course Version:', courseData?.version);

  const modules = await courseContentService.getCourseModules(courseId);
  console.log('Modules count:', modules.length);

  if (modules.length > 0) {
    const mod = modules[0];
    console.log('Module 0 ID:', mod.id, 'Title:', mod.title);
    const topics = mod.topics || [];
    if (topics.length > 0) {
      const top = topics[0];
      console.log(' Topic 0 ID:', top.id, 'Title:', top.title);
      const units = top.learningUnits || [];
      if (units.length > 0) {
        const unit = units[0];
        console.log('  Unit 0 ID:', unit.id, 'Title:', unit.title);
        console.log('  Unit 0 Type:', unit.type);
        console.log('  Unit 0 Content Preview (first 100 chars):', (unit.readingContent || unit.conceptTheory || '').substring(0, 100));
        console.log('\n--- TARGET DETAILS ---');
        console.log('Test Course ID:', courseId);
        console.log('Test Module ID:', mod.id);
        console.log('Test Topic ID:', top.id);
        console.log('Test Lesson ID:', unit.id);
        console.log('Test Lesson Title:', unit.title);
      }
    }
  }
}

findTestTarget().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
