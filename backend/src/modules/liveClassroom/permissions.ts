// ============================================================================
// KAIZENQ LMS — BACKEND AUTHORITATIVE CLASSROOM PERMISSION ENGINE
// ============================================================================

export type BackendClassroomRole = 'admin' | 'instructor' | 'mentor' | 'lecturer' | 'student';

export type BackendClassroomAction =
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

export interface BackendClassroomUserContext {
  userId: string;
  role?: string;
  isAssignedInstructor?: boolean;
  classSettings?: any;
  micPermissionGranted?: boolean;
}

/**
 * Normalizes user role string to canonical BackendClassroomRole
 */
export const normalizeBackendClassroomRole = (role?: string): BackendClassroomRole => {
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
export const isStaffOrHost = (ctx: BackendClassroomUserContext): boolean => {
  const role = normalizeBackendClassroomRole(ctx.role);
  return role === 'admin' || role === 'instructor' || role === 'mentor' || role === 'lecturer' || Boolean(ctx.isAssignedInstructor);
};

/**
 * Authoritative backend evaluator for classroom actions across socket events and REST endpoints.
 */
export const canPerformClassroomAction = (
  action: BackendClassroomAction,
  ctx: BackendClassroomUserContext
): boolean => {
  const isHost = isStaffOrHost(ctx);

  switch (action) {
    case 'screenShare':
      // Students are strictly forbidden from screen sharing at all levels
      return isHost;

    case 'publishCamera':
      if (isHost) return true;
      return ctx.classSettings?.studentCamera?.enabled ?? false;

    case 'publishMicrophone':
      if (isHost) return true;
      return Boolean(ctx.micPermissionGranted);

    case 'raiseHand':
      if (ctx.classSettings && ctx.classSettings.raiseHand) {
        return ctx.classSettings.raiseHand.enabled;
      }
      return true;

    case 'createPoll':
    case 'createQuiz':
    case 'publishAnnouncement':
      return isHost;

    case 'manageAttendance':
    case 'removeParticipant':
    case 'endClass':
    case 'lockClassroom':
    case 'muteAllStudents':
    case 'manageWhiteboard':
      return isHost;

    default:
      return false;
  }
};
