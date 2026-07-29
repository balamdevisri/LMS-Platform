import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `Route '${req.originalUrl}' not found on KaizenQ Backend.`));
};

export const errorMiddleware = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details: any = undefined;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
  }
  // Handle Firebase Errors
  else if (err?.code?.startsWith('auth/') || err?.code?.startsWith('firestore/')) {
    statusCode = err.code.includes('not-found') ? 404 : 400;
    message = `Firebase Service Error: ${err.message}`;
  }
  // Handle Resend & Gemini API Errors
  else if (err?.name === 'ResendError' || (typeof err?.message === 'string' && err.message.includes('Gemini'))) {
    statusCode = 502;
    message = `Third-Party AI/Email Service Error: ${err.message}`;
  }
  // Handle Custom ApiError
  else if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error(`[${req.method}] ${req.originalUrl} - Status: ${statusCode} - Error: ${message} - IP: ${req.ip}`);

  res.status(statusCode).json({
    success: false,
    service: 'KaizenQ Backend',
    statusCode,
    message,
    ...(details && { details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};