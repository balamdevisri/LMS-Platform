import { db } from '@/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { LiveClass } from '../types';

export class FrontendLiveClassRepository {
  private collectionName = 'liveClasses';

  // --- REALTIME SUBSCRIBERS ---
  subscribeLiveClasses(callback: (classes: LiveClass[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const ref = collection(db, this.collectionName);
    const q = query(ref, orderBy('startTime', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: LiveClass[] = [];
        snapshot.forEach((d) => list.push(d.data() as LiveClass));
        callback(list);
      },
      (err) => {
        console.warn('[LiveClasses Repository Error]:', err);
        callback([]);
      }
    );
  }

  subscribeLiveClassById(classId: string, callback: (liveClass: LiveClass | null) => void): () => void {
    if (!db) {
      callback(null);
      return () => {};
    }

    const ref = doc(db, this.collectionName, classId);
    return onSnapshot(ref, (snap) => {
      callback(snap.exists() ? (snap.data() as LiveClass) : null);
    });
  }

  // --- CRUD REPOSITORY OPERATIONS ---
  async createLiveClass(data: LiveClass): Promise<void> {
    if (db) {
      await setDoc(doc(db, this.collectionName, data.classId), data);
    }
  }

  async updateLiveClass(classId: string, updates: Partial<LiveClass>): Promise<void> {
    if (db) {
      await updateDoc(doc(db, this.collectionName, classId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
  }

  async deleteLiveClass(classId: string): Promise<void> {
    if (db) {
      await deleteDoc(doc(db, this.collectionName, classId));
    }
  }

  // --- SUBCOLLECTION REPOSITORIES ---
  subscribeSubcollection<T>(classId: string, subcollectionName: string, callback: (items: T[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const ref = collection(db, this.collectionName, classId, subcollectionName);
    return onSnapshot(ref, (snap) => {
      const list: T[] = [];
      snap.forEach((d) => list.push(d.data() as T));
      callback(list);
    });
  }

  async addSubcollectionDoc<T extends { [key: string]: any }>(classId: string, subcollectionName: string, docId: string, data: T): Promise<void> {
    if (db) {
      await setDoc(doc(db, this.collectionName, classId, subcollectionName, docId), data);
    }
  }
}

export const frontendLiveClassRepository = new FrontendLiveClassRepository();
