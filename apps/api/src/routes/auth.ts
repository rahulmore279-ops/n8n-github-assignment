import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema } from '../schemas/auth.js';
import * as authService from '../services/authService.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload.username, payload.password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', requireAuth, (_req, res) => {
  res.status(204).send();
});
