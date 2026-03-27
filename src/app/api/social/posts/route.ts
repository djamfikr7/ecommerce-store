/**
 * Social Posts API
 * GET /api/social/posts - List user's posts
 * POST /api/social/posts - Create a new post
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createSocialPost,
  getUserPosts,
} from '@/lib/db-actions/social/posts'
import {
  createPostSchema,
  postListSchema,
  validateOrThrow,
} from '@/lib/validators/social'
import { hasActiveConnection } from '@/lib/db-actions/social/connections'

export const dynamic = 'force-dynamic'

/**
 * GET /api/social/posts
 * List all posts for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      status: searchParams.get('status') || undefined,
      platform: searchParams.get('platform') || undefined,
    }

    const params = validateOrThrow(postListSchema, queryParams)
    const result = await getUserPosts(session.user.id, params.page, params.pageSize)

    // Filter by status/platform if provided
    let posts = result.posts
    if (params.status) {
      posts = posts.filter((p) => p.status === params.status)
    }
    if (params.platform) {
      posts = posts.filter((p) => p.platform === params.platform)
    }

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to get posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/posts
 * Create a new social post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = validateOrThrow(createPostSchema, body)

    // Check if user has an active connection for this platform
    const isConnected = await hasActiveConnection(session.user.id, validated.platform)
    if (!isConnected) {
      return NextResponse.json(
        { success: false, error: `Please connect your ${validated.platform} account first` },
        { status: 400 }
      )
    }

    const post = await createSocialPost(session.user.id, {
      content: validated.content,
      platform: validated.platform,
      imageUrls: validated.imageUrls,
      productId: validated.productId,
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : undefined,
      isCampaignPost: validated.isCampaignPost,
      campaignId: validated.campaignId,
    })

    const message = post.status === 'SCHEDULED'
      ? 'Post scheduled successfully'
      : 'Post created successfully'

    return NextResponse.json({
      success: true,
      data: post,
      message,
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create post:', error)

    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 429 }
        )
      }
      if (error.message.includes('connect your')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
