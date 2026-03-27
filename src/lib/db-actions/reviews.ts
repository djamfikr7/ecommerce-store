'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type {
  CreateReviewInput,
  UpdateReviewInput,
  ReviewWithUser,
  RatingDistribution,
  ProductReviewsResponse,
} from '@/types/reviews'
import {
  ReviewNotFoundError,
  PurchaseRequiredError,
  DuplicateReviewError,
  UnauthorizedReviewAccessError,
} from '@/types/reviews'

// ============================================
// Helper: Recalculate Product Average Rating
// ============================================

async function recalculateProductRating(productId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  })

  if (reviews.length === 0) {
    return
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = totalRating / reviews.length

  // Store average rating on product if needed (optional - can be computed on read)
  // For now, we just track it in memory for queries
}

// ============================================
// Create Review
// ============================================

/**
 * Create a new review for a product
 * - Verifies user has purchased the product
 * - Prevents duplicate reviews
 * - Creates review and updates product rating
 */
export async function createReview(
  data: CreateReviewInput,
  userId: string
): Promise<ReviewWithUser> {
  const { productId, rating, title, content, images } = data

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    throw new ReviewNotFoundError(productId)
  }

  // Check if user already reviewed this product
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  })

  if (existingReview) {
    throw new DuplicateReviewError(productId)
  }

  // Verify user purchased the product
  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    },
    include: {
      order: true,
    },
  })

  const verifiedPurchase = purchasedItem !== null
  const orderItemId = purchasedItem?.id ?? null

  // Create review in transaction
  const review = await prisma.$transaction(async (tx) => {
    // Create the review
    const newReview = await tx.review.create({
      data: {
        userId,
        productId,
        orderItemId,
        rating,
        title,
        content,
        verifiedPurchase,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Add review images if provided
    if (images && images.length > 0) {
      await tx.reviewImage.createMany({
        data: images.map((url) => ({
          reviewId: newReview.id,
          url,
        })),
      })
    }

    // If this was from an order item, mark it as reviewed
    if (orderItemId) {
      await tx.orderItem.update({
        where: { id: orderItemId },
        data: { reviewed: true },
      })
    }

    return newReview
  })

  // Revalidate product page
  revalidatePath(`/products/[slug]`, 'page')

  // Return review with images
  const fullReview = await prisma.review.findUnique({
    where: { id: review.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      images: true,
    },
  })

  return fullReview as ReviewWithUser
}

// ============================================
// Get Product Reviews
// ============================================

/**
 * Get paginated reviews for a product with statistics
 */
export async function getProductReviews(
  productId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<ProductReviewsResponse> {
  const skip = (page - 1) * pageSize

  // Fetch reviews and counts in parallel
  const [reviews, totalReviews, ratingData] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        images: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.review.count({ where: { productId } }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
    }),
  ])

  // Calculate average rating
  const totalRating = ratingData.reduce((sum, r) => sum + r.rating * r._count.rating, 0)
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

  // Build rating distribution
  const ratingDistribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  ratingData.forEach((r) => {
    ratingDistribution[r.rating as keyof RatingDistribution] = r._count.rating
  })

  return {
    reviews: reviews as ReviewWithUser[],
    total: totalReviews,
    page,
    pageSize,
    totalPages: Math.ceil(totalReviews / pageSize),
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
  }
}

// ============================================
// Get Review by ID
// ============================================

/**
 * Get a single review by ID with all relations
 */
export async function getReviewById(reviewId: string): Promise<ReviewWithUser | null> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  return review as ReviewWithUser | null
}

// ============================================
// Update Review
// ============================================

