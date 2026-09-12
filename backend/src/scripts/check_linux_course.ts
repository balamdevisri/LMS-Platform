import { db } from '../firebase';
import { CourseRepository } from '../modules/courses/course.repository';

async function checkLinuxCourse() {
  console.log('Checking Linux course in Firestore...');
  if (!db) {
    console.error('Firebase DB not initialized');
    return;
  }
  const courseDoc = await db.collection('courses').doc('course_linux_101').get();
  if (courseDoc.exists) {
    console.log('Direct Firestore price:', courseDoc.data()?.price);
    console.log('Direct Firestore id/slug:', courseDoc.id, courseDoc.data()?.slug);
  } else {
    console.log('Linux Course Doc course_linux_101 NOT found in courses collection!');
  }

  const repo = new CourseRepository();
  const repoDoc = await repo.findById('course_linux_101');
  console.log('Repository findById price:', repoDoc?.price);
  const repoSlugDoc = await repo.findBySlug('linux-systems-administration-mastery');
  console.log('Repository findBySlug price:', repoSlugDoc?.price);
}

checkLinuxCourse();
