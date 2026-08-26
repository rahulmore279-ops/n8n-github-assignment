import type { RequestHandler } from 'express';
import { AppError } from './errorHandler.js';

export function requireRoles(...allowedRoles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError(401, 'Authentication required'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You are not authorized to perform this action'));
    }
    return next();
  };
}
