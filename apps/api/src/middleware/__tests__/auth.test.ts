import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { requireAuth } from '../auth.js';
import { errorHandler } from '../errorHandler.js';

function createProtectedApp() {
  const app = express();
  app.get('/protected', requireAuth, (req, res) => res.json({ user: req.user }));
  app.use(errorHandler);
  return app;
}

describe('requireAuth middleware', () => {
  it('allows requests with a valid token', async () => {
    const token = jwt.sign(
      { id: '54c02f34-0b93-4ebb-a56f-764b657b0e90', username: 'admin', role: 'admin' },
      process.env.JWT_SECRET!
    );

    const response = await request(createProtectedApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.user.username).toBe('admin');
  });

  it('rejects unauthenticated requests', async () => {
    const response = await request(createProtectedApp()).get('/protected').expect(401);
    expect(response.body.message).toBe('Authentication required');
  });
});
