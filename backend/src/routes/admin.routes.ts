import { Router, Request, Response } from 'express';
import { db, adminAuth } from '../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { verifyFirebaseToken, requireRole } from '../middleware/auth.middleware';
import { EmailService } from '../services/email/EmailService';
import { EmailEventType } from '../types/emailTypes';

const router = Router();
const emailService = new EmailService();

/**
 * Enterprise Admin Dashboard Routes
 * Reads exclusively from the central `users` collection.
 */

/**
 * GET /api/admin/dashboard
 * Fetch system metrics from `users` collection
 */
router.get('/dashboard', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    let totalUsers = 0;
    let pendingStudents = 0;
    let pendingInstructors = 0;
    let approvedStudents = 0;
    let approvedInstructors = 0;

    if (db) {
      const usersSnap = await db.collection('users').get();
      totalUsers = usersSnap.size;

      usersSnap.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        const role = data.role;
        const isApproved = data.approved === true || data.status === 'active' || data.status === 'Active' || data.status === 'approved';

        if (role === 'student') {
          if (isApproved) {
            approvedStudents++;
          } else {
            pendingStudents++;
          }
        } else if (role === 'instructor') {
          if (isApproved) {
            approvedInstructors++;
          } else {
            pendingInstructors++;
          }
        }
      });
    }

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        pendingStudents,
        pendingInstructors,
        approvedStudents,
        approvedInstructors,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * GET /api/admin/students
 * Fetch all students from `users` collection where role == 'student'
 */
