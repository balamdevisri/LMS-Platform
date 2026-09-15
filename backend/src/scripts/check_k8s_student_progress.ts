import { db } from '../firebase';

async function checkStudentProgress() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const progressSnap = await db.collection('student_progress').where('courseId', '==', courseId).get();
  console.log(`Found ${progressSnap.size} student progress records for Kubernetes:`);
  for (const doc of progressSnap.docs) {
    const data = doc.data();
    console.log(`Doc ID: ${doc.id}`);
    console.log(`  studentId: ${data.studentId}`);
    console.log(`  completedLessons:`, data.completedLessons);
    console.log(`  completedUnits:`, data.completedUnits);
    console.log(`  currentLessonId:`, data.currentLessonId);
    console.log(`  currentUnitId:`, data.currentUnitId);
    console.log(`  lastAccessedAt:`, data.lastAccessedAt);
    console.log(`  completionPercentage:`, data.completionPercentage);
  }
}

checkStudentProgress().catch(console.error).finally(() => process.exit(0));
