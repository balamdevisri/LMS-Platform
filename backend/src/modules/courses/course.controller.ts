import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { formatResponse } from '../../utils/responseFormatter';
import { CourseService } from './course.service';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  getCourses = asyncHandler(async (req: Request, res: Response) => {
    const { search, category, level, status, featured, language, sortBy, sortOrder, page, limit } = req.query;

    const result = await this.courseService.getCourses({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      level: typeof level === 'string' ? (level as any) : undefined,
      status: typeof status === 'string' ? (status as any) : undefined,
      featured: featured === 'true',
      language: typeof language === 'string' ? language : undefined,
      sortBy: typeof sortBy === 'string' ? (sortBy as any) : undefined,
      sortOrder: typeof sortOrder === 'string' ? (sortOrder as any) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.json(formatResponse(true, result, 'Courses retrieved successfully'));
  });

  getCourseByIdOrSlug = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    let course = await this.courseService.getCourseById(id);
    if (!course) {
      course = await this.courseService.getCourseBySlug(id);
    }

    if (!course) {
      res.status(404).json(formatResponse(false, null, 'Course not found'));
      return;
    }

    res.json(formatResponse(true, course, 'Course retrieved successfully'));
  });

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.uid;
    const course = await this.courseService.createCourse(req.body, userId);
    res.status(201).json(formatResponse(true, course, 'Course created successfully'));
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as any).user?.uid;
    const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;

    try {
      const course = await this.courseService.updateCourse(id, req.body, expectedVersion, userId);
      res.json(formatResponse(true, course, 'Course updated successfully'));
    } catch (err: any) {
      if (err.status === 409 || err.code === 409 || (err.message && err.message.includes('modified by another'))) {
        res.status(409).json({
          success: false,
          conflict: true,
          error: err.message,
          message: err.message,
          currentVersion: err.currentVersion,
        });
        return;
      }
      throw err;
    }
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as any).user?.uid;
    const hardDelete = req.query.hard === 'true';
    await this.courseService.deleteCourse(id, userId, hardDelete);
    res.json(formatResponse(true, null, 'Course deleted successfully'));
  });

  publishCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.publishCourse(id);
    res.json(formatResponse(true, course, 'Course published successfully'));
  });

  unpublishCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.unpublishCourse(id);
    res.json(formatResponse(true, course, 'Course set to draft successfully'));
  });

  archiveCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.archiveCourse(id);
    res.json(formatResponse(true, course, 'Course archived successfully'));
  });

  duplicateCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.duplicateCourse(id);
    res.status(201).json(formatResponse(true, course, 'Course duplicated successfully'));
  });

  getCourseModules = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const modules = await this.courseService.getCourseModules(id);
    res.json(formatResponse(true, modules, 'Course modules retrieved successfully'));
  });

  getModuleLessons = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const moduleId = req.params.moduleId as string;
    const includeContent = req.query.includeContent === 'true';
    const lessons = await this.courseService.getModuleLessons(courseId, moduleId, { includeContent });
    res.json(formatResponse(true, lessons, 'Module lessons retrieved successfully'));
  });

  bulkImportCourse = asyncHandler(async (req: Request, res: Response) => {
    const adminUser = (req as any).user;
    const result = await this.courseService.bulkImportCourse(req.body, adminUser?.uid || 'admin');
    res.status(201).json(formatResponse(true, result, 'Course bulk import completed successfully'));
  });

  bulkImportToCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const adminUser = (req as any).user;
    const result = await this.courseService.bulkImportToCourse(courseId, req.body, adminUser?.uid || 'admin');
    res.status(200).json(formatResponse(true, result, 'Course content bulk import completed successfully'));
  });
}
