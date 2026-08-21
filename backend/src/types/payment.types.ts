/**
 * Payment & Enrollment Domain Types (Firestore Native)
 */

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentProvider = 'razorpay' | 'stripe' | 'shaivika_pay' | 'free_grant';

export interface IPayment {
  id?: string;
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  orderId: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  signature?: string;
  paidAt?: Date | string;
  metadata?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type EnrollmentStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
export type AccessType = 'PAID' | 'FREE';

export interface IEnrollment {
  id?: string;
  _id?: string;
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  paymentId?: string;
  status: EnrollmentStatus;
  accessType: AccessType;
  enrolledAt: Date | string;
  progressPercentage?: number;
  completedLessons?: string[];
  lastAccessedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
