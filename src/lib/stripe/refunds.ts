import stripe from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderCancelled } from '@/lib/email'
import Stripe from 'stripe'

export interface ProcessRefundParams {
  orderId: string
  amount?: number
  reason?: string
  adminId?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  status?: string
  error?: string
}

export async function processRefund(params: ProcessRefundParams): Promise<RefundResult> {
  const { orderId, amount, reason, adminId } = params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return { success: false, error: 'Order not found' }
  }

  if (!order.stripePaymentIntentId) {
    return { success: false, error: 'No Stripe payment intent associated with this order' }
  }

  if (order.paymentStatus === 'REFUNDED' || order.paymentStatus === 'PARTIALLY_REFUNDED') {
    return { success: false, error: 'Order has already been refunded' }
  }

  if (order.paymentStatus !== 'SUCCEEDED') {
    return {
      success: false,
      error: `Cannot refund order with payment status: ${order.paymentStatus}`,
    }
  }

  const refundAmount = amount ?? order.total

  if (refundAmount > order.total) {
    return { success: false, error: 'Refund amount exceeds order total' }
  }

  if (refundAmount <= 0) {
    return { success: false, error: 'Refund amount must be greater than zero' }
  }

  try {
    const refundReason = mapRefundReason(reason)
    const refundParams: {
      paymentIntentId: string
      amount: number
      reason?: Stripe.RefundCreateParams.Reason
      metadata?: Record<string, string>
    } = {
      paymentIntentId: order.stripePaymentIntentId,
      amount: refundAmount,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        adminId: adminId ?? '',
        originalReason: reason ?? '',
      },
    }

    if (refundReason) {
      refundParams.reason = refundReason
    }

    const refund = await createStripeRefund(refundParams)

    const isFullRefund = refundAmount >= order.total
    const newPaymentStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
    const newOrderStatus = isFullRefund ? 'REFUNDED' : order.status

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: newPaymentStatus,
        status: newOrderStatus,
      },
    })

    if (isFullRefund) {
      await restoreInventory(order.items)
    }

    if (adminId) {
      await prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'ISSUE_REFUND',
          entityType: 'Order',
          entityId: orderId,
          newValue: {
            refundId: refund.id,
            amount: refundAmount,
            reason: reason ?? '',
            paymentStatus: newPaymentStatus,
          },
        },
      })
    }

    sendOrderCancelled(orderId, reason ?? 'Refund processed').catch((err) =>
      console.error('[Stripe Refund] Failed to send cancellation email:', err),
    )

    console.log(
      `[Stripe Refund] Processed ${isFullRefund ? 'full' : 'partial'} refund for order ${order.orderNumber}: ${refund.id}`,
    )

    const result: RefundResult = {
      success: true,
      refundId: refund.id,
      amount: refundAmount,
    }
    if (refund.status) {
      result.status = refund.status
    }

    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown refund error'
    console.error('[Stripe Refund] Failed to process refund:', message)
    return { success: false, error: message }
  }
}

export async function createStripeRefund(params: {
  paymentIntentId: string
  amount: number
  reason?: Stripe.RefundCreateParams.Reason
  metadata?: Record<string, string>
}): Promise<Stripe.Refund> {
  if (!stripe) {
    throw new Error('Stripe is not initialized')
  }

  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: params.paymentIntentId,
    amount: params.amount,
  }

  if (params.reason) {
    refundParams.reason = params.reason
  }
  if (params.metadata) {
    refundParams.metadata = params.metadata
  }

  return stripe.refunds.create(refundParams)
}

export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  console.log(`[Stripe Webhook] charge.refunded: ${charge.id}`)

  const paymentIntentId = charge.payment_intent as string | null
  if (!paymentIntentId) {
    console.warn('[Stripe] Charge refunded without payment intent:', charge.id)
    return
  }

  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!order) {
    console.warn(`[Stripe] No order found for payment intent: ${paymentIntentId}`)
    return
  }

  const refundAmount = charge.amount_refunded
  const isFullRefund = refundAmount >= order.total

  const newPaymentStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED'
  const newOrderStatus = isFullRefund ? 'REFUNDED' : order.status

  if (order.paymentStatus === newPaymentStatus && order.status === newOrderStatus) {
    console.log(`[Stripe] Order ${order.orderNumber} already updated for refund`)
    return
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: newPaymentStatus,
      status: newOrderStatus,
    },
  })

  if (isFullRefund) {
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    })

    if (orderWithItems) {
      await restoreInventory(orderWithItems.items)
    }
  }

  console.log(
    `[Stripe] Order ${order.orderNumber} updated: payment=${newPaymentStatus}, status=${newOrderStatus}`,
  )
}

async function restoreInventory(
  items: Array<{ productId: string; variantId: string | null; quantity: number }>,
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stockQuantity: { increment: item.quantity } },
      })
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      })
    }
  }

  console.log(`[Stripe Refund] Inventory restored for ${items.length} items`)
}

function mapRefundReason(reason?: string): Stripe.RefundCreateParams.Reason | undefined {
  if (!reason) return undefined

  const lower = reason.toLowerCase()
  if (lower.includes('duplicate')) return 'duplicate'
  if (lower.includes('fraudulent')) return 'fraudulent'
  if (lower.includes('requested')) return 'requested_by_customer'
  return undefined
}

export async function getRefundStatus(refundId: string): Promise<Stripe.Refund | null> {
  if (!stripe) return null

  try {
    return await stripe.refunds.retrieve(refundId)
  } catch {
    return null
  }
}

export async function listRefundsForOrder(paymentIntentId: string): Promise<Stripe.Refund[]> {
  if (!stripe) return []

  const refunds = await stripe.refunds.list({
    payment_intent: paymentIntentId,
  })

  return refunds.data
}
