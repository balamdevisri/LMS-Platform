export enum LiveStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Live = 'Live',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum MeetingProvider {
  JITSI = 'JITSI',
  GOOGLE_MEET = 'GOOGLE_MEET',
  ZOOM = 'ZOOM',
  TEAMS = 'TEAMS'
}

export interface LiveClass {
  classId: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  branch?: string;
  semester?: string;
  year?: string;
  section?: string;
  allowedStudents?: string[];
  meetingProvider: MeetingProvider;
  meetingRoomId: string;
  meetingUrl: string;
  banner?: string;
  thumbnail?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  duration: number;  // Minutes
  status: LiveStatus;
  isRecordingEnabled: boolean;
  isQuizEnabled: boolean;
  isPollEnabled: boolean;
  isChatEnabled: boolean;
  isAttendanceEnabled: boolean;
  resourceDownloadEnabled?: boolean;
  certificateEligible: boolean;
  maxParticipants: number;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  notesUrl?: string;
  recordingUrl?: string;
  pinnedMessage?: string;
  isChatMuted?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  attendanceId: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  joinedAt: string;
  leftAt?: string;
  durationMinutes: number;
  status: 'present' | 'late' | 'absent';
  attendancePercentage: number;
}

export interface ChatMessage {
  messageId: string;
  classId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'instructor' | 'student';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  pinned?: boolean;
}

export interface Question {
  questionId: string;
  classId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  question: string;
  status: 'pending' | 'accepted' | 'answered';
  micAllowed?: boolean;
  createdAt: string;
}

export interface LiveNote {
  noteId: string;
  classId: string;
  title: string;
  content: string;
  authorName: string;
  updatedAt: string;
}

export interface Resource {
  resourceId: string;
  classId: string;
  title: string;
  type: 'pdf' | 'ppt' | 'zip' | 'image' | 'github' | 'youtube';
  url: string;
  fileSize?: string;
  uploadedAt: string;
}

export interface PollOption {
  optionId: string;
  text: string;
  votes: number;
}

export interface Poll {
  pollId: string;
  classId: string;
  question: string;
  options: PollOption[];
  active: boolean;
  totalVotes: number;
  createdAt: string;
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Quiz {
  quizId: string;
  classId: string;
  title: string;
  questions: QuizQuestion[];
  active: boolean;
  createdAt: string;
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  classId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  answers: Record<string, string>;
  submittedAt: string;
}

export interface Recording {
  recordingId: string;
  classId: string;
  title: string;
  recordingUrl: string;
  durationMinutes: number;
  fileSizeBytes?: number;
  uploadedAt: string;
}

export interface Announcement {
  announcementId: string;
  classId: string;
  authorId: string;
  authorName: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface Analytics {
  analyticsId: string;
  classId: string;
  totalEnrolled: number;
  totalJoined: number;
  peakConcurrent: number;
  avgDurationMinutes: number;
  attendanceRate: number;
  chatMessageCount: number;
  questionCount: number;
  quizCompletionRate: number;
  generatedAt: string;
}
