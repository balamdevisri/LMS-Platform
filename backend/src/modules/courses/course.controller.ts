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
    const course = await this.courseService.createCourse(req.body);
    res.status(201).json(formatResponse(true, course, 'Course created successfully'));
  });

  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const course = await this.courseService.updateCourse(id, req.body);
    res.json(formatResponse(true, course, 'Course updated successfully'));
  });

  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.courseService.deleteCourse(id);
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
}