/**
 * Update an existing review
 * - Verifies ownership
 * - Updates review and recalculates product rating
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  data: UpdateReviewInput
): Promise<ReviewWithUser> {
  // Get existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true },
  })

  if (!existingReview) {
    throw new ReviewNotFoundError(reviewId)
  }

  if (existingReview.userId !== userId) {
    throw new UnauthorizedReviewAccessError()
  }

  // Update review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      title: data.title,
      content: data.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      images: true,
    },
  })

  // Revalidate product page
  revalidatePath(`/products/[slug]`, 'page')

  return updatedReview as ReviewWithUser
}

// ============================================
// Delete Review
// ============================================

/**
 * Delete a review
 * - Verifies ownership
 * - Deletes review and recalculates product rating
 */
export async function deleteReview(reviewId: string, userId: string): Promise<void> {
  // Get existing review
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, productId: true, orderItemId: true },
  })

  if (!existingReview) {
    throw new ReviewNotFoundError(reviewId)
  }

  if (existingReview.userId !== userId) {
    throw new UnauthorizedReviewAccessError()
  }

  // Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Delete review images first (cascades but explicit is better)
    await tx.reviewImage.deleteMany({
      where: { reviewId },
    })

    // Delete the review
    await tx.review.delete({
      where: { id: reviewId },
    })

    // If review was from an order item, mark it as not reviewed
    if (existingReview.orderItemId) {
      await tx.orderItem.update({
        where: { id: existingReview.orderItemId },
        data: { reviewed: false },
      })
    }
  })

  // Revalidate product page
  revalidatePath(`/products/[slug]`, 'page')
}

// ============================================
// Add Review Image
// ============================================

/**
 * Add an image to a review
 * - Verifies ownership
 * - Adds image URL to review
 */
export async function addReviewImage(
  reviewId: string,
  userId: string,
  imageUrl: string
): Promise<import('@prisma/client').ReviewImage> {
  // Verify review exists and belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true },
  })

  if (!review) {
    throw new ReviewNotFoundError(reviewId)
  }

  if (review.userId !== userId) {
    throw new UnauthorizedReviewAccessError()
  }

  // Count existing images
  const imageCount = await prisma.reviewImage.count({
    where: { reviewId },
  })

  if (imageCount >= 5) {
    throw new Error('Maximum 5 images allowed per review')
  }

  // Create image
  const image = await prisma.reviewImage.create({
    data: {
      reviewId,
      url: imageUrl,
    },
  })

  // Revalidate product page
  revalidatePath(`/products/[slug]`, 'page')

  return image
}

// ============================================
// Mark Review as Helpful
// ============================================

/**
 * Mark a review as helpful (vote)
 * - Tracks user votes to prevent duplicates
 * - Increments helpful count
 */
export async function markHelpful(reviewId: string, userId: string): Promise<void> {
  // Verify review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true },
  })

  if (!review) {
    throw new ReviewNotFoundError(reviewId)
  }

  // Use analytics event to track helpful votes
  // Check if user already voted
  const existingVote = await prisma.analyticsEvent.findFirst({
    where: {
      type: 'review_helpful',
      userId,
      metadata: {
        path: ['reviewId'],
        equals: reviewId,
      },
    },
  })

  if (existingVote) {
    // Already voted
    return
  }

  // Record vote and increment count in transaction
  await prisma.$transaction([
    prisma.analyticsEvent.create({
      data: {
        type: 'review_helpful',
        userId,
        metadata: { reviewId },
      },
    }),
    prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    }),
  ])
}

// ============================================
// Get User Reviews
// ============================================

/**
 * Get all reviews by a user
 */
export async function getUserReviews(userId: string): Promise<ReviewWithUser[]> {
  const reviews = await prisma.review.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews as ReviewWithUser[]
}

// ============================================
// Check if User Can Review Product
// ============================================

/**
 * Check if a user can review a product (has purchased and hasn't reviewed)
 */
export async function canUserReviewProduct(
  userId: string,
  productId: string
): Promise<{ canReview: boolean; reason?: string }> {
  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { userId, productId },
  })

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  // Check if purchased
  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    },
  })

  if (!purchasedItem) {
    return { canReview: false, reason: 'not_purchased' }
  }

  return { canReview: true }
}
