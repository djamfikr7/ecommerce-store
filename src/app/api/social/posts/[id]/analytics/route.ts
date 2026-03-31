/**
import { auth } from '@/lib/auth'
 * Post Analytics API
 * GET /api/social/posts/[id]/analytics - Get analytics for a post
 */

import { NextRequest, NextResponse } from 'next/server'

import { getPostAnalytics, getPostById } from '@/lib/db-actions/social/posts'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/social/posts/[id]/analytics
 * Get analytics for a specific post
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verify post exists and belongs to user
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view analytics for this post' },
        { status: 403 }
      )
    }

    if (post.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Analytics are only available for published posts' },
        { status: 400 }
      )
    }

    const analytics = await getPostAnalytics(id)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error('Failed to get post analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
