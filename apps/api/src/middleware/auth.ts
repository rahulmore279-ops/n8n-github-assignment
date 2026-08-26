import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { jwtPayloadSchema } from '../schemas/auth.js';
import { AppError } from './errorHandler.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new AppError(401, 'Authentication required'));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = jwtPayloadSchema.parse(decoded);
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired token'));
  }
};
