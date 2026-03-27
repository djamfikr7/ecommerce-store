import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrders, getOrderSummaries } from '@/lib/db-actions/orders'

/**
 * GET /api/orders
 * Get user's orders
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const summary = searchParams.get('summary') === 'true'

    if (summary) {
      // Return lightweight summary list
      const orders = await getOrderSummaries(session.user.id)
      return NextResponse.json({ orders })
    }

    // Return full paginated orders
    const result = await getOrders(session.user.id, page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting orders:', error)
    return NextResponse.json(
      { error: 'Failed to get orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
