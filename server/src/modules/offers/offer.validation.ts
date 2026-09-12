import { z } from 'zod';

export const createOfferSchema = z.object({
  inquiry_id: z.string().uuid({ message: 'Valid inquiry UUID is required' }),
  quantity: z.number().positive({ message: 'Quantity must be greater than 0' }),
  quantity_unit: z.string().optional().default('tonne'),
  unit_price: z.number().min(0, { message: 'Unit price cannot be negative' }),
  currency: z.string().length(3).optional().default('INR'),
  delivery_cost: z.number().min(0).optional().default(0),
  valid_until: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid ISO date string required' }),
  message: z.string().max(2000).optional(),
});

export const counterOfferSchema = z.object({
  quantity: z.number().positive().optional(),
  unit_price: z.number().min(0, { message: 'Unit price cannot be negative' }),
  delivery_cost: z.number().min(0).optional(),
  valid_until: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid ISO date string required' }),
  message: z.string().max(2000).optional(),
});

export const rejectOfferSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export const withdrawOfferSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export const offerFilterSchema = z.object({
  role: z.enum(['received', 'sent', 'all']).optional().default('all'),
  inquiry_id: z.string().uuid().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
