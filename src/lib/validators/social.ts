/**
 * Social Media Validation Schemas (Zod)
 * Input validation for social media features
 */

import { z } from 'zod'

// Platform enum
export const socialPlatformSchema = z.enum(['twitter', 'facebook', 'instagram', 'linkedin', 'pinterest'])

export type SocialPlatform = z.infer<typeof socialPlatformSchema>

// Campaign goal enum
export const campaignGoalSchema = z.enum(['awareness', 'traffic', 'sales', 'engagement'])

export type CampaignGoal = z.infer<typeof campaignGoalSchema>

// Campaign status enum
export const campaignStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'])

export type CampaignStatus = z.infer<typeof campaignStatusSchema>

// Post status enum
export const postStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'])

export type PostStatus = z.infer<typeof postStatusSchema>

/**
 * Schema for creating a social post
 */
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(2200, 'Content must be 2200 characters or less'),
  platform: socialPlatformSchema,
  imageUrls: z.array(z.string().url('Invalid image URL')).max(4, 'Maximum 4 images allowed').optional(),
  productId: z.string().cuid('Invalid product ID').optional(),
  scheduledFor: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
  isCampaignPost: z.boolean().default(false),
  campaignId: z.string().cuid('Invalid campaign ID').optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>

/**
 * Schema for updating a social post
 */
export const updatePostSchema = z.object({
  content: z.string().min(1).max(2200).optional(),
  imageUrls: z.array(z.string().url()).max(4).optional(),
  scheduledFor: z.string().datetime().optional(),
})

export type UpdatePostInput = z.infer<typeof updatePostSchema>

/**
 * Schema for creating a social campaign
 */
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  platforms: z.array(socialPlatformSchema).min(1, 'At least one platform is required'),
  productIds: z.array(z.string().cuid()).optional(),
  goal: campaignGoalSchema.optional(),
  startDate: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
  endDate: z.string().datetime({ message: 'Invalid datetime format' }).optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>

/**
 * Schema for updating a campaign
 */
export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  platforms: z.array(socialPlatformSchema).min(1).optional(),
  productIds: z.array(z.string().cuid()).optional(),
  goal: campaignGoalSchema.optional(),
  status: campaignStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>

/**
 * Schema for connecting a social account
 */
export const connectAccountSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

export type ConnectAccountInput = z.infer<typeof connectAccountSchema>

/**
 * Schema for social share request
 */
export const shareRequestSchema = z.object({
  productId: z.string().cuid('Invalid product ID').optional(),
  platform: z.string().optional(),
})

export type ShareRequestInput = z.infer<typeof shareRequestSchema>

/**
 * Schema for tracking clicks
 */
export const trackClickSchema = z.object({
  platform: z.string().min(1),
  productId: z.string().cuid(),
})

export type TrackClickInput = z.infer<typeof trackClickSchema>

/**
 * Campaign list query params
 */
export const campaignListSchema = z.object({
  status: campaignStatusSchema.optional(),
  platform: socialPlatformSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'startDate', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CampaignListParams = z.infer<typeof campaignListSchema>

/**
 * Post list query params
 */
export const postListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: postStatusSchema.optional(),
  platform: socialPlatformSchema.optional(),
})

export type PostListParams = z.infer<typeof postListSchema>

/**
 * Validate datetime is in the future (for scheduling)
 */
export const futureDatetimeSchema = z.string().datetime().refine(
  (date) => new Date(date) > new Date(),
  { message: 'Scheduled time must be in the future' }
)

/**
 * Validate datetime is in the past
 */
export const pastDatetimeSchema = z.string().datetime().refine(
  (date) => new Date(date) <= new Date(),
  { message: 'Date must be in the past' }
)

/**
 * Validate product ID or slug
 */
export const productIdentifierSchema = z.union([
  z.string().cuid(),
  z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid product slug format'),
])

export type ProductIdentifier = z.infer<typeof productIdentifierSchema>

/**
 * Validation helper - parse and throw on error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(context ? `${context}: ${errors}` : `Validation error: ${errors}`)
  }
  return result.data
}

export default {
  createPostSchema,
  updatePostSchema,
  createCampaignSchema,
  updateCampaignSchema,
  connectAccountSchema,
  shareRequestSchema,
  trackClickSchema,
  campaignListSchema,
  postListSchema,
  socialPlatformSchema,
  campaignGoalSchema,
  validateOrThrow,
}
