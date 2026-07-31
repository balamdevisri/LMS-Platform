import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import {
  studentRegistrationSchema,
  studentApproveSchema,
  studentRejectSchema,
} from '../../validators/student.validator';
import logger from '../../config/logger';

const studentService = new StudentService();

export class StudentController {
  /**
   * POST /api/auth/register-student (or POST /api/students/register)
   * Manual student registration endpoint with complete step-by-step tracing logs
   */
  public async registerStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log("===== SIGNUP START =====");
    console.log("Email:", req.body?.email);
    logger.info('[SIGNUP FLOW 1] Entering signup endpoint...');

    try {
      const validationResult = studentRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((e) => e.message).join(', ');
        logger.warn(`[SIGNUP FLOW 2] Validation failed: ${errorMessages}`);
        console.log("SIGNUP ERROR: Validation failed", errorMessages);
        res.status(400).json({
          success: false,
          error: errorMessages || 'Validation error',
          details: validationResult.error.flatten(),
        });
        return;
      }

      logger.info(`[SIGNUP FLOW 2] Validation passed for email: ${validationResult.data.email}`);

      const result = await studentService.registerStudent(validationResult.data);
      logger.info('[SIGNUP FLOW 8] Signup completed successfully! Returning response.');
      console.log("===== SIGNUP END =====");
      res.status(201).json(result);
    } catch (err: any) {
      console.error("SIGNUP ERROR:", err);
      logger.error(`[SIGNUP FLOW ERROR] Exception in registerStudent: ${err?.message || err}`, err);
      if (
        err.message === 'Invalid GitHub Profile' ||
        err.message.includes('already registered') ||
        err.message.includes('already exists')
      ) {
        res.status(400).json({
          success: false,
          error: err.message,
        });
        return;
      }
      next(err);
    }
  }

  /**
   * GET /api/users/students/pending
   */
  public async getPendingStudents(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const students = await studentService.getPendingStudents();
      res.json({
        success: true,
        count: students.length,
        students,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * POST /api/users/students/:id/approve
   */
  public async approveStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.params.id || req.body.studentId;
      const validationResult = studentApproveSchema.safeParse({ studentId });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Student ID is required',
        });
        return;
      }

      const result = await studentService.approveStudent(validationResult.data);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * POST /api/users/students/:id/reject
   */
  public async rejectStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = req.params.id || req.body.studentId;
      const { reason } = req.body;
      const validationResult = studentRejectSchema.safeParse({ studentId, reason });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: validationResult.error.errors.map((e) => e.message).join(', '),
        });
        return;
      }

      const result = await studentService.rejectStudent(validationResult.data);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  }
}
