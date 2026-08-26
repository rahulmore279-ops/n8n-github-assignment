import { pool } from './pool.js';

const defaultHalls = [
  { name: 'Banquet Hall', code: 'BANQUET-HALL', capacity: 300, description: 'Main banquet hall for large events' },
  { name: 'Conf-1', code: 'CONF-1', capacity: 20, description: 'Conference room for compact meetings' },
  { name: 'Conf-2', code: 'CONF-2', capacity: 50, description: 'Conference room for mid-size meetings' },
  { name: 'Lawn', code: 'LAWN', capacity: 100, description: 'Outdoor lawn for social events' }
] as const;

async function seedHalls() {
  for (const hall of defaultHalls) {
    await pool.query(
      `INSERT INTO halls (name, code, capacity, description, active)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (code) DO UPDATE
       SET name = EXCLUDED.name,
           capacity = EXCLUDED.capacity,
           description = EXCLUDED.description,
           updated_at = NOW()`,
      [hall.name, hall.code, hall.capacity, hall.description]
    );
  }

  console.log(`Seeded ${defaultHalls.length} default halls.`);
}

seedHalls()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
