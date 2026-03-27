/**
 * Social Post Scheduler
 * Handles scheduling, rescheduling, and processing of scheduled social posts
 */

import { prisma } from '@/lib/prisma'
import { SocialPlatform, SocialPostStatus } from '@/types/automation'
import { publishToSocial } from '@/lib/social/publishers'

interface SchedulePostOptions {
  platform: SocialPlatform
  content: string
  imageUrl?: string
  videoUrl?: string
  productId?: string
  campaignId?: string
  userId?: string
  locale?: string
  metadata?: Record<string, unknown>
}

interface ScheduledPost {
  id: string
  platform: SocialPlatform
  content: string
  imageUrl: string | null
  videoUrl: string | null
  productId: string | null
  campaignId: string | null
  userId: string | null
  status: SocialPostStatus
  scheduledFor: Date
  externalPostId: string | null
  externalPostUrl: string | null
  errorMessage: string | null
  retryCount: number
}

/**
 * Schedule a new social post for future publication
 */
export async function schedulePost(
  postId: string,
  scheduledFor: Date
): Promise<void> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }

  if (post.status !== 'DRAFT') {
    throw new Error(`Can only schedule posts in DRAFT status. Current status: ${post.status}`)
  }

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status: 'SCHEDULED',
      scheduledFor,
    },
  })
}

/**
 * Create and schedule a new post
 */
export async function createScheduledPost(
  options: SchedulePostOptions,
  scheduledFor: Date
): Promise<string> {
  const post = await prisma.socialPost.create({
    data: {
      platform: options.platform,
      content: options.content,
      imageUrl: options.imageUrl,
      videoUrl: options.videoUrl,
      productId: options.productId,
      campaignId: options.campaignId,
      userId: options.userId,
      status: 'SCHEDULED',
      scheduledFor,
      locale: options.locale || 'en',
      metadata: options.metadata || {},
    },
  })

  return post.id
}

/**
 * Get all scheduled posts
 */
export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  const posts = await prisma.socialPost.findMany({
    where: {
      status: 'SCHEDULED',
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
          goal: true,
        },
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  })

  return posts as unknown as ScheduledPost[]
}

/**
 * Get scheduled posts for a specific user
 */
export async function getUserScheduledPosts(userId: string): Promise<ScheduledPost[]> {
  const posts = await prisma.socialPost.findMany({
    where: {
      userId,
      status: 'SCHEDULED',
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      scheduledFor: 'asc',
    },
  })

  return posts as unknown as ScheduledPost[]
}

/**
 * Process all due scheduled posts
 * Called by CRON job every minute
 */
export async function processScheduledPosts(): Promise<{
  published: number
  failed: number
  skipped: number
}> {
  const now = new Date()

  // Find posts that are scheduled for now or earlier
  const duePosts = await prisma.socialPost.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledFor: {
        lte: now,
      },
      retryCount: {
        lt: 3, // Max 3 retries
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      },
    },
  })

  let published = 0
  let failed = 0
  let skipped = 0

  for (const post of duePosts) {
    try {
      // Skip if product is no longer active
      if (post.productId && post.product && !post.product.isActive) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            errorMessage: 'Product is no longer active',
          },
        })
        skipped++
        continue
      }

      // Attempt to publish
      const result = await publishToSocial({
        platform: post.platform as SocialPlatform,
        content: post.content,
        imageUrl: post.imageUrl || undefined,
        videoUrl: post.videoUrl || undefined,
        metadata: {
          postId: post.id,
          productId: post.productId,
        },
      })

      // Update post with success
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          externalPostId: result.postId,
          externalPostUrl: result.url,
          errorMessage: null,
        },
      })

      // Update campaign stats if applicable
      if (post.campaignId) {
        await updateCampaignStats(post.campaignId)
      }

      published++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const newRetryCount = post.retryCount + 1

      // Check if we've exceeded max retries
      if (newRetryCount >= 3) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: 'FAILED',
            errorMessage,
            retryCount: newRetryCount,
          },
        })
        failed++
      } else {
        // Reschedule for 5 minutes from now
        const nextAttempt = new Date(now.getTime() + 5 * 60 * 1000)
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            scheduledFor: nextAttempt,
            errorMessage,
            retryCount: newRetryCount,
          },
        })
      }
    }
  }

  return { published, failed, skipped }
}

/**
 * Reschedule an existing post
 */
export async function reschedulePost(
  postId: string,
  newTime: Date,
  userId: string
): Promise<ScheduledPost> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }

  // Verify ownership (if userId is set)
  if (post.userId && post.userId !== userId) {
    throw new Error('You do not have permission to reschedule this post')
  }

  // Only allow rescheduling of DRAFT or SCHEDULED posts
  if (post.status !== 'DRAFT' && post.status !== 'SCHEDULED') {
    throw new Error(`Cannot reschedule post with status: ${post.status}`)
  }

  const updated = await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status: 'SCHEDULED',
      scheduledFor: newTime,
      errorMessage: null,
      retryCount: 0,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  return updated as unknown as ScheduledPost
}

/**
 * Cancel a scheduled post
 */
export async function cancelScheduledPost(
  postId: string,
  userId: string
): Promise<void> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }

  // Verify ownership
  if (post.userId && post.userId !== userId) {
    throw new Error('You do not have permission to cancel this post')
  }

  if (post.status !== 'SCHEDULED') {
    throw new Error(`Can only cancel scheduled posts. Current status: ${post.status}`)
  }

  await prisma.socialPost.update({
    where: { id: postId },
    data: {
      status: 'DRAFT',
      scheduledFor: null,
    },
  })
}

/**
 * Update campaign aggregate statistics
 */
async function updateCampaignStats(campaignId: string): Promise<void> {
  const stats = await prisma.socialPost.aggregate({
    where: {
      campaignId,
      status: 'PUBLISHED',
    },
    _count: true,
    _sum: {
      reach: true,
      likesCount: true,
      commentsCount: true,
      sharesCount: true,
    },
  })

  await prisma.socialCampaign.update({
    where: { id: campaignId },
    data: {
      totalPosts: stats._count,
      totalReach: stats._sum.reach || 0,
      totalEngagement: (stats._sum.likesCount || 0) +
                      (stats._sum.commentsCount || 0) +
                      (stats._sum.sharesCount || 0),
    },
  })
}

/**
 * Get upcoming scheduled posts count (for dashboard)
 */
export async function getScheduledPostsCount(): Promise<number> {
  return prisma.socialPost.count({
    where: {
      status: 'SCHEDULED',
      scheduledFor: {
        gte: new Date(),
      },
    },
  })
}

/**
 * Get posts by status for a user
 */
export async function getPostsByStatus(
  status: SocialPostStatus,
  userId?: string
): Promise<ScheduledPost[]> {
  const where: Record<string, unknown> = { status }
  if (userId) {
    where.userId = userId
  }

  const posts = await prisma.socialPost.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return posts as unknown as ScheduledPost[]
}

export default {
  schedulePost,
  createScheduledPost,
  getScheduledPosts,
  getUserScheduledPosts,
  processScheduledPosts,
  reschedulePost,
  cancelScheduledPost,
  getScheduledPostsCount,
  getPostsByStatus,
}
