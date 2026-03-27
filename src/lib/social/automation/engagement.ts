/**
 * Engagement Automation
 * Auto-reply to comments and manage social engagement
 */

import { prisma } from '@/lib/prisma'
import { SocialPlatform, SocialPostStatus } from '@/types/automation'
import { generateCommentReply } from './content-generator'

interface SocialComment {
  id: string
  externalId: string
  authorName: string
  authorUsername?: string
  authorAvatar?: string
  content: string
  createdAt: Date
}

interface CommentReply {
  commentId: string
  replyContent: string
  success: boolean
}

/**
 * Fetch new comments from social platform API
 * This would integrate with actual platform APIs (Twitter, Facebook, Instagram)
 */
export async function fetchNewComments(
  postId: string,
  accessToken: string,
  platform: string
): Promise<SocialComment[]> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    select: { externalPostId: true, platform: true },
  })

  if (!post || !post.externalPostId) {
    return []
  }

  // Platform-specific comment fetching
  switch (platform.toUpperCase()) {
    case 'TWITTER':
      return fetchTwitterComments(post.externalPostId, accessToken)
    case 'FACEBOOK':
      return fetchFacebookComments(post.externalPostId, accessToken)
    case 'INSTAGRAM':
      return fetchInstagramComments(post.externalPostId, accessToken)
    default:
      return []
  }
}

/**
 * Fetch comments from Twitter API
 */
async function fetchTwitterComments(
  tweetId: string,
  accessToken: string
): Promise<SocialComment[]> {
  try {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${tweetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Twitter API error:', await response.text())
      return []
    }

    const data = await response.json()
    return (data.data || []).map((tweet: Record<string, unknown>) => ({
      id: tweet.id as string,
      externalId: tweet.id as string,
      authorName: tweet.author_id as string || 'Unknown',
      content: tweet.text as string,
      createdAt: new Date(tweet.created_at as string || Date.now()),
    }))
  } catch (error) {
    console.error('Failed to fetch Twitter comments:', error)
    return []
  }
}

/**
 * Fetch comments from Facebook Graph API
 */
async function fetchFacebookComments(
  postId: string,
  accessToken: string
): Promise<SocialComment[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}/comments?access_token=${accessToken}`
    )

    if (!response.ok) {
      console.error('Facebook API error:', await response.text())
      return []
    }

    const data = await response.json()
    return (data.data || []).map((comment: Record<string, unknown>) => ({
      id: comment.id as string,
      externalId: comment.id as string,
      authorName: (comment.from as Record<string, unknown>)?.name as string || 'Unknown',
      authorUsername: (comment.from as Record<string, unknown>)?.id as string,
      content: comment.message as string,
      createdAt: new Date(comment.created_time as string || Date.now()),
    }))
  } catch (error) {
    console.error('Failed to fetch Facebook comments:', error)
    return []
  }
}

/**
 * Fetch comments from Instagram Graph API
 */
async function fetchInstagramComments(
  mediaId: string,
  accessToken: string
): Promise<SocialComment[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}/comments?access_token=${accessToken}`
    )

    if (!response.ok) {
      console.error('Instagram API error:', await response.text())
      return []
    }

    const data = await response.json()
    return (data.data || []).map((comment: Record<string, unknown>) => ({
      id: comment.id as string,
      externalId: comment.id as string,
      authorName: (comment.from as Record<string, unknown>)?.username as string || 'Unknown',
      authorUsername: (comment.from as Record<string, unknown>)?.username as string,
      content: comment.text as string,
      createdAt: new Date(comment.timestamp as string || Date.now()),
    }))
  } catch (error) {
    console.error('Failed to fetch Instagram comments:', error)
    return []
  }
}

/**
 * Auto-reply to comments on a social post
 */
