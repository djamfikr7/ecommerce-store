'use server'

import { prisma } from '@/lib/prisma'
import type {
  AnalyticsEvent,
  AnalyticsQueryParams,
  TrackEventInput,
  ProductAnalytics,
  RevenueAnalytics,
} from '@/types/admin'
import { revalidatePath } from 'next/cache'

/**
 * Get analytics events with filtering
 */
export async function getAnalyticsEvents(
  params: AnalyticsQueryParams
): Promise<{ events: AnalyticsEvent[]; total: number }> {
  const {
    type,
    dateFrom,
    dateTo,
    userId,
    sessionId,
    page = 1,
    pageSize = 50,
  } = params

  const skip = (page - 1) * pageSize

  // Build where clause
  const where: Parameters<typeof prisma.analyticsEvent.findMany>[0]['where'] = {}

  if (type) {
    where.type = type
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo)
    }
  }

  if (userId) {
    where.userId = userId
  }

  if (sessionId) {
    where.sessionId = sessionId
  }

  const [events, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.analyticsEvent.count({ where }),
  ])

  return { events, total }
}

/**
 * Track an analytics event
 */
export async function trackEvent(data: TrackEventInput): Promise<AnalyticsEvent> {
  const event = await prisma.analyticsEvent.create({
    data: {
      type: data.type,
      userId: data.userId,
      sessionId: data.sessionId,
      productId: data.productId,
      orderId: data.orderId,
      variantId: data.variantId,
      categoryId: data.categoryId,
      cartValue: data.cartValue,
      currency: data.currency,
      metadata: data.metadata as object,
    },
  })

  return event
}

/**
 * Get product analytics
 */
export async function getProductAnalytics(productId: string): Promise<ProductAnalytics> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get product
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // Get analytics events
  const events = await prisma.analyticsEvent.groupBy({
    by: ['type'],
    where: {
      productId,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { type: true },
  })

  // Get views per day for chart
  const viewEvents = await prisma.analyticsEvent.findMany({
    where: {
      productId,
      type: 'VIEW_PRODUCT',
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Calculate daily views
  const dailyViewsMap = new Map<string, number>()
  for (const event of viewEvents) {
    const dateKey = event.createdAt.toISOString().slice(0, 10)
    dailyViewsMap.set(dateKey, (dailyViewsMap.get(dateKey) || 0) + 1)
  }

  // Fill in missing days
  const dailyViews: { date: string; views: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    dailyViews.push({
      date: dateStr,
      views: dailyViewsMap.get(dateStr) || 0,
    })
  }

  // Get purchase data
  const orderItems = await prisma.orderItem.aggregate({
    where: {
      productId,
      order: {
        createdAt: { gte: thirtyDaysAgo },
        paymentStatus: 'SUCCEEDED',
      },
    },
    _count: true,
    _sum: { total: true },
  })

  // Get add to cart count
  const addToCartEvents = events.find((e) => e.type === 'ADD_TO_CART')

  // Calculate conversion rate
  const views = events.find((e) => e.type === 'VIEW_PRODUCT')?._count.type || 0
  const purchases = orderItems._count || 0
  const conversionRate = views > 0 ? Math.round((purchases / views) * 10000) / 100 : 0

  return {
    productId,
    productName: product.name,
    views,
    addToCartCount: addToCartEvents?._count.type || 0,
    purchaseCount: purchases,
    conversionRate,
    revenue: orderItems._sum.total || 0,
    dailyViews,
  }
}

/**
 * Get revenue analytics
 */
export async function getRevenueAnalytics(params: {
  startDate: string
  endDate: string
}): Promise<RevenueAnalytics> {
  const start = new Date(params.startDate)
  const end = new Date(params.endDate)

  // Get completed orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      paymentStatus: 'SUCCEEDED',
    },
    include: {
      items: {
        select: {
          productId: true,
          productName: true,
          quantity: true,
          total: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Calculate daily revenue
  const dailyRevenueMap = new Map<string, { revenue: number; orderCount: number }>()

  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().slice(0, 10)
    const existing = dailyRevenueMap.get(dateKey)
    if (existing) {
      existing.revenue += order.total
      existing.orderCount += 1
    } else {
      dailyRevenueMap.set(dateKey, { revenue: order.total, orderCount: 1 })
    }
  }

  // Fill in missing days
  const revenueByDay: { date: string; revenue: number; orderCount: number }[] = []
  const startDate = new Date(start)
  while (startDate <= end) {
    const dateStr = startDate.toISOString().slice(0, 10)
    const data = dailyRevenueMap.get(dateStr) || { revenue: 0, orderCount: 0 }
    revenueByDay.push({ date: dateStr, ...data })
    startDate.setDate(startDate.getDate() + 1)
  }

  // Calculate average order value
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(revenueByDay.length / 2)
  const firstHalf = revenueByDay.slice(0, midpoint)
  const secondHalf = revenueByDay.slice(midpoint)

  const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / (firstHalf.length || 1)
  const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / (secondHalf.length || 1)
  const avgOrderValueTrend = firstHalfAvg > 0 ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0

  // Get top products by revenue
  const productRevenueMap = new Map<string, { name: string; revenue: number; quantity: number }>()

  for (const order of orders) {
    for (const item of order.items) {
      const existing = productRevenueMap.get(item.productId)
      if (existing) {
        existing.revenue += item.total
        existing.quantity += item.quantity
      } else {
        productRevenueMap.set(item.productId, {
          name: item.productName,
          revenue: item.total,
          quantity: item.quantity,
        })
      }
    }
  }

  const topProducts = Array.from(productRevenueMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  return {
    dateRange: {
      startDate: params.startDate,
      endDate: params.endDate,
    },
    revenueByDay,
    avgOrderValue,
    avgOrderValueTrend,
    topProducts,
  }
}

/**
 * Create or reuse a session for analytics
 */
export async function getOrCreateSession(sessionId?: string): Promise<string> {
  if (sessionId) {
    return sessionId
  }

  // Generate new session ID
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return newSessionId
}
