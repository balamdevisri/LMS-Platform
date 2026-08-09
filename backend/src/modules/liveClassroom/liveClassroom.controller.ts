import { Request, Response, NextFunction } from 'express';
import { liveClassroomService } from './liveClassroom.service';

export class LiveClassroomController {
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
      const liveClass = await liveClassroomService.getLiveClassById(classId);
      if (!liveClass) {
        res.status(404).json({ success: false, error: 'Live Class session not found' });
        return;
      }
      res.json({ success: true, data: liveClass });
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
      res.json({ success: true, message: 'Class set to live status', data: liveClass });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async endClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = (req.params.classId || req.params.id) as string;
      const liveClass = await liveClassroomService.endLiveClass(classId);
      res.json({ success: true, message: 'Class session ended', data: liveClass });
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
