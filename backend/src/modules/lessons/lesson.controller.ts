import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { formatResponse } from '../../utils/responseFormatter';
import { LessonService } from './lesson.service';

export class LessonController {
  private lessonService: LessonService;

  constructor() {
    this.lessonService = new LessonService();
  }

  getLessonById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const courseId = req.query.courseId as string | undefined;
    const moduleId = req.query.moduleId as string | undefined;
    const minRevision = req.query.minRevision || req.query.expectedRevision || req.query.revision;
    const minExpectedRevision = typeof minRevision === 'string' ? Number(minRevision) : undefined;

    const lesson = await this.lessonService.getLessonById(id, courseId, moduleId, minExpectedRevision);
    if (!lesson) {
      res.status(404).json(formatResponse(false, null, 'Lesson not found'));
      return;
    }

    res.json(formatResponse(true, lesson, 'Lesson retrieved successfully'));
  });

  saveLesson = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, moduleId, ...lessonData } = req.body;
    const userId = (req as any).user?.uid;

    if (!courseId || !moduleId || !lessonData.id) {
      res.status(400).json(formatResponse(false, null, 'courseId, moduleId, and lesson id are required'));
      return;
    }

    try {
      const savedLesson = await this.lessonService.saveLesson(
        courseId,
        moduleId,
        {
          ...lessonData,
          courseId,
          moduleId,
        },
        userId
      );

      res.status(200).json(formatResponse(true, savedLesson, 'Lesson saved successfully'));
    } catch (err: any) {
      if (err.status === 409 || err.code === 409) {
        res.status(409).json({
          success: false,
          conflict: true,
          error: err.message,
          message: err.message,
        });
        return;
      }
      throw err;
    }
  });

  batchReorder = asyncHandler(async (req: Request, res: Response) => {
    const { courseId, updates } = req.body;
    const userId = (req as any).user?.uid;

    if (!courseId || !Array.isArray(updates)) {
      res.status(400).json(formatResponse(false, null, 'courseId and updates array are required'));
      return;
    }

    await this.lessonService.batchReorderLessons(courseId, updates, userId);
    res.json(formatResponse(true, null, 'Lessons reordered successfully'));
  });

  deleteLesson = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const courseId = req.query.courseId as string | undefined;
    const moduleId = req.query.moduleId as string | undefined;
    const userId = (req as any).user?.uid;

    const success = await this.lessonService.deleteLesson(id, courseId, moduleId, userId);
    if (!success) {
      res.status(404).json(formatResponse(false, null, 'Failed to delete lesson'));
      return;
    }

    res.json(formatResponse(true, null, 'Lesson deleted successfully'));
  });

  deleteModule = asyncHandler(async (req: Request, res: Response) => {
    const moduleId = req.params.id as string;
    const courseId = req.query.courseId as string;
    const userId = (req as any).user?.uid;

    if (!courseId || !moduleId) {
      res.status(400).json(formatResponse(false, null, 'courseId and moduleId are required'));
      return;
    }

    const success = await this.lessonService.deleteModule(courseId, moduleId, userId);
    if (!success) {
      res.status(404).json(formatResponse(false, null, 'Failed to delete module'));
      return;
    }

    res.json(formatResponse(true, null, 'Module and lessons deleted successfully'));
  });
}
