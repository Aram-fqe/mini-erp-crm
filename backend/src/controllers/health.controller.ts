import { Request, Response } from 'express';
import { env } from '../config/env';
import prisma from '../db/prisma';

export const checkHealth = async (req: Request, res: Response) => {
  let dbConnected = false;
  
  try {
    // Attempt a lightweight query to check DB connection
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error) {
    dbConnected = false;
  }

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? 'API is running and connected to the database' : 'API is running but database is unreachable',
    databaseConnected: dbConnected,
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
};
