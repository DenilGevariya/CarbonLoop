import { z } from 'zod';

export const requirementBaseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string().optional(),
  utilization_type_id: z.string().uuid('Invalid utilization type ID').optional(),
  intended_use: z.string().optional(),
  required_quantity: z
    .number()
    .positive('Required quantity must be greater than 0'),
  quantity_unit: z.string().default('tonne'),
  minimum_purity: z
    .number()
    .min(0.01, 'Purity must be > 0')
    .max(100, 'Purity cannot exceed 100%'),
  maximum_purity: z
    .number()
    .min(0.01, 'Purity must be > 0')
    .max(100, 'Purity cannot exceed 100%')
    .optional(),
  acceptable_physical_form: z.string().optional(),
  preferred_capture_method: z.string().optional(),
  maximum_price_per_unit: z
    .number()
    .min(0, 'Maximum price cannot be negative')
    .optional(),
  currency: z.string().length(3).default('INR'),
  required_from: z.string().optional(),
  required_until: z.string().optional(),
  delivery_required: z.boolean().default(true),
  destination_facility_id: z.string().uuid('Invalid facility ID').optional(),
  location_city: z.string().optional(),
  location_state: z.string().optional(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

export const createRequirementSchema = requirementBaseSchema
  .refine(
    (data) => {
      if (data.maximum_purity !== undefined && data.minimum_purity !== undefined) {
        return data.maximum_purity >= data.minimum_purity;
      }
      return true;
    },
    {
      message: 'Maximum purity must be greater than or equal to minimum purity',
      path: ['maximum_purity'],
    }
  )
  .refine(
    (data) => {
      if (data.required_from && data.required_until) {
        return new Date(data.required_until) >= new Date(data.required_from);
      }
      return true;
    },
    {
      message: 'Required until date must be on or after required from date',
      path: ['required_until'],
    }
  )
  .refine(
    (data) => {
      if (data.delivery_required && !data.destination_facility_id && !data.location_city) {
        return false;
      }
      return true;
    },
    {
      message: 'Destination facility or location is required when delivery is requested',
      path: ['destination_facility_id'],
    }
  );

export const updateRequirementSchema = requirementBaseSchema
  .partial()
  .refine(
    (data) => {
      if (data.maximum_purity !== undefined && data.minimum_purity !== undefined) {
        return data.maximum_purity >= data.minimum_purity;
      }
      return true;
    },
    {
      message: 'Maximum purity must be greater than or equal to minimum purity',
      path: ['maximum_purity'],
    }
  )
  .refine(
    (data) => {
      if (data.required_from && data.required_until) {
        return new Date(data.required_until) >= new Date(data.required_from);
      }
      return true;
    },
    {
      message: 'Required until date must be on or after required from date',
      path: ['required_until'],
    }
  );

export const statusChangeSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export const filterRequirementsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  status: z.string().optional(),
  utilization_code: z.string().optional(),
  utilization_type_id: z.string().optional(),
  physical_form: z.string().optional(),
  priority: z.string().optional(),
  min_purity: z.coerce.number().optional(),
  max_price: z.coerce.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  sort: z.string().default('newest'),
  order: z.enum(['asc', 'desc']).optional(),
});
