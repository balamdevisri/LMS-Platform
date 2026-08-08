import { z } from 'zod';

export const GITHUB_URL_REGEX = /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/;

export const studentRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full Name must be at least 2 characters')
    .max(100, 'Full Name cannot exceed 100 characters'),
  email: z
    .string()
    .email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z
    .string()
    .min(8, 'Confirm Password must be at least 8 characters long'),
  githubUrl: z
    .string()
    .min(1, 'GitHub Profile URL is required')
    .regex(GITHUB_URL_REGEX, 'Invalid GitHub Profile URL. Must be in the format: https://github.com/username'),
  linkedin: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/(?:www\.)?linkedin\.com\/.*$/i.test(val), {
      message: 'Invalid LinkedIn URL format',
    }),
  portfolio: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.*$/i.test(val), {
      message: 'Invalid Portfolio URL format',
    }),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

export const studentApproveSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
});

export const studentRejectSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters long'),
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type StudentApproveInput = z.infer<typeof studentApproveSchema>;
export type StudentRejectInput = z.infer<typeof studentRejectSchema>;
