/**
 * Authentication Zod Schemas
 * Input validation for auth-related operations
 */

import { z } from 'zod';

/**
 * Password validation regex:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 */
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter and 1 number'
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  image: z
    .string()
    .url('Invalid URL format')
    .optional()
    .nullable(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
});

export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH'], {
    errorMap: () => ({ message: 'Type must be SHIPPING, BILLING, or BOTH' }),
  }),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(200, 'Address line 1 must be less than 200 characters')
    .trim(),
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must be less than 200 characters')
    .trim()
    .optional()
    .nullable(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),
  state: z
    .string()
    .max(100, 'State must be less than 100 characters')
    .trim()
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code must be less than 20 characters')
    .trim(),
  country: z
    .string()
    .min(2, 'Country code must be at least 2 characters')
    .max(3, 'Country code must be at most 3 characters')
    .default('US')
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
