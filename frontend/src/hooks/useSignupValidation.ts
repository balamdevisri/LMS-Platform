import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StudentSignupFormData } from '@/types/auth';

export const GITHUB_URL_REGEX = /^https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/;

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full Name is required')
      .min(2, 'Full Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'College Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    githubUrl: z
      .string()
      .min(1, 'GitHub Profile URL is required')
      .regex(
        GITHUB_URL_REGEX,
        'Invalid GitHub Profile URL. Must be in the format: https://github.com/username'
      ),
    linkedinUrl: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^https?:\/\/(?:www\.)?linkedin\.com\/.*$/i.test(val),
        { message: 'Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username)' }
      ),
    portfolioUrl: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^https?:\/\/.*$/i.test(val),
        { message: 'Please enter a valid URL starting with http:// or https://' }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const useSignupValidation = () => {
  return useForm<StudentSignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
    },
  });
};
