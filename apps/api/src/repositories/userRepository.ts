import { pool } from '../db/pool.js';
import { mapUserRow, type User, type UserRole, type UserRow } from '../models/user.js';

export async function findActiveUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, full_name, role, is_active, created_at, updated_at
     FROM users
     WHERE username = $1 AND is_active = TRUE`,
    [username]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function findActiveUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, username, password_hash, full_name, role, is_active, created_at, updated_at
     FROM users
     WHERE id = $1 AND is_active = TRUE`,
    [id]
  );

  return result.rows[0] ? mapUserRow(result.rows[0]) : null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
}): Promise<User> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (username, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, password_hash, full_name, role, is_active, created_at, updated_at`,
    [input.username, input.passwordHash, input.fullName, input.role]
  );

  return mapUserRow(result.rows[0]);
}

export async function countUsers(): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
  return Number(result.rows[0]?.count ?? 0);
}
