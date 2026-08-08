import { Request, Response } from 'express';
import { db } from '../firebase';

/**
 * Enterprise User Management Controller
 * Uses the `users` collection as the single source of truth.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users: any[] = [];
    if (db) {
      const snapshot = await db.collection('users').get();
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Fetched users successfully from central users collection.',
      data: users,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (db) {
      const doc = await db.collection('users').doc(id).get();
      if (doc.exists) {
        return res.status(200).json({
          success: true,
          data: { id: doc.id, ...doc.data() },
        });
      }
    }
    return res.status(404).json({ success: false, message: 'User document not found.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updates = req.body;
    if (db) {
      const userRef = db.collection('users').doc(id);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ success: false, message: 'User not found in users collection.' });
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await userRef.update(updatedData);

      return res.status(200).json({
        success: true,
        message: `User ${id} updated successfully in central users collection.`,
        data: { uid: id, ...updates },
      });
    }
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    if (db) {
      await db.collection('users').doc(id).delete();
    }
    return res.status(200).json({
      success: true,
      message: `User ${id} removed successfully from users collection.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { role } = req.body; // 'student' | 'instructor' | 'admin'

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role specified. Allowed: student, instructor, admin' });
    }

    if (!db) {
      return res.status(500).json({ success: false, error: 'Database connection failed' });
    }

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ success: false, message: 'User not found in users collection.' });
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      role,
      updatedAt: now,
    };

    if (role === 'admin') {
      updatePayload.approved = true;
      updatePayload.status = 'active';
      updatePayload.isActive = true;
    } else if (role === 'instructor') {
      updatePayload.approved = false;
      updatePayload.status = 'pending';
      updatePayload.isActive = false;
    } else if (role === 'student') {
      updatePayload.approved = false;
      updatePayload.status = 'pending';
      updatePayload.isActive = true;
    }

    await userRef.update(updatePayload);

    return res.status(200).json({
      success: true,
      message: `User ${id} role updated to '${role}' in central users collection.`,
      data: { uid: id, role, ...updatePayload },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, approved } = req.body;
    if (db) {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (status !== undefined) {
        updateData.status = status;
        updateData.isActive = status === 'active' || status === 'Active' || status === 'approved';
      }
      if (approved !== undefined) {
        updateData.approved = Boolean(approved);
      }
      await db.collection('users').doc(id).update(updateData);
    }
    return res.status(200).json({
      success: true,
      message: `User ${id} status updated successfully in users collection.`,
      data: { uid: id, status, approved },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
