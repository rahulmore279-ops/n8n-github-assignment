export type UserRole = 'admin' | 'manager' | 'sales' | 'viewer';

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Pick<User, 'id' | 'username' | 'fullName' | 'role'>;

export type UserRow = {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role
  };
}
