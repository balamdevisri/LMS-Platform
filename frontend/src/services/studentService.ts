import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
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
  provider?: 'github.com' | 'password' | string;
  githubUsername?: string;
  createdAt?: string;
  lastLogin?: string;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_students_v3';

const DEFAULT_STUDENTS: StudentUser[] = [
  {
    id: 'st_101',
    name: 'Bhanu Prakash Achari',
    email: 'bhanuprakashachari5092@gmail.com',
    joined: 'Jul 24, 2026',
    courses: 2,
    role: 'student',
    status: 'Active',
    photoURL: 'https://avatars.githubusercontent.com/u/10001?v=4',
    provider: 'github.com',
    githubUsername: 'bhanuprakash5092',
  },
  {
    id: 'st_102',
    name: 'Priya Sharma',
    email: 'priya.sharma@shaivika.ai',
    joined: 'Jul 22, 2026',
    courses: 1,
    role: 'student',
    status: 'Active',
    provider: 'password',
  },
  {
    id: 'st_103',
    name: 'Alex Chen',
    email: 'alex.chen@shaivika.ai',
    joined: 'Jul 20, 2026',
    courses: 1,
    role: 'student',
    status: 'Active',
    photoURL: 'https://avatars.githubusercontent.com/u/10002?v=4',
    provider: 'github.com',
    githubUsername: 'alexc-dev',
  },
];

class StudentService {
  private getLocalStudents(): StudentUser[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: StudentUser[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local students cache:', e);
    }
    return DEFAULT_STUDENTS;
  }

