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
// Collaborative Filtering Engine
// ============================================

/**
 * User-based collaborative filtering
 * "Users who bought X also bought Y"
 */
export async function getCollaborativeRecommendations(
  userId: string,
  limit: number = 10,
): Promise<RecommendationScore[]> {
  const cacheKey = `collab:${userId}:${limit}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Get user's purchase history
  const userOrders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
    },
    include: {
      items: {
        select: { productId: true },
      },
    },
  })

  const purchasedProductIds = new Set(
    userOrders.flatMap((order) => order.items.map((item) => item.productId)),
  )

  // Cold start: no purchase history
  if (purchasedProductIds.size === 0) {
    return []
  }

  // Find similar users (users who bought the same products)
  const similarUserOrders = await prisma.order.findMany({
    where: {
      userId: { not: userId },
      status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      items: {
        some: {
          productId: { in: Array.from(purchasedProductIds) },
        },
      },
    },
    include: {
      items: {
        select: { productId: true },
      },
    },
  })

  // Calculate co-occurrence scores
  const scores = new Map<string, number>()

  for (const order of similarUserOrders) {
    const orderProducts = order.items.map((item) => item.productId)

    for (const productId of orderProducts) {
      // Don't recommend already purchased products
      if (!purchasedProductIds.has(productId)) {
        scores.set(productId, (scores.get(productId) || 0) + 1)
      }
    }
  }

  // Sort by score and return top N
  const recommendations = Array.from(scores.entries())
    .map(([productId, score]) => ({ productId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Cache for 1 hour
  await redis.set(cacheKey, JSON.stringify(recommendations), { EX: 3600 })

  return recommendations
}

/**
 * Item-based collaborative filtering
 * "Products frequently bought together"
 */
export async function getFrequentlyBoughtTogether(
  productId: string,
  limit: number = 5,
): Promise<RecommendationScore[]> {
  const cacheKey = `fbt:${productId}:${limit}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Get orders containing this product
  const ordersWithProduct = await prisma.order.findMany({
    where: {
      status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      items: {
        some: { productId },
      },
    },
    include: {
      items: {
        select: { productId: true },
      },
    },
  })

  // Count co-occurrence
  const scores = new Map<string, number>()

  for (const order of ordersWithProduct) {
    for (const item of order.items) {
      if (item.productId !== productId) {
        scores.set(item.productId, (scores.get(item.productId) || 0) + 1)
      }
    }
  }

  // Sort by frequency
  const recommendations = Array.from(scores.entries())
    .map(([productId, score]) => ({ productId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Cache for 6 hours
  await redis.set(cacheKey, JSON.stringify(recommendations), { EX: 21600 })

  return recommendations
}

/**
 * Calculate user similarity using Jaccard similarity
 */
export async function calculateUserSimilarity(userId1: string, userId2: string): Promise<number> {
  const [user1Orders, user2Orders] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: userId1,
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
      include: { items: { select: { productId: true } } },
    }),
    prisma.order.findMany({
      where: {
        userId: userId2,
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
      include: { items: { select: { productId: true } } },
    }),
  ])

  const user1Products = new Set(user1Orders.flatMap((o) => o.items.map((i) => i.productId)))
  const user2Products = new Set(user2Orders.flatMap((o) => o.items.map((i) => i.productId)))

  // Jaccard similarity: intersection / union
  const intersection = new Set([...user1Products].filter((p) => user2Products.has(p)))
  const union = new Set([...user1Products, ...user2Products])

  return union.size === 0 ? 0 : intersection.size / union.size
}
