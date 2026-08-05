import mongoose from 'mongoose';
import { env } from './env';
import logger from './logger';

export let isMongoConnected = false;

export const connectMongo = async (): Promise<boolean> => {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  try {
    logger.info(`[MONGO] Connecting to MongoDB at ${env.MONGODB_URI.split('@').pop()}...`);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    logger.info(`[MONGO] Connected to MongoDB successfully.`);
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    logger.warn(`[MONGO] MongoDB Connection failed: ${err.message}. Gracefully falling back to Firestore/In-Memory database for Live Classroom.`);
    return false;
  }
};
