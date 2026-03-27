import { z } from 'zod'

// ============================================
// Product List Parameters Schema
// ============================================

/**
 * Sort option enum
 */
export const productSortSchema = z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular'])

/**
 * Product list query parameters schema
 * Used for validating API query params
 */
export const productListParamsSchema = z.object({
  category: z.string().min(1).optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  inStock: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  sort: productSortSchema.optional().default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

/**
 * Type for product list parameters
 */
export type ProductListParamsInput = z.infer<typeof productListParamsSchema>

// ============================================
// Slug Schemas
// ============================================

/**
 * Product slug schema
 */
export const productSlugSchema = z.string().min(1, 'Slug is required')

/**
 * Category slug schema
 */
export const categorySlugSchema = z.string().min(1, 'Category slug is required')

// ============================================
// Search Schema
// ============================================

/**
 * Search query schema
 */
export const searchQuerySchema = z.string().min(1, 'Search query is required').max(200, 'Search query too long')

/**
 * Search parameters schema
 */
export const searchParamsSchema = z.object({
  q: searchQuerySchema,
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * Type for search parameters
 */
export type SearchParamsInput = z.infer<typeof searchParamsSchema>

// ============================================
// Price Range Schema
// ============================================

/**
 * Price range parameters schema
 */
export const priceRangeParamsSchema = z.object({
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice
    }
    return true
  },
  {
    message: 'minPrice must be less than or equal to maxPrice',
  }
)

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate and parse product list params from request
 */
export function validateProductListParams(params: unknown) {
  return productListParamsSchema.safeParse(params)
}

/**
 * Validate and parse search params from request
 */
export function validateSearchParams(params: unknown) {
  return searchParamsSchema.safeParse(params)
}

/**
 * Validate product slug
 */
export function validateProductSlug(slug: unknown) {
  return productSlugSchema.safeParse(slug)
}

/**
 * Validate category slug
 */
export function validateCategorySlug(slug: unknown) {
  return categorySlugSchema.safeParse(slug)
}

/**
 * Validate price range
 */
export function validatePriceRange(params: unknown) {
  return priceRangeParamsSchema.safeParse(params)
}
