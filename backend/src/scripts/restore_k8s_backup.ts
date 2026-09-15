import { db } from '../firebase';
import fs from 'fs';
import path from 'path';

async function restoreBackup() {
  const backupDir = path.join(__dirname, '../../backups/firestore');
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup_before_kubernetes_localhost_parity_'));
  if (files.length === 0) {
    throw new Error('No backup file found!');
  }
  const latestBackup = files.sort().reverse()[0];
  const backupPath = path.join(backupDir, latestBackup);
  console.log(`Restoring backup from ${backupPath}...`);
  
  const content = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  const courseId = content.courseId;
  const courseDoc = content.courseDocument;

  await db.collection('courses').doc(courseId).set(courseDoc);
  console.log(`✅ Root document restored with ${courseDoc.modules?.length ?? 0} modules!`);
}

restoreBackup().catch(console.error).finally(() => process.exit(0));
