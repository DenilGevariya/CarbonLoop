import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '12m', 'all', 'custom']).optional().default('30d'),
  from: z.string().optional(),
  to: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  region: z.string().optional(),
});
