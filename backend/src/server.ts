import app from './app';
import { env } from './config/env';
import logger from './config/logger';
import './firebase';
import { CourseService } from './services/course/CourseService';

const PORT = env.PORT || 3000;

app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  try {
    const courseService = new CourseService();
    await courseService.seedSampleCourses();
    logger.info('Database seeding check completed.');
  } catch (error) {
    logger.error('Database seeding failed:', error);
  }
});