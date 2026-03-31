'use server'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

// ============================================
// Types
// ============================================

export type TrendingProduct = {
  productId: string
  score: number
  views: number
  purchases: number
  revenue: number
  growthRate: number
}

// ============================================
// Trending Products Algorithm
// ============================================

/**
 * Calculate trending products based on multiple signals:
 * - Recent views (from analytics)
 * - Recent purchases
 * - Revenue generated
 * - Growth rate (comparing current period vs previous period)
 * - Recency weight (more recent = higher weight)
 */
export async function getTrendingProducts(
  limit: number = 20,
  days: number = 7,
): Promise<TrendingProduct[]> {
  const cacheKey = `trending:${limit}:${days}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const now = new Date()
  const currentPeriodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - days * 24 * 60 * 60 * 1000)

  // Get analytics data for current period
  const [currentViews, currentPurchases, previousPurchases] = await Promise.all([
    // Current period views
    prisma.analyticsEvent.groupBy({
      by: ['productId'],
      where: {
        type: 'product_view',
        productId: { not: null },
        createdAt: { gte: currentPeriodStart },
      },
      _count: { productId: true },
    }),

    // Current period purchases
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: currentPeriodStart },
          status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        },
      },
      _count: { productId: true },
      _sum: { total: true },
    }),

    // Previous period purchases (for growth calculation)
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: previousPeriodStart,
            lt: currentPeriodStart,
          },
          status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        },
      },
      _count: { productId: true },
    }),
  ])

  // Build maps for quick lookup
  const viewsMap = new Map(currentViews.map((v) => [v.productId!, v._count.productId]))
  const purchasesMap = new Map(currentPurchases.map((p) => [p.productId, p._count.productId]))
  const revenueMap = new Map(currentPurchases.map((p) => [p.productId, p._sum.total || 0]))
  const previousPurchasesMap = new Map(
    previousPurchases.map((p) => [p.productId, p._count.productId]),
  )

  // Get all unique product IDs
  const allProductIds = new Set([...viewsMap.keys(), ...purchasesMap.keys()])

  // Calculate trending scores
  const trendingScores: TrendingProduct[] = []

  for (const productId of allProductIds) {
    const views = viewsMap.get(productId) || 0
    const purchases = purchasesMap.get(productId) || 0
    const revenue = revenueMap.get(productId) || 0
    const previousPurchaseCount = previousPurchasesMap.get(productId) || 0

    // Calculate growth rate
    const growthRate =
      previousPurchaseCount > 0
        ? ((purchases - previousPurchaseCount) / previousPurchaseCount) * 100
        : purchases > 0
          ? 100
          : 0

    // Calculate trending score with weighted components:
    // - Views: 20%
    // - Purchases: 40%
    // - Revenue: 30%
    // - Growth rate: 10%
    const viewScore = Math.min(views / 100, 1) * 20
    const purchaseScore = Math.min(purchases / 50, 1) * 40
    const revenueScore = Math.min(revenue / 100000, 1) * 30 // Normalize to $1000
    const growthScore = Math.min(Math.max(growthRate / 100, 0), 1) * 10

    const score = viewScore + purchaseScore + revenueScore + growthScore

    trendingScores.push({
      productId,
      score: Math.round(score * 100) / 100,
      views,
      purchases,
      revenue,
      growthRate: Math.round(growthRate * 100) / 100,
    })
  }

  // Sort by score and return top N
  const trending = trendingScores.sort((a, b) => b.score - a.score).slice(0, limit)

  // Cache for 30 minutes
  await redis.set(cacheKey, JSON.stringify(trending), { EX: 1800 })

  return trending
}

/**
 * Get trending products by category
 */
export async function getTrendingByCategory(
  categoryId: string,
  limit: number = 10,
  days: number = 7,
): Promise<TrendingProduct[]> {
  const cacheKey = `trending:cat:${categoryId}:${limit}:${days}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Get products in category
  const categoryProducts = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
    },
    select: { id: true },
  })

  const productIds = categoryProducts.map((p) => p.id)

  if (productIds.length === 0) {
    return []
  }

  // Get all trending products
  const allTrending = await getTrendingProducts(100, days)

  // Filter by category
  const categoryTrending = allTrending
    .filter((t) => productIds.includes(t.productId))
    .slice(0, limit)

  await redis.set(cacheKey, JSON.stringify(categoryTrending), { EX: 1800 })

  return categoryTrending
}

/**
 * Get hot deals (trending + on sale)
 */
export async function getHotDeals(
  limit: number = 10,
  days: number = 7,
): Promise<TrendingProduct[]> {
  const cacheKey = `hot-deals:${limit}:${days}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Get trending products
  const trending = await getTrendingProducts(limit * 3, days)

  // Filter products that are on sale (have compareAtPrice)
  const productsOnSale = await prisma.product.findMany({
    where: {
      id: { in: trending.map((t) => t.productId) },
      compareAtPrice: { not: null },
      isActive: true,
    },
    select: {
      id: true,
      price: true,
      compareAtPrice: true,
    },
  })

  const onSaleIds = new Set(productsOnSale.map((p) => p.id))

  // Calculate discount percentage and boost score
  const discountMap = new Map(
    productsOnSale.map((p) => {
      const discount = p.compareAtPrice
        ? ((p.compareAtPrice - p.price) / p.compareAtPrice) * 100
        : 0
      return [p.id, discount]
    }),
  )

  // Filter and boost scores for products on sale
  const hotDeals = trending
    .filter((t) => onSaleIds.has(t.productId))
    .map((t) => {
      const discount = discountMap.get(t.productId) || 0
      // Boost score by discount percentage (up to 50% boost)
      const boostedScore = t.score * (1 + Math.min(discount / 100, 0.5))
      return {
        ...t,
        score: Math.round(boostedScore * 100) / 100,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  await redis.set(cacheKey, JSON.stringify(hotDeals), { EX: 1800 })

  return hotDeals
}

/**
 * Get new and trending (recently added products that are gaining traction)
 */
export async function getNewAndTrending(
  limit: number = 10,
  newDays: number = 30,
  trendingDays: number = 7,
): Promise<TrendingProduct[]> {
  const cacheKey = `new-trending:${limit}:${newDays}:${trendingDays}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const newProductsDate = new Date()
  newProductsDate.setDate(newProductsDate.getDate() - newDays)

  // Get recently added products
  const newProducts = await prisma.product.findMany({
    where: {
      createdAt: { gte: newProductsDate },
      isActive: true,
    },
    select: { id: true },
  })

  const newProductIds = new Set(newProducts.map((p) => p.id))

  // Get trending products
  const trending = await getTrendingProducts(limit * 3, trendingDays)

  // Filter for new products only
  const newAndTrending = trending.filter((t) => newProductIds.has(t.productId)).slice(0, limit)

  await redis.set(cacheKey, JSON.stringify(newAndTrending), { EX: 1800 })

  return newAndTrending
}

/**
 * Get rising stars (products with highest growth rate)
 */
export async function getRisingStars(
  limit: number = 10,
  days: number = 7,
): Promise<TrendingProduct[]> {
  const trending = await getTrendingProducts(limit * 2, days)

  // Sort by growth rate instead of overall score
  return trending
    .filter((t) => t.growthRate > 0)
    .sort((a, b) => b.growthRate - a.growthRate)
    .slice(0, limit)
}
