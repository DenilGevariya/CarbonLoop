import { z } from 'zod';

export const shipmentStatusEnum = z.enum([
  'PLANNED',
  'SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVING',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'EXCEPTION',
]);

export const shipmentFilterSchema = z.object({
  role: z.enum(['received', 'sent', 'all']).optional().default('all'),
  order_id: z.string().uuid().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const scheduleShipmentSchema = z.object({
  scheduled_pickup_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid scheduled pickup ISO date required' }),
  estimated_delivery_at: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid estimated delivery ISO date required' }),
  notes: z.string().max(1000).optional(),
});

export const reportExceptionSchema = z.object({
  reason: z.string().min(3, { message: 'Exception reason is required' }).max(255),
  notes: z.string().max(1000).optional(),
});

export const addTrackingEventSchema = z.object({
  event_type: z.string().min(2).max(100),
  location_name: z.string().min(2).max(255),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().max(1000).optional(),
  occurred_at: z.string().optional(),
});
