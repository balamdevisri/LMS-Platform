import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from process cwd or root, then load/merge backend-specific .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('kaizenq_default_jwt_secret_key_2026'),
  FRONTEND_URL: z.string().default('https://www.kaizenq.in'),
  BACKEND_URL: z.string().default('http://localhost:5000'),
  CORS_ORIGIN: z.string().default('https://www.kaizenq.in,https://kaizenq.in,http://localhost:5173'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Email Notification System Configurations (Nodemailer Direct SMTP)
  EMAIL_PROVIDER: z.enum(['nodemailer', 'resend', 'mock']).default('nodemailer'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('465'),
  SMTP_SECURE: z.string().default('true'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_EMAIL: z.string().default('kaizenqlms@gmail.com'),
  SMTP_PASSWORD: z.string().default('idmo ibzr evgx dtwe'),
  SMTP_FROM_EMAIL: z.string().default('no-reply@kaizenq.in'),
  SMTP_FROM_NAME: z.string().default('KaizenQ'),
  SMTP_FROM: z.string().default('KaizenQ <no-reply@kaizenq.in>'),
  // Google Drive Credentials
  GOOGLE_DRIVE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_DRIVE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  GOOGLE_SLIDES_TEMPLATE_ID: z.string().default('18eIWNTbsA2X7Bmcq39N3lmaNSAvWYrwemRpfMFSnWh8'),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SHEETS_SCRIPT_URL: z.string().default('https://script.google.com/macros/s/AKfycbykZnfc-ngEOADfuqclw6FZ08mh9CKuhv-niMf3awTy3lmyD309QDjl5zgwPJh713L-CQ/exec'),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().optional(),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/shaivika_live_classroom'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
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