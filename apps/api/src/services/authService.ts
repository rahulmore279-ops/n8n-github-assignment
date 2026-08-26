import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { toPublicUser, type PublicUser } from '../models/user.js';
import * as userRepository from '../repositories/userRepository.js';
import { verifyPassword } from '../utils/password.js';

export type AuthSession = {
  token: string;
  user: PublicUser;
};

export async function login(username: string, password: string): Promise<AuthSession> {
  const user = await userRepository.findActiveUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid username or password');
  }

  const signOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, env.JWT_SECRET, signOptions);

  return { token, user: toPublicUser(user) };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await userRepository.findActiveUserById(userId);
  if (!user) {
    throw new AppError(401, 'Authenticated user is no longer active');
  }

  return toPublicUser(user);
}
