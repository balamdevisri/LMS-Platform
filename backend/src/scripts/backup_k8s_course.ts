import { db } from '../firebase';
import fs from 'fs';
import path from 'path';

async function backupKubernetesCourse() {
  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../../backups/firestore');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(
    backupDir,
    `backup_before_kubernetes_localhost_parity_${timestamp}.json`
  );

  console.log(`Starting backup for course "${courseId}"...`);

  const courseDocSnap = await db.collection('courses').doc(courseId).get();
  if (!courseDocSnap.exists) {
    throw new Error(`Course ${courseId} does not exist in Firestore!`);
  }

  const courseData = courseDocSnap.data();

  // Fetch all subcollection modules and lessons
  const modulesSnap = await db.collection('courses').doc(courseId).collection('modules').get();
  const subModules: any[] = [];

  for (const modDoc of modulesSnap.docs) {
    const modData = { id: modDoc.id, ...modDoc.data() };
    const lessonsSnap = await modDoc.ref.collection('lessons').get();
    const lessons = lessonsSnap.docs.map(lDoc => ({ id: lDoc.id, ...lDoc.data() }));
    subModules.push({
      ...modData,
      lessons,
    });
  }

  // Fetch student progress records for this course
  const progressSnap = await db.collection('student_progress').where('courseId', '==', courseId).get();
  const progressRecords = progressSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // Fetch enrollments if any
  const enrollmentsSnap = await db.collection('enrollments').where('courseId', '==', courseId).get();
  const enrollmentRecords = enrollmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const fullBackup = {
    courseId,
    timestamp: new Date().toISOString(),
    courseDocument: courseData,
    subcollectionModules: subModules,
    studentProgress: progressRecords,
    enrollments: enrollmentRecords,
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(fullBackup, null, 2), 'utf-8');
  console.log(`✅ Backup successfully written to: ${backupFilePath}`);
  console.log(`  - Root doc modules: ${courseData?.modules?.length ?? 0}`);
  console.log(`  - Subcollection modules: ${subModules.length}`);
  console.log(`  - Student progress records: ${progressRecords.length}`);
  console.log(`  - Enrollment records: ${enrollmentRecords.length}`);
}

backupKubernetesCourse()
  .catch(err => {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
