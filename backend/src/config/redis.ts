import logger from './logger';

export let isRedisConnected = false;

// Mock Redis client for graceful degradation
export const redisClient = {
  get: async (key: string): Promise<string | null> => {
    return null;
  },
  set: async (key: string, value: string, expirationSeconds?: number): Promise<void> => {
    return;
  },
  del: async (key: string): Promise<void> => {
    return;
  }
};

export const connectRedis = async (): Promise<boolean> => {
  logger.info(`[REDIS] Initializing Redis Client (using local in-memory fallback cache)...`);
  isRedisConnected = false;
  return false;
};
