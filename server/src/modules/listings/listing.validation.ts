import { z } from 'zod';

export const listingFilterSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
  minQuantity: z.coerce.number().min(0).optional(),
  maxQuantity: z.coerce.number().min(0).optional(),
  minPurity: z.coerce.number().min(0).max(100).optional(),
  maxPurity: z.coerce.number().min(0).max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  physicalForm: z.string().optional(),
  status: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  deliveryAvailable: z.coerce.boolean().optional(),
  pickupAvailable: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'purity_asc', 'purity_desc', 'quantity_asc', 'quantity_desc']).default('newest'),
});

export const createListingSchema = z.object({
  facilityId: z.string().uuid({ message: 'Select a valid facility' }),
  title: z.string().min(5, { message: 'Title must be at least 5 characters long' }).max(255),
  description: z.string().max(2000).optional(),
  availableQuantity: z.number().gt(0, { message: 'Available quantity must be greater than 0' }),
  quantityUnit: z.string().default('tonne'),
  minimumOrderQuantity: z.number().min(0.01, { message: 'Minimum order quantity must be greater than 0' }).optional(),
  purityPercentage: z.number().gt(0, { message: 'Purity must be > 0%' }).lte(100, { message: 'Purity cannot exceed 100%' }),
  physicalForm: z.enum(['GASEOUS', 'LIQUID', 'SUPERCRITICAL', 'SOLID_DRY_ICE', 'gaseous', 'liquid', 'supercritical', 'solid_dry_ice']),
  captureMethod: z.string().max(255).optional(),
  captureSource: z.string().max(255).optional(),
  temperatureCelsius: z.number().min(-273.15).max(500).optional(),
  pressureBar: z.number().min(0).max(1000).optional(),
  pricePerUnit: z.number().min(0, { message: 'Price cannot be negative' }),
  currency: z.string().default('INR'),
  availableFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Provide a valid available from date' }),
  availableUntil: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Provide a valid available until date' }),
  deliveryAvailable: z.boolean().default(true),
  pickupAvailable: z.boolean().default(true),
  publishNow: z.boolean().default(false),
}).refine((data) => {
  if (data.minimumOrderQuantity && data.minimumOrderQuantity > data.availableQuantity) {
    return false;
  }
  return true;
}, {
  message: 'Minimum order quantity cannot exceed available quantity',
  path: ['minimumOrderQuantity'],
}).refine((data) => {
  if (data.availableUntil && data.availableFrom) {
    return new Date(data.availableUntil) >= new Date(data.availableFrom);
  }
  return true;
}, {
  message: 'Available until date must be after available from date',
  path: ['availableUntil'],
});

export const updateListingSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().max(2000).optional(),
  availableQuantity: z.number().gt(0).optional(),
  minimumOrderQuantity: z.number().min(0.01).optional(),
  purityPercentage: z.number().gt(0).lte(100).optional(),
  physicalForm: z.enum(['GASEOUS', 'LIQUID', 'SUPERCRITICAL', 'SOLID_DRY_ICE', 'gaseous', 'liquid', 'supercritical', 'solid_dry_ice']).optional(),
  captureMethod: z.string().max(255).optional(),
  captureSource: z.string().max(255).optional(),
  temperatureCelsius: z.number().min(-273.15).max(500).optional(),
  pressureBar: z.number().min(0).max(1000).optional(),
  pricePerUnit: z.number().min(0).optional(),
  currency: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  deliveryAvailable: z.boolean().optional(),
  pickupAvailable: z.boolean().optional(),
});

export const statusActionSchema = z.object({
  reason: z.string().max(500).optional(),
});
