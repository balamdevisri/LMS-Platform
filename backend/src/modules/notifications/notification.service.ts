import { NotificationRepository, IDurableNotification } from './notification.repository';
import { db, isFirebaseAdminInitialized } from '../../firebase';
import logger from '../../config/logger';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  /**
   * Resolve eligible student user IDs for a live class.
   * Priority:
   * 1. If liveClass.allowedStudents is defined and not empty, use explicit attendee whitelist.
   * 2. If liveClass has courseId, query enrollments for that courseId.
   * 3. Fallback: all active students in the system.
   */
  public async resolveEligibleStudents(liveClass: any): Promise<string[]> {
    const studentIds = new Set<string>();

    if (!isFirebaseAdminInitialized()) {
      return Array.from(studentIds);
    }

    try {
      // 1. Explicitly whitelisted participants
      if (liveClass.allowedStudents && Array.isArray(liveClass.allowedStudents) && liveClass.allowedStudents.length > 0) {
        for (const sid of liveClass.allowedStudents) {
          if (typeof sid === 'string' && sid.trim()) {
            studentIds.add(sid.trim());
          }
        }
        if (studentIds.size > 0) {
          logger.info(`[LIVE_CLASS_NOTIFICATION] Resolved ${studentIds.size} students from allowedStudents whitelist.`);
          return Array.from(studentIds);
        }
      }

      const courseId = liveClass.courseId;

      // 2. Query enrolled students for the course
      if (courseId && courseId.trim().length > 0) {
        try {
          const snap1 = await db.collection('enrollments')
            .where('courseId', '==', courseId.trim())
            .get();

          snap1.docs.forEach((d) => {
            const data = d.data();
            const sid = data.userId || data.studentId || data.uid;
            const status = (data.status || 'active').toLowerCase();
            if (sid && status !== 'cancelled' && status !== 'dropped') {
              studentIds.add(String(sid).trim());
            }
          });
        } catch (e: any) {
          logger.warn(`[LIVE_CLASS_NOTIFICATION] Notice querying enrollments for course ${courseId}: ${e?.message}`);
        }
      }

      // 3. If no specific course enrollments found, or general class, notify active platform students
      if (studentIds.size === 0) {
        try {
          const usersSnap = await db.collection('users')
            .where('role', '==', 'student')
            .limit(1000)
            .get();

          usersSnap.docs.forEach((d) => {
            studentIds.add(d.id.trim());
          });
        } catch (e: any) {
          logger.warn(`[LIVE_CLASS_NOTIFICATION] Notice querying platform students: ${e?.message}`);
        }
      }
    } catch (err: any) {
      logger.error('[LIVE_CLASS_NOTIFICATION] Error resolving eligible students:', err?.message || err);
    }

    return Array.from(studentIds);
  }

  /**
   * Dispatch idempotent live class notifications to all eligible students:
   * 1. Deterministic doc ID: notif_live_<liveClassId>_<eventType>_<studentId>
   * 2. Persists durable document in Firestore notifications collection.
   * 3. Emits real-time event to socket room: user:<studentId>
   */
  public async dispatchLiveClassNotification(
    liveClass: any,
    eventType: 'PUBLISHED' | 'STARTED' | 'SCHEDULED',
    io?: any
  ): Promise<{ created: number; eligible: number }> {
    const classId = liveClass?.id || liveClass?.classId;
    if (!classId) {
      logger.warn('[LIVE_CLASS_NOTIFICATION] Aborted: Missing liveClassId');
      return { created: 0, eligible: 0 };
    }

    const title = liveClass.title || 'Live Engineering Masterclass';
    const instructorName = liveClass.instructorName || liveClass.instructor?.name || 'Assigned Instructor';
    const courseName = liveClass.courseName || 'Course Program';
    const startTimeStr = liveClass.startTime || liveClass.scheduledAt || new Date().toISOString();

    const notifTitle = eventType === 'STARTED'
      ? `🔴 Live Class Started: ${title}`
      : `📅 Live Class Scheduled: ${title}`;

    const notifDesc = eventType === 'STARTED'
      ? `${instructorName} started the live interactive session for ${courseName}. Join now!`
      : `Assigned Instructor: ${instructorName} • ${courseName}. Scheduled for ${new Date(startTimeStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${new Date(startTimeStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}.`;

    const meetingLink = liveClass.meetingUrl || `/live-classroom/room/${classId}`;

    // Resolve eligible audience
    const eligibleStudentIds = await this.resolveEligibleStudents(liveClass);
    logger.info(`[LIVE_CLASS_NOTIFICATION] liveClassId=${classId} event=${eventType} eligibleStudents=${eligibleStudentIds.length}`);

    const nowIso = new Date().toISOString();
    const notificationsToSave: IDurableNotification[] = [];

    // Also prepare a broadcast notification for global feeds (role: student or all)
    const globalBroadcastId = `notif_live_${classId}_${eventType}_global`;
    const globalNotif: IDurableNotification = {
      id: globalBroadcastId,
      type: 'live_class',
      title: notifTitle,
      desc: notifDesc,
      message: `${instructorName} started ${title}`,
      time: 'Just now',
      read: false,
      priority: 'high',
      createdAt: nowIso,
      link: meetingLink,
      recipientId: 'global',
      recipientRole: 'student',
      liveClassId: classId,
      courseId: liveClass.courseId,
      instructorId: liveClass.instructorId,
    };
    notificationsToSave.push(globalNotif);

    // Build deterministic notifications for each eligible student
    for (const studentId of eligibleStudentIds) {
      const deterministicId = `notif_live_${classId}_${eventType}_${studentId}`;
      notificationsToSave.push({
        id: deterministicId,
        type: 'live_class',
        title: notifTitle,
        desc: notifDesc,
        message: `${instructorName} started ${title}`,
        time: 'Just now',
        read: false,
        priority: 'high',
        createdAt: nowIso,
        link: meetingLink,
        recipientId: studentId,
        recipientRole: 'student',
        liveClassId: classId,
        courseId: liveClass.courseId,
        instructorId: liveClass.instructorId,
      });
    }

    // Persist durably in Firestore using batch chunking
    const savedCount = await this.notificationRepository.batchSaveNotifications(notificationsToSave);
    logger.info(`[LIVE_CLASS_NOTIFICATION] liveClassId=${classId} persisted=${savedCount}`);

    // Realtime delivery via Socket.IO
    if (io) {
      // 1. Send targeted notification to each online student's user room
      for (const studentId of eligibleStudentIds) {
        const studentPayload = {
          id: `notif_live_${classId}_${eventType}_${studentId}`,
          type: 'live_class',
          title: notifTitle,
          desc: notifDesc,
          time: 'Just now',
          read: false,
          priority: 'high',
          createdAt: nowIso,
          link: meetingLink,
          recipientId: studentId,
          recipientRole: 'student',
          liveClassId: classId,
          courseId: liveClass.courseId,
          instructorId: liveClass.instructorId,
        };

        io.to(`user:${studentId}`).emit('notification:new', studentPayload);
      }

      // 2. Broadcast class scheduled/started events to namespace for real-time widgets
      if (eventType === 'STARTED') {
        io.emit('live_class_started', { liveClassId: classId, liveClass });
        io.to(`live-class:${classId}`).emit('live_class_started', { liveClassId: classId, liveClass });
      } else {
        io.emit('live_class_scheduled', { liveClassId: classId, liveClass });
        io.emit('liveClass:published', { liveClassId: classId, liveClass });
      }

      logger.info(`[LIVE_CLASS_NOTIFICATION] Realtime events emitted via Socket.IO for ${classId}`);
    }

    return { created: savedCount, eligible: eligibleStudentIds.length };
  }
}

export const notificationService = new NotificationService();
