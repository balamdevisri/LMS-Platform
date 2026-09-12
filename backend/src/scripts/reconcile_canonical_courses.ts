import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function reconcile() {
  console.log('====================================================');
  console.log('STARTING SAFE CANONICAL COURSE RECONCILIATION');
  console.log('====================================================\n');

  const { db } = await import('../firebase');

  // STEP 1: Full Backup
  console.log('[Step 1] Creating full timestamped backup of current Firestore courses...');
  const snapshot = await db.collection('courses').get();
  const backupData: any = {
    timestamp: new Date().toISOString(),
    coursesCount: snapshot.docs.length,
    courses: [],
  };

  for (const doc of snapshot.docs) {
    const courseData = { id: doc.id, ...doc.data() };
    const modsSnap = await doc.ref.collection('modules').get();
    const modules: any[] = [];

    for (const mDoc of modsSnap.docs) {
      const lessonsSnap = await mDoc.ref.collection('lessons').get();
      const lessons = lessonsSnap.docs.map(l => ({ id: l.id, ...l.data() }));
      modules.push({ id: mDoc.id, ...mDoc.data(), lessons });
    }

    backupData.courses.push({ ...courseData, subcollectionModules: modules });
  }

  const backupDir = path.resolve(__dirname, '../../backups/firestore');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const backupFilePath = path.join(backupDir, `backup_before_reconcile_${Date.now()}.json`);
  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`✓ Backup saved to: ${backupFilePath} (${backupData.courses.length} courses backed up)`);

  // STEP 2: Import 4 Missing Canonical Tracks from Production API
  console.log('\n[Step 2] Importing missing production canonical tracks...');
  const missingTrackIds = [
    'data-structures-and-algorithms',
    'javascript-mastery',
    'nodejs-backend-development',
    'web-development-fundamentals'
  ];

  for (const cId of missingTrackIds) {
    console.log(`  - Checking canonical track: ${cId}`);
    const existingDoc = await db.collection('courses').doc(cId).get();
    if (!existingDoc.exists) {
      console.log(`    Fetching authoritative data from production for: ${cId}...`);
      const prodRes = await fetch(`https://www.kaizenq.in/api/courses/${encodeURIComponent(cId)}`);
      if (prodRes.ok) {
        const prodJson = await prodRes.json();
        if (prodJson.success && prodJson.data) {
          const courseData = prodJson.data;
          const cleanDoc: any = {
            id: cId,
            title: courseData.title,
            slug: courseData.slug || cId,
            description: courseData.description || courseData.shortDescription || '',
            shortDescription: courseData.shortDescription || '',
            category: courseData.category || 'Computer Science',
            level: courseData.level || 'Beginner',
            price: typeof courseData.price === 'number' ? courseData.price : 0,
            currency: courseData.currency || 'INR',
            duration: courseData.duration || '20 hours',
            thumbnail: courseData.thumbnail || courseData.thumbnailUrl || '',
            banner: courseData.banner || courseData.bannerImage || courseData.thumbnail || '',
            status: 'published',
            language: courseData.language || 'English',
            skills: Array.isArray(courseData.skills) ? courseData.skills : [],
            prerequisites: Array.isArray(courseData.prerequisites) ? courseData.prerequisites : [],
            learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : [],
            modules: Array.isArray(courseData.modules) ? courseData.modules : (Array.isArray(courseData.syllabus) ? courseData.syllabus : []),
            rating: typeof courseData.rating === 'number' ? courseData.rating : 4.9,
            enrollmentCount: typeof courseData.enrollmentCount === 'number' ? courseData.enrollmentCount : 500,
            isDeleted: false,
            version: 1,
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'canonical_sync',
          };

          await db.collection('courses').doc(cId).set(cleanDoc, { merge: true });
          console.log(`    ✓ Saved canonical course document: [${cId}] "${cleanDoc.title}"`);
        }
      } else {
        console.warn(`    ⚠️ Failed to fetch ${cId} from production API (Status: ${prodRes.status})`);
      }
    } else {
      console.log(`    ✓ Already exists in Firestore: [${cId}]`);
    }
  }

  // STEP 3: Soft-Archive Duplicate Alias Records
  console.log('\n[Step 3] Soft-archiving duplicate alias records...');
  const aliasDocIdsToArchive = [
    'git-github-mastery-course-id', // Duplicate of git-github-mastery
    'GRRkLkyOYbmZF8GRlYdr',         // Duplicate of nodejs-backend-development
    'HsmRD2BMu6HqL8wzT2q1',         // Duplicate of python-through-oops-course-id
    'TDkyIFWUabhnkCsHZxPr',         // Duplicate of AI fundamentals
    'gm7xtHFy9s00jeTjpIlf',         // Duplicate of prompt-engineering
    'pcpsy9XHDOUqsInNL0kA',         // Duplicate of course_linux_101 (Linux Essentials)
    'vQEVKk2BVePSk5kSecUP',         // Duplicate of react-js-complete-course (React Zero to Hero)
    'ycy651T3JR2HKxJeDGkT',         // Duplicate of kubernetes-complete-course-beginner-to-advanced
  ];

  for (const aliasId of aliasDocIdsToArchive) {
    const aliasDoc = await db.collection('courses').doc(aliasId).get();
    if (aliasDoc.exists && aliasDoc.data()?.isDeleted !== true) {
      await db.collection('courses').doc(aliasId).set({
        isDeleted: true,
        archived: true,
        archivedAt: new Date().toISOString(),
        archivedReason: 'duplicate_alias_of_canonical_track',
      }, { merge: true });
      console.log(`  ✓ Soft-archived alias document: [${aliasId}] "${aliasDoc.data()?.title}"`);
    }
  }

  // STEP 4: Subcollection Lesson Deduplication
  console.log('\n[Step 4] Cleaning duplicate lesson stubs in subcollections...');

  // Linux Course: remove linux-lesson-1-1 and linux-lesson-2-1 stubs (keeping full linux-unit-1-notes and linux-unit-2-notes)
  const linuxStubs = [
    { modId: 'linux-mod-1', lessonId: 'linux-lesson-1-1' },
    { modId: 'linux-mod-2', lessonId: 'linux-lesson-2-1' },
  ];
  for (const stub of linuxStubs) {
    const docRef = db.collection('courses').doc('course_linux_101').collection('modules').doc(stub.modId).collection('lessons').doc(stub.lessonId);
    const snap = await docRef.get();
    if (snap.exists) {
      await docRef.delete();
      console.log(`  ✓ Removed duplicate Linux lesson stub: ${stub.modId} / ${stub.lessonId}`);
    }
  }

  // Git Course: remove git-lesson-1-1 stub (keeping git-unit-1-notes)
  const gitStub = db.collection('courses').doc('git-github-mastery').collection('modules').doc('git-mod-1').collection('lessons').doc('git-lesson-1-1');
  const gitSnap = await gitStub.get();
  if (gitSnap.exists) {
    await gitStub.delete();
    console.log(`  ✓ Removed duplicate Git lesson stub: git-mod-1 / git-lesson-1-1`);
  }

  // React Course: remove react-lesson-1-1 stub (keeping react-unit-1-notes)
  const reactStub = db.collection('courses').doc('react-js-complete-course').collection('modules').doc('react-mod-1').collection('lessons').doc('react-lesson-1-1');
  const reactSnap = await reactStub.get();
  if (reactSnap.exists) {
    await reactStub.delete();
    console.log(`  ✓ Removed duplicate React lesson stub: react-mod-1 / react-lesson-1-1`);
  }

  console.log('\n====================================================');
  console.log('CANONICAL COURSE RECONCILIATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

reconcile()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Reconciliation failed:', err);
    process.exit(1);
  });
