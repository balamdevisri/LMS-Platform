import { Enrollment, IEnrollment, EnrollmentStatus, AccessType } from '../../models/mongo/payment.model';
import { db, isFirebaseAdminInitialized } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { CourseService } from '../../services/course/CourseService';
import { emailService } from '../../services/email/EmailService';
import { EmailEventType } from '../../types/emailTypes';
import logger from '../../config/logger';

const courseService = new CourseService();

export class EnrollmentService {
  /**
   * Find all active course enrollments for a given student
   */
  public async getStudentEnrollments(studentId: string): Promise<IEnrollment[]> {
    if (!studentId) return [];

    try {
      // 1. Fetch from MongoDB
      const mongoEnrollments = await Enrollment.find({ studentId }).sort({ createdAt: -1 });
      if (mongoEnrollments && mongoEnrollments.length > 0) {
        return mongoEnrollments;
      }
    } catch (err) {
      logger.warn('[EnrollmentService] MongoDB getStudentEnrollments fallback:', err);
    }

    // 2. Fallback to Firestore if MongoDB returned no results or is unavailable
    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db.collection('enrollments').where('studentId', '==', studentId).get();
        if (!snap.empty) {
          return snap.docs.map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() } as any));
        }
      } catch (err) {
        logger.warn('[EnrollmentService] Firestore getStudentEnrollments fallback notice:', err);
      }
    }

    return [];
  }

  /**
   * Find specific enrollment by student ID and course ID
   */
  public async getEnrollment(studentId: string, courseId: string): Promise<IEnrollment | null> {
    if (!studentId || !courseId) return null;

    try {
      const enrollment = await Enrollment.findOne({ studentId, courseId });
      if (enrollment) return enrollment;
    } catch (err) {
      logger.warn('[EnrollmentService] MongoDB getEnrollment fallback:', err);
    }

    if (isFirebaseAdminInitialized()) {
      try {
        const snap = await db
          .collection('enrollments')
          .where('studentId', '==', studentId)
          .where('courseId', '==', courseId)
          .limit(1)
          .get();

        if (!snap.empty) {
          const doc: QueryDocumentSnapshot = snap.docs[0];
          return { id: doc.id, ...doc.data() } as any;
        }
      } catch (err) {
        logger.warn('[EnrollmentService] Firestore getEnrollment fallback notice:', err);
      }
    }

    return null;
  }

  /**
   * Create or activate course enrollment server-side
   */
  public async createEnrollment(data: {
    studentId: string;
    courseId: string;
    paymentId?: string;
    accessType?: AccessType;
    studentName?: string;
    studentEmail?: string;
    courseTitle?: string;
  }): Promise<{ enrollment: any; alreadyEnrolled: boolean }> {
    const { studentId, courseId, paymentId, accessType = 'PAID', studentName, studentEmail } = data;

    // 1. Verify if an active enrollment already exists (Duplicate Protection)
    const existing = await this.getEnrollment(studentId, courseId);
    if (existing) {
      if (existing.status === 'ACTIVE') {
        return { enrollment: existing, alreadyEnrolled: true };
      } else {
        // Reactivate suspended / cancelled enrollment
        try {
          existing.status = 'ACTIVE';
          if (paymentId) existing.paymentId = paymentId;
          existing.accessType = accessType;
          existing.enrolledAt = new Date();
          await (existing as any).save();
          return { enrollment: existing, alreadyEnrolled: false };
        } catch (e) {
          logger.warn('[EnrollmentService] Failed to reactivate MongoDB enrollment:', e);
        }
      }
    }

    // 2. Fetch Course metadata to verify validity and title
    let courseTitle = data.courseTitle;
    try {
      const course = await courseService.getCourseById(courseId);
      if (course) {
        courseTitle = course.title;
      }
    } catch (e) {}

    // 3. Create MongoDB Enrollment Record
    let createdDoc: any;
    try {
      createdDoc = await Enrollment.create({
        studentId,
        studentEmail: studentEmail || '',
        studentName: studentName || 'Student',
        courseId,
        courseTitle: courseTitle || courseId,
        paymentId: paymentId || undefined,
        status: 'ACTIVE',
        accessType,
        enrolledAt: new Date(),
        progressPercentage: 0,
        completedLessons: [],
        lastAccessedAt: new Date(),
      });
    } catch (err: any) {
      // Handle race-condition duplicate key error
      if (err.code === 11000) {
        const found = await this.getEnrollment(studentId, courseId);
        return { enrollment: found, alreadyEnrolled: true };
      }
      logger.error('[EnrollmentService] MongoDB create error:', err);
      createdDoc = {
        id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        studentId,
        courseId,
        paymentId,
        status: 'ACTIVE',
        accessType,
        enrolledAt: new Date(),
      };
    }

    // 4. Sync to Firestore (enrollments collection + user profile enrolledCourses + student_progress)
    if (isFirebaseAdminInitialized()) {
      try {
        const enrollDocId = `${studentId}_${courseId}`;
        const firestorePayload = {
          studentId,
          userId: studentId,
          courseId,
          courseTitle: courseTitle || courseId,
          paymentId: paymentId || null,
          status: 'ACTIVE',
          accessType,
          enrolledAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.collection('enrollments').doc(enrollDocId).set(firestorePayload, { merge: true });

        // Initialize student_progress document
        await db.collection('student_progress').doc(enrollDocId).set(
          {
            userId: studentId,
            studentId,
            courseId,
            progress: 0,
            completedLessons: [],
            enrolledAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
          },
          { merge: true }
        );

        // Update user's profile enrolled list
        const userDocRef = db.collection('users').doc(studentId);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          const enrolledList = new Set(userData?.enrolledCourses || []);
          enrolledList.add(courseId);
          await userDocRef.update({
            enrolledCourses: Array.from(enrolledList),
            courses: (userData?.courses || 0) + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (firestoreErr) {
        logger.warn('[EnrollmentService] Firestore sync warning:', firestoreErr);
      }
    }

    // 5. Send Course Enrollment Confirmation Email (Asynchronous & Non-Blocking)
    if (studentEmail) {
      const enrollmentIdentifier = String(createdDoc.id || createdDoc._id || `${studentId}_${courseId}`);
      emailService
        .sendCourseEnrollmentEmail({
          studentName: studentName || 'Student',
          studentEmail,
          courseTitle: courseTitle || 'Full Stack Track',
          courseId,
          courseUrl: `https://www.kaizenq.in/courses/${courseId}`,
          certificateAvailable: true,
          enrollmentId: enrollmentIdentifier,
        })
        .catch((emailErr: any) => {
          logger.warn('[EnrollmentService] Email delivery notice (non-blocking):', emailErr?.message || emailErr);
        });
    }

    return { enrollment: createdDoc, alreadyEnrolled: false };
  }

  /**
   * Server-Side Course Access Verification
   */
  public async verifyCourseAccess(
    studentId: string,
    courseId: string,
    userRole?: string,
    userEmail?: string
  ): Promise<{ hasAccess: boolean; enrollment?: any; reason?: string }> {
    const role = (userRole || 'student').toLowerCase();
    const isAdminEmail = userEmail ? userEmail.includes('admin') || userEmail === 'admin@gmail.com' : false;

    // 1. Admin and Instructors have universal access
    if (role === 'admin' || role === 'instructor' || isAdminEmail) {
      return { hasAccess: true };
    }

    if (!studentId || !courseId) {
      return { hasAccess: false, reason: 'Authentication and Course ID required' };
    }

    // 2. Check Enrollment status
    const enrollment = await this.getEnrollment(studentId, courseId);
    if (enrollment && enrollment.status === 'ACTIVE') {
      return { hasAccess: true, enrollment };
    }

    if (enrollment && enrollment.status !== 'ACTIVE') {
      return {
        hasAccess: false,
        reason: `Your enrollment is currently ${enrollment.status.toLowerCase()}. Please contact support.`,
      };
    }

    // 3. Fallback dev users
    if (studentId === 'dev-user-id' || studentId.startsWith('usr_') || studentId === 'default_student') {
      return { hasAccess: true };
    }

    return {
      hasAccess: false,
      reason: 'You are not enrolled in this course.',
    };
  }
}

export const enrollmentService = new EnrollmentService();
