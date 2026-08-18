import fs from 'fs';
import path from 'path';
import logger from '../../config/logger';
import { env } from '../../config/env';
import { emailService } from '../email/EmailService';
import { googleDriveService } from '../googleDrive.service';
import { googleSlidesService } from './GoogleSlidesService';
import { qrCodeService } from './QRCodeService';
import { googleSheetsService } from './GoogleSheetsService';
import { db } from '../../firebase';
import { CourseService } from '../course/CourseService';
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
  public async validateStudentEligibility(studentId: string, courseId: string): Promise<{ eligible: boolean; error?: string; details?: any; lookupResult?: string; expectedModules?: any[]; expectedLessons?: any[] }> {
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
    const courseDoc = await this.resolveCourseDoc(courseId);
    if (!courseDoc || !courseDoc.exists) {
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
    let progressDoc = await studentProgressCollection().doc(`${studentId}_${courseId}`).get();
    if (!progressDoc.exists) {
      progressDoc = await studentProgressCollection().doc(`${studentId}_${courseDoc.id}`).get();
    }
    if (!progressDoc.exists) {
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Progress record not found for student ${studentId} in course ${courseId}.`);
      return { eligible: false, error: 'Student is not enrolled or progress record is missing.', lookupResult };
    }
    const progressData = progressDoc.data() as StudentProgressDoc;
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Student is enrolled.`);

    // 4. Validate Progress is 100%
    let expectedModules: any[] = [];
    let expectedLessons: any[] = [];

    if (db) {
      try {
        const modulesSnap = await db.collection('modules')
          .where('courseId', '==', courseDoc.id)
          .get();
        const lessonsSnap = await db.collection('lessons')
          .where('courseId', '==', courseDoc.id)
          .get();

        if (!modulesSnap.empty) {
          expectedModules = modulesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

          let rawLessons = lessonsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // React JS Complete Course filtering for the 15 canonical lessons
          if (courseDoc.id === 'react-js-complete-course') {
            rawLessons = rawLessons.filter((l: any) => l.id.endsWith('-notes'));
          } else if (courseDoc.id === 'kubernetes-complete-course-beginner-to-advanced') {
            // Kubernetes Complete Course canonical lessons (22 lessons)
            const k8sCanonicalLessonIds = [
              'k8s-unit-1-1', 'k8s-unit-1-2', 'k8s-unit-1-3',
              'k8s-unit-2-1', 'k8s-unit-2-2',
              'k8s-unit-3-1', 'k8s-unit-3-2',
              'k8s-unit-4-1', 'k8s-unit-4-2',
              'k8s-unit-5-1', 'k8s-unit-5-2',
              'k8s-unit-6-1',
              'k8s-unit-7-1',
              'k8s-unit-8-1',
              'k8s-unit-9-1',
              'k8s-unit-10-1',
              'k8s-unit-11-1',
              'k8s-unit-12-1',
              'k8s-unit-13-1',
              'k8s-unit-14-1',
              'k8s-unit-15-1', 'k8s-unit-15-2'
            ];
            rawLessons = rawLessons.filter((l: any) => k8sCanonicalLessonIds.includes(String(l.id)));
          } else if (courseDoc.id === 'git-github-mastery-course-id') {
            // Resolve canonical lesson/module IDs dynamically from the actual course structure
            const canonicalLessonIds = new Set<string>();
            const canonicalModuleIds = new Set<string>();
            if (courseData && Array.isArray(courseData.modules)) {
              courseData.modules.forEach((mod: any) => {
                if (mod.id) canonicalModuleIds.add(String(mod.id));
                if (Array.isArray(mod.lessons)) {
                  mod.lessons.forEach((l: any) => {
                    if (l.id) canonicalLessonIds.add(String(l.id));
                  });
                } else if (Array.isArray(mod.topics)) {
                  mod.topics.forEach((topic: any) => {
                    if (Array.isArray(topic.learningUnits)) {
                      topic.learningUnits.forEach((unit: any) => {
                        const uid = unit.id || unit.unitId;
                        if (uid) canonicalLessonIds.add(String(uid));
                      });
                    }
                  });
                }
              });
            }
            logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Dynamically resolved ${canonicalLessonIds.size} canonical Git lessons and ${canonicalModuleIds.size} canonical modules.`);
            rawLessons = rawLessons.filter((l: any) => canonicalLessonIds.has(String(l.id)));
            expectedModules = expectedModules.filter((m: any) => canonicalModuleIds.has(String(m.id)));
          }

          rawLessons.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

          expectedLessons = rawLessons.map((les: any) => ({
            id: les.id,
            title: les.title,
            type: les.type || 'reading',
            quizPassingScore: les.quizPassingScore,
            moduleId: les.moduleId,
          }));
        }
      } catch (err) {
        logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] Failed to query modules/lessons from Firestore collections: ${err}`);
      }
    }

    // Fallback if collections query didn't return any modules/lessons
    if (expectedModules.length === 0 && Array.isArray(courseData.modules)) {
      expectedModules = courseData.modules;
      courseData.modules.forEach((mod: any) => {
        if (Array.isArray(mod.lessons) && mod.lessons.length > 0) {
          expectedLessons.push(...mod.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type || 'reading',
            quizPassingScore: l.quizPassingScore,
          })));
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
    const incompleteLessons = expectedLessons.filter(l => !completedLessons.includes(String(l.id)));
    
    // Debug logging for canonical lesson checking
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Canonical lesson IDs being checked: ${expectedLessons.map(l => l.id).join(', ')}`);
    if (incompleteLessons.length > 0) {
      logger.info(`[AUTOMATED CERTIFICATE VALIDATION] Genuinely incomplete lesson IDs: ${incompleteLessons.map(l => l.id).join(', ')}`);
    }

    const allLessonsDone = expectedLessons.length > 0 && incompleteLessons.length === 0;
    if (!allLessonsDone) {
      const incompleteIds = incompleteLessons.map(l => l.id).join(', ');
      logger.warn(`[AUTOMATED CERTIFICATE VALIDATION] ❌ Student has not completed all required lessons. Incomplete: ${incompleteIds}`);
      return { eligible: false, error: `Not all required lessons are completed. Incomplete: ${incompleteIds}`, lookupResult };
    }
    logger.info(`[AUTOMATED CERTIFICATE VALIDATION] ✓ Every required lesson is completed.`);

    const completedModules = progressData.completedModules || [];
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
    expectedLessons.forEach((lesson: any) => {
      const typeLower = (lesson.type || '').toLowerCase();
      if (typeLower === 'quiz') quizUnits.push(lesson);
      else if (typeLower === 'assignment') assignmentUnits.push(lesson);
    });

    for (const quiz of quizUnits) {
      const courseIdsToCheck = Array.from(new Set([courseId, courseDoc.id]));
      const attemptsSnap = await quizAttemptsCollection()
        .where('studentId', '==', studentId)
        .where('courseId', 'in', courseIdsToCheck)
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

    return { eligible: true, lookupResult, expectedModules, expectedLessons };
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

      const resolvedCourse = await this.resolveCourseDoc(payload.courseId);
      const courseDocId = resolvedCourse ? resolvedCourse.id : payload.courseId;
      const courseIdsToCheck = Array.from(new Set([payload.courseId, courseDocId]));

      let existingCert: any = null;
      let certExists = false;

      if (db) {
        try {
          const certQuery = await db.collection('certificates')
            .where('studentUid', '==', payload.studentId)
            .where('courseId', 'in', courseIdsToCheck)
            .get();
          
          if (!certQuery.empty) {
            existingCert = certQuery.docs[0].data();
            certExists = true;
            certExistsInFirestore = true;
          }
        } catch (certCheckErr: any) {
          logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Firestore cert precheck notice: ${certCheckErr?.message}`);
        }
      }

      // Check if email was already sent successfully for this certificate (idempotency checks)
      const emailAlreadySent = existingCert && existingCert.emailStatus === 'Sent' && existingCert.emailMessageId;

      if (emailAlreadySent && !isForce) {
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] ⚠️ Certificate and email delivery already exist for ${payload.studentEmail} in course ${payload.courseId}. Skipping generation.`);
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
          emailMessageId: existingCert.emailMessageId,
          timeline,
        };
      }

      // If certificate exists but email failed/needs retry, we reuse the existing certificate ID
      let certificateId = '';
      if (existingCert) {
        certificateId = existingCert.certificateId;
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] 🔄 Found existing certificate ID ${certificateId} for ${payload.studentEmail} without confirmed email delivery. Retrying delivery.`);
      } else {
        // Fallback checks to local/sheets if not in Firestore yet
        const localExisting = this.isAlreadyIssued(payload.studentEmail, payload.courseId) ||
                              this.isAlreadyIssued(payload.studentEmail, courseDocId);
        if (localExisting) {
          certificateId = localExisting.certificateId;
        } else {
          try {
            const sheetExisting = await googleSheetsService.checkCertificateExists(payload.studentEmail, payload.courseId) ||
                                  await googleSheetsService.checkCertificateExists(payload.studentEmail, courseDocId);
            if (sheetExisting) {
              certificateId = sheetExisting.certificateId;
            }
          } catch (sheetCheckErr: any) {
            logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Sheet precheck search failed/skipped: ${sheetCheckErr?.message || sheetCheckErr}`);
          }
        }
      }

      // Step 1: Generate Deterministic Globally Unique Certificate ID if not already resolved
      if (!certificateId) {
        certificateId = payload.verificationId || await this.generateGloballyUniqueId(payload.courseId);
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 1: Generated Unique Certificate ID -> ${certificateId}`);
      } else {
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 1: Reusing existing Certificate ID -> ${certificateId}`);
      }

      const completionDate = existingCert?.completionDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const rawUid = payload.studentId || 'default_student';
      const displayStudentId = rawUid.startsWith('STU-') ? rawUid : `STU-${rawUid.substring(0, 6).toUpperCase()}`;

      timeline.push({
        step: '1. GENERATE_CERTIFICATE_ID',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Reused/Generated ID: ${certificateId}`,
      });

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
      let dynamicStudentName = payload.studentName;
      let dynamicStudentEmail = payload.studentEmail;
      let dynamicCourseTitle = payload.courseTitle;
      let dynamicCourseDuration = payload.courseDuration || '24 Hours';
      let actualModulesCount = payload.modulesCount || 8;

      if (db) {
        try {
          const studentDoc = await db.collection('users').doc(payload.studentId).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data();
            if (studentData) {
              dynamicStudentName = studentData.fullName || studentData.name || studentData.displayName || payload.studentName;
              dynamicStudentEmail = studentData.email || payload.studentEmail;
            }
          }
          
          const courseDoc = await this.resolveCourseDoc(payload.courseId);
          if (courseDoc && courseDoc.exists) {
            const courseData = courseDoc.data();
            if (courseData) {
              dynamicCourseTitle = courseData.title || payload.courseTitle;
              dynamicCourseDuration = courseData.duration || payload.courseDuration || '24 Hours';
              
              let count = 0;
              if (valResult.expectedModules && valResult.expectedModules.length > 0) {
                count = valResult.expectedModules.length;
              } else if (Array.isArray(courseData.modules) && courseData.modules.length > 0) {
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
        } catch (dbErr) {
          logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Failed to fetch student/course Firestore data: ${dbErr}`);
        }
      }

      // Calculate achievement score from quiz attempts dynamically
      let dynamicAchievement = 'Outstanding Achievement';
      if (db) {
        try {
          const quizAttempts = await quizAttemptsCollection()
            .where('studentId', '==', payload.studentId)
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
          logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Failed to calculate quiz scores: ${qErr}`);
        }
      }

      pdfBuffer = await googleSlidesService.generateCertificateFromTemplate({
        certificateId,
        studentId: displayStudentId,
        studentName: dynamicStudentName,
        courseTitle: cleanCourseTitleForCertificate(dynamicCourseTitle),
        instructorName: payload.instructorName || 'Shaivika Groups Board',
        completionDate,
        courseDuration: dynamicCourseDuration,
        modulesCount: actualModulesCount,
        achievement: dynamicAchievement,
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

    // Step 4: Send Professional Email via Nodemailer SMTP with PDF Attachment & Direct Download Link
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

    const emailStatus = emailSent ? 'Sent' : 'Failed';

    if (emailSent) {
      timeline.push({
        step: '5. SEND_EMAIL_SMTP',
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        details: `Delivered via SMTP to ${payload.studentEmail} (MsgId: ${mailResult.messageId})`,
      });
      logger.info(`[AUTOMATED CERTIFICATE SYSTEM] SMTP email delivered successfully to ${payload.studentEmail}`);
    } else {
      const msg = `SMTP Email dispatch failed after retries: ${mailResult.error}`;
      timeline.push({ step: '5. SEND_EMAIL_SMTP', status: 'FAILED', timestamp: new Date().toISOString(), details: msg });
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg}`);
    }

    // Step 5: Log Certificate to Google Sheet Registry with correct email status
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
        emailStatus,
        generatedTimestamp: new Date().toISOString(),
      });

      if (sheetLogged) {
        timeline.push({
          step: '4. UPDATE_GOOGLE_SHEETS_REGISTRY',
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          details: `Logged to Google Sheets Registry (Email Status: ${emailStatus}).`,
        });
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Step 5: Certificate logged to Google Sheet Registry successfully.`);
      } else {
        logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ Google Sheets Append returned false but proceeding.`);
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
      logger.error(`[AUTOMATED CERTIFICATE SYSTEM] ❌ ${msg} but proceeding.`);
    }

    // Store certificate in Firestore certificates collection
    if (db) {
      try {
        const certRecord: any = {
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
          emailStatus,
          updatedAt: new Date().toISOString(),
        };

        if (!certExistsInFirestore) {
          certRecord.createdAt = new Date().toISOString();
        }

        if (emailSent && mailResult.messageId) {
          certRecord.emailMessageId = mailResult.messageId;
        }

        await db.collection('certificates').doc(certificateId).set(certRecord, { merge: true });
        firestoreUpdated = true;
        logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Firestore certificates document updated: certificates/${certificateId}`);
      } catch (certDocErr: any) {
        logger.warn(`[AUTOMATED CERTIFICATE SYSTEM] Firestore cert write notice: ${certDocErr?.message || certDocErr}`);
      }
    }

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

    logger.info(`[AUTOMATED CERTIFICATE SYSTEM] Returning response payload to controller: ${JSON.stringify({
      success: true,
      certificateId,
      googleDriveLink: downloadUrl,
    })}`);

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

