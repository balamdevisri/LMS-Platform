// ============================================================================
// KAIZENQ LMS — CENTRALIZED ROLE-BASED CLASSROOM PERMISSION ENGINE
// ============================================================================

import type { ClassroomInteractionSettings } from '@/types/liveClassroomSettings';

export type ClassroomRole = 'admin' | 'instructor' | 'mentor' | 'lecturer' | 'student';

export type ClassroomAction =
  | 'publishCamera'
  | 'publishMicrophone'
  | 'screenShare'
  | 'raiseHand'
  | 'createPoll'
  | 'createQuiz'
  | 'publishAnnouncement'
  | 'manageAttendance'
  | 'removeParticipant'
  | 'endClass'
  | 'lockClassroom'
  | 'muteAllStudents'
  | 'manageWhiteboard';

export interface ClassroomUserContext {
  userId: string;
  role?: string;
  isAssignedInstructor?: boolean;
  classSettings?: ClassroomInteractionSettings;
  micPermissionGranted?: boolean;
}

/**
 * Normalizes user role string to canonical ClassroomRole
 */
export const normalizeClassroomRole = (role?: string): ClassroomRole => {
  const normalized = String(role || 'student').trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'instructor') return 'instructor';
  if (normalized === 'mentor') return 'mentor';
  if (normalized === 'lecturer' || normalized === 'host') return 'lecturer';
  return 'student';
};

/**
 * Determines whether a user context has elevated staff/instructor privileges.
 */
export const isStaffOrHost = (ctx: ClassroomUserContext): boolean => {
  const role = normalizeClassroomRole(ctx.role);
  return role === 'admin' || role === 'instructor' || role === 'mentor' || role === 'lecturer' || Boolean(ctx.isAssignedInstructor);
};

/**
 * Centralized, authoritative evaluator for classroom actions.
 * Multi-layer security: evaluated on frontend UI and enforced strictly on backend APIs/sockets.
 */
export const canUserPerformAction = (
  action: ClassroomAction,
  ctx: ClassroomUserContext
): boolean => {
  const isHost = isStaffOrHost(ctx);

  switch (action) {
    case 'screenShare':
      // Students are strictly forbidden from screen sharing at all levels
      return isHost;

    case 'publishCamera':
      if (isHost) return true;
      // For students: check if class settings allow student camera
      return ctx.classSettings?.studentCamera?.enabled ?? false;

    case 'publishMicrophone':
      if (isHost) return true;
      // For students: requires explicit instructor grant
      return Boolean(ctx.micPermissionGranted);

    case 'raiseHand':
      // Configurable in classroom settings
      if (ctx.classSettings && ctx.classSettings.raiseHand) {
        return ctx.classSettings.raiseHand.enabled;
      }
      return true;

    case 'createPoll':
    case 'createQuiz':
    case 'publishAnnouncement':
      // Only instructors, hosts, and admins can create and broadcast interactive items
      return isHost;

    case 'manageAttendance':
    case 'removeParticipant':
    case 'endClass':
    case 'lockClassroom':
    case 'muteAllStudents':
      // Authoritative classroom lifecycle & moderation operations
      return isHost;

    case 'manageWhiteboard':
      return isHost;

    default:
      return false;
  }
};