export async function autoReplyToComments(
  postId: string,
  accessToken: string,
  platform: string
): Promise<{ replies: number; skipped: number; failed: number }> {
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
    include: {
      product: {
        select: {
          name: true,
          price: true,
        },
      },
    },
  })

  if (!post) {
    throw new Error(`Post not found: ${postId}`)
  }

  // Fetch new comments from platform
  const newComments = await fetchNewComments(postId, accessToken, platform)

  let replies = 0
  let skipped = 0
  let failed = 0

  for (const comment of newComments) {
    // Check if we already replied to this comment
    const existingReply = await prisma.socialComment.findFirst({
      where: {
        postId,
        externalId: comment.externalId,
        isAutoReplied: true,
      },
    })

    if (existingReply) {
      skipped++
      continue
    }

    // Generate context for the reply
    const context = post.product
      ? `${post.product.name} - $${(post.product.price / 100).toFixed(2)}`
      : undefined

    // Generate reply using AI
    const replyContent = await generateCommentReply(comment.content, context)

    try {
      // Post the reply to the platform
      await postCommentReply(comment.externalId, replyContent, platform, accessToken)

      // Record the comment and our reply in database
      await prisma.socialComment.create({
        data: {
          postId,
          externalId: comment.externalId,
          authorName: comment.authorName,
          authorUsername: comment.authorUsername,
          authorAvatar: comment.authorAvatar,
          content: comment.content,
          isAutoReplied: true,
          replyContent,
        },
      })

      replies++
    } catch (error) {
      console.error(`Failed to reply to comment ${comment.id}:`, error)
      failed++

      // Still record the comment to avoid retrying
      await prisma.socialComment.create({
        data: {
          postId,
          externalId: comment.externalId,
          authorName: comment.authorName,
          authorUsername: comment.authorUsername,
          content: comment.content,
          isAutoReplied: false,
        },
      })
    }
  }

  // Update post comment count
  const commentCount = await prisma.socialComment.count({
    where: { postId },
  })

  await prisma.socialPost.update({
    where: { id: postId },
    data: { commentsCount: commentCount },
  })

  return { replies, skipped, failed }
}

/**
 * Post a reply comment to the social platform
 */
async function postCommentReply(
  commentId: string,
  content: string,
  platform: string,
  accessToken: string
): Promise<void> {
  switch (platform.toUpperCase()) {
    case 'TWITTER':
      await fetch(`https://api.twitter.com/2/tweets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          reply: { in_reply_to_tweet_id: commentId },
        }),
      })
      break

    case 'FACEBOOK':
      await fetch(`https://graph.facebook.com/v18.0/${commentId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: accessToken,
          message: content,
        }),
      })
      break

    case 'INSTAGRAM':
      await fetch(`https://graph.facebook.com/v18.0/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: accessToken,
          message: content,
        }),
      })
      break

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * Get engagement stats for a post
 */
export async function getPostEngagement(postId: string): Promise<{
  totalComments: number
  autoReplied: number
  pendingReplies: number
}> {
  const [total, autoReplied, pendingReplies] = await Promise.all([
    prisma.socialComment.count({ where: { postId } }),
    prisma.socialComment.count({ where: { postId, isAutoReplied: true } }),
    prisma.socialComment.count({
      where: {
        postId,
        isAutoReplied: false,
        parentCommentId: null,
      },
    }),
  ])

  return {
    totalComments: total,
    autoReplied,
    pendingReplies,
  }
}

/**
 * Get all posts that need engagement processing
 */
export async function getPostsNeedingEngagement(): Promise<string[]> {
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

  return posts.map(p => p.id)
}

/**
 * Manual reply to a comment
 */
export async function manualReplyToComment(
  commentId: string,
  content: string,
  adminId: string
): Promise<void> {
  const comment = await prisma.socialComment.findUnique({
    where: { id: commentId },
  })

  if (!comment) {
    throw new Error(`Comment not found: ${commentId}`)
  }

  await prisma.socialComment.update({
    where: { id: commentId },
    data: {
      replyContent: content,
      isAutoReplied: false, // Mark as manual reply
    },
  })

  // Log the admin action
  await prisma.adminAuditLog.create({
    data: {
      adminId,
      action: 'MANUAL_REPLY',
      entityType: 'SocialComment',
      entityId: commentId,
      newValue: { content },
    },
  })
}

export default {
  fetchNewComments,
  autoReplyToComments,
  getPostEngagement,
  getPostsNeedingEngagement,
  manualReplyToComment,
}
