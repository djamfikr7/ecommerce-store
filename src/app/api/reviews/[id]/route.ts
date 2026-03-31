import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getReviewById, updateReview, deleteReview } from '@/lib/db-actions/reviews'
import { validateUpdateReview, validateReviewIdParam } from '@/lib/validators/reviews'

/**
 * GET /api/reviews/[id]
 * Get a single review by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID
    const idValidation = validateReviewIdParam({ id })
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Invalid review ID' },
        { status: 400 }
      )
    }

    const review = await getReviewById(id)

    if (!review) {
      return NextResponse.json(
        { error: 'Not found', message: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/reviews/[id]
 * Update a review (auth required, ownership verified)
 * Body: { rating?, title?, content? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update a review' },
        { status: 401 }
      )
    }

    // Validate ID
    const idValidation = validateReviewIdParam({ id })
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Invalid review ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = validateUpdateReview(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: validation.error.errors.map((e) => e.message).join(', '),
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Update review
    const review = await updateReview(id, session.user.id, validation.data)

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error updating review:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'ReviewNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
      if (error.name === 'UnauthorizedReviewAccessError') {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
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

/**
 * DELETE /api/reviews/[id]
 * Delete a review (auth required, ownership verified)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete a review' },
        { status: 401 }
      )
    }

    // Validate ID
    const idValidation = validateReviewIdParam({ id })
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', message: 'Invalid review ID' },
        { status: 400 }
      )
    }

    // Delete review
    await deleteReview(id, session.user.id)

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error) {
    console.error('Error deleting review:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.name === 'ReviewNotFoundError') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        )
      }
      if (error.name === 'UnauthorizedReviewAccessError') {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
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
