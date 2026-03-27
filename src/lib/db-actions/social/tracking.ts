/**
 * Social Tracking Database Actions
 * Track social media shares, clicks, and engagement
 */

import { prisma } from '@/lib/db'

export interface SocialTracking {
  id: string
  platform: string
  productId?: string
  userId?: string
  clickId: string
  referrer?: string
  userAgent?: string
  ip?: string
  createdAt: Date
}

export interface ProductSocialStats {
  productId: string
  totalShares: number
  totalClicks: number
  sharesByPlatform: Record<string, number>
  clicksByPlatform: Record<string, number>
  recentActivity: {
    date: string
    shares: number
    clicks: number
  }[]
  topSharers: {
    platform: string
    count: number
  }[]
}

export type SocialPlatform = 'twitter' | 'facebook' | 'pinterest' | 'linkedin' | 'whatsapp' | 'email' | 'copy'

// In-memory click tracking for rate limiting
const clickTimestamps: Map<string, number[]> = new Map()
const CLICK_WINDOW_MS = 1000 // 1 second
const MAX_CLICKS_PER_WINDOW = 10

/**
 * Check if click should be rate limited
 */
function isRateLimited(identifier: string): boolean {
  const now = Date.now()
  const timestamps = clickTimestamps.get(identifier) || []

  // Filter out old timestamps
  const recentTimestamps = timestamps.filter((ts) => now - ts < CLICK_WINDOW_MS)

  if (recentTimestamps.length >= MAX_CLICKS_PER_WINDOW) {
    return true
  }

  recentTimestamps.push(now)
  clickTimestamps.set(identifier, recentTimestamps)

  // Cleanup old entries periodically
  if (clickTimestamps.size > 10000) {
    const cutoff = now - 60000
    for (const [key, times] of clickTimestamps.entries()) {
      const filtered = times.filter((t) => t > cutoff)
      if (filtered.length === 0) {
        clickTimestamps.delete(key)
      } else {
        clickTimestamps.set(key, filtered)
      }
    }
  }

  return false
}

/**
 * Generate unique click ID
 */
