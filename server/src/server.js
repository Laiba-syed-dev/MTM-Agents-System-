import app from './app.js';
import { config } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

async function startServer() {
  await connectDatabase();

  app.listen(config.port, () => {
    logger.success(`MTM Agent System API Server running on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/api/health`);
    logger.info(`Frontend URL: ${config.clientUrl}`);
  });
}

startServer();
