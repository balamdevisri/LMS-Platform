import nodemailer from 'nodemailer';
import { env } from './env';

export const smtpConfig = {
  host: process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || env.SMTP_PORT || '587', 10),
  secure: (process.env.SMTP_SECURE || env.SMTP_SECURE) === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || env.SMTP_USER || process.env.SMTP_EMAIL || env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS || env.SMTP_PASS || process.env.SMTP_PASSWORD || env.SMTP_PASSWORD,
  },
  from: process.env.SMTP_FROM || env.SMTP_FROM || 'KaizenQ AI LMS <kaizenq.lms@gmail.com>',
};

/**
 * Creates and returns the Nodemailer Transporter instance configured for Gmail SMTP.
 */
export const createSmtpTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport(smtpConfig);
};