export function cleanCourseTitleForCertificate(title: string): string {
  if (!title) return '';
  let cleaned = title;
  
  // Remove patterns like " - Complete Course - Beginner to Advanced", " - Beginner to Advanced", etc.
  // Using a regex that handles standard hyphen (-), en-dash (–), and em-dash (—)
  cleaned = cleaned.replace(/\s*[-–—:]\s*(Complete\s+Course\s*[-–—]\s*)?Beginner\s+to\s+Advanced/gi, '');
  cleaned = cleaned.replace(/\s*[-–—:]\s*(Complete\s+Course\s*[-–—]\s*)?Beginner/gi, '');
  cleaned = cleaned.replace(/\s*[-–—:]\s*(Complete\s+Course\s*[-–—]\s*)?Advanced/gi, '');
  
  // Also handle parenthesized variants: "(Beginner to Advanced)", "(Beginner)", "(Advanced)"
  cleaned = cleaned.replace(/\s*\((Complete\s+Course\s*[-–—]\s*)?Beginner\s+to\s+Advanced\)/gi, '');
  cleaned = cleaned.replace(/\s*\((Complete\s+Course\s*[-–—]\s*)?Beginner\)/gi, '');
  cleaned = cleaned.replace(/\s*\((Complete\s+Course\s*[-–—]\s*)?Advanced\)/gi, '');

  // Handle standalone suffix cases with trailing spaces or separators
  cleaned = cleaned.replace(/\s*[-–—]\s*$/g, '');
  cleaned = cleaned.trim();
  return cleaned;
}
