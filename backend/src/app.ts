import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { developerGateMiddleware } from './middleware/developerGate.middleware';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { verifyFirebaseToken, requireRole } from './middleware/auth.middleware';
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

const isProduction = env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production';

const defaultProductionOrigins = ['https://www.kaizenq.in', 'https://kaizenq.in'];
const defaultDevOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://127.0.0.1:5173'];

const configuredOrigins = [
  ...env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  ...env.FRONTEND_URL.split(',').map((o) => o.trim()),
].filter((o) => Boolean(o) && (isProduction ? !defaultDevOrigins.includes(o) : true));

const allowedOrigins = Array.from(
  new Set([
    ...defaultProductionOrigins,
    ...configuredOrigins,
    ...(!isProduction ? defaultDevOrigins : []),
  ])
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, cURL, Postman)
    if (!origin) return callback(null, true);

    const isKaizenQDomain = /^https?:\/\/(www\.)?kaizenq\.in(:\d+)?$/.test(origin);
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercelDomain = /^https:\/\/.*\.vercel\.app$/.test(origin);

    if (isKaizenQDomain || isLocalhost || isVercelDomain || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!isProduction && (defaultDevOrigins.includes(origin) || env.CORS_ORIGIN === '*')) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin rejected by policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-developer-token',
    'x-user-id',
    'x-user-role',
    'x-user-email',
    'x-user-name',
  ],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);
app.use(requestLogger);
app.use(developerGateMiddleware);

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

// 3. Protected GET /api/test-email Endpoint (Admin Authenticated Only)
app.get('/api/test-email', verifyFirebaseToken as any, requireRole('admin') as any, async (req, res) => {
  const { emailService } = await import('./services/email/EmailService');
  const targetEmail = (req.query.email as string) || (req as any).user?.email || env.SMTP_EMAIL || 'support@kaizenq.in';
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