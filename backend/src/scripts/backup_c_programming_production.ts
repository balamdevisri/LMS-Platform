import * as fs from 'fs';
import * as path from 'path';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

async function backupCProgrammingCourse() {
  const courseId = 'c-programming-course-id';
  const timestamp = Date.now();
  const backupDir = path.resolve(__dirname, '../../backups/firestore');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(
    backupDir,
    `backup_before_c_programming_production_reconcile_${timestamp}.json`
  );

  console.log('====================================================');
  console.log('STEP 3: CREATING COMPLETE C PROGRAMMING BACKUP');
  console.log('====================================================');
  console.log(`Target Course: ${courseId}`);
  console.log(`Backup Destination: ${backupFilePath}`);

  // 1. Fetch Production API Data
  let prodApiCourse: any = null;
  let prodApiModules: any = null;
  try {
    const devTokenRes = await fetch('https://www.kaizenq.in/api/developer-access/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: 'googlemanoj' }),
    });
    const devTokenJson: any = await devTokenRes.json();
    const token = devTokenJson.token;

    const cRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}`, {
      headers: { ...(token ? { 'x-developer-token': token } : {}) },
    });
    if (cRes.ok) {
      const cJson: any = await cRes.json();
      prodApiCourse = cJson.data;
    }

    const mRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(courseId)}/modules`, {
      headers: { ...(token ? { 'x-developer-token': token } : {}) },
    });
    if (mRes.ok) {
      const mJson: any = await mRes.json();
      prodApiModules = mJson.data;
    }
  } catch (err: any) {
    console.warn('Production API fetch notice during backup:', err.message);
  }

  // 2. Fetch Current Localhost / Database Document
  let firestoreRootDoc: any = null;
  const firestoreModules: any[] = [];

  if (db) {
    const docRef = db.collection('courses').doc(courseId);
    const snap = await docRef.get();
    if (snap.exists) {
      firestoreRootDoc = { id: snap.id, ...fromDocument<any>(snap) };

      const subModsSnap = await docRef.collection('modules').get();
      for (const mDoc of subModsSnap.docs) {
        const mData = fromDocument<any>(mDoc);
        const lessonsSnap = await mDoc.ref.collection('lessons').get();
        const lessons = lessonsSnap.docs.map((lDoc) => ({ id: lDoc.id, ...fromDocument<any>(lDoc) }));
        firestoreModules.push({
          id: mDoc.id,
          ...mData,
          lessons,
        });
      }
    }
  }

  const backupPayload = {
    backupTimestamp: new Date().toISOString(),
    courseId,
    productionApiResponse: {
      course: prodApiCourse,
      modules: prodApiModules,
    },
    firestoreStateBeforeReconcile: {
      rootDoc: firestoreRootDoc,
      subcollectionModules: firestoreModules,
    },
  };

  fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');

  const stats = fs.statSync(backupFilePath);
  if (stats.size < 100) {
    console.error(`❌ Backup verification failed: file size is suspiciously small (${stats.size} bytes).`);
    process.exit(1);
  }

  console.log(`✅ Backup successfully created!`);
  console.log(`   File Path: ${backupFilePath}`);
  console.log(`   File Size: ${stats.size} bytes`);
  console.log(`   Production Modules backed up: ${prodApiModules?.length || 0}`);
  console.log(`   Firestore Modules backed up: ${firestoreRootDoc?.modules?.length || 0}`);
  console.log('====================================================\n');
}

backupCProgrammingCourse()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Backup error:', err);
    process.exit(1);
  });
