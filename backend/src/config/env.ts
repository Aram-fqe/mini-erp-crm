import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  awsRegion?: string;
  awsBucket?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
}

const getConfig = (): Config => {
  const {
    PORT,
    NODE_ENV,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CORS_ORIGIN,
    AWS_REGION,
    AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return {
    port: PORT ? parseInt(PORT, 10) : 3001,
    nodeEnv: NODE_ENV || 'development',
    databaseUrl: DATABASE_URL,
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: JWT_EXPIRES_IN || '24h',
    corsOrigin: CORS_ORIGIN || '*',
    awsRegion: AWS_REGION,
    awsBucket: AWS_S3_BUCKET,
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: AWS_SECRET_ACCESS_KEY,
  };
};

export const env = getConfig();
