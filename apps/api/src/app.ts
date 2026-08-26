import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { healthRouter } from './routes/health.js';
import { hallsRouter } from './routes/halls.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/halls', hallsRouter);

app.use(errorHandler);
