import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getUserWishlist } from '@/lib/db-actions/wishlist'

/**
 * GET /api/wishlist
 * Get user's wishlist (auth required)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to view your wishlist' },
        { status: 401 }
      )
    }

    // Get wishlist
    const wishlist = await getUserWishlist(session.user.id)

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
