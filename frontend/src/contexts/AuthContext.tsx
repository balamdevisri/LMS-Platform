import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthCredential } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  GithubAuthProvider,
  signInWithPopup,
  linkWithPopup,
  getAdditionalUserInfo,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { UserProfile, UserRole } from '@/types/user';
import { API_BASE_URL } from '@/config/api';

const syncStudent = async (profile: UserProfile) => {
  if (!db) return;
  try {
    const studentRef = doc(db, 'students', profile.uid);
    const photoURL = profile.photoURL || profile.profilePhoto || (profile.githubUsername ? `https://github.com/${profile.githubUsername}.png?size=200` : '');
    const isGithub = profile.provider === 'github.com' || profile.providerId === 'github.com' || Boolean(profile.githubUsername) || (typeof photoURL === 'string' && photoURL.includes('github'));
    const resolvedName = profile.fullName && profile.fullName !== 'Student User' 
      ? profile.fullName 
      : (profile.name && profile.name !== 'Student User' ? profile.name : (profile.githubUsername || 'Student'));

    await setDoc(studentRef, {
      ...profile,
      id: profile.uid,
      uid: profile.uid,
      name: resolvedName,
      fullName: resolvedName,
      email: profile.email,
      photoURL,
      profilePhoto: photoURL,
      provider: isGithub ? 'github.com' : (profile.provider || 'password'),
      providerId: isGithub ? 'github.com' : (profile.providerId || 'password'),
      githubUsername: profile.githubUsername,
      github: profile.github || (profile.githubUsername ? `https://github.com/${profile.githubUsername}` : ''),
      githubUrl: (profile as any).githubUrl || (profile.githubUsername ? `https://github.com/${profile.githubUsername}` : ''),
      joined: profile.createdAt || new Date().toISOString(),
      courses: profile.enrolledCoursesCount || 1,
      status: profile.status || 'Active',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Update local cache
    try {
      const localRaw = localStorage.getItem('shaivika_realtime_students_v3');
      let localList: any[] = [];
      if (localRaw) localList = JSON.parse(localRaw);
      if (Array.isArray(localList)) {
        const idx = localList.findIndex((s) => s.id === profile.uid || s.uid === profile.uid || s.email === profile.email);
        const item = {
          ...profile,
          id: profile.uid,
          uid: profile.uid,
          name: resolvedName,
          fullName: resolvedName,
          photoURL,
          profilePhoto: photoURL,
          provider: isGithub ? 'github.com' : 'password',
          githubUsername: profile.githubUsername,
          github: profile.github || (profile.githubUsername ? `https://github.com/${profile.githubUsername}` : ''),
        };
        if (idx >= 0) {
          localList[idx] = { ...localList[idx], ...item };
        } else {
          localList.unshift(item);
        }
        localStorage.setItem('shaivika_realtime_students_v3', JSON.stringify(localList));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('shaivika_student_updated'));
        }
      }
    } catch (e) {}
  } catch (e) {
    console.warn('Sync student notice:', e);
  }
};