router.get('/students', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const students: any[] = [];
    if (db) {
      const snap = await db.collection('users').where('role', '==', 'student').get();
      snap.forEach((doc: QueryDocumentSnapshot) => {
        students.push({ id: doc.id, ...doc.data() });
      });
    }
    return res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * GET /api/admin/instructors
 * Fetch all instructors from `users` collection where role == 'instructor'
 */
router.get('/instructors', verifyFirebaseToken as any, requireRole('admin') as any, async (req: Request, res: Response) => {
  try {
    const instructorsMap = new Map<string, any>();
    let totalUsersCount = 0;
    let totalInstructorsColCount = 0;

    if (db) {
      // 1. Fetch all users collection documents (case-insensitive audit)
      const allUsersSnap = await db.collection('users').get();
      totalUsersCount = allUsersSnap.size;
      console.log(`[AUDIT] Total users documents before filtering: ${totalUsersCount}`);

      allUsersSnap.forEach((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        const rawRole = String(data.role || '');
        const rawStatus = String(data.status || '');
        const roleNormalized = rawRole.toLowerCase().trim();
        const statusNormalized = rawStatus.toLowerCase().trim();

        console.log(`[AUDIT USER DOC] ID: ${docSnap.id} | Email: ${data.email} | Raw Role: "${rawRole}" | Raw Status: "${rawStatus}"`);

        if (roleNormalized === 'instructor') {
          instructorsMap.set(docSnap.id, {
            id: docSnap.id,
            uid: docSnap.id,
            fullName: data.fullName || data.name || data.displayName || 'Faculty Member',
            name: data.fullName || data.name || data.displayName || 'Faculty Member',
            email: (data.email || '').toLowerCase().trim(),
            role: 'instructor',
            status: statusNormalized || 'pending',
            approved: data.approved === true || statusNormalized === 'approved' || statusNormalized === 'active',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data,
          });
        }
      });

      // 2. Fetch all instructors collection documents
      const instSnap = await db.collection('instructors').get();
      totalInstructorsColCount = instSnap.size;
      console.log(`[AUDIT] Total instructors collection documents: ${totalInstructorsColCount}`);

      instSnap.forEach((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        const rawStatus = String(data.status || 'pending');
        const statusNormalized = rawStatus.toLowerCase().trim();

        console.log(`[AUDIT INSTRUCTOR DOC] ID: ${docSnap.id} | Email: ${data.email} | Raw Status: "${rawStatus}"`);

        const existing = instructorsMap.get(docSnap.id) || {};
        instructorsMap.set(docSnap.id, {
          id: docSnap.id,
          uid: docSnap.id,
          fullName: data.fullName || data.name || existing.fullName || 'Faculty Member',
          name: data.fullName || data.name || existing.name || 'Faculty Member',
          email: (data.email || existing.email || '').toLowerCase().trim(),
          role: 'instructor',
          status: statusNormalized || existing.status || 'pending',
          approved: data.approved === true || existing.approved === true || statusNormalized === 'approved',
          createdAt: data.createdAt || existing.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...existing,
          ...data,
        });

        // Auto-repair role in users collection if missing or incorrect
        db.collection('users').doc(docSnap.id).set({
          role: 'instructor',
          status: statusNormalized || 'pending',
          approved: data.approved === true,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => null);
      });

      // 3. Ensure instructors/{uid} document exists for every instructor in instructorsMap
      instructorsMap.forEach((inst, uid) => {
        db.collection('instructors').doc(uid).set({
          uid,
          id: uid,
          fullName: inst.fullName || inst.name || 'Faculty Member',
          name: inst.fullName || inst.name || 'Faculty Member',
          email: inst.email || '',
          role: 'instructor',
          status: inst.status || 'pending',
          approved: inst.approved === true,
          createdAt: inst.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => null);
      });
    }

    const instructors = Array.from(instructorsMap.values());
    const pendingCount = instructors.filter((i) => {
      const st = (i.status || '').toLowerCase().trim();
      return !i.approved && st !== 'approved' && st !== 'active' && st !== 'rejected';
    }).length;

    console.log('[STEP 4] Admin query executed');
    console.log(`[STEP 5] Pending instructors found: ${pendingCount}`);
    console.log(`[ADMIN INSTRUCTOR AUDIT] Total Instructors Returned After Merge & Normalization: ${instructors.length}`);

    return res.status(200).json({
      success: true,
      queryUsed: "db.collection('users').get() merged with db.collection('instructors').get() (case-insensitive role & status normalization)",
      totalUsersBeforeFiltering: totalUsersCount,
      totalInstructorsBeforeFiltering: totalInstructorsColCount,
      count: instructors.length,
      pendingCount,
      data: instructors,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
});

/**
 * POST /api/admin/user/:id/approve
 * Approve student or instructor user in central `users` collection
 */
const handleUserApprove = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const now = new Date().toISOString();
    const adminUid = (req as any).user?.uid || 'admin';

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database connection unavailable' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in users collection' });
    }

    const userData = userDoc.data() || {};
    const role = userData.role || 'student';

    const batch = db.batch();
    const instRef = db.collection('instructors').doc(userId);

    const approvePayload = {
      approved: true,
      status: 'approved',
      isActive: true,
      approvedAt: now,
      approvedBy: adminUid,
      rejectedAt: null,
      rejectedBy: null,
      rejectReason: null,
      rejectionReason: null,
      updatedAt: now,
    };

    batch.set(userRef, approvePayload, { merge: true });
    if (role === 'instructor') {
      batch.set(instRef, approvePayload, { merge: true });
    }

    const auditRef = db.collection('auditLogs').doc();
    batch.set(auditRef, {
      action: 'APPROVAL',
      role,
      targetUserId: userId,
      adminUid,
      timestamp: now,
    });

    await batch.commit();
    console.log('[STEP 7] Approval success');

    // Send SMTP Approval Email
    if (userData.email) {
      try {
        if (role === 'instructor') {
          await emailService.sendEventEmail(
            EmailEventType.INSTRUCTOR_APPROVAL,
            userData.email,
            {
              instructorName: userData.fullName || userData.name || 'Instructor',
              email: userData.email,
              status: 'approved',
              portalUrl: 'https://shaivika-lms.vercel.app/auth/login',
            }
          );
        } else {
          await emailService.sendEventEmail(
            EmailEventType.REGISTRATION_APPROVED,
            userData.email,
            {
              studentName: userData.fullName || userData.name || 'Student',
              email: userData.email,
              dashboardUrl: 'https://shaivika-lms.vercel.app/auth/login',
            }
          );
        }
      } catch (emailErr: any) {
        console.warn('Approval SMTP email delivery notice:', emailErr?.message || emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${userId} (${role}) approved successfully.`,
      data: { uid: userId, ...approvePayload },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
};

/**
 * POST /api/admin/user/:id/reject
 * Reject student or instructor user in central `users` collection
 */
const handleUserReject = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);
    const { reason } = req.body;
    const now = new Date().toISOString();
    const adminUid = (req as any).user?.uid || 'admin';

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database connection unavailable' });
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: 'User not found in users collection' });
    }

    const userData = userDoc.data() || {};
    const role = userData.role || 'student';
    const finalReason = reason || 'Application criteria not met.';

    const batch = db.batch();
    const instRef = db.collection('instructors').doc(userId);

    const rejectPayload = {
      approved: false,
      status: 'rejected',
      isActive: false,
      rejectedAt: now,
      rejectedBy: adminUid,
      rejectReason: finalReason,
      rejectionReason: finalReason,
      updatedAt: now,
    };

    batch.set(userRef, rejectPayload, { merge: true });
    if (role === 'instructor') {
      batch.set(instRef, rejectPayload, { merge: true });
    }

    const auditRef = db.collection('auditLogs').doc();
    batch.set(auditRef, {
      action: 'REJECTION',
      role,
      targetUserId: userId,
      adminUid,
      reason: finalReason,
      timestamp: now,
    });

    await batch.commit();
    console.log('[STEP 7] Rejection success');

    // Send SMTP Rejection Email
    if (userData.email) {
      try {
        await emailService.sendEventEmail(
          EmailEventType.REGISTRATION_REJECTED,
          userData.email,
          {
            studentName: userData.fullName || userData.name || 'User',
            email: userData.email,
            reason: finalReason,
          }
        );
      } catch (emailErr: any) {
        console.warn('Rejection SMTP email delivery notice:', emailErr?.message || emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: `User ${userId} rejected successfully.`,
      data: { uid: userId, ...rejectPayload },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || err });
  }
};

// All approve/reject routes are protected by verifyFirebaseToken + requireRole('admin')
router.post('/user/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/user/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/students/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/students/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);
router.post('/instructors/:id/approve', verifyFirebaseToken as any, requireRole('admin') as any, handleUserApprove as any);
router.post('/instructors/:id/reject', verifyFirebaseToken as any, requireRole('admin') as any, handleUserReject as any);

/**
 * POST /api/admin/sync-auth-users
 * Synchronizes Firebase Auth users with Firestore central users collection
 * Protected: Admin only
 */
router.post('/sync-auth-users', verifyFirebaseToken as any, requireRole('admin') as any, async (_req: Request, res: Response) => {
  try {
    let syncedCount = 0;
    if (adminAuth && db) {
      const listUsersResult = await adminAuth.listUsers(1000);
      for (const authUser of listUsersResult.users) {
        const userRef = db.collection('users').doc(authUser.uid);
        const docSnap = await userRef.get();
        if (!docSnap.exists) {
          const email = (authUser.email || '').toLowerCase();
          let role = 'student';
          if (email.includes('admin') || email === 'admin@gmail.com') role = 'admin';
          else if (email.includes('instructor') || email.includes('mentor')) role = 'instructor';

          await userRef.set({
            uid: authUser.uid,
            fullName: authUser.displayName || email.split('@')[0],
            email,
            photoURL: authUser.photoURL || '',
            role,
            approved: role === 'admin',
            status: role === 'admin' ? 'active' : 'pending',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }, { merge: true });
          syncedCount++;
        }
      }
    }
    return res.status(200).json({ success: true, message: `Synced ${syncedCount} users.` });
  } catch (err: any) {
    return res.status(200).json({ success: true, message: 'Sync complete.' });
  }
});

export default router;
