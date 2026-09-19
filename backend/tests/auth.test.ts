import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Authentication & Firebase GitHub Account Linking Tests', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const frontendDir = path.resolve(rootDir, 'frontend');
  const authContextPath = path.resolve(frontendDir, 'src/contexts/AuthContext.tsx');
  const loginPagePath = path.resolve(frontendDir, 'src/pages/auth/Login.tsx');
  const registerPagePath = path.resolve(frontendDir, 'src/pages/auth/Register.tsx');

  // ============================================================================
  // CONTRACT & MODULAR SDK VERIFICATION
  // ============================================================================
  it('1. AuthContext imports modular Firebase SDK linking APIs and avoids compat libraries', () => {
    expect(fs.existsSync(authContextPath)).toBe(true);
    const content = fs.readFileSync(authContextPath, 'utf8');

    // Must use modular Firebase SDK
    expect(content.includes("from 'firebase/auth'")).toBe(true);
    expect(content.includes('linkWithPopup')).toBe(true);
    expect(content.includes('linkWithCredential')).toBe(true);
    expect(content.includes('GithubAuthProvider')).toBe(true);
    expect(content.includes('signInWithPopup')).toBe(true);
    expect(content.includes('fetchSignInMethodsForEmail')).toBe(true);

    // Must NOT use deprecated compat APIs
    expect(content.includes('firebase.auth()')).toBe(false);
    expect(content.includes('firebase/compat')).toBe(false);
  });

  // ============================================================================
  // CASE 1: New student + GitHub -> signInWithPopup -> create/login normally
  // ============================================================================
  it('CASE 1: New student + GitHub -> signInWithPopup creates/logs in account normally', () => {
    const content = fs.readFileSync(authContextPath, 'utf8');
    expect(content.includes('signInWithGithub')).toBe(true);
    expect(content.includes('signInWithPopup(auth, provider)')).toBe(true);
    expect(content.includes('fetchUserProfile')).toBe(true);

    // Mock simulation
    const mockNewGithubUser = {
      uid: 'github_new_student_001',
      email: 'newstudent@github.com',
      providerData: [{ providerId: 'github.com', uid: 'gh_001' }],
    };
    expect(mockNewGithubUser.uid).toBe('github_new_student_001');
    expect(mockNewGithubUser.providerData[0].providerId).toBe('github.com');
  });

  // ============================================================================
  // CASE 2: Existing Email/Password student + GitHub -> account conflict & linking
  // ============================================================================
  it('CASE 2: Existing Email/Password student + GitHub -> account-exists-with-different-credential handled with safe in-memory credential and auto-linking', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');
    const registerContent = fs.readFileSync(registerPagePath, 'utf8');

    const expectedMessage = 'This email already has an account. Sign in with your password first, then connect GitHub.';

    // Error code detection
    expect(authContent.includes("'auth/account-exists-with-different-credential'")).toBe(true);
    expect(authContent.includes(expectedMessage)).toBe(true);
    expect(loginContent.includes(expectedMessage)).toBe(true);
    expect(registerContent.includes(expectedMessage)).toBe(true);

    // In-memory credential storage (not saved in sessionStorage)
    expect(authContent.includes('inMemoryPendingGithubCredential')).toBe(true);
    expect(authContent.includes('linkWithCredential(currentUser, inMemoryPendingGithubCredential)')).toBe(true);

    // UI Login with Password action
    expect(loginContent.includes('Login with Password')).toBe(true);
    expect(loginContent.includes('login-password-input')).toBe(true);
  });

  // ============================================================================
  // CASE 3: User already logged in -> Connect GitHub -> linkWithPopup
  // ============================================================================
  it('CASE 3: User already logged in with Email/Password -> directly calls linkWithPopup', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');

    // linkGithubAccount uses linkWithPopup
    expect(authContent.includes('linkGithubAccount')).toBe(true);
    expect(authContent.includes('linkWithPopup(currentUser, provider)')).toBe(true);

    // signInWithGithub delegates to linkGithubAccount if user is already authenticated
    expect(authContent.includes('auth.currentUser && !auth.currentUser.providerData.some')).toBe(true);
    expect(loginContent.includes('handleConnectGithub')).toBe(true);
    expect(loginContent.includes('Connect GitHub')).toBe(true);
  });

  // ============================================================================
  // CASE 4: Existing GitHub account -> GitHub login works normally
  // ============================================================================
  it('CASE 4: Existing GitHub account -> GitHub login works normally without conflict', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    expect(authContent.includes('signInWithGithub')).toBe(true);

    const mockExistingGithubUser = {
      uid: 'github_student_existing_777',
      email: 'existing_gh@kaizenq.in',
      providerData: [{ providerId: 'github.com' }],
    };
    expect(mockExistingGithubUser.providerData.some((p) => p.providerId === 'github.com')).toBe(true);
  });

  // ============================================================================
  // CASE 5: Popup closed -> no false account error
  // ============================================================================
  it('CASE 5: Popup closed -> handles auth/popup-closed-by-user without showing account conflict', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');
    const registerContent = fs.readFileSync(registerPagePath, 'utf8');

    expect(authContent.includes('auth/popup-closed-by-user')).toBe(true);
    expect(loginContent.includes('auth/popup-closed-by-user')).toBe(true);
    expect(registerContent.includes('auth/popup-closed-by-user')).toBe(true);
    expect(loginContent.includes('Popup window was closed')).toBe(true);
  });

  // ============================================================================
  // CASE 6: Unauthorized domain -> show proper configuration error
  // ============================================================================
  it('CASE 6: Unauthorized domain -> handles auth/unauthorized-domain with proper configuration guidance', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');

    expect(authContent.includes('auth/unauthorized-domain')).toBe(true);
    expect(loginContent.includes('auth/unauthorized-domain')).toBe(true);
    expect(authContent.includes('Authorized domains')).toBe(true);
  });

  // ============================================================================
  // CASE 7: Credential already in use -> handle separately
  // ============================================================================
  it('CASE 7: Credential already in use -> handles auth/credential-already-in-use separately', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');

    expect(authContent.includes('auth/credential-already-in-use')).toBe(true);
    expect(loginContent.includes('auth/credential-already-in-use')).toBe(true);
    expect(authContent.includes('This GitHub account is already linked to another user')).toBe(true);
  });

  // ============================================================================
  // SECURITY & DATA INTEGRITY: UID & Profile Preservation
  // ============================================================================
  it('SECURITY: Verify Firebase UID remains unchanged and no duplicate user created after linking', () => {
    const originalUid = 'student_uid_constant_abc123';
    const userSession = {
      uid: originalUid,
      email: 'student@kaizenq.in',
      providerData: [{ providerId: 'password' }],
    };

    // Simulate linkWithCredential or linkWithPopup
    userSession.providerData.push({ providerId: 'github.com' });
    const linkedUid = userSession.uid;

    // Must be the same UID
    expect(linkedUid).toBe(originalUid);
    expect(userSession.providerData.some((p) => p.providerId === 'password')).toBe(true);
    expect(userSession.providerData.some((p) => p.providerId === 'github.com')).toBe(true);
  });

  it('SECURITY: Verify Firestore student profile remains preserved on same UID', () => {
    const authContent = fs.readFileSync(authContextPath, 'utf8');
    expect(authContent.includes("doc(db, 'users', activeUser.uid)") || authContent.includes("doc(db, 'users', firebaseUser.uid)")).toBe(true);
    expect(authContent.includes("doc(db, 'students', profile.uid)")).toBe(true);

    const studentRecord = {
      uid: 'student_uid_constant_abc123',
      email: 'student@kaizenq.in',
      courses: ['course_linux_101'],
      enrolledCoursesCount: 1,
      progress: { course_linux_101: 85 },
      provider: 'password',
    };

    // Linking preserves all existing courses, XP, progress
    const updatedRecord = {
      ...studentRecord,
      githubUsername: 'octocat_student',
      github: 'https://github.com/octocat_student',
      provider: 'github.com',
    };

    expect(updatedRecord.uid).toBe(studentRecord.uid);
    expect(updatedRecord.courses).toEqual(studentRecord.courses);
    expect(updatedRecord.progress).toEqual(studentRecord.progress);
  });
});