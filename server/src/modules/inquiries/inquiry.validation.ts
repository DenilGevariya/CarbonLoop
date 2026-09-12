import { z } from 'zod';

export const createInquirySchema = z.object({
  listing_id: z.string().uuid({ message: 'Valid listing UUID is required' }),
  requirement_id: z.string().uuid().optional(),
  requested_quantity: z.number().positive({ message: 'Requested quantity must be greater than 0' }),
  message: z.string().min(5, { message: 'Message must be at least 5 characters long' }).max(2000),
});

export const inquiryMessageSchema = z.object({
  message: z.string().min(1, { message: 'Message content cannot be empty' }).max(2000),
});

export const inquiryFilterSchema = z.object({
  role: z.enum(['received', 'sent', 'all']).optional().default('all'),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});
