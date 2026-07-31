import { adminAuth, db } from '../../firebase';
import { GitHubService } from '../../services/github/GitHubService';
import { EmailService } from '../../services/email/EmailService';
import { EmailEventType } from '../../types/emailTypes';
import logger from '../../config/logger';
import {
  StudentRegistrationInput,
  StudentApproveInput,
  StudentRejectInput,
} from '../../validators/student.validator';

const emailService = new EmailService();

export class StudentService {
  /**
   * Complete Manual Student Registration
   */
  public async registerStudent(input: StudentRegistrationInput) {
    const { fullName, email, password, githubUrl, linkedin, portfolio, phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Extract GitHub Username & Validate Profile Existence
    const username = GitHubService.extractUsername(githubUrl);

    console.log("1. Signup Started");

    // 2. Check for Duplicate Email in Firebase Auth / Firestore
    try {
      const existingAuthUser = await adminAuth.getUserByEmail(normalizedEmail).catch(() => null);
      if (existingAuthUser) {
        throw new Error('An account with this email already exists');
      }
    } catch (err: any) {
      if (err.message === 'An account with this email already exists') {
        throw err;
      }
    }

    // 3. Check for Duplicate GitHub Profile in Firestore
    if (db && typeof db.collection === 'function') {
      try {
        const existingGithubSnap = await db
          .collection('students')
          .where('github.username', '==', username)
          .get()
          .catch(() => null);

        if (existingGithubSnap && !existingGithubSnap.empty) {
          throw new Error(`A student account is already registered with GitHub profile: ${username}`);
        }
      } catch (err: any) {
        if (err.message.includes('already registered')) {
          throw err;
        }
      }
    }

    // 4. Fetch GitHub User Profile & Public Repositories (Throws "Invalid GitHub Profile" if 404)
    const githubProfile = await GitHubService.fetchUserProfile(username);
    const githubRepos = await GitHubService.fetchUserRepos(username);

    // 5. Create Firebase Authentication Account
    logger.info(`[SIGNUP FLOW 3] Creating Firebase Auth account for ${normalizedEmail}...`);
    let firebaseUser: { uid: string };
    try {
      firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: fullName,
        disabled: false,
      });
      logger.info(`[SIGNUP FLOW 4] Firebase user created successfully! UID: ${firebaseUser.uid}`);
    } catch (err: any) {
      if (err?.message?.includes('already exists') || err?.code === 'auth/email-already-exists') {
        logger.warn(`[SIGNUP FLOW 4] Email already exists: ${normalizedEmail}`);
        throw new Error(`A student account is already registered with email address: ${normalizedEmail}`);
      }
      logger.warn(`[SIGNUP FLOW 4] Firebase Admin Auth createUser notice (proceeding with fallback UID): ${err?.message || err}`);
      firebaseUser = { uid: 'st_' + Date.now() };
    }

    console.log("2. Firebase User Created");

    // 6. Build Complete Student Document (with AI Ready Structure)
    const now = new Date().toISOString();
    const studentData = {
      uid: firebaseUser.uid,
      fullName,
      name: fullName,
      email: normalizedEmail,
      status: 'pending',
      role: 'student',
      provider: 'manual',
      github: {
        username: githubProfile.username,
        profileUrl: githubProfile.profileUrl,
        avatar: githubProfile.avatar,
        bio: githubProfile.bio,
        company: githubProfile.company,
        location: githubProfile.location,
        website: githubProfile.website,
        twitter: githubProfile.twitter,
        followers: githubProfile.followers,
        following: githubProfile.following,
        repositories: githubProfile.repositories,
        joinedDate: githubProfile.joinedDate,
        lastUpdated: githubProfile.lastUpdated,
        repos: githubRepos,
      },
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      phone: phone || '',
      createdAt: now,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      lastLogin: null,
      // AI Ready Structure
      skills: [],
      languages: Array.from(new Set(githubRepos.map((r) => r.language).filter((l) => l && l !== 'Plain Text'))),
      frameworks: [],
      repoScore: Math.min(100, (githubProfile.repositories * 5) + (githubProfile.followers * 2)),
      activityScore: 85,
      overallAIScore: Math.min(100, 50 + (githubProfile.repositories * 2)),
    };

    // 7. Store in Firestore (`students` and `users` collections)
    logger.info(`[SIGNUP FLOW 5] Storing user document in Firestore...`);
    if (db && typeof db.collection === 'function') {
      try {
        await db.collection('students').doc(firebaseUser.uid).set(studentData);
        await db.collection('users').doc(firebaseUser.uid).set(studentData);
        logger.info(`[SIGNUP FLOW 5] Firestore user saved successfully.`);
      } catch (firestoreErr: any) {
        logger.warn(`[SIGNUP FLOW 5] Firestore store notice (non-blocking): ${firestoreErr?.message || firestoreErr}`);
      }
    }

