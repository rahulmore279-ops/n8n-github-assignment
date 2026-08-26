import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as hallRepository from '../../repositories/hallRepository.js';
import * as hallService from '../hallService.js';

vi.mock('../../repositories/hallRepository.js', () => ({
  listHalls: vi.fn(),
  findHallById: vi.fn(),
  createHall: vi.fn(),
  updateHall: vi.fn(),
  setHallStatus: vi.fn(),
  hasFutureBookings: vi.fn(),
  hasBookingsOnDate: vi.fn()
}));

const hall = {
  id: '54c02f34-0b93-4ebb-a56f-764b657b0e90',
  name: 'Banquet Hall',
  code: 'BANQUET-HALL',
  capacity: 300,
  description: 'Main banquet hall for large events',
  active: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z')
};

describe('hallService', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns four default halls from the repository', async () => {
    vi.mocked(hallRepository.listHalls).mockResolvedValue([
      hall,
      { ...hall, id: '54c02f34-0b93-4ebb-a56f-764b657b0e91', name: 'Conf-1', code: 'CONF-1', capacity: 20 },
      { ...hall, id: '54c02f34-0b93-4ebb-a56f-764b657b0e92', name: 'Conf-2', code: 'CONF-2', capacity: 50 },
      { ...hall, id: '54c02f34-0b93-4ebb-a56f-764b657b0e93', name: 'Lawn', code: 'LAWN', capacity: 100 }
    ]);

    await expect(hallService.listHalls()).resolves.toHaveLength(4);
  });

  it('rejects duplicate hall codes', async () => {
    vi.mocked(hallRepository.createHall).mockRejectedValue({ code: '23505' });
    await expect(hallService.createHall({ name: 'Duplicate', code: 'CONF-1', capacity: 10 })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates a hall', async () => {
    vi.mocked(hallRepository.createHall).mockResolvedValue(hall);
    await expect(hallService.createHall({ name: hall.name, code: hall.code, capacity: hall.capacity })).resolves.toEqual(hall);
  });

  it('updates a hall', async () => {
    vi.mocked(hallRepository.updateHall).mockResolvedValue({ ...hall, capacity: 350 });
    await expect(hallService.updateHall(hall.id, { name: hall.name, code: hall.code, capacity: 350 })).resolves.toMatchObject({ capacity: 350 });
  });

  it('deactivates a hall only when there are no future bookings', async () => {
    vi.mocked(hallRepository.findHallById).mockResolvedValue(hall);
    vi.mocked(hallRepository.hasFutureBookings).mockResolvedValue(false);
    vi.mocked(hallRepository.setHallStatus).mockResolvedValue({ ...hall, active: false });
    await expect(hallService.setHallStatus(hall.id, false)).resolves.toMatchObject({ active: false });
  });

  it('blocks unsafe deactivation when future bookings exist', async () => {
    vi.mocked(hallRepository.findHallById).mockResolvedValue(hall);
    vi.mocked(hallRepository.hasFutureBookings).mockResolvedValue(true);
    await expect(hallService.setHallStatus(hall.id, false)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('looks up availability for a valid hall and date', async () => {
    vi.mocked(hallRepository.findHallById).mockResolvedValue(hall);
    vi.mocked(hallRepository.hasBookingsOnDate).mockResolvedValue(false);
    await expect(hallService.getAvailability(hall.id, '2026-08-26')).resolves.toMatchObject({ available: true });
  });
});
