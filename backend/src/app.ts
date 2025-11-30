import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes/index';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';

const app: Express = express();

// ============= MIDDLEWARES =============
app.use(helmet()); // Security headers
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true })); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

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