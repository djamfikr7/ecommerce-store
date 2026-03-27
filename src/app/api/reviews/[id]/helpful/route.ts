import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { markHelpful } from '@/lib/db-actions/reviews'

/**
 * POST /api/reviews/[id]/helpful
 * Mark a review as helpful (auth required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params

    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to mark a review as helpful' },
        { status: 401 }
      )
    }

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Review ID is required' },
        { status: 400 }
      )
    }

    // Mark as helpful
    await markHelpful(reviewId, session.user.id)

    return NextResponse.json({ success: true, message: 'Review marked as helpful' })
  } catch (error) {
    console.error('Error marking review as helpful:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'ReviewNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
