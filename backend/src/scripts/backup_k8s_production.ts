import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function backupKubernetesCourse() {
  if (!db) {
    console.error('❌ Firebase DB is not initialized. Cannot create backup.');
    process.exit(1);
  }

  const courseId = 'kubernetes-complete-course-beginner-to-advanced';
  const timestamp = Date.now();
  const backupDir = path.resolve(__dirname, '../../backups/firestore');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(
    backupDir,
    `backup_before_kubernetes_production_migration_${timestamp}.json`
  );

  console.log('==================================================');
  console.log('STEP 1: CREATING COMPLETE KUBERNETES COURSE BACKUP');
  console.log('==================================================');
  console.log(`Target Course: ${courseId}`);
  console.log(`Backup Destination: ${backupFilePath}`);

  const courseRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    console.error(`❌ Course document "${courseId}" does not exist in Firestore!`);
    process.exit(1);
  }

  const courseData = fromDocument<any>(courseSnap);
  const backupPayload: any = {
    backupTimestamp: new Date().toISOString(),
    courseId,
    rootDocument: {
      id: courseSnap.id,
      ...courseData,
    },
    modules: [],
    legacyModules: [],
  };

  // 1. Fetch all documents in modules subcollection
  const modulesSnap = await courseRef.collection('modules').get();
  console.log(`Found ${modulesSnap.size} module documents in subcollection.`);

  for (const mDoc of modulesSnap.docs) {
    const mData = fromDocument<any>(mDoc);
    const lessonsSnap = await mDoc.ref.collection('lessons').get();
    const lessons: any[] = [];

    lessonsSnap.docs.forEach((lDoc) => {
      lessons.push({
        id: lDoc.id,
        ...fromDocument<any>(lDoc),
      });
    });

    backupPayload.modules.push({
      id: mDoc.id,
      ...mData,
      lessons,
    });
  }

  // 2. Also check for any additional orphaned module subcollection paths (e.g. k8s-mod-1..15 or others)
  for (let i = 1; i <= 20; i++) {
    const candidateId = `k8s-mod-${i}`;
    const candidateDocRef = courseRef.collection('modules').doc(candidateId);
    const candidateSnap = await candidateDocRef.get();
    const candidateLessonsSnap = await candidateDocRef.collection('lessons').get();

    if (!candidateSnap.exists && !candidateLessonsSnap.empty) {
      console.log(`Found orphan lesson subcollection under candidate path: ${candidateId} (${candidateLessonsSnap.size} lessons)`);
      const orphanLessons: any[] = [];
      candidateLessonsSnap.docs.forEach((lDoc) => {
        orphanLessons.push({
          id: lDoc.id,
          ...fromDocument<any>(lDoc),
        });
      });
      backupPayload.legacyModules.push({
        id: candidateId,
        isOrphanPath: true,
        lessons: orphanLessons,
      });
    }
  }

  // Write JSON to disk
  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

  // Verify backup file exists and is non-empty
  const stats = fs.statSync(backupFilePath);
  if (stats.size < 100) {
    console.error(`❌ Backup verification failed: file size is suspiciously small (${stats.size} bytes).`);
    process.exit(1);
  }

  console.log(`✅ Backup successfully created!`);
  console.log(`   File Path: ${backupFilePath}`);
  console.log(`   File Size: ${stats.size} bytes`);
  console.log(`   Root modules count in backup: ${backupPayload.rootDocument.modules?.length || 0}`);
  console.log(`   Subcollection modules count: ${backupPayload.modules.length}`);
  console.log(`   Total subcollection lessons backed up: ${backupPayload.modules.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0)}`);
  console.log('==================================================\n');

  process.exit(0);
}

backupKubernetesCourse().catch((err) => {
  console.error('❌ Backup execution error:', err);
  process.exit(1);
});
