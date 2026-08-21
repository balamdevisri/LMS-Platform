import nodemailer from 'nodemailer';
import { env } from './env';

const rawPort = process.env.SMTP_PORT || env.SMTP_PORT || '465';
const port = parseInt(rawPort, 10);
const isSecure = (process.env.SMTP_SECURE || env.SMTP_SECURE) === 'true' || port === 465;
const rawUser = process.env.SMTP_USER || env.SMTP_USER || process.env.SMTP_EMAIL || env.SMTP_EMAIL || 'kaizenqlms@gmail.com';
const rawPass = process.env.SMTP_PASS || env.SMTP_PASS || process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || 'idmo ibzr evgx dtwe';

export const smtpConfig = {
  host: process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com',
  port,
  secure: isSecure, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: rawUser.trim(),
    pass: rawPass.trim().replace(/\s+/g, ''),
  },
  from: process.env.SMTP_FROM || env.SMTP_FROM || 'KaizenQ AI LMS <kaizenqlms@gmail.com>',
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
};

/**
 * Creates and returns the Nodemailer Transporter instance configured for Gmail SMTP.
 */
export const createSmtpTransporter = (): nodemailer.Transporter => {
  return nodemailer.createTransport(smtpConfig);
};

