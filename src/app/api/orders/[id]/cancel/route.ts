// POST /api/orders/[id]/cancel - Cancel order (user or admin)
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { sendOrderCancelled } from '@/lib/email'
import Stripe from 'stripe'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

// Valid cancellation reasons
const CANCELLATION_REASONS = [
  'Changed my mind',
  'Found better price elsewhere',
  'Ordered by mistake',
  'Item not needed',
  'Shipping time too long',
  'Other',
] as const

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: orderId } = await params

    // Get session for authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { reason } = body

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    if (!CANCELLATION_REASONS.includes(reason as typeof CANCELLATION_REASONS[number])) {
      return NextResponse.json(
        { error: 'Invalid cancellation reason' },
        { status: 400 }
      )
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check ownership or admin
    const isAdmin = session.user.role === 'admin'
    const isOwner = order.userId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'processing']
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    // Process refund if payment was made
    let refundId: string | null = null
    if (order.paymentStatus === 'paid' && order.stripePaymentIntentId) {
      try {
        // Create refund
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          reason: 'requested_by_customer',
        })
        refundId = refund.id

        console.log(`Refund processed: ${refundId} for order: ${order.orderNumber}`)
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError)
        // Continue with cancellation even if refund fails
        // Manual refund may be needed
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    })

    // Restore inventory (if inventory tracking is enabled)
    // This would be done in a transaction with the order update
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        })
      }
    })

    // Send cancellation email
    try {
      await sendOrderCancelled(orderId, reason)
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError)
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        refundId,
        message: 'Order cancelled successfully',
      },
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}
