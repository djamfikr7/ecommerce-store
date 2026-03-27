'use server'

import { prisma } from '@/lib/prisma'
import type { Product } from '@prisma/client'

// ============================================
// Product Type with Relations
// ============================================

type ProductWithDetails = {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  stockQuantity: number
  category: {
    id: string
    name: string
    slug: string
  } | null
  images: {
    id: string
    url: string
    alt: string | null
  }[]
  reviewCount: number
  averageRating: number | null
}

// ============================================
// Helper: Format Product
// ============================================

function formatProduct(product: {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  stockQuantity: number
  category: { id: string; name: string; slug: string } | null
  images: { id: string; url: string; alt: string | null }[]
  reviews: { rating: number }[]
}): ProductWithDetails {
  const reviewCount = product.reviews.length
  const averageRating = reviewCount > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : null

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stockQuantity: product.stockQuantity,
    category: product.category,
    images: product.images,
    reviewCount,
    averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null,
  }
}

// ============================================
// Get Recommendations For User (Collaborative Filtering)
// ============================================

/**
 * Get personalized product recommendations for a user
 * Uses collaborative filtering: "users who bought X also bought Y"
 *
 * Cold start handling: Returns trending products if user has no purchase history
 */
export async function getRecommendationsForUser(
  userId: string,
  limit: number = 10
): Promise<ProductWithDetails[]> {
  // Get user's purchased products
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
    userOrders.flatMap((order) => order.items.map((item) => item.productId))
  )

  // Cold start: user has no purchases, return trending
  if (purchasedProductIds.size === 0) {
    return getTrendingProducts(limit)
  }

  // Find other users who purchased the same products
  const otherUserOrders = await prisma.order.findMany({
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

  // Count co-occurrence (products bought together)
  const coOccurrence: Map<string, number> = new Map()

  for (const order of otherUserOrders) {
    const orderProducts = order.items.map((item) => item.productId)

    for (const productId of orderProducts) {
      if (!purchasedProductIds.has(productId)) {
        coOccurrence.set(productId, (coOccurrence.get(productId) || 0) + 1)
      }
    }
  }

  // Sort by co-occurrence frequency
  const sortedProductIds = Array.from(coOccurrence.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  // If not enough recommendations, fill with trending
  if (sortedProductIds.length < limit) {
    const trending = await getTrendingProducts(limit - sortedProductIds.length)
    sortedProductIds.push(...trending.map((p) => p.id).filter((id) => !purchasedProductIds.has(id)))
  }

  // Fetch product details
  const products = await prisma.product.findMany({
    where: {
      id: { in: sortedProductIds },
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  })

  // Sort by the same order as sortedProductIds
  const productMap = new Map(products.map((p) => [p.id, p]))
  const orderedProducts = sortedProductIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  return orderedProducts.map(formatProduct)
}

// ============================================
// Get Recommendations For Product
// ============================================

/**
 * Get recommendations for a specific product
 * - Frequently bought together (from same orders)
 * - Related products (same category)
 */
export async function getRecommendationsForProduct(
  productId: string,
  limit: number = 10
): Promise<ProductWithDetails[]> {
  // Get the product's category
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  })

  if (!product) {
    return []
  }

  // Get products frequently bought together
  const boughtTogether = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        items: {
          some: { productId },
        },
      },
      productId: { not: productId },
    },
    select: {
      productId: true,
      order: { select: { id: true } },
    },
  })

  // Count co-occurrence from same orders
  const coOccurrence: Map<string, number> = new Map()
  const orderIds = new Set(boughtTogether.map((item) => item.order.id))

  for (const orderId of orderIds) {
    const orderProducts = await prisma.orderItem.findMany({
      where: {
        orderId,
        productId: { not: productId },
      },
      select: { productId: true },
    })

    for (const item of orderProducts) {
      coOccurrence.set(item.productId, (coOccurrence.get(item.productId) || 0) + 1)
    }
  }

  // Get products from same category
  let categoryProducts: string[] = []
  if (product.categoryId) {
    const categoryItems = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      select: { id: true },
      take: limit,
    })
    categoryProducts = categoryItems.map((p) => p.id)
  }

  // Combine and prioritize frequently bought together
  const allProductIds = [
    ...Array.from(coOccurrence.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.ceil(limit * 0.6))
      .map(([id]) => id),
    ...categoryProducts.filter((id) => !coOccurrence.has(id)).slice(0, Math.ceil(limit * 0.4)),
  ]

  // Fetch product details
  const products = await prisma.product.findMany({
    where: {
      id: { in: allProductIds },
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  })

  // Sort by the same order as allProductIds
  const productMap = new Map(products.map((p) => [p.id, p]))
  const orderedProducts = allProductIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .slice(0, limit)

  return orderedProducts.map(formatProduct)
}

