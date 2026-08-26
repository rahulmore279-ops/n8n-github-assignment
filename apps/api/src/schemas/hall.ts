import { z } from 'zod';

export const hallIdSchema = z.object({ id: z.string().uuid() });

export const hallInputSchema = z.object({
  name: z.string().trim().min(2, 'Hall name must be at least 2 characters').max(140),
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9-]+$/i, 'Code may contain letters, numbers, and hyphens only').transform((value) => value.toUpperCase()),
  capacity: z.coerce.number().int().positive('Capacity must be greater than zero').max(10000),
  description: z.string().trim().max(1000).optional().nullable(),
  active: z.boolean().optional()
});

export const hallStatusSchema = z.object({ active: z.boolean() });

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format').refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, 'Date must be a valid calendar date'),
  hallId: z.string().uuid('A valid hall id is required')
});
