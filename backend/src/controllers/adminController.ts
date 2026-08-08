import { Request, Response, NextFunction } from 'express';
import { db } from '../firebase';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';
import logger from '../config/logger';

export class AdminController {
  /**
   * Flow 2: Admin Approves Student
   */
  public async approveStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.body;
      if (!studentId) {
        res.status(400).json({ success: false, error: 'studentId is required' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database service is unavailable' });
        return;
      }

      const docRef = db.collection('students').doc(studentId);
      const userRef = db.collection('users').doc(studentId);

      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        res.status(404).json({ success: false, error: 'Student record not found' });
        return;
      }

      const studentData = docSnap.data() || {};
      const now = new Date().toISOString();
      const approvedBy = (req as any).user?.email || 'admin@shaivika.com';

      const updatePayload = {
        approved: true,
        status: 'approved',
        approvedAt: now,
        approvedBy,
      };

      await docRef.update(updatePayload);
      await userRef.update(updatePayload).catch(() => null);

      // Trigger approval email
      await emailService.sendEventEmail(
        EmailEventType.REGISTRATION_APPROVED,
        studentData.email,
        {
          studentName: studentData.fullName || studentData.name || 'Student',
          email: studentData.email,
          dashboardUrl: 'https://shaivika-lms.vercel.app/auth/login',
        }
      );

      res.status(200).json({
        success: true,
        message: `Student account approved successfully by ${approvedBy}`,
        approvedAt: now,
      });
    } catch (err: any) {
      logger.error(`[adminController] approveStudent error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }

  /**
   * Flow 4: Admin Approves Lecturer
   */
  public async approveLecturer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lecturerId } = req.body;
      if (!lecturerId) {
        res.status(400).json({ success: false, error: 'lecturerId is required' });
        return;
      }

      if (!db) {
        res.status(500).json({ success: false, error: 'Database service is unavailable' });
        return;
      }

      const docRef = db.collection('lecturers').doc(lecturerId);
      const userRef = db.collection('users').doc(lecturerId);

      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        res.status(404).json({ success: false, error: 'Lecturer record not found' });
        return;
      }

      const lecturerData = docSnap.data() || {};
      const now = new Date().toISOString();
      const approvedBy = (req as any).user?.email || 'admin@shaivika.com';

      const updatePayload = {
        approved: true,
        status: 'Verified',
        approvedAt: now,
        approvedBy,
      };

      await docRef.update(updatePayload);
      await userRef.update(updatePayload).catch(() => null);

      // Trigger approval email
      await emailService.sendEventEmail(
        EmailEventType.LECTURER_APPROVED,
        lecturerData.email,
        {
          lecturerName: lecturerData.name || lecturerData.fullName || 'Faculty Member',
          email: lecturerData.email,
          dashboardUrl: 'https://shaivika-lms.vercel.app/auth/login',
        }
      );

      res.status(200).json({
        success: true,
        message: `Lecturer account approved successfully by ${approvedBy}`,
        approvedAt: now,
      });
    } catch (err: any) {
      logger.error(`[adminController] approveLecturer error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }
}
