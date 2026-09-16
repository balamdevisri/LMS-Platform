import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../firebase';
import { fromDocument } from '../utils/firestore';

function sha256(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(str).digest('hex');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CANONICAL_COURSES = [
  'c-programming-course-id',
  'course_linux_101',
  'data-structures-and-algorithms',
  'database-management-system',
  'git-github-mastery',
  'java-through-oops-course-id',
  'javascript-mastery',
  'kubernetes-complete-course-beginner-to-advanced',
  'nodejs-backend-development',
  'python-through-oops-course-id',
  'react-js-complete-course',
  'web-development-fundamentals'
];

async function fetchWithRetry(url: string, retries = 5, delay = 2000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const resetSec = Number(res.headers.get('ratelimit-reset') || res.headers.get('retry-after') || 10);
        console.log(`[RateLimited 429] Waiting ${resetSec + 2}s for reset on ${url}...`);
        await sleep((resetSec + 2) * 1000);
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      console.warn(`Retry ${i + 1}/${retries} for ${url} due to ${err.message}`);
      await sleep(delay);
    }
  }
}

export async function runProductionAuditAndSync() {
  console.log('======================================================================');
  console.log('🚀 STEP 1: READ-ONLY AUDIT OF PRODUCTION (https://www.kaizenq.in/api)');
  console.log('======================================================================\n');

  const prodBase = 'https://www.kaizenq.in/api';

  // 1. Fetch catalog
  console.log('Fetching production courses catalog...');
  const prodCatalogData = await fetchWithRetry(`${prodBase}/courses?limit=100`);
  const prodCoursesList = prodCatalogData.courses || prodCatalogData || [];
  console.log(`Production returned ${prodCoursesList.length} courses in catalog.\n`);

  const fullProductionData: Record<string, any> = {};

  for (const courseItem of prodCoursesList) {
    const courseId = courseItem.id;
    console.log(`\nFetching production details for course: "${courseItem.title}" (${courseId})...`);
    
    // Fetch course detail
    const courseDoc = await fetchWithRetry(`${prodBase}/courses/${courseId}`);
    
    // Fetch modules
    let modules: any[] = [];
    try {
      const modulesRes = await fetchWithRetry(`${prodBase}/courses/${courseId}/modules`);
      modules = Array.isArray(modulesRes) ? modulesRes : (modulesRes.modules || []);
    } catch (e: any) {
      console.warn(`  Warning: Could not fetch modules endpoint for ${courseId}: ${e.message}`);
      modules = courseDoc.modules || [];
    }

    // If subcollection modules have lessons or we need full content per module
    for (const mod of modules) {
      if (mod.id) {
        try {
          const lessonsRes = await fetchWithRetry(`${prodBase}/courses/${courseId}/modules/${mod.id}/lessons?includeContent=true`);
          if (Array.isArray(lessonsRes) && lessonsRes.length > 0) {
            mod.lessons = lessonsRes;
          }
        } catch (e) {
          // Lessons might be embedded already
        }
      }
    }

    fullProductionData[courseId] = {
      course: courseDoc,
      modules,
    };
    console.log(`  Fetched: ${modules.length} modules, ${(courseDoc.modules?.length || 0)} root modules.`);
    await sleep(200); // polite pause
  }

  // Save production snapshot
  const backupDir = path.resolve(__dirname, '../../backups/firestore');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  const prodSnapshotPath = path.join(backupDir, `production_snapshot_${Date.now()}.json`);
  fs.writeFileSync(prodSnapshotPath, JSON.stringify(fullProductionData, null, 2));
  console.log(`\n💾 Saved authoritative production snapshot to: ${prodSnapshotPath}`);

  // 2. Backup localhost Firestore
  console.log('\n======================================================================');
  console.log('🛡️ STEP 2: SAFE BACKUP OF LOCALHOST FIRESTORE DATA');
  console.log('======================================================================');
  const localBackup: Record<string, any> = {};
  for (const cId of CANONICAL_COURSES) {
    const docSnap = await db.collection('courses').doc(cId).get();
    if (docSnap.exists) {
      const cData = fromDocument<any>(docSnap);
      const subModsSnap = await db.collection('courses').doc(cId).collection('modules').get();
      const subModules: any[] = [];
      for (const mDoc of subModsSnap.docs) {
        const mData = fromDocument<any>(mDoc);
        const lSnap = await mDoc.ref.collection('lessons').get();
        const subLessons = lSnap.docs.map(lDoc => fromDocument<any>(lDoc));
        subModules.push({ ...mData, lessons: subLessons });
      }
      localBackup[cId] = {
        course: cData,
        subModules,
      };
    }
  }
  const localBackupPath = path.join(backupDir, `backup_before_production_to_localhost_sync_${Date.now()}.json`);
  fs.writeFileSync(localBackupPath, JSON.stringify(localBackup, null, 2));
  console.log(`💾 Saved localhost backup to: ${localBackupPath}`);

  return { fullProductionData, localBackup, prodSnapshotPath, localBackupPath };
}

if (require.main === module) {
  runProductionAuditAndSync()
    .then(() => {
      console.log('\n✅ Production audit and localhost backup completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Production audit failed:', err);
      process.exit(1);
    });
}
