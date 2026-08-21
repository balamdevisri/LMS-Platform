import { adminAuth, db } from '../../firebase';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { GitHubService } from '../../services/github/GitHubService';
import { emailService } from '../../services/email/EmailService';
import { EmailEventType } from '../../types/emailTypes';
import logger from '../../config/logger';
import {
  StudentRegistrationInput,
  StudentApproveInput,
  StudentRejectInput,
} from '../../validators/student.validator';

export class StudentService {
  /**
   * Complete Manual Student Registration
   * Writes exclusively to the central `users` collection.
   */
  public async registerStudent(input: StudentRegistrationInput) {
    const { fullName, email, password, githubUrl, linkedin, portfolio, phone } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Extract GitHub Username & Validate Profile
    const username = GitHubService.extractUsername(githubUrl);
    console.log("1. Signup Started for:", normalizedEmail);

    // 2. Check for Duplicate Email in Firebase Auth / Firestore users
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

    // 3. Check for Duplicate GitHub Profile in Firestore users
    if (db && typeof db.collection === 'function') {
      try {
        const existingGithubSnap = await db
          .collection('users')
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

    // 4. Fetch GitHub Profile & Repositories
    const githubProfile = await GitHubService.fetchUserProfile(username);
    const githubRepos = await GitHubService.fetchUserRepos(username);

    // 5. Create Firebase Authentication Account
    logger.info(`[SIGNUP] Creating Firebase Auth account for ${normalizedEmail}...`);
    let firebaseUser: { uid: string };
    try {
      firebaseUser = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: fullName,
        disabled: false,
      });
      logger.info(`[SIGNUP] Firebase user created! UID: ${firebaseUser.uid}`);
    } catch (err: any) {
      if (err?.message?.includes('already exists') || err?.code === 'auth/email-already-exists') {
        throw new Error(`A student account is already registered with email address: ${normalizedEmail}`);
      }
      logger.warn(`[SIGNUP] Firebase Admin Auth createUser notice (fallback UID): ${err?.message || err}`);
      firebaseUser = { uid: 'st_' + Date.now() };
    }

    console.log("2. Firebase User Created. Storing in users collection...");

    // 6. Build Central User Document Schema
    const now = new Date().toISOString();
    const userDocument = {
      uid: firebaseUser.uid,
      fullName,
      name: fullName,
      email: normalizedEmail,
      photoURL: githubProfile.avatar || null,
      phone: phone || '',
      role: 'student',
      approved: false,
      status: 'pending',
      isActive: true,
      branch: 'AI & Computer Science',
      semester: '1st Semester',
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
      createdAt: now,
      updatedAt: now,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      lastLogin: null,
      // AI & Learning Metrics
      skills: [],
      languages: Array.from(new Set(githubRepos.map((r) => r.language).filter((l) => l && l !== 'Plain Text'))),
      frameworks: [],
      repoScore: Math.min(100, (githubProfile.repositories * 5) + (githubProfile.followers * 2)),
      activityScore: 85,
      overallAIScore: Math.min(100, 50 + (githubProfile.repositories * 2)),
    };

    // 7. Store ONLY in central `users` collection
    if (db && typeof db.collection === 'function') {
      try {
        await db.collection('users').doc(firebaseUser.uid).set(userDocument);
        logger.info(`[SIGNUP] Saved user document in central users collection successfully.`);
      } catch (firestoreErr: any) {
        logger.warn(`[SIGNUP] Firestore write notice: ${firestoreErr?.message || firestoreErr}`);
      }
    }

    // 8. Generate Link & Dispatch SMTP Pending Email
    let link = `https://shaivika-lms.vercel.app/auth/login?verified=true&email=${encodeURIComponent(normalizedEmail)}`;
    try {
      if (typeof adminAuth.generateEmailVerificationLink === 'function') {
        link = await adminAuth.generateEmailVerificationLink(normalizedEmail);
      }
    } catch (linkErr: any) {
      console.warn("Notice generating Admin Auth verification link:", linkErr?.message || linkErr);
    }

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

      logger.info(`[SIGNUP] SMTP Pending Email dispatched. Result: ${emailResult.success}`);
    } catch (emailErr: any) {
      logger.error(`[SIGNUP-ERR] Pending Email delivery exception:`, emailErr);
    }

    return {
      success: true,
      message: 'Student registration submitted successfully. Your account is pending admin approval.',
      student: userDocument,
    };
  }

  /**
   * Get all pending approval students from central `users` collection
   */
  public async getPendingStudents() {
    if (!db || typeof db.collection !== 'function') {
      return [];
    }

    try {
      const snap = await db
        .collection('users')
        .where('role', '==', 'student')
        .where('approved', '==', false)
        .get();

      return snap.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.warn('Error fetching pending students from users collection:', err?.message || err);
      return [];
    }
  }

  /**
   * Approve Student Account
   * Updates central `users` collection: approved=true, status='active', approvedAt, approvedBy
   */
  public async approveStudent(input: StudentApproveInput) {
    const { studentId } = input;
    const now = new Date().toISOString();

    let studentData: any = null;

    if (db && typeof db.collection === 'function') {
      let userRef = db.collection('users').doc(studentId);

      let docSnap = await userRef.get();
      if (!docSnap.exists) {
        const fallbackSnap = await db.collection('users').where('uid', '==', studentId).get();
        if (!fallbackSnap.empty) {
          userRef = db.collection('users').doc(fallbackSnap.docs[0].id);
          docSnap = await userRef.get();
        } else {
          throw new Error('Student user record not found in users collection');
        }
      }

      studentData = docSnap.data();

      const updatePayload = {
        approved: true,
        status: 'active',
        isActive: true,
        approvedAt: now,
        approvedBy: 'admin',
        rejectedAt: null,
        rejectionReason: null,
        updatedAt: now,
      };

      await userRef.update(updatePayload);
    }

    // Send SMTP Approval Email
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
      let userRef = db.collection('users').doc(studentId);

      let docSnap = await userRef.get();
      if (!docSnap.exists) {
        const fallbackSnap = await db.collection('users').where('uid', '==', studentId).get();
        if (!fallbackSnap.empty) {
          userRef = db.collection('users').doc(fallbackSnap.docs[0].id);
          docSnap = await userRef.get();
        } else {
          throw new Error('Student user record not found in users collection');
        }
      }

      studentData = docSnap.data();

      const updatePayload = {
        approved: false,
        status: 'rejected',
        isActive: false,
        rejectedAt: now,
        rejectionReason: reason || 'Registration details did not meet criteria.',
        updatedAt: now,
      };

      await userRef.update(updatePayload);
    }

    // Send SMTP Rejection Email
    if (studentData && studentData.email) {
      try {
        await emailService.sendEventEmail(
          EmailEventType.REGISTRATION_REJECTED,
          studentData.email,
          {
            studentName: studentData.fullName || studentData.name || 'Student',
            email: studentData.email,
            reason: reason || 'Registration details did not meet criteria.',
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
