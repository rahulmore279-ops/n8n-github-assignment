import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertFile(relativePath) {
  assert(fs.existsSync(path.join(root, relativePath)), `Missing required file: ${relativePath}`);
}

const requiredFiles = [
  'package.json',
  '.env.example',
  '.gitignore',
  'apps/api/package.json',
  'apps/api/src/app.ts',
  'apps/api/src/config/env.ts',
  'apps/api/src/db/migrate.ts',
  'apps/api/src/db/seedAdmin.ts',
  'apps/api/src/db/seedHalls.ts',
  'apps/api/src/db/migrations/001_initial_schema.sql',
  'apps/api/src/routes/halls.ts',
  'apps/api/src/services/hallService.ts',
  'apps/api/src/repositories/hallRepository.ts',
  'apps/api/src/models/hall.ts',
  'apps/web/package.json',
  'apps/web/src/App.tsx',
  'apps/web/src/pages/LoginPage.tsx',
  'apps/web/src/pages/Dashboard.tsx'
];

requiredFiles.forEach(assertFile);

const rootPackage = JSON.parse(read('package.json'));
const apiPackage = JSON.parse(read('apps/api/package.json'));
assert(Array.isArray(rootPackage.workspaces), 'Root package.json must define workspaces.');
['dev', 'build', 'typecheck', 'lint', 'check', 'test'].forEach((script) => {
  assert(rootPackage.scripts?.[script], `Root package.json missing ${script} script.`);
});
['migrate', 'seed:admin', 'seed:halls', 'test'].forEach((script) => {
  assert(apiPackage.scripts?.[script], `API package.json missing ${script} script.`);
});

const gitignore = read('.gitignore');
assert(/^\.env$/m.test(gitignore), '.gitignore must ignore .env.');
assert(/^\.env\.\*$/m.test(gitignore), '.gitignore must ignore .env.*.');
assert(/^!\.env\.example$/m.test(gitignore), '.gitignore must keep .env.example tracked.');

const envExample = read('.env.example');
['DATABASE_URL=', 'JWT_SECRET=', 'PORT=', 'CORS_ORIGIN=', 'ADMIN_USERNAME=', 'ADMIN_PASSWORD=', 'VITE_API_URL='].forEach((key) => {
  assert(envExample.includes(key), `.env.example missing ${key}`);
});
const jwtSecret = envExample.match(/^JWT_SECRET=(.+)$/m)?.[1] ?? '';
assert(jwtSecret.length >= 32, '.env.example JWT_SECRET placeholder must satisfy validation length.');
assert(!/password123|secret123|changeme/i.test(jwtSecret), '.env.example must not use weak credential placeholders.');

const migration = read('apps/api/src/db/migrations/001_initial_schema.sql');
['users', 'customers', 'halls', 'enquiries', 'bookings', 'payments'].forEach((table) => {
  assert(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, 'i').test(migration), `Migration missing ${table} table.`);
});
assert(/password_hash TEXT NOT NULL/i.test(migration), 'Users table must store password hashes, not plain passwords.');
assert(/booking_time_valid/i.test(migration), 'Bookings table must validate booking time ranges.');
assert(/idx_bookings_hall_time/i.test(migration), 'Migration must index hall availability lookups.');
assert(/code VARCHAR\(40\) NOT NULL UNIQUE/i.test(migration), 'Halls table must require unique hall codes.');
assert(/active BOOLEAN NOT NULL DEFAULT TRUE/i.test(migration), 'Halls table must track active status.');
assert(/idx_halls_active/i.test(migration), 'Migration must index hall active status.');
assert(/role IN \('admin', 'manager', 'sales', 'viewer'\)/i.test(migration), 'Users table must constrain known roles.');

const seedHalls = read('apps/api/src/db/seedHalls.ts');
['Banquet Hall', 'Conf-1', 'Conf-2', 'Lawn'].forEach((hallName) => {
  assert(seedHalls.includes(hallName), `Default hall seed missing ${hallName}.`);
});
assert(/ON CONFLICT \(code\) DO UPDATE/i.test(seedHalls), 'Default hall seed must be idempotent by code.');

const hallsRoutes = read('apps/api/src/routes/halls.ts');
["get('/'", "get('/availability'", "get('/:id'", "post('/'", "put('/:id'", "patch('/:id/status'"].forEach((route) => {
  assert(hallsRoutes.includes(route), `Hall routes missing ${route}.`);
});
assert(/requireRoles\('admin', 'manager'\)/.test(hallsRoutes), 'Hall management routes must require admin or manager roles.');

const hallService = read('apps/api/src/services/hallService.ts');
assert(/hasFutureBookings/.test(hallService), 'Hall service must prevent unsafe deactivation when future bookings exist.');
assert(/hasBookingsOnDate/.test(hallService), 'Hall availability must check bookings instead of mock data.');

const appSource = read('apps/api/src/app.ts');
assert(/cors\(\{ origin: env\.CORS_ORIGIN/.test(appSource), 'API must use configured CORS origin instead of unrestricted CORS.');

const authRoutes = read('apps/api/src/routes/auth.ts');
assert(/authRouter\.get\('\/me', requireAuth/.test(authRoutes), 'Auth routes must expose protected GET /me.');
assert(/authRouter\.post\('\/logout', requireAuth/.test(authRoutes), 'Auth routes must expose protected POST /logout.');

const seedAdmin = read('apps/api/src/db/seedAdmin.ts');
assert(/ADMIN_USERNAME/.test(seedAdmin) && /ADMIN_PASSWORD/.test(seedAdmin), 'Admin seed must read credentials from environment variables.');
assert(/countUsers/.test(seedAdmin), 'Admin seed must avoid creating users when users already exist.');
assert(/hashPassword/.test(seedAdmin), 'Admin seed must hash the configured password before insert.');

const authService = read('apps/api/src/services/authService.ts');
assert(/verifyPassword\(password, user\.passwordHash\)/.test(authService), 'Auth service must compare password hashes.');
assert(/jwt\.sign/.test(authService), 'Auth service must issue JWT tokens.');
assert(!/console\.log\(.+password/i.test(authService), 'Auth service must not log passwords.');

if (failures.length > 0) {
  console.error('Foundation validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Foundation validation passed.');
