import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DIR = path.join(__dirname, '..', 'backups', 'firestore');

export const ensureBackupDirExists = (): string => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  return BACKUP_DIR;
};

export const exportCollectionToJson = (collectionName: string, data: any[]): string => {
  const dir = ensureBackupDirExists();
  const filePath = path.join(dir, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[FIRESTORE BACKUP] Successfully backed up ${data.length} docs to ${filePath}`);
  return filePath;
};
