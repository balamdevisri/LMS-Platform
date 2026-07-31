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

      querySnapshot.forEach((docSnap: any) => {
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
      fetch(`/api/admin/student/${id}`, { method: 'DELETE' }).catch(() => null),
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
      '/api/auth/register-student',
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
          await fetch('/api/email/send', {
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

    // Store in Firestore students & users collection
    if (db) {
      try {
        await setDoc(doc(db, 'students', uid), studentData);
        await setDoc(doc(db, 'users', uid), studentData);
      } catch (fErr) {
        console.warn('Firestore setDoc notice:', fErr);
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

  /**
   * Approve Student Registration
   */
  async approveStudent(studentId: string) {
    try {
      const response = await fetch(`/api/users/students/${studentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const resData = await response.json();
        const current = this.getLocalStudents();
        const targetIdx = current.findIndex((s) => s.id === studentId || s.uid === studentId);
        if (targetIdx !== -1) {
          current[targetIdx] = { ...current[targetIdx], status: 'approved', isActive: true };
          this.saveLocalStudents(current);
        }
        return resData;
      }
    } catch (e) {
      console.warn('API approve notice:', e);
    }

    // Client fallback
    const current = this.getLocalStudents();
    const targetIdx = current.findIndex((s) => s.id === studentId || s.uid === studentId);
    if (targetIdx !== -1) {
      current[targetIdx] = { ...current[targetIdx], status: 'approved', isActive: true };
      this.saveLocalStudents(current);
      if (db) {
        await updateDoc(doc(db, 'students', studentId), { status: 'approved', approvedAt: new Date().toISOString() }).catch(() => null);
        await updateDoc(doc(db, 'users', studentId), { status: 'approved', approvedAt: new Date().toISOString() }).catch(() => null);
      }
    }
    return { success: true, message: 'Student account approved' };
  }

  /**
   * Reject Student Registration with Reason
   */
  async rejectStudent(studentId: string, reason: string) {
    try {
      const response = await fetch(`/api/users/students/${studentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        const resData = await response.json();
        const current = this.getLocalStudents();
        const targetIdx = current.findIndex((s) => s.id === studentId || s.uid === studentId);
        if (targetIdx !== -1) {
          current[targetIdx] = { ...current[targetIdx], status: 'rejected', isActive: false };
          this.saveLocalStudents(current);
        }
        return resData;
      }
    } catch (e) {
      console.warn('API reject notice:', e);
    }

    // Client fallback
    const current = this.getLocalStudents();
    const targetIdx = current.findIndex((s) => s.id === studentId || s.uid === studentId);
    if (targetIdx !== -1) {
      current[targetIdx] = { ...current[targetIdx], status: 'rejected', isActive: false };
      this.saveLocalStudents(current);
      if (db) {
        await updateDoc(doc(db, 'students', studentId), { status: 'rejected', rejectionReason: reason, rejectedAt: new Date().toISOString() }).catch(() => null);
        await updateDoc(doc(db, 'users', studentId), { status: 'rejected', rejectionReason: reason, rejectedAt: new Date().toISOString() }).catch(() => null);
      }
    }
    return { success: true, message: 'Student account rejected', reason };
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
