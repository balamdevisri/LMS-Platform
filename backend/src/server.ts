import app from './app';
import { env } from './config/env';
import logger from './config/logger';
import './firebase';
import { CourseService } from './services/course/CourseService';

const PORT = Number(process.env.PORT) || Number(env.PORT) || 5000;

// Global Process Exception & Rejection Handlers
process.on('uncaughtException', (error) => {
  logger.error('CRITICAL: Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('CRITICAL: Unhandled Promise Rejection:', reason);
});

const server = app.listen(PORT, async () => {
  logger.info(`🚀 KaizenQ AI LMS Backend initialized in [${env.NODE_ENV}] mode.`);
  logger.info(`🌐 Listening on PORT: ${PORT}`);
  logger.info(`🔗 Health Check Endpoint: http://localhost:${PORT}/health`);

  try {
    const courseService = new CourseService();
    await courseService.seedSampleCourses();
    logger.info('✅ Database seeding check completed successfully.');
  } catch (error) {
    logger.error('⚠️ Database seeding check failed:', error);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed cleanly.');
    process.exit(0);
  });
};

// Handle Server Startup Errors (e.g. EADDRINUSE)
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ PORT ${PORT} is already in use by another process.`);
    logger.error(`👉 Solution: Run 'netstat -ano | findstr :${PORT}' and 'taskkill /PID <PID> /F' to free the port.`);
    process.exit(1);
  } else {
    logger.error('CRITICAL: Server startup error:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.once('SIGUSR2', () => {
  logger.info('Received SIGUSR2 (Nodemon restart). Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed for Nodemon restart.');
    process.kill(process.pid, 'SIGUSR2');
  });
});

export default server;