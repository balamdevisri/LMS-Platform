import { Request, Response, NextFunction } from 'express';
import { liveClassroomService } from './liveClassroom.service';

export class LiveClassroomController {
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
      const classes = await liveClassroomService.getAllLiveClasses();
      res.json({ success: true, data: classes });
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
      const liveClass = await liveClassroomService.createLiveClass(req.body);
      res.status(201).json({ success: true, data: liveClass });
    } catch (err) {
      next(err);
    }
  }

  public async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.updateLiveClass(classId, req.body);
      res.json({ success: true, data: liveClass });
    } catch (err) {
      next(err);
    }
  }

  public async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const result = await liveClassroomService.deleteLiveClass(classId);
      res.json({ success: true, deleted: result });
    } catch (err) {
      next(err);
    }
  }

  // State Transitions
  public async startClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.startLiveClass(classId);
      res.json({ success: true, message: 'Class set to live status', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async endClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.endLiveClass(classId);
      res.json({ success: true, message: 'Class session ended', data: liveClass, liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async cancelClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.cancelLiveClass(classId);
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
      const attendance = await liveClassroomService.getAttendanceReport(classId);
      res.json({ success: true, data: attendance });
    } catch (err) {
      next(err);
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
