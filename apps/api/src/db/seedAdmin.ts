import { env } from '../config/env.js';
import { pool } from './pool.js';
import * as userRepository from '../repositories/userRepository.js';
import { hashPassword } from '../utils/password.js';

async function seedAdmin() {
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required to seed the first admin user.');
  }

  const existingUsers = await userRepository.countUsers();
  if (existingUsers > 0) {
    console.log('Users already exist; skipping default admin creation.');
    return;
  }

  const admin = await userRepository.createUser({
    username: env.ADMIN_USERNAME,
    passwordHash: await hashPassword(env.ADMIN_PASSWORD),
    fullName: env.ADMIN_FULL_NAME,
    role: 'admin'
  });

  console.log(`Created local admin user: ${admin.username}`);
}

seedAdmin()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
