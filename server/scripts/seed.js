// Seed script — creates an admin user for development/testing
// Run: node scripts/seed.js

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import { logger } from '../utils/logger.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('Connected to MongoDB for seeding');

  // Check if admin user already exists
  const existing = await User.findOne({ email: 'admin@webimic.com' });
  if (existing) {
    logger.info('Admin user already exists, skipping seed');
    await mongoose.disconnect();
    return;
  }

  // Create admin user
  const user = await User.create({
    name: 'Webimic Admin',
    email: 'admin@webimic.com',
    password: 'admin1234',
    plan: 'pro',
    monthlyJobLimit: 100,
  });

  // Generate API key
  const rawKey = ApiKey.generateKey();
  const keyHash = await bcrypt.hash(rawKey, 10);
  await ApiKey.create({
    userId: user._id,
    keyHash,
    keyPrefix: rawKey.substring(0, 14) + '...',
    label: 'Default Key',
  });

  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('Admin user seeded successfully!');
  logger.info(`  Email:    admin@webimic.com`);
  logger.info(`  Password: admin1234`);
  logger.info(`  Plan:     pro`);
  logger.info(`  API Key:  ${rawKey}`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
};

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
