export type UserRole = 'admin' | 'instructor' | 'student';
export type UserStatus = 'Active' | 'Blocked' | 'Pending' | 'Suspended' | 'Inactive' | 'pending' | 'approved' | 'rejected' | 'email_verification_pending';
export type UserProvider = 'password' | 'github.com' | string;

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

export interface LinuxLabProgress {
  completedModules: number;
  totalModules: number;
  terminalCommandsRun: number;
  score: number;
  lastAccess: string;
  activeLabTitle: string;
}

export interface UserActivityItem {
  id: string;
  action: string;
  timestamp: string;
  type: 'course' | 'quiz' | 'lab' | 'assignment' | 'login' | 'certificate';
}

export interface UserProfile {
  uid: string;
  fullName: string;
  name?: string;
  email: string;
  photoURL?: string | null;
  profilePhoto?: string | null;
  role: UserRole;
  provider: UserProvider;
  providerId?: string;
  status: UserStatus;
  branch?: string;
  year?: string;
  college?: string;
  skills?: string[];
  languages?: string[];
  frameworks?: string[];
  repoScore?: number;
  activityScore?: number;
  overallAIScore?: number;
  githubUsername?: string;
  githubUrl?: string;
  github?: any;
  linkedin?: string;
  portfolio?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  joinedAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  isActive?: boolean;
  enrolledCoursesCount?: number;
  completedCoursesCount?: number;
  courseCount?: number;
  completedCourses?: number;
  currentCourse?: string;
  learningScore?: number;
  quizScores?: UserQuizScore[];
  assignmentScores?: UserAssignmentScore[];
  certificates?: UserCertificate[];
  linuxLabProgress?: LinuxLabProgress;
  recentActivity?: UserActivityItem[];
  learningProgressPercent?: number;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  xp?: number;
  badgesCount?: number;
  badges?: any[];
}

export interface ExtendedStudentStats {
  totalStudents: number;
  activeStudents: number;
  verifiedStudents: number;
  enrolledStudents: number;
  completedCourses: number;
  avgProgress: number;
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
