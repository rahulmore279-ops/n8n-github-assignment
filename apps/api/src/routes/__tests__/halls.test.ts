import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hallsRouter } from '../halls.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import * as hallService from '../../services/hallService.js';

vi.mock('../../middleware/auth.js', () => ({
  requireAuth: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const role = req.headers['x-test-role'];
    if (!role) return res.status(401).json({ message: 'Authentication required' });
    req.user = { id: '54c02f34-0b93-4ebb-a56f-764b657b0e90', username: 'tester', role: String(role) };
    return next();
  }
}));

vi.mock('../../services/hallService.js', () => ({
  listHalls: vi.fn(),
  getHall: vi.fn(),
  createHall: vi.fn(),
  updateHall: vi.fn(),
  setHallStatus: vi.fn(),
  getAvailability: vi.fn()
}));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/halls', hallsRouter);
  app.use(errorHandler);
  return app;
}

describe('hall routes', () => {
  beforeEach(() => vi.resetAllMocks());

  it('rejects unauthorized access', async () => {
    const response = await request(createTestApp()).get('/api/halls').expect(401);
    expect(response.body.message).toBe('Authentication required');
  });

  it('allows managers to create halls', async () => {
    vi.mocked(hallService.createHall).mockResolvedValue({
      id: '54c02f34-0b93-4ebb-a56f-764b657b0e90',
      name: 'Board Room',
      code: 'BOARD',
      capacity: 12,
      description: null,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(createTestApp())
      .post('/api/halls')
      .set('x-test-role', 'manager')
      .send({ name: 'Board Room', code: 'BOARD', capacity: 12 })
      .expect(201);

    expect(response.body.hall.code).toBe('BOARD');
  });

  it('rejects invalid hall/date input for availability', async () => {
    const response = await request(createTestApp())
      .get('/api/halls/availability?hallId=bad-id&date=26-08-2026')
      .set('x-test-role', 'viewer')
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });
});
