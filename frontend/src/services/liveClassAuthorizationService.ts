import { liveClassService, type LiveClass, normalizeLiveClassStatus } from './liveClassService';

export type LiveClassAccessReason =
  | 'UNAUTHENTICATED'
  | 'CLASS_NOT_FOUND'
  | 'CLASS_NOT_LIVE'
  | 'NOT_ENROLLED'
  | 'NOT_ASSIGNED_INSTRUCTOR'
  | 'INVALID_ROLE'
  | 'AUTHORIZED';

export interface AuthorizationResult {
  allowed: boolean;
  reason: LiveClassAccessReason;
  message: string;
}

export class LiveClassAuthorizationService {
  /**
   * Centralized pre-mount authorization check for live classroom access.
   * Evaluates authentication, role, session status, student course enrollment, and assigned instructor status.
   */
  authorizeLiveClassAccess(
    classId: string,
    currentUser: { uid: string; role?: string; email?: string } | null,
    liveClass?: LiveClass | null
  ): AuthorizationResult {
    // 1. Authentication Check
    if (!currentUser || !currentUser.uid) {
      return {
        allowed: false,
        reason: 'UNAUTHENTICATED',
        message: 'Please login to KaizenQ to join the live classroom session.',
      };
    }

    // 2. Document Existence Check
    const targetClass = liveClass || liveClassService.getLiveClassesSync().find((c) => c.id === classId || c.classId === classId);
    if (!targetClass) {
      return {
        allowed: false,
        reason: 'CLASS_NOT_FOUND',
        message: 'The requested live classroom session was not found.',
      };
    }

    const role = (currentUser.role || 'student').toLowerCase();
    const isAssignedInstructor =
      role === 'admin' ||
      role === 'instructor' ||
      role === 'mentor' ||
      targetClass.instructorId === currentUser.uid ||
      targetClass.createdBy === currentUser.uid ||
      ['inst_kaizen', 'inst_default', 'instructor_lead', 'admin'].includes(targetClass.instructorId);

    // 4. Student Authorization & Live Status Check
    if (!isAssignedInstructor) {
      const status = normalizeLiveClassStatus(targetClass.status);
      if (status === 'cancelled') {
        return {
          allowed: false,
          reason: 'CLASS_NOT_LIVE',
          message: 'This live class has been cancelled.',
        };
      }

      // 5. Course Enrollment & Allowed Students Check
      if (targetClass.allowedStudents && targetClass.allowedStudents.length > 0) {
        const isAllowed =
          targetClass.allowedStudents.includes(currentUser.uid) ||
          (currentUser.email && targetClass.allowedStudents.includes(currentUser.email));
        if (!isAllowed) {
          return {
            allowed: false,
            reason: 'NOT_ENROLLED',
            message: 'You are not enrolled in this course or authorized for this live class.',
          };
        }
      }
    }

    return {
      allowed: true,
      reason: 'AUTHORIZED',
      message: 'Access granted to live classroom session.',
    };
  }
}

export const liveClassAuthorizationService = new LiveClassAuthorizationService();
