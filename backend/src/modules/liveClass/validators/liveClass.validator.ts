import { Request, Response, NextFunction } from 'express';

export const validateCreateLiveClass = (req: Request, res: Response, next: NextFunction) => {
  const { title, courseId, instructorId, startTime, endTime } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Valid title is required' });
  }
  if (!courseId || typeof courseId !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid courseId is required' });
  }
  if (!instructorId || typeof instructorId !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid instructorId is required' });
  }
  if (!startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Valid startTime and endTime ISO strings are required' });
  }

  next();
};
