import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import routes from './routes';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https:', 'wss:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:3000"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
  })
);
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, cURL, Postman)
    if (!origin) return callback(null, true);

    if (env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    const isKaizenQDomain = /^https?:\/\/(www\.)?kaizenq\.in(:\d+)?$/.test(origin);
    if (isKaizenQDomain) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'https://www.kaizenq.in',
      'https://kaizenq.in',
      ...env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      ...env.FRONTEND_URL.split(',').map((o) => o.trim()),
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    if (env.NODE_ENV === 'development' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);
app.use(requestLogger);

// 1. Root Connection Endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'KaizenQ Backend',
    status: 'running',
  });
});

// 2. Health Check Endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 3. Direct GET /api/debug/send-email Endpoint (Brevo HTTP API Transactional Email)
app.get('/api/debug/send-email', async (req, res) => {
  const { emailService } = await import('./services/email/EmailService');
  const targetEmail = (req.query.email as string) || env.SMTP_EMAIL || 'support@kaizenq.in';
  const subject = 'Brevo HTTP API Test - KaizenQ AI LMS';
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f0f6ff; padding: 30px; color: #0f172a;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #bae6fd;">
    <h1 style="color: #0284c7; margin-top: 0;">KaizenQ AI LMS</h1>
    <p style="font-size: 15px; color: #334155;">Brevo HTTP API connection successful on kaizenq.in.</p>
    <p style="font-size: 13px; color: #64748b; margin-top: 30px;">KaizenQ Team &bull; no-reply@kaizenq.in</p>
  </div>
</body>
</html>`;

  const result = await emailService.sendDirectHtmlEmail(targetEmail, subject, html);

  return res.status(result.success ? 200 : 500).json({
    success: result.success,
    accepted: result.accepted || (result.success ? [targetEmail] : []),
    rejected: result.rejected || [],
    response: result.response || (result.success ? '200 OK' : 'Failed'),
    messageId: result.messageId || null,
    error: result.error || null,
  });
});

// 4. Direct GET /api/test-email Endpoint
app.get('/api/test-email', async (req, res) => {
  const { emailService } = await import('./services/email/EmailService');
  const targetEmail = (req.query.email as string) || env.SMTP_EMAIL || 'support@kaizenq.in';
  const subject = 'Brevo Transactional Email Test Successful - KaizenQ AI LMS';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KaizenQ AI LMS</title>
</head>
<body style="margin: 0; padding: 40px; background-color: #f0f6ff; font-family: Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div style="max-width: 540px; background-color: #ffffff; border-radius: 16px; border: 1px solid #bae6fd; padding: 36px; box-shadow: 0 10px 25px rgba(2, 132, 199, 0.08); text-align: left;">
          <div style="background: linear-gradient(135deg, #0284c7, #2563eb); padding: 18px 24px; border-radius: 12px; color: #ffffff; font-size: 20px; font-weight: 800; margin-bottom: 24px;">
            KaizenQ AI LMS
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0;">
            Brevo HTTP API Connection Successful
          </h2>
          <p style="font-size: 15px; color: #334155; line-height: 1.6;">
            This is a test email from KaizenQ AI LMS confirming that Brevo Transactional HTTPS API is configured properly on kaizenq.in.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #475569;">
            <strong>Recipient:</strong> ${targetEmail}<br>
            <strong>Status:</strong> Verified & Operational (Brevo HTTP API)
          </div>
          <div style="border-top: 1px solid #e0f2fe; padding-top: 20px; margin-top: 28px; font-size: 13px; color: #64748b;">
            <p style="margin: 0; font-weight: 800; color: #0f172a;">KaizenQ Team &bull; no-reply@kaizenq.in</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const result = await emailService.sendDirectHtmlEmail(targetEmail, subject, html);

  if (result.success) {
    return res.status(200).json({
      success: true,
      message: 'Brevo Test Email delivered successfully!',
      recipientEmail: targetEmail,
      messageId: result.messageId,
      accepted: result.accepted || [targetEmail],
      rejected: result.rejected || [],
      response: result.response || '200 OK',
      status: emailService.getTransporterStatus(),
    });
  } else {
    return res.status(500).json({
      success: false,
      error: 'Brevo Email Delivery Failed',
      message: result.error,
      accepted: result.accepted || [],
      rejected: result.rejected || [],
      response: result.response || null,
      diagnostic: 'Ensure BREVO_API_KEY is configured in Render Environment Variables.',
      status: emailService.getTransporterStatus(),
    });
  }
});

// API Routes (mounted on both /api and root for flexible serverless & reverse-proxy routing)
app.use('/api', routes);
app.use('/', routes);

// 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;