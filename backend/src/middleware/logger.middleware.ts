import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`\n========================================`);
  console.log(`[INCOMING HTTP REQUEST] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '****';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '****';
    console.log(`[REQUEST BODY]`, JSON.stringify(sanitizedBody, null, 2));
  }
  console.log(`========================================\n`);

  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  next();
};