import { z } from 'zod';

export const transportModesEnum = z.enum([
  'ROAD',
  'RAIL',
  'PIPELINE',
  'SHIP',
  'OTHER',
  'ISO_TANK_TRUCK',
  'CYLINDER_CASCADE',
  'RAIL_TANKER',
]);

export const createQuoteSchema = z.object({
  order_id: z.string().uuid({ message: 'Valid order UUID is required' }),
  origin_facility_id: z.string().uuid().optional(),
  destination_facility_id: z.string().uuid().optional(),
  transport_mode: transportModesEnum,
  base_cost: z.number().min(0, { message: 'Base cost cannot be negative' }),
  fuel_surcharge: z.number().min(0).optional().default(0),
  handling_cost: z.number().min(0).optional().default(0),
  other_cost: z.number().min(0).optional().default(0),
  currency: z.string().length(3).optional().default('INR'),
  valid_until: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid ISO date required' }),
  notes: z.string().max(1000).optional(),
});

export const quoteFilterSchema = z.object({
  order_id: z.string().uuid().optional(),
  role: z.enum(['received', 'sent', 'all']).optional().default('all'),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const rejectQuoteSchema = z.object({
  reason: z.string().max(1000).optional(),
});

export const withdrawQuoteSchema = z.object({
  reason: z.string().max(1000).optional(),
});
