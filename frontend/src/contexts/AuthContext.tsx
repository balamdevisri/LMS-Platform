import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthCredential } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
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
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { UserProfile, UserRole } from '@/types/user';
import { studentService } from '@/services/studentService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserProfile | null>;
  signInWithGithub: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
  clearAuthCaches: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

    const targetRole: UserRole = isAdmin ? 'admin' : (initialRole || 'student');

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

    const syncStudent = (profile: UserProfile) => {
      if (profile.role === 'student') {
        studentService.registerSignedUpStudent(
          profile.uid,
          profile.fullName || profile.name || firebaseUser.displayName || 'Student User',
          profile.email || firebaseUser.email || '',
          firebaseUser.photoURL || profile.photoURL || undefined,
          isGithub ? 'github.com' : 'password',
          calculatedUsername
        );
      }
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
      syncStudent(fallback);
      setUserProfile(fallback);
      return fallback;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const finalRole: UserRole = isAdmin ? 'admin' : (data.role || targetRole);
        const updatedPayload: UserProfile = {
          ...data,
          ...baseProfileData,
          role: finalRole,
          lastLogin: new Date().toISOString(),
        };

        await updateDoc(userRef, {
          ...baseProfileData,
          role: finalRole,
          lastLogin: new Date().toISOString(),
        }).catch((err) => console.warn('Firestore updateDoc notice:', err));

        syncStudent(updatedPayload);
        setUserProfile(updatedPayload);
        return updatedPayload;
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          fullName: calculatedName,
          name: calculatedName,
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          profilePhoto: firebaseUser.photoURL || null,
          role: targetRole,
          provider: isGithub ? 'github.com' : 'password',
          providerId: isGithub ? 'github.com' : 'password',
          status: targetRole === 'instructor' ? 'Pending' : 'Active',
          branch: 'AI & Computer Science',
          year: '1st Year',
          college: 'Shaivika AI Foundation',
          phone: '+1 (555) 019-2831',
          github: calculatedUsername ? `https://github.com/${calculatedUsername}` : '',
          linkedin: '',
          portfolio: '',
          bio: 'Enthusiastic KaizenQ learner mastering Linux, AI, and DevOps.',
          skills: ['Linux', 'Git', 'Python', 'AI Foundation'],
          emailVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
          isActive: true,
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

        syncStudent(newProfile);

        await setDoc(userRef, newProfile).catch((err) => console.warn('Firestore setDoc notice:', err));

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
        provider: isGithub ? 'github.com' : 'password',
        providerId: isGithub ? 'github.com' : 'password',
        status: targetRole === 'instructor' ? 'Pending' : 'Active',
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
            await fetchUserProfile(currentUser);
          } else {
            setUserProfile(null);
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
      throw new Error('Firebase Auth is not configured.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName: name });

    // Trigger custom backend verification email via Nodemailer SMTP
    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const verificationUrl = `${window.location.origin}/auth/login?verified=true&email=${encodeURIComponent(email.toLowerCase().trim())}`;
      
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
    } catch (e) {
      console.warn('Backend custom email verification failed:', e);
    }

    try {
      await sendEmailVerification(firebaseUser);
    } catch (e) {
      console.warn('Email verification failed:', e);
    }

    await fetchUserProfile(firebaseUser, undefined, role);
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

        // 2. Admin Approval Check
        let approvalStatus = 'approved';
        let userRole: UserRole = 'student';
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              userRole = data.role || 'student';
              approvalStatus = data.status || 'Active';
            }
          } catch (err) {
            console.warn('User status check failed:', err);
          }
        }

        // For student, check student collection if user doc did not specify status
        if (userRole === 'student' && approvalStatus === 'Active') {
          try {
            const localStudents = studentService.getLocalStudents();
            const match = localStudents.find((s) => s.id === currentUser.uid || s.uid === currentUser.uid || s.email === currentUser.email);
            if (match && match.status) {
              approvalStatus = match.status;
            } else if (db) {
              let studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
              let data = studentDoc.exists() ? studentDoc.data() : null;

              if (!studentDoc.exists()) {
                const q = query(collection(db, 'students'), where('uid', '==', currentUser.uid));
                const qSnap = await getDocs(q);
                if (!qSnap.empty) {
                  data = qSnap.docs[0].data();
                }
              }

              if (data) {
                approvalStatus = data.status || (data.approved ? 'approved' : 'pending');
              }
            }
          } catch (docErr) {
            console.warn('Student status check notice:', docErr);
          }
        }

        const isPending = (userRole === 'instructor' && approvalStatus === 'Pending') || 
                          (userRole === 'student' && (approvalStatus === 'pending' || approvalStatus === 'Pending Approval'));

        if (isPending) {
          await signOut(auth).catch(() => null);
          const pendingErr: any = new Error('Your registration application is pending administrator review and approval.');
          pendingErr.code = 'ADMIN_APPROVAL_PENDING';
          throw pendingErr;
        } else if (approvalStatus === 'rejected') {
          await signOut(auth).catch(() => null);
          const rejectedErr: any = new Error('Your registration application was not approved by the administrator.');
          rejectedErr.code = 'APPLICATION_REJECTED';
          throw rejectedErr;
        } else if (approvalStatus === 'suspended') {
          await signOut(auth).catch(() => null);
          const suspendedErr: any = new Error('Your account is currently suspended by an administrator.');
          suspendedErr.code = 'ACCOUNT_SUSPENDED';
          throw suspendedErr;
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

  const signInWithGithub = async (): Promise<UserProfile | null> => {
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

    // 1. If user is ALREADY signed in (e.g. Email/Password user connecting GitHub)
    if (auth.currentUser) {
      try {
        console.log('🔗 [AUTH AUDIT] Attempting linkWithPopup for active user session:', auth.currentUser.email);
        const linkResult = await linkWithPopup(auth.currentUser, provider);
        const additionalInfo = getAdditionalUserInfo(linkResult);
        const githubUsername = additionalInfo?.username || (linkResult.user as any).reloadUserInfo?.screenName;
        console.log('✅ [AUTH AUDIT] linkWithPopup succeeded! GitHub handle:', githubUsername);

        const profile = await fetchUserProfile(linkResult.user, githubUsername);
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

      const profile = await fetchUserProfile(result.user, githubUsername);
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

    // Client SDK fallback if backend is offline
    if (auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth && auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
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