function generateClickId(): string {
  return `sc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Track a social share click
 */
export async function trackSocialClick(
  platform: string,
  productId: string,
  userId?: string,
  request?: Request
): Promise<SocialTracking> {
  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0]
  const userAgent = request?.headers.get('user-agent') || undefined
  const referrer = request?.headers.get('referer') || undefined

  // Rate limit by IP + platform + product
  const rateLimitKey = `${ip}:${platform}:${productId}`
  if (isRateLimited(rateLimitKey)) {
    throw new Error('Rate limit exceeded for clicks')
  }

  const tracking = await prisma.socialTracking.create({
    data: {
      platform,
      productId,
      userId,
      clickId: generateClickId(),
      referrer,
      userAgent,
      ip,
    },
  })

  // Also increment product share count
  await incrementProductShareCount(productId, platform)

  return formatTracking(tracking)
}

/**
 * Increment product share count
 */
async function incrementProductShareCount(productId: string, platform: string): Promise<void> {
  const statKey = `${productId}:${platform}`

  // Upsert share count
  const existing = await prisma.productSocialStats.findUnique({
    where: { productId },
  })

  if (existing) {
    const shareCounts = existing.shareCounts as Record<string, number> || {}
    shareCounts[platform] = (shareCounts[platform] || 0) + 1

    await prisma.productSocialStats.update({
      where: { productId },
      data: {
        totalShares: { increment: 1 },
        shareCounts,
        lastActivityAt: new Date(),
      },
    })
  } else {
    await prisma.productSocialStats.create({
      data: {
        productId,
        totalShares: 1,
        totalClicks: 0,
        shareCounts: { [platform]: 1 },
        clickCounts: {},
        lastActivityAt: new Date(),
      },
    })
  }
}

/**
 * Track a social click
 */
export async function trackSocialClickEvent(
  platform: string,
  productId: string,
  userId?: string,
  request?: Request
): Promise<SocialTracking> {
  const ip = request?.headers.get('x-forwarded-for')?.split(',')[0]
  const userAgent = request?.headers.get('user-agent') || undefined
  const referrer = request?.headers.get('referer') || undefined

  // Rate limit by IP + platform + product
  const rateLimitKey = `click:${ip}:${platform}:${productId}`
  if (isRateLimited(rateLimitKey)) {
    throw new Error('Rate limit exceeded for clicks')
  }

  const tracking = await prisma.socialTracking.create({
    data: {
      platform,
      productId,
      userId,
      clickId: generateClickId(),
      clickType: 'CLICK',
      referrer,
      userAgent,
      ip,
    },
  })

  // Increment click count
  await incrementProductClickCount(productId, platform)

  return formatTracking(tracking)
}

/**
 * Increment product click count
 */
async function incrementProductClickCount(productId: string, platform: string): Promise<void> {
  const existing = await prisma.productSocialStats.findUnique({
    where: { productId },
  })

  if (existing) {
    const clickCounts = existing.clickCounts as Record<string, number> || {}
    clickCounts[platform] = (clickCounts[platform] || 0) + 1

    await prisma.productSocialStats.update({
      where: { productId },
      data: {
        totalClicks: { increment: 1 },
        clickCounts,
        lastActivityAt: new Date(),
      },
    })
  } else {
    await prisma.productSocialStats.create({
      data: {
        productId,
        totalShares: 0,
        totalClicks: 1,
        shareCounts: {},
        clickCounts: { [platform]: 1 },
        lastActivityAt: new Date(),
      },
    })
  }
}

/**
 * Get social stats for a product
 */
export async function getProductSocialStats(productId: string): Promise<ProductSocialStats> {
  const stats = await prisma.productSocialStats.findUnique({
    where: { productId },
  })

  if (!stats) {
    return {
      productId,
      totalShares: 0,
      totalClicks: 0,
      sharesByPlatform: {},
      clicksByPlatform: {},
      recentActivity: [],
      topSharers: [],
    }
  }

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTracking = await prisma.socialTracking.groupBy({
    by: ['platform', 'clickType'],
    where: {
      productId,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  })

  // Aggregate by date
  const dailyActivity = await prisma.$queryRaw<{ date: string; clickType: string; platform: string; count: bigint }[]>`
    SELECT
      DATE(createdAt) as date,
      clickType,
      platform,
      COUNT(*) as count
    FROM SocialTracking
    WHERE productId = ${productId}
      AND createdAt >= ${thirtyDaysAgo}
    GROUP BY DATE(createdAt), clickType, platform
    ORDER BY date DESC
  `

  // Group by date
  const activityByDate: Record<string, { shares: number; clicks: number }> = {}
  for (const row of dailyActivity) {
    const dateStr = row.date.toISOString().split('T')[0]
    if (!activityByDate[dateStr]) {
      activityByDate[dateStr] = { shares: 0, clicks: 0 }
    }
    if (row.clickType === 'SHARE') {
      activityByDate[dateStr].shares += Number(row.count)
    } else if (row.clickType === 'CLICK') {
      activityByDate[dateStr].clicks += Number(row.count)
    }
  }

  const recentActivity = Object.entries(activityByDate)
    .slice(0, 30)
    .map(([date, data]) => ({
      date,
      ...data,
    }))

  // Top sharers
  const shareByPlatform: Record<string, number> = stats.shareCounts as Record<string, number> || {}
  const topSharers = Object.entries(shareByPlatform)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([platform, count]) => ({ platform, count }))

  return {
    productId,
    totalShares: stats.totalShares,
    totalClicks: stats.totalClicks,
    sharesByPlatform: shareByPlatform,
    clicksByPlatform: stats.clickCounts as Record<string, number> || {},
    recentActivity,
    topSharers,
  }
}

/**
 * Get tracking data for analytics
 */
export async function getTrackingAnalytics(
  startDate: Date,
  endDate: Date,
  platform?: string
): Promise<{
  totalShares: number
  totalClicks: number
  byPlatform: Record<string, { shares: number; clicks: number }>
  topProducts: { productId: string; shareCount: number }[]
}> {
  const where: any = {
    createdAt: { gte: startDate, lte: endDate },
  }
  if (platform) where.platform = platform

  const [tracking, topProducts] = await Promise.all([
    prisma.socialTracking.groupBy({
      by: ['platform', 'clickType'],
      where,
      _count: { id: true },
    }),
    prisma.productSocialStats.findMany({
      where: {
        lastActivityAt: { gte: startDate },
      },
      orderBy: { totalShares: 'desc' },
      take: 10,
      select: { productId: true, totalShares: true },
    }),
  ])

  const byPlatform: Record<string, { shares: number; clicks: number }> = {}
  let totalShares = 0
  let totalClicks = 0

  for (const row of tracking) {
    if (!byPlatform[row.platform]) {
      byPlatform[row.platform] = { shares: 0, clicks: 0 }
    }
    if (row.clickType === 'SHARE') {
      byPlatform[row.platform].shares += row._count.id
      totalShares += row._count.id
    } else if (row.clickType === 'CLICK') {
      byPlatform[row.platform].clicks += row._count.id
      totalClicks += row._count.id
    }
  }

  return {
    totalShares,
    totalClicks,
    byPlatform,
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      shareCount: p.totalShares,
    })),
  }
}

/**
 * Format tracking for API response
 */
function formatTracking(tracking: any): SocialTracking {
  return {
    id: tracking.id,
    platform: tracking.platform,
    productId: tracking.productId,
    userId: tracking.userId,
    clickId: tracking.clickId,
    referrer: tracking.referrer,
    userAgent: tracking.userAgent,
    ip: tracking.ip,
    createdAt: tracking.createdAt,
  }
}

export default {
  trackSocialClick,
  trackSocialClickEvent,
  getProductSocialStats,
  getTrackingAnalytics,
}
