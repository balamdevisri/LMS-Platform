import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  joined: string;
  courses: number;
  role: 'student' | 'admin' | 'instructor';
  status: 'Active' | 'Suspended';
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_students_v2';
const MOCK_EMAILS = [
  'alex.johnson@stanford.edu',
  'sam.wu@mit.edu',
  'd.miller@tech.org',
  'elena@berkeley.edu'
];

class StudentService {
  private getLocalStudents(): StudentUser[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: StudentUser[] = JSON.parse(saved);
        // Filter out any legacy mock data
        return parsed.filter((s) => !MOCK_EMAILS.includes(s.email.toLowerCase()));
      }
    } catch (e) {
      console.warn('Failed to parse local students cache:', e);
    }
    return [];
  }

  private saveLocalStudents(students: StudentUser[]): void {
    const clean = students.filter((s) => !MOCK_EMAILS.includes(s.email.toLowerCase()));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clean));
  }

  /**
   * Subscribe to real-time student updates from Firestore database.
   */
  subscribeToStudents(callback: (students: StudentUser[]) => void): () => void {
    const localData = this.getLocalStudents();
    callback(localData);

    if (!db) {
      return () => {};
    }

    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersRef,
        (snapshot) => {
          const firestoreStudents: StudentUser[] = [];
          
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const email = (data.email || '').toLowerCase();
            const role = (data.role || 'student').toLowerCase();

            // Filter out mock data and only include actual registered student accounts
            if (!MOCK_EMAILS.includes(email) && (role === 'student' || role === 'user')) {
              firestoreStudents.push({
                id: docSnap.id,
                name: data.name || data.displayName || email.split('@')[0] || 'Student User',
                email: data.email || '',
                joined: data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently',
                courses: data.enrolledCoursesCount || 1,
                role: 'student',
                status: data.status || 'Active',
                photoURL: data.photoURL || '',
                createdAt: data.createdAt,
                lastLogin: data.lastLogin,
              });
            }
          });

          // Combine with locally added custom students (non-mock)
          const localOnly = localData.filter(
            (ls) => !firestoreStudents.some((fs) => fs.email.toLowerCase() === ls.email.toLowerCase())
          );
          const finalStudents = [...firestoreStudents, ...localOnly];

          this.saveLocalStudents(finalStudents);
          callback(finalStudents);
        },
        (error) => {
          console.warn('Realtime Firestore students listener notice:', error);
          callback(this.getLocalStudents());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Realtime subscription error:', e);
      return () => {};
    }
  }

  registerSignedUpStudent(uid: string, name: string, email: string, photoURL?: string): void {
    if (MOCK_EMAILS.includes(email.toLowerCase())) return;
    
    const newStudent: StudentUser = {
      id: uid || `st_${Date.now()}`,
      name,
      email,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      courses: 1,
      role: 'student',
      status: 'Active',
      photoURL: photoURL || '',
      createdAt: new Date().toISOString(),
    };

    const current = this.getLocalStudents();
    if (!current.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      const updated = [newStudent, ...current];
      this.saveLocalStudents(updated);
    }
  }

  async addStudent(name: string, email: string): Promise<StudentUser> {
    const newStudent: StudentUser = {
      id: `st_${Date.now()}`,
      name,
      email,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      courses: 1,
      role: 'student',
      status: 'Active',
    };

    const current = this.getLocalStudents();
    const updated = [newStudent, ...current];
    this.saveLocalStudents(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'users', newStudent.id), {
          uid: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          role: 'student',
          status: 'Active',
          createdAt: new Date().toISOString(),
          enrolledCoursesCount: 1,
        });
      } catch (err) {
        console.warn('Firestore add student notice:', err);
      }
    }

    return newStudent;
  }

  async updateStudent(student: StudentUser): Promise<void> {
    const current = this.getLocalStudents();
    const updated = current.map((s) => (s.id === student.id ? student : s));
    this.saveLocalStudents(updated);

    if (db && student.id) {
      try {
        await updateDoc(doc(db, 'users', student.id), {
          name: student.name,
          email: student.email,
          status: student.status,
          enrolledCoursesCount: student.courses,
        });
      } catch (err) {
        console.warn('Firestore update student notice:', err);
      }
    }
  }

  async deleteStudent(id: string): Promise<void> {
    const current = this.getLocalStudents();
    const updated = current.filter((s) => s.id !== id);
    this.saveLocalStudents(updated);

    if (db && id) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        console.warn('Firestore delete student notice:', err);
      }
    }
  }
}

export const studentService = new StudentService();
