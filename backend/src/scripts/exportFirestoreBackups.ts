import { db, isFirebaseAdminInitialized } from '../firebase';
import { exportCollectionToJson, ensureBackupDirExists } from '../utils/firestoreBackup';

const TARGET_COLLECTIONS = [
  'users',
  'students',
  'instructors',
  'courses',
  'modules',
  'lessons',
  'enrollments',
  'progress',
  'student_progress',
  'quizzes',
  'quiz_attempts',
  'assignments',
  'assignment_submissions',
  'attendance',
  'liveClasses',
  'notifications',
  'certificates',
  'auditLogs',
  'email_logs',
  'student_analysis',
];

export const runFirestoreBackup = async (): Promise<Record<string, number>> => {
  ensureBackupDirExists();
  const summary: Record<string, number> = {};

  for (const collectionName of TARGET_COLLECTIONS) {
    try {
      const docs: any[] = [];
      if (isFirebaseAdminInitialized()) {
        const snap = await db.collection(collectionName).get();
        snap.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
      }
      exportCollectionToJson(collectionName, docs);
      summary[collectionName] = docs.length;
    } catch (err: any) {
      console.warn(`[FIRESTORE BACKUP] Warning backing up ${collectionName}:`, err?.message || err);
      exportCollectionToJson(collectionName, []);
      summary[collectionName] = 0;
    }
  }

  return summary;
};

// Execute backup if invoked directly
runFirestoreBackup().then((res) => {
  console.log('[FIRESTORE BACKUP COMPLETE]', res);
});
