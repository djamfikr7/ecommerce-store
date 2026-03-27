/**
 * Social Post Database Actions
 * Create, manage, and track social media posts
 */

import { prisma } from '@/lib/db'
import { getValidAccessToken } from './connections'
import { publishToTwitter, publishToFacebook, publishToInstagram, publishToLinkedIn } from '@/lib/social/publishers'

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin'

export interface CreatePostInput {
  content: string
  platform: SocialPlatform
  imageUrls?: string[]
  productId?: string
  scheduledFor?: Date
  isCampaignPost?: boolean
  campaignId?: string
}

export interface UpdatePostInput {
  content?: string
  imageUrls?: string[]
  scheduledFor?: Date
}

export interface SocialPost {
  id: string
  userId: string
  content: string
  platform: SocialPlatform
  status: PostStatus
  imageUrls: string[]
  productId?: string
  campaignId?: string
  platformPostId?: string
  platformPostUrl?: string
  publishedAt?: Date
  scheduledFor?: Date
  errorMessage?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
    impressions: number
    clicks: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface SocialPostAnalytics {
  postId: string
  platform: SocialPlatform
  likes: number
  comments: number
  shares: number
  impressions: number
  clicks: number
  reach: number
  engagementRate: number
  fetchedAt: Date
}

// Rate limiting state
const rateLimits: Record<string, { lastPost: Date; count: number }> = {}

// Clean up rate limit every hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_POSTS_PER_WINDOW = 10

function checkRateLimit(userId: string, platform: SocialPlatform): boolean {
  const key = `${userId}:${platform}`
  const now = Date.now()

  if (!rateLimits[key] || now - rateLimits[key].lastPost.getTime() > RATE_LIMIT_WINDOW) {
    rateLimits[key] = { lastPost: new Date(), count: 1 }
    return true
  }

  if (rateLimits[key].count >= MAX_POSTS_PER_WINDOW) {
    return false
  }

  rateLimits[key].count++
  rateLimits[key].lastPost = new Date()
  return true
}

/**
 * Create a new social post
 */
export async function createSocialPost(userId: string, data: CreatePostInput): Promise<SocialPost> {
  // Check rate limit
  if (!checkRateLimit(userId, data.platform)) {
    throw new Error(`Rate limit exceeded for ${data.platform}. Please wait before posting again.`)
  }

  const isScheduled = !!data.scheduledFor
  const status: PostStatus = isScheduled ? 'SCHEDULED' : 'DRAFT'

  const post = await prisma.socialPost.create({
    data: {
      userId,
      content: data.content,
      platform: data.platform,
      status,
      imageUrls: data.imageUrls || [],
      productId: data.productId,
      campaignId: data.campaignId,
      scheduledFor: data.scheduledFor,
      isCampaignPost: data.isCampaignPost || false,
    },
  })

  // If not scheduled, publish immediately
  if (!isScheduled) {
    try {
      await publishPost(post.id, userId)
    } catch (error) {
      console.error('Failed to publish post:', error)
    }
  }

  return formatPost(post)
}

/**
 * Publish a post to the social platform
 */
async function publishPost(postId: string, userId: string): Promise<void> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')

  const accessToken = await getValidAccessToken(userId, post.platform)

  let result: { postId: string; postUrl: string }

  switch (post.platform) {
    case 'twitter':
      result = await publishToTwitter(post.content, post.imageUrls, accessToken)
      break
    case 'facebook':
      result = await publishToFacebook(post.content, post.imageUrls, accessToken)
      break
    case 'instagram':
      if (!post.imageUrls[0]) throw new Error('Instagram requires an image')
      result = await publishToInstagram(post.content, post.imageUrls[0], accessToken)
      break
    case 'linkedin':
      result = await publishToLinkedIn(post.content, post.imageUrls[0], accessToken)
      break
    default:
      throw new Error(`Unsupported platform: ${post.platform}`)
  }

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status: 'PUBLISHED',
      platformPostId: result.postId,
      platformPostUrl: result.postUrl,
      publishedAt: new Date(),
      errorMessage: null,
    },
  })
}