  private saveLocalStudents(students: StudentUser[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shaivika_student_updated'));
      }
    } catch (e) {
      console.warn('Failed to save local students cache:', e);
    }
  }

  /**
   * Directly fetch all students from Firestore users collection.
   */
  async fetchFirestoreStudentsDirectly(): Promise<StudentUser[]> {
    const currentLocal = this.getLocalStudents();
    if (!db) return currentLocal;

    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const firestoreStudents: StudentUser[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const email = (data.email || '').toLowerCase();
        const role = (data.role || 'student').toLowerCase();

        if (role !== 'admin') {
          const photoURL = data.photoURL || data.avatar || '';
          const isGithub =
            data.provider === 'github.com' ||
            data.providerId === 'github.com' ||
            photoURL.includes('githubusercontent');

          const provider = isGithub ? 'github.com' : 'password';
          const githubUsername = data.githubUsername || (isGithub ? email.split('@')[0] : undefined);

          firestoreStudents.push({
            id: docSnap.id,
            name: data.name || data.displayName || data.fullName || email.split('@')[0] || 'Student User',
            email: data.email || email || `${docSnap.id}@shaivika.ai`,
            joined: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently',
            courses: data.enrolledCoursesCount || 1,
            role: 'student',
            status: data.status || 'Active',
            photoURL,
            provider,
            githubUsername,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
          });
        }
      });

      const combinedMap = new Map<string, StudentUser>();
      // 1. Add Default Roster
      DEFAULT_STUDENTS.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
      // 2. Add Local Storage Roster
      currentLocal.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
      // 3. Add Firestore Documents
      firestoreStudents.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));

      const finalStudents = Array.from(combinedMap.values());
      this.saveLocalStudents(finalStudents);
      return finalStudents;
    } catch (e) {
      console.warn('Direct Firestore fetch error:', e);
      return currentLocal;
    }
  }

  /**
   * Subscribe to real-time student updates from Firestore database and local storage.
   */
  subscribeToStudents(callback: (students: StudentUser[]) => void): () => void {
    const handleUpdate = () => {
      const latest = this.getLocalStudents();
      callback(latest);
    };

    const initialData = this.getLocalStudents();
    callback(initialData);

    if (typeof window !== 'undefined') {
      window.addEventListener('shaivika_student_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }

    // Also trigger direct one-shot fetch for immediate population
    this.fetchFirestoreStudentsDirectly().then((fetched) => {
      if (fetched.length > 0) callback(fetched);
    });

    if (!db) {
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('shaivika_student_updated', handleUpdate);
          window.removeEventListener('storage', handleUpdate);
        }
      };
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

            if (role !== 'admin') {
              const photoURL = data.photoURL || data.avatar || '';
              const isGithub =
                data.provider === 'github.com' ||
                data.providerId === 'github.com' ||
                photoURL.includes('githubusercontent');

              const provider = isGithub ? 'github.com' : 'password';
              const githubUsername = data.githubUsername || (isGithub ? email.split('@')[0] : undefined);

              firestoreStudents.push({
                id: docSnap.id,
                name: data.name || data.displayName || data.fullName || email.split('@')[0] || 'Student User',
                email: data.email || email || `${docSnap.id}@shaivika.ai`,
                joined: data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recently',
                courses: data.enrolledCoursesCount || 1,
                role: 'student',
                status: data.status || 'Active',
                photoURL,
                provider,
                githubUsername,
                createdAt: data.createdAt,
                lastLogin: data.lastLogin,
              });
            }
          });

          const currentLocal = this.getLocalStudents();
          const combinedMap = new Map<string, StudentUser>();
          DEFAULT_STUDENTS.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
          currentLocal.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
          firestoreStudents.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));

          const finalStudents = Array.from(combinedMap.values());
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalStudents));
          callback(finalStudents);
        },
        (error) => {
          console.warn('Realtime Firestore students listener notice:', error);
          callback(this.getLocalStudents());
        }
      );

      return () => {
        if (unsubscribe) unsubscribe();
        if (typeof window !== 'undefined') {
          window.removeEventListener('shaivika_student_updated', handleUpdate);
          window.removeEventListener('storage', handleUpdate);
        }
      };
    } catch (e) {
      console.warn('Realtime subscription error:', e);
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('shaivika_student_updated', handleUpdate);
          window.removeEventListener('storage', handleUpdate);
        }
      };
    }
  }

  registerSignedUpStudent(
    uid: string,
    name: string,
    email: string,
    photoURL?: string,
    provider?: string,
    githubUsername?: string
  ): void {
    if (!email) return;
    
    const isGithub = provider === 'github.com' || (photoURL && photoURL.includes('githubusercontent'));
    const newStudent: StudentUser = {
      id: uid || `st_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      courses: 1,
      role: 'student',
      status: 'Active',
      photoURL: photoURL || '',
      provider: isGithub ? 'github.com' : 'password',
      githubUsername: githubUsername || (isGithub ? email.split('@')[0] : undefined),
      createdAt: new Date().toISOString(),
    };

    const current = this.getLocalStudents();
    const existingIdx = current.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existingIdx !== -1) {
      current[existingIdx] = { ...current[existingIdx], ...newStudent };
      this.saveLocalStudents(current);
    } else {
      const updated = [newStudent, ...current];
      this.saveLocalStudents(updated);
    }

    if (db && uid) {
      try {
        setDoc(doc(db, 'users', uid), {
          uid,
          name: newStudent.name,
          email: newStudent.email,
          photoURL: newStudent.photoURL,
          provider: newStudent.provider,
          githubUsername: newStudent.githubUsername,
          role: 'student',
          status: 'Active',
          createdAt: newStudent.createdAt,
          enrolledCoursesCount: 1,
        }, { merge: true }).catch((err) => console.warn('Firestore setDoc notice:', err));
      } catch (err) {
        console.warn('Firestore sync notice:', err);
      }
    }
  }

  async addStudent(name: string, email: string, provider: 'github.com' | 'password' = 'password'): Promise<StudentUser> {
    const isGithub = provider === 'github.com';
    const newStudent: StudentUser = {
      id: `st_${Date.now()}`,
      name,
      email,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      courses: 1,
      role: 'student',
      status: 'Active',
      provider,
      githubUsername: isGithub ? email.split('@')[0] : undefined,
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
          provider,
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
          provider: student.provider,
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
