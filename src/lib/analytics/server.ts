// Server-side analytics operations
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import {
  AnalyticsEvent,
  AnalyticsEventData,
  AnalyticsDashboard,
  AnalyticsPeriod,
  TrafficSource,
  ConversionFunnel,
} from '@/types/analytics'

// Deduplicate events based on eventId
async function deduplicateEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.analyticsEvent.findUnique({
    where: { eventId },
  })
  return !!existing
}

export async function recordEvent(data: AnalyticsEventData): Promise<AnalyticsEvent | null> {
  // Check for duplicate
  if (data.eventId && await deduplicateEvent(data.eventId)) {
    return null
  }

  const event = await prisma.analyticsEvent.create({
    data: {
      eventId: data.eventId || uuidv4(),
      type: data.type,
      userId: data.userId,
      sessionId: data.sessionId,
      productId: data.productId,
      orderId: data.orderId,
      metadata: data.metadata as Record<string, unknown>,
    },
  })

  return {
    id: event.id,
    eventId: event.eventId,
    type: event.type,
    userId: event.userId,
    sessionId: event.sessionId,
    productId: event.productId,
    orderId: event.orderId,
    metadata: event.metadata as Record<string, unknown>,
    timestamp: event.createdAt,
  }
}

export async function trackPageView(
  page: string,
  userId?: string,
  sessionId?: string
): Promise<void> {
  // Create or find session
  let session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId } })
    : null

  if (!session && userId) {
    session = await prisma.session.create({
      data: { userId },
    })
  }

  await recordEvent({
    type: 'page_view',
    userId,
    sessionId: session?.id,
    metadata: { page, referrer: '' },
  })
}

export async function trackProductView(
  productId: string,
  userId?: string
): Promise<void> {
  // Record product view
  await recordEvent({
    type: 'product_view',
    userId,
    productId,
    metadata: { timestamp: Date.now() },
  })

  // Update recently viewed if user is logged in
  if (userId) {
    const recentViews = await prisma.recentlyViewed.findFirst({
      where: { userId },
    })

    if (recentViews) {
      const views = recentViews.productIds as string[]
      const updatedViews = [productId, ...views.filter(id => id !== productId)].slice(0, 20)
      await prisma.recentlyViewed.update({
        where: { id: recentViews.id },
        data: { productIds: updatedViews },
      })
    } else {
      await prisma.recentlyViewed.create({
        data: {
          userId,
          productIds: [productId],
        },
      })
    }
  }
}

export async function trackSearch(
  query: string,
  resultsCount: number,
  userId?: string
): Promise<void> {
  await recordEvent({
    type: 'search',
    userId,
    metadata: { query, resultsCount },
  })
}

export async function trackAddToCart(
  productId: string,
  quantity: number,
  userId?: string
): Promise<void> {
  await recordEvent({
    type: 'add_to_cart',
    userId,
    productId,
    metadata: { quantity },
  })
}

export async function trackCheckout(
  step: string,
  userId?: string
): Promise<void> {
  await recordEvent({
    type: 'checkout_step',
    userId,
    metadata: { step },
  })
}

export async function trackPurchase(
  orderId: string,
  revenue: number,
  userId?: string
): Promise<void> {
  await recordEvent({
    type: 'purchase',
    userId,
    orderId,
    metadata: { revenue, currency: 'USD' },
  })
}

export async function trackAffiliateClick(
  affiliateId: string,
  productId?: string
): Promise<void> {
  await recordEvent({
    type: 'affiliate_click',
    productId,
    metadata: { affiliateId },
  })
}

function getDateFromPeriod(period: AnalyticsPeriod): Date {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export async function getAnalyticsDashboard(
  period: AnalyticsPeriod = '30d'
): Promise<AnalyticsDashboard> {
  const startDate = getDateFromPeriod(period)

  // Get all events in period
  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Calculate unique visitors
  const uniqueVisitors = new Set(events.filter(e => e.userId).map(e => e.userId)).size
  const pageViews = events.filter(e => e.type === 'page_view').length

  // Calculate conversion rate (purchases / unique visitors)
  const purchases = events.filter(e => e.type === 'purchase').length
  const conversionRate = uniqueVisitors > 0 ? purchases / uniqueVisitors : 0

  // Calculate revenue
  const totalRevenue = events
    .filter(e => e.type === 'purchase')
    .reduce((sum, e) => {
      const revenue = (e.metadata as Record<string, unknown>)?.revenue as number
      return sum + (revenue || 0)
    }, 0)

  // Top products
  const productViews = events.filter(e => e.type === 'product_view')
  const productViewCounts = productViews.reduce((acc, e) => {
    if (e.productId) {
      acc[e.productId] = (acc[e.productId] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  const topProducts = Object.entries(productViewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, views]) => ({ productId, views }))

  // Traffic sources (from referrer metadata)
  const trafficSources: TrafficSource[] = []
  // Group by simple source categorization
  const sources = events.reduce((acc, e) => {
    const referrer = (e.metadata as Record<string, unknown>)?.referrer as string || 'direct'
    const source = referrer.includes('google') ? 'Organic Search' :
                   referrer.includes('facebook') ? 'Social' :
                   referrer.includes('twitter') ? 'Social' :
                   referrer.includes('instagram') ? 'Social' :
                   referrer.includes('tiktok') ? 'Social' :
                   referrer.includes('linkedin') ? 'Social' :
                   referrer === '' ? 'Direct' : 'Other'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  for (const [source, visits] of Object.entries(sources)) {
    trafficSources.push({ source, visits, percentage: visits / pageViews * 100 })
  }

  // Conversion funnel
  const addToCart = events.filter(e => e.type === 'add_to_cart').length
  const checkoutStarted = events.filter(e => e.type === 'checkout_step').length
  const conversionFunnel: ConversionFunnel = {
    visitors: uniqueVisitors,
    productViews,
    addToCart,
    checkoutStarted,
    purchases,
    abandonmentRate: addToCart > 0 ? (addToCart - purchases) / addToCart * 100 : 0,
  }

  // Daily breakdown
  const dailyData = events.reduce((acc, e) => {
    const date = e.createdAt.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, pageViews: 0, uniqueVisitors: 0, revenue: 0 }
    }
    if (e.type === 'page_view') acc[date].pageViews++
    if (e.type === 'purchase') {
      acc[date].revenue += ((e.metadata as Record<string, unknown>)?.revenue as number) || 0
    }
    return acc
  }, {} as Record<string, { date: string; pageViews: number; uniqueVisitors: number; revenue: number }>)

  // Get unique visitors per day (simplified - count userIds per day)
  for (const event of events.filter(e => e.userId && e.type === 'page_view')) {
    const date = event.createdAt.toISOString().split('T')[0]
    if (dailyData[date]) {
      dailyData[date].uniqueVisitors++
    }
  }

  return {
    period,
    startDate,
    endDate: new Date(),
    summary: {
      totalRevenue,
      totalOrders: purchases,
      totalVisitors: uniqueVisitors,
      pageViews,
      conversionRate,
      averageOrderValue: purchases > 0 ? totalRevenue / purchases : 0,
    },
    topProducts,
    trafficSources,
    conversionFunnel,
    dailyData: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
  }
}
