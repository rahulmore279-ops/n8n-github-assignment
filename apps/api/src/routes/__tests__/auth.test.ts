import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authRouter } from '../auth.js';
import { AppError, errorHandler } from '../../middleware/errorHandler.js';
import * as authService from '../../services/authService.js';

vi.mock('../../services/authService.js', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn()
}));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  app.use(errorHandler);
  return app;
}

describe('auth routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('logs in with valid credentials', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      token: 'signed.jwt.token',
      user: { id: '54c02f34-0b93-4ebb-a56f-764b657b0e90', username: 'admin', fullName: 'Admin User', role: 'admin' }
    });

    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'valid-password' })
      .expect(200);

    expect(response.body).toEqual({
      token: 'signed.jwt.token',
      user: { id: '54c02f34-0b93-4ebb-a56f-764b657b0e90', username: 'admin', fullName: 'Admin User', role: 'admin' }
    });
  });

  it('returns a friendly error for invalid credentials', async () => {
    vi.mocked(authService.login).mockRejectedValue(new AppError(401, 'Invalid username or password'));

    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid username or password');
  });

  it('rejects invalid login payloads', async () => {
    const response = await request(createTestApp())
      .post('/api/auth/login')
      .send({ username: 'ad', password: 'short' })
      .expect(400);

    expect(response.body.message).toBe('Validation failed');
  });
});