const syncInstructor = async (profile: UserProfile) => {
  if (!db) return;
  try {
    const instructorRef = doc(db, 'instructors', profile.uid);
    await setDoc(instructorRef, {
      id: profile.uid,
      name: profile.fullName || profile.name || 'Instructor',
      email: profile.email,
      specialty: 'Computer Science & System Architecture',
      joined: profile.createdAt || new Date().toISOString(),
      assignedCourses: 0,
      studentsCount: '0',
      rating: 5.0,
      status: profile.status || 'pending',
      approved: profile.approved || false,
      appliedDate: profile.createdAt || new Date().toISOString(),
      department: 'Computer Science & System Architecture',
      experience: 'Verified',
      qualification: 'Staff Lecturer',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Sync instructor notice:', e);
  }
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile | null>;
  signInWithGithub: (role?: UserRole) => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
  clearAuthCaches: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

console.log("🚀 ACTIVE AUTH PROVIDER: frontend/src/contexts/AuthContext.tsx (AuthProvider)");
console.log("🚀 ACTIVE FIREBASE CONFIG: frontend/src/services/firebase.ts (shaivika-lms-ai)");
console.log("🚀 ACTIVE FIRESTORE INSTANCE: frontend/src/firebase.ts (db)");
console.log("🚀 ACTIVE AUTH CONTEXT: frontend/src/contexts/AuthContext.tsx (AuthContext)");

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('shaivika_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const hasUser = Boolean(localStorage.getItem('shaivika_user'));
      const hasToken = Boolean(localStorage.getItem('shaivika_auth_token') || localStorage.getItem('token'));
      return !(hasUser && hasToken);
    } catch {
      return true;
    }
  });

  // Fetch or create user document from Firestore
  const fetchUserProfile = async (
    firebaseUser: User,
    githubHandle?: string,
    initialRole?: UserRole,
    githubDisplayName?: string
  ): Promise<UserProfile | null> => {
    const isGithub =
      firebaseUser.providerData.some((p) => p.providerId === 'github.com') ||
      firebaseUser.photoURL?.includes('githubusercontent') ||
      Boolean(githubHandle);

    const calculatedUsername =
      githubHandle ||
      (firebaseUser as any).reloadUserInfo?.screenName ||
      (isGithub && firebaseUser.email ? firebaseUser.email.split('@')[0] : undefined);

    const isAdmin =
      firebaseUser.email?.toLowerCase().includes('admin') ||
      firebaseUser.email?.toLowerCase() === 'admin@gmail.com' ||
      initialRole === 'admin';

    const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('kaizenq_signup_role') as UserRole : undefined;
    const targetRole: UserRole = isAdmin ? 'admin' : (initialRole || storedRole || 'student');

    console.log(`[FIRESTORE AUDIT] fetchUserProfile called | initialRole: ${initialRole} | storedRole: ${storedRole} | targetRole: ${targetRole} | githubHandle: ${githubHandle}`);

    // Automatic name discovery: GitHub Display Name -> Firebase displayName -> GitHub Username -> Email prefix
    const candidateName =
      (githubDisplayName && githubDisplayName.trim()) ||
      (firebaseUser.displayName && firebaseUser.displayName !== 'Student User' && firebaseUser.displayName.trim()) ||
      calculatedUsername ||
      (firebaseUser.email ? firebaseUser.email.split('@')[0] : '');

    const calculatedName = candidateName || (isAdmin ? 'Administrator' : 'Learner');
    const baseProfileData: Partial<UserProfile> = {
      uid: firebaseUser.uid,
      fullName: calculatedName,
      name: calculatedName,
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || null,
      isVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
      provider: isGithub ? 'github.com' : 'password',
      providerId: isGithub ? 'github.com' : 'password',
      status: 'Active',
      ...(calculatedUsername ? { githubUsername: calculatedUsername } : {}),
    };

    if (!db) {
      const fallback: UserProfile = {
        uid: firebaseUser.uid,
        fullName: calculatedName,
        name: calculatedName,
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        role: targetRole,
        provider: isGithub ? 'github.com' : 'password',
        providerId: isGithub ? 'github.com' : 'password',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
        githubUsername: calculatedUsername,
      };
      setUserProfile(fallback);
      return fallback;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const shouldRepairInstructor = targetRole === 'instructor' || storedRole === 'instructor';
        const finalRole: UserRole = isAdmin ? 'admin' : (shouldRepairInstructor ? 'instructor' : (data.role || targetRole));
        
        const isStudent = finalRole === 'student';
        const isApproved = isAdmin || isStudent || isGithub ? true : (data.approved !== undefined ? data.approved : (data.status === 'active' || data.status === 'Active' || data.status === 'approved'));
        const currentStatus = (isAdmin || isStudent) ? 'active' : (data.status || 'pending');

        // Auto-heal student records that were saved with pending status
        if (isStudent && (data.status === 'pending' || data.status === 'Pending' || data.status === 'email_verification_pending' || data.approved === false) && db) {
          updateDoc(userRef, {
            status: 'active',
            approved: true,
            updatedAt: new Date().toISOString(),
          }).catch((err) => console.warn('[AUTH REPAIR] Notice healing student record in users:', err));
        }

        const resolvedGithubUsername = data.githubUsername || calculatedUsername;
        const resolvedPhotoURL = data.photoURL || firebaseUser.photoURL || (resolvedGithubUsername ? `https://github.com/${resolvedGithubUsername}.png?size=200` : null);
        const isGithubUser = isGithub || data.provider === 'github.com' || data.providerId === 'github.com' || Boolean(resolvedGithubUsername);

        // Check if existing profile in DB has generic placeholder "Student User" or empty name
        const hasGenericName = !data.name || data.name === 'Student User' || !data.fullName || data.fullName === 'Student User';
        const resolvedName = (hasGenericName && candidateName) ? candidateName : (data.name && data.name !== 'Student User' ? data.name : (candidateName || 'Student'));
        const resolvedFullName = (hasGenericName && candidateName) ? candidateName : (data.fullName && data.fullName !== 'Student User' ? data.fullName : resolvedName);

        const profileData: UserProfile = {
          ...data,
          ...baseProfileData,
          name: resolvedName,
          fullName: resolvedFullName,
          role: finalRole,
          approved: isApproved,
          status: currentStatus,
          isActive: data.isActive !== undefined ? data.isActive : true,
          provider: isGithubUser ? 'github.com' : (data.provider || 'password'),
          providerId: isGithubUser ? 'github.com' : (data.providerId || 'password'),
          phone: data.phone || '',
          githubUsername: resolvedGithubUsername,
          github: data.github || (resolvedGithubUsername ? `https://github.com/${resolvedGithubUsername}` : ''),
          linkedin: data.linkedin || '',
          branch: data.branch || 'AI & Computer Science',
          semester: (data as any).semester || '1st Semester',
          photoURL: resolvedPhotoURL,
          profilePhoto: resolvedPhotoURL,
          lastLogin: new Date().toISOString(),
        };

        // If the database had a generic name or missing GitHub username, automatically update Firestore so it's permanently stored!
        if (hasGenericName && candidateName && db) {
          updateDoc(userRef, {
            name: resolvedName,
            fullName: resolvedFullName,
            githubUsername: resolvedGithubUsername,
            github: profileData.github,
            photoURL: resolvedPhotoURL,
            profilePhoto: resolvedPhotoURL,
            updatedAt: new Date().toISOString(),
          }).catch((err) => console.warn('[AUTH REPAIR] Notice updating user record:', err));
        }

        if (finalRole === 'student') {
          await syncStudent(profileData);
        }

        try {
          localStorage.setItem('shaivika_user', JSON.stringify(profileData));
        } catch (e) {}

        setUserProfile(profileData);
        return profileData;
      } else {
        const isStudent = targetRole === 'student';
        const isApproved = isAdmin || isStudent || isGithub ? true : false;
        const initialStatus = (isAdmin || isStudent || isGithub) ? 'active' : 'pending';

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: calculatedName,
          name: calculatedName,
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          profilePhoto: firebaseUser.photoURL || null,
          role: targetRole,
          approved: isApproved,
          status: initialStatus,
          isActive: true,
          provider: isGithub ? 'github.com' : 'password',
          providerId: isGithub ? 'github.com' : 'password',
          approvedBy: isAdmin ? 'system' : undefined,
          approvedAt: isAdmin ? new Date().toISOString() : undefined,
          rejectedAt: undefined,
          branch: 'AI & Computer Science',
          semester: '1st Semester',
          year: '1st Year',
          college: 'Shaivika AI Foundation',
          phone: '',
          github: calculatedUsername ? `https://github.com/${calculatedUsername}` : '',
          linkedin: '',
          portfolio: '',
          bio: 'Enthusiastic KaizenQ learner mastering Linux, AI, and DevOps.',
          skills: ['Linux', 'Git', 'Python', 'AI Foundation'],
          emailVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
          courseCount: 1,
          completedCourses: 0,
          currentCourse: 'Linux Systems & Administration Mastery',
          learningScore: 85,
          joinedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
          githubUsername: calculatedUsername,
        };

        console.log(`[FIRESTORE] Creating initial users profile for ${firebaseUser.uid}...`);
        try {
          await setDoc(userRef, newProfile);
          console.log(`[FIRESTORE] Initial users profile created: users/${firebaseUser.uid}`);
        } catch (err: any) {
          console.error(`[FIRESTORE CRITICAL REJECTION] Failed creating users/${firebaseUser.uid}!`, err);
          console.error('[FIRESTORE REJECTION REASON]', err?.message || err?.code || String(err));
          console.error('[FIRESTORE REJECTION STACK]', err?.stack);
          throw err;
        }

        if (targetRole === 'student') {
          await syncStudent(newProfile);
        } else if (targetRole === 'instructor') {
          await syncInstructor(newProfile);

          // Dispatch instructor pending-approval email via SMTP backend
          try {
            const apiBaseUrl = API_BASE_URL;
            await fetch(`${apiBaseUrl}/email/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'INSTRUCTOR_REGISTRATION_PENDING',
                recipientEmail: (firebaseUser.email || '').toLowerCase().trim(),
                payload: {
                  instructorName: calculatedName,
                  email: (firebaseUser.email || '').toLowerCase().trim(),
                  department: 'Computer Science & System Architecture',
                  qualification: 'Pending Verification',
                  experience: 'Not yet specified',
                },
              }),
            });
            console.log('[INSTRUCTOR REGISTRATION AUDIT] Pending approval SMTP email dispatched.');
          } catch (emailErr) {
            console.warn('[INSTRUCTOR REGISTRATION AUDIT] SMTP email dispatch notice:', emailErr);
          }

          // Notify admin in Firestore notifications collection
          try {
            const adminNotifRef = doc(collection(db, 'notifications'));
            await setDoc(adminNotifRef, {
              userId: firebaseUser.uid,
              title: 'New Lecturer Registration',
              message: `${calculatedName} (${firebaseUser.email}) registered as an Instructor and is pending approval.`,
              createdAt: new Date().toISOString(),
              isRead: false,
              type: 'info',
              recipientRole: 'admin',
            });
            console.log('[INSTRUCTOR REGISTRATION AUDIT] Admin notification written to Firestore notifications.');
          } catch (notifErr) {
            console.warn('[INSTRUCTOR REGISTRATION AUDIT] Failed to write admin notification:', notifErr);
          }
        }

        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Firestore sync notice:', error);
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        fullName: calculatedName,
        name: calculatedName,
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || null,
        role: targetRole,
        approved: targetRole === 'student' || isAdmin ? true : false,
        // CRITICAL: Students are active immediately; only instructors require admin review
        status: targetRole === 'instructor' ? 'pending' : 'active',
        provider: isGithub ? 'github.com' : 'password',
        providerId: isGithub ? 'github.com' : 'password',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
        githubUsername: calculatedUsername,
      };
      syncStudent(fallbackProfile);
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
        try {
          setUser(currentUser);
          if (currentUser) {
            // Non-blocking token retrieval with fallback to cached token
            const token = await Promise.race([
              currentUser.getIdToken(false),
              new Promise<string>((resolve) =>
                setTimeout(() => resolve(localStorage.getItem('token') || localStorage.getItem('shaivika_auth_token') || ''), 1500)
              ),
            ]).catch(() => localStorage.getItem('token') || '');

            if (token) {
              localStorage.setItem('shaivika_auth_token', token);
              localStorage.setItem('token', token);
            }

            // If profile is already cached in localStorage, release loading state immediately for mobile performance
            const cachedProfileRaw = localStorage.getItem('shaivika_user');
            if (cachedProfileRaw) {
              setLoading(false);
            }

            const storedSignupRole = typeof window !== 'undefined' ? sessionStorage.getItem('kaizenq_signup_role') as UserRole : undefined;
            const profile = await fetchUserProfile(currentUser, undefined, storedSignupRole);
            if (profile) {
              localStorage.setItem('shaivika_user', JSON.stringify(profile));
              // Enforce account status check on initialization (Only instructors require pending approval; suspended/rejected accounts are blocked)
              const isPending = profile.role === 'instructor' && (profile.status === 'pending' || profile.status === 'Pending');
              const statusStr = (profile.status as string) || '';
              const isRejected = statusStr === 'rejected' || statusStr === 'Rejected';
              const isSuspended = statusStr === 'Suspended' || statusStr === 'suspended' || statusStr === 'Blocked';
              
              const cleanEmail = (currentUser.email || '').toLowerCase().trim();
              const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail.startsWith('admin@');

              const isRegistering = typeof window !== 'undefined' && sessionStorage.getItem('kaizenq_signup_role');

              if (!isAdminEmail && !isRegistering && (isPending || isRejected || isSuspended)) {
                console.warn(`[Dashboard Access Blocked] Persistence session blocked for ${currentUser.email} due to status: ${profile.status}. Logging out.`);
                if (auth) {
                  await signOut(auth).catch(() => null);
                }
                setUser(null);
                setUserProfile(null);
                localStorage.removeItem('shaivika_auth_token');
                localStorage.removeItem('token');
                localStorage.removeItem('shaivika_user');
              } else {
                console.log(`[Dashboard Access Granted] Persistence session approved for ${currentUser.email} (Role: ${profile.role}).`);
              }
            }
          } else {
            setUserProfile(null);
            localStorage.removeItem('shaivika_auth_token');
            localStorage.removeItem('token');
            localStorage.removeItem('shaivika_user');
          }
        } catch (err) {
          console.warn('Auth state sync notice:', err);
        } finally {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      });

      return () => {
        clearTimeout(safetyTimer);
        unsubscribe();
      };
    } catch (e) {
      console.warn('onAuthStateChanged listener notice:', e);
      setLoading(false);
      clearTimeout(safetyTimer);
    }
  }, []);

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student'
  ): Promise<void> => {
    if (!auth) {
      throw new Error('Authentication service is currently unavailable.');
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Direct client-side Firebase Auth registration
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(userCredential.user, { displayName: name });

    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: cleanEmail,
      name,
      fullName: name,
      role,
      provider: 'password',
      providerId: 'password',
      isVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: role === 'instructor' ? 'pending' : 'active',
      approved: role !== 'instructor',
    };

    if (db) {
      try {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, newProfile, { merge: true });

        if (role === 'student') {
          await syncStudent(newProfile);
        } else if (role === 'instructor') {
          await syncInstructor(newProfile);
        }
      } catch (dbErr) {
        console.warn('[SIGNUP] Firestore profile write notice:', dbErr);
      }
    }

    // Optional backend notification for instructor applications
    if (role === 'instructor') {
      try {
        const apiBaseUrl = API_BASE_URL;
        fetch(`${apiBaseUrl}/auth/signup/lecturer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name,
            email: cleanEmail,
            password,
            branch: 'AI & Computer Science',
            specialty: 'Computer Science & System Architecture',
            experience: 'Pending Verification',
          }),
        }).catch(() => null);
      } catch (e) {}
    }

    setUser(userCredential.user);
    setUserProfile(newProfile);
    setLoading(false);

    try {
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('shaivika_auth_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('shaivika_user', JSON.stringify(newProfile));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kaizenq_signup_role');
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ): Promise<UserProfile | null> => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured.');
    }
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
    } catch (e) {
      console.warn('Persistence config warning:', e);
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail.startsWith('admin@');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Reload Firebase User to fetch latest emailVerified status
      try {
        await userCredential.user.reload();
      } catch (reloadErr) {
        console.warn('Firebase user reload notice:', reloadErr);
      }

      const currentUser = auth.currentUser || userCredential.user;

      // Link pending GitHub credential if present
      let pendingCredRaw = typeof window !== 'undefined' ? sessionStorage.getItem('pendingGithubCredential') : null;
      if (pendingCredRaw && currentUser) {
        try {
          const parsedObj = JSON.parse(pendingCredRaw);
          let cred: AuthCredential | null = null;
          if (parsedObj.accessToken) {
            cred = GithubAuthProvider.credential(parsedObj.accessToken);
          }
          if (cred) {
            await linkWithCredential(currentUser, cred).catch((linkErr) => console.warn('Account linking notice:', linkErr));
            sessionStorage.removeItem('pendingGithubCredential');
            sessionStorage.removeItem('pendingGithubEmail');
          }
        } catch (linkCatch) {
          console.warn('Post-login linking notice:', linkCatch);
        }
      }

      const isVerifiedQuery = typeof window !== 'undefined' && window.location.search.includes('verified=true');
      const isVerified = currentUser.emailVerified || isVerifiedQuery;

      // Module 2 Gate: Admin Approval for Instructor Accounts (Students are active upon registration)
      // 1. Admin Approval Check — read ONLY from `users` collection (single source of truth)
      let approvalStatus = 'approved';
      let userRole: UserRole = 'student';
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            userRole = data.role || 'student';
            // Normalize: 'active', 'Active', 'approved' → approved; 'pending' → pending
            const rawStatus = data.status || '';
            const isApproved = data.approved === true || rawStatus === 'active' || rawStatus === 'Active' || rawStatus === 'approved';
            approvalStatus = isApproved ? 'approved' : (rawStatus || 'pending');
          }
        } catch (err) {
          console.warn('User status check failed:', err);
        }
      }

      // Auto-heal existing students who had pending status in users or students
      if (userRole === 'student' && (approvalStatus === 'pending' || approvalStatus === 'Pending' || approvalStatus === 'Pending Approval' || approvalStatus === 'email_verification_pending')) {
        approvalStatus = 'approved';
        if (db) {
          updateDoc(doc(db, 'users', currentUser.uid), {
            status: 'active',
            approved: true,
            updatedAt: new Date().toISOString(),
          }).catch((err) => console.warn('[AUTH HEAL] users record update notice:', err));
          updateDoc(doc(db, 'students', currentUser.uid), {
            status: 'active',
            approved: true,
            updatedAt: new Date().toISOString(),
          }).catch(() => null);
        }
      }

      const isInstructorPending = userRole === 'instructor' && (approvalStatus === 'pending' || approvalStatus === 'Pending');

      if (!isAdminEmail && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        // 1. Email Verification Check - Enforced on instructors; students can access the platform
        if (!isVerified && userRole === 'instructor') {
          await signOut(auth).catch(() => null);
          const unverifiedError: any = new Error('Please verify your email address before logging in.');
          unverifiedError.code = 'EMAIL_NOT_VERIFIED';
          throw unverifiedError;
        }

        if (isInstructorPending) {
          if (auth) {
            await signOut(auth).catch(() => null);
          }
          console.warn(`[Dashboard Access Blocked] Instructor ${currentUser.email} blocked because status is ${approvalStatus}.`);
          const pendingErr: any = new Error(
            'Your instructor account is awaiting administrator approval. Please check your email.'
          );
          pendingErr.code = 'ADMIN_APPROVAL_PENDING';
          throw pendingErr;
        } else if (approvalStatus === 'rejected' || approvalStatus === 'Rejected') {
          if (auth) {
            await signOut(auth).catch(() => null);
          }
          console.warn(`[Dashboard Access Blocked] User ${currentUser.email} blocked because status is ${approvalStatus}.`);
          const rejectedErr: any = new Error(userRole === 'instructor'
            ? 'Your instructor application has not been approved.'
            : 'Your registration application was not approved by the administrator.'
          );
          rejectedErr.code = 'APPLICATION_REJECTED';
          throw rejectedErr;
        } else if (approvalStatus === 'suspended' || approvalStatus === 'Suspended') {
          if (auth) {
            await signOut(auth).catch(() => null);
          }
          console.warn(`[Dashboard Access Blocked] User ${currentUser.email} blocked because status is ${approvalStatus}.`);
          const suspendedErr: any = new Error('Your account is currently suspended by an administrator.');
          suspendedErr.code = 'ACCOUNT_SUSPENDED';
          throw suspendedErr;
        } else {
          console.log(`[Dashboard Access Granted] User ${currentUser.email} approved for role: ${userRole}.`);
        }
      }

      const profile = await fetchUserProfile(
        currentUser,
        undefined,
        isAdminEmail ? 'admin' : undefined
      );
      setUser(currentUser);
      setUserProfile(profile);

      try {
        const token = await currentUser.getIdToken(true);
        localStorage.setItem('shaivika_auth_token', token);
        localStorage.setItem('token', token);
        if (profile) {
          localStorage.setItem('shaivika_user', JSON.stringify(profile));
        }
      } catch (e) {}
      setLoading(false);

      return profile;
    } catch (err: any) {
      // Throw credentials error if password is wrong or user invalid
      if (
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/invalid-email' ||
        err?.code === 'EMAIL_NOT_VERIFIED' ||
        err?.code === 'ADMIN_APPROVAL_PENDING' ||
        err?.code === 'APPLICATION_REJECTED' ||
        err?.code === 'ACCOUNT_SUSPENDED'
      ) {
        throw err;
      }

      // Only attempt initial admin creation if admin user is not found in Firebase yet
      if (isAdminEmail && (err?.code === 'auth/user-not-found' || err?.code === 'auth/user-disabled')) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(newCredential.user, { displayName: 'Administrator (Manoj)' });
          const profile = await fetchUserProfile(newCredential.user, undefined, 'admin');
          setUser(newCredential.user);
          setUserProfile(profile);
          return profile;
        } catch (createErr) {
          throw err;
        }
      }
      throw err;
    }
  };

  const signInWithGithub = async (targetRole?: UserRole): Promise<UserProfile | null> => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured.');
    }
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    provider.addScope('read:user');

    if (import.meta.env.DEV) {
      console.log('🔍 [AUTH AUDIT] Starting GitHub OAuth flow...', {
        currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
        projectId: auth.app.options.projectId,
        authDomain: auth.app.options.authDomain,
      });
    }

    try {
      if (import.meta.env.DEV) {
        console.log('🚀 [AUTH AUDIT] Opening GitHub OAuth popup...');
      }
      const result = await signInWithPopup(auth, provider);
      const additionalInfo = getAdditionalUserInfo(result);
      const ghProfile = additionalInfo?.profile as Record<string, any> | undefined;
      const githubUsername = additionalInfo?.username || ghProfile?.login || (result.user as any).reloadUserInfo?.screenName;
      const githubDisplayName = ghProfile?.name || result.user.displayName || (ghProfile?.login ? ghProfile.login : githubUsername);

      if (import.meta.env.DEV) {
        console.log('✅ [AUTH AUDIT] GitHub OAuth sign-in succeeded:', {
          uid: result.user.uid,
          email: result.user.email,
          githubUsername,
          githubDisplayName,
        });
      }

      const profile = await fetchUserProfile(result.user, githubUsername, targetRole, githubDisplayName);
      setUser(result.user);
      setUserProfile(profile);

      // Cache token and user profile in localStorage for instant API and guard authorization
      try {
        const token = await result.user.getIdToken(true);
        localStorage.setItem('shaivika_auth_token', token);
        localStorage.setItem('token', token);
        if (profile) {
          localStorage.setItem('shaivika_user', JSON.stringify(profile));
        }
      } catch (tokenErr) {
        console.warn('Could not cache auth token:', tokenErr);
      }
      setLoading(false);

      if (profile) {
        const cleanEmail = (result.user.email || '').toLowerCase().trim();
        const isAdminEmail = cleanEmail === 'admin@gmail.com' || cleanEmail.startsWith('admin@');
        if (!isAdminEmail) {
          const isPending = (profile.role === 'instructor' && (profile.status === 'pending' || profile.status === 'Pending'));
          const isRejected = profile.status === 'rejected';

          if (isPending) {
            if (auth) {
              await signOut(auth).catch(() => null);
            }
            const pendingErr: any = new Error('Your instructor account is under review. You will receive an approval email once the administrator approves your application.');
            pendingErr.code = 'ADMIN_APPROVAL_PENDING';
            throw pendingErr;
          } else if (isRejected) {
            if (auth) {
              await signOut(auth).catch(() => null);
            }
            const rejectedErr: any = new Error('Your instructor application has not been approved.');
            rejectedErr.code = 'APPLICATION_REJECTED';
            throw rejectedErr;
          }
        }
      }
      return profile;
    } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('🚨 [AUTH AUDIT] signInWithPopup error caught:', {
            code: error.code,
            message: error.message,
            email: error.customData?.email || error.email,
          });
        }

        if (error.code === 'auth/account-exists-with-different-credential') {
          const pendingCred = GithubAuthProvider.credentialFromError(error);
          const email = error.customData?.email || error.email;
          let existingMethods: string[] = [];

          if (email && auth) {
            try {
              existingMethods = await fetchSignInMethodsForEmail(auth, email);
              if (import.meta.env.DEV) {
                console.log('📋 [AUTH AUDIT] Existing sign-in methods for email:', email, existingMethods);
              }
            } catch (fetchErr) {
              if (import.meta.env.DEV) {
                console.warn('⚠️ [AUTH AUDIT] fetchSignInMethodsForEmail notice:', fetchErr);
              }
            }
          }

          if (pendingCred) {
            try {
              sessionStorage.setItem('pendingGithubCredential', JSON.stringify(pendingCred));
              if (email) sessionStorage.setItem('pendingGithubEmail', email);
            } catch (sErr) {
              console.warn('sessionStorage notice:', sErr);
            }
          }

          const customErr: any = new Error(
            existingMethods.includes('password')
              ? `An account with email "${email}" already exists. Please login using your password first to link your GitHub account.`
              : `An account already exists with a different sign-in credential for ${email || 'this email'}. Please sign in with your primary credential.`
          );
          customErr.code = 'auth/account-exists-with-different-credential';
          customErr.email = email;
          customErr.existingMethods = existingMethods;
          customErr.pendingCredential = pendingCred;
          throw customErr;
        }

        if (error.code === 'auth/popup-closed-by-user') {
          const customErr: any = new Error('GitHub sign-in was cancelled or the popup window was closed before completing authorization.');
          customErr.code = 'auth/popup-closed-by-user';
          throw customErr;
        }

        if (error.code === 'auth/popup-blocked') {
          const customErr: any = new Error('The sign-in popup was blocked by your browser. Please allow popups for this website and try again.');
          customErr.code = 'auth/popup-blocked';
          throw customErr;
        }

        if (error.code === 'auth/unauthorized-domain') {
          const customErr: any = new Error(`Domain "${window.location.hostname}" is not authorized in Firebase Authentication. Please add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
          customErr.code = 'auth/unauthorized-domain';
          throw customErr;
        }

        if (error.code === 'auth/operation-not-allowed') {
          const customErr: any = new Error('GitHub sign-in provider is not enabled in Firebase Console. Please enable it under Authentication -> Sign-in method.');
          customErr.code = 'auth/operation-not-allowed';
          throw customErr;
        }

        if (error.code === 'auth/timeout' || error.code === 'auth/popup-timeout') {
          const customErr: any = new Error('GitHub authentication timed out. Please check your network connection and try again.');
          customErr.code = 'auth/popup-timeout';
          throw customErr;
        }

        throw error;
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('kaizenq_signup_role');
      }
    }
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await signOut(auth).catch(() => null);
    }
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('shaivika_auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('shaivika_user');
    localStorage.removeItem('firebase_token');
  };

  const clearAuthCaches = async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth).catch(() => null);
      }
      if (typeof window !== 'undefined') {
        // Selectively remove auth keys — DO NOT call sessionStorage.clear() as that would
        // wipe the developer session token and lock everyone out of prelaunch mode
        const authKeys = [
          'shaivika_auth_token', 'token', 'firebase_token', 'shaivika_user',
          'kaizenq_signup_role', 'pendingGithubCredential', 'pendingGithubEmail',
        ];
        authKeys.forEach((k) => {
          sessionStorage.removeItem(k);
          localStorage.removeItem(k);
        });
        localStorage.removeItem('shaivika_realtime_students_v3');
        localStorage.removeItem('shaivika_admin_users_v3');
        if ('indexedDB' in window) {
          indexedDB.deleteDatabase('firebaseLocalStorageDb');
        }
      }
      setUser(null);
      setUserProfile(null);
      console.log('🧹 [AUTH AUDIT] All auth persistence, local storage, and session caches cleared cleanly.');
    } catch (e) {
      console.warn('Clear auth caches notice:', e);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    let clientSuccess = false;

    // 1. Send via Firebase Client SDK
    if (auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
        clientSuccess = true;
      } catch (fbErr: any) {
        console.warn('[AuthContext] Firebase Client sendPasswordResetEmail notice:', fbErr?.message || fbErr);
      }
    }

    // 2. Also dispatch via backend SMTP service
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend forgot-password endpoint notice:', err);
    }

    if (!clientSuccess) {
      try {
        const resetUrl = `${window.location.origin}/auth/login?reset=true&email=${encodeURIComponent(cleanEmail)}`;
        await fetch(`${API_BASE_URL}/email/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'PASSWORD_RESET',
            recipientEmail: cleanEmail,
            payload: {
              userName: cleanEmail.split('@')[0],
              email: cleanEmail,
              resetUrl,
              expiresInMinutes: 15,
            },
          }),
        });
      } catch (e) {
        console.warn('Backend custom password reset fallback notice:', e);
      }
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (user && user.email) {
      const email = user.email;
      const isInstructorRole = userProfile?.role === 'instructor';
      const name = userProfile?.fullName || userProfile?.name || email.split('@')[0];
      const verificationUrl = `${window.location.origin}/auth/login?verified=true&email=${encodeURIComponent(email)}`;

      try {
        if (isInstructorRole) {
          await fetch(`${API_BASE_URL}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'INSTRUCTOR_REGISTRATION_PENDING',
              recipientEmail: email.toLowerCase().trim(),
              payload: {
                instructorName: name,
                email: email.toLowerCase().trim(),
                department: 'Computer Science & System Architecture',
                qualification: 'Pending Verification',
                experience: 'Not yet specified',
                verificationUrl,
              },
            }),
          });
        } else {
          await fetch(`${API_BASE_URL}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'REGISTRATION_PENDING',
              recipientEmail: email.toLowerCase().trim(),
              payload: {
                studentName: name,
                email: email.toLowerCase().trim(),
                verificationUrl,
                expiresInMinutes: 30,
              },
            }),
          });
        }
      } catch (e) {
        console.warn('Backend verification email dispatch notice:', e);
      }
    }
  };

  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    if (user) {
      return await fetchUserProfile(user);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signup,
        login,
        signInWithGithub,
        logout,
        resetPassword,
        sendVerificationEmail,
        refreshUserProfile,
        clearAuthCaches,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
