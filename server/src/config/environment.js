import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
  },
  limits: {
    maxUpdateCalls: parseInt(process.env.MAX_UPDATE_CALLS, 10) || 5,
    fullRunTimeoutMs: parseInt(process.env.FULL_RUN_TIMEOUT_MS, 10) || 120000, // 2 minutes
    updateTimeoutMs: parseInt(process.env.UPDATE_TIMEOUT_MS, 10) || 60000,    // 1 minute
  },
  defaultInputFile: process.env.DEFAULT_INPUT_FILE || 'input/messages.txt',
};
