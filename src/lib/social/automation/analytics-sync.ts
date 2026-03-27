/**
 * Social Analytics Sync
 * Synchronize post analytics from social platforms
 */

import { prisma } from '@/lib/prisma'
import { SocialPlatform, SocialPostStatus } from '@/types/automation'

interface PostAnalytics {
  likesCount: number
  commentsCount: number
  sharesCount: number
  impressions: number
  reach: number
  clicksCount: number
  engagementRate: number
}

interface CampaignAnalytics {
  campaignId: string
  totalPosts: number
  totalReach: number
  totalImpressions: number
  totalEngagement: number
  engagementRate: number
  topPerformingPost?: string
  postsByPlatform: Record<SocialPlatform, number>
}

interface PlatformAnalyticsResponse {
  postId: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  impressions: number
  reach: number
  clicksCount: number
}

/**
 * Sync analytics for a single post
 */
export async function syncPostAnalytics(
  postId: string,
  accessToken: string
): Promise<PostAnalytics> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      platform: true,
      externalPostId: true,
      status: true,
    },
  })

  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }

  if (post.status !== 'PUBLISHED' || !post.externalPostId) {
    throw new Error('Can only sync analytics for published posts with external IDs')
  }

  // Fetch analytics from the platform
  const analytics = await fetchPlatformAnalytics(
    post.externalPostId,
    post.platform as SocialPlatform,
    accessToken
  )

  // Update the post with new analytics
  const engagementRate = analytics.impressions > 0
    ? ((analytics.likesCount + analytics.commentsCount + analytics.sharesCount) / analytics.impressions) * 100
    : 0

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      likesCount: analytics.likesCount,
      commentsCount: analytics.commentsCount,
      sharesCount: analytics.sharesCount,
      impressions: analytics.impressions,
      reach: analytics.reach,
      clicksCount: analytics.clicksCount,
      engagementRate: Math.min(100, engagementRate), // Cap at 100%
    },
  })

  return {
    ...analytics,
    engagementRate,
  }
}

/**
 * Fetch analytics from social platform API
 */
async function fetchPlatformAnalytics(
  externalPostId: string,
  platform: SocialPlatform,
  accessToken: string
): Promise<PlatformAnalyticsResponse> {
  try {
    switch (platform) {
      case 'TWITTER':
        return await fetchTwitterAnalytics(externalPostId, accessToken)
      case 'FACEBOOK':
        return await fetchFacebookAnalytics(externalPostId, accessToken)
      case 'INSTAGRAM':
        return await fetchInstagramAnalytics(externalPostId, accessToken)
      case 'LINKEDIN':
        return await fetchLinkedInAnalytics(externalPostId, accessToken)
      default:
        return getDefaultAnalytics()
    }
  } catch (error) {
    console.error(`Failed to fetch analytics from ${platform}:`, error)
    return getDefaultAnalytics()
  }
}

/**
 * Fetch Twitter analytics using Twitter API v2
 */
async function fetchTwitterAnalytics(
  tweetId: string,
  accessToken: string
): Promise<PlatformAnalyticsResponse> {
  const response = await fetch(
    `https://api.twitter.com/2/tweets?ids=${tweetId}&tweet.fields=public_metrics,created_at`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status}`)
  }

  const data = await response.json()
  const tweet = data.data?.[0]

  if (!tweet) {
    return getDefaultAnalytics()
  }

  const metrics = tweet.public_metrics || {}

  return {
    postId: tweetId,
    likesCount: metrics.like_count || 0,
    commentsCount: metrics.retweet_count || 0, // Twitter doesn't have separate comment count in basic metrics
    sharesCount: metrics.retweet_count || 0,
    impressions: metrics.impression_count || 0,
    reach: metrics.impression_count || 0,
    clicksCount: 0, // Requires Twitter Ads API
  }
}

/**
 * Fetch Facebook page post insights
 */
async function fetchFacebookAnalytics(
  postId: string,
  accessToken: string
): Promise<PlatformAnalyticsResponse> {
  const fields = 'likes.summary(true),comments.summary(true),shares'
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${postId}?fields=${fields}&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    postId,
    likesCount: data.likes?.summary?.total_count || 0,
    commentsCount: data.comments?.summary?.total_count || 0,
    sharesCount: data.shares?.count || 0,
    impressions: 0, // Requires Insights API
    reach: 0,
    clicksCount: 0,
  }
}

/**
 * Fetch Instagram media insights
 */
async function fetchInstagramAnalytics(
  mediaId: string,
  accessToken: string
): Promise<PlatformAnalyticsResponse> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${mediaId}?fields=like_count,comments_count,insights.metric( impressions,reach,saved )&access_token=${accessToken}`
  )

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.status}`)
  }

  const data = await response.json()
  const insights = data.insights?.data || []

  const getInsight = (metric: string) => {
    const item = insights.find((i: Record<string, unknown>) => i.name === metric)
    return item?.values?.[0]?.value || 0
  }

  return {
    postId: mediaId,
    likesCount: data.like_count || 0,
    commentsCount: data.comments_count || 0,
    sharesCount: 0,
    impressions: getInsight('impressions'),
    reach: getInsight('reach'),
    clicksCount: getInsight('saved'),
  }
}

/**
 * Fetch LinkedIn post analytics
 */
async function fetchLinkedInAnalytics(
  postUrn: string,
  accessToken: string
): Promise<PlatformAnalyticsResponse> {
  const response = await fetch(
    `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${postUrn}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202304',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status}`)
  }

  const data = await response.json()
  const timeSeries = data.elements?.[0]?.timeSeries?.[0]?.value || {}

  return {
    postId: postUrn,
    likesCount: timeSeries.likeCount || 0,
    commentsCount: timeSeries.commentCount || 0,
    sharesCount: timeSeries.shareCount || 0,
    impressions: timeSeries.impressionCount || 0,
    reach: timeSeries.uniqueImpressionsCount || 0,
    clicksCount: timeSeries.clickCount || 0,
  }
}

