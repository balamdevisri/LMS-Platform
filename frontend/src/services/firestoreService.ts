import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { StudentFirestoreDocument } from '@/types/student';

export class FirestoreService {
  /**
   * Create a Firestore document in Collection: students (Document ID: Firebase UID)
   */
  public async createStudentDocument(data: StudentFirestoreDocument): Promise<void> {
    if (!db) {
      console.warn('Firestore is not initialized. Caching record locally.');
      this.cacheStudentLocally(data);
      return;
    }

    try {
      const studentDocRef = doc(db, 'students', data.uid);
      const userDocRef = doc(db, 'users', data.uid);

      const payload = {
        uid: data.uid,
        fullName: data.fullName,
        name: data.fullName,
        email: data.email.toLowerCase(),
        githubUrl: data.githubUrl,
        linkedinUrl: data.linkedinUrl || '',
        portfolioUrl: data.portfolioUrl || '',
        emailVerified: false,
        status: 'email_verification_pending',
        role: 'student',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastLogin: null,
      };

      await setDoc(studentDocRef, payload);
      await setDoc(userDocRef, payload, { merge: true }).catch(() => null);

      this.cacheStudentLocally(data);
    } catch (error: any) {
      console.warn('Firestore write notice:', error);
      this.cacheStudentLocally(data);
      throw new Error(error?.message || 'Failed to save student details in Firestore database.');
    }
  }

  private cacheStudentLocally(data: StudentFirestoreDocument): void {
    try {
      const storageKey = 'shaivika_realtime_students_v3';
      const existing = localStorage.getItem(storageKey);
      const list = existing ? JSON.parse(existing) : [];

      const idx = list.findIndex((s: any) => s.uid === data.uid || s.email === data.email);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
      } else {
        list.unshift(data);
      }

      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.warn('Local fallback storage notice:', e);
    }
  }
}

export const firestoreService = new FirestoreService();
