import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '../../config/env';
import logger from '../../config/logger';

export interface CertificateData {
  certificateId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  instructorName?: string;
  completionDate: string;
  courseDuration?: string;
  modulesCount?: number;
  qrCodeBuffer: Buffer;
  achievement?: string;
}

export class GoogleSlidesService {
  /**
   * Resolves an OAuth2 or JWT authentication client for Google APIs
   */
  private getAuthClient(): any {
    const clientId = env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      logger.info('[GOOGLE SLIDES SERVICE] AUTH MODE: OAuth2 USER');
      logger.info('[GOOGLE SLIDES SERVICE] OAuth client ID: configured');
      logger.info('[GOOGLE SLIDES SERVICE] OAuth refresh token: configured');
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret
      );
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
      return oauth2Client;
    }

    logger.info('[GOOGLE SLIDES SERVICE] AUTH MODE: Service Account JWT');
    logger.info('[GOOGLE SLIDES SERVICE] Falling back to Service Account JWT authentication.');
    const clientEmail = env.GOOGLE_DRIVE_CLIENT_EMAIL || process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY || process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error('Google Slides credentials are not configured in environment variables. Please configure either Google OAuth credentials (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN) or Service Account credentials (GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY).');
    }

    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    return new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/presentations',
      ],
    });
  }

  /**
   * Uploads the QR Code PNG Buffer to Google Drive temporarily and sets public permissions
   */
  private async uploadTempQRCode(
    driveClient: any,
    qrCodeBuffer: Buffer,
    certId: string
  ): Promise<{ fileId: string; url: string }> {
    const bufferStream = new Readable();
    bufferStream.push(qrCodeBuffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: `temp_qr_${certId}.png`,
      mimeType: 'image/png',
    };

    const media = {
      mimeType: 'image/png',
      body: bufferStream,
    };

    const fileRes = await driveClient.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = fileRes.data.id;
    if (!fileId) throw new Error('Failed to create temporary QR code file on Google Drive.');

    // Make the file publicly readable so Google Slides can access/embed it
    await driveClient.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
    return { fileId, url };
  }

  /**
   * Generates a high-quality PDF Certificate by copying the Slides template,
   * replacing placeholders, embedding the dynamic QR code, and exporting to PDF.
   */
  public async generateCertificateFromTemplate(data: CertificateData): Promise<Buffer> {
    logger.info(`[GOOGLE SLIDES SERVICE] Starting slide-based certificate generation for: ${data.studentName} (${data.certificateId})...`);
    
    const auth = this.getAuthClient();
    const driveClient = google.drive({ version: 'v3', auth });
    const slidesClient = google.slides({ version: 'v1', auth });

    let tempQrFileId: string | null = null;
    let copiedFileId: string | null = null;

    try {
      // 1. Upload QR Code image temporarily to Google Drive to obtain a public URL
      const qrRes = await this.uploadTempQRCode(driveClient, data.qrCodeBuffer, data.certificateId);
      tempQrFileId = qrRes.fileId;
      const qrImageUrl = qrRes.url;
      logger.info(`[GOOGLE SLIDES SERVICE] Uploaded temporary QR Code. FileId: ${tempQrFileId} | URL: ${qrImageUrl}`);

      // 2. Copy Google Slides template to the designated course folder or root folder
      const targetFolder = env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
      const copyResponse = await driveClient.files.copy({
        fileId: env.GOOGLE_SLIDES_TEMPLATE_ID,
        requestBody: {
          name: `Certificate_${data.certificateId}`,
          parents: targetFolder ? [targetFolder] : [],
        },
      });

      copiedFileId = copyResponse.data.id || null;
      if (!copiedFileId) throw new Error('Failed to copy the Google Slides template.');
      logger.info(`[GOOGLE SLIDES SERVICE] Copied Slides Template to new presentation. FileId: ${copiedFileId}`);

      // 3. Retrieve presentation structure to find the object IDs and coordinates
      const presentation = await slidesClient.presentations.get({
        presentationId: copiedFileId,
      });

      const slideId = presentation.data.slides?.[0]?.objectId;
      if (!slideId) throw new Error('Could not find slide page in the presentation template.');

      // 4. Scan page elements to find a matching placeholder or layout box for the QR code
      // Fallback coordinates corresponding to the SCAN TO VERIFY box on the right side
      let qrX = 8520735;
      let qrY = 2631585;
      let qrW = 1082430;
      let qrH = 1082430;
      let placeholderElementId: string | null = null;

      const pageElements = presentation.data.slides?.[0]?.pageElements || [];
      for (const element of pageElements) {
        const title = (element.title || '').toLowerCase();
        const description = (element.description || '').toLowerCase();
        let isQrPlaceholder = title.includes('qr') || description.includes('qr');

        // Inspect text contents for "{{QR_CODE}}"
        if (!isQrPlaceholder && element.shape && element.shape.text) {
          const textContent = JSON.stringify(element.shape.text).toLowerCase();
          if (textContent.includes('{{qr_code}}') || textContent.includes('qr_code') || textContent.includes('qrcode')) {
            isQrPlaceholder = true;
          }
        }

        // Match specific slide element IDs corresponding to the right-side box
        if (element.objectId === 'g3f741f74297_0_398' || element.objectId === 'g3f741f74297_0_399') {
          isQrPlaceholder = true;
        }

        if (isQrPlaceholder && element.transform && element.size) {
          const scaleX = element.transform.scaleX || 1;
          const scaleY = element.transform.scaleY || 1;
          const rawX = element.transform.translateX || 8460600;
          const rawY = element.transform.translateY || 2564400;
          const rawW = (element.size.width?.magnitude || 3000000) * scaleX;
          const rawH = (element.size.height?.magnitude || 3000000) * scaleY;

          // Apply 5% margin to fit inside and preserve a 1:1 square ratio
          const baseSize = Math.min(rawW, rawH);
          const margin = baseSize * 0.05;
          qrW = baseSize - 2 * margin;
          qrH = qrW;
          qrX = rawX + margin + (rawW - baseSize) / 2;
          qrY = rawY + margin + (rawH - baseSize) / 2;

          placeholderElementId = element.objectId || null;
          logger.info(`[GOOGLE SLIDES SERVICE] Found QR placeholder shape in layout. ElementId: ${placeholderElementId} at [${qrX}, ${qrY}] size [${qrW}x${qrH}]`);
          break;
        }
      }

      // 5. Construct batch update requests for text replacements and QR image creation
      const requests: any[] = [
        {
          updateTextStyle: {
            objectId: 'g3f741f74297_0_385',
            style: {
              fontSize: {
                magnitude: 9.5,
                unit: 'PT',
              },
            },
            fields: 'fontSize',
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{CERTIFICATE_ID}}', matchCase: true },
            replaceText: data.certificateId,
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{STUDENT_NAME}}', matchCase: true },
            replaceText: data.studentName,
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{COURSE_NAME}}', matchCase: true },
            replaceText: data.courseTitle,
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{DURATION}}', matchCase: true },
            replaceText: data.courseDuration || '24 Hours',
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{MODULES_COMPLETED}}', matchCase: true },
            replaceText: data.modulesCount ? `${data.modulesCount} Modules` : '8 Modules',
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{ACHIEVEMENT}}', matchCase: true },
            replaceText: data.achievement || 'Outstanding Achievement',
          },
        },
        {
          replaceAllText: {
            containsText: { text: '{{COMPLETION_DATE}}', matchCase: true },
            replaceText: data.completionDate,
          },
        },
      ];

      // Delete the placeholder shape if found so it doesn't overlap the QR code image
      if (placeholderElementId) {
        requests.push({
          deleteObject: {
            objectId: placeholderElementId,
          },
        });
      }

      // Create/Insert the QR code image at the correct coordinates
      requests.push({
        createImage: {
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: qrW, unit: 'EMU' },
              height: { magnitude: qrH, unit: 'EMU' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: qrX,
              translateY: qrY,
              unit: 'EMU',
            },
          },
          url: qrImageUrl,
        },
      });

      logger.info('[GOOGLE SLIDES SERVICE] Executing batchUpdate placeholder replacement...');
      await slidesClient.presentations.batchUpdate({
        presentationId: copiedFileId,
        requestBody: {
          requests,
        },
      });
      logger.info('[GOOGLE SLIDES SERVICE] batchUpdate replacement completed successfully.');

      // 6. Export presentation as PDF via Google Drive file export API
      logger.info('[GOOGLE SLIDES SERVICE] Triggering export to PDF...');
      const exportResponse = await driveClient.files.export({
        fileId: copiedFileId,
        mimeType: 'application/pdf',
      }, { responseType: 'stream' });

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        exportResponse.data.on('data', (chunk: any) => chunks.push(chunk));
        exportResponse.data.on('end', () => resolve(Buffer.concat(chunks)));
        exportResponse.data.on('error', (err: any) => reject(err));
      });

      logger.info(`[GOOGLE SLIDES SERVICE] ✅ Certificate PDF exported successfully (${pdfBuffer.length} bytes).`);
      return pdfBuffer;

    } catch (err: any) {
      logger.error(`[GOOGLE SLIDES SERVICE] ❌ Failed to generate certificate: ${err?.message || err}`);
      throw new Error(`Google Slides Generation Failed: ${err?.message || err}`);
    } finally {
      // 7. Cleanup: Delete temporary files from Google Drive
      if (copiedFileId) {
        try {
          await driveClient.files.delete({ fileId: copiedFileId });
          logger.info(`[GOOGLE SLIDES SERVICE] Cleaned up copy: ${copiedFileId}`);
        } catch (cleanupErr: any) {
          logger.warn(`[GOOGLE SLIDES SERVICE] Failed to delete slide copy ${copiedFileId}: ${cleanupErr?.message}`);
        }
      }

      if (tempQrFileId) {
        try {
          await driveClient.files.delete({ fileId: tempQrFileId });
          logger.info(`[GOOGLE SLIDES SERVICE] Cleaned up temp QR image: ${tempQrFileId}`);
        } catch (cleanupErr: any) {
          logger.warn(`[GOOGLE SLIDES SERVICE] Failed to delete temp QR image ${tempQrFileId}: ${cleanupErr?.message}`);
        }
      }
    }
  }
}

export const googleSlidesService = new GoogleSlidesService();
