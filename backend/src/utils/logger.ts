// Basic logger utility to keep dependencies minimal.
// Can be replaced with Winston/Pino later if needed.

const log = (level: string, message: string, meta?: any) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? JSON.stringify(meta) : '';
  console.log(`[${timestamp}] [${level}] ${message} ${metaString}`);
};

export const logger = {
  info: (message: string, meta?: any) => log('INFO', message, meta),
  warn: (message: string, meta?: any) => log('WARN', message, meta),
  error: (message: string, meta?: any) => log('ERROR', message, meta),
  debug: (message: string, meta?: any) => log('DEBUG', message, meta),
};
