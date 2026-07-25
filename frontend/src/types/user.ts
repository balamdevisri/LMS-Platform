export type UserRole = 'admin' | 'instructor' | 'student';
export type UserStatus = 'Active' | 'Blocked' | 'Pending';
export type UserProvider = 'password' | 'github.com';

export interface UserQuizScore {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface UserAssignmentScore {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface UserCertificate {
  id: string;
  title: string;
  issuedAt: string;
  credentialUrl?: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  name?: string;
  email: string;
  photoURL?: string | null;
  role: UserRole;
  provider: UserProvider;
  providerId?: string;
  status: UserStatus;
  branch?: string;
  year?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  isVerified: boolean;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  quizScores?: UserQuizScore[];
  assignmentScores?: UserAssignmentScore[];
  certificates?: UserCertificate[];
  learningProgressPercent?: number;
  githubUsername?: string;
}

export interface UserStatistics {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  activeUsers: number;
  verifiedUsers: number;
  newToday: number;
  newThisWeek: number;
}
