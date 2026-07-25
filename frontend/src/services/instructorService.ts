import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

export interface InstructorUser {
  id: string;
  name: string;
  email: string;
  specialty: string;
  joined: string;
  assignedCourses: number;
  studentsCount: string;
  rating: number;
  status: 'Verified' | 'Pending';
  avatar?: string;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_instructors_v2';
const MOCK_INSTRUCTOR_EMAILS = [
  'sarah.j@stanford.edu',
  'm.vance@ai.research.org',
  'elena.r@framer.com'
];

class InstructorService {
  private getLocalInstructors(): InstructorUser[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: InstructorUser[] = JSON.parse(saved);
        // Filter out legacy mock data
        return parsed.filter((i) => !MOCK_INSTRUCTOR_EMAILS.includes(i.email.toLowerCase()));
      }
    } catch (e) {
      console.warn('Failed to parse local instructors cache:', e);
    }
    return [];
  }

  private saveLocalInstructors(instructors: InstructorUser[]): void {
    const clean = instructors.filter((i) => !MOCK_INSTRUCTOR_EMAILS.includes(i.email.toLowerCase()));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  }

  /**
   * Subscribe to real-time instructor updates from Firestore database.
   */
  subscribeToInstructors(callback: (instructors: InstructorUser[]) => void): () => void {
    const localData = this.getLocalInstructors();
    callback(localData);

    if (!db) {
      return () => {};
    }

    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersRef,
        (snapshot) => {
          const firestoreInstructors: InstructorUser[] = [];
          
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const email = (data.email || '').toLowerCase();

            // Include real registered users with role 'instructor' or admin creators
            if (!MOCK_INSTRUCTOR_EMAILS.includes(email) && data.role === 'instructor') {
              firestoreInstructors.push({
                id: docSnap.id,
                name: data.name || data.displayName || 'Faculty Member',
                email: data.email || '',
                specialty: data.specialty || 'Linux & Systems Architecture',
                joined: data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently',
                assignedCourses: data.assignedCourses || 1,
                studentsCount: data.studentsCount || '0',
                rating: data.rating || 5.0,
                status: data.status === 'Pending' ? 'Pending' : 'Verified',
                avatar: data.photoURL || '',
              });
            }
          });

          // Combine with locally created faculty (non-mock)
          const localOnly = localData.filter(
            (li) => !firestoreInstructors.some((fi) => fi.email.toLowerCase() === li.email.toLowerCase())
          );
          const finalInstructors = [...firestoreInstructors, ...localOnly];

          this.saveLocalInstructors(finalInstructors);
          callback(finalInstructors);
        },
        (error) => {
          console.warn('Realtime Firestore instructors listener notice:', error);
          callback(this.getLocalInstructors());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Realtime subscription error:', e);
      return () => {};
    }
  }

  async addInstructor(name: string, email: string, specialty: string): Promise<InstructorUser> {
    const newInstructor: InstructorUser = {
      id: `inst_${Date.now()}`,
      name,
      email,
      specialty: specialty || 'Linux & System Architecture',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedCourses: 1,
      studentsCount: '0',
      rating: 5.0,
      status: 'Verified',
    };

    const current = this.getLocalInstructors();
    const updated = [newInstructor, ...current];
    this.saveLocalInstructors(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'users', newInstructor.id), {
          uid: newInstructor.id,
          name: newInstructor.name,
          email: newInstructor.email,
          specialty: newInstructor.specialty,
          role: 'instructor',
          status: 'Verified',
          createdAt: new Date().toISOString(),
          assignedCourses: 1,
          rating: 5.0,
        });
      } catch (err) {
        console.warn('Firestore add instructor notice:', err);
      }
    }

    return newInstructor;
  }

  async updateInstructor(instructor: InstructorUser): Promise<void> {
    const current = this.getLocalInstructors();
    const updated = current.map((i) => (i.id === instructor.id ? instructor : i));
    this.saveLocalInstructors(updated);

    if (db && instructor.id) {
      try {
        await updateDoc(doc(db, 'users', instructor.id), {
          name: instructor.name,
          email: instructor.email,
          specialty: instructor.specialty,
          status: instructor.status,
          assignedCourses: instructor.assignedCourses,
        });
      } catch (err) {
        console.warn('Firestore update instructor notice:', err);
      }
    }
  }

  async deleteInstructor(id: string): Promise<void> {
    const current = this.getLocalInstructors();
    const updated = current.filter((i) => i.id !== id);
    this.saveLocalInstructors(updated);

    if (db && id) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        console.warn('Firestore delete instructor notice:', err);
      }
    }
  }
}

export const instructorService = new InstructorService();
