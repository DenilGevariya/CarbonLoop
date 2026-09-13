import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).optional().default('Member'),
  lastName: z.string().min(1, 'Last name is required').max(100).optional().default('User'),
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100),
  confirmPassword: z.string().optional(),
  phone: z.string().optional().nullable(),
  roleType: z.enum(['EMITTER', 'BUYER', 'UTILIZER', 'REGULATOR', 'LOGISTICS_PROVIDER', 'PLATFORM_ADMIN', 'emitter', 'utilizer', 'regulator', 'logistics', 'admin']).optional().default('EMITTER'),
  companyName: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  gstCertificateUrl: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  otpCode: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const onboardingSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters').max(255),
  legalName: z.string().optional(),
  orgType: z.enum(['EMITTER', 'BUYER', 'LOGISTICS_PROVIDER', 'VERIFIER', 'REGULATOR', 'emitter', 'utilizer', 'logistics_provider', 'verifier', 'regulator']),
  industry: z.string().min(2, 'Industry sector is required'),
  website: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  taxIdentifier: z.string().optional().nullable(),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  addressLine1: z.string().min(2, 'Address line 1 is required'),
  userRoleTitle: z.string().optional(),
});
