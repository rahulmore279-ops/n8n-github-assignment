import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(80),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const jwtPayloadSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(80),
  role: z.string().min(1).max(40)
});
