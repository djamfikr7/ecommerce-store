import { z } from 'zod'

// ============================================
// Create Review Schema
// ============================================

/**
 * Schema for creating a review
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters').optional(),
  content: z.string().min(20, 'Review content must be at least 20 characters').max(5000, 'Review content cannot exceed 5000 characters').optional(),
  images: z.array(z.string().url('Each image must be a valid URL')).max(5, 'Maximum 5 images allowed').optional(),
})

/**
 * Type for create review input
 */
export type CreateReviewInput = z.infer<typeof createReviewSchema>

// ============================================
// Update Review Schema
// ============================================

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title cannot exceed 200 characters').optional().transform(val => val === '' ? undefined : val),
  content: z.string().min(20, 'Review content must be at least 20 characters').max(5000, 'Review content cannot exceed 5000 characters').optional().transform(val => val === '' ? undefined : val),
})

/**
 * Type for update review input
 */
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

// ============================================
// Query Parameter Schemas
// ============================================

/**
 * Schema for review list query parameters
 */
export const reviewListParamsSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * Type for review list parameters
 */
export type ReviewListParams = z.infer<typeof reviewListParamsSchema>

/**
 * Schema for single review ID parameter
 */
export const reviewIdParamSchema = z.object({
  id: z.string().min(1, 'Review ID is required'),
})

/**
 * Type for review ID parameter
 */
export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>

// ============================================
// Helpful Vote Schema
// ============================================

/**
 * Schema for marking a review as helpful
 */
export const markHelpfulSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
})

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate and parse create review input
 */
export function validateCreateReview(data: unknown) {
  return createReviewSchema.safeParse(data)
}

/**
 * Validate and parse update review input
 */
export function validateUpdateReview(data: unknown) {
  return updateReviewSchema.safeParse(data)
}

/**
 * Validate and parse review list parameters
 */
export function validateReviewListParams(params: unknown) {
  return reviewListParamsSchema.safeParse(params)
}

/**
 * Validate and parse review ID parameter
 */
export function validateReviewIdParam(params: unknown) {
  return reviewIdParamSchema.safeParse(params)
}
