import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFriendlyAuthErrorMessage } from './authService';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import type {
  UserProfile,
  UserStatus,
  ExtendedStudentStats
} from '@/types/user';

export interface StudentPerformanceSummary {
  overallScore: number;
  attendance: number;
  quizAverage: number;
  completion: number;
  engagement: number;
  trend: 'improving' | 'stable' | 'declining';
  riskLevel: 'low' | 'medium' | 'high';
  lastCalculatedAt: string;
}

export interface StudentUser extends UserProfile {
  id: string;
  name: string;
  joined: string;
  courses: number;
  studentPerformanceSummary?: StudentPerformanceSummary;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_students_v3';
import { API_BASE_URL } from '@/config/api';

class StudentService {
  private isMockUser(st: any): boolean {
    const id = String(st.id || st.uid || '');
    const email = (st.email || '').toLowerCase();
    return (
      id === 'st_101' ||
      id === 'st_102' ||
      id === 'st_103' ||
      email === 'priya.sharma@shaivika.ai' ||
      email === 'alex.chen@shaivika.ai'
    );
  }

  /**
   * Reads local students map combined from storage & defaults.
   */
  public getLocalStudents(): StudentUser[] {
    const combinedMap = new Map<string, StudentUser>();

    // 1. Realtime Students Cache (shaivika_realtime_students_v3 - Highest Priority)
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: StudentUser[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((st) => {
            if ((st.email || st.id || st.uid) && !this.isMockUser(st)) {
              const key = (st.email || st.id || st.uid).toLowerCase();
              combinedMap.set(key, this.normalizeStudentData(st));
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse local students cache:', e);
    }

    // 2. Admin Users Store (shaivika_admin_users_v3)
    try {
      const adminUsersRaw = localStorage.getItem('shaivika_admin_users_v3');
      if (adminUsersRaw) {
        const adminUsers = JSON.parse(adminUsersRaw);
        if (Array.isArray(adminUsers)) {
          adminUsers.forEach((u: any) => {
            const role = (u.role || 'student').toLowerCase();
            if (role !== 'admin' && u.email && !this.isMockUser(u)) {
              const emailLower = u.email.toLowerCase();
              if (!combinedMap.has(emailLower)) {
                combinedMap.set(emailLower, this.normalizeStudentData(u));
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse admin users cache:', e);
    }

    // 3. Fallback default student cohort if storage is empty
    if (combinedMap.size === 0) {
      const defaultScholars = [
        { id: 'st_01', name: 'Bhanu Prakash', email: 'bhanu.prakash@shaivika.ai', xp: 2850, track: 'React & Full-Stack Web', branch: 'Computer Science & AI', college: 'Shaivika AI Foundation', currentCourse: 'React JS Complete Course', learningScore: 96, courses: 4, completedCourses: 3 },
        { id: 'st_02', name: 'Aarav Sharma', email: 'aarav.sharma@shaivika.ai', xp: 2420, track: 'Python & AI Engineering', branch: 'AI & Data Engineering', college: 'Shaivika AI Foundation', currentCourse: 'Python Machine Learning & AI', learningScore: 92, courses: 3, completedCourses: 2 },
        { id: 'st_03', name: 'Ananya Reddy', email: 'ananya.reddy@shaivika.ai', xp: 2180, track: 'Cloud Architecture & DevOps', branch: 'Cloud & Systems Engineering', college: 'Shaivika AI Foundation', currentCourse: 'Cloud Architecture & DevOps', learningScore: 89, courses: 3, completedCourses: 2 },
        { id: 'st_04', name: 'Vikram Verma', email: 'vikram.verma@shaivika.ai', xp: 1940, track: 'Cybersecurity & Ethical Hacking', branch: 'Information Security', college: 'Shaivika AI Foundation', currentCourse: 'Cybersecurity & Ethical Hacking', learningScore: 87, courses: 2, completedCourses: 1 },
        { id: 'st_05', name: 'Sneha Patel', email: 'sneha.patel@shaivika.ai', xp: 1720, track: 'Linux Kernel & Systems', branch: 'Systems & OS Engineering', college: 'Shaivika AI Foundation', currentCourse: 'Linux Systems Mastery', learningScore: 85, courses: 2, completedCourses: 1 },
        { id: 'st_06', name: 'Rohan Gupta', email: 'rohan.gupta@shaivika.ai', xp: 1560, track: 'SQL & Database Engineering', branch: 'Database & Backend', college: 'Shaivika AI Foundation', currentCourse: 'SQL & Database Engineering', learningScore: 83, courses: 2, completedCourses: 1 },
        { id: 'st_07', name: 'Kavya Nair', email: 'kavya.nair@shaivika.ai', xp: 1380, track: 'Data Science & Analytics', branch: 'Data Science', college: 'Shaivika AI Foundation', currentCourse: 'Data Science Foundation', learningScore: 81, courses: 1, completedCourses: 1 },
        { id: 'st_08', name: 'Aditya Rao', email: 'aditya.rao@shaivika.ai', xp: 1190, track: 'Distributed Backend Systems', branch: 'Distributed Systems', college: 'Shaivika AI Foundation', currentCourse: 'Distributed Backend Engineering', learningScore: 78, courses: 1, completedCourses: 0 },
        { id: 'st_09', name: 'Meera Iyer', email: 'meera.iyer@shaivika.ai', xp: 980, track: 'React & Full-Stack Web', branch: 'Web Technologies', college: 'Shaivika AI Foundation', currentCourse: 'Frontend Web Engineering', learningScore: 76, courses: 1, completedCourses: 0 },
        { id: 'st_10', name: 'Kiran Kumar', email: 'kiran.kumar@shaivika.ai', xp: 820, track: 'Python & AI Engineering', branch: 'Machine Learning', college: 'Shaivika AI Foundation', currentCourse: 'Python for Beginners', learningScore: 74, courses: 1, completedCourses: 0 }
      ];
      defaultScholars.forEach((st) => {
        combinedMap.set(st.email.toLowerCase(), this.normalizeStudentData(st));
      });
    }

    const result = Array.from(combinedMap.values());
    return result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }

  private normalizeStudentData(data: any): StudentUser {
    const email = data.email || '';
    const id = data.id || data.uid || `st_${Date.now()}`;
    
    // Extract GitHub user handle from various possible fields
    const rawGithubUser =
      data.githubUsername ||
      data.githubHandle ||
      (data.github ? String(data.github).replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '') : undefined) ||
      (data.githubUrl ? String(data.githubUrl).replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '') : undefined);

    const isGithub =
      data.provider === 'github.com' ||
      data.providerId === 'github.com' ||
      data.authProvider === 'github.com' ||
      Boolean(rawGithubUser) ||
      (typeof data.photoURL === 'string' && data.photoURL.includes('github'));

    const calculatedUsername = rawGithubUser || (isGithub && email.includes('@') ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') : undefined);

    const name =
      (data.fullName && data.fullName !== 'Student User' ? data.fullName : '') ||
      (data.name && data.name !== 'Student User' ? data.name : '') ||
      (data.displayName && data.displayName !== 'Student User' ? data.displayName : '') ||
      calculatedUsername ||
      (email ? email.split('@')[0] : 'Learner');
    
    const photoURL =
      data.photoURL ||
      data.profilePhoto ||
      data.avatar ||
      (calculatedUsername ? `https://github.com/${calculatedUsername}.png?size=200` : '');

    const statusVal = data.status || (data.isActive === false ? 'Suspended' : 'Active');

    const calculatedXp = typeof data.xp === 'number'
      ? data.xp
      : (typeof data.points === 'number'
          ? data.points
          : (typeof data.learningScore === 'number' ? data.learningScore * 20 : 350));

    return {
      id,
      uid: id,
      name,
      fullName: name,
      email,
      photoURL,
      profilePhoto: photoURL,
      role: 'student',
      status: statusVal as UserStatus,
      isActive: statusVal === 'Active',
      joined: data.joined || (data.createdAt
        ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Recently'),
      joinedAt: data.joinedAt || data.createdAt || new Date().toISOString(),
      courses: data.courses || data.courseCount || data.enrolledCoursesCount || 1,
      courseCount: data.courseCount || data.courses || 1,
      completedCourses: data.completedCourses || data.completedCoursesCount || 0,
      currentCourse: data.currentCourse || 'Linux Systems & Administration Mastery',
      learningScore: data.learningScore || data.learningProgressPercent || 85,
      xp: calculatedXp,
      provider: isGithub ? 'github.com' : (data.provider || 'password'),
      githubUsername: calculatedUsername,
      branch: data.branch || 'AI & Computer Science',
      year: data.year || '1st Year',
      college: data.college || 'Shaivika AI Foundation Institute',
      phone: data.phone || '',
      github: data.github || (calculatedUsername ? `https://github.com/${calculatedUsername}` : undefined),
      githubUrl: data.githubUrl || (calculatedUsername ? `https://github.com/${calculatedUsername}` : undefined),
      linkedin: data.linkedin || '',
      portfolio: data.portfolio || '',
      bio: data.bio || 'Enthusiastic KaizenQ learner mastering Linux, AI, and DevOps.',
      skills: data.skills || ['Linux', 'Git', 'Python', 'AI Foundation'],
      emailVerified: data.emailVerified ?? data.isVerified ?? true,
      isVerified: data.isVerified ?? data.emailVerified ?? true,
      createdAt: data.createdAt || new Date().toISOString(),
      lastLogin: data.lastLogin || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      quizScores: data.quizScores || [
        { id: 'q1', title: 'Linux Command Line Fundamentals', score: 90, maxScore: 100, date: '2026-07-25' }
      ],
      assignmentScores: data.assignmentScores || [
        { id: 'a1', title: 'Interactive CLI Sandbox Assignment', score: 95, maxScore: 100, date: '2026-07-26' }
      ],
      certificates: data.certificates || [],
      linuxLabProgress: data.linuxLabProgress || {
        completedModules: 10,
        totalModules: 18,
        terminalCommandsRun: 210,
        score: 88,
        lastAccess: 'Just now',
        activeLabTitle: 'Linux File System & CLI Security',
      },
      recentActivity: data.recentActivity || [
        { id: 'act1', action: 'Joined KaizenQ Learning Platform', timestamp: 'Recently', type: 'login' }
      ],
      studentPerformanceSummary: data.studentPerformanceSummary || {
        overallScore: typeof data.learningScore === 'number' ? data.learningScore : 85,
        attendance: typeof data.attendance === 'number' ? data.attendance : 90,
        quizAverage: typeof data.quizAverage === 'number' ? data.quizAverage : 82,
        completion: typeof data.completionRate === 'number' ? data.completionRate : 75,
        engagement: typeof data.engagement === 'number' ? data.engagement : 88,
        trend: (data.learningScore || 85) >= 85 ? 'improving' : 'stable',
        riskLevel: (data.learningScore || 85) < 65 ? 'high' : (data.learningScore || 85) < 80 ? 'medium' : 'low',
        lastCalculatedAt: data.updatedAt || new Date().toISOString(),
      },
    };
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
   * Calculate top statistics for Student Management Dashboard.
   */
  public calculateStudentStats(students: StudentUser[]): ExtendedStudentStats {
    const totalStudents = students.length;
    let activeStudents = 0;
    let verifiedStudents = 0;
    let enrolledStudents = 0;
    let completedCourses = 0;
    let totalProgressSum = 0;

    students.forEach((st) => {
      if (st.status === 'Active' || st.isActive) activeStudents++;
      if (st.isVerified || st.emailVerified) verifiedStudents++;
      if ((st.courses || st.courseCount || 0) > 0) enrolledStudents++;
      completedCourses += st.completedCourses || 0;
      totalProgressSum += st.learningScore || 80;
    });

    const avgProgress = totalStudents > 0 ? Math.round(totalProgressSum / totalStudents) : 0;

    return {
      totalStudents,
      activeStudents,
      verifiedStudents,
      enrolledStudents,
      completedCourses,
      avgProgress,
    };
  }

  private deduplicateStudents(students: StudentUser[]): StudentUser[] {
    const idMap = new Map<string, StudentUser>();
    const emailMap = new Map<string, StudentUser>();
    const unique: StudentUser[] = [];

    students.forEach((st) => {
      if (!st) return;
      const id = (st.id || st.uid || '').trim();
      const email = (st.email || '').trim().toLowerCase();
      if (!id && !email) return;

      let existing: StudentUser | undefined;
      if (id && idMap.has(id)) {
        existing = idMap.get(id);
      } else if (email && emailMap.has(email)) {
        existing = emailMap.get(email);
      }

      if (existing) {
        Object.assign(existing, st);
        if (id) {
          existing.id = id;
          existing.uid = id;
          idMap.set(id, existing);
        }
        if (email) {
          existing.email = email;
          emailMap.set(email, existing);
        }
      } else {
        const canonicalId = id || st.uid || email;
        const copy = { ...st, id: canonicalId, uid: canonicalId };
        unique.push(copy);
        if (id) idMap.set(id, copy);
        if (email) emailMap.set(email, copy);
      }
    });

    return unique.sort((a, b) => (b.xp || 0) - (a.xp || 0));
  }

  /**
   * Directly fetch all students from Firestore students and users collections.
   */
  async fetchFirestoreStudentsDirectly(): Promise<StudentUser[]> {
    const currentLocal = this.getLocalStudents();
    if (!db) return currentLocal;

    try {
      const firestoreStudents: StudentUser[] = [];
      const studentsRef = collection(db, 'students');
      const usersRef = collection(db, 'users');

      const [studentsSnap, usersSnap] = await Promise.all([
        getDocs(studentsRef).catch(() => null),
        getDocs(usersRef).catch(() => null),
      ]);

      if (studentsSnap) {
        studentsSnap.forEach((docSnap: any) => {
          const data = docSnap.data();
          if (!this.isMockUser(data)) {
            firestoreStudents.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
          }
        });
      }

      if (usersSnap) {
        usersSnap.forEach((docSnap: any) => {
          const data = docSnap.data();
          const role = (data.role || 'student').toLowerCase();
          if (role !== 'admin' && !this.isMockUser(data)) {
            firestoreStudents.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
          }
        });
      }

      const finalStudents = this.deduplicateStudents([...firestoreStudents, ...currentLocal]);
      this.saveLocalStudents(finalStudents);
      return finalStudents;
    } catch (e) {
      console.warn('Direct Firestore fetch notice:', e);
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
      const studentsRef = collection(db, 'students');
      const usersRef = collection(db, 'users');

      let firestoreStudentDocs: StudentUser[] = [];
      let firestoreUserDocs: StudentUser[] = [];

      const emitCombined = () => {
        const currentLocal = this.getLocalStudents();
        const finalStudents = this.deduplicateStudents([
          ...firestoreStudentDocs,
          ...firestoreUserDocs,
          ...currentLocal,
        ]);

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalStudents));
        callback(finalStudents);
      };

      const unsubStudents = onSnapshot(
        studentsRef,
        (snapshot) => {
          firestoreStudentDocs = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (!this.isMockUser(data)) {
              firestoreStudentDocs.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
            }
          });
          emitCombined();
        },
        (error) => {
          console.warn('Realtime Firestore students listener notice:', error);
          callback(this.getLocalStudents());
        }
      );

      const unsubUsers = onSnapshot(
        usersRef,
        (snapshot) => {
          firestoreUserDocs = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const role = (data.role || 'student').toLowerCase();
            if (role !== 'admin' && !this.isMockUser(data)) {
              firestoreUserDocs.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
            }
          });
          emitCombined();
        },
        (error) => {
          console.warn('Realtime Firestore users listener notice:', error);
        }
      );

      return () => {
        if (unsubStudents) unsubStudents();
        if (unsubUsers) unsubUsers();
        if (typeof window !== 'undefined') {
          window.removeEventListener('shaivika_student_updated', handleUpdate);
          window.removeEventListener('storage', handleUpdate);
        }
      };
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
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
    const newStudent = this.normalizeStudentData({
      id: uid || `st_${Date.now()}`,
      uid: uid || `st_${Date.now()}`,
      name: name || email.split('@')[0],
      fullName: name || email.split('@')[0],
      email,
      photoURL: photoURL || '',
      provider: isGithub ? 'github.com' : 'password',
      githubUsername: githubUsername || (isGithub ? email.split('@')[0] : undefined),
      status: 'Active',
      role: 'student',
      createdAt: new Date().toISOString(),
    });

    const current = this.getLocalStudents();
    const existingIdx = current.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existingIdx !== -1) {
      current[existingIdx] = { ...current[existingIdx], ...newStudent };
      this.saveLocalStudents(current);
    } else {
      const updated = [newStudent, ...current];
      this.saveLocalStudents(updated);
    }

    try {
      const adminUsersRaw = localStorage.getItem('shaivika_admin_users_v3');
      const adminUsers = adminUsersRaw ? JSON.parse(adminUsersRaw) : [];
      const idx = adminUsers.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (idx !== -1) {
        adminUsers[idx] = { ...adminUsers[idx], ...newStudent };
      } else {
        adminUsers.unshift(newStudent);
      }
      localStorage.setItem('shaivika_admin_users_v3', JSON.stringify(adminUsers));
    } catch (e) {
      console.warn('Failed to sync to admin users store:', e);
    }

    if (db && uid) {
      const activeDb = db;
      try {
        const payload = {
          uid,
          fullName: newStudent.fullName,
          name: newStudent.name,
          email: newStudent.email,
          photoURL: newStudent.photoURL,
          profilePhoto: newStudent.photoURL,
          provider: newStudent.provider,
          githubUsername: newStudent.githubUsername,
          role: 'student',
          status: newStudent.status || 'approved',
          approved: true,
          branch: newStudent.branch,
          year: newStudent.year,
          college: newStudent.college,
          phone: newStudent.phone,
          github: newStudent.github,
          bio: newStudent.bio,
          skills: newStudent.skills,
          emailVerified: true,
          isActive: true,
          courseCount: 1,
          completedCourses: 0,
          currentCourse: newStudent.currentCourse,
          learningScore: 85,
          joinedAt: newStudent.joinedAt,
          createdAt: newStudent.createdAt,
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const uRef = doc(activeDb, 'users', uid);
        const sRef = doc(activeDb, 'students', uid);
        setDoc(uRef, payload, { merge: true }).catch((err) => console.warn('Firestore setDoc notice:', err));
        setDoc(sRef, payload, { merge: true }).catch((err) => console.warn('Firestore setDoc notice:', err));
      } catch (err) {
        console.warn('Firestore sync notice:', err);
      }
    }
  }

  async addStudent(name: string, email: string, provider: 'github.com' | 'password' = 'password'): Promise<StudentUser> {
    const isGithub = provider === 'github.com';
    const newStudent = this.normalizeStudentData({
      id: `st_${Date.now()}`,
      uid: `st_${Date.now()}`,
      name,
      fullName: name,
      email,
      provider,
      githubUsername: isGithub ? email.split('@')[0] : undefined,
      status: 'Active',
      role: 'student',
      createdAt: new Date().toISOString(),
    });

    const current = this.getLocalStudents();
    const updated = [newStudent, ...current];
    this.saveLocalStudents(updated);

    if (db) {
      const activeDb = db;
      try {
        const payload = {
          uid: newStudent.id,
          fullName: newStudent.name,
          name: newStudent.name,
          email: newStudent.email,
          role: 'student',
          status: 'Active',
          approved: true,
          provider,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true,
          learningScore: 85,
          courseCount: 1,
          completedCourses: 0,
        };

        const uRef = doc(activeDb, 'users', newStudent.id);
        const sRef = doc(activeDb, 'students', newStudent.id);
        await setDoc(uRef, payload, { merge: true }).catch(() => null);
        await setDoc(sRef, payload, { merge: true }).catch(() => null);
      } catch (err) {
        console.warn('Firestore add student notice:', err);
      }
    }

    return newStudent;
  }

  async updateStudent(student: StudentUser): Promise<void> {
    const current = this.getLocalStudents();
    const updated = current.map((s) => (s.id === student.id || s.uid === student.uid ? student : s));
    this.saveLocalStudents(updated);

    if (db && student.id) {
      const activeDb = db;
      const id = student.id;
      try {
        const payload = {
          fullName: student.name || student.fullName,
          name: student.name,
          email: student.email,
          status: student.status,
          approved: student.status === 'approved' || student.status === 'Active' || student.approved === true,
          isActive: student.status === 'Active' || student.status === 'approved',
          branch: student.branch,
          year: student.year,
          college: student.college,
          phone: student.phone,
          bio: student.bio,
          skills: student.skills,
          provider: student.provider,
          updatedAt: new Date().toISOString(),
        };

        const uRef = doc(activeDb, 'users', id);
        const sRef = doc(activeDb, 'students', id);
        await updateDoc(uRef, payload).catch(() => setDoc(uRef, payload, { merge: true }));
        await updateDoc(sRef, payload).catch(() => setDoc(sRef, payload, { merge: true }));
      } catch (err) {
        console.warn('Firestore update student notice:', err);
      }
    }
  }

  async toggleStudentStatus(id: string): Promise<StudentUser | null> {
    const current = this.getLocalStudents();
    const target = current.find((s) => s.id === id || s.uid === id);
    if (!target) return null;

    const newStatus: UserStatus = target.status === 'Active' || target.status === 'approved' ? 'Suspended' : 'Active';
    const updatedStudent: StudentUser = {
      ...target,
      status: newStatus,
      approved: newStatus === 'Active',
      isActive: newStatus === 'Active',
      updatedAt: new Date().toISOString(),
    };

    await this.updateStudent(updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    // 1. Purge from real-time student cache
    const current = this.getLocalStudents();
    const targetStudent = current.find((s) => s.id === id || s.uid === id);
    const targetEmail = targetStudent?.email?.toLowerCase();
    const updated = current.filter((s) => s.id !== id && s.uid !== id && (targetEmail ? s.email?.toLowerCase() !== targetEmail : true));
    this.saveLocalStudents(updated);

    // 2. Purge from admin users cache
    try {
      const adminUsersRaw = localStorage.getItem('shaivika_admin_users_v3');
      if (adminUsersRaw) {
        const adminUsers = JSON.parse(adminUsersRaw);
        if (Array.isArray(adminUsers)) {
          const filteredAdmin = adminUsers.filter((u: any) => u.id !== id && u.uid !== id && (targetEmail ? u.email?.toLowerCase() !== targetEmail : true));
          localStorage.setItem('shaivika_admin_users_v3', JSON.stringify(filteredAdmin));
        }
      }
    } catch (e) {
      console.warn('Failed to purge student from admin users cache:', e);
    }

    // 3. Parallel asynchronous backend & Firestore deletion (non-blocking)
    const deleteTasks: Promise<any>[] = [
      fetch(`${API_BASE_URL}/admin/student/${id}`, { method: 'DELETE' }).catch(() => null),
    ];

    if (db && id) {
      const activeDb = db;
      const studentId = id;
      deleteTasks.push(deleteDoc(doc(activeDb, 'users', studentId)).catch(() => null));
      deleteTasks.push(deleteDoc(doc(activeDb, 'students', studentId)).catch(() => null));
    }

    await Promise.allSettled(deleteTasks);
  }

  /**
   * Register Student with GitHub auto-fetch & welcome email via Backend API / Firestore
   */
  async registerStudent(payload: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    githubUrl: string;
    linkedin?: string;
    portfolio?: string;
    phone?: string;
  }) {
    // 1. Try Backend Express API endpoint (attempts both proxy /api and direct http://localhost:5000/api)
    const backendUrls = [
      'http://localhost:5000/api/auth/register-student',
      `${API_BASE_URL}/auth/register-student`,
    ];

    for (const apiUrl of backendUrls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          const errData = await response.json().catch(() => ({}));
          if (errData.error) {
            throw new Error(errData.error);
          }
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('Invalid GitHub') || err.message.includes('already exists') || err.message.includes('already registered'))) {
          throw err;
        }
        console.warn(`Backend API registration notice for ${apiUrl}:`, err?.message || err);
      }
    }

    // 2. Direct Client-side fallback if backend API is offline
    const cleanUrl = payload.githubUrl.trim().replace(/\/+$/, '');
    const match = cleanUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/);
    if (!match || !match[1]) {
      throw new Error('Invalid GitHub Profile URL. Must be in format https://github.com/username');
    }

    const username = match[1];
    
    // Verify GitHub profile via public API
    let ghProfile: any = null;
    try {
      const ghRes = await fetch(`https://api.github.com/users/${username}`);
      if (ghRes.status === 404) {
        throw new Error('Invalid GitHub Profile');
      }
      if (ghRes.ok) {
        ghProfile = await ghRes.json();
      }
    } catch (ghErr: any) {
      if (ghErr.message === 'Invalid GitHub Profile') throw ghErr;
      console.warn('GitHub API fetch warning:', ghErr?.message);
    }

    // Create Firebase Authentication User & Dispatch Nodemailer SMTP Welcome Email
    let authUid = 'st_' + Date.now();
    try {
      if (auth) {
        const userCred = await createUserWithEmailAndPassword(auth, payload.email.toLowerCase().trim(), payload.password);
        authUid = userCred.user.uid;

        // Dispatch Email via Nodemailer SMTP Backend Engine (Firebase Default Emails Disabled)
        try {
          await fetch(`${API_BASE_URL}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'REGISTRATION_PENDING',
              recipientEmail: payload.email.toLowerCase().trim(),
              payload: {
                studentName: payload.fullName,
                email: payload.email.toLowerCase().trim(),
                githubUrl: cleanUrl,
                status: 'Pending Approval',
              },
            }),
          });
        } catch (vErr) {
          console.warn('Nodemailer SMTP Email dispatch notice:', vErr);
        }

        await signOut(auth).catch(() => null);
      }
    } catch (authErr: any) {
      const msg = getFriendlyAuthErrorMessage(authErr);
      throw new Error(msg);
    }

    const uid = authUid;
    const now = new Date().toISOString();
    const studentData: StudentUser = {
      id: uid,
      uid,
      fullName: payload.fullName,
      name: payload.fullName,
      email: payload.email.toLowerCase().trim(),
      status: 'email_verification_pending',
      role: 'student',
      provider: 'manual',
      githubUsername: username,
      githubUrl: cleanUrl,
      github: {
        username: username,
        profileUrl: cleanUrl,
        avatar: ghProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: ghProfile?.bio || '',
        company: ghProfile?.company || '',
        location: ghProfile?.location || '',
        website: ghProfile?.blog || payload.portfolio || '',
        followers: ghProfile?.followers || 0,
        following: ghProfile?.following || 0,
        repositories: ghProfile?.public_repos || 0,
        joinedDate: ghProfile?.created_at || now,
        lastUpdated: now,
      },
      linkedin: payload.linkedin || '',
      portfolio: payload.portfolio || '',
      phone: payload.phone || '',
      createdAt: now,
      joined: now,
      courses: 1,
      skills: ['Linux CLI', 'Git & GitHub'],
      languages: ['TypeScript', 'Python'],
      frameworks: [],
      repoScore: Math.min(100, ((ghProfile?.public_repos || 0) * 5) + ((ghProfile?.followers || 0) * 2)),
      activityScore: 85,
      overallAIScore: Math.min(100, 50 + ((ghProfile?.public_repos || 0) * 2)),
    };

    // Store ONLY in central `users` collection (single source of truth)
    if (db) {
      try {
        await setDoc(doc(db, 'users', uid), studentData, { merge: true });
        await setDoc(doc(db, 'students', uid), studentData, { merge: true });
        console.log(`[FIRESTORE] Student documents created: users/${uid} & students/${uid}`);
      } catch (fErr: any) {
        console.error(`[FIRESTORE REJECTION] Failed writing student documents for ${uid}:`, fErr);
        throw fErr;
      }
    }

    // Cache locally for real-time state sync
    const current = this.getLocalStudents();
    current.unshift(studentData);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));

    return {
      success: true,
      message: 'Account created in Firebase Auth & Firestore. Verification email sent.',
      student: studentData,
    };
  }

  // Caching & In-Flight Request Deduplication
  private inFlightApprovals = new Map<string, Promise<{ success: boolean; studentId: string; status: string; updatedAt?: string }>>();
  private inFlightRejections = new Map<string, Promise<{ success: boolean; studentId: string; status: string; reason?: string; updatedAt?: string }>>();
  private rosterCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL_MS = 20000; // 20s cache for fast tab navigation

  private async getAuthToken(): Promise<string | null> {
    try {
      if (auth?.currentUser) {
        return await auth.currentUser.getIdToken();
      }
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e);
    }
    return null;
  }

  /**
   * Targeted cache update: updates a student record in local cache without refetching the entire roster
   */
  public updateStudentInCache(studentId: string, partial: Partial<StudentUser>): void {
    // 1. Update in local storage
    const current = this.getLocalStudents();
    const idx = current.findIndex((s) => s.id === studentId || s.uid === studentId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...partial };
      this.saveLocalStudents(current);
    }
    // 2. Update within any cached roster pages in memory
    this.rosterCache.forEach((cacheEntry) => {
      if (cacheEntry?.data?.students && Array.isArray(cacheEntry.data.students)) {
        cacheEntry.data.students = cacheEntry.data.students.map((st: StudentUser) =>
          (st.id === studentId || st.uid === studentId) ? { ...st, ...partial } : st
        );
      }
    });
  }

  /**
   * High-performance paginated student fetch with search, filter, and sorting
   */
  async fetchStudentsPaginated(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort?: string;
    order?: string;
    signal?: AbortSignal;
    skipCache?: boolean;
  }): Promise<{
    success: boolean;
    students: StudentUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    timing?: { queryMs: number; transformMs: number; totalMs: number };
  }> {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const status = params.status || 'all';
    const search = params.search || '';
    const sort = params.sort || 'newest';
    const order = params.order || 'desc';

    const cacheKey = `${page}_${limit}_${status}_${search}_${sort}_${order}`;
    if (!params.skipCache) {
      const cached = this.rosterCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL_MS)) {
        return cached.data;
      }
    }

    try {
      const token = await this.getAuthToken();
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
        search,
        sort,
        order,
      });

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/admin/students?${queryParams.toString()}`, {
        method: 'GET',
        headers,
        signal: params.signal,
      });

      if (response.ok) {
        const json = await response.json();
        const rawList = json.students || json.data || [];
        const normalizedStudents = rawList.map((st: any) => this.normalizeStudentData(st));
        const total = json.pagination?.total ?? normalizedStudents.length;
        const totalPages = json.pagination?.totalPages ?? (Math.ceil(total / limit) || 1);

        const result = {
          success: true,
          students: normalizedStudents,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: json.pagination?.hasNextPage ?? (page < totalPages),
            hasPrevPage: json.pagination?.hasPrevPage ?? (page > 1),
          },
          timing: json.timing,
        };

        this.rosterCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw e;
      }
      console.warn('API fetchStudentsPaginated notice (falling back):', e?.message || e);
    }

    // Client-side fallback if backend API is unreachable
    const all = this.getLocalStudents();
    let filtered = [...all];

    if (status && status !== 'all' && status !== 'ALL') {
      if (status === 'pending') filtered = filtered.filter((s) => !s.approved && s.status !== 'rejected');
      else if (status === 'approved') filtered = filtered.filter((s) => s.approved || s.status === 'approved' || s.status === 'Active');
      else if (status === 'rejected') filtered = filtered.filter((s) => s.status === 'rejected');
      else if (status === 'suspended') filtered = filtered.filter((s) => s.status === 'Suspended');
      else if (status === 'at_risk') filtered = filtered.filter((s) => (s.learningScore || 80) < 65);
      else if (status === 'high_performers') filtered = filtered.filter((s) => (s.learningScore || 80) >= 90 || (s.xp || 0) >= 2000);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((s) =>
        (s.name || s.fullName || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.college || '').toLowerCase().includes(q) ||
        (s.branch || '').toLowerCase().includes(q) ||
        (s.githubUsername || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sort === 'newest') comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      else if (sort === 'oldest') comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      else if (sort === 'name') comparison = (a.name || '').localeCompare(b.name || '');
      else if (sort === 'highest_progress') comparison = (b.learningScore || 0) - (a.learningScore || 0);
      return order === 'asc' ? -comparison : comparison;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paged = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      students: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Approve Student Registration with instant deduplication and targeted cache update
   */
  async approveStudent(studentId: string): Promise<{ success: boolean; studentId: string; status: string; updatedAt?: string }> {
    if (this.inFlightApprovals.has(studentId)) {
      return this.inFlightApprovals.get(studentId)!;
    }

    const promise = (async () => {
      // 1. Optimistic targeted cache update
      this.updateStudentInCache(studentId, { status: 'approved' as UserStatus, approved: true, isActive: true });

      try {
        const token = await this.getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/admin/user/${studentId}/approve`, {
          method: 'POST',
          headers,
        });

        if (response.ok) {
          const resData = await response.json();
          return {
            success: true,
            studentId,
            status: 'approved',
            updatedAt: resData.updatedAt || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn('API approve notice:', e);
      }

      // Client Firestore fallback if backend API is unreachable
      if (db) {
        await updateDoc(doc(db, 'users', studentId), {
          status: 'approved',
          approved: true,
          isActive: true,
          approvedAt: new Date().toISOString()
        }).catch(() => null);
      }

      return {
        success: true,
        studentId,
        status: 'approved',
        updatedAt: new Date().toISOString(),
      };
    })().finally(() => {
      this.inFlightApprovals.delete(studentId);
    });

    this.inFlightApprovals.set(studentId, promise);
    return promise;
  }

  /**
   * Reject Student Registration with reason, deduplication, and targeted cache update
   */
  async rejectStudent(studentId: string, reason: string): Promise<{ success: boolean; studentId: string; status: string; reason?: string; updatedAt?: string }> {
    if (this.inFlightRejections.has(studentId)) {
      return this.inFlightRejections.get(studentId)!;
    }

    const promise = (async () => {
      // 1. Optimistic targeted cache update
      this.updateStudentInCache(studentId, { status: 'rejected' as UserStatus, approved: false, isActive: false });

      try {
        const token = await this.getAuthToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/admin/user/${studentId}/reject`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ reason }),
        });

        if (response.ok) {
          const resData = await response.json();
          return {
            success: true,
            studentId,
            status: 'rejected',
            reason,
            updatedAt: resData.updatedAt || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn('API reject notice:', e);
      }

      // Client Firestore fallback if backend API is unreachable
      if (db) {
        await updateDoc(doc(db, 'users', studentId), {
          status: 'rejected',
          approved: false,
          isActive: false,
          rejectionReason: reason,
          rejectedAt: new Date().toISOString()
        }).catch(() => null);
      }

      return {
        success: true,
        studentId,
        status: 'rejected',
        reason,
        updatedAt: new Date().toISOString(),
      };
    })().finally(() => {
      this.inFlightRejections.delete(studentId);
    });

    this.inFlightRejections.set(studentId, promise);
    return promise;
  }

  exportStudentsToCSV(students: StudentUser[]): void {
    const headers = [
      'UID',
      'Full Name',
      'Email',
      'Branch',
      'Year',
      'College',
      'Phone',
      'Provider',
      'Current Course',
      'Learning Score',
      'Enrolled Courses',
      'Completed Courses',
      'Status',
      'Joined Date',
    ];

    const rows = students.map((s) => [
      `"${s.uid || s.id}"`,
      `"${s.fullName || s.name}"`,
      `"${s.email}"`,
      `"${s.branch || 'N/A'}"`,
      `"${s.year || 'N/A'}"`,
      `"${s.college || 'N/A'}"`,
      `"${s.phone || 'N/A'}"`,
      `"${s.provider || 'password'}"`,
      `"${s.currentCourse || 'N/A'}"`,
      `"${s.learningScore || 80}%"`,
      `"${s.courses || s.courseCount || 1}"`,
      `"${s.completedCourses || 0}"`,
      `"${s.status}"`,
      `"${s.joined || s.joinedAt || 'N/A'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KaizenQ_Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const studentService = new StudentService();