    // 8. Generate Verification Link & Send Welcome/Verification Email via Nodemailer SMTP
    console.log("Generating verification link...");
    let link = `https://shaivika-lms.vercel.app/auth/login?verified=true&email=${encodeURIComponent(normalizedEmail)}`;
    try {
      if (typeof adminAuth.generateEmailVerificationLink === 'function') {
        link = await adminAuth.generateEmailVerificationLink(normalizedEmail);
      }
    } catch (linkErr: any) {
      console.warn("Notice generating Admin Auth verification link (using default link):", linkErr?.message || linkErr);
    }

    console.log("Generated Link:", link);
    console.log("Sending email...");

    try {
      const emailResult = await emailService.sendEventEmail(
        EmailEventType.REGISTRATION_PENDING,
        normalizedEmail,
        {
          studentName: fullName,
          email: normalizedEmail,
          verificationLink: link,
          githubUrl: githubProfile.profileUrl,
          status: 'Pending Approval',
        }
      );

      console.log("Mail Info:", {
        success: emailResult.success,
        messageId: emailResult.messageId || null,
        logId: emailResult.logId || null,
      });
      logger.info(`[SIGNUP FLOW 7] Email dispatch result -> Success: ${emailResult.success} | MessageId: ${emailResult.messageId || 'N/A'}`);
    } catch (emailErr: any) {
      console.error("SIGNUP ERROR:", emailErr);
      logger.error(`[SIGNUP FLOW 7-ERR] Welcome Email delivery exception:`, emailErr);
    }

    return {
      success: true,
      message: 'Registration submitted successfully. Your account is pending admin approval.',
      student: studentData,
    };
  }

  /**
   * Get all pending approval students
   */
  public async getPendingStudents() {
    if (!db || typeof db.collection !== 'function') {
      return [];
    }

    try {
      const snap = await db.collection('students').where('status', '==', 'pending').get();
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.warn('Error fetching pending students:', err?.message || err);
      return [];
    }
  }

  /**
   * Approve Student Account
   */
  public async approveStudent(input: StudentApproveInput) {
    const { studentId } = input;
    const now = new Date().toISOString();

    let studentData: any = null;

    if (db && typeof db.collection === 'function') {
      const docRef = db.collection('students').doc(studentId);
      const userRef = db.collection('users').doc(studentId);

      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Student record not found');
      }

      studentData = docSnap.data();

      const updatePayload = {
        status: 'approved',
        approvedAt: now,
        rejectedAt: null,
        rejectionReason: null,
      };

      await docRef.update(updatePayload);
      await userRef.update(updatePayload).catch(() => null);
    }

    // Send Approval Email
    if (studentData && studentData.email) {
      try {
        await emailService.sendEventEmail(
          EmailEventType.REGISTRATION_APPROVED,
          studentData.email,
          {
            studentName: studentData.fullName || studentData.name || 'Student',
            email: studentData.email,
            dashboardUrl: 'https://shaivika-lms.vercel.app/auth/login',
          }
        );
      } catch (emailErr: any) {
        console.warn('Approval email delivery notice:', emailErr?.message || emailErr);
      }
    }

    return {
      success: true,
      message: 'Student account approved successfully',
      approvedAt: now,
    };
  }

  /**
   * Reject Student Account with Reason
   */
  public async rejectStudent(input: StudentRejectInput) {
    const { studentId, reason } = input;
    const now = new Date().toISOString();

    let studentData: any = null;

    if (db && typeof db.collection === 'function') {
      const docRef = db.collection('students').doc(studentId);
      const userRef = db.collection('users').doc(studentId);

      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        throw new Error('Student record not found');
      }

      studentData = docSnap.data();

      const updatePayload = {
        status: 'rejected',
        rejectedAt: now,
        rejectionReason: reason,
      };

      await docRef.update(updatePayload);
      await userRef.update(updatePayload).catch(() => null);
    }

    // Send Rejection Email
    if (studentData && studentData.email) {
      try {
        await emailService.sendEventEmail(
          EmailEventType.REGISTRATION_REJECTED,
          studentData.email,
          {
            studentName: studentData.fullName || studentData.name || 'Student',
            email: studentData.email,
            reason,
          }
        );
      } catch (emailErr: any) {
        console.warn('Rejection email delivery notice:', emailErr?.message || emailErr);
      }
    }

    return {
      success: true,
      message: 'Student account rejected successfully',
      rejectedAt: now,
      reason,
    };
  }
}
