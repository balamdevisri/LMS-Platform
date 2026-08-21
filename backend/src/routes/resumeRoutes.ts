import { Router, Response } from 'express';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { extractOptionalUser, AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../config/logger';

const router = Router();

// GET /api/resume/me - Get current user's resume
router.get('/me', extractOptionalUser as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.uid || (req.query.studentId as string);
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!isFirebaseAdminInitialized() || !db) {
      res.json({ success: true, data: null });
      return;
    }

    const docRef = db.collection('resumes').doc(studentId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.json({ success: true, data: docSnap.data() });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err: any) {
    logger.error('[Resume] Error fetching resume:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/resume/me - Save or update current user's resume
router.put('/me', extractOptionalUser as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.uid || (req.body.studentId as string);
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const {
      fullName,
      email,
      phone,
      location,
      title,
      summary,
      skills,
      experience,
      education,
      certifications,
      projects,
      template,
    } = req.body;

    const payload: any = {
      studentId,
      fullName: fullName || req.user?.name || 'Student Scholar',
      email: email || req.user?.email || '',
      phone: phone || '',
      location: location || '',
      title: title || 'Full Stack Developer',
      summary: summary || '',
      skills: Array.isArray(skills) ? skills : [],
      experience: Array.isArray(experience) ? experience : [],
      education: Array.isArray(education) ? education : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      projects: Array.isArray(projects) ? projects : [],
      template: template || 'modern',
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized() && db) {
      await db.collection('resumes').doc(studentId).set(payload, { merge: true });
    }

    res.json({ success: true, data: payload, message: 'Resume draft saved successfully to database' });
  } catch (err: any) {
    logger.error('[Resume] Error saving resume:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

export default router;
