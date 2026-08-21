/**
 * SHAIVIKA LMS AI Platform - Email System Types & Interfaces
 * KaizenQ - Powered by SHAIVIKA GROUPS
 */

export enum EmailEventType {
  STUDENT_REGISTRATION = 'STUDENT_REGISTRATION',
  REGISTRATION_PENDING = 'REGISTRATION_PENDING',
  REGISTRATION_APPROVED = 'REGISTRATION_APPROVED',
  REGISTRATION_REJECTED = 'REGISTRATION_REJECTED',
  INSTRUCTOR_REGISTRATION_PENDING = 'INSTRUCTOR_REGISTRATION_PENDING',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  COURSE_ENROLLMENT = 'COURSE_ENROLLMENT',
  COURSE_COMPLETION = 'COURSE_COMPLETION',
  QUIZ_RESULT = 'QUIZ_RESULT',
  ASSIGNMENT_SUBMISSION = 'ASSIGNMENT_SUBMISSION',
  CERTIFICATE_GENERATED = 'CERTIFICATE_GENERATED',
  INSTRUCTOR_APPROVAL = 'INSTRUCTOR_APPROVAL',
  ADMIN_NOTIFICATION = 'ADMIN_NOTIFICATION',
  LECTURER_PENDING = 'LECTURER_PENDING',
  LECTURER_APPROVED = 'LECTURER_APPROVED',
  COURSE_PUBLISHED = 'COURSE_PUBLISHED',
  ASSIGNMENT_REMINDER = 'ASSIGNMENT_REMINDER',
  QUIZ_REMINDER = 'QUIZ_REMINDER',
}

export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface StudentRegistrationPayload {
  studentName: string;
  email: string;
  verificationLink?: string;
  dashboardUrl?: string;
}

export interface RegistrationPendingPayload {
  studentName: string;
  email: string;
  githubUrl?: string;
  status?: string;
  verificationLink?: string;
}

export interface InstructorRegistrationPendingPayload {
  instructorName: string;
  email: string;
  department?: string;
  qualification?: string;
  experience?: string;
}

export interface RegistrationApprovedPayload {
  studentName: string;
  email: string;
  dashboardUrl?: string;
}

export interface RegistrationRejectedPayload {
  studentName: string;
  email: string;
  reason: string;
}

export interface EmailVerificationPayload {
  userName: string;
  email: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}

export interface PasswordResetPayload {
  userName: string;
  email: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface CourseEnrollmentPayload {
  studentName: string;
  email: string;
  courseTitle: string;
  courseId?: string;
  instructorName?: string;
  courseDuration?: string;
  certificateAvailable?: boolean;
  enrollmentId?: string;
  courseUrl?: string;
}

export interface CourseCompletionPayload {
  studentName: string;
  email: string;
  courseTitle: string;
  completionDate?: string;
  certificateUrl?: string;
}

export interface QuizResultPayload {
  studentName: string;
  email: string;
  quizTitle: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  quizUrl?: string;
}

export interface AssignmentSubmissionPayload {
  studentName: string;
  email: string;
  assignmentTitle: string;
  courseTitle: string;
  submissionDate: string;
  submissionId?: string;
}

export interface CertificateGeneratedPayload {
  studentName: string;
  email: string;
  courseTitle: string;
  certificateId: string;
  issueDate: string;
  certificateUrl: string;
}

export interface InstructorApprovalPayload {
  instructorName: string;
  email: string;
  status: 'approved' | 'rejected' | 'pending_docs';
  portalUrl?: string;
  comments?: string;
}

export interface AdminNotificationPayload {
  adminName?: string;
  email: string;
  alertType: 'system_error' | 'new_user_spike' | 'payment_issue' | 'security_alert' | 'general';
  title: string;
  message: string;
  details?: Record<string, any>;
  actionUrl?: string;
}

export interface LecturerPendingPayload {
  lecturerName: string;
  email: string;
}

export interface LecturerApprovedPayload {
  lecturerName: string;
  email: string;
  dashboardUrl?: string;
}

export interface CoursePublishedPayload {
  studentName: string;
  email: string;
  courseTitle: string;
  courseUrl?: string;
}

export interface AssignmentReminderPayload {
  studentName: string;
  email: string;
  assignmentTitle: string;
  courseTitle: string;
  dueDate: string;
  submissionUrl?: string;
}

export interface QuizReminderPayload {
  studentName: string;
  email: string;
  quizTitle: string;
  courseTitle: string;
  dueDate?: string;
  quizUrl?: string;
}

export type EventPayloadMap = {
  [EmailEventType.STUDENT_REGISTRATION]: StudentRegistrationPayload;
  [EmailEventType.REGISTRATION_PENDING]: RegistrationPendingPayload;
  [EmailEventType.REGISTRATION_APPROVED]: RegistrationApprovedPayload;
  [EmailEventType.REGISTRATION_REJECTED]: RegistrationRejectedPayload;
  [EmailEventType.INSTRUCTOR_REGISTRATION_PENDING]: InstructorRegistrationPendingPayload;
  [EmailEventType.EMAIL_VERIFICATION]: EmailVerificationPayload;
  [EmailEventType.PASSWORD_RESET]: PasswordResetPayload;
  [EmailEventType.COURSE_ENROLLMENT]: CourseEnrollmentPayload;
  [EmailEventType.COURSE_COMPLETION]: CourseCompletionPayload;
  [EmailEventType.QUIZ_RESULT]: QuizResultPayload;
  [EmailEventType.ASSIGNMENT_SUBMISSION]: AssignmentSubmissionPayload;
  [EmailEventType.CERTIFICATE_GENERATED]: CertificateGeneratedPayload;
  [EmailEventType.INSTRUCTOR_APPROVAL]: InstructorApprovalPayload;
  [EmailEventType.ADMIN_NOTIFICATION]: AdminNotificationPayload;
  [EmailEventType.LECTURER_PENDING]: LecturerPendingPayload;
  [EmailEventType.LECTURER_APPROVED]: LecturerApprovedPayload;
  [EmailEventType.COURSE_PUBLISHED]: CoursePublishedPayload;
  [EmailEventType.ASSIGNMENT_REMINDER]: AssignmentReminderPayload;
  [EmailEventType.QUIZ_REMINDER]: QuizReminderPayload;
};

export interface EmailLogRecord {
  id?: string;
  eventType: EmailEventType;
  recipientEmail: string;
  subject: string;
  status: EmailStatus;
  attempts: number;
  maxRetries: number;
  provider: 'nodemailer' | 'resend' | 'mock';
  messageId?: string;
  error?: string;
  payload: any;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string;
}
