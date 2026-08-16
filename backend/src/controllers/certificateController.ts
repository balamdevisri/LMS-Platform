import { Request, Response } from 'express';
import { db, adminAuth } from '../firebase';
import { certificateDeliveryService } from '../services/certificate/CertificateDeliveryService';
import { pdfCertificateGenerator } from '../services/certificate/PDFCertificateGenerator';
import { qrCodeService } from '../services/certificate/QRCodeService';
import { googleSheetsService } from '../services/certificate/GoogleSheetsService';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  studentProgressCollection,
  quizAttemptsCollection,
  assignmentSubmissionsCollection,
} from '../firebase/collections';

export class CertificateController {
  /**
   * POST /api/certificates/complete-and-deliver
   * Triggered when student reaches 100% course completion
   */
  public async handleCompletionAndDeliver(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const studentId = req.user?.uid;
      const {
        courseId,
        courseTitle,
        completionPercentage,
        instructorName,
        courseDuration,
        modulesCount,
      } = req.body;

      if (!studentId || !courseId || !courseTitle) {
        return res.status(400).json({
          success: false,
          error: 'Missing authenticated profile UID or required courseId / courseTitle.',
        });
      }

      // Resolve student profile from Firestore users collection
      let studentName = '';
      let studentEmail = '';
      let resolvedStudentId = studentId;

      if (db) {
        try {
          // 1. Direct document ID lookup
          let userDoc = await db.collection('users').doc(studentId).get();
          let userData = userDoc.exists ? userDoc.data() : null;

          // 2. Query fallback lookup by uid field
          if (!userData) {
            const querySnap = await db.collection('users').where('uid', '==', studentId).get();
            if (!querySnap.empty) {
              userDoc = querySnap.docs[0];
              userData = userDoc.data();
              resolvedStudentId = userDoc.id;
            }
          }

          // 3. Auto-sync/create profile from verified token details
          if (!userData && req.user?.email) {
            const email = req.user.email;
            const displayName = req.user.name;
            
            if (!displayName) {
              logger.error(`[CERTIFICATE CONTROLLER] ❌ Cannot auto-create profile: name claim is missing for UID ${studentId}.`);
            } else {
              const newProfile = {
                uid: studentId,
                fullName: displayName,
                name: displayName,
                email: email,
                role: 'student',
                status: 'Active',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await db.collection('users').doc(studentId).set(newProfile);
              logger.info(`[CERTIFICATE CONTROLLER] Automatically created student profile in database for ${studentId} (${email}) using verified token claims.`);
              
              userDoc = await db.collection('users').doc(studentId).get();
              userData = userDoc.exists ? userDoc.data() : null;
            }
          }

          if (userData) {
            studentName = userData.fullName || userData.name || '';
            studentEmail = userData.email || '';
          }
        } catch (dbErr: any) {
          logger.error(`[CERTIFICATE CONTROLLER] Error resolving profile: ${dbErr?.message}`);
        }
      }

      // If no valid student profile is resolved, STOP issuance and return "Student profile not found."
      if (!studentName || !studentEmail) {
        return res.status(404).json({
          success: false,
          error: 'Student profile not found.',
        });
      }

      const payload = {
        studentId: resolvedStudentId,
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

      logger.info(`[CERTIFICATE VERIFICATION] Searching certificates collection & registry for ID: ${certificateId}`);

      // 1. Check Firestore certificates collection
      let certData: any = null;
      if (db) {
        try {
          const docSnap = await db.collection('certificates').doc(String(certificateId)).get();
          if (docSnap.exists) {
            certData = docSnap.data();
          } else {
            const querySnap = await db.collection('certificates').where('verificationId', '==', String(certificateId)).get();
            if (!querySnap.empty) {
              certData = querySnap.docs[0].data();
            }
          }
        } catch (fErr: any) {
          logger.warn(`[CERTIFICATE VERIFICATION] Firestore lookup notice: ${fErr?.message || fErr}`);
        }
      }

      // 2. Fallback to Google Sheets registry
      if (!certData) {
        certData = await googleSheetsService.getCertificateById(String(certificateId));
      }

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

  /**
   * GET /api/certificates/student/:studentEmail
   * Fetches all registered certificates for a student email
   */
  public async getCertificatesByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { studentEmail } = req.params;

      if (!studentEmail) {
        return res.status(400).json({
          success: false,
          error: 'Missing studentEmail parameter.',
        });
      }

      logger.info(`[CERTIFICATE LIST] Fetching certificates for email: ${studentEmail}`);
      const certs = await googleSheetsService.getCertificatesByEmail(String(studentEmail));

      return res.status(200).json({
        success: true,
        data: certs,
      });
    } catch (err: any) {
      logger.error(`[CERTIFICATE LIST] ❌ Exception: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: err?.message || String(err),
      });
    }
  }

  /**
   * POST /api/certificates/sync-state
   * Syncs student's current learning progress, quiz scores, and assignment status to Firestore
   */
  public async syncState(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const studentId = req.user?.uid;
      const { courseId, completedLessons, completedModules, quizScores, assignmentSubmissions } = req.body;

      if (!studentId || !courseId) {
        return res.status(400).json({
          success: false,
          error: 'Missing authenticated profile UID or courseId.',
        });
      }

      logger.info(`[CERTIFICATE SYNC] Syncing state for student: ${studentId} in course: ${courseId}`);

      // 1. Sync student_progress
      await studentProgressCollection().doc(`${studentId}_${courseId}`).set({
        studentId,
        courseId,
        completedLessons: completedLessons || [],
        completedModules: completedModules || [],
        completionPercentage: 100,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Sync quiz attempts (passing quizzes)
      if (Array.isArray(quizScores)) {
        for (const quiz of quizScores) {
          const attemptId = `${studentId}_${quiz.quizId}`;
          await quizAttemptsCollection().doc(attemptId).set({
            studentId,
            courseId,
            quizId: quiz.quizId,
            percentage: Number(quiz.percentage || 0),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      // 3. Sync assignment submissions
      if (Array.isArray(assignmentSubmissions)) {
        for (const assign of assignmentSubmissions) {
          await assignmentSubmissionsCollection().doc(`${studentId}_${assign.assignmentId}`).set({
            studentId,
            courseId,
            assignmentId: assign.assignmentId,
            status: assign.status,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }

      logger.info(`[CERTIFICATE SYNC] Sync completed successfully for ${studentId}.`);
      return res.status(200).json({
        success: true,
        message: 'Student progress and submissions synced successfully to Firestore.',
      });
    } catch (err: any) {
      logger.error(`[CERTIFICATE SYNC] ❌ Exception: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: err?.message || String(err),
      });
    }
  }
}

export const certificateController = new CertificateController();
