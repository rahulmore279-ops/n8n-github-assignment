import { pool } from '../db/pool.js';
import { mapHallRow, type Hall, type HallRow } from '../models/hall.js';

export type HallInput = {
  name: string;
  code: string;
  capacity: number;
  description?: string | null;
  active?: boolean;
};

export async function listHalls(): Promise<Hall[]> {
  const result = await pool.query<HallRow>(
    `SELECT id, name, code, capacity, description, active, created_at, updated_at
     FROM halls
     ORDER BY name ASC`
  );
  return result.rows.map(mapHallRow);
}

export async function findHallById(id: string): Promise<Hall | null> {
  const result = await pool.query<HallRow>(
    `SELECT id, name, code, capacity, description, active, created_at, updated_at
     FROM halls
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapHallRow(result.rows[0]) : null;
}

export async function createHall(input: HallInput): Promise<Hall> {
  const result = await pool.query<HallRow>(
    `INSERT INTO halls (name, code, capacity, description, active)
     VALUES ($1, $2, $3, $4, COALESCE($5, TRUE))
     RETURNING id, name, code, capacity, description, active, created_at, updated_at`,
    [input.name, input.code, input.capacity, input.description ?? null, input.active]
  );
  return mapHallRow(result.rows[0]);
}

export async function updateHall(id: string, input: HallInput): Promise<Hall | null> {
  const result = await pool.query<HallRow>(
    `UPDATE halls
     SET name = $2,
         code = $3,
         capacity = $4,
         description = $5,
         active = COALESCE($6, active),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, code, capacity, description, active, created_at, updated_at`,
    [id, input.name, input.code, input.capacity, input.description ?? null, input.active]
  );
  return result.rows[0] ? mapHallRow(result.rows[0]) : null;
}

export async function setHallStatus(id: string, active: boolean): Promise<Hall | null> {
  const result = await pool.query<HallRow>(
    `UPDATE halls
     SET active = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, code, capacity, description, active, created_at, updated_at`,
    [id, active]
  );
  return result.rows[0] ? mapHallRow(result.rows[0]) : null;
}

export async function hasFutureBookings(hallId: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM bookings
       WHERE hall_id = $1
         AND ends_at >= NOW()
         AND status NOT IN ('cancelled', 'completed')
     )`,
    [hallId]
  );
  return Boolean(result.rows[0]?.exists);
}

export async function hasBookingsOnDate(hallId: string, date: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM bookings
       WHERE hall_id = $1
         AND status NOT IN ('cancelled')
         AND starts_at < ($2::date + INTERVAL '1 day')
         AND ends_at > $2::date
     )`,
    [hallId, date]
  );
  return Boolean(result.rows[0]?.exists);
}
