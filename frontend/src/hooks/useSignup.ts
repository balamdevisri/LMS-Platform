import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { firestoreService } from '@/services/firestoreService';
import { adminNotificationService } from '@/services/adminNotificationService';
import type { StudentSignupFormData } from '@/types/auth';
import type { StudentFirestoreDocument } from '@/types/student';

export const useSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStudentSignup = async (formData: StudentSignupFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { fullName, email, password, githubUrl, linkedinUrl, portfolioUrl } = formData;
      const normalizedEmail = email.toLowerCase().trim();

      // 1. Create Firebase Auth account & immediately send email verification
      const user = await authService.registerStudentUser(normalizedEmail, password);

      // 2. Create Firestore student document in `students` collection with doc ID = user.uid
      const now = new Date().toISOString();
      const studentDoc: StudentFirestoreDocument = {
        uid: user.uid,
        fullName: fullName.trim(),
        email: normalizedEmail,
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl ? linkedinUrl.trim() : '',
        portfolioUrl: portfolioUrl ? portfolioUrl.trim() : '',
        emailVerified: false,
        status: 'email_verification_pending',
        role: 'student',
        createdAt: now,
        updatedAt: now,
        lastLogin: null,
      };

      await firestoreService.createStudentDocument(studentDoc);

      // Dispatch dynamic real-time notification to Admin & Instructors
      try {
        adminNotificationService.addNotification({
          type: 'NEW_STUDENT',
          title: 'New Student Application',
          message: `${fullName.trim()} (${normalizedEmail}) registered and pending verification.`,
          link: '/admin/students?status=pending',
        });
      } catch (e) {
        console.warn('Failed to post signup notification:', e);
      }

      toast.success('Account created! Verification email sent.');

      // 3. Redirect user to /auth/verify-email without auto-login session
      navigate('/auth/verify-email', {
        replace: true,
        state: {
          email: normalizedEmail,
          fullName: fullName.trim(),
        },
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to complete registration. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleStudentSignup,
    isSubmitting,
    error,
  };
};
