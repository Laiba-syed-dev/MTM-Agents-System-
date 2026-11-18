import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase() {
  if (isConnected) return true;

  if (!config.mongoUri) {
    logger.warn('No MONGODB_URI provided in environment. Utilizing resilient in-memory session store.');
    return false;
  }

  try {
    logger.info(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.success('Connected to MongoDB Atlas successfully.');
    return true;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}. Defaulting to in-memory store.`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
