import { Request, Response, NextFunction } from 'express';
import { liveClassroomService } from './liveClassroom.service';
import logger from '../../config/logger';

export class LiveClassroomController {
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
      const id = req.params.id as string;
      const liveClass = await liveClassroomService.getLiveClassById(id);
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
      const id = req.params.id as string;
      const liveClass = await liveClassroomService.updateLiveClass(id, req.body);
      res.json({ success: true, data: liveClass });
    } catch (err) {
      next(err);
    }
  }

  public async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await liveClassroomService.deleteLiveClass(id);
      res.json({ success: true, deleted: result });
    } catch (err) {
      next(err);
    }
  }

  public async publishQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await liveClassroomService.publishQuiz(req.body);
      res.status(201).json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }

  public async submitQuizResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await liveClassroomService.evaluateQuizResponse(req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public async getQuizResponses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId = req.params.quizId as string;
      const responses = await liveClassroomService.getQuizResponses(quizId);
      res.json({ success: true, data: responses });
    } catch (err) {
      next(err);
    }
  }

  public async getChatMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const messages = await liveClassroomService.getChatMessages(classId);
      res.json({ success: true, data: messages });
    } catch (err) {
      next(err);
    }
  }

  public async getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const attendance = await liveClassroomService.getAttendanceReport(classId);
      res.json({ success: true, data: attendance });
    } catch (err) {
      next(err);
    }
  }

  public async getAIReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const report = await liveClassroomService.getAIReport(classId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  public async generateAIInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const report = await liveClassroomService.generateAIInsights(classId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}
export const liveClassroomController = new LiveClassroomController();
