import { z } from 'zod';

export const acceptOfferSchema = z.object({
  offer_id: z.string().uuid({ message: 'Valid offer UUID is required' }),
  destination_address: z.string().optional(),
});

export const orderFilterSchema = z.object({
  role: z.enum(['received', 'sent', 'all']).optional().default('all'),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