// ============================================
// Get Trending Products
// ============================================

/**
 * Get products with the most orders in the last N days
 */
export async function getTrendingProducts(
  limit: number = 10,
  days: number = 30
): Promise<ProductWithDetails[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get products with most orders
  const trendingProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        createdAt: { gte: startDate },
        status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
      },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: 'desc' } },
    take: limit,
  })

  const productIds = trendingProducts.map((p) => p.productId)

  // If not enough trending, add recently added products
  if (productIds.length < limit) {
    const recentProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: productIds },
      },
      orderBy: { createdAt: 'desc' },
      take: limit - productIds.length,
      select: { id: true },
    })
    productIds.push(...recentProducts.map((p) => p.id))
  }

  // Fetch product details
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  })

  // Sort by trending order
  const productMap = new Map(products.map((p) => [p.id, p]))
  const orderedProducts = productIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  // Add order count to each product
  const orderCountMap = new Map(trendingProducts.map((p) => [p.productId, p._count.productId]))

  return orderedProducts.map((p) => ({
    ...formatProduct(p),
    orderCount: orderCountMap.get(p.id) || 0,
  })) as ProductWithDetails[]
}

// ============================================
// Get Recently Viewed Products
// ============================================

/**
 * Get products recently viewed by a user
 */
export async function getRecentlyViewedProducts(
  userId: string,
  limit: number = 10
): Promise<ProductWithDetails[]> {
  // Get distinct product IDs from analytics events
  const viewEvents = await prisma.analyticsEvent.findMany({
    where: {
      type: 'product_view',
      userId,
      productId: { not: null },
    },
    select: {
      productId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get distinct product IDs, most recent first
  const seen = new Set<string>()
  const productIds: string[] = []

  for (const event of viewEvents) {
    if (event.productId && !seen.has(event.productId)) {
      seen.add(event.productId)
      productIds.push(event.productId)
      if (productIds.length >= limit) break
    }
  }

  if (productIds.length === 0) {
    return []
  }

  // Fetch product details
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
        },
      },
      reviews: {
        select: { rating: true },
      },
    },
  })

  // Sort by the same order as productIds
  const productMap = new Map(products.map((p) => [p.id, p]))
  const orderedProducts = productIds
    .map((id) => productMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  return orderedProducts.map(formatProduct)
}

// ============================================
// Get Personalized Homepage Recommendations
// ============================================

/**
 * Get a mix of recommendations for the homepage
 * - Trending products
 * - New arrivals
 * - Personalized if user is logged in
 */
export async function getHomepageRecommendations(
  userId?: string,
  limit: number = 20
): Promise<{
  trending: ProductWithDetails[]
  personalized: ProductWithDetails[]
  newArrivals: ProductWithDetails[]
}> {
  const halfLimit = Math.floor(limit / 2)

  // Get trending and new arrivals in parallel
  const [trending, newArrivals] = await Promise.all([
    getTrendingProducts(halfLimit),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: halfLimit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    }).then((products) => products.map(formatProduct)),
  ])

  // Get personalized recommendations if user is logged in
  let personalized: ProductWithDetails[] = []
  if (userId) {
    personalized = await getRecommendationsForUser(userId, halfLimit)
  }

  return {
    trending,
    personalized,
    newArrivals,
  }
}
