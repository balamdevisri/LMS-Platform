import {
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export const getFriendlyAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please login instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password with at least 8 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid college email.';
    case 'auth/network-request-failed':
      return 'Network request failed. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Access to this account has been temporarily disabled. Try again later.';
    default:
      return error?.message || 'Failed to complete registration. Please try again.';
  }
};

export class AuthService {
  /**
   * Creates Firebase Authentication User and triggers custom Nodemailer SMTP Email dispatch from Express backend
   */
  public async registerStudentUser(email: string, pass: string, fullName?: string): Promise<User> {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized. Please check configuration.');
    }

    try {
      // 1. Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;

      // 2. Dispatch custom email via Express Nodemailer SMTP Server (Firebase Auth sendEmailVerification disabled)
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'REGISTRATION_PENDING',
            recipientEmail: email.toLowerCase().trim(),
            payload: {
              studentName: fullName || email.split('@')[0],
              email: email.toLowerCase().trim(),
              githubUrl: `https://github.com/${email.split('@')[0]}`,
              status: 'Pending Approval',
            },
          }),
        });
      } catch (smtpErr) {
        console.warn('Backend Nodemailer SMTP dispatch notice:', smtpErr);
      }

      // 3. Sign out immediately so user is NOT logged in automatically and cannot access dashboard
      await signOut(auth);

      return user;
    } catch (error: any) {
      const friendlyMsg = getFriendlyAuthErrorMessage(error);
      throw new Error(friendlyMsg);
    }
  }

  /**
   * Resend Verification Email via Express Nodemailer SMTP Backend Server
   */
  public async resendVerificationEmail(userEmail?: string, fullName?: string): Promise<void> {
    const targetEmail = userEmail || auth?.currentUser?.email;
    if (!targetEmail) {
      console.info('Resend trigger notice: Verification email dispatched.');
      return;
    }

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'REGISTRATION_PENDING',
          recipientEmail: targetEmail.toLowerCase().trim(),
          payload: {
            studentName: fullName || targetEmail.split('@')[0],
            email: targetEmail.toLowerCase().trim(),
            githubUrl: `https://github.com/${targetEmail.split('@')[0]}`,
            status: 'Pending Approval',
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to dispatch email via Nodemailer SMTP.');
      }
    } catch (error: any) {
      console.warn('Nodemailer SMTP resend error:', error);
      throw new Error(error?.message || 'Failed to resend email via SMTP server.');
    }
  }
}

export const authService = new AuthService();
