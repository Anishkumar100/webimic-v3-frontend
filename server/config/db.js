import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err}`));
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });
};
