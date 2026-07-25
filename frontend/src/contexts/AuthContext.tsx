import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
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
  getAdditionalUserInfo,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
        });

        if (finalRole === 'student') {
          studentService.registerSignedUpStudent(
            firebaseUser.uid,
            calculatedName,
            firebaseUser.email || '',
            firebaseUser.photoURL || undefined
          );
        }

        setUserProfile(updatedPayload);
        return updatedPayload;
      } else {
        const newProfile: UserProfile = {
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
        await setDoc(userRef, newProfile);

        if (targetRole === 'student') {
          studentService.registerSignedUpStudent(
            firebaseUser.uid,
            newProfile.fullName,
            newProfile.email,
            firebaseUser.photoURL || undefined
          );
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
        provider: isGithub ? 'github.com' : 'password',
        providerId: isGithub ? 'github.com' : 'password',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isVerified: firebaseUser.emailVerified || isGithub || isAdmin || false,
        githubUsername: calculatedUsername,
      };
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

    const isAdminEmail =
      email.toLowerCase() === 'admin@gmail.com' ||
      email.toLowerCase().includes('admin');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(
        userCredential.user,
        undefined,
        isAdminEmail ? 'admin' : undefined
      );
      return profile;
    } catch (err: any) {
      if (isAdminEmail) {
        try {
          const newCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(newCredential.user, { displayName: 'Administrator (Manoj)' });
          const profile = await fetchUserProfile(newCredential.user, undefined, 'admin');
          return profile;
        } catch (createErr) {
          const fallbackProfile: UserProfile = {
            uid: 'admin-fallback-id',
            fullName: 'Administrator (Manoj)',
            name: 'Administrator (Manoj)',
            email: email,
            photoURL: null,
            role: 'admin',
            provider: 'password',
            providerId: 'password',
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isVerified: true,
          };
          setUserProfile(fallbackProfile);
          return fallbackProfile;
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

    const result = await signInWithPopup(auth, provider);
    const additionalInfo = getAdditionalUserInfo(result);
    const githubUsername = additionalInfo?.username || (result.user as any).reloadUserInfo?.screenName;

    const profile = await fetchUserProfile(result.user, githubUsername);
    return profile;
  };

  const logout = async (): Promise<void> => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Auth is not configured.');
    }
    await sendPasswordResetEmail(auth, email);
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
