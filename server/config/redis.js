import 'dotenv/config';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
});

redisConnection.on('connect', () => logger.info('Redis connected'));
redisConnection.on('error', (err) => logger.error(`Redis error: ${err.message}`));

export const connectRedis = async () => {
  // Connection is handled automatically upon instantiation
};
