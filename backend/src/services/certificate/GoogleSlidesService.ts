import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '../../config/env';
import logger from '../../config/logger';
import fs from 'fs';
import path from 'path';
import { db } from '../../firebase';

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
  courseId?: string;
  forceRegenerate?: boolean;
  requestId?: string;
}

export class GoogleSlidesService {
  private static activeGenerations = new Map<string, Promise<Buffer>>();
  private static quotaExceededUntil = 0;
  private static cachedQrPlacement: {
    qrX: number;
    qrY: number;
    qrW: number;
    qrH: number;
    placeholderElementId: string | null;
    slideId: string;
  } | null = null;

  private isQuotaError(err: any): boolean {
    if (!err) return false;
    const status = err.status || err.code;
    if (status === 429) return true;
    const message = String(err.message || '').toLowerCase();
    return message.includes('quota exceeded') || message.includes('resource_exhausted') || message.includes('429');
  }

  private getAuthClient(): any {
    const clientId = env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = env.GOOGLE_OAUTH_REFRESH_TOKEN || process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      logger.info('[GOOGLE SLIDES SERVICE] AUTH MODE: OAuth2 USER');
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
    const clientEmail = env.GOOGLE_DRIVE_CLIENT_EMAIL || process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    let privateKey = env.GOOGLE_DRIVE_PRIVATE_KEY || process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error('Google credentials not configured.');
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

  private async getQrPlacement(slidesClient: any, requestId: string): Promise<{
    qrX: number;
    qrY: number;
    qrW: number;
    qrH: number;
    placeholderElementId: string | null;
    slideId: string;
  }> {
    if (GoogleSlidesService.cachedQrPlacement) {
      return GoogleSlidesService.cachedQrPlacement;
    }

    const templateId = env.GOOGLE_SLIDES_TEMPLATE_ID;
    if (!templateId) {
      logger.warn('[GOOGLE SLIDES SERVICE] GOOGLE_SLIDES_TEMPLATE_ID not configured.');
      return {
        qrX: 8520735,
        qrY: 2631585,
        qrW: 1082430,
        qrH: 1082430,
        placeholderElementId: null,
        slideId: 'p',
      };
    }

    logger.info(`[CERT] [${requestId}] [TEMPLATE LOOKUP START] Fetching template ${templateId} structure`);
    const startTime = Date.now();
    try {
      const presentation = await slidesClient.presentations.get({
        presentationId: templateId,
      });

      const slideId = presentation.data.slides?.[0]?.objectId;
      if (!slideId) throw new Error('No slide found in template.');

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

        if (!isQrPlaceholder && element.shape && element.shape.text) {
          const textContent = JSON.stringify(element.shape.text).toLowerCase();
          if (textContent.includes('{{qr_code}}') || textContent.includes('qr_code') || textContent.includes('qrcode')) {
            isQrPlaceholder = true;
          }
        }

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

          const baseSize = Math.min(rawW, rawH);
          const margin = baseSize * 0.05;
          qrW = baseSize - 2 * margin;
          qrH = qrW;
          qrX = rawX + margin + (rawW - baseSize) / 2;
          qrY = rawY + margin + (rawH - baseSize) / 2;

          placeholderElementId = element.objectId || null;
          break;
        }
      }

      GoogleSlidesService.cachedQrPlacement = { qrX, qrY, qrW, qrH, placeholderElementId, slideId };
      logger.info(`[CERT] [${requestId}] [TEMPLATE LOOKUP END] Resolved coordinates. Duration: ${Date.now() - startTime}ms`);
      return GoogleSlidesService.cachedQrPlacement;
    } catch (err: any) {
      logger.error(`[CERT] [${requestId}] [TEMPLATE LOOKUP FAILED] Error: ${err?.message || err}. Duration: ${Date.now() - startTime}ms`);
      return {
        qrX: 8520735,
        qrY: 2631585,
        qrW: 1082430,
        qrH: 1082430,
        placeholderElementId: null,
        slideId: 'p',
      };
    }
  }

  public async generateCertificateFromTemplate(data: CertificateData): Promise<Buffer> {
    const requestId = data.requestId || `certificate-request-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const cacheDir = path.resolve(process.cwd(), 'data/certificates');
    const cachePath = path.join(cacheDir, `${data.certificateId}.pdf`);

    // Cache precheck
    if (!data.forceRegenerate && fs.existsSync(cachePath)) {
      logger.info(`[CERT] [${requestId}] Reusing cached PDF.`);
      return fs.readFileSync(cachePath);
    }

    // Concurrency Lock
    let promise = GoogleSlidesService.activeGenerations.get(data.certificateId);
    if (promise) {
      logger.info(`[CERT] [${requestId}] Reusing active promise.`);
      return promise;
    }

    const generationTask = (async () => {
      let attempt = 0;
      const maxRetries = 2;
      while (true) {
        attempt++;
        try {
          const pdfBuffer = await this.generateCertificateFromTemplateInternal(data, requestId);
          try {
            if (!fs.existsSync(cacheDir)) {
              fs.mkdirSync(cacheDir, { recursive: true });
            }
            fs.writeFileSync(cachePath, pdfBuffer);
          } catch (wErr: any) {
            logger.error(`[CERT] [${requestId}] Cache write failed: ${wErr?.message}`);
          }
          return pdfBuffer;
        } catch (err: any) {
          const isQuota = this.isQuotaError(err);
          if (isQuota && attempt <= maxRetries) {
            const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            logger.warn(`[CERT] [${requestId}] Quota limit hit. Retrying attempt ${attempt}/${maxRetries} in ${Math.round(backoffMs)}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }
          throw err;
        }
      }
    })();

    const timeoutPromise = new Promise<Buffer>((_, reject) =>
      setTimeout(() => reject(new Error('Google Slides operation timed out after 25s')), 25000)
    );

    const racingPromise = Promise.race([generationTask, timeoutPromise]);

    GoogleSlidesService.activeGenerations.set(data.certificateId, racingPromise);
    try {
      return await racingPromise;
    } finally {
      GoogleSlidesService.activeGenerations.delete(data.certificateId);
    }
  }

  private async generateCertificateFromTemplateInternal(data: CertificateData, requestId: string): Promise<Buffer> {
    logger.info(`[CERT] [${requestId}] generateCertificateFromTemplateInternal start`);

    // Helper to log individual Google API calls
    const logApiCall = async (methodName: string, callFn: () => Promise<any>): Promise<any> => {
      const startIso = new Date().toISOString();
      const startMs = Date.now();
      logger.info(`[CERT] [${requestId}] API CALL START: ${methodName} at ${startIso}`);
      try {
        const res = await callFn();
        const duration = Date.now() - startMs;
        logger.info(`[CERT] [${requestId}] API CALL END: ${methodName} SUCCESS at ${new Date().toISOString()} (Duration: ${duration}ms, Retry: 0)`);
        return res;
      } catch (err: any) {
        const duration = Date.now() - startMs;
        logger.error(`[CERT] [${requestId}] API CALL END: ${methodName} FAILURE at ${new Date().toISOString()} (Duration: ${duration}ms, Retry: 0, Error: ${err?.message || err})`);
        throw err;
      }
    };

    // 1. AUTH STAGE
    logger.info(`[CERT] [${requestId}] [AUTH START]`);
    const authStart = Date.now();
    const auth = this.getAuthClient();
    if (auth && typeof auth.getAccessToken === 'function') {
      await auth.getAccessToken().catch(() => null);
    } else if (auth && typeof auth.authorize === 'function') {
      await auth.authorize().catch(() => null);
    }
    const authDuration = Date.now() - authStart;
    logger.info(`[CERT] [${requestId}] [AUTH END] Duration: ${authDuration}ms`);

    const driveClient = google.drive({ version: 'v3', auth });
    const slidesClient = google.slides({ version: 'v1', auth });

    let tempQrFileId: string | null = null;
    let copiedFileId: string | null = null;

    try {
      // 2. DRIVE OPERATION STAGE (Upload temp QR code)
      logger.info(`[CERT] [${requestId}] [DRIVE OPERATION START] Uploading QR code and creating permissions`);
      const driveOpStart = Date.now();
      
      const bufferStream = new Readable();
      bufferStream.push(data.qrCodeBuffer);
      bufferStream.push(null);

      const fileRes = await logApiCall('drive.files.create (QR)', () =>
        driveClient.files.create({
          requestBody: { name: `temp_qr_${data.certificateId}.png`, mimeType: 'image/png' },
          media: { mimeType: 'image/png', body: bufferStream },
          fields: 'id',
        })
      );
      tempQrFileId = fileRes.data.id;
      if (!tempQrFileId) throw new Error('No QR File ID returned.');

      await logApiCall('drive.permissions.create (QR)', () =>
        driveClient.permissions.create({
          fileId: tempQrFileId!,
          requestBody: { role: 'reader', type: 'anyone' },
        })
      );
      const qrImageUrl = `https://drive.google.com/uc?id=${tempQrFileId}&export=download`;
      logger.info(`[CERT] [${requestId}] [DRIVE OPERATION END] Duration: ${Date.now() - driveOpStart}ms`);

      // 3. SLIDES COPY STAGE
      logger.info(`[CERT] [${requestId}] [SLIDES COPY START]`);
      const copyStart = Date.now();
      const targetFolder = env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
      const copyResponse = await logApiCall('drive.files.copy (Presentation)', () =>
        driveClient.files.copy({
          fileId: env.GOOGLE_SLIDES_TEMPLATE_ID,
          requestBody: {
            name: `Certificate_${data.certificateId}`,
            parents: targetFolder ? [targetFolder] : [],
          },
        })
      );
      copiedFileId = copyResponse.data.id || null;
      if (!copiedFileId) throw new Error('No copied presentation ID returned.');
      logger.info(`[CERT] [${requestId}] [SLIDES COPY END] Duration: ${Date.now() - copyStart}ms`);

      // 4. TEMPLATE LOOKUP (Resolve placements)
      const placement = await this.getQrPlacement(slidesClient, requestId);
      const qrX = placement.qrX;
      const qrY = placement.qrY;
      const qrW = placement.qrW;
      const qrH = placement.qrH;
      const placeholderElementId = placement.placeholderElementId;
      const slideId = placement.slideId;

      // 5. BATCH UPDATE STAGE
      logger.info(`[CERT] [${requestId}] [BATCH UPDATE START]`);
      const batchStart = Date.now();
      const requests: any[] = [
        {
          updateTextStyle: {
            objectId: 'g3f741f74297_0_385',
            style: { fontSize: { magnitude: 9.5, unit: 'PT' } },
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

      if (placeholderElementId) {
        requests.push({ deleteObject: { objectId: placeholderElementId } });
      }

      requests.push({
        createImage: {
          elementProperties: {
            pageObjectId: slideId,
            size: { width: { magnitude: qrW, unit: 'EMU' }, height: { magnitude: qrH, unit: 'EMU' } },
            transform: { scaleX: 1, scaleY: 1, translateX: qrX, translateY: qrY, unit: 'EMU' },
          },
          url: qrImageUrl,
        },
      });

      await logApiCall('slides.presentations.batchUpdate', () =>
        slidesClient.presentations.batchUpdate({
          presentationId: copiedFileId!,
          requestBody: { requests },
        })
      );
      logger.info(`[CERT] [${requestId}] [BATCH UPDATE END] Duration: ${Date.now() - batchStart}ms`);

      // 6. PDF EXPORT STAGE
      logger.info(`[CERT] [${requestId}] [PDF EXPORT START]`);
      const exportStart = Date.now();
      const exportResponse = await logApiCall('drive.files.export (PDF)', () =>
        driveClient.files.export({
          fileId: copiedFileId!,
          mimeType: 'application/pdf',
        }, { responseType: 'stream' })
      );

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        exportResponse.data.on('data', (chunk: any) => chunks.push(chunk));
        exportResponse.data.on('end', () => resolve(Buffer.concat(chunks)));
        exportResponse.data.on('error', (err: any) => reject(err));
      });
      logger.info(`[CERT] [${requestId}] [PDF EXPORT END] Duration: ${Date.now() - exportStart}ms`);

      const finalBuffer = pdfBuffer as any;
      finalBuffer.authDuration = authDuration;
      finalBuffer.copyDuration = Date.now() - copyStart;
      finalBuffer.batchDuration = Date.now() - batchStart;
      finalBuffer.exportDuration = Date.now() - exportStart;

      return finalBuffer;

    } catch (err: any) {
      logger.error(`[CERT] [${requestId}] [GENERATION ERROR] Failed: ${err?.message || err}`);
      throw err;
    } finally {
      // Background cleanups
      if (copiedFileId) {
        logApiCall('drive.files.delete (Slide Copy)', () =>
          driveClient.files.delete({ fileId: copiedFileId! })
        ).catch(() => null);
      }
      if (tempQrFileId) {
        logApiCall('drive.files.delete (QR Copy)', () =>
          driveClient.files.delete({ fileId: tempQrFileId! })
        ).catch(() => null);
      }
    }
  }
}

export const googleSlidesService = new GoogleSlidesService();
