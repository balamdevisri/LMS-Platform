import { Request, Response } from 'express';
import { db } from '../firebase';
import { certificateDeliveryService, cleanCourseTitleForCertificate } from '../services/certificate/CertificateDeliveryService';
import { certificateQueueService } from '../services/certificate/CertificateQueueService';
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
  private async resolveCourseDoc(courseId: string): Promise<any> {
    if (!courseId || !db) return null;
    let courseDoc = await db.collection('courses').doc(courseId).get();
    if (courseDoc.exists) return courseDoc;

    let querySnap = await db.collection('courses').where('slug', '==', courseId).get();
    if (!querySnap.empty) return querySnap.docs[0];

    querySnap = await db.collection('courses').where('id', '==', courseId).get();
    if (!querySnap.empty) return querySnap.docs[0];

    const fallbackDocId = `${courseId}-course-id`;
    courseDoc = await db.collection('courses').doc(fallbackDocId).get();
    if (courseDoc.exists) return courseDoc;

    // Special fallback for Linux Systems & Administration Mastery
    if (courseId.toLowerCase().includes('linux')) {
      const allCourses = await db.collection('courses').get();
      for (const doc of allCourses.docs) {
        const data = doc.data();
        const slug = String(data.slug || '').toLowerCase();
        const title = String(data.title || '').toLowerCase();
        if (slug.includes('linux') || title.includes('linux')) {
          return doc;
        }
      }
    }
    return null;
  }

  /**
   * Helper to resolve student profile from database
   */
  private async resolveStudentData(studentId: string, fallbackEmail?: string): Promise<any> {
    if (!db) return null;

    // 1. Direct doc lookup in 'users' collection
    let userDoc = await db.collection('users').doc(studentId).get();
    if (userDoc.exists) {
      return userDoc.data();
    }

    // 2. Query 'users' collection by 'uid'
    let querySnap = await db.collection('users').where('uid', '==', studentId).get();
    if (!querySnap.empty) {
      return querySnap.docs[0].data();
    }

    // 3. Direct doc lookup in 'students' collection
    userDoc = await db.collection('students').doc(studentId).get();
    if (userDoc.exists) {
      return userDoc.data();
    }

    // 4. Query 'students' collection by 'uid'
    querySnap = await db.collection('students').where('uid', '==', studentId).get();
    if (!querySnap.empty) {
      return querySnap.docs[0].data();
    }

    // 5. Query 'users' collection by 'email'
    if (fallbackEmail) {
      querySnap = await db.collection('users').where('email', '==', fallbackEmail).get();
      if (!querySnap.empty) {
        return querySnap.docs[0].data();
      }

      // 6. Query 'students' collection by 'email'
      querySnap = await db.collection('students').where('email', '==', fallbackEmail).get();
      if (!querySnap.empty) {
        return querySnap.docs[0].data();
      }
    }

    return null;
  }

  /**
   * POST /api/certificates/generate & POST /api/certificates/complete-and-deliver
   * Enqueues or returns existing certificate/job safely & idempotently (Protected)
   */
  public async handleCompletionAndDeliver(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';
      let studentId = authUid;
      if (isAdmin && req.body.studentId) {
        studentId = req.body.studentId;
      }

      const {
        courseId,
        courseTitle,
        completionPercentage,
        instructorName,
        courseDuration,
        modulesCount,
        achievement,
        forceRegenerate,
        studentName: bodyStudentName,
        studentEmail: bodyStudentEmail,
      } = req.body;

      if (!studentId || !courseId || !courseTitle) {
        return res.status(400).json({
          success: false,
          error: 'Missing authenticated profile UID or required courseId / courseTitle.',
        });
      }

      const fallbackEmail = req.user?.email || bodyStudentEmail;
      let studentName = bodyStudentName || '';
      let studentEmail = bodyStudentEmail || '';
      let resolvedStudentId = studentId;

      if (db) {
        try {
          const userData = await this.resolveStudentData(studentId, fallbackEmail);
          if (userData) {
            studentName = userData.fullName || userData.name || studentName || '';
            studentEmail = userData.email || studentEmail || '';
            resolvedStudentId = userData.uid || userData.id || studentId;
          }
        } catch (dbErr: any) {
          logger.error(`[CERTIFICATE CONTROLLER] Error resolving profile: ${dbErr?.message}`);
        }
      }

      if (!studentName && bodyStudentName) {
        studentName = bodyStudentName;
      }
      if (!studentEmail && bodyStudentEmail) {
        studentEmail = bodyStudentEmail;
      }
      if (!studentEmail && req.user?.email) {
        studentEmail = req.user.email;
      }

      if (!studentName) {
        studentName = req.user?.name || req.user?.email?.split('@')[0] || 'Student';
      }
      if (!studentEmail) {
        studentEmail = req.user?.email || 'student@shaivika.com';
      }

      const queueResult = await certificateQueueService.enqueueCertificateJob({
        studentId: resolvedStudentId,
        studentUid: studentId,
        studentName,
        studentEmail,
        courseId,
        courseTitle,
        courseDuration: courseDuration || '25 Hours',
        modulesCount: modulesCount || 'All Modules',
        achievement: achievement || '100% Completed',
        instructorName: instructorName || 'Kaizen Q Team',
        force: forceRegenerate === true || forceRegenerate === 'true',
      });

      return res.status(200).json(queueResult);
    } catch (err: any) {
      logger.error(`[CERTIFICATE CONTROLLER] ❌ Exception in certificate request: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to process certificate request',
      });
    }
  }

  /**
   * GET /api/certificates/jobs/:jobId
   * Retrieves real-time queue position, estimated wait, and status for a specific job (Ownership Protected)
   */
  public async getJobStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const jobId = String(req.params.jobId || '');
      if (!jobId) {
        return res.status(400).json({ success: false, error: 'jobId parameter is required' });
      }

      const job = await certificateQueueService.getJobStatus(jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: 'Certificate job not found' });
      }

      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';

      // Strictly protect against cross-student IDOR
      if (job.studentUid !== authUid && job.studentId !== authUid && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You cannot access another student\'s queue job.',
        });
      }

      return res.status(200).json({ success: true, job });
    } catch (err: any) {
      logger.error(`[CERTIFICATE CONTROLLER] ❌ Error fetching job status: ${err?.message || err}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch job status' });
    }
  }

  /**
   * GET /api/certificates/job/status
   * Helper to query job status by studentId and courseId (Ownership Protected)
   */
  public async getJobByParams(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';
      const studentId = isAdmin && req.query.studentId ? String(req.query.studentId) : String(authUid || '');
      const courseId = String(req.query.courseId || '');

      if (!studentId || !courseId) {
        return res.status(400).json({ success: false, error: 'courseId is required' });
      }

      const jobId = certificateQueueService.buildJobId(studentId, courseId);
      const job = await certificateQueueService.getJobStatus(jobId);

      if (!job) {
        return res.status(404).json({ success: false, error: 'No active job found for this course' });
      }

      if (job.studentUid !== authUid && job.studentId !== authUid && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You cannot access another student\'s queue job.',
        });
      }

      return res.status(200).json({ success: true, job });
    } catch (err: any) {
      logger.error(`[CERTIFICATE CONTROLLER] ❌ Error fetching job by params: ${err?.message || err}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch job status' });
    }
  }

  /**
   * GET /api/certificates/download
   * Authenticated, authoritative certificate download
   */
  public async downloadCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const certificateId = String(req.query.certificateId || req.params.certificateId || '').trim();
      if (!certificateId) {
        res.status(400).json({ success: false, error: 'certificateId parameter is required' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database uninitialized' });
        return;
      }

      // Authoritative lookup from Firestore
      let certDoc = await db.collection('certificates').doc(certificateId).get();
      if (!certDoc.exists) {
        const querySnap = await db.collection('certificates').where('verificationId', '==', certificateId).get();
        if (!querySnap.empty) {
          certDoc = querySnap.docs[0];
        }
      }

      if (!certDoc.exists) {
        res.status(404).json({ success: false, error: 'Certificate not found' });
        return;
      }

      const cert = certDoc.data();
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';

      // Authorization Check
      if (cert?.studentUid !== authUid && cert?.studentId !== authUid && !isAdmin) {
        res.status(403).json({ success: false, error: 'Forbidden: You cannot download another student\'s certificate' });
        return;
      }

      // Generate in-memory PDF Buffer from authoritative metadata
      const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
        certificateId: cert?.certificateId || certificateId,
        studentId: cert?.studentId || authUid || 'STUDENT',
        studentName: cert?.studentName,
        courseTitle: cert?.courseName || cert?.courseTitle,
        completionDate: cert?.completionDate || cert?.issueDate,
        courseDuration: cert?.courseDuration,
        modulesCount: cert?.modulesCompleted || cert?.modulesCount,
        achievement: cert?.achievement,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      logger.error(`[DOWNLOAD CERTIFICATE] ❌ Error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: 'Failed to download certificate' });
    }
  }

  /**
   * GET /api/certificates/preview
   * Authenticated, authoritative certificate inline preview
   */
  public async previewCertificate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const certificateId = String(req.query.certificateId || req.params.certificateId || '').trim();
      if (!certificateId) {
        res.status(400).json({ success: false, error: 'certificateId parameter is required' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database uninitialized' });
        return;
      }

      // Authoritative lookup from Firestore
      let certDoc = await db.collection('certificates').doc(certificateId).get();
      if (!certDoc.exists) {
        const querySnap = await db.collection('certificates').where('verificationId', '==', certificateId).get();
        if (!querySnap.empty) {
          certDoc = querySnap.docs[0];
        }
      }

      if (!certDoc.exists) {
        res.status(404).json({ success: false, error: 'Certificate not found' });
        return;
      }

      const cert = certDoc.data();
      const authUid = req.user?.uid;
      const isAdmin = req.user?.role === 'admin';

      // Authorization Check
      if (cert?.studentUid !== authUid && cert?.studentId !== authUid && !isAdmin) {
        res.status(403).json({ success: false, error: 'Forbidden: You cannot preview another student\'s certificate' });
        return;
      }

      // Generate in-memory PDF Buffer from authoritative metadata
      const pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
        certificateId: cert?.certificateId || certificateId,
        studentId: cert?.studentId || authUid || 'STUDENT',
        studentName: cert?.studentName,
        courseTitle: cert?.courseName || cert?.courseTitle,
        completionDate: cert?.completionDate || cert?.issueDate,
        courseDuration: cert?.courseDuration,
        modulesCount: cert?.modulesCompleted || cert?.modulesCount,
        achievement: cert?.achievement,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      logger.error(`[PREVIEW CERTIFICATE] ❌ Error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: 'Failed to preview certificate' });
    }
  }

  /**
   * GET /api/certificates/my-certificates
   * Fetches all registered certificates for the authenticated student
   */
  public async getMyCertificates(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const authUid = req.user?.uid;
      const authEmail = req.user?.email;

      if (!authUid && !authEmail) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      if (!db) {
        return res.status(500).json({ success: false, error: 'Database uninitialized' });
      }

      const certs: any[] = [];
      const seen = new Set<string>();

      if (authUid) {
        const snapUid = await db.collection('certificates').where('studentUid', '==', authUid).get();
        snapUid.forEach((doc) => {
          certs.push(doc.data());
          seen.add(doc.id);
        });
      }

      if (authEmail) {
        const snapEmail = await db.collection('certificates').where('studentEmail', '==', authEmail).get();
        snapEmail.forEach((doc) => {
          if (!seen.has(doc.id)) {
            certs.push(doc.data());
            seen.add(doc.id);
          }
        });
      }

      return res.status(200).json({ success: true, data: certs });
    } catch (err: any) {
      logger.error(`[MY CERTIFICATES] ❌ Error: ${err?.message || err}`);
      return res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
    }
  }

  /**
   * GET /api/certificates/student/:studentEmail
   * Fetches all registered certificates for an email (Ownership Protected)
   */
  public async getCertificatesByEmail(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const studentEmail = String(req.params.studentEmail || '').trim().toLowerCase();
      const authEmail = String(req.user?.email || '').trim().toLowerCase();
      const isAdmin = req.user?.role === 'admin';

      if (!studentEmail) {
        return res.status(400).json({ success: false, error: 'Missing studentEmail parameter' });
      }

      // Ownership authorization check (if authenticated user email differs from requested email and is not admin)
      if (req.user && authEmail && authEmail !== studentEmail && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You cannot access certificate history for another email.',
        });
      }

      if (!db) {
        return res.status(200).json({ success: true, data: [] });
      }

      const snap = await db.collection('certificates').where('studentEmail', '==', studentEmail).get();
      const certs = snap.docs.map((doc) => doc.data());

      return res.status(200).json({ success: true, data: certs });
    } catch (err: any) {
      logger.error(`[CERTIFICATES BY EMAIL] ❌ Error: ${err?.message || err}`);
      return res.status(200).json({ success: true, data: [] });
    }
  }

  /**
   * GET /api/certificates/verify/:certificateId
   * Public Certificate Verification (Sanitized Public DTO - Zero PII/Secrets Exposed)
   */
  public async verifyCertificate(req: Request, res: Response): Promise<Response> {
    try {
      const certificateId = String(req.params.certificateId || '').trim();
      if (!certificateId) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Missing Certificate ID parameter.',
        });
      }

      if (!db) {
        return res.status(500).json({
          success: false,
          verified: false,
          error: 'Database uninitialized',
        });
      }

      let certData: any = null;
      const docSnap = await db.collection('certificates').doc(certificateId).get();
      if (docSnap.exists) {
        certData = docSnap.data();
      } else {
        const querySnap = await db.collection('certificates').where('verificationId', '==', certificateId).get();
        if (!querySnap.empty) {
          certData = querySnap.docs[0].data();
        }
      }

      if (!certData) {
        return res.status(404).json({
          success: false,
          verified: false,
          error: 'Certificate not found',
        });
      }

      const isRevoked = certData.status === 'revoked' || certData.status === 'REVOKED' || certData.isRevoked === true;

      // Explicit Public Verification DTO (Masks all private fields: studentUid, studentEmail, googleDriveFileId, etc.)
      const publicVerificationDto = {
        certificateId: certData.certificateId || certificateId,
        verificationId: certData.verificationId || certificateId,
        studentName: certData.studentName,
        courseName: certData.courseName || certData.courseTitle,
        issueDate: certData.issueDate || certData.completionDate,
        completionDate: certData.completionDate || certData.issueDate,
        courseDuration: certData.courseDuration || '25 Hours',
        modulesCompleted: certData.modulesCompleted || 'All Modules',
        achievement: certData.achievement || '100% Completed',
        status: isRevoked ? 'REVOKED' : (certData.status || 'Issued'),
        isRevoked,
      };

      return res.status(200).json({
        success: true,
        verified: !isRevoked,
        data: publicVerificationDto,
        certificate: publicVerificationDto,
      });
    } catch (err: any) {
      logger.error(`[CERTIFICATE VERIFICATION] ❌ Error: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        verified: false,
        error: 'Failed to verify certificate',
      });
    }
  }

  /**
   * POST /api/certificates/:certificateId/revoke
   * Revoke certificate (Admin only)
   */
  public async revokeCertificate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const certificateId = String(req.params.certificateId || '').trim();
      const { reason } = req.body || {};

      if (!certificateId || !db) {
        return res.status(400).json({ success: false, error: 'certificateId required' });
      }

      await db.collection('certificates').doc(certificateId).set(
        {
          status: 'REVOKED',
          isRevoked: true,
          revokedAt: new Date().toISOString(),
          revokedBy: req.user?.uid || 'admin',
          revocationReason: reason || 'Revoked by administrator',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return res.status(200).json({
        success: true,
        message: `Certificate ${certificateId} revoked successfully.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || err });
    }
  }

  /**
   * POST /api/certificates/:certificateId/restore
   * Restore revoked certificate (Admin only)
   */
  public async restoreCertificate(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const certificateId = String(req.params.certificateId || '').trim();

      if (!certificateId || !db) {
        return res.status(400).json({ success: false, error: 'certificateId required' });
      }

      await db.collection('certificates').doc(certificateId).set(
        {
          status: 'Issued',
          isRevoked: false,
          restoredAt: new Date().toISOString(),
          restoredBy: req.user?.uid || 'admin',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return res.status(200).json({
        success: true,
        message: `Certificate ${certificateId} restored successfully.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message || err });
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

      if (db) {
        // 1. Sync student_progress
        await studentProgressCollection().doc(`${studentId}_${courseId}`).set(
          {
            studentId,
            courseId,
            completedLessons: completedLessons || [],
            completedModules: completedModules || [],
            completionPercentage: 100,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 2. Sync quiz attempts
        if (Array.isArray(quizScores)) {
          for (const quiz of quizScores) {
            const attemptId = `${studentId}_${quiz.quizId}`;
            await quizAttemptsCollection().doc(attemptId).set(
              {
                studentId,
                courseId,
                quizId: quiz.quizId,
                percentage: Number(quiz.percentage || 0),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        }

        // 3. Sync assignment submissions
        if (Array.isArray(assignmentSubmissions)) {
          for (const assign of assignmentSubmissions) {
            await assignmentSubmissionsCollection().doc(`${studentId}_${assign.assignmentId}`).set(
              {
                studentId,
                courseId,
                assignmentId: assign.assignmentId,
                status: assign.status,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Student progress and submissions synced successfully to Firestore.',
      });
    } catch (err: any) {
      logger.error(`[CERTIFICATE SYNC] ❌ Exception: ${err?.message || err}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to sync learning state',
      });
    }
  }

  /**
   * GET /api/certificates/test-delivery
   * Instant diagnostic test route to simulate 100% course completion delivery (Admin/Auth Only)
   */
  public async testDelivery(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const targetEmail = (req.query.email as string) || req.user?.email || 'student@kaizenq.in';
      const studentName = (req.query.name as string) || req.user?.name || 'Test Student';
      const courseTitle = (req.query.course as string) || 'C Programming';
      const studentId = (req.query.studentId as string) || req.user?.uid || 'test_uid_123';
      const courseId = (req.query.courseId as string) || 'c-programming';
      const forceRegenerate = req.query.forceRegenerate === 'true';

      const requestId = `certificate-request-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      const payload = {
        studentId,
        studentName,
        studentEmail: targetEmail,
        courseId,
        courseTitle,
        completionPercentage: 100,
        instructorName: 'Shaivika Groups Board',
        courseDuration: '24 Hours',
        modulesCount: 8,
        forceRegenerate,
        requestId,
      };

      const result = await certificateDeliveryService.handleCourseCompletionAndDeliver(payload);
      return res.status(result.success ? 200 : 500).json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Test delivery encountered an error',
      });
    }
  }
}

export const certificateController = new CertificateController();
