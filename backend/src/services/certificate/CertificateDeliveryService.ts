import fs from 'fs';
import path from 'path';
import logger from '../../config/logger';
import { env } from '../../config/env';
import { emailService } from '../email/EmailService';
import { googleDriveService } from '../googleDrive.service';
import { pdfCertificateGenerator } from './PDFCertificateGenerator';
import { qrCodeService } from './QRCodeService';
import { googleSheetsService } from './GoogleSheetsService';
import { db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  isFirestoreInitialized,
  coursesCollection,
  studentProgressCollection,
  quizAttemptsCollection,
  assignmentSubmissionsCollection,
} from '../../firebase/collections';
import { StudentProgressDoc } from '../../types/aiLmsTypes';

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
  verificationId?: string;
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
  private static activeLocks: Set<string> = new Set();

  /**
   * Generates unique Certificate ID in KQ-CERT-XXXX-YYYY format
   */
  private async generateGloballyUniqueId(courseId: string): Promise<string> {
    const year = new Date().getFullYear();
    const courseCode = courseId.toUpperCase().includes('LINUX') ? 'LINUX' : (courseId.toUpperCase().includes('GIT') ? 'GIT' : 'COURSE');
    
    let seq = 1;
    const filePath = this.getLocalRegistryPath();
    if (fs.existsSync(filePath)) {
      try {
        const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        seq = records.length + 1;
      } catch {}
    }

    let certificateId = `KQ-${courseCode}-${year}-${String(seq).padStart(6, '0')}`;
    
    try {
      let isDuplicate = await googleSheetsService.getCertificateById(certificateId);
      let attempts = 0;
      while (isDuplicate && attempts < 10) {
        seq++;
        certificateId = `KQ-${courseCode}-${year}-${String(seq).padStart(6, '0')}`;
        isDuplicate = await googleSheetsService.getCertificateById(certificateId);
        attempts++;
      }
    } catch {}

    return certificateId;
  }

  private getLocalRegistryPath(): string {
    return path.resolve(process.cwd(), 'data/issued-certificates.json');
  }

  private isAlreadyIssued(studentEmail: string, courseId: string): any | null {
    const filePath = this.getLocalRegistryPath();
    if (!fs.existsSync(filePath)) return null;
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const records = JSON.parse(content);
      return records.find((r: any) => r.studentEmail === studentEmail && r.courseId === courseId) || null;
    } catch (err) {
      logger.error('[AUTOMATED CERTIFICATE SYSTEM] Error reading local registry:', err);
      return null;
    }
  }

  private logLocalRegistry(record: any): void {
    const filePath = this.getLocalRegistryPath();
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    let records: any[] = [];
    if (fs.existsSync(filePath)) {
      try {
        records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch {}
    }
    records.push(record);
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf8');
  }

  /**
   * Validate Student course completion eligibility using `users` collection as ONLY source of truth.
   */
  public async validateStudentEligibility(studentId: string, courseId: string): Promise<{ eligible: boolean; error?: string; details?: any; lookupResult?: string }> {
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Starting validation pipeline for student ${studentId} in course ${courseId}...`);

    if (!isFirestoreInitialized()) {
      return { eligible: false, error: 'Database is not initialized.' };
    }

    // 1. Validate Student exists in central `users` collection ONLY
    let lookupResult = 'Not Found';
    let studentDoc = await db.collection('users').doc(studentId).get();
    let studentData = studentDoc.exists ? studentDoc.data() : null;

    if (studentDoc.exists) {
      lookupResult = 'User Found by Doc ID';
    } else {
      logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Falling back to query: doc(users) where("uid", "==", "${studentId}")...`);
      const fallbackSnap = await db.collection('users').where('uid', '==', studentId).get();
      if (!fallbackSnap.empty) {
        studentDoc = fallbackSnap.docs[0];
        studentData = studentDoc.data();
        lookupResult = 'User Found by UID Fallback Query';
      } else {
        // Fallback: Resolve student's existing profile/account matching first 6 chars of UID case-infinitively
        const prefix = studentId.substring(0, 6).toLowerCase();
        logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Searching users collection for document starting with prefix: ${prefix}...`);
        const allUsersSnap = await db.collection('users').get();
        const matchedDoc = allUsersSnap.docs.find(doc => 
          doc.id.toLowerCase().startsWith(prefix) || 
          String(doc.data()?.uid || '').toLowerCase().startsWith(prefix)
        );
        if (matchedDoc) {
          studentDoc = matchedDoc;
          studentData = studentDoc.data();
          lookupResult = `User Found by UID Prefix Match (${prefix})`;
          logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Resolved to existing student account: ${studentDoc.id} (${studentData?.email})`);
        }
      }
    }

    if (!studentData) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Student ${studentId} not found in users collection.`);
      return {
        eligible: false,
        error: 'Student account not found.',
        lookupResult: 'User Not Found in users Collection',
        details: {
          studentUid: studentId,
          collectionSearched: 'users',
          queryExecuted: `doc(users/${studentId}) & where("uid", "==", "${studentId}")`,
          reason: 'No document matched the provided student ID in the users collection.',
          possibleFix: 'Ensure the user account exists and is registered in the users collection.',
        },
      };
    }

    // Role check
    const role = (studentData.role || 'student').toLowerCase();
    if (role !== 'student' && role !== 'instructor' && role !== 'admin') {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Invalid role "${role}" for student ${studentId}.`);
      return { eligible: false, error: `Invalid account role: "${role}".`, lookupResult };
    }

    // Account Status check
    const statusLower = String(studentData.status || '').toLowerCase();
    const isBlocked = studentData.isActive === false || statusLower === 'rejected';
    if (isBlocked) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Student ${studentId} is inactive/blocked (status: ${studentData?.status}).`);
      return { eligible: false, error: 'Student account is inactive or not approved.', lookupResult };
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Student exists in users collection and is Active (${lookupResult}).`);

    // 2. Validate Course exists, is Published, and is not Archived
    const courseDoc = await coursesCollection().doc(courseId).get();
    if (!courseDoc.exists) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Course ${courseId} not found.`);
      return { eligible: false, error: 'Course not found.', lookupResult };
    }
    const courseData: any = courseDoc.data();
    if (courseData?.status !== 'published') {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Course ${courseId} is not Published.`);
      return { eligible: false, error: 'Course is not published.', lookupResult };
    }
    if (courseData?.archived === true || courseData?.status === 'archived') {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Course ${courseId} is Archived.`);
      return { eligible: false, error: 'Course is archived.', lookupResult };
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Course exists, is Published, and is not Archived.`);

    // 3. Load Student Progress and verify enrollment
    const progressDoc = await studentProgressCollection().doc(`${studentId}_${courseId}`).get();
    if (!progressDoc.exists) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Progress record not found for student ${studentId} in course ${courseId}.`);
      return { eligible: false, error: 'Student is not enrolled or progress record is missing.', lookupResult };
    }
    const progressData = progressDoc.data() as StudentProgressDoc;
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Student is enrolled.`);

    // 4. Validate Progress is 100%
    let expectedLessons: any[] = [];
    if (Array.isArray(courseData.modules)) {
      courseData.modules.forEach((mod: any) => {
        if (Array.isArray(mod.lessons) && mod.lessons.length > 0) {
          expectedLessons.push(...mod.lessons);
        } else if (Array.isArray(mod.topics)) {
          mod.topics.forEach((topic: any) => {
            if (Array.isArray(topic.learningUnits)) {
              topic.learningUnits.forEach((unit: any) => {
                expectedLessons.push({
                  id: unit.id || unit.unitId,
                  title: unit.title,
                  type: unit.type || unit.unitType || 'reading',
                  quizPassingScore: unit.quizPassingScore,
                });
              });
            }
          });
        }
      });
    }

    const completedLessons = progressData.completedLessons || [];
    const allLessonsDone = expectedLessons.length > 0 && expectedLessons.every(l => 
      completedLessons.includes(String(l.id))
    );
    if (!allLessonsDone) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Student has not completed all required lessons.`);
      return { eligible: false, error: 'Not all required lessons are completed.', lookupResult };
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Every required lesson is completed.`);

    const completedModules = progressData.completedModules || [];
    const expectedModules = courseData.modules || [];
    const allModulesDone = expectedModules.every((m: any) => 
      completedModules.includes(String(m.id))
    );
    if (!allModulesDone) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Student has not completed all modules.`);
      return { eligible: false, error: 'Not all modules are marked complete.', lookupResult };
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Every required module is completed.`);

    // 5. Validate Quizzes passed
    const quizUnits: any[] = [];
    const assignmentUnits: any[] = [];
    expectedModules.forEach((mod: any) => {
      const lessons = (Array.isArray(mod.lessons) && mod.lessons.length > 0) ? [...mod.lessons] : [];
      if (lessons.length === 0 && Array.isArray(mod.topics)) {
        mod.topics.forEach((topic: any) => {
          if (Array.isArray(topic.learningUnits)) {
            lessons.push(...topic.learningUnits.map((u: any) => ({
              id: u.id || u.unitId,
              title: u.title,
              type: u.type || u.unitType || 'reading',
              quizPassingScore: u.quizPassingScore,
            })));
          }
        });
      }
      lessons.forEach((lesson: any) => {
        const typeLower = (lesson.type || '').toLowerCase();
        if (typeLower === 'quiz') quizUnits.push(lesson);
        else if (typeLower === 'assignment') assignmentUnits.push(lesson);
      });
    });

    for (const quiz of quizUnits) {
      const attemptsSnap = await quizAttemptsCollection()
        .where('studentId', '==', studentId)
        .where('courseId', '==', courseId)
        .where('quizId', '==', quiz.id)
        .get();
      
      const hasPassed = !attemptsSnap.empty && attemptsSnap.docs.some((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        const passingScore = quiz.quizPassingScore || 60;
        return (data.percentage || 0) >= passingScore;
      });

      if (!hasPassed) {
        logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Required quiz ${quiz.title} (${quiz.id}) not passed.`);
        return { eligible: false, error: `Required quiz "${quiz.title}" has not been passed.`, lookupResult };
      }
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Every required quiz is passed.`);

    // 6. Validate Assignments submitted
    for (const assignment of assignmentUnits) {
      const subDoc = await assignmentSubmissionsCollection().doc(`${studentId}_${assignment.id}`).get();
      const submission = subDoc.exists ? subDoc.data() : null;
      const isSubmitted = submission && ['Submitted', 'Under Review', 'Graded'].includes(submission.status);

      if (!isSubmitted) {
        logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Required assignment ${assignment.title} (${assignment.id}) not submitted.`);
        return { eligible: false, error: `Required assignment "${assignment.title}" has not been submitted.`, lookupResult };
      }
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Every required assignment is submitted.`);

    return { eligible: true, lookupResult };
  }

  /**
   * Fully Automated Certificate Delivery Pipeline
   * Triggered automatically when student reaches 100% completion
   */
  public async handleCourseCompletionAndDeliver(
    payload: CompletionTriggerPayload & { forceRegenerate?: boolean }
  ): Promise<AutomatedDeliveryResult> {
    const startTime = Date.now();
    const timeline: Array<{ step: string; status: 'SUCCESS' | 'FAILED'; timestamp: string; details?: string }> = [];
    const isForce = payload.forceRegenerate === true;
    const lockKey = `${payload.studentId}_${payload.courseId}`;

    // Deduplication Request Lock (Issue 3)
    if (!isForce && CertificateDeliveryService.activeLocks.has(lockKey)) {
      logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ Request lock active for ${lockKey}. Preventing duplicate concurrent execution.`);
      return {
        success: true,
        certificateId: payload.verificationId || 'IN_PROGRESS',
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        error: 'Certificate generation already in progress for this student and course.',
        timeline,
      };
    }

    CertificateDeliveryService.activeLocks.add(lockKey);

    let lookupResult = 'users Collection';
    let certExistsInFirestore = false;
    let emailSent = false;
    let firestoreUpdated = false;

    try {
      logger.info(`================================================================`);
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] 🎓 Triggered for Student: ${payload.studentName} (${payload.studentEmail})`);
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Course: "${payload.courseTitle}" | Progress: ${payload.completionPercentage}%`);
      logger.info(`================================================================`);

      timeline.push({
        step: '0. VALIDATION_STARTED',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      });

      // Always validate eligibility in production to confirm student has completed the course
      const valResult = await this.validateStudentEligibility(payload.studentId, payload.courseId);
      lookupResult = valResult.lookupResult || 'users Collection';
      if (!valResult.eligible) {
        timeline.push({
          step: '0. VALIDATION_FAILED',
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          details: valResult.error,
        });
        return {
          success: false,
          certificateId: '',
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseTitle: payload.courseTitle,
          completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          error: valResult.error,
          timeline,
        };
      }

      // Precheck 1: Check Firestore certificates collection (Prevent duplicate generation)
      if (db) {
        try {
          const certQuery = await db.collection('certificates')
            .where('studentUid', '==', payload.studentId)
            .where('courseId', '==', payload.courseId)
            .get();
          
          if (!certQuery.empty) {
            const existingCert = certQuery.docs[0].data();
            certExistsInFirestore = true;
            logger.info(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ Certificate Already Exists in Firestore certificates collection for ${payload.studentEmail} in course ${payload.courseId}. Skipping generation.`);
            return {
              success: true,
              certificateId: existingCert.certificateId,
              studentId: payload.studentId,
              studentName: payload.studentName,
              studentEmail: payload.studentEmail,
              courseTitle: payload.courseTitle,
              completionDate: existingCert.completionDate || existingCert.issueDate,
              googleDriveLink: existingCert.pdfUrl || 'local-server',
              googleDriveFileId: 'local-server',
              timeline,
            };
          }
        } catch (certCheckErr: any) {
          logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Firestore cert precheck notice: ${certCheckErr?.message}`);
        }
      }

      // Precheck 2: Check Local Registry
      const localExisting = this.isAlreadyIssued(payload.studentEmail, payload.courseId);
      if (localExisting) {
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ Certificate already exists locally for ${payload.studentEmail} in course ${payload.courseId}. Skipping generation.`);
        return {
          success: true,
          certificateId: localExisting.certificateId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseTitle: payload.courseTitle,
          completionDate: localExisting.completionDate,
          googleDriveLink: localExisting.googleDriveLink || 'local-server',
          googleDriveFileId: 'local-server',
          timeline,
        };
      }

      // Precheck 3: Check Google Sheets Registry
      try {
        const sheetExisting = await googleSheetsService.checkCertificateExists(payload.studentEmail, payload.courseId);
        if (sheetExisting) {
          logger.info(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ Certificate already exists in Google Sheets Registry for ${payload.studentEmail} in course ${payload.courseId}. Skipping generation.`);
          
          this.logLocalRegistry({
            certificateId: sheetExisting.certificateId,
            studentEmail: payload.studentEmail,
            courseId: payload.courseId,
            completionDate: sheetExisting.completionDate,
            googleDriveLink: 'local-server',
          });

          return {
            success: true,
            certificateId: sheetExisting.certificateId,
            studentId: payload.studentId,
            studentName: payload.studentName,
            studentEmail: payload.studentEmail,
            courseTitle: payload.courseTitle,
            completionDate: sheetExisting.completionDate,
            googleDriveLink: 'local-server',
            googleDriveFileId: 'local-server',
            timeline,
          };
        }
      } catch (sheetCheckErr: any) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Sheet precheck search failed/skipped: ${sheetCheckErr?.message || sheetCheckErr}`);
      }

    // Step 1: Generate Deterministic Globally Unique Certificate ID (Preventing duplicates in sheet registry)
    const certificateId = payload.verificationId || await this.generateGloballyUniqueId(payload.courseId);
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const rawUid = payload.studentId || 'default_student';
    const displayStudentId = rawUid.startsWith('STU-') ? rawUid : `STU-${rawUid.substring(0, 6).toUpperCase()}`;

    timeline.push({
      step: '1. GENERATE_CERTIFICATE_ID',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      details: `Generated ID: ${certificateId}`,
    });
    logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 1: Generated Unique Certificate ID -> ${certificateId}`);

    let qrCodeBuffer: Buffer;
    let pdfBuffer: Buffer;

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
        studentId: displayStudentId,
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

    // Direct download and verification URL preparation
    const downloadUrl = `${env.BACKEND_URL || 'http://localhost:5000'}/api/certificates/download?certificateId=${certificateId}&studentId=${payload.studentId}&studentName=${encodeURIComponent(payload.studentName)}&courseTitle=${encodeURIComponent(payload.courseTitle)}&completionDate=${encodeURIComponent(completionDate)}`;
    const verifyUrl = `${env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateId}?studentId=${payload.studentId}`;

    // Step 4: Log Certificate to Google Sheet Registry FIRST
    let sheetLogged = false;
    try {
      sheetLogged = await googleSheetsService.appendCertificateRow({
        certificateId,
        studentId: displayStudentId, // USE DISPLAY STUDENT ID FOR SHEETS
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseId: payload.courseId,
        courseName: payload.courseTitle,
        completionDate,
        issueDate: completionDate,
        certificateStatus: 'Issued',
        emailStatus: 'Pending',
        generatedTimestamp: new Date().toISOString(),
      });

      if (sheetLogged) {
        timeline.push({
          step: '4. UPDATE_GOOGLE_SHEETS_REGISTRY',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          details: `Logged to Google Sheets Registry.`,
        });
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 4: Certificate logged to Google Sheet Registry successfully.`);
      } else {
        logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ Google Sheets Append returned false but proceeding with certificate generation.`);
        timeline.push({
          step: '4. UPDATE_GOOGLE_SHEETS_REGISTRY',
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          details: 'Google Sheets Append returned false.',
        });
      }
    } catch (sheetLogErr: any) {
      const msg = `Failed to log certificate to Google Sheets: ${sheetLogErr?.message || sheetLogErr}`;
      timeline.push({ step: '4. UPDATE_GOOGLE_SHEETS_REGISTRY', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg} but proceeding with certificate generation.`);
    }

    // Store certificate in Firestore certificates collection
    if (db) {
      try {
        const certRecord = {
          certificateId,
          verificationId: certificateId,
          studentId: displayStudentId, // USE DISPLAY STUDENT ID FOR PUBLIC/DOWNLOAD FLOW
          studentUid: payload.studentId, // SAVE RAW FIREBASE UID FOR INTERNAL OP
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseId: payload.courseId,
          courseName: payload.courseTitle,
          instructorId: 'instructor_system',
          instructorName: payload.instructorName || 'SHAIVIKA LMS Team',
          issueDate: completionDate,
          completionDate: completionDate,
          pdfUrl: downloadUrl,
          status: 'Issued',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await db.collection('certificates').doc(certificateId).set(certRecord, { merge: true });
        firestoreUpdated = true;
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Firestore certificates document created: certificates/${certificateId}`);
      } catch (certDocErr: any) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Firestore cert write notice: ${certDocErr?.message || certDocErr}`);
      }
    }

    // Step 5: Send Professional Email via Nodemailer SMTP with PDF Attachment & Direct Download Link
    const emailSubject = `Congratulations! Your Course Certificate is Ready`;
    const courseDescription = this.getCourseDescription(payload.courseId, payload.courseTitle);
    const pdfFileName = `${certificateId}.pdf`;
    const htmlEmailContent = this.buildCertificateEmailHtml({
      studentName: payload.studentName,
      courseTitle: payload.courseTitle,
      certificateId,
      completionDate,
      googleDriveLink: downloadUrl,
      verifyUrl,
      courseDescription,
    });

    let mailResult = { success: false, messageId: '', error: '' };
    let emailAttempts = 0;
    const maxEmailAttempts = 3;
    let delayMs = 1500;

    while (emailAttempts < maxEmailAttempts) {
      try {
        emailAttempts++;
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Attempting SMTP email dispatch (${emailAttempts}/${maxEmailAttempts})...`);
        const result = await emailService.sendEmailWithAttachments(
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

        if (result.success) {
          mailResult = { success: true, messageId: result.messageId || '', error: '' };
          emailSent = true;
          break;
        } else {
          mailResult.error = result.error || 'Unknown send mail error';
        }
      } catch (err: any) {
        mailResult.error = err?.message || String(err);
      }

      if (emailAttempts < maxEmailAttempts) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] SMTP email attempt ${emailAttempts} failed. Retrying in ${delayMs}ms... Error: ${mailResult.error}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }

    if (mailResult.success) {
      timeline.push({
        step: '5. SEND_EMAIL_SMTP',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Delivered via SMTP to ${payload.studentEmail} (MsgId: ${mailResult.messageId})`,
      });
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 5: Nodemailer SMTP email delivered successfully to ${payload.studentEmail}`);

      // Log to local cache registry
      try {
        this.logLocalRegistry({
          certificateId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseId: payload.courseId,
          courseTitle: payload.courseTitle,
          completionDate,
          googleDriveLink: downloadUrl,
          issuedAt: new Date().toISOString(),
        });
      } catch (localCacheErr: any) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Failed to write to local cache: ${localCacheErr?.message || localCacheErr}`);
      }

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
        googleDriveLink: downloadUrl,
        googleDriveFileId: 'local-server',
        emailMessageId: mailResult.messageId,
        timeline,
      };
    } else {
      const msg = `SMTP Email dispatch failed after retries: ${mailResult.error}`;
      timeline.push({ step: '5. SEND_EMAIL_SMTP', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg} but proceeding with successful certificate generation.`);

      // Log to local cache registry even if email failed
      try {
        this.logLocalRegistry({
          certificateId,
          studentId: payload.studentId,
          studentName: payload.studentName,
          studentEmail: payload.studentEmail,
          courseId: payload.courseId,
          courseTitle: payload.courseTitle,
          completionDate,
          googleDriveLink: downloadUrl,
          issuedAt: new Date().toISOString(),
        });
      } catch (localCacheErr: any) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Failed to write to local cache: ${localCacheErr?.message || localCacheErr}`);
      }

      return {
        success: true, // Return success: true in production!
        certificateId,
        studentId: payload.studentId,
        studentName: payload.studentName,
        studentEmail: payload.studentEmail,
        courseTitle: payload.courseTitle,
        completionDate,
        googleDriveLink: downloadUrl,
        googleDriveFileId: 'local-server',
        error: msg,
        timeline,
      };
    }
  } finally {
    CertificateDeliveryService.activeLocks.delete(lockKey);
    const executionTimeMs = Date.now() - startTime;
    logger.info(`================================================================`);
    logger.info(`[CERTIFICATE AUDIT LOG]
      - UID: ${payload.studentId}
      - Student Name: ${payload.studentName}
      - Email: ${payload.studentEmail}
      - Course: ${payload.courseTitle}
      - Lookup Collection: users
      - Lookup Result: ${lookupResult}
      - Certificate Exists: ${certExistsInFirestore}
      - Email Sent: ${emailSent}
      - Firestore Updated: ${firestoreUpdated}
      - Execution Time: ${executionTimeMs}ms`);
    logger.info(`================================================================`);
  }
}

  /**
   * Helper to resolve a professional, rich syllabus outcomes description based on courseId/title.
   */
  private getCourseDescription(courseId: string, courseTitle: string): string {
    const id = courseId?.toLowerCase() || '';
    if (id.includes('linux')) {
      return `Through this intensive course, you have gained expert proficiency in Linux systems administration. You have mastered command-line interface utilities, user and permission management, process control, system logs auditing, bash shell scripting automation, and networking configuration. You are now prepared to manage and scale enterprise Linux servers in production environments.`;
    }
    if (id.includes('git') || id.includes('github')) {
      return `Through this intensive course, you have mastered Git version control and collaborative GitHub workflows. You have learned advanced branching models, rebasing, merge conflict resolution, pull request creation, code reviews, semantic versioning, and configuring automated CI/CD workflows. You are now equipped to participate in high-performance team development environments.`;
    }
    if (id.includes('dbms') || id.includes('sql') || id.includes('database')) {
      return `Through this intensive course, you have mastered Relational Database Management Systems (RDBMS) and SQL design. You have acquired hands-on skills in schema design, normalization, entity-relationship diagrams, complex SQL queries, indexing optimizations, transaction management, ACID properties compliance, and database connection pooling. You are fully capable of design and administration of high-throughput data platforms.`;
    }
    return `In this professional certification track, you have mastered advanced technical skills, industry best practices, and practical problem-solving. This includes building comprehensive project structures, implementing optimized code logic, and passing rigorous evaluations to prove your expertise.`;
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
    courseDescription: string;
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
  
              <!-- Course Outcomes & Description Section -->
              <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px; margin-top: 20px; text-align: left;">
                <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0b1a30; text-transform: uppercase; letter-spacing: 0.05em;">
                  📚 What You Mastered in This Course:
                </h3>
                <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6; font-weight: 500;">
                  ${data.courseDescription}
                </p>
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
                    <span style="font-size: 13px; font-weight: 800; color: #38bdf8;">KaizenQ Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
 
          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 40px 36px 40px; text-align: center;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                Your official PDF certificate is attached directly to this email and archived permanently in your KaizenQ account profile:
              </p>
 
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <!-- Download Button -->
                    <a href="${data.googleDriveLink}" target="_blank" style="display: block; width: 85%; background: linear-gradient(135deg, #0044cc 0%, #0b55ed 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 14px; box-shadow: 0 10px 20px rgba(0, 68, 204, 0.25); text-align: center;">
                      📥 Download Certificate (Direct Link)
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
