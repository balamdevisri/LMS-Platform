import { Request, Response, NextFunction } from 'express';
import { adminAuth, db } from '../firebase';
import { emailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';
import { studentRegistrationSchema } from '../validators/student.validator';
import logger from '../config/logger';

export class AuthController {
  /**
   * Flow 1: Student Registration
   */
  public async studentRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = studentRegistrationSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ success: false, error: 'Invalid input data', details: validation.error.flatten() });
        return;
      }

      const { fullName, email, password } = validation.data;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await adminAuth.getUserByEmail(normalizedEmail).catch(() => null);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'An account with this email already exists' });
        return;
      }

      // Create Firebase Auth user
      const firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: fullName,
      });

      const now = new Date().toISOString();
      const studentData = {
        uid: firebaseUser.uid,
        fullName,
        name: fullName,
        email: normalizedEmail,
        status: 'pending',
        role: 'student',
        approved: false,
        createdAt: now,
        approvedAt: null,
      };

      // Store in Firestore collections
      if (db) {
        await db.collection('students').doc(firebaseUser.uid).set(studentData);
        await db.collection('users').doc(firebaseUser.uid).set(studentData);
      }

      // Send verification link and pending email
      const verificationLink = `https://shaivika-lms.vercel.app/auth/login?verified=true&email=${encodeURIComponent(normalizedEmail)}`;
      
      await emailService.sendEventEmail(
        EmailEventType.REGISTRATION_PENDING,
        normalizedEmail,
        {
          studentName: fullName,
          email: normalizedEmail,
          githubUrl: req.body.githubUrl || '',
          status: 'Pending Approval',
          verificationLink,
        }
      );

      res.status(201).json({
        success: true,
        message: 'Student account registered successfully. Awaiting administrator approval.',
        data: { uid: firebaseUser.uid, email: normalizedEmail },
      });
    } catch (err: any) {
      logger.error(`[authController] studentRegister error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }

  /**
   * Flow 3: Lecturer Registration
   */
  public async lecturerRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, password, specialty } = req.body;
      if (!fullName || !email || !password) {
        res.status(400).json({ success: false, error: 'fullName, email, and password are required' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await adminAuth.getUserByEmail(normalizedEmail).catch(() => null);
      if (existingUser) {
        res.status(400).json({ success: false, error: 'An account with this email already exists' });
        return;
      }

      // Create Firebase Auth user
      const firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: fullName,
      });

      const now = new Date().toISOString();
      const lecturerData = {
        uid: firebaseUser.uid,
        name: fullName,
        fullName,
        email: normalizedEmail,
        role: 'instructor',
        status: 'Pending',
        approved: false,
        specialty: specialty || 'General Tech Specialist',
        createdAt: now,
        assignedCourses: 0,
        rating: 5.0,
      };

      // Store in Firestore collections
      if (db) {
        await db.collection('lecturers').doc(firebaseUser.uid).set(lecturerData);
        await db.collection('users').doc(firebaseUser.uid).set(lecturerData);
      }

      // Send pending email
      await emailService.sendEventEmail(
        EmailEventType.LECTURER_PENDING,
        normalizedEmail,
        {
          lecturerName: fullName,
          email: normalizedEmail,
        }
      );

      res.status(201).json({
        success: true,
        message: 'Lecturer application received. Awaiting administrator review.',
        data: { uid: firebaseUser.uid, email: normalizedEmail },
      });
    } catch (err: any) {
      logger.error(`[authController] lecturerRegister error: ${err?.message || err}`);
      res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
  }
}
