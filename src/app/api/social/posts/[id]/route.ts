/**
 * Social Post by ID API
 * GET /api/social/posts/[id] - Get a specific post
 * DELETE /api/social/posts/[id] - Delete a post
 * PATCH /api/social/posts/[id] - Update a post
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getPostById,
  deletePost,
  updatePost,
} from '@/lib/db-actions/social/posts'
import { updatePostSchema, validateOrThrow } from '@/lib/validators/social'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/social/posts/[id]
 * Get a specific post by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Only allow user to see their own posts
    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this post' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Failed to get post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get post' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/social/posts/[id]
 * Update a scheduled post
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validated = validateOrThrow(updatePostSchema, body)

    const post = await getPostById(id)

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this post' },
        { status: 403 }
      )
    }

    const updated = await updatePost(id, session.user.id, {
      content: validated.content,
      imageUrls: validated.imageUrls,
      scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('Failed to update post:', error)

    if (error instanceof Error) {
      if (error.message.includes('Cannot update published')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/posts/[id]
 * Delete a post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    try {
      await deletePost(id, session.user.id)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          return NextResponse.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          )
        }
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { success: false, error: 'Not authorized to delete this post' },
            { status: 403 }
          )
        }
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
