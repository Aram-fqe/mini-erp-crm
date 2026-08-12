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
    const server = app.listen(PORT, () => {
      logger.info(`[server] Running on http://localhost:${PORT}`);
      logger.info(`[server] Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database connection closed. Server terminated.');
        process.exit(0);
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    logger.error('Failed to start the application due to a database connection error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();
