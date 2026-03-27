/**
 * POST /api/webhooks/social
 * Handle incoming webhooks from social platforms
 *
 * Supported platforms:
 * - Twitter: Tweet events, engagement notifications
 * - Facebook: Comment notifications, post insights
 * - Instagram: Comment notifications, story mentions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SocialPlatform } from '@/types/automation'

// Platform-specific webhook secrets
const WEBHOOK_SECRETS: Record<string, string> = {
  TWITTER: process.env.TWITTER_WEBHOOK_SECRET || '',
  FACEBOOK: process.env.FACEBOOK_APP_SECRET || '',
  INSTAGRAM: process.env.FACEBOOK_APP_SECRET || '', // Uses Facebook Graph API
}

/**
 * Verify webhook signature from social platform
 */
async function verifyWebhookSignature(
  request: NextRequest,
  platform: string
): Promise<boolean> {
  const signature = request.headers.get('x-hub-signature-256') ||
                    request.headers.get('x-twitter-signature')

  if (!signature) {
    return false
  }

  const secret = WEBHOOK_SECRETS[platform]
  if (!secret) {
    return false
  }

  // For Facebook/Instagram
  if (signature.startsWith('sha256=')) {
    const body = await request.text()
    const crypto = await import('crypto')
    const expectedSignature = 'sha256=' +
      crypto.createHmac('sha256', secret)
        .update(body)
        .digest('hex')

    return signature === expectedSignature
  }

  // For Twitter
  if (signature.startsWith('sha256=')) {
    const body = await request.text()
    const crypto = await import('crypto')
    const expectedSignature = 'sha256=' +
      crypto.createHmac('sha256', secret)
        .update(body)
        .digest('hex')

    return signature === expectedSignature
  }

  return false
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Detect platform from headers or path
    const platform = detectPlatform(request)

    if (!platform) {
      return NextResponse.json(
        { success: false, message: 'Unknown platform' },
        { status: 400 }
      )
    }

    // Verify webhook signature (skip for development)
    if (process.env.NODE_ENV === 'production') {
      const isValid = await verifyWebhookSignature(request, platform)
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const body = await request.json()

    // Process webhook based on platform
    switch (platform) {
      case 'TWITTER':
        return await handleTwitterWebhook(body)
      case 'FACEBOOK':
        return await handleFacebookWebhook(body)
      case 'INSTAGRAM':
        return await handleInstagramWebhook(body)
      default:
        return NextResponse.json(
          { success: false, message: 'Unsupported platform' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Detect which social platform sent the webhook
 */
function detectPlatform(request: NextRequest): string | null {
  // Check for platform-specific headers
  const twitterWebhookId = request.headers.get('x-twitter-webhook-id')
  const fbHubMode = request.headers.get('x-hub-mode')

  if (twitterWebhookId) return 'TWITTER'
  if (fbHubMode) {
    // Check for Instagram-specific entry point
    const igChallenge = request.headers.get('x-ig-challenge')
    if (igChallenge) return 'INSTAGRAM'
    return 'FACEBOOK'
  }

  // Check URL path as fallback
  const url = new URL(request.url)
  if (url.pathname.includes('twitter')) return 'TWITTER'
  if (url.pathname.includes('instagram')) return 'INSTAGRAM'
  if (url.pathname.includes('facebook')) return 'FACEBOOK'

  return null
}

/**
 * Handle Twitter webhook events
 */
async function handleTwitterWebhook(body: Record<string, unknown>): Promise<NextResponse> {
  // Twitter webhook can send different event types
  const tweetCreateEvents = body.tweet_create_events as Array<Record<string, unknown>> | undefined
  const likeEvents = body.like_events as Array<Record<string, unknown>> | undefined
  const followEvents = body.follow_events as Array<Record<string, unknown>> | undefined

  // Process tweet events
  if (tweetCreateEvents && tweetCreateEvents.length > 0) {
    for (const event of tweetCreateEvents) {
      await processTweetEvent(event)
    }
  }

  // Process like events
  if (likeEvents && likeEvents.length > 0) {
    for (const event of likeEvents) {
      await processLikeEvent(event, 'TWITTER')
    }
  }

  // Process follow events (for potential future use)
  if (followEvents && followEvents.length > 0) {
    for (const event of followEvents) {
      console.log('New follower:', event)
    }
  }

  return NextResponse.json({ success: true, processed: true })
}

/**
 * Handle Facebook webhook events
 */
async function handleFacebookWebhook(body: Record<string, unknown>): Promise<NextResponse> {
  const entry = body.entry as Array<Record<string, unknown>> | undefined

  if (!entry || entry.length === 0) {
    return NextResponse.json({ success: true, message: 'No entries' })
  }

  for (const pageEntry of entry) {
    const messaging = pageEntry.messaging as Array<Record<string, unknown>> | undefined

    if (messaging) {
      for (const message of messaging) {
        await processFacebookMessage(message)
      }
    }

    // Handle comments on posts
    const changes = pageEntry.changes as Array<Record<string, unknown>> | undefined
    if (changes) {
      for (const change of changes) {
        await processFacebookChange(change)
      }
    }
  }

  return NextResponse.json({ success: true, processed: true })
}

/**
 * Handle Instagram webhook events
 */
async function handleInstagramWebhook(body: Record<string, unknown>): Promise<NextResponse> {
  const entry = body.entry as Array<Record<string, unknown>> | undefined

  if (!entry || entry.length === 0) {
    return NextResponse.json({ success: true, message: 'No entries' })
  }

  for (const igEntry of entry) {
    const messaging = igEntry.messaging as Array<Record<string, unknown>> | undefined
    const mentions = igEntry.mentions as Array<Record<string, unknown>> | undefined

    // Process direct messages
    if (messaging) {
      for (const message of messaging) {
        await processInstagramMessage(message)
      }
    }

    // Process mentions
    if (mentions) {
      for (const mention of mentions) {
        await processInstagramMention(mention)
      }
    }
  }

  return NextResponse.json({ success: true, processed: true })
}

/**
 * Process a new tweet event
 */
async function processTweetEvent(event: Record<string, unknown>): Promise<void> {
  const tweetId = event.id as string
  const userId = event.user?.id as string
  const text = event.text as string

  // Check if this is a reply to one of our posts
  const inReplyToStatusId = event.in_reply_to_status_id_str as string | undefined

  if (inReplyToStatusId) {
    // Find our post that this is replying to
    const ourPost = await prisma.socialPost.findFirst({
      where: {
        externalPostId: inReplyToStatusId,
        platform: 'TWITTER',
      },
    })

    if (ourPost) {
      // Record the comment/reply
      await prisma.socialComment.create({
        data: {
          postId: ourPost.id,
          externalId: tweetId,
          authorName: (event.user as Record<string, unknown>)?.screen_name as string || 'Unknown',
          authorUsername: (event.user as Record<string, unknown>)?.screen_name as string,
          content: text,
        },
      })

      // Update comment count
      const commentCount = await prisma.socialComment.count({
        where: { postId: ourPost.id },
      })

      await prisma.socialPost.update({
        where: { id: ourPost.id },
        data: { commentsCount: commentCount },
      })
    }
  }
}

/**
 * Process a like event
 */
async function processLikeEvent(
  event: Record<string, unknown>,
  platform: SocialPlatform
): Promise<void> {
  const tweetId = event.tweet?.id_str as string

  if (tweetId) {
    const post = await prisma.socialPost.findFirst({
      where: {
        externalPostId: tweetId,
        platform,
      },
    })

    if (post) {
      // Increment likes count
      await prisma.socialPost.update({
        where: { id: post.id },
        data: { likesCount: { increment: 1 } },
      })
    }
  }
}

/**
 * Process Facebook message
 */
async function processFacebookMessage(message: Record<string, unknown>): Promise<void> {
  const senderId = message.sender?.id as string
  const messageText = message.message?.text as string

  console.log(`Facebook message from ${senderId}: ${messageText}`)

  // TODO: Implement auto-reply for Facebook messages
}

/**
 * Process Facebook change (comments, reactions, etc.)
 */
async function processFacebookChange(change: Record<string, unknown>): Promise<void> {
  const field = change.field as string
  const value = change.value as Record<string, unknown>

  if (field === 'feed' && value.item === 'comment') {
    // New comment on a post
    const postId = value.post_id as string
    const commentId = value.comment_id as string

    // Find our post
    const ourPost = await prisma.socialPost.findFirst({
      where: {
        externalPostId: postId,
        platform: 'FACEBOOK',
      },
    })

    if (ourPost) {
      // Check for duplicate
      const existing = await prisma.socialComment.findFirst({
        where: { externalId: commentId },
      })

      if (!existing) {
        await prisma.socialComment.create({
          data: {
            postId: ourPost.id,
            externalId: commentId,
            authorName: value.from?.name as string || 'Facebook User',
            authorUsername: value.from?.id as string,
            content: value.message as string || '',
          },
        })

        // Update comment count
        const count = await prisma.socialComment.count({
          where: { postId: ourPost.id },
        })

        await prisma.socialPost.update({
          where: { id: ourPost.id },
          data: { commentsCount: count },
        })
      }
    }
  }
}

/**
 * Process Instagram direct message
 */
async function processInstagramMessage(message: Record<string, unknown>): Promise<void> {
  const senderId = message.sender?.id as string
  const messageText = message.message?.text as string

  console.log(`Instagram message from ${senderId}: ${messageText}`)

  // TODO: Implement auto-reply for Instagram DMs
}

/**
 * Process Instagram mention
 */
async function processInstagramMention(mention: Record<string, unknown>): Promise<void> {
  const mediaId = mention.media?.id as string
  const userId = mention.user_id as string
  const text = mention.text as string

  console.log(`Instagram mention by ${userId} on ${mediaId}: ${text}`)

  // TODO: Process mention and potentially respond
}

/**
 * GET handler for webhook verification (required by Facebook)
 */
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  // Facebook webhook verification
  if (mode === 'subscribe' && token) {
    const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN

    if (verifyToken && token === verifyToken) {
      return new Response(challenge || '', { status: 200 })
    }

    return NextResponse.json({ success: false, message: 'Invalid verify token' }, { status: 403 })
  }

  // Twitter webhook CRC verification
  const crcToken = request.nextUrl.searchParams.get('crc_token')
  if (crcToken) {
    const crypto = await import('crypto')
    const secret = process.env.TWITTER_WEBHOOK_SECRET || ''
    const responseToken = 'sha256=' +
      crypto.createHmac('sha256', secret)
        .update(crcToken)
        .digest('base64')

    return NextResponse.json({
      response_token: responseToken
    })
  }

  return NextResponse.json({ success: false, message: 'Unknown verification type' }, { status: 400 })
}
