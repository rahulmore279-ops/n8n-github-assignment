export type Hall = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type HallRow = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  description: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
};

export function mapHallRow(row: HallRow): Hall {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    capacity: row.capacity,
    description: row.description,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
