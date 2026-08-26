import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', requireAuth, (_req, res) => {
  res.json({
    modules: ['halls', 'enquiries', 'bookings', 'availability', 'calendar', 'customers', 'payments', 'reports', 'users'],
    message: 'Dashboard foundation is ready for banquet operations.'
  });
});
