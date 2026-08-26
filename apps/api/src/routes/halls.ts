import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';
import { availabilityQuerySchema, hallIdSchema, hallInputSchema, hallStatusSchema } from '../schemas/hall.js';
import * as hallService from '../services/hallService.js';

const managementRoles = requireRoles('admin', 'manager');

export const hallsRouter = Router();

hallsRouter.use(requireAuth);

hallsRouter.get('/', async (_req, res, next) => {
  try {
    res.json({ halls: await hallService.listHalls() });
  } catch (error) {
    next(error);
  }
});

hallsRouter.get('/availability', async (req, res, next) => {
  try {
    const query = availabilityQuerySchema.parse(req.query);
    res.json(await hallService.getAvailability(query.hallId, query.date));
  } catch (error) {
    next(error);
  }
});

hallsRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = hallIdSchema.parse(req.params);
    res.json({ hall: await hallService.getHall(id) });
  } catch (error) {
    next(error);
  }
});

hallsRouter.post('/', managementRoles, async (req, res, next) => {
  try {
    const payload = hallInputSchema.parse(req.body);
    res.status(201).json({ hall: await hallService.createHall(payload) });
  } catch (error) {
    next(error);
  }
});

hallsRouter.put('/:id', managementRoles, async (req, res, next) => {
  try {
    const { id } = hallIdSchema.parse(req.params);
    const payload = hallInputSchema.parse(req.body);
    res.json({ hall: await hallService.updateHall(id, payload) });
  } catch (error) {
    next(error);
  }
});

hallsRouter.patch('/:id/status', managementRoles, async (req, res, next) => {
  try {
    const { id } = hallIdSchema.parse(req.params);
    const payload = hallStatusSchema.parse(req.body);
    res.json({ hall: await hallService.setHallStatus(id, payload.active) });
  } catch (error) {
    next(error);
  }
});
