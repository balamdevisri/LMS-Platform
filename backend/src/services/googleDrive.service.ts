import { google, drive_v3 } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { env } from '../config/env';
import logger from '../config/logger';

export interface UploadCertificateParams {
  pdfFilePath: string | Buffer;
  courseName: string;
  certificateId: string;
  studentName?: string;
}

export interface DriveUploadResponse {
  driveFileId: string;
  driveUrl: string;
  webContentLink: string;
  fileName: string;
}

export class GoogleDriveService {
  private driveClient?: drive_v3.Drive;
  private isConnected: boolean = false;
  private rootFolderId?: string;

  constructor() {
    this.rootFolderId = env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  /**
   * STEP 2 & 4: Load Service Account Credentials & Connect to Google Drive API
   */
  public async connectGoogleDrive(): Promise<boolean> {
    try {
      // 1. Locate Service Account JSON credentials file
      const possiblePaths = [
        path.resolve(process.cwd(), 'config/google-drive.json'),
        path.resolve(process.cwd(), '../config/google-drive.json'),
        path.join(__dirname, '../../config/google-drive.json'),
        path.join(__dirname, '../../../config/google-drive.json'),
      ];

      let keyFilePath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          keyFilePath = p;
          break;
        }
      }

      let auth: any;

      if (keyFilePath) {
        const jsonContent = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
        auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: jsonContent.client_email,
            private_key: jsonContent.private_key,
          },
          scopes: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive',
          ],
        });
      } else if (env.GOOGLE_DRIVE_CLIENT_EMAIL && env.GOOGLE_DRIVE_PRIVATE_KEY) {
        let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY;
        if (privateKey.includes('\\n')) {
          privateKey = privateKey.replace(/\\n/g, '\n');
        }

        auth = new google.auth.JWT({
          email: env.GOOGLE_DRIVE_CLIENT_EMAIL,
          key: privateKey,
          scopes: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive',
          ],
        });
      } else {
        logger.error('❌ Google Drive Connection Failed: Missing Service Account JSON at backend/config/google-drive.json');
        this.isConnected = false;
        return false;
      }

      this.driveClient = google.drive({ version: 'v3', auth });

      // Verify connection at server startup
      const about = await this.driveClient.about.get({ fields: 'user, storageQuota' });
      this.isConnected = true;

      console.log('✅ Google Drive Connected');
      logger.info('Google Drive Connected');
      logger.info(`[GOOGLE DRIVE] Authenticated as: ${about.data.user?.emailAddress || 'Service Account'}`);

      // STEP 3: Validate root GOOGLE_DRIVE_FOLDER_ID if set
      if (this.rootFolderId) {
        try {
          await this.driveClient.files.get({ fileId: this.rootFolderId, fields: 'id, name' });
          logger.info(`[GOOGLE DRIVE] Root Folder Verified ID: ${this.rootFolderId}`);
        } catch (folderErr: any) {
          logger.warn(`⚠️ [GOOGLE DRIVE] Root Folder ID "${this.rootFolderId}" invalid or unaccessible: ${folderErr?.message}`);
        }
      }

      return true;
    } catch (err: any) {
      this.isConnected = false;
      console.log('❌ Google Drive Connection Failed');
      logger.error('❌ Google Drive Connection Failed:', err?.message || err);
      return false;
    }
  }

  /**
   * STEP 4 & 5: Create Course Folder If Not Exists inside Root Folder
   */
  public async createCourseFolderIfNotExists(
    courseName: string,
    parentFolderId?: string
  ): Promise<string> {
    if (!this.driveClient) {
      const connected = await this.connectGoogleDrive();
      if (!connected || !this.driveClient) {
        throw new Error('Google Drive API is not connected.');
      }
    }

    const parentId = parentFolderId || this.rootFolderId;
    const sanitizedCourseName = courseName.replace(/[/\\?%*:|"<>]/g, '-').trim();

    try {
      // 1. Search for existing folder
      let query = `mimeType='application/vnd.google-apps.folder' and name='${sanitizedCourseName}' and trashed=false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const searchRes = await this.driveClient.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (searchRes.data.files && searchRes.data.files.length > 0) {
        const folderId = searchRes.data.files[0].id!;
        logger.info(`[GOOGLE DRIVE] Found existing Course Folder "${sanitizedCourseName}" (ID: ${folderId})`);
        return folderId;
      }

      // 2. Create new course folder
      const folderMetadata: drive_v3.Schema$File = {
        name: sanitizedCourseName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentId) {
        folderMetadata.parents = [parentId];
      }

      const createRes = await this.driveClient.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, webViewLink',
      });

      const newFolderId = createRes.data.id!;
      logger.info(`[GOOGLE DRIVE] Created new Course Folder "${sanitizedCourseName}" (ID: ${newFolderId})`);

      // Make folder public read-only
      try {
        await this.driveClient.permissions.create({
          fileId: newFolderId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permErr: any) {
        logger.warn(`⚠️ Permission warning on folder ${newFolderId}: ${permErr?.message}`);
      }

      return newFolderId;
    } catch (err: any) {
      logger.error(`[GOOGLE DRIVE] Error in createCourseFolderIfNotExists for "${courseName}": ${err?.message || err}`);
      throw new Error(`Failed to create or find course folder "${courseName}": ${err?.message || err}`);
    }
  }

  /**
   * STEP 4, 5, 6, 7 & 8: Upload Certificate PDF to Google Drive with Retries
   */
  public async uploadCertificate(
    params: UploadCertificateParams,
    maxRetries: number = 3
  ): Promise<DriveUploadResponse> {
    const { pdfFilePath, courseName, certificateId } = params;
    const fileName = `${certificateId}.pdf`;

    console.log('Uploading Certificate...');
    logger.info('Uploading Certificate...');
    logger.info(`[GOOGLE DRIVE] Destination File: "${fileName}" | Course: "${courseName}"`);

    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        if (!this.driveClient) {
          await this.connectGoogleDrive();
        }

        if (!this.driveClient) {
          throw new Error('Google Drive client connection unestablished.');
        }

        // 1. Get or Create Course Folder
        const courseFolderId = await this.createCourseFolderIfNotExists(courseName);

        // 2. Prepare Readable Stream for PDF Data
        let mediaStream: Readable;
        if (Buffer.isBuffer(pdfFilePath)) {
          mediaStream = new Readable();
          mediaStream.push(pdfFilePath);
          mediaStream.push(null);
        } else if (typeof pdfFilePath === 'string' && fs.existsSync(pdfFilePath)) {
          mediaStream = fs.createReadStream(pdfFilePath);
        } else if (typeof pdfFilePath === 'string' && pdfFilePath.startsWith('data:')) {
          const base64Data = pdfFilePath.split(',')[1] || pdfFilePath;
          const buffer = Buffer.from(base64Data, 'base64');
          mediaStream = new Readable();
          mediaStream.push(buffer);
          mediaStream.push(null);
        } else {
          throw new Error(`Invalid PDF file input: File path does not exist or invalid buffer.`);
        }

        // 3. Upload File to Google Drive
        const fileMetadata: drive_v3.Schema$File = {
          name: fileName,
          parents: [courseFolderId],
          mimeType: 'application/pdf',
        };

        const media = {
          mimeType: 'application/pdf',
          body: mediaStream,
        };

        const uploadRes = await this.driveClient.files.create({
          requestBody: fileMetadata,
          media,
          fields: 'id, name, webViewLink, webContentLink',
        });

        const driveFileId = uploadRes.data.id;
        if (!driveFileId) {
          throw new Error('Drive API returned null or undefined file ID.');
        }

        // 4. STEP 6: Set Public Read-Only Permission
        try {
          await this.driveClient.permissions.create({
            fileId: driveFileId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
            },
          });
        } catch (permErr: any) {
          logger.warn(`⚠️ Failed setting public permissions on ${driveFileId}: ${permErr?.message}`);
        }

        // 5. STEP 6: Get Shareable Link
        const shareable = await this.getShareableLink(driveFileId);

        console.log('Certificate Uploaded Successfully');
        console.log(`Google Drive URL: ${shareable.driveUrl}`);

        logger.info('Certificate Uploaded Successfully');
        logger.info(`Google Drive URL: ${shareable.driveUrl}`);
        logger.info(`[GOOGLE DRIVE] File ID: ${driveFileId}`);

        return {
          driveFileId,
          driveUrl: shareable.driveUrl,
          webContentLink: shareable.webContentLink,
          fileName,
        };
      } catch (err: any) {
        lastError = err;
        logger.error(`[GOOGLE DRIVE] ❌ Upload Attempt ${attempt}/${maxRetries} Failed for ${fileName}: ${err?.message || err}`);

        if (attempt < maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          logger.info(`[GOOGLE DRIVE] Retrying upload in ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    logger.error(`[GOOGLE DRIVE] ❌ ALL ${maxRetries} UPLOAD ATTEMPTS FAILED for ${fileName}`);
    throw new Error(`Google Drive Upload Failed after ${maxRetries} retries: ${lastError?.message || lastError}`);
  }

  /**
   * STEP 4 & 6: Generate Public Read-Only Link for a Drive File
   */
  public async getShareableLink(fileId: string): Promise<{ driveFileId: string; driveUrl: string; webContentLink: string }> {
    if (!this.driveClient) {
      await this.connectGoogleDrive();
    }

    if (!this.driveClient) {
      throw new Error('Google Drive client is not connected.');
    }

    try {
      const getRes = await this.driveClient.files.get({
        fileId,
        fields: 'id, name, webViewLink, webContentLink',
      });

      const driveUrl = getRes.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      const webContentLink = getRes.data.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;

      return {
        driveFileId: fileId,
        driveUrl,
        webContentLink,
      };
    } catch (err: any) {
      logger.error(`[GOOGLE DRIVE] Error getting shareable link for ${fileId}: ${err?.message || err}`);
      return {
        driveFileId: fileId,
        driveUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
        webContentLink: `https://drive.google.com/uc?id=${fileId}&export=download`,
      };
    }
  }

  /**
   * STEP 4: Delete Certificate File from Google Drive
   */
  public async deleteCertificate(fileId: string): Promise<boolean> {
    if (!this.driveClient) {
      await this.connectGoogleDrive();
    }

    if (!this.driveClient) {
      throw new Error('Google Drive client is not connected.');
    }

    try {
      await this.driveClient.files.delete({ fileId });
      logger.info(`[GOOGLE DRIVE] Deleted file ID: ${fileId}`);
      return true;
    } catch (err: any) {
      logger.error(`[GOOGLE DRIVE] Error deleting file ID ${fileId}: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Helper to check connection status
   */
  public isDriveConnected(): boolean {
    return this.isConnected;
  }
}

export const googleDriveService = new GoogleDriveService();
