import { Request, Response } from 'express';
import { certificateDeliveryService } from '../services/certificate/CertificateDeliveryService';
import { pdfCertificateGenerator } from '../services/certificate/PDFCertificateGenerator';
import { qrCodeService } from '../services/certificate/QRCodeService';
import { googleSheetsService } from '../services/certificate/GoogleSheetsService';
import logger from '../config/logger';

export class CertificateController {
  /**
   * POST /api/certificates/complete-and-deliver
   * Triggered when student reaches 100% course completion
   */
  public async handleCompletionAndDeliver(req: Request, res: Response): Promise<Response> {
    try {
      const {
        studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        completionPercentage,
        instructorName,
        courseDuration,
        modulesCount,
      } = req.body;

      if (!studentId || !studentName || !studentEmail || !courseId || !courseTitle) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: studentId, studentName, studentEmail, courseId, courseTitle are mandatory.',
        });
      }

      const payload = {
        studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        completionPercentage: Number(completionPercentage ?? 100),
        instructorName,
        courseDuration,
        modulesCount: Number(modulesCount || 8),
      };

      const result = await certificateDeliveryService.handleCourseCompletionAndDeliver(payload);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(500).json(result);
      }
    } catch (err: any) {
      logger.error(`[CERTIFICATE CONTROLLER] ❌ Exception: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: err?.message || String(err),
      });
    }
  }

  /**
   * GET /api/certificates/test-delivery
   * Instant diagnostic test route to simulate 100% course completion delivery
   */
  public async testDelivery(req: Request, res: Response): Promise<Response> {
    try {
      const targetEmail = (req.query.email as string) || 'shaivikagroups@gmail.com';
      const studentName = (req.query.name as string) || 'Banu Prakash';
      const courseTitle = (req.query.course as string) || 'Mastering Database Management Systems (DBMS) & SQL Architecture';

      const payload = {
        studentId: 'STU-992104',
        studentName,
        studentEmail: targetEmail,
        courseId: 'dbms-101',
        courseTitle,
        completionPercentage: 100,
        instructorName: 'Shaivika Groups Board',
        courseDuration: '24 Hours',
        modulesCount: 8,
      };

      const result = await certificateDeliveryService.handleCourseCompletionAndDeliver(payload);
      return res.status(result.success ? 200 : 500).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || String(err),
      });
    }
  }

  /**
   * GET /api/certificates/download
   * Serves direct download of high-quality certificate PDF without requiring external Google Drive storage
   */
  public async downloadCertificate(req: Request, res: Response): Promise<void> {
    try {
      const {
        certificateId,
        studentId,
        studentName,
        courseTitle,
        completionDate,
        courseDuration,
        modulesCount
      } = req.query;

      if (!certificateId || !studentId || !studentName || !courseTitle) {
        res.status(400).send('Missing required query parameters: certificateId, studentId, studentName, courseTitle.');
        return;
      }

      const qrCodeBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
        String(certificateId),
        String(studentId)
      );

      const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
        certificateId: String(certificateId),
        studentId: String(studentId),
        studentName: String(studentName),
        courseTitle: String(courseTitle),
        instructorName: 'Shaivika Groups Board',
        completionDate: String(completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
        courseDuration: String(courseDuration || '24 Hours'),
        modulesCount: Number(modulesCount || 8),
        qrCodeBuffer,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      logger.error(`[DOWNLOAD CERTIFICATE] ❌ Exception: ${err?.message || err}`);
      res.status(500).send('Failed to generate download certificate.');
    }
  }

  /**
   * GET /api/certificates/verify/:certificateId
   * Searches the Google Sheets Certificate Registry for a matching Certificate ID to verify its authenticity
   */
  public async verifyCertificate(req: Request, res: Response): Promise<Response> {
    try {
      const { certificateId } = req.params;

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          error: 'Missing Certificate ID parameter.',
        });
      }

      logger.info(`[CERTIFICATE VERIFICATION] Searching sheet registry for Certificate ID: ${certificateId}`);
      const certData = await googleSheetsService.getCertificateById(String(certificateId));

      if (!certData) {
        logger.warn(`[CERTIFICATE VERIFICATION] ⚠️ Certificate ID ${certificateId} not found in Registry.`);
        return res.status(404).json({
          success: false,
          error: `Certificate ID "${certificateId}" could not be verified. It does not exist in the registry.`,
        });
      }

      logger.info(`[CERTIFICATE VERIFICATION] ✅ Certificate ID ${certificateId} verified successfully.`);
      return res.status(200).json({
        success: true,
        data: certData,
      });
    } catch (err: any) {
      logger.error(`[CERTIFICATE VERIFICATION] ❌ Exception: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: err?.message || String(err),
      });
    }
  }
}

export const certificateController = new CertificateController();
