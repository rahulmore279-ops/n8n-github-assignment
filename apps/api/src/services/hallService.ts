import { AppError } from '../middleware/errorHandler.js';
import type { Hall } from '../models/hall.js';
import * as hallRepository from '../repositories/hallRepository.js';

function handleUniqueCodeError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
    throw new AppError(409, 'Hall code already exists');
  }
  throw error;
}

export async function listHalls(): Promise<Hall[]> {
  return hallRepository.listHalls();
}

export async function getHall(id: string): Promise<Hall> {
  const hall = await hallRepository.findHallById(id);
  if (!hall) throw new AppError(404, 'Hall not found');
  return hall;
}

export async function createHall(input: hallRepository.HallInput): Promise<Hall> {
  try {
    return await hallRepository.createHall(input);
  } catch (error) {
    handleUniqueCodeError(error);
  }
}

export async function updateHall(id: string, input: hallRepository.HallInput): Promise<Hall> {
  try {
    const hall = await hallRepository.updateHall(id, input);
    if (!hall) throw new AppError(404, 'Hall not found');
    return hall;
  } catch (error) {
    handleUniqueCodeError(error);
  }
}

export async function setHallStatus(id: string, active: boolean): Promise<Hall> {
  const hall = await hallRepository.findHallById(id);
  if (!hall) throw new AppError(404, 'Hall not found');

  if (!active && await hallRepository.hasFutureBookings(id)) {
    throw new AppError(409, 'Hall cannot be deactivated while it has active or future bookings');
  }

  const updatedHall = await hallRepository.setHallStatus(id, active);
  if (!updatedHall) throw new AppError(404, 'Hall not found');
  return updatedHall;
}

export async function getAvailability(hallId: string, date: string) {
  const hall = await hallRepository.findHallById(hallId);
  if (!hall) throw new AppError(404, 'Hall not found');

  const hasBooking = await hallRepository.hasBookingsOnDate(hallId, date);
  return {
    hallId: hall.id,
    date,
    available: hall.active && !hasBooking,
    active: hall.active,
    reason: !hall.active ? 'Hall is inactive' : hasBooking ? 'Hall has a booking on this date' : null
  };
}
