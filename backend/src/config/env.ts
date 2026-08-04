import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from process cwd or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('kaizenq_default_jwt_secret_key_2026'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Email Notification System Configurations (Nodemailer + Gmail SMTP)
  EMAIL_PROVIDER: z.enum(['nodemailer', 'resend', 'mock']).default('nodemailer'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_EMAIL: z.string().default('kaizenqlms@gmail.com'),
  SMTP_PASSWORD: z.string().default('nslv bymb dnnq swcw'),
  SMTP_FROM: z.string().default('KaizenQ AI LMS <kaizenq.lms@gmail.com>'),
  // Google Drive Credentials
  GOOGLE_DRIVE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_DRIVE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SHEETS_SCRIPT_URL: z.string().default('https://script.google.com/macros/s/AKfycbyVymRV2dGQU2TEpGTtU4g8JCttmrEze15Qi0kjFoqQxV2lFWFrnZkqhC1Uw7bQid2U8A/exec'),
});

export const env = envSchema.parse(process.env);

/**
 * Mask sensitive string for logging
 */
export const maskSensitiveString = (str?: string): string => {
  if (!str) return '[NOT_SET]';
  if (str.length <= 8) return '****';
  const parts = str.trim().split(/\s+/);
  if (parts.length === 4) {
    return `${parts[0]} **** **** ${parts[3]}`;
  }
  return `${str.substring(0, 3)}****${str.substring(str.length - 3)}`;
};