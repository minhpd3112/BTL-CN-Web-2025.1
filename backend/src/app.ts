import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { supabase } from './config/supabase';
import { logger } from './config/logger';
import routes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';

const app: Express = express();

// ============= DATABASE CONNECTION TEST =============
(async () => {
  try {
    const { data, error } = await supabase.from('tags').select('count', { count: 'exact', head: true });
    if (error) throw error;
    logger.info('✅ Database connection successful');
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
  }
})();

// ============= MIDDLEWARES =============
// Security headers with strict CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
}));

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true })); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with 10MB limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies with 10MB limit

// Additional security middleware: Disable powered-by header
app.disable('x-powered-by');

// ============= HEALTH CHECK =============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Course Management API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ============= ROUTES =============
app.use('/api', routes);

// ============= ERROR HANDLERS =============
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

export default app;