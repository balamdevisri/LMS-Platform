import logger from '../../config/logger';
import { emailService } from '../email/EmailService';
import { googleDriveService, DriveUploadResult } from './GoogleDriveService';
import { pdfCertificateGenerator } from './PDFCertificateGenerator';
import { qrCodeService } from './QRCodeService';

export interface CompletionTriggerPayload {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  completionPercentage: number;
  instructorName?: string;
  courseDuration?: string;
  modulesCount?: number;
}

export interface AutomatedDeliveryResult {
  success: boolean;
  certificateId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  completionDate: string;
  googleDriveLink?: string;
  googleDriveFileId?: string;
  emailMessageId?: string;
  error?: string;
  timeline: Array<{ step: string; status: 'SUCCESS' | 'FAILED'; timestamp: string; details?: string }>;
}

export class CertificateDeliveryService {
  /**
   * Generates unique Certificate ID in KQ-CERT-XXXX-YYYY format
   */
  private generateUniqueCertificateId(courseId: string, studentId: string): string {
    const timePart = Date.now().toString(36).toUpperCase();
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `KQ-CERT-${timePart}-${randPart}`;
  }

  /**
   * Fully Automated Certificate Delivery Pipeline
   * Triggered automatically when student reaches 100% completion
   */
  public async handleCourseCompletionAndDeliver(
    payload: CompletionTriggerPayload
  ): Promise<AutomatedDeliveryResult> {
    const timeline: Array<{ step: string; status: 'SUCCESS' | 'FAILED'; timestamp: string; details?: string }> = [];
    const nowIso = new Date().toISOString();

    logger.info(`================================================================`);
    logger.info(`[AUTOMATED CERTIFICATE SYSTEM] 🎓 Triggered for Student: ${payload.studentName} (${payload.studentEmail})`);
    logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Course: "${payload.courseTitle}" | Progress: ${payload.completionPercentage}%`);
    logger.info(`================================================================`);

    // Verify 100% completion
    if (payload.completionPercentage < 100) {
      const err = `Course completion is ${payload.completionPercentage}%. Automated certificate delivery triggers ONLY at 100%.`;
      logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ ${err}`);
      return {
        success: false,
        certificateId: '',
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        error: err,
        timeline,
      };
    }

    // Step 1: Generate Unique Certificate ID
    const certificateId = this.generateUniqueCertificateId(payload.courseId, payload.studentId);
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    timeline.push({
      step: '1. GENERATE_CERTIFICATE_ID',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      details: `Generated ID: ${certificateId}`,
    });
    logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 1: Generated Unique Certificate ID -> ${certificateId}`);

    let qrCodeBuffer: Buffer;
    let pdfBuffer: Buffer;
    let driveResult: DriveUploadResult;

    // Step 2: Generate Dynamic QR Code Buffer
    try {
      qrCodeBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
        certificateId,
        payload.studentId
      );
      timeline.push({
        step: '2. GENERATE_QR_CODE',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Generated QR Buffer (${qrCodeBuffer.length} bytes)`,
      });
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 2: Dynamic QR Code Generated Successfully.`);
    } catch (err: any) {
      const msg = `Failed to generate QR code: ${err?.message || err}`;
      timeline.push({ step: '2. GENERATE_QR_CODE', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);
      return {
        success: false,
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate,
        error: msg,
        timeline,
      };
    }

    // Step 3: Generate High-Res Vector PDF Certificate
    try {
      pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        courseTitle: payload.courseTitle,
        instructorName: payload.instructorName || 'Shaivika Groups Board',
        completionDate,
        courseDuration: payload.courseDuration || '24 Hours',
        modulesCount: payload.modulesCount || 8,
        qrCodeBuffer,
      });

      timeline.push({
        step: '3. GENERATE_PDF_CERTIFICATE',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Generated PDF Buffer (${pdfBuffer.length} bytes)`,
      });
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 3: High-Res PDF Certificate Buffer Generated Successfully.`);
    } catch (err: any) {
      const msg = `Failed to generate PDF Certificate: ${err?.message || err}`;
      timeline.push({ step: '3. GENERATE_PDF_CERTIFICATE', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);
      return {
        success: false,
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate,
        error: msg,
        timeline,
      };
    }

    // Step 4: Upload PDF Directly to Google Drive (Exclusive Storage Location)
    const pdfFileName = `Certificate-${payload.studentName.replace(/\s+/g, '_')}-${certificateId}.pdf`;
    try {
      driveResult = await googleDriveService.uploadCertificatePDF(pdfBuffer, pdfFileName);
      timeline.push({
        step: '4. UPLOAD_TO_GOOGLE_DRIVE',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Uploaded to Google Drive. FileID: ${driveResult.fileId} | Link: ${driveResult.webViewLink}`,
      });
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 4: PDF uploaded directly to Google Drive -> ${driveResult.webViewLink}`);
    } catch (err: any) {
      const msg = `Google Drive upload failed after retries: ${err?.message || err}`;
      timeline.push({ step: '4. UPLOAD_TO_GOOGLE_DRIVE', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);
      return {
        success: false,
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate,
        error: msg,
        timeline,
      };
    }

    // Step 5: Send Professional Email via Nodemailer SMTP with PDF Attachment & Google Drive Link
    const verifyUrl = `https://verify.kaizenq.edu/credentials/${certificateId}?studentId=${payload.studentId}`;
    const emailSubject = `🎓 Congratulations ${payload.studentName}! Your Official Certificate for "${payload.courseTitle}" is Ready`;

    const htmlEmailContent = this.buildCertificateEmailHtml({
      studentName: payload.studentName,
      courseTitle: payload.courseTitle,
      certificateId,
      completionDate,
      googleDriveLink: driveResult.webViewLink,
      verifyUrl,
    });

    try {
      const mailResult = await emailService.sendEmailWithAttachments(
        payload.studentEmail,
        emailSubject,
        htmlEmailContent,
        [
          {
            filename: pdfFileName,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ]
      );

      if (mailResult.success) {
        timeline.push({
          step: '5. SEND_EMAIL_SMTP',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          details: `Delivered via SMTP to ${payload.studentEmail} (MsgId: ${mailResult.messageId})`,
        });
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 5: Nodemailer SMTP email delivered successfully to ${payload.studentEmail}`);

        logger.info(`================================================================`);
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] 🎉 AUTOMATED DELIVERY COMPLETE!`);
        logger.info(`================================================================`);

        return {
          success: true,
          certificateId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseTitle: payload.courseTitle,
          completionDate,
          googleDriveLink: driveResult.webViewLink,
          googleDriveFileId: driveResult.fileId,
          emailMessageId: mailResult.messageId,
          timeline,
        };
      } else {
        const msg = `SMTP Email dispatch failed after retries: ${mailResult.error}`;
        timeline.push({ step: '5. SEND_EMAIL_SMTP', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
        logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);

        return {
          success: false,
          certificateId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseTitle: payload.courseTitle,
          completionDate,
          googleDriveLink: driveResult.webViewLink,
          googleDriveFileId: driveResult.fileId,
          error: msg,
          timeline,
        };
      }
    } catch (emailErr: any) {
      const msg = `SMTP Email error: ${emailErr?.message || emailErr}`;
      timeline.push({ step: '5. SEND_EMAIL_SMTP', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);

      return {
        success: false,
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate,
        googleDriveLink: driveResult.webViewLink,
        googleDriveFileId: driveResult.fileId,
        error: msg,
        timeline,
      };
    }
  }

  /**
   * Professional HTML Email Template for Certificate Delivery
   */
  private buildCertificateEmailHtml(data: {
    studentName: string;
    courseTitle: string;
    certificateId: string;
    completionDate: string;
    googleDriveLink: string;
    verifyUrl: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - KaizenQ AI LMS</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 24px; border: 1px solid #cbd5e1; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1); overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #002277 0%, #0044cc 60%, #0b55ed 100%); padding: 36px 40px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; background: rgba(255,255,255,0.15); border: 2px solid #d4af37; border-radius: 16px; font-size: 24px; font-weight: 900; color: #ffffff; line-height: 48px; text-align: center; margin-bottom: 12px;">
                Q
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase;">
                Kaizen Q
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: 800; color: #f9e076; letter-spacing: 0.25em; text-transform: uppercase;">
                AI-POWERED LMS  •  SHAIVIKA GROUPS
              </p>
            </td>
          </tr>

          <!-- Congratulatory Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 999px; padding: 6px 18px; margin-bottom: 16px;">
                <span style="font-size: 12px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.1em;">
                  🎓 100% Course Completion Verified
                </span>
              </div>

              <h2 style="margin: 0; font-size: 28px; font-weight: 900; color: #0b1a30; line-height: 1.2;">
                Congratulations, ${data.studentName}!
              </h2>
              <p style="margin: 12px 0 0 0; font-size: 15px; color: #475569; line-height: 1.6;">
                You have successfully mastered all modules, assessments, and practical requirements for the professional track:
              </p>
              
              <!-- Course Title Highlight -->
              <div style="background-color: #f8fafc; border-left: 4px solid #0044cc; border-radius: 12px; padding: 18px 24px; margin: 20px 0; text-align: left;">
                <span style="font-size: 11px; font-weight: 800; color: #0044cc; text-transform: uppercase; letter-spacing: 0.1em; block;">COURSE NAME</span>
                <div style="font-size: 18px; font-weight: 900; color: #0b1a30; margin-top: 4px;">
                  ${data.courseTitle}
                </div>
              </div>
            </td>
          </tr>

          <!-- Metadata Summary Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b1a30; border-radius: 16px; padding: 20px; color: #ffffff;">
                <tr>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block;">STUDENT NAME</span>
                    <span style="font-size: 14px; font-weight: 800; color: #ffffff;">${data.studentName}</span>
                  </td>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block;">COMPLETED ON</span>
                    <span style="font-size: 14px; font-weight: 800; color: #ffffff;">${data.completionDate}</span>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block;">CERTIFICATE ID</span>
                    <span style="font-size: 13px; font-weight: 800; color: #f9e076; font-family: monospace;">${data.certificateId}</span>
                  </td>
                  <td width="50%" style="padding: 8px 12px; vertical-align: top;">
                    <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block;">STORAGE LOCATION</span>
                    <span style="font-size: 13px; font-weight: 800; color: #38bdf8;">Google Drive</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 40px 36px 40px; text-align: center;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                Your official PDF certificate is attached directly to this email and archived permanently in Google Drive:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <!-- Download Button (Google Drive Link) -->
                    <a href="${data.googleDriveLink}" target="_blank" style="display: block; width: 85%; background: linear-gradient(135deg, #0044cc 0%, #0b55ed 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 14px; box-shadow: 0 10px 20px rgba(0, 68, 204, 0.25); text-align: center;">
                      📥 Download Certificate (Google Drive)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Verify Button -->
                    <a href="${data.verifyUrl}" target="_blank" style="display: block; width: 85%; background: #ffffff; color: #0b1a30; border: 2px solid #0b1a30; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 28px; border-radius: 14px; text-align: center;">
                      🛡️ Verify Certificate Credentials
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Info -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0; font-weight: 800; color: #0b1a30;">
                KaizenQ AI LMS  •  Shaivika Groups
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Learn  •  Grow  •  Succeed  |  Automated Certificate Delivery Engine
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}

export const certificateDeliveryService = new CertificateDeliveryService();
