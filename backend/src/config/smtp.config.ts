import nodemailer from 'nodemailer';
import { env } from './env';

export type SmtpHealthState = 'SMTP_READY' | 'SMTP_UNAVAILABLE' | 'SMTP_RETRYING' | 'SMTP_RATE_LIMITED';

let sharedTransporter: nodemailer.Transporter | null = null;
let smtpState: SmtpHealthState = 'SMTP_UNAVAILABLE';
let verificationAttempts = 0;
const MAX_VERIFICATION_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000];
const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes pause on Gmail 454

let rateLimitUntil = 0;
let isVerifying = false;
let activeVerificationPromise: Promise<boolean> | null = null;
let lastVerificationError: string | null = null;
let lastVerifiedAt: string | null = null;

export const getSmtpCredentials = () => {
  const host = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com';
  const rawPort = process.env.SMTP_PORT || env.SMTP_PORT || '465';
  const port = parseInt(rawPort, 10);
  const isSecure = (process.env.SMTP_SECURE || env.SMTP_SECURE) === 'true' || port === 465;
  const user = (process.env.SMTP_USER || env.SMTP_USER || process.env.SMTP_EMAIL || env.SMTP_EMAIL || 'kaizenqlms@gmail.com').trim();
  const rawPass = process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || process.env.SMTP_PASS || env.SMTP_PASS || 'idmo ibzr evgx dtwe';
  const pass = rawPass.trim().replace(/\s+/g, '');
  const fromEmail = process.env.SMTP_FROM_EMAIL || env.SMTP_FROM_EMAIL || 'no-reply@kaizenq.in';
  const fromName = process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || 'KaizenQ';
  const from = process.env.SMTP_FROM || env.SMTP_FROM || `${fromName} <${fromEmail}>`;

  return { host, port, isSecure, user, pass, fromEmail, fromName, from };
};

/**
 * Returns the singleton Nodemailer Transporter instance.
 * Guarantees that only ONE instance exists per backend process.
 */
export const getSharedSmtpTransporter = (): nodemailer.Transporter => {
  if (sharedTransporter) {
    return sharedTransporter;
  }

  const { host, port, isSecure, user, pass } = getSmtpCredentials();

  console.log('[SMTP] Initializing SMTP provider...');

  sharedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  console.log('[SMTP] Transporter created.');
  return sharedTransporter;
};

/**
 * Controlled verification with exponential backoff & Gmail rate-limit safety
 */
export const verifySmtpWithBackoff = async (isManual = false): Promise<boolean> => {
  const now = Date.now();

  // If currently rate limited by Gmail (454 Too many login attempts), respect cooldown
  if (smtpState === 'SMTP_RATE_LIMITED' && now < rateLimitUntil && !isManual) {
    const remainingSeconds = Math.ceil((rateLimitUntil - now) / 1000);
    console.warn(`[SMTP] Rate-limit cooldown active (${remainingSeconds}s remaining). Verification paused.`);
    return false;
  }

  // Prevent concurrent verification handshakes
  if (isVerifying && activeVerificationPromise) {
    return activeVerificationPromise;
  }

  isVerifying = true;
  activeVerificationPromise = (async () => {
    try {
      const transporter = getSharedSmtpTransporter();
      console.log('[SMTP] Verification started...');

      await transporter.verify();

      smtpState = 'SMTP_READY';
      verificationAttempts = 0;
      lastVerificationError = null;
      lastVerifiedAt = new Date().toISOString();
      console.log('[SMTP] SMTP READY');
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      lastVerificationError = errorMsg;

      const isRateLimit =
        errorMsg.includes('454') ||
        errorMsg.includes('Too many login attempts') ||
        err?.responseCode === 454;

      if (isRateLimit) {
        smtpState = 'SMTP_RATE_LIMITED';
        rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
        console.warn('[SMTP] Gmail temporarily rate-limited authentication.');
        console.warn('[SMTP] Automatic retries paused.');
        console.warn('[SMTP] Email sending will resume after SMTP becomes available.');
      } else {
        if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
          verificationAttempts++;
          smtpState = 'SMTP_RETRYING';
          const delayMs = RETRY_DELAYS_MS[verificationAttempts - 1] || 60000;
          console.warn(`[SMTP] SMTP temporarily unavailable. Retry scheduled in ${delayMs / 1000} seconds.`);

          setTimeout(() => {
            verifySmtpWithBackoff(false).catch(() => {});
          }, delayMs);
        } else {
          smtpState = 'SMTP_UNAVAILABLE';
          console.error('[SMTP] Maximum verification attempts reached. SMTP marked as temporarily unavailable.');
        }
      }
      return false;
    } finally {
      isVerifying = false;
      activeVerificationPromise = null;
    }
  })();

  return activeVerificationPromise;
};

/**
 * Handle runtime send errors (e.g. 454 rate-limit during sendMail)
 */
export const handleSmtpSendError = (err: any) => {
  const errorMsg = err?.message || String(err);
  if (errorMsg.includes('454') || errorMsg.includes('Too many login attempts') || err?.responseCode === 454) {
    smtpState = 'SMTP_RATE_LIMITED';
    rateLimitUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    console.warn('[SMTP] Gmail temporarily rate-limited authentication during send.');
    console.warn('[SMTP] Automatic retries paused.');
    console.warn('[SMTP] Email sending will resume after SMTP becomes available.');
  }
};

/**
 * Returns current SMTP health state and sanitized status
 */
export const getSmtpStatus = () => {
  const creds = getSmtpCredentials();
  return {
    state: smtpState,
    isReady: smtpState === 'SMTP_READY',
    isRateLimited: smtpState === 'SMTP_RATE_LIMITED',
    host: creds.host,
    port: creds.port,
    secure: creds.isSecure,
    user: creds.user,
    from: creds.from,
    fromEmail: creds.fromEmail,
    fromName: creds.fromName,
    verificationAttempts,
    rateLimitCooldownRemainingSeconds: Math.max(0, Math.ceil((rateLimitUntil - Date.now()) / 1000)),
    lastVerifiedAt,
    lastError: lastVerificationError,
  };
};

export const smtpConfig = {
  get from() {
    return getSmtpCredentials().from;
  },
};

export const createSmtpTransporter = getSharedSmtpTransporter;
