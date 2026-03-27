import type { Review, ReviewImage, User, Product, ProductImage, OrderItem } from '@prisma/client'

// ============================================
// Input Types
// ============================================

/**
 * Input for creating a review
 */
export interface CreateReviewInput {
  productId: string
  rating: number
  title?: string
  content?: string
  images?: string[]
}

/**
 * Input for updating a review
 */
export interface UpdateReviewInput {
  rating?: number
  title?: string
  content?: string
}

// ============================================
// Review Output Types
// ============================================

/**
 * Review with user information (public view)
 */
export interface ReviewWithUser {
  id: string
  userId: string
  productId: string
  orderItemId: string | null
  rating: number
  title: string | null
  content: string | null
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

/**
 * Review with images
 */
export interface ReviewWithImages extends ReviewWithUser {
  images: ReviewImage[]
}

/**
 * Full review with all relations
 */
export interface ReviewWithRelations extends ReviewWithImages {
  product: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Review with product information
 */
export interface ReviewWithProduct extends ReviewWithUser {
  product: {
    id: string
    name: string
    slug: string
    images: ProductImage[]
  }
}

// ============================================
// Rating Distribution
// ============================================

/**
 * Rating distribution (count of each star rating 1-5)
 */
export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

// ============================================
// Paginated Reviews Response
// ============================================

/**
 * Paginated reviews response with statistics
 */
export interface ProductReviewsResponse {
  reviews: ReviewWithUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  averageRating: number
  ratingDistribution: RatingDistribution
}

// ============================================
// Error Types
// ============================================

/**
 * Error thrown when review is not found
 */
export class ReviewNotFoundError extends Error {
  constructor(reviewId: string) {
    super(`Review not found: ${reviewId}`)
    this.name = 'ReviewNotFoundError'
  }
}

/**
 * Error thrown when user hasn't purchased the product
 */
export class PurchaseRequiredError extends Error {
  constructor(productId: string) {
    super(`You must purchase this product before reviewing it: ${productId}`)
    this.name = 'PurchaseRequiredError'
  }
}

/**
 * Error thrown when user already reviewed the product
 */
export class DuplicateReviewError extends Error {
  constructor(productId: string) {
    super(`You have already reviewed this product: ${productId}`)
    this.name = 'DuplicateReviewError'
  }
}

/**
 * Error thrown when user doesn't own the review
 */
export class UnauthorizedReviewAccessError extends Error {
  constructor() {
    super('You do not have permission to modify this review')
    this.name = 'UnauthorizedReviewAccessError'
  }
}
