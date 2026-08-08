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
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { UserProfile, UserRole } from '@/types/user';

const syncStudent = async (profile: UserProfile) => {
  if (!db) return;
  try {
    const studentRef = doc(db, 'students', profile.uid);
    await setDoc(studentRef, {
      ...profile,
      id: profile.uid,
      name: profile.fullName || profile.name || 'Student',
      email: profile.email,
      joined: profile.createdAt || new Date().toISOString(),
      courses: profile.enrolledCoursesCount || 1,
      status: profile.status || 'Active',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or create user document from Firestore
  const fetchUserProfile = async (
    firebaseUser: User,
    githubHandle?: string,
    initialRole?: UserRole
  ): Promise<UserProfile | null> => {
    const isGithub =
      firebaseUser.providerData.some((p) => p.providerId === 'github.com') ||
      firebaseUser.photoURL?.includes('githubusercontent');

    const calculatedUsername =
      githubHandle ||
      (firebaseUser as any).reloadUserInfo?.screenName ||
      (isGithub ? firebaseUser.email?.split('@')[0] : undefined);

    const isAdmin =
      firebaseUser.email?.toLowerCase().includes('admin') ||
      firebaseUser.email?.toLowerCase() === 'admin@gmail.com' ||
      initialRole === 'admin';

    const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('kaizenq_signup_role') as UserRole : undefined;
    const targetRole: UserRole = isAdmin ? 'admin' : (initialRole || storedRole || 'student');

    console.log(`[FIRESTORE AUDIT] fetchUserProfile called | initialRole: ${initialRole} | storedRole: ${storedRole} | targetRole: ${targetRole}`);

    const calculatedName = firebaseUser.displayName || (isAdmin ? 'Administrator' : 'Student User');
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
        
        const isApproved = isAdmin ? true : (data.approved !== undefined ? data.approved : (data.status === 'active' || data.status === 'Active' || data.status === 'approved'));
        const currentStatus = data.status || (isAdmin ? 'active' : 'pending');

        const profileData: UserProfile = {
          ...data,
          ...baseProfileData,
          role: finalRole,
          approved: isApproved,
          status: currentStatus,
          isActive: data.isActive !== undefined ? data.isActive : true,
          phone: data.phone || '',
          github: data.github || (calculatedUsername ? `https://github.com/${calculatedUsername}` : ''),
          linkedin: data.linkedin || '',
          branch: data.branch || 'AI & Computer Science',
          semester: (data as any).semester || '1st Semester',
          photoURL: data.photoURL || firebaseUser.photoURL || null,
          lastLogin: new Date().toISOString(),
        };

        setUserProfile(profileData);
        return profileData;
      } else {
        const isApproved = isAdmin ? true : false;
        const initialStatus = isAdmin ? 'active' : 'pending';

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
          phone: '+1 (555) 019-2831',
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
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
        approved: false,
        // CRITICAL: use lowercase 'pending' — uppercase 'Pending' breaks Admin Dashboard filter
        status: targetRole === 'instructor' ? 'pending' : 'Active',
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
    }, 600);

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
        try {
          setUser(currentUser);
          if (currentUser) {
            const token = await currentUser.getIdToken(true);
            localStorage.setItem('shaivika_auth_token', token);
            localStorage.setItem('token', token);

            const storedSignupRole = typeof window !== 'undefined' ? sessionStorage.getItem('kaizenq_signup_role') as UserRole : undefined;
            const profile = await fetchUserProfile(currentUser, undefined, storedSignupRole);
            if (profile) {
              // Enforce account status check on initialization
              const isPending = (profile.role === 'instructor' && (profile.status === 'pending' || profile.status === 'Pending')) || 
                                (profile.role === 'student' && profile.status === 'pending');
              const isRejected = profile.status === 'rejected';
              const isSuspended = profile.status === 'Suspended';
              
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
              } else {
                console.log(`[Dashboard Access Granted] Persistence session approved for ${currentUser.email} (Role: ${profile.role}).`);
              }
            }
          } else {
            setUserProfile(null);
            localStorage.removeItem('shaivika_auth_token');
            localStorage.removeItem('token');
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
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const endpoint = role === 'instructor' ? `${apiBaseUrl}/auth/signup/lecturer` : `${apiBaseUrl}/auth/signup/student`;

    console.log(`[SIGNUP] Dispatching ${role} registration to backend endpoint: ${endpoint}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        email: email.toLowerCase().trim(),
        password,
        branch: 'AI & Computer Science',
        specialty: 'Computer Science & System Architecture',
        experience: 'Pending Verification',
      }),
    });

    const resData = await response.json();
    if (!response.ok || !resData.success) {
      console.error(`[SIGNUP ERROR] Backend ${role} signup failed:`, resData);
      throw new Error(resData.error || resData.message || `Failed to submit ${role} registration.`);
    }

    console.log(`[SIGNUP SUCCESS] ${role} registration completed via backend:`, resData);
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

      // Module 2 Gate: Email Verification AND Admin Approval for Student/Instructor Accounts
      if (!isAdminEmail) {
        // 1. Email Verification Check
        if (!isVerified) {
          await signOut(auth).catch(() => null);
          const unverifiedError: any = new Error('Please verify your email address before logging in.');
          unverifiedError.code = 'EMAIL_NOT_VERIFIED';
          throw unverifiedError;
        }

        // 2. Admin Approval Check — read ONLY from `users` collection (single source of truth)
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


        const isPending = (userRole === 'instructor' && (approvalStatus === 'pending' || approvalStatus === 'Pending')) || 
                          (userRole === 'student' && (approvalStatus === 'pending' || approvalStatus === 'Pending Approval'));

        if (isPending) {
          if (auth) {
            await signOut(auth).catch(() => null);
          }
          console.warn(`[Dashboard Access Blocked] User ${currentUser.email} blocked because status is ${approvalStatus}.`);
          const pendingErr: any = new Error(userRole === 'instructor'
            ? 'Your instructor account is awaiting administrator approval. Please check your email.'
            : 'Your registration application is pending administrator review and approval.'
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

    console.log('🔍 [AUTH AUDIT] Starting GitHub OAuth flow...', {
      currentUser: auth.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
      projectId: auth.app.options.projectId,
    });

    try {
      // 1. If user is ALREADY signed in (e.g. Email/Password user connecting GitHub)
      if (auth.currentUser) {
        try {
          console.log('🔗 [AUTH AUDIT] Attempting linkWithPopup for active user session:', auth.currentUser.email);
          const linkResult = await linkWithPopup(auth.currentUser, provider);
          const additionalInfo = getAdditionalUserInfo(linkResult);
          const githubUsername = additionalInfo?.username || (linkResult.user as any).reloadUserInfo?.screenName;
          console.log('✅ [AUTH AUDIT] linkWithPopup succeeded! GitHub handle:', githubUsername);

          const profile = await fetchUserProfile(linkResult.user, githubUsername, targetRole);
          return profile;
        } catch (linkErr: any) {
          console.warn('⚠️ [AUTH AUDIT] linkWithPopup notice:', linkErr?.code, linkErr?.message);
          if (linkErr.code === 'auth/credential-already-in-use') {
            throw new Error('This GitHub account is already linked to another user profile.');
          }
        }
      }

      // 2. Standard OAuth Sign-in flow
      try {
        const result = await signInWithPopup(auth, provider);
        const additionalInfo = getAdditionalUserInfo(result);
        const githubUsername = additionalInfo?.username || (result.user as any).reloadUserInfo?.screenName;

        console.log('✅ [AUTH AUDIT] GitHub OAuth sign-in succeeded:', {
          uid: result.user.uid,
          email: result.user.email,
          githubUsername,
        });

        const profile = await fetchUserProfile(result.user, githubUsername, targetRole);
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
        console.error('🚨 [AUTH AUDIT] signInWithPopup error caught:', {
          code: error.code,
          message: error.message,
          email: error.customData?.email || error.email,
        });

        if (error.code === 'auth/account-exists-with-different-credential') {
          const pendingCred = GithubAuthProvider.credentialFromError(error);
          const email = error.customData?.email || error.email;
          let existingMethods: string[] = [];

          if (email && auth) {
            try {
              existingMethods = await fetchSignInMethodsForEmail(auth, email);
              console.log('📋 [AUTH AUDIT] Existing sign-in methods for email:', email, existingMethods);
            } catch (fetchErr) {
              console.warn('⚠️ [AUTH AUDIT] fetchSignInMethodsForEmail notice:', fetchErr);
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
        throw error;
      }
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('kaizenq_signup_role');
      }
    }
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
  };

  const clearAuthCaches = async (): Promise<void> => {
    try {
      if (auth) {
        await signOut(auth).catch(() => null);
      }
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('shaivika_user');
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
    const backendUrls = [
      'http://localhost:5000/api/auth/forgot-password',
      '/api/auth/forgot-password',
    ];

    for (const url of backendUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (err) {
        console.warn(`Forgot password Nodemailer backend notice for ${url}:`, err);
      }
    }

    // Custom Gmail SMTP Dispatcher (Firebase Default Email Disabled)
    const resetUrl = `${window.location.origin}/auth/login?reset=true&email=${encodeURIComponent(email)}`;
    const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000/api'
      : '/api';

    try {
      await fetch(`${apiBaseUrl}/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'PASSWORD_RESET',
          recipientEmail: email.toLowerCase().trim(),
          payload: {
            userName: email.split('@')[0],
            email: email.toLowerCase().trim(),
            resetUrl,
            expiresInMinutes: 15,
          },
        }),
      });
    } catch (e) {
      console.warn('Backend custom password reset notice:', e);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (user && user.email) {
      const email = user.email;
      const isInstructorRole = userProfile?.role === 'instructor';
      const name = userProfile?.fullName || userProfile?.name || email.split('@')[0];
      const verificationUrl = `${window.location.origin}/auth/login?verified=true&email=${encodeURIComponent(email)}`;
      const apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : '/api';

      try {
        if (isInstructorRole) {
          await fetch(`${apiBaseUrl}/email/send`, {
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
              },
            }),
          });
        } else {
          await fetch(`${apiBaseUrl}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'EMAIL_VERIFICATION',
              recipientEmail: email.toLowerCase().trim(),
              payload: {
                userName: name,
                email: email.toLowerCase().trim(),
                verificationUrl,
                expiresInMinutes: 30,
              },
            }),
          });
        }
      } catch (e) {
        console.warn('Backend custom email dispatch notice:', e);
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