/**
 * Retry a failed post
 */
export async function retryPost(postId: string, userId: string): Promise<SocialPost> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')
  if (post.userId !== userId) throw new Error('Unauthorized')
  if (post.status !== 'FAILED') throw new Error('Can only retry failed posts')

  await prisma.socialPost.update({
    where: { id: postId },
    data: { status: 'DRAFT', errorMessage: null },
  })

  try {
    await publishPost(postId, userId)
  } catch (error) {
    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    throw error
  }

  const updated = await prisma.socialPost.findUnique({ where: { id: postId } })
  return formatPost(updated!)
}

/**
 * Get paginated posts for a user
 */
export async function getUserPosts(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ posts: SocialPost[]; total: number; page: number; pageSize: number }> {
  const skip = (page - 1) * pageSize

  const [posts, total] = await Promise.all([
    prisma.socialPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.socialPost.count({ where: { userId } }),
  ])

  return {
    posts: posts.map(formatPost),
    total,
    page,
    pageSize,
  }
}

/**
 * Get a single post by ID
 */
export async function getPostById(postId: string): Promise<SocialPost | null> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  return post ? formatPost(post) : null
}

/**
 * Update a scheduled post
 */
export async function updatePost(postId: string, userId: string, data: UpdatePostInput): Promise<SocialPost> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')
  if (post.userId !== userId) throw new Error('Unauthorized')
  if (post.status === 'PUBLISHED') throw new Error('Cannot update published posts')

  const updated = await prisma.socialPost.update({
    where: { id: postId },
    data: {
      content: data.content ?? post.content,
      imageUrls: data.imageUrls ?? post.imageUrls,
      scheduledFor: data.scheduledFor,
    },
  })

  return formatPost(updated)
}

/**
 * Delete a post
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')
  if (post.userId !== userId) throw new Error('Unauthorized')

  // If published, delete from platform first
  if (post.status === 'PUBLISHED' && post.platformPostId) {
    try {
      await deleteFromPlatform(post.platform, post.platformPostId, userId)
    } catch (error) {
      console.error('Failed to delete from platform:', error)
      // Continue with local deletion even if platform deletion fails
    }
  }

  await prisma.socialPost.delete({ where: { id: postId } })
}

/**
 * Delete post from social platform
 */
