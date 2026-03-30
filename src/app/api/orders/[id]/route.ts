import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { getOrderById, cancelOrder } from '@/lib/db-actions/orders'
import { OrderNotFoundError, OrderAccessDeniedError, OrderCancellationError } from '@/types/order'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/orders/[id]
 * Get single order details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN'

    const order = await getOrderById(id, session.user.id, isAdmin)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error getting order:', error)

    if (error instanceof OrderNotFoundError) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (error instanceof OrderAccessDeniedError) {
      return NextResponse.json(
        { error: 'Access denied to this order' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders/[id]
 * Cancel order
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { reason } = body

    const order = await cancelOrder(id, session.user.id, reason)

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error('Error cancelling order:', error)

    if (error instanceof OrderNotFoundError) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (error instanceof OrderAccessDeniedError) {
      return NextResponse.json(
        { error: 'Access denied to this order' },
        { status: 403 }
      )
    }

    if (error instanceof OrderCancellationError) {
      return NextResponse.json(
        { error: 'Cannot cancel this order', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
