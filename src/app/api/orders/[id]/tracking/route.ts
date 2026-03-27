// GET /api/orders/[id]/tracking - Get tracking info for order
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrderTracking } from '@/lib/db-actions/order-tracking'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: orderId } = await params

    // Get session for user verification
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const trackingInfo = await getOrderTracking(orderId, userId)

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
    })
  } catch (error) {
    console.error('Error fetching tracking info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    )
  }
}
