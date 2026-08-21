import { Request, Response } from 'express';
import { db, adminAuth } from '../firebase';
import { certificateDeliveryService, cleanCourseTitleForCertificate } from '../services/certificate/CertificateDeliveryService';
import { googleSlidesService } from '../services/certificate/GoogleSlidesService';
import { qrCodeService } from '../services/certificate/QRCodeService';
import { googleSheetsService } from '../services/certificate/GoogleSheetsService';
import logger from '../config/logger';
import { CourseService } from '../services/course/CourseService';
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

  private async resolveStudentData(studentId: string, fallbackEmail?: string): Promise<any> {
    if (!studentId || !db) return null;
    
    // 1. Direct doc lookup in users
    logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'users' by document ID: ${studentId}`);
    let doc = await db.collection('users').doc(studentId).get().catch(() => null);
    if (doc && doc.exists) {
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'users' collection by Document ID: ${studentId}`);
      return doc.data();
    }

    // 2. Direct doc lookup in students
    logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'students' by document ID: ${studentId}`);
    doc = await db.collection('students').doc(studentId).get().catch(() => null);
    if (doc && doc.exists) {
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'students' collection by Document ID: ${studentId}`);
      return doc.data();
    }

    // 3. Fallback lookup by uid in users
    logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'users' where 'uid' == ${studentId}`);
    let querySnap = await db.collection('users').where('uid', '==', studentId).get().catch(() => null);
    if (querySnap && !querySnap.empty) {
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'users' collection by 'uid' field: ${studentId}`);
      return querySnap.docs[0].data();
    }

    // 4. Fallback lookup by uid in students
    logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'students' where 'uid' == ${studentId}`);
    querySnap = await db.collection('students').where('uid', '==', studentId).get().catch(() => null);
    if (querySnap && !querySnap.empty) {
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'students' collection by 'uid' field: ${studentId}`);
      return querySnap.docs[0].data();
    }

    // 5. Fallback lookup by email in users
    if (fallbackEmail) {
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'users' where 'email' == ${fallbackEmail}`);
      querySnap = await db.collection('users').where('email', '==', fallbackEmail).get().catch(() => null);
      if (querySnap && !querySnap.empty) {
        logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'users' collection by 'email' field: ${fallbackEmail}`);
        return querySnap.docs[0].data();
      }

      // 6. Fallback lookup by email in students
      logger.info(`[CERTIFICATE PROFILE RESOLUTION] Querying collection 'students' where 'email' == ${fallbackEmail}`);
      querySnap = await db.collection('students').where('email', '==', fallbackEmail).get().catch(() => null);
      if (querySnap && !querySnap.empty) {
        logger.info(`[CERTIFICATE PROFILE RESOLUTION] Found profile in 'students' collection by 'email' field: ${fallbackEmail}`);
        return querySnap.docs[0].data();
      }
    }

    logger.warn(`[CERTIFICATE PROFILE RESOLUTION] ⚠️ Could not resolve profile in 'users' or 'students' collections for ID: ${studentId}, Email: ${fallbackEmail}`);
    return null;
  }

  /**
   * POST /api/certificates/complete-and-deliver
   * Triggered when student reaches 100% course completion
   */
  public async handleCompletionAndDeliver(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      let studentId = req.user?.uid;
      // Fallback to req.body.studentId if authenticated UID is missing or is generic default
      if ((!studentId || studentId === 'dev-user-id') && req.body.studentId) {
        studentId = req.body.studentId;
      }
      const {
        courseId,
        courseTitle,
        completionPercentage,
        instructorName,
        courseDuration,
        modulesCount,
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

      const fallbackEmail = req.user?.email || req.body.studentEmail;

      // Resolve student profile from Firestore users collection
      let studentName = bodyStudentName || '';
      let studentEmail = bodyStudentEmail || '';
      let resolvedStudentId = studentId;

      if (db) {
        try {
          let userData = await this.resolveStudentData(studentId, fallbackEmail);

          // Auto-sync/create profile from verified token/body details
          if (!userData && fallbackEmail) {
            const email = fallbackEmail;
            const displayName = req.user?.name || req.body.studentName;
            
            if (displayName) {
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
              await db.collection('users').doc(studentId).set(newProfile).catch(() => null);
              await db.collection('students').doc(studentId).set(newProfile).catch(() => null);
              logger.info(`[CERTIFICATE CONTROLLER] Automatically created student profile in database for ${studentId} (${email}) using verified claims.`);
              
              userData = await this.resolveStudentData(studentId, fallbackEmail);
            } else {
              logger.error(`[CERTIFICATE CONTROLLER] ❌ Cannot auto-create profile: name claim/body name is missing for UID ${studentId}.`);
            }
          }

          if (userData) {
            studentName = userData.fullName || userData.name || studentName || '';
            studentEmail = userData.email || studentEmail || '';
            resolvedStudentId = userData.uid || userData.id || studentId;
          }
        } catch (dbErr: any) {
          logger.error(`[CERTIFICATE CONTROLLER] Error resolving profile: ${dbErr?.message}`);
        }
      }

      // Fallback to body/token details if database lookup/resolution fails (e.g. due to Firestore quota exhaustion)
      if (!studentName && req.body.studentName) {
        studentName = req.body.studentName;
        logger.info(`[CERTIFICATE CONTROLLER] Profile name resolved from request body fallback: ${studentName}`);
      }
      if (!studentEmail && req.body.studentEmail) {
        studentEmail = req.body.studentEmail;
        logger.info(`[CERTIFICATE CONTROLLER] Profile email resolved from request body fallback: ${studentEmail}`);
      }
      if (!studentEmail && req.user?.email) {
        studentEmail = req.user.email;
        logger.info(`[CERTIFICATE CONTROLLER] Profile email resolved from token fallback: ${studentEmail}`);
      }

      // Make sure we have a fallback studentName & studentEmail if not resolved above
      if (!studentName) {
        studentName = req.user?.name || req.user?.email?.split('@')[0] || 'Student';
      }
      if (!studentEmail) {
        studentEmail = req.user?.email || 'student@shaivika.com';
      }

      const requestId = `certificate-request-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
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
        forceRegenerate: forceRegenerate === true || forceRegenerate === 'true',
        requestId,
      };

      const result = await certificateDeliveryService.handleCourseCompletionAndDeliver(payload);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        if (result.error && result.error.toLowerCase().includes('quota')) {
          return res.status(429).json(result);
        }
        return res.status(500).json(result);
      }
    } catch (err: any) {
      logger.error(`[CERTIFICATE CONTROLLER] ❌ Exception: ${err?.message || err}`);
      if (err?.message?.toLowerCase().includes('quota')) {
        return res.status(429).json({
          success: false,
          error: err.message,
        });
      }
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
      const targetEmail = (req.query.email as string) || 'devisribalam5@gmail.com';
      const studentName = (req.query.name as string) || 'BALAM DEVISRI';
      const courseTitle = (req.query.course as string) || 'C Programming';
      const studentId = (req.query.studentId as string) || 'aTtKfoyKgEcYgdNs5pd4OkClGD12';
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
        modulesCount,
        courseId
      } = req.query;

      if (!certificateId || !studentId || !studentName || !courseTitle) {
        res.status(400).send('Missing required query parameters: certificateId, studentId, studentName, courseTitle.');
        return;
      }

      let dynamicStudentName = String(studentName);
      let dynamicCourseTitle = String(courseTitle);
      let dynamicCourseDuration = String(courseDuration || '24 Hours');
      let actualModulesCount = Number(modulesCount || 8);

      if (db) {
        try {
          const studentData = await this.resolveStudentData(String(studentId));
          if (studentData) {
            dynamicStudentName = studentData.fullName || studentData.name || studentData.displayName || String(studentName);
          }

          if (courseId) {
            const courseDoc = await this.resolveCourseDoc(String(courseId));
            if (courseDoc && courseDoc.exists) {
              const courseData = courseDoc.data();
              if (courseData) {
                dynamicCourseTitle = courseData.title || String(courseTitle);
                dynamicCourseDuration = courseData.duration || String(courseDuration || '24 Hours');
                
                let count = 0;
                if (Array.isArray(courseData.modules) && courseData.modules.length > 0) {
                  count = courseData.modules.length;
                } else if (Array.isArray(courseData.syllabus) && courseData.syllabus.length > 0) {
                  count = courseData.syllabus.length;
                } else {
                  try {
                    const modulesSnap = await db.collection('modules')
                      .where('courseId', '==', courseDoc.id)
                      .get();
                    count = modulesSnap.size;
                  } catch {}
                }
                if (count > 0) {
                  actualModulesCount = count;
                }
              }
            }
          }
        } catch (dbErr) {
          logger.warn(`[DOWNLOAD CERTIFICATE] Failed to fetch student/course Firestore data: ${dbErr}`);
        }
      }

      // Calculate achievement score from quiz attempts dynamically
      let dynamicAchievement = 'Outstanding Achievement';
      if (db) {
        try {
          const resolvedCourse = courseId ? await this.resolveCourseDoc(String(courseId)) : null;
          const courseDocId = resolvedCourse ? resolvedCourse.id : String(courseId);
          const courseIdsToCheck = Array.from(new Set([String(courseId), courseDocId]));

          const quizAttempts = await quizAttemptsCollection()
            .where('studentId', '==', String(studentId))
            .where('courseId', 'in', courseIdsToCheck)
            .get();
          
          if (!quizAttempts.empty) {
            let totalScore = 0;
            let count = 0;
            quizAttempts.forEach((doc: any) => {
              const attempt = doc.data();
              if (typeof attempt.score === 'number') {
                totalScore += attempt.score;
                count++;
              }
            });
            if (count > 0) {
              const average = Math.round(totalScore / count);
              dynamicAchievement = `Grade: ${average}% Completion Score`;
            }
          } else {
            dynamicAchievement = '100% Score • Mastery';
          }
        } catch (qErr) {
          logger.warn(`[DOWNLOAD CERTIFICATE] Failed to calculate quiz scores: ${qErr}`);
        }
      }

      const qrCodeBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
        String(certificateId),
        String(studentId)
      );

      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await googleSlidesService.generateCertificateFromTemplate({
          certificateId: String(certificateId),
          studentId: String(studentId),
          studentName: dynamicStudentName,
          courseTitle: cleanCourseTitleForCertificate(dynamicCourseTitle),
          instructorName: 'Shaivika Groups Board',
          completionDate: String(completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          courseDuration: dynamicCourseDuration,
          modulesCount: actualModulesCount,
          achievement: dynamicAchievement,
          qrCodeBuffer,
          courseId: courseId ? String(courseId) : undefined,
        });
      } catch (slideErr: any) {
        logger.warn(`[DOWNLOAD CERTIFICATE] Google Slides template generation failed: ${slideErr?.message || slideErr}. Falling back to local PDFCertificateGenerator.`);
        const { pdfCertificateGenerator } = await import('../services/certificate/PDFCertificateGenerator');
        pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
          certificateId: String(certificateId),
          studentId: String(studentId),
          studentName: dynamicStudentName,
          courseTitle: cleanCourseTitleForCertificate(dynamicCourseTitle),
          instructorName: 'Shaivika Groups Board',
          completionDate: String(completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          courseDuration: dynamicCourseDuration,
          modulesCount: actualModulesCount,
          qrCodeBuffer,
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      logger.error(`[DOWNLOAD CERTIFICATE] ❌ Exception: ${err?.message || err}`);
      if (err?.message?.toLowerCase().includes('quota')) {
        res.status(429).send('Google Slides API quota temporarily exceeded. Please try again later.');
      } else {
        res.status(500).send('Failed to generate download certificate.');
      }
    }
  }

  /**
   * GET /api/certificates/preview
   * Serves inline presentation of high-quality certificate PDF inside the browser iframe
   */
  public async previewCertificate(req: Request, res: Response): Promise<void> {
    try {
      const {
        certificateId,
        studentId,
        studentName,
        courseTitle,
        completionDate,
        courseDuration,
        modulesCount,
        courseId
      } = req.query;

      if (!certificateId || !studentId || !studentName || !courseTitle) {
        res.status(400).send('Missing required query parameters: certificateId, studentId, studentName, courseTitle.');
        return;
      }

      let dynamicStudentName = String(studentName);
      let dynamicCourseTitle = String(courseTitle);
      let dynamicCourseDuration = String(courseDuration || '24 Hours');
      let actualModulesCount = Number(modulesCount || 8);

      if (db) {
        try {
          const studentData = await this.resolveStudentData(String(studentId));
          if (studentData) {
            dynamicStudentName = studentData.fullName || studentData.name || studentData.displayName || String(studentName);
          }

          if (courseId) {
            const courseDoc = await this.resolveCourseDoc(String(courseId));
            if (courseDoc && courseDoc.exists) {
              const courseData = courseDoc.data();
              if (courseData) {
                dynamicCourseTitle = courseData.title || String(courseTitle);
                dynamicCourseDuration = courseData.duration || String(courseDuration || '24 Hours');
                
                let count = 0;
                if (Array.isArray(courseData.modules) && courseData.modules.length > 0) {
                  count = courseData.modules.length;
                } else if (Array.isArray(courseData.syllabus) && courseData.syllabus.length > 0) {
                  count = courseData.syllabus.length;
                } else {
                  try {
                    const modulesSnap = await db.collection('modules')
                      .where('courseId', '==', courseDoc.id)
                      .get();
                    count = modulesSnap.size;
                  } catch {}
                }
                if (count > 0) {
                  actualModulesCount = count;
                }
              }
            }
          }
        } catch (dbErr) {
          logger.warn(`[PREVIEW CERTIFICATE] Failed to fetch student/course Firestore data: ${dbErr}`);
        }
      }

      // Calculate achievement score from quiz attempts dynamically
      let dynamicAchievement = 'Outstanding Achievement';
      if (db) {
        try {
          const resolvedCourse = courseId ? await this.resolveCourseDoc(String(courseId)) : null;
          const courseDocId = resolvedCourse ? resolvedCourse.id : String(courseId);
          const courseIdsToCheck = Array.from(new Set([String(courseId), courseDocId]));

          const quizAttempts = await quizAttemptsCollection()
            .where('studentId', '==', String(studentId))
            .where('courseId', 'in', courseIdsToCheck)
            .get();
          
          if (!quizAttempts.empty) {
            let totalScore = 0;
            let count = 0;
            quizAttempts.forEach((doc: any) => {
              const attempt = doc.data();
              if (typeof attempt.score === 'number') {
                totalScore += attempt.score;
                count++;
              }
            });
            if (count > 0) {
              const average = Math.round(totalScore / count);
              dynamicAchievement = `Grade: ${average}% Completion Score`;
            }
          } else {
            dynamicAchievement = '100% Score • Mastery';
          }
        } catch (qErr) {
          logger.warn(`[PREVIEW CERTIFICATE] Failed to calculate quiz scores: ${qErr}`);
        }
      }

      const qrCodeBuffer = await qrCodeService.generateVerificationQRCodeBuffer(
        String(certificateId),
        String(studentId)
      );

      let pdfBuffer: Buffer;
      try {
        pdfBuffer = await googleSlidesService.generateCertificateFromTemplate({
          certificateId: String(certificateId),
          studentId: String(studentId),
          studentName: dynamicStudentName,
          courseTitle: cleanCourseTitleForCertificate(dynamicCourseTitle),
          instructorName: 'Shaivika Groups Board',
          completionDate: String(completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          courseDuration: dynamicCourseDuration,
          modulesCount: actualModulesCount,
          achievement: dynamicAchievement,
          qrCodeBuffer,
          courseId: courseId ? String(courseId) : undefined,
        });
      } catch (slideErr: any) {
        logger.warn(`[PREVIEW CERTIFICATE] Google Slides template generation failed: ${slideErr?.message || slideErr}. Falling back to local PDFCertificateGenerator.`);
        const { pdfCertificateGenerator } = await import('../services/certificate/PDFCertificateGenerator');
        pdfBuffer = await pdfCertificateGenerator.generateCertificateBuffer({
          certificateId: String(certificateId),
          studentId: String(studentId),
          studentName: dynamicStudentName,
          courseTitle: cleanCourseTitleForCertificate(dynamicCourseTitle),
          instructorName: 'Shaivika Groups Board',
          completionDate: String(completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          courseDuration: dynamicCourseDuration,
          modulesCount: actualModulesCount,
          qrCodeBuffer,
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="certificate-preview.pdf"');
      res.send(pdfBuffer);
    } catch (err: any) {
      logger.error(`[PREVIEW CERTIFICATE] ❌ Exception: ${err?.message || err}`);
      if (err?.message?.toLowerCase().includes('quota')) {
        res.status(429).send('Google Slides API quota temporarily exceeded. Please try again later.');
      } else {
        res.status(500).send('Failed to generate preview certificate.');
      }
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
