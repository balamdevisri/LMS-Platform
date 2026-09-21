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
      limit: limit ? Number(limit) : 100,
    });

    res.json(formatResponse(true, result, 'Courses retrieved successfully'));
  });

  getCourseByIdOrSlug = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const minVersion = req.query.minVersion || req.query.expectedVersion || req.query.version;
    const minExpectedVersion = typeof minVersion === 'string' ? Number(minVersion) : undefined;

    let course = await this.courseService.getCourseById(id, minExpectedVersion);
    if (!course) {
      course = await this.courseService.getCourseBySlug(id, minExpectedVersion);
    }

    if (!course) {
      res.status(404).json(formatResponse(false, null, 'Course not found'));
      return;
    }

    res.json(formatResponse(true, course, 'Course retrieved successfully'));
  });

  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.uid;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const course = await this.courseService.createCourse(req.body, userId, authToken);
    res.status(201).json(formatResponse(true, course, 'Course created successfully'));
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = (req as any).user?.uid;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const expectedVersion = typeof req.body.version === 'number' ? req.body.version : undefined;

    try {
      const course = await this.courseService.updateCourse(id, req.body, expectedVersion, userId, authToken);
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
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const hardDelete = req.query.hard === 'true';
    await this.courseService.deleteCourse(id, userId, hardDelete, authToken);
    res.json(formatResponse(true, null, 'Course deleted successfully'));
  });

  publishCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const course = await this.courseService.updateCourse(id, { status: 'published' }, undefined, (req as any).user?.uid, authToken);
    res.json(formatResponse(true, course, 'Course published successfully'));
  });

  unpublishCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const course = await this.courseService.updateCourse(id, { status: 'draft' }, undefined, (req as any).user?.uid, authToken);
    res.json(formatResponse(true, course, 'Course set to draft successfully'));
  });

  archiveCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const course = await this.courseService.updateCourse(id, { status: 'archived' }, undefined, (req as any).user?.uid, authToken);
    res.json(formatResponse(true, course, 'Course archived successfully'));
  });

  duplicateCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.duplicateCourse(id);
    res.status(201).json(formatResponse(true, course, 'Course duplicated successfully'));
  });

  getCourseModules = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const minRevision = req.query.minRevision || req.query.expectedRevision || req.query.revision;
    const minExpectedRevision = typeof minRevision === 'string' ? Number(minRevision) : undefined;
    const modules = await this.courseService.getCourseModules(id, minExpectedRevision);
    res.json(formatResponse(true, modules, 'Course modules retrieved successfully'));
  });

  getModuleLessons = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const moduleId = req.params.moduleId as string;
    const includeContent = req.query.includeContent === 'true';
    const minRevision = req.query.minRevision || req.query.expectedRevision || req.query.revision;
    const minExpectedRevision = typeof minRevision === 'string' ? Number(minRevision) : undefined;
    const lessons = await this.courseService.getModuleLessons(courseId, moduleId, { includeContent }, minExpectedRevision);
    res.json(formatResponse(true, lessons, 'Module lessons retrieved successfully'));
  });

  saveModule = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const moduleId = req.params.moduleId || req.body.id;
    const userId = (req as any).user?.uid;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!courseId || !moduleId) {
      res.status(400).json(formatResponse(false, null, 'courseId and moduleId are required'));
      return;
    }

    try {
      const moduleDoc = {
        ...req.body,
        id: moduleId,
        courseId,
      };
      const savedModule = await this.courseService.saveModule(courseId, moduleDoc, userId, authToken);
      res.status(200).json(formatResponse(true, savedModule, 'Module saved successfully'));
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

  deleteModule = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const moduleId = req.params.moduleId as string;
    const userId = (req as any).user?.uid;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (!courseId || !moduleId) {
      res.status(400).json(formatResponse(false, null, 'courseId and moduleId are required'));
      return;
    }

    const success = await this.courseService.deleteModule(courseId, moduleId, userId, authToken);
    if (!success) {
      res.status(404).json(formatResponse(false, null, 'Failed to delete module'));
      return;
    }

    res.json(formatResponse(true, null, 'Module deleted successfully'));
  });

  getCourseRevisions = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const revisions = await this.courseService.getCourseRevisions(courseId, limit);
    res.json(formatResponse(true, revisions, 'Course revision history retrieved successfully'));
  });

  restoreCourseRevision = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const auditId = req.params.auditId as string;
    const userId = (req as any).user?.uid;
    const authToken = (req as any).userToken || req.headers.authorization?.replace(/^Bearer\s+/i, '');

    const restored = await this.courseService.restoreCourseRevision(courseId, auditId, userId, authToken);
    res.status(200).json(formatResponse(true, restored, 'Course revision restored successfully'));
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
