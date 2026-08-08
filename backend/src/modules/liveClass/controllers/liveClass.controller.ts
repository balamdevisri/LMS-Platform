import { Request, Response } from 'express';
import { liveClassService } from '../services/liveClass.service';

export class LiveClassController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await liveClassService.createLiveClass(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const classId = req.params.classId as string;
      const data = await liveClassService.getLiveClass(classId);
      if (!data) {
        res.status(404).json({ success: false, message: 'Live class record not found' });
        return;
      }
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const classId = req.params.classId as string;
      await liveClassService.updateLiveClass(classId, req.body);
      res.json({ success: true, message: 'Live class updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const classId = req.params.classId as string;
      await liveClassService.deleteLiveClass(classId);
      res.json({ success: true, message: 'Live class deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const data = await liveClassService.getUpcomingClasses();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getByInstructor(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.params.instructorId as string;
      const data = await liveClassService.getLiveClassesByInstructor(instructorId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getByCourse(req: Request, res: Response): Promise<void> {
    try {
      const courseId = req.params.courseId as string;
      const data = await liveClassService.getLiveClassesByCourse(courseId);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const liveClassController = new LiveClassController();
