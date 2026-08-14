import mongoose, { Schema, Document } from 'mongoose';

// 1. Payment Interface & Schema
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentProvider = 'razorpay' | 'stripe' | 'shaivika_pay' | 'free_grant';

export interface IPayment extends Document {
  id: string;
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
  paidAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: String, required: true, index: true },
    studentEmail: { type: String },
    studentName: { type: String },
    courseId: { type: String, required: true, index: true },
    courseTitle: { type: String },
    orderId: { type: String, required: true, unique: true, index: true },
    transactionId: { type: String, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    provider: { type: String, default: 'shaivika_pay' },
    signature: { type: String },
    paidAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// 2. Enrollment Interface & Schema
export type EnrollmentStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'COMPLETED';
export type AccessType = 'PAID' | 'FREE';

export interface IEnrollment extends Document {
  id: string;
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  paymentId?: string;
  status: EnrollmentStatus;
  accessType: AccessType;
  enrolledAt: Date;
  progressPercentage: number;
  completedLessons: string[];
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: String, required: true, index: true },
    studentEmail: { type: String },
    studentName: { type: String },
    courseId: { type: String, required: true, index: true },
    courseTitle: { type: String },
    paymentId: { type: String, index: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'CANCELLED', 'COMPLETED'],
      default: 'ACTIVE',
      index: true,
    },
    accessType: {
      type: String,
      enum: ['PAID', 'FREE'],
      default: 'PAID',
    },
    enrolledAt: { type: Date, default: Date.now },
    progressPercentage: { type: Number, default: 0 },
    completedLessons: [{ type: String }],
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of student + course enrollment
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
