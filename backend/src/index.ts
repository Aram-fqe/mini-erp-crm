import app from './app';
import { env } from './config/env';
import prisma from './db/prisma';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Validate Database Connection (Fail fast)
    logger.info('Connecting to the database...');
    await prisma.$connect();
    logger.info('Database connected successfully.');

    // 2. Start Express Server
    const PORT = env.port;
    app.listen(PORT, () => {
      logger.info(`[server] Running on http://localhost:${PORT}`);
      logger.info(`[server] Environment: ${env.nodeEnv}`);
    });

  } catch (error) {
    logger.error('Failed to start the application due to a database connection error:', error);
    // Ensure Prisma disconnects and process exits with error code
    await prisma.$disconnect();
    process.exit(1); 
  }
};

startServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed due to app termination');
  process.exit(0);
});
