import { Router, Response } from 'express';
import { db, isFirebaseAdminInitialized } from '../firebase';
import { extractOptionalUser, verifyFirebaseToken, AuthenticatedRequest } from '../middleware/auth.middleware';
import logger from '../config/logger';

const router = Router();

// GET /api/portfolio/me - Get current user's portfolio
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

    const docRef = db.collection('portfolios').doc(studentId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.json({ success: true, data: docSnap.data() });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err: any) {
    logger.error('[Portfolio] Error fetching user portfolio:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// PUT /api/portfolio/me - Save or update current user's portfolio
router.put('/me', extractOptionalUser as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.uid || (req.body.studentId as string);
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const {
      name,
      fullName,
      email,
      bio,
      headline,
      avatarUrl,
      photoURL,
      avatar,
      location,
      phone,
      githubLink,
      githubUrl,
      linkedinLink,
      linkedinUrl,
      websiteLink,
      websiteUrl,
      customHandle,
      skills,
      projects,
      experience,
      experiences,
      education,
      educations,
      isPublished,
      theme,
      accentColor,
    } = req.body;

    const resolvedName = fullName || name || req.user?.name || 'Student Scholar';
    const resolvedAvatar = avatarUrl || photoURL || avatar || '';
    const resolvedGithub = githubUrl || githubLink || '';
    const resolvedLinkedin = linkedinUrl || linkedinLink || '';
    const resolvedWebsite = websiteUrl || websiteLink || '';
    const resolvedExperience = experiences || experience || [];
    const resolvedEducation = educations || education || [];

    const payload: any = {
      studentId,
      name: resolvedName,
      fullName: resolvedName,
      email: email || req.user?.email || '',
      bio: bio || '',
      headline: headline || '',
      avatarUrl: resolvedAvatar,
      photoURL: resolvedAvatar,
      avatar: resolvedAvatar,
      location: location || '',
      phone: phone || '',
      githubLink: resolvedGithub,
      githubUrl: resolvedGithub,
      linkedinLink: resolvedLinkedin,
      linkedinUrl: resolvedLinkedin,
      websiteLink: resolvedWebsite,
      websiteUrl: resolvedWebsite,
      customHandle: customHandle || studentId,
      skills: Array.isArray(skills) ? skills : [],
      projects: Array.isArray(projects) ? projects : [],
      experience: Array.isArray(resolvedExperience) ? resolvedExperience : [],
      experiences: Array.isArray(resolvedExperience) ? resolvedExperience : [],
      education: Array.isArray(resolvedEducation) ? resolvedEducation : [],
      educations: Array.isArray(resolvedEducation) ? resolvedEducation : [],
      isPublished: Boolean(isPublished),
      theme: theme || 'modern',
      accentColor: accentColor || 'cyan',
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminInitialized() && db) {
      await db.collection('portfolios').doc(studentId).set(payload, { merge: true });

      // If custom handle is provided, create/update handle index for fast lookup
      if (customHandle) {
        const cleanHandle = String(customHandle).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (cleanHandle) {
          await db.collection('portfolio_handles').doc(cleanHandle).set({
            studentId,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    }

    res.json({ success: true, data: payload, message: 'Portfolio saved successfully' });
  } catch (err: any) {
    logger.error('[Portfolio] Error saving portfolio:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// POST /api/portfolio/publish - Toggle publish state and handle
router.post('/publish', extractOptionalUser as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.uid || (req.body.studentId as string);
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { isPublished, customHandle } = req.body;

    if (isFirebaseAdminInitialized() && db) {
      const updateData: any = {
        isPublished: Boolean(isPublished),
        updatedAt: new Date().toISOString(),
      };
      if (customHandle) {
        updateData.customHandle = String(customHandle).toLowerCase().trim();
      }

      await db.collection('portfolios').doc(studentId).set(updateData, { merge: true });

      if (customHandle) {
        const cleanHandle = String(customHandle).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        if (cleanHandle) {
          await db.collection('portfolio_handles').doc(cleanHandle).set({
            studentId,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    }

    res.json({
      success: true,
      isPublished: Boolean(isPublished),
      customHandle: customHandle || studentId,
      message: isPublished ? 'Portfolio published publicly' : 'Portfolio is now private',
    });
  } catch (err: any) {
    logger.error('[Portfolio] Error toggling publish state:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

// GET /api/portfolio/public/:handleOrId - Public endpoint to retrieve published portfolio
router.get('/public/:handleOrId', async (req, res): Promise<void> => {
  try {
    const { handleOrId } = req.params;
    if (!handleOrId) {
      res.status(400).json({ success: false, error: 'Handle or student ID required' });
      return;
    }

    if (!isFirebaseAdminInitialized() || !db) {
      res.status(404).json({ success: false, error: 'Portfolio not found' });
      return;
    }

    let targetStudentId = handleOrId;

    // First check if handleOrId is a registered custom handle
    const cleanHandle = String(handleOrId).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    const handleDoc = await db.collection('portfolio_handles').doc(cleanHandle).get();
    if (handleDoc.exists && handleDoc.data()?.studentId) {
      targetStudentId = handleDoc.data()!.studentId;
    }

    // Lookup portfolio doc
    let portfolioDoc = await db.collection('portfolios').doc(targetStudentId).get();

    // Fallback search by customHandle
    if (!portfolioDoc.exists) {
      const snap = await db.collection('portfolios').where('customHandle', '==', cleanHandle).limit(1).get();
      if (!snap.empty) {
        portfolioDoc = snap.docs[0];
      }
    }

    if (!portfolioDoc.exists) {
      res.status(404).json({ success: false, error: 'Portfolio not found or not published' });
      return;
    }

    const data = portfolioDoc.data();
    if (!data?.isPublished) {
      res.status(403).json({ success: false, error: 'This portfolio is private or unpublished by the author' });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    logger.error('[Portfolio] Public lookup error:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

export default router;
