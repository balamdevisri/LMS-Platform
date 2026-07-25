import { collection, doc, onSnapshot, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfile, UserRole, UserStatus, UserStatistics } from '@/types/user';

const LOCAL_USERS_KEY = 'shaivika_admin_users_v3';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Calculate UserStatistics metrics from current users list
   */
  public calculateStatistics(users: UserProfile[]): UserStatistics {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;

    let totalStudents = 0;
    let totalInstructors = 0;
    let totalAdmins = 0;
    let activeUsers = 0;
    let verifiedUsers = 0;
    let newToday = 0;
    let newThisWeek = 0;

    users.forEach((u) => {
      const role = (u.role || 'student').toLowerCase();
      if (role === 'admin') totalAdmins++;
      else if (role === 'instructor') totalInstructors++;
      else totalStudents++;

      if (u.status !== 'Blocked') activeUsers++;
      if (u.isVerified) verifiedUsers++;

      const createdMs = u.createdAt ? new Date(u.createdAt).getTime() : 0;
      if (createdMs >= startOfToday) newToday++;
      if (createdMs >= sevenDaysAgo) newThisWeek++;
    });

    return {
      totalUsers: users.length,
      totalStudents,
      totalInstructors,
      totalAdmins,
      activeUsers,
      verifiedUsers,
      newToday,
      newThisWeek,
    };
  }

  /**
   * Read local users cache
   */
  public getLocalUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse local users:', e);
    }
    return [];
  }

  /**
   * Save local users cache
   */
  public saveLocalUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save local users:', e);
    }
  }

  /**
   * Subscribe to Real-Time Firestore Users Collection
   */
  public subscribeToUsers(callback: (users: UserProfile[], stats: UserStatistics) => void): () => void {
    const localData = this.getLocalUsers();
    callback(localData, this.calculateStatistics(localData));

    if (!db) {
      return () => {};
    }

    try {
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(
        usersRef,
        (snapshot) => {
          const firestoreUsers: UserProfile[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const email = (data.email || '').toLowerCase();
            const fullName = data.fullName || data.name || data.displayName || email.split('@')[0] || 'Platform User';
            const role: UserRole = (data.role || 'student').toLowerCase() as UserRole;
            const status: UserStatus = (data.status || 'Active') as UserStatus;

            firestoreUsers.push({
              uid: docSnap.id,
              fullName,
              name: fullName,
              email: data.email || '',
              photoURL: data.photoURL || null,
              role,
              provider: data.providerId === 'github.com' || data.provider === 'github.com' ? 'github.com' : 'password',
              status,
              branch: data.branch || 'AI & Computer Science',
              year: data.year || '4th Year',
              skills: data.skills || ['Python', 'Machine Learning', 'React', 'TypeScript'],
              github: data.github || data.githubUsername ? `https://github.com/${data.githubUsername || data.github}` : undefined,
              linkedin: data.linkedin || undefined,
              portfolio: data.portfolio || undefined,
              bio: data.bio || 'Passionate AI Foundation student exploring deep learning models & intelligent agents.',
              phone: data.phone || '+1 (555) 234-5678',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              lastLogin: data.lastLogin || new Date().toISOString(),
              isVerified: data.isVerified ?? true,
              enrolledCoursesCount: data.enrolledCoursesCount || 2,
              completedCoursesCount: data.completedCoursesCount || 0,
              learningProgressPercent: data.learningProgressPercent || 65,
              quizScores: data.quizScores || [
                { id: 'q1', title: 'Neural Networks 101', score: 95, maxScore: 100, date: '2026-03-01' },
                { id: 'q2', title: 'Transformer Architectures', score: 88, maxScore: 100, date: '2026-03-15' },
              ],
              assignmentScores: data.assignmentScores || [
                { id: 'a1', title: 'RAG Pipeline Implementation', score: 100, maxScore: 100, date: '2026-03-10' },
              ],
              certificates: data.certificates || [],
            });
          });

          // Merge local cache non-duplicates
          const localOnly = localData.filter(
            (lu) => !firestoreUsers.some((fu) => fu.email.toLowerCase() === lu.email.toLowerCase())
          );
          const finalUsers = [...firestoreUsers, ...localOnly];

          this.saveLocalUsers(finalUsers);
          const stats = this.calculateStatistics(finalUsers);
          callback(finalUsers, stats);
        },
        (error) => {
          console.warn('Realtime users listener warning:', error);
          const fallback = this.getLocalUsers();
          callback(fallback, this.calculateStatistics(fallback));
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
  }

  /**
   * Get single user by UID
   */
  public async getUser(uid: string): Promise<UserProfile | null> {
    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          const email = (data.email || '').toLowerCase();
          const fullName = data.fullName || data.name || data.displayName || email.split('@')[0] || 'Platform User';
          return {
            uid: snap.id,
            fullName,
            name: fullName,
            email: data.email || '',
            photoURL: data.photoURL || null,
            role: (data.role || 'student').toLowerCase() as UserRole,
            provider: data.providerId === 'github.com' || data.provider === 'github.com' ? 'github.com' : 'password',
            status: (data.status || 'Active') as UserStatus,
            branch: data.branch || 'AI & Computer Science',
            year: data.year || '4th Year',
            skills: data.skills || ['Python', 'PyTorch', 'React', 'Node.js'],
            github: data.github || undefined,
            linkedin: data.linkedin || undefined,
            portfolio: data.portfolio || undefined,
            bio: data.bio || 'AI Learner',
            phone: data.phone || '+1 (555) 000-0000',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            lastLogin: data.lastLogin || new Date().toISOString(),
            isVerified: data.isVerified ?? true,
            enrolledCoursesCount: data.enrolledCoursesCount || 2,
            completedCoursesCount: data.completedCoursesCount || 0,
            learningProgressPercent: data.learningProgressPercent || 50,
            quizScores: data.quizScores || [],
            assignmentScores: data.assignmentScores || [],
            certificates: data.certificates || [],
          };
        }
      } catch (err) {
        console.warn('Failed to fetch single user from Firestore:', err);
      }
    }

    const localUsers = this.getLocalUsers();
    return localUsers.find((u) => u.uid === uid) || null;
  }

  /**
   * Update user details
   */
  public async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const payload: Partial<UserProfile> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const localUsers = this.getLocalUsers();
    const updated = localUsers.map((u) => (u.uid === uid ? { ...u, ...payload } : u));
    this.saveLocalUsers(updated);

    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, payload);
      } catch (e) {
        console.warn('Firestore update user warning:', e);
      }
    }
  }

  /**
   * Admin Change User Role
   */
  public async changeRole(uid: string, newRole: UserRole): Promise<void> {
    await this.updateUser(uid, { role: newRole });
  }

  /**
   * Admin Block User
   */
  public async blockUser(uid: string): Promise<void> {
    await this.updateUser(uid, { status: 'Blocked' });
  }

  /**
   * Admin Unblock User
   */
  public async unblockUser(uid: string): Promise<void> {
    await this.updateUser(uid, { status: 'Active' });
  }

  /**
   * Delete User Account
   */
  public async deleteUser(uid: string): Promise<void> {
    const localUsers = this.getLocalUsers();
    const updated = localUsers.filter((u) => u.uid !== uid);
    this.saveLocalUsers(updated);

    if (db) {
      try {
        const userRef = doc(db, 'users', uid);
        await deleteDoc(userRef);
      } catch (e) {
        console.warn('Firestore delete user warning:', e);
      }
    }
  }
}

export const userService = UserService.getInstance();
