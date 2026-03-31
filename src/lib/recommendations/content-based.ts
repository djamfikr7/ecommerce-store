'use server'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

// ============================================
// Types
// ============================================

export type RecommendationScore = {
  productId: string
  score: number
}

// ============================================
// Content-Based Filtering Engine
// ============================================

/**
 * Content-based recommendations using product attributes
 * Recommends products similar to a given product based on:
 * - Category
 * - Price range
 * - Tags
 * - Ratings
 */
export async function getContentBasedRecommendations(
  productId: string,
  limit: number = 10,
): Promise<RecommendationScore[]> {
  const cacheKey = `content:${productId}:${limit}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Get the source product with all attributes
  const sourceProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      tags: true,
      reviews: {
        select: { rating: true },
      },
    },
  })

  if (!sourceProduct) {
    return []
  }

  // Calculate average rating
  const sourceRating =
    sourceProduct.reviews.length > 0
      ? sourceProduct.reviews.reduce((sum, r) => sum + r.rating, 0) / sourceProduct.reviews.length
      : 0

  // Get candidate products from same category
  const candidates = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      categoryId: sourceProduct.categoryId || undefined,
    },
    include: {
      category: true,
      tags: true,
      reviews: {
        select: { rating: true },
      },
    },
    take: 100, // Get more candidates for better filtering
  })

  // Calculate similarity scores
  const scores: RecommendationScore[] = candidates.map((candidate) => {
    let score = 0

    // Category match (40% weight)
    if (candidate.categoryId === sourceProduct.categoryId) {
      score += 40
    }

    // Price similarity (30% weight)
    const priceDiff = Math.abs(candidate.price - sourceProduct.price)
    const priceRange = sourceProduct.price * 0.5 // 50% range
    const priceSimilarity = Math.max(0, 1 - priceDiff / priceRange)
    score += priceSimilarity * 30

    // Tag overlap (20% weight)
    const sourceTags = new Set(sourceProduct.tags.map((t) => t.id))
    const candidateTags = new Set(candidate.tags.map((t) => t.id))
    const tagIntersection = [...sourceTags].filter((t) => candidateTags.has(t)).length
    const tagUnion = new Set([...sourceTags, ...candidateTags]).size
    const tagSimilarity = tagUnion > 0 ? tagIntersection / tagUnion : 0
    score += tagSimilarity * 20

    // Rating similarity (10% weight)
    const candidateRating =
      candidate.reviews.length > 0
        ? candidate.reviews.reduce((sum, r) => sum + r.rating, 0) / candidate.reviews.length
        : 0
    const ratingDiff = Math.abs(candidateRating - sourceRating)
    const ratingSimilarity = Math.max(0, 1 - ratingDiff / 5)
    score += ratingSimilarity * 10

    return {
      productId: candidate.id,
      score: Math.round(score * 100) / 100,
    }
  })

  // Sort by score and return top N
  const recommendations = scores.sort((a, b) => b.score - a.score).slice(0, limit)

  // Cache for 6 hours
  await redis.set(cacheKey, JSON.stringify(recommendations), { EX: 21600 })

  return recommendations
}

/**
 * Get similar products by category
 */
export async function getSimilarByCategory(
  categoryId: string,
  excludeProductId?: string,
  limit: number = 10,
): Promise<RecommendationScore[]> {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: excludeProductId ? { not: excludeProductId } : undefined,
      isActive: true,
    },
    include: {
      reviews: {
        select: { rating: true },
      },
      orderItems: {
        select: { id: true },
      },
    },
    take: limit * 2,
  })

  // Score by popularity and rating
  const scores: RecommendationScore[] = products.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

    const orderCount = product.orderItems.length

    // Combine rating (60%) and popularity (40%)
    const score = (avgRating / 5) * 60 + Math.min(orderCount / 10, 1) * 40

    return {
      productId: product.id,
      score: Math.round(score * 100) / 100,
    }
  })

  return scores.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Get products with similar price range
 */
export async function getSimilarByPrice(
  price: number,
  excludeProductId?: string,
  limit: number = 10,
  variance: number = 0.3, // 30% variance
): Promise<RecommendationScore[]> {
  const minPrice = Math.floor(price * (1 - variance))
  const maxPrice = Math.ceil(price * (1 + variance))

  const products = await prisma.product.findMany({
    where: {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
      id: excludeProductId ? { not: excludeProductId } : undefined,
      isActive: true,
    },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
    take: limit * 2,
  })

  // Score by price proximity and rating
  const scores: RecommendationScore[] = products.map((product) => {
    const priceDiff = Math.abs(product.price - price)
    const priceScore = Math.max(0, 1 - priceDiff / (price * variance))

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0
    const ratingScore = avgRating / 5

    // Combine price proximity (70%) and rating (30%)
    const score = priceScore * 70 + ratingScore * 30

    return {
      productId: product.id,
      score: Math.round(score * 100) / 100,
    }
  })

  return scores.sort((a, b) => b.score - a.score).slice(0, limit)
}

/**
 * Hybrid recommendation combining multiple content signals
 */
export async function getHybridContentRecommendations(
  productId: string,
  limit: number = 10,
): Promise<RecommendationScore[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      price: true,
      categoryId: true,
    },
  })

  if (!product) {
    return []
  }

  // Get recommendations from multiple sources
  const [contentBased, categoryBased, priceBased] = await Promise.all([
    getContentBasedRecommendations(productId, limit),
    product.categoryId
      ? getSimilarByCategory(product.categoryId, productId, limit)
      : Promise.resolve([]),
    getSimilarByPrice(product.price, productId, limit),
  ])

  // Combine scores with weights
  const combinedScores = new Map<string, number>()

  // Content-based: 50% weight
  for (const rec of contentBased) {
    combinedScores.set(rec.productId, (combinedScores.get(rec.productId) || 0) + rec.score * 0.5)
  }

  // Category-based: 30% weight
  for (const rec of categoryBased) {
    combinedScores.set(rec.productId, (combinedScores.get(rec.productId) || 0) + rec.score * 0.3)
  }

  // Price-based: 20% weight
  for (const rec of priceBased) {
    combinedScores.set(rec.productId, (combinedScores.get(rec.productId) || 0) + rec.score * 0.2)
  }

  // Sort and return top N
  return Array.from(combinedScores.entries())
    .map(([productId, score]) => ({ productId, score: Math.round(score * 100) / 100 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