async function deleteFromPlatform(platform: SocialPlatform, platformPostId: string, userId: string): Promise<void> {
  const accessToken = await getValidAccessToken(userId, platform)

  switch (platform) {
    case 'twitter':
      await fetch(`https://api.twitter.com/2/tweets/${platformPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      break
    case 'facebook':
    case 'instagram':
      await fetch(`https://graph.facebook.com/v18.0/${platformPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      break
    case 'linkedin':
      await fetch(`https://api.linkedin.com/v2/shares/${platformPostId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      break
  }
}

/**
 * Get post analytics
 */
export async function getPostAnalytics(postId: string): Promise<SocialPostAnalytics> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post not found')
  if (post.status !== 'PUBLISHED') throw new Error('Can only get analytics for published posts')

  const accessToken = await getValidAccessToken(post.userId, post.platform)
  const analytics = await fetchPlatformAnalytics(post.platform, post.platformPostId!, accessToken)

  // Update cached analytics
  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      engagement: analytics,
    },
  })

  return {
    postId,
    platform: post.platform,
    likes: analytics.likes,
    comments: analytics.comments,
    shares: analytics.shares,
    impressions: analytics.impressions,
    clicks: analytics.clicks,
    reach: analytics.impressions, // Use impressions as reach estimate
    engagementRate: analytics.impressions > 0
      ? ((analytics.likes + analytics.comments + analytics.shares) / analytics.impressions) * 100
      : 0,
    fetchedAt: new Date(),
  }
}

/**
 * Fetch analytics from platform API
 */
async function fetchPlatformAnalytics(
  platform: SocialPlatform,
  platformPostId: string,
  accessToken: string
): Promise<{ likes: number; comments: number; shares: number; impressions: number; clicks: number }> {
  const headers = { Authorization: `Bearer ${accessToken}` }

  try {
    switch (platform) {
      case 'twitter': {
        const res = await fetch(
          `https://api.twitter.com/2/tweets/${platformPostId}?tweet.fields=public_metrics`,
          { headers }
        )
        const data = await res.json()
        return {
          likes: data.data?.public_metrics?.like_count || 0,
          comments: 0, // Twitter doesn't have separate comment count
          shares: data.data?.public_metrics?.retweet_count || 0,
          impressions: 0,
          clicks: 0,
        }
      }

      case 'facebook': {
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${platformPostId}?fields=likes.summary(true),comments.summary(true),shares`,
          { headers }
        )
        const data = await res.json()
        return {
          likes: data.likes?.summary?.total_count || 0,
          comments: data.comments?.summary?.total_count || 0,
          shares: data.shares?.count || 0,
          impressions: 0,
          clicks: 0,
        }
      }

      case 'instagram': {
        const res = await fetch(
          `https://graph.facebook.com/v18.0/${platformPostId}?fields=like_count,comments_count,reach`,
          { headers }
        )
        const data = await res.json()
        return {
          likes: data.like_count || 0,
          comments: data.comments_count || 0,
          shares: 0,
          impressions: data.reach || 0,
          clicks: 0,
        }
      }

      case 'linkedin': {
        const res = await fetch(
          `https://api.linkedin.com/v2/shares/${platformPostId}?fields=totalShares,viewCount,likeCount,commentCount`,
          { headers }
        )
        const data = await res.json()
        return {
          likes: data.likeCount || 0,
          comments: data.commentCount || 0,
          shares: data.totalShares || 0,
          impressions: data.viewCount || 0,
          clicks: 0,
        }
      }

      default:
        return { likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
    }
  } catch (error) {
    console.error('Failed to fetch platform analytics:', error)
    return { likes: 0, comments: 0, shares: 0, impressions: 0, clicks: 0 }
  }
}

/**
 * Process scheduled posts (called by cron job)
 */
export async function processScheduledPosts(): Promise<{ processed: number; failed: number }> {
  const scheduledPosts = await prisma.socialPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: { lte: new Date() },
    },
  })

  let processed = 0
  let failed = 0

  for (const post of scheduledPosts) {
    try {
      await publishPost(post.id, post.userId)
      processed++
    } catch (error) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })
      failed++
    }
  }

  return { processed, failed }
}

/**
 * Format post for API response
 */
function formatPost(post: {
  id: string
  userId: string
  content: string
  platform: string
  status: string
  imageUrls: string[]
  productId?: string
  campaignId?: string
  platformPostId?: string
  platformPostUrl?: string
  publishedAt?: Date
  scheduledFor?: Date
  errorMessage?: string
  engagement?: any
  createdAt: Date
  updatedAt: Date
}): SocialPost {
  return {
    id: post.id,
    userId: post.userId,
    content: post.content,
    platform: post.platform as SocialPlatform,
    status: post.status as PostStatus,
    imageUrls: post.imageUrls,
    productId: post.productId || undefined,
    campaignId: post.campaignId || undefined,
    platformPostId: post.platformPostId || undefined,
    platformPostUrl: post.platformPostUrl || undefined,
    publishedAt: post.publishedAt || undefined,
    scheduledFor: post.scheduledFor || undefined,
    errorMessage: post.errorMessage || undefined,
    engagement: post.engagement || undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }
}

export default {
  createSocialPost,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  retryPost,
  getPostAnalytics,
  processScheduledPosts,
}
