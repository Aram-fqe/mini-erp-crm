import express from 'express';
import cors from 'cors';
import path from 'path';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import challanRoutes from './routes/challan.routes';
import { logger } from './utils/logger';
import { env } from './config/env';

const app = express();

// CORS Configuration
const corsOptions: cors.CorsOptions = {
  origin: env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic request logging middleware (skip in production for performance)
if (env.nodeEnv !== 'production') {
  app.use((req, _res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);

// In production, serve the built React frontend as static files
if (env.nodeEnv === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  // SPA catch-all: for any non-API route, serve index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Catch-all 404 handler (for API routes only in production)
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
