import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  type User,
  type ActionCodeSettings,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Maps Firebase Auth error codes to user-friendly error messages
 */
export const getFriendlyAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please login instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password with at least 8 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid college email.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact administrator.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Access to this account has been temporarily disabled. Try again later.';
    default:
      return error?.message || 'Failed to complete registration. Please try again.';
  }
};

export class FirebaseAuthService {
  /**
   * Registers a new Firebase Auth user, sends verification email with continue URL, and signs out immediately
   */
  public async registerStudentUser(email: string, pass: string): Promise<User> {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized. Please check your configuration.');
    }

    try {
      // 1. Create Firebase Authentication User
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // 2. Configure ActionCodeSettings with continue URL pointing to frontend login
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/auth/login?verified=true`,
        handleCodeInApp: true,
      };

      // 3. Send Verification Email
      try {
        await sendEmailVerification(user, actionCodeSettings);
      } catch (emailErr) {
        console.warn('Firebase Email Verification Notice:', emailErr);
      }

      // 4. Sign out immediately so user is NOT logged in automatically and cannot access dashboard
      await signOut(auth);

      return user;
    } catch (error: any) {
      const friendlyMsg = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMsg);
    }
  }

  /**
   * Resends Email Verification to a user
   */
  public async resendVerificationEmail(user: User): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/auth/login?verified=true`,
      handleCodeInApp: true,
    };

    try {
      await sendEmailVerification(user, actionCodeSettings);
    } catch (error: any) {
      const friendlyMsg = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMsg);
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
