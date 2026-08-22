import nodemailer from 'nodemailer';
import { env } from './env';

export type SmtpHealthState = 'SMTP_READY' | 'SMTP_UNAVAILABLE' | 'SMTP_RETRYING';

let sharedTransporter: nodemailer.Transporter | null = null;
let smtpState: SmtpHealthState = 'SMTP_UNAVAILABLE';
let verificationAttempts = 0;
const MAX_VERIFICATION_ATTEMPTS = 4;
const RETRY_DELAYS_MS = [5000, 15000, 30000, 60000];

let isVerifying = false;
let activeVerificationPromise: Promise<boolean> | null = null;
let lastVerificationError: string | null = null;
let lastVerifiedAt: string | null = null;

export const getSmtpCredentials = () => {
  const host = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp-relay.brevo.com';
  const rawPort = process.env.SMTP_PORT || env.SMTP_PORT || '587';
  const port = parseInt(rawPort, 10) || 587;
  const isSecure = (process.env.SMTP_SECURE || env.SMTP_SECURE) === 'true' || port === 465;
  const user = (process.env.SMTP_USER || env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASSWORD || env.SMTP_PASSWORD || process.env.SMTP_PASS || env.SMTP_PASS || '';
  const pass = rawPass.trim();
  const fromEmail = process.env.SMTP_FROM_EMAIL || env.SMTP_FROM_EMAIL || 'no-reply@kaizenq.in';
  const fromName = process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || 'KaizenQ';
  const from = process.env.SMTP_FROM || env.SMTP_FROM || `${fromName} <${fromEmail}>`;

  return { host, port, isSecure, user, pass, fromEmail, fromName, from };
};

/**
 * Returns the singleton Brevo Nodemailer Transporter instance.
 * Guarantees that only ONE instance exists per backend process.
 */
export const getSharedSmtpTransporter = (): nodemailer.Transporter => {
  if (sharedTransporter) {
    return sharedTransporter;
  }

  const { host, port, isSecure, user, pass } = getSmtpCredentials();

  console.log('[SMTP] Initializing Brevo SMTP provider...');

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
 * Safely redacts credentials from any string or value
 */
const sanitizeSmtpOutput = (val: any): string => {
  if (val === undefined || val === null) return 'undefined';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  const { pass } = getSmtpCredentials();
  if (pass) {
    str = str.split(pass).join('[REDACTED_PASSWORD]');
  }
  // Redact any patterns resembling Brevo or API keys
  str = str.replace(/xsmtpsib-[a-zA-Z0-9_-]+/gi, '[REDACTED_KEY]');
  str = str.replace(/(AUTH\s+PLAIN\s+)[a-zA-Z0-9+/=]+/gi, '$1[REDACTED_AUTH]');
  return str;
};

/**
 * Controlled SMTP verification (Single shot without repeated aggressive polling)
 */
export const verifySmtpWithBackoff = async (_isManual = false): Promise<boolean> => {
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
      verificationAttempts++;
      smtpState = 'SMTP_UNAVAILABLE';

      const code = sanitizeSmtpOutput(err?.code);
      const responseCode = sanitizeSmtpOutput(err?.responseCode);
      const command = sanitizeSmtpOutput(err?.command);
      const response = sanitizeSmtpOutput(err?.response);
      const message = sanitizeSmtpOutput(err?.message || String(err));

      console.error(
        `[SMTP] Verification failed\ncode=${code}\nresponseCode=${responseCode}\ncommand=${command}\nresponse=${response}\nmessage=${message}`
      );

      lastVerificationError = `code=${code}, responseCode=${responseCode}, command=${command}, response=${response}, message=${message}`;

      // Automatic retries are temporarily disabled after the first failed verification
      return false;
    } finally {
      isVerifying = false;
      activeVerificationPromise = null;
    }
  })();

  return activeVerificationPromise;
};

/**
 * Handle runtime send errors
 */
export const handleSmtpSendError = (err: any) => {
  const errorMsg = err?.message || String(err);
  console.warn('[SMTP] Email delivery notice:', errorMsg);
};

/**
 * Returns current SMTP health state and sanitized status
 */
export const getSmtpStatus = () => {
  const creds = getSmtpCredentials();
  return {
    state: smtpState,
    isReady: smtpState === 'SMTP_READY',
    isRetrying: smtpState === 'SMTP_RETRYING',
    host: creds.host,
    port: creds.port,
    secure: creds.isSecure,
    user: creds.user,
    from: creds.from,
    fromEmail: creds.fromEmail,
    fromName: creds.fromName,
    verificationAttempts,
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
