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
import type {
  UserProfile,
  UserStatus,
  ExtendedStudentStats
} from '@/types/user';

export interface StudentUser extends UserProfile {
  id: string;
  name: string;
  joined: string;
  courses: number;
}

const LOCAL_STORAGE_KEY = 'shaivika_realtime_students_v3';

const DEFAULT_STUDENTS: StudentUser[] = [];

class StudentService {
  private isMockUser(st: any): boolean {
    const id = String(st.id || st.uid || '');
    const email = (st.email || '').toLowerCase();
    return (
      id === 'st_101' ||
      id === 'st_102' ||
      id === 'st_103' ||
      email === 'priya.sharma@shaivika.ai' ||
      email === 'alex.chen@shaivika.ai' ||
      email === 'bhanuprakashachari5092@gmail.com'
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

    // 3. Fallback Base Roster (DEFAULT_STUDENTS)
    DEFAULT_STUDENTS.forEach((st) => {
      if (!this.isMockUser(st)) {
        const key = (st.email || st.id).toLowerCase();
        if (!combinedMap.has(key)) {
          combinedMap.set(key, st);
        }
      }
    });

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
    const name = data.name || data.fullName || data.displayName || email.split('@')[0] || 'Student User';
    const photoURL = data.photoURL || data.profilePhoto || data.avatar || '';
    const isGithub =
      data.provider === 'github.com' ||
      data.providerId === 'github.com' ||
      photoURL.includes('githubusercontent');

    const statusVal = data.status || (data.isActive === false ? 'Suspended' : 'Active');

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
      provider: isGithub ? 'github.com' : (data.provider || 'password'),
      githubUsername: data.githubUsername || (isGithub ? email.split('@')[0] : undefined),
      branch: data.branch || 'AI & Computer Science',
      year: data.year || '1st Year',
      college: data.college || 'Shaivika AI Foundation Institute',
      phone: data.phone || '+1 (555) 019-2831',
      github: data.github || (isGithub ? `https://github.com/${data.githubUsername || email.split('@')[0]}` : undefined),
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
      ]
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
        const role = (data.role || 'student').toLowerCase();

        if (role !== 'admin' && role !== 'instructor') {
          firestoreStudents.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
        }
      });

      const combinedMap = new Map<string, StudentUser>();
      firestoreStudents.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
      currentLocal.forEach((st) => {
        const key = (st.email || st.id).toLowerCase();
        if (!combinedMap.has(key)) combinedMap.set(key, st);
      });

      const finalStudents = Array.from(combinedMap.values()).sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

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
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersRef,
        (snapshot) => {
          const firestoreStudents: StudentUser[] = [];
          
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const role = (data.role || 'student').toLowerCase();

            if (role !== 'admin' && role !== 'instructor') {
              firestoreStudents.push(this.normalizeStudentData({ ...data, id: docSnap.id, uid: docSnap.id }));
            }
          });

          const currentLocal = this.getLocalStudents();
          const combinedMap = new Map<string, StudentUser>();

          firestoreStudents.forEach((st) => combinedMap.set((st.email || st.id).toLowerCase(), st));
          currentLocal.forEach((st) => {
            const key = (st.email || st.id).toLowerCase();
            if (!combinedMap.has(key)) combinedMap.set(key, st);
          });
          DEFAULT_STUDENTS.forEach((st) => {
            const key = (st.email || st.id).toLowerCase();
            if (!combinedMap.has(key)) combinedMap.set(key, st);
          });

          const finalStudents = Array.from(combinedMap.values()).sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });

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
      try {
        setDoc(doc(db, 'users', uid), {
          uid,
          fullName: newStudent.fullName,
          name: newStudent.name,
          email: newStudent.email,
          photoURL: newStudent.photoURL,
          profilePhoto: newStudent.photoURL,
          provider: newStudent.provider,
          githubUsername: newStudent.githubUsername,
          role: 'student',
          status: 'Active',
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
        }, { merge: true }).catch((err) => console.warn('Firestore setDoc notice:', err));
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
      try {
        await setDoc(doc(db, 'users', newStudent.id), {
          uid: newStudent.id,
          fullName: newStudent.name,
          name: newStudent.name,
          email: newStudent.email,
          role: 'student',
          status: 'Active',
          provider,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          emailVerified: true,
          learningScore: 85,
          courseCount: 1,
          completedCourses: 0,
        });
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
      try {
        await updateDoc(doc(db, 'users', student.id), {
          fullName: student.name || student.fullName,
          name: student.name,
          email: student.email,
          status: student.status,
          isActive: student.status === 'Active',
          branch: student.branch,
          year: student.year,
          college: student.college,
          phone: student.phone,
          bio: student.bio,
          skills: student.skills,
          provider: student.provider,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore update student notice:', err);
      }
    }
  }

  async toggleStudentStatus(id: string): Promise<StudentUser | null> {
    const current = this.getLocalStudents();
    const target = current.find((s) => s.id === id || s.uid === id);
    if (!target) return null;

    const newStatus: UserStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    const updatedStudent: StudentUser = {
      ...target,
      status: newStatus,
      isActive: newStatus === 'Active',
      updatedAt: new Date().toISOString(),
    };

    await this.updateStudent(updatedStudent);
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    const current = this.getLocalStudents();
    const updated = current.filter((s) => s.id !== id && s.uid !== id);
    this.saveLocalStudents(updated);

    if (db && id) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (err) {
        console.warn('Firestore delete student notice:', err);
      }
    }
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
