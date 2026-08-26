import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

if (process.env.ENV_FILE) {
  dotenv.config({ path: process.env.ENV_FILE });
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_USERNAME: z.string().trim().min(3).max(80).optional(),
  ADMIN_PASSWORD: z.string().min(12).max(128).optional(),
  ADMIN_FULL_NAME: z.string().trim().min(1).max(160).default('System Administrator')
});

export const env = envSchema.parse(process.env);
