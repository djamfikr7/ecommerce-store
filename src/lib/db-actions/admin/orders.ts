'use server'

import { prisma } from '@/lib/prisma'
import stripe from '@/lib/stripe'
import type {
  AdminOrderList,
  AdminOrderListParams,
  AdminOrderDetail,
  AdminOrderSummary,
  RefundResult,
} from '@/types/admin'
import type { Order, OrderStatus, PaymentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// Valid status transitions
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

/**
 * Get paginated list of orders for admin
 */
export async function adminGetOrders(
  params: AdminOrderListParams
): Promise<AdminOrderList> {
  const {
    page = 1,
    pageSize = 20,
    status,
    search,
    dateFrom,
    dateTo,
    sort = 'createdAt',
    order = 'desc',
  } = params

  const skip = (page - 1) * pageSize

  // Build where clause
  const where: Parameters<typeof prisma.order.findMany>[0]['where'] = {}

  // Status filter
  if (status && status !== 'all') {
    where.status = status as OrderStatus
  }

  // Search filter
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo)
    }
  }

  // Build order by
  const orderBy: Record<string, 'asc' | 'desc'> = {}
  if (sort === 'createdAt') {
    orderBy.createdAt = order
  } else if (sort === 'total') {
    orderBy.total = order
  } else if (sort === 'status') {
    orderBy.status = order
  }

  // Execute queries in parallel
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        items: {
          select: { quantity: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  // Format orders
  const formattedOrders: AdminOrderSummary[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    user: order.user
      ? { id: order.user.id, email: order.user.email, name: order.user.name }
      : null,
  }))

  return {
    orders: formattedOrders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get single order by ID for admin
 */
export async function adminGetOrderById(id: string): Promise<AdminOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, email: true, name: true, phone: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          variant: {
            select: { id: true, name: true, sku: true, attributes: true },
          },
        },
      },
    },
  })

  if (!order) {
    return null
  }

  // Parse shipping and billing addresses
  const shippingAddress = order.shippingAddress as {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone?: string | null
  }

  const billingAddress = order.billingAddress as {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2?: string | null
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone?: string | null
  }

  return {
    ...order,
    addresses: {
      shipping: shippingAddress,
      billing: billingAddress,
    },
  }
}

/**
 * Update order status with validation
 */
export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminId: string,
  note?: string
): Promise<Order> {
  // Get current order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Validate status transition
  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || []
  if (!allowedTransitions.includes(status)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${status}`
    )
  }

  const oldStatus = order.status

  // Update order in transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        notes: note ? `${order.notes || ''}\n[${new Date().toISOString()}] ${note}` : order.notes,
      },
    })

    // Handle inventory if cancelled
    if (status === 'CANCELLED' && (oldStatus === 'PENDING' || oldStatus === 'CONFIRMED')) {
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
      })

      for (const item of orderItems) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          })
        }
      }
    }

    // Create audit log
    await tx.adminAuditLog.create({
      data: {
        adminId,
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'Order',
        entityId: orderId,
        oldValue: { status: oldStatus },
        newValue: { status },
      },
    })

    return updated
  })

  // Send status email notification (async)
  sendOrderStatusEmail(orderId, status).catch((err) =>
    console.error('Failed to send order status email:', err)
  )

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath(`/orders/${orderId}`)

  return updatedOrder
}

/**
 * Issue refund for an order
 */
export async function adminIssueRefund(
  orderId: string,
  amount?: number,
  reason: string,
  adminId: string
): Promise<RefundResult> {
  // Get order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })

  if (!order) {
    return {
      success: false,
      message: 'Order not found',
      order: {} as Order,
    }
  }

  if (!order.stripePaymentIntentId) {
    return {
      success: false,
      message: 'No payment intent found for this order',
      order,
    }
  }

  if (order.paymentStatus === 'REFUNDED') {
    return {
      success: false,
      message: 'Order has already been fully refunded',
      order,
    }
  }

  // Calculate refund amount
  const refundAmount = amount || order.total

  // Validate refund amount
  if (refundAmount > order.total) {
    return {
      success: false,
      message: 'Refund amount exceeds order total',
      order,
    }
  }

  try {
    // Process refund via Stripe
    const stripeRefund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        orderId,
        reason,
        adminId,
      },
    })

    // Determine new payment status
    const newPaymentStatus: PaymentStatus =
      refundAmount >= order.total ? 'REFUNDED' : 'PARTIALLY_REFUNDED'

    // Calculate new order total for partial refund
    const newTotal = order.total - refundAmount

    // Update order
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          total: newTotal,
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === 'REFUNDED' ? 'REFUNDED' : order.status,
          notes: `${order.notes || ''}\n[${new Date().toISOString()}] Refund: ${refundAmount / 100} ${order.currency} - ${reason}`,
        },
      })

      // Release inventory for refunded items
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
      })

      // Calculate proportional refund per item
      const refundRatio = refundAmount / order.total

      for (const item of orderItems) {
        const itemRefundAmount = Math.round(item.total * refundRatio)
        if (itemRefundAmount > 0) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQuantity: { increment: Math.round(item.quantity * refundRatio) } },
            })
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: Math.round(item.quantity * refundRatio) } },
            })
          }
        }
      }

      // Create audit log
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: 'ISSUE_REFUND',
          entityType: 'Order',
          entityId: orderId,
          oldValue: { total: order.total, paymentStatus: order.paymentStatus },
          newValue: { refundAmount, newTotal, paymentStatus: newPaymentStatus },
        },
      })

      return updated
    })

    // Send refund confirmation email (async)
    sendRefundConfirmationEmail(orderId, refundAmount, order.currency, order.user?.email).catch(
      (err) => console.error('Failed to send refund confirmation email:', err)
    )

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath(`/orders/${orderId}`)

    return {
      success: true,
      refundId: stripeRefund.id,
      amount: refundAmount,
      message: `Successfully refunded ${refundAmount / 100} ${order.currency}`,
      order: updatedOrder,
    }
  } catch (error) {
    console.error('Refund error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process refund',
      order,
    }
  }
}

/**
 * Send order status change email (placeholder)
 */
async function sendOrderStatusEmail(orderId: string, status: OrderStatus): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })

  if (!order?.user?.email) return

  // TODO: Integrate with email service
  console.log(`[Email] Order ${order.orderNumber} status changed to ${status}`)
}

/**
 * Send refund confirmation email (placeholder)
 */
async function sendRefundConfirmationEmail(
  orderId: string,
  amount: number,
  currency: string,
  email?: string | null
): Promise<void> {
  if (!email) return

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) return

  // TODO: Integrate with email service
  console.log(`[Email] Refund confirmation sent for order ${order.orderNumber}: ${amount / 100} ${currency}`)
}
