export type StudentStatus = 'email_verification_pending' | 'pending' | 'approved' | 'rejected' | 'active';

export interface StudentFirestoreDocument {
  uid: string;
  fullName: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  emailVerified: boolean;
  status: StudentStatus;
  role: 'student';
  createdAt: string;
  updatedAt: string;
  lastLogin: null | string;
}

export interface StudentSignupPayload {
  fullName: string;
  email: string;
  password: string;
  githubUrl: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}