/**
 * Get default analytics when API fails
 */
function getDefaultAnalytics(): PlatformAnalyticsResponse {
  return {
    postId: '',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    impressions: 0,
    reach: 0,
    clicksCount: 0,
  }
}

/**
 * Sync analytics for all published posts from the last 7 days
 */
export async function syncAllPostAnalytics(): Promise<{
  updated: number
  failed: number
}> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const posts = await prisma.socialPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      id: true,
      platform: true,
    },
  })

  let updated = 0
  let failed = 0

  for (const post of posts) {
    try {
      // Get access token for the platform
      const connection = await prisma.socialConnection.findFirst({
        where: {
          platform: post.platform,
          isActive: true,
        },
        select: {
          accessToken: true,
        },
      })

      if (!connection) {
        console.warn(`No active connection for platform: ${post.platform}`)
        failed++
        continue
      }

      await syncPostAnalytics(post.id, connection.accessToken)
      updated++

      // Rate limiting: wait 100ms between requests
      await sleep(100)
    } catch (error) {
      console.error(`Failed to sync analytics for post ${post.id}:`, error)
      failed++
    }
  }

  return { updated, failed }
}

/**
 * Sync analytics for all posts in a campaign
 */
export async function syncCampaignAnalytics(
  campaignId: string
): Promise<CampaignAnalytics> {
  const campaign = await prisma.socialCampaign.findUnique({
    where: { id: campaignId },
    include: {
      products: {
        include: {
          posts: {
            where: {
              status: 'PUBLISHED',
            },
            select: {
              id: true,
              platform: true,
              likesCount: true,
              commentsCount: true,
              sharesCount: true,
              impressions: true,
              reach: true,
              engagementRate: true,
            },
          },
        },
      },
    },
  })

  if (!campaign) {
    throw new Error(`Campaign not found: ${campaignId}`)
  }

  // Aggregate all post analytics
  const allPosts = campaign.products.flatMap(p => p.posts)
  const postsByPlatform: Record<string, number> = {}

  let totalReach = 0
  let totalImpressions = 0
  let totalEngagement = 0
  let topPerformingPost: string | undefined
  let maxEngagement = 0

  for (const post of allPosts) {
    totalReach += post.reach
    totalImpressions += post.impressions
    totalEngagement += post.likesCount + post.commentsCount + post.sharesCount

    // Track posts by platform
    postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1

    // Track top performing post
    if (post.engagementRate > maxEngagement) {
      maxEngagement = post.engagementRate
      topPerformingPost = post.id
    }
  }

  const engagementRate = totalImpressions > 0
    ? (totalEngagement / totalImpressions) * 100
    : 0

  // Update campaign with aggregated stats
  await prisma.socialCampaign.update({
    where: { id: campaignId },
    data: {
      totalPosts: allPosts.length,
      totalReach,
      totalEngagement,
    },
  })

  return {
    campaignId,
    totalPosts: allPosts.length,
    totalReach,
    totalImpressions,
    totalEngagement,
    engagementRate,
    topPerformingPost,
    postsByPlatform: postsByPlatform as Record<SocialPlatform, number>,
  }
}

/**
 * Get top performing posts across all campaigns
 */
export async function getTopPerformingPosts(
  limit: number = 10,
  timeframeDays: number = 30
): Promise<Array<{
  postId: string
  platform: SocialPlatform
  engagementRate: number
  totalEngagement: number
  impressions: number
}>> {
  const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)

  const posts = await prisma.socialPost.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      platform: true,
      likesCount: true,
      commentsCount: true,
      sharesCount: true,
      impressions: true,
      engagementRate: true,
    },
    orderBy: {
      engagementRate: 'desc',
    },
    take: limit,
  })

  return posts.map(post => ({
    postId: post.id,
    platform: post.platform as SocialPlatform,
    engagementRate: post.engagementRate,
    totalEngagement: post.likesCount + post.commentsCount + post.sharesCount,
    impressions: post.impressions,
  }))
}

/**
 * Helper function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default {
  syncPostAnalytics,
  syncAllPostAnalytics,
  syncCampaignAnalytics,
  getTopPerformingPosts,
}
