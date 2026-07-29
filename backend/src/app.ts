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

app.use(helmet());
app.use(compression());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, cURL, Postman)
    if (!origin) return callback(null, true);

    if (env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }

    const allowedOrigins = [
      ...env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      ...env.FRONTEND_URL.split(',').map((o) => o.trim()),
      'http://localhost:5173',
      'http://localhost:3000',
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

// API Routes
app.use('/api', routes);

// 404 & Centralized Error Middleware
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;