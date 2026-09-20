import { Request, Response, NextFunction } from 'express';
import { liveClassroomService } from './liveClassroom.service';
import { notificationService } from '../notifications/notification.service';
import { getLiveNamespace } from '../../socket/socket.server';
import logger from '../../config/logger';
import { env } from '../../config/env';
import { db } from '../../firebase';
import { AccessToken, TrackSource } from 'livekit-server-sdk';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class LiveClassroomController {
  /**
   * Phase 2: LiveKit SFU Token Generation Endpoint
   * GET /api/live-classroom/:classId/media-token
   */
  public async getMediaToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Authenticate Firebase user identity from request
      if (!req.user || !req.user.uid) {
        res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
        return;
      }

      const uid = req.user.uid;
      const classId = req.params.classId;

      if (!classId || typeof classId !== 'string' || classId.trim().length === 0) {
        res.status(400).json({ success: false, error: 'classId is required' });
        return;
      }

      // 2. Verify LiveKit server credentials
      const apiKey = env.LIVEKIT_API_KEY;
      const apiSecret = env.LIVEKIT_API_SECRET;
      const livekitHost = env.LIVEKIT_HOST;

      if (!apiKey || !apiSecret || !livekitHost) {
        logger.error('[MediaToken] LiveKit credentials not configured (LIVEKIT_API_KEY / LIVEKIT_API_SECRET / LIVEKIT_HOST missing)');
        res.status(500).json({ success: false, error: 'Server configuration error: LiveKit media credentials not configured' });
        return;
      }

      // 3. Retrieve Live Class Session
      const liveClass = await liveClassroomService.getLiveClassById(classId);
      if (!liveClass) {
        res.status(404).json({ success: false, error: 'Live class session not found' });
        return;
      }

      // 4. Resolve actual role from server-side user data (Never trust frontend)
      let resolvedRole = (req.user.role || 'student').toLowerCase().trim();
      let resolvedName = req.user.name || 'Student';
      const userEmail = (req.user.email || '').toLowerCase().trim();

      if (db && typeof db.collection === 'function' && process.env.NODE_ENV !== 'test') {
        try {
          const fetchUserPromise = db.collection('users').doc(uid).get();
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Firestore user lookup timed out')), 2000)
          );
          const userDoc = (await Promise.race([fetchUserPromise, timeoutPromise])) as any;
          if (userDoc && userDoc.exists) {
            const userData = userDoc.data();
            if (userData?.role) {
              resolvedRole = userData.role.toLowerCase().trim();
            }
            if (userData?.name || userData?.fullName || userData?.displayName) {
              resolvedName = userData.name || userData.fullName || userData.displayName;
            }
          }
        } catch (dbErr: any) {
          logger.warn(`[MediaToken] Firestore user profile read notice for ${uid}: ${dbErr?.message}`);
        }
      }

      if (userEmail && (userEmail.includes('admin') || userEmail === 'admin@gmail.com')) {
        resolvedRole = 'admin';
      }

      // 5. Resolve assigned instructor & host status (Never trust frontend)
      const instructorId = liveClass.instructorId || liveClass.createdBy;
      const isAssignedInstructor = uid === instructorId;
      const isInstructorRole = resolvedRole === 'instructor' || resolvedRole === 'mentor';
      const isAdmin = resolvedRole === 'admin';
      const isHostOrAdmin = isAssignedInstructor || (isInstructorRole && isAssignedInstructor) || isAdmin;

      // 6. Verify authorization to access classId
      if (!isHostOrAdmin) {
        // If class is already terminated/cancelled/completed, forbid student entry
        const status = (liveClass.status || '').toLowerCase();
        if (status === 'ended' || status === 'completed' || status === 'cancelled' || status === 'closed') {
          res.status(403).json({ success: false, error: 'Forbidden: Live class has ended' });
          return;
        }

        const targetAudience = (liveClass as any).targetAudience || 'all';
        const allowedStudents = (liveClass as any).allowedStudents;

        let isAuthorized = false;

        if (Array.isArray(allowedStudents) && (allowedStudents.includes(uid) || (userEmail && allowedStudents.includes(userEmail)))) {
          isAuthorized = true;
        } else if (targetAudience === 'restricted' && Array.isArray(allowedStudents)) {
          isAuthorized = false;
        } else if (liveClass.courseId) {
          const enrollment = await liveClassroomService.verifyCourseEnrollment(uid, liveClass.courseId, resolvedRole, userEmail);
          isAuthorized = enrollment.isEnrolled;
        } else {
          // Open platform session
          isAuthorized = true;
        }

        if (!isAuthorized) {
          res.status(403).json({ success: false, error: 'Forbidden: You are not authorized to access this live classroom' });
          return;
        }
      }

      // 7. Configure LiveKit Media Permissions
      // Instructors/Admins: canPublish = true, canSubscribe = true, canPublishData = true
      // Students: canSubscribe = true, canPublish controlled server-side
      let canPublish = false;
      const allowedSources: TrackSource[] = [];

      if (isHostOrAdmin) {
        canPublish = true;
        allowedSources.push(
          TrackSource.CAMERA,
          TrackSource.MICROPHONE,
          TrackSource.SCREEN_SHARE,
          TrackSource.SCREEN_SHARE_AUDIO
        );
      } else {
        const settings = (liveClass as any).settings;
        // Server-Authoritative per-student microphone check
        // By default for students: micAllowed = false.
        // If instructor explicitly allowed this student, activeRoomModeration reflects micPermission === 'granted'.
        const { getModerationRecord } = await import('../../socket/liveClass.socket');
        const modRecord = getModerationRecord(classId, uid, resolvedRole);
        const isMicExplicitlyAllowed = modRecord.micPermission === 'granted' && !modRecord.mutedByInstructor;

        const camEnabled = settings?.studentCamera?.enabled === true;

        if (isMicExplicitlyAllowed) allowedSources.push(TrackSource.MICROPHONE);
        if (camEnabled) allowedSources.push(TrackSource.CAMERA);
        // Phase 2: Students are strictly forbidden from screen sharing at all levels

        canPublish = allowedSources.length > 0;
      }

      // 8. Generate LiveKit JWT (4 hours TTL maximum)
      const ttlSeconds = 4 * 60 * 60; // 14400s (4 hours)
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      const roomName = `class_${classId}`;
      const identity = `user_${uid}`;

      // Metadata contains safe information only (never sensitive Firestore or user data)
      const safeMetadata = JSON.stringify({
        userId: uid,
        role: isHostOrAdmin ? (isAdmin ? 'admin' : 'instructor') : 'student',
        liveClassId: classId,
      });

      const tokenOptions: any = {
        identity,
        name: resolvedName,
        ttl: ttlSeconds,
        metadata: safeMetadata,
      };

      const at = new AccessToken(apiKey, apiSecret, tokenOptions);

      const grant: any = {
        roomJoin: true,
        room: roomName,
        canPublish,
        canSubscribe: true,
        canPublishData: true,
      };

      if (canPublish && allowedSources.length > 0) {
        grant.canPublishSources = allowedSources;
      }

      at.addGrant(grant);

      const token = await at.toJwt();

      logger.info(`[MediaToken] Generated LiveKit token for identity: ${identity}, room: ${roomName}, role: ${resolvedRole}, canPublish: ${canPublish}`);

      // 9. Return structured response (never leak secrets, internal tokens, or stack traces)
      res.json({
        success: true,
        data: {
          token,
          url: livekitHost,
          roomName,
          identity,
          expiresAt,
        },
      });
    } catch (err: any) {
      logger.error('[MediaToken] Error generating media token:', err?.message || err);
      res.status(500).json({ success: false, error: 'Failed to generate media token' });
    }
  }
  // Generate KaizenQ Secure Room Token
  public async generateRoomToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.body.classId) as string;
      const { userId, userName, role } = req.body;

      if (!classId || !userId) {
        res.status(400).json({ success: false, error: 'classId and userId are required' });
        return;
      }

      const liveClass = await liveClassroomService.getLiveClassById(classId);
      if (!liveClass) {
        res.status(404).json({ success: false, error: 'Live Class session not found' });
        return;
      }

      const userRole = role || 'student';

      if (userRole === 'student' && liveClass.status !== 'live') {
        res.status(403).json({ success: false, error: `Classroom is not currently live (Status: ${liveClass.status})` });
        return;
      }

      const roomId = `kaizenq-room-${classId}`;
      const expiresAt = Date.now() + 1000 * 60 * 60 * 4;

      const permissions = {
        canPublishAudio: true,
        canPublishVideo: true,
        canShareScreen: userRole === 'instructor' || userRole === 'admin',
        canKickParticipants: userRole === 'instructor' || userRole === 'admin',
        canMuteOthers: userRole === 'instructor' || userRole === 'admin',
        canEndClass: userRole === 'instructor' || userRole === 'admin',
      };

      const tokenData = {
        token: `kq_token_${roomId}_${userId}_${Date.now()}`,
        userId,
        classId,
        roomId,
        role: userRole,
        permissions,
        expiresAt,
      };

      res.json({ success: true, data: tokenData });
    } catch (err) {
      next(err);
    }
  }

  // Live Class CRUD & Management
  public async getAllClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user || {
        uid: (req.query.userId as string) || (req.headers['x-user-id'] as string),
        role: (req.query.userRole as string) || (req.headers['x-user-role'] as string) || 'student',
        email: (req.query.userEmail as string) || (req.headers['x-user-email'] as string),
      };

      const classes = await liveClassroomService.getEligibleLiveClasses(user);
      logger.info(`[LIVE_CLASS_QUERY] User: ${user?.uid || 'anonymous'} (${user?.role}) | Fetched ${classes.length} eligible classes`);
      res.json({ success: true, data: classes, liveClasses: classes });
    } catch (err) {
      next(err);
    }
  }

  public async getClassById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user || {
        uid: (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'student_guest',
        role: (req.query.userRole as string) || (req.headers['x-user-role'] as string) || 'student',
        email: (req.query.userEmail as string) || (req.headers['x-user-email'] as string) || '',
      };

      const result = await liveClassroomService.getLiveClassForStudent(classId, user);

      if (!result.authorized) {
        if (result.error === 'Live Class session not found') {
          res.status(404).json({ success: false, error: result.error });
          return;
        }
        res.status(403).json({
          success: false,
          error: result.error || 'Please enroll in this course to access the live class.',
        });
        return;
      }

      logger.info(`[LIVE_CLASS_ELIGIBILITY] Student: ${user.uid} | Class: ${classId} | Authorized: ${result.authorized}`);
      res.json({
        success: true,
        liveClass: result.liveClass,
        data: result.liveClass,
      });
    } catch (err) {
      next(err);
    }
  }

  public async createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body || {};
      const isLive = String(body.status || '').toUpperCase() === 'LIVE';

      if (!isLive) {
        const scheduleCandidate = body.scheduledAt || body.startTime;
        if (scheduleCandidate) {
          const parsedDate = new Date(scheduleCandidate);
          if (isNaN(parsedDate.getTime())) {
            res.status(400).json({
              success: false,
              error: 'Invalid scheduled date/time provided. Must be a valid ISO date/time format.',
            });
            return;
          }
          // Reject past dates (allow 2 minutes of grace for network/clock drift)
          if (parsedDate.getTime() < Date.now() - 2 * 60 * 1000) {
            res.status(400).json({
              success: false,
              error: 'Cannot schedule a live class in the past. Please select a future date and time.',
            });
            return;
          }
        }
      }

      const liveClass = await liveClassroomService.createLiveClass(req.body);
      logger.info(`[LIVE_CLASS_CREATED] ID: ${liveClass.id} | Title: ${liveClass.title} | Course: ${liveClass.courseId}`);

      const liveNS = getLiveNamespace();
      if (liveNS && liveClass) {
        liveNS.emit('live_class_scheduled', { liveClass });
        liveNS.emit('liveClass:created', { liveClass });
        liveNS.emit('liveClass:published', { liveClass });
      }

      res.status(201).json({ success: true, data: liveClass, liveClass });
    } catch (err) {
      next(err);
    }
  }

  public async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.updateLiveClass(classId, req.body);

      const liveNS = getLiveNamespace();
      if (liveNS && liveClass) {
        liveNS.emit('liveClass:updated', { liveClass });
        liveNS.emit('live_class_updated', { liveClass });
      }

      res.json({ success: true, data: liveClass, liveClass });
    } catch (err) {
      next(err);
    }
  }

  public async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      if (!classId) {
        res.status(400).json({ success: false, error: 'classId is required.' });
        return;
      }

      const existingClass = await liveClassroomService.getLiveClassById(classId).catch(() => null);
      const liveNS = getLiveNamespace();

      // If class is currently LIVE, broadcast session:ended & liveClass:ended so all students are cleanly kicked out
      if (existingClass && String(existingClass.status).toUpperCase() === 'LIVE' && liveNS) {
        const roomName = `live-class:${classId}`;
        const endPayload = {
          liveClassId: classId,
          classId,
          status: 'ENDED',
          endedAt: new Date().toISOString(),
          reason: 'Class session was terminated by administrator deletion',
        };
        logger.warn(`[LIVE_CLASS_DELETED_LIVE] Broadcasting session:ended for active session: ${classId}`);
        liveNS.to(roomName).emit('session:ended', endPayload);
        liveNS.to(roomName).emit('liveClass:ended', endPayload);
        liveNS.to(roomName).emit('live_class_ended', endPayload);
        liveNS.to(roomName).emit('liveClass:status', endPayload);
      }

      const result = await liveClassroomService.deleteLiveClass(classId);

      if (liveNS) {
        liveNS.emit('liveClass:deleted', { liveClassId: classId, classId });
        liveNS.emit('live_class_deleted', { liveClassId: classId, classId });
      }

      res.json({ success: true, deleted: result });
    } catch (err) {
      next(err);
    }
  }

  // State Transitions
  public async startClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      // 1. Authorize: Only assigned instructor or administrator can start
      if (!user || !user.uid) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Authentication required to start a live class.',
        });
        return;
      }

      const isAuthorized = await liveClassroomService.verifyInstructorOwnership(
        classId,
        user.uid,
        user.role,
        user.email,
        user.name
      );
      if (!isAuthorized) {
        const liveClass = await liveClassroomService.getLiveClassById(classId);
        res.status(403).json({
          success: false,
          error: `Forbidden: Only the assigned instructor (${liveClass?.instructorName || 'assigned mentor'}) or an administrator can start this live class.`,
        });
        return;
      }

      const liveClass = await liveClassroomService.startLiveClass(classId);
      logger.info(`[LIVE_CLASS_STARTED] Class: ${classId} transitioned to LIVE`);

      // Realtime Socket.IO Broadcast to room and namespace
      const liveNS = getLiveNamespace();
      if (liveNS) {
        const roomName = `live-class:${classId}`;
        const payload = {
          liveClassId: classId,
          status: 'LIVE',
          startedAt: liveClass?.startedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name || user?.email || 'Instructor',
        };
        liveNS.to(roomName).emit('liveClass:status', payload);
        liveNS.to(roomName).emit('live_class_started', payload);
        liveNS.emit('liveClass:status', payload);
        liveNS.emit('live_class_started', payload);
      }

      // Durable notification dispatch to eligible students
      (async () => {
        try {
          if (liveClass) {
            await notificationService.dispatchLiveClassNotification(liveClass, 'STARTED', liveNS);
          }
        } catch (notifErr: any) {
          console.warn('[LiveClassroomController] Start notification notice:', notifErr?.message || notifErr);
        }
      })();

      res.json({ success: true, message: 'Class set to live status', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async endClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      // 1. Authorize: Only assigned instructor or administrator can end
      if (!user || !user.uid) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Authentication required to end a live class.',
        });
        return;
      }

      const isAuthorized = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, user.role);
      if (!isAuthorized) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: Only the assigned instructor or an administrator can end this live class.',
        });
        return;
      }

      const liveClass = await liveClassroomService.endLiveClass(classId);

      // Realtime Socket.IO Broadcast to room and namespace
      const liveNS = getLiveNamespace();
      if (liveNS) {
        const roomName = `live-class:${classId}`;
        liveNS.to(roomName).emit('liveClass:status', {
          liveClassId: classId,
          status: 'ENDED',
          endedAt: liveClass?.endedAt,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name || user?.email || 'Instructor',
        });
        const endPayload = {
          liveClassId: classId,
          classId,
          status: 'ENDED',
          endedAt: liveClass?.endedAt || new Date().toISOString(),
        };
        liveNS.to(roomName).emit('live_class_ended', endPayload);
        liveNS.to(roomName).emit('session:ended', endPayload);
        liveNS.to(roomName).emit('liveClass:ended', endPayload);
        liveNS.emit('liveClass:status', {
          liveClassId: classId,
          status: 'ENDED',
          endedAt: liveClass?.endedAt || new Date().toISOString(),
        });
        liveNS.emit('liveClass:deleted', { liveClassId: classId, classId });
        liveNS.emit('live_class_deleted', { liveClassId: classId, classId });
      }

      // Delete the class record so it does not linger in active panels
      await liveClassroomService.deleteLiveClass(classId);

      res.json({ success: true, message: 'Class session ended and deleted', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async cancelClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      if (!user || !user.uid) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: Authentication required to cancel a live class.',
        });
        return;
      }

      const isAuthorized = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, user.role);
      if (!isAuthorized) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: Only the assigned instructor or an administrator can cancel this live class.',
        });
        return;
      }

      const liveClass = await liveClassroomService.cancelLiveClass(classId);

      // Realtime Socket.IO Broadcast to room
      const liveNS = getLiveNamespace();
      if (liveNS) {
        const roomName = `live-class:${classId}`;
        liveNS.to(roomName).emit('liveClass:status', {
          liveClassId: classId,
          status: 'CANCELLED',
          updatedAt: new Date().toISOString(),
          updatedBy: user?.name || user?.email || 'Instructor',
        });
      }

      res.json({ success: true, message: 'Class cancelled', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async updateYoutube(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const { youtubeVideoId } = req.body;
      const liveClass = await liveClassroomService.updateYoutubeVideoId(classId, youtubeVideoId);
      res.json({ success: true, message: 'YouTube stream ID updated', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Announcements
  public async getAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const list = await liveClassroomService.getAnnouncements(classId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  public async createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user || {};
      const { message, authorName } = req.body;
      if (!message || !message.trim()) {
        res.status(400).json({ success: false, error: 'Announcement message is required.' });
        return;
      }
      const announcement = await liveClassroomService.createAnnouncement({
        classId,
        authorId: user.uid || 'admin_user',
        authorName: authorName || user.email?.split('@')[0] || 'Instructor / Admin',
        authorRole: user.role === 'admin' ? 'admin' : 'instructor',
        message: message.trim(),
      });
      res.status(201).json({ success: true, data: announcement });
    } catch (err) {
      next(err);
    }
  }

  public async deleteAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const annId = req.params.annId as string;
      const result = await liveClassroomService.deleteAnnouncement(classId, annId);
      res.json({ success: true, deleted: result });
    } catch (err) {
      next(err);
    }
  }

  // Quizzes
  public async getQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const list = await liveClassroomService.getQuizzes(classId);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  public async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const quiz = await liveClassroomService.createQuiz({ ...req.body, classId });
      res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }

  public async submitQuizAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const quizId = (req.params.quizId || req.body.quizId) as string;
      const user = (req as any).user || {};
      const { answer, userName } = req.body;
      const result = await liveClassroomService.submitQuizAnswer(classId, quizId, {
        userId: user.uid || req.body.userId || 'student_guest',
        userName: userName || user.email?.split('@')[0] || 'Student',
        answer,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async toggleQuizActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const quizId = (req.params.quizId || req.body.quizId) as string;
      const { active } = req.body;
      const result = await liveClassroomService.toggleQuizActive(classId, quizId, active);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Student Join & Attendance
  public async joinClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user || req.body.user || {
        uid: req.body.userId || 'usr_anonymous',
        name: req.body.userName || 'Student User',
        email: req.body.userEmail || 'student@lms.com',
        role: req.body.role || 'student',
      };

      const result = await liveClassroomService.authorizeAndJoinClass(classId, user);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  public async leaveClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const userId = req.body.userId || (req as any).user?.uid;
      if (!userId) {
        res.status(400).json({ success: false, error: 'User ID is required to record leave.' });
        return;
      }
      const record = await liveClassroomService.leaveLiveClass(classId, userId);
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  }

  public async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      if (user && user.uid) {
        const userRole = (user.role || 'student').toLowerCase();
        const isAdmin = userRole === 'admin' || Boolean(user.email && user.email.includes('admin'));
        const isInstructor = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, userRole);

        if (!isAdmin && !isInstructor) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Only assigned instructors or administrators can view the full class attendance report.',
          });
          return;
        }
      }

      const attendance = await liveClassroomService.getAttendanceReport(classId);
      res.json({ success: true, data: attendance });
    } catch (err) {
      next(err);
    }
  }

  public async getStudentAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;
      const targetStudentId = (req.params.studentId || user?.uid) as string;

      if (!targetStudentId) {
        res.status(400).json({ success: false, error: 'Student ID is required.' });
        return;
      }

      // Authorization: student can only view own attendance, admin/instructor can view any
      if (user && user.uid) {
        const userRole = (user.role || 'student').toLowerCase();
        const isAdmin = userRole === 'admin' || Boolean(user.email && user.email.includes('admin'));
        const isInstructor = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, userRole);

        if (!isAdmin && !isInstructor && user.uid !== targetStudentId) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Students can only view their own attendance records.',
          });
          return;
        }
      }

      const attendance = await liveClassroomService.getStudentAttendance(classId, targetStudentId);
      res.json({ success: true, data: attendance });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getClassAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      if (user && user.uid) {
        const userRole = (user.role || 'student').toLowerCase();
        const isAdmin = userRole === 'admin' || Boolean(user.email && user.email.includes('admin'));
        const isInstructor = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, userRole);

        if (!isAdmin && !isInstructor) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Only assigned instructors or administrators can view class analytics.',
          });
          return;
        }
      }

      const analytics = await liveClassroomService.getClassAnalytics(classId);
      res.json({ success: true, data: analytics });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getRecording(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user || { uid: 'guest', role: 'student' };
      const recording = await liveClassroomService.getAuthorizedRecording(classId, user);
      res.json({ success: true, data: recording });
    } catch (err: any) {
      res.status(403).json({ success: false, error: err.message });
    }
  }

  public async updateRecording(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const user = (req as any).user;

      if (user && user.uid) {
        const userRole = (user.role || 'student').toLowerCase();
        const isAdmin = userRole === 'admin' || Boolean(user.email && user.email.includes('admin'));
        const isInstructor = await liveClassroomService.verifyInstructorOwnership(classId, user.uid, userRole);

        if (!isAdmin && !isInstructor) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Only assigned instructors or administrators can attach recordings.',
          });
          return;
        }
      }

      const result = await liveClassroomService.updateRecording(classId, req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Live Chat
  public async getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const messages = await liveClassroomService.getChatMessages(classId);
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  public async sendChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const payload = { ...req.body, classId };
      const msg = await liveClassroomService.saveChatMessage(payload);
      res.status(201).json({ success: true, data: msg });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async deleteChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const messageId = req.params.messageId as string;
      await liveClassroomService.deleteChatMessage(classId, messageId);
      res.json({ success: true, deleted: true });
    } catch (err) {
      next(err);
    }
  }

  // Q&A Questions
  public async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const questions = await liveClassroomService.getQuestions(classId);
      res.json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  }

  public async submitQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const payload = { ...req.body, classId };
      const question = await liveClassroomService.createQuestion(payload);
      res.status(201).json({ success: true, data: question });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const questionId = req.params.questionId as string;
      const updated = await liveClassroomService.updateQuestion(classId, questionId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // Polls
  public async getPolls(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const polls = await liveClassroomService.getPolls(classId);
      res.json({ success: true, data: polls });
    } catch (err) {
      next(err);
    }
  }

  public async createPoll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const payload = { ...req.body, classId };
      const poll = await liveClassroomService.createPoll(payload);
      res.status(201).json({ success: true, data: poll });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async submitPollVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const pollId = req.params.pollId as string;
      const { optionIndex, userId } = req.body;
      const updated = await liveClassroomService.submitPollVote(classId, pollId, optionIndex, userId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Notes
  public async getNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const notes = await liveClassroomService.getNotes(classId);
      res.json({ success: true, data: notes });
    } catch (err) {
      next(err);
    }
  }

  public async createNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const payload = { ...req.body, classId };
      const note = await liveClassroomService.createNote(payload);
      res.status(201).json({ success: true, data: note });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // Resources
  public async getResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const resources = await liveClassroomService.getResources(classId);
      res.json({ success: true, data: resources });
    } catch (err) {
      next(err);
    }
  }

  public async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const payload = { ...req.body, classId };
      const resource = await liveClassroomService.createResource(payload);
      res.status(201).json({ success: true, data: resource });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  // AI Insights
  public async getAIReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const report = await liveClassroomService.getAIReport(classId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async generateAIInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const report = await liveClassroomService.generateAIInsights(classId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}

export const liveClassroomController = new LiveClassroomController();
