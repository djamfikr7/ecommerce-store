'use server'

import { prisma } from '@/lib/prisma'
import { multiplyPrice, addPrices } from '@/lib/currency'
import {
  OrderWithRelations,
  OrderSummary,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderStatusChangeEvent,
  OrderNotFoundError,
  OrderAccessDeniedError,
  InvalidOrderStatusTransitionError,
  OrderCancellationError,
} from '@/types/order'
import stripe from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

/**
 * Get paginated orders for a user
 */
export async function getOrders(
  userId: string,
  page = 1,
  pageSize = 10
): Promise<{
  orders: OrderWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                attributes: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ])

  return {
    orders: orders as OrderWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Get single order by ID with ownership verification
 */
export async function getOrderById(
  orderId: string,
  userId?: string,
  isAdmin = false
): Promise<OrderWithRelations> {
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
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              attributes: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    throw new OrderNotFoundError(orderId)
  }

  // Verify ownership unless admin
  if (!isAdmin && userId && order.userId !== userId) {
    throw new OrderAccessDeniedError(orderId)
  }

  return order as OrderWithRelations
}

/**
 * Get order by Stripe checkout session ID
 */
export async function getOrderBySessionId(
  checkoutSessionId: string
): Promise<OrderWithRelations | null> {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { stripePaymentIntentId: checkoutSessionId },
        // Also check metadata if we stored it differently
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              attributes: true,
            },
          },
        },
      },
    },
  })

  return order as OrderWithRelations | null
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(
  page = 1,
  pageSize = 20
): Promise<{
  orders: OrderWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const skip = (page - 1) * pageSize

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                sku: true,
                attributes: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count(),
  ])

  return {
    orders: orders as OrderWithRelations[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Create order directly (not from checkout)
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderWithRelations> {
  // Generate order number
  const orderCount = await prisma.order.count()
  const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`

  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        status: 'PENDING',
        subtotal: input.subtotal,
        shippingCost: input.shippingCost,
        tax: input.tax,
        total: input.total,
        currency: input.currency || 'USD',
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        paymentMethod: input.paymentMethod,
        stripePaymentIntentId: input.stripePaymentIntentId,
        idempotencyKey: input.idempotencyKey,
        notes: input.notes,
        paymentStatus: input.stripePaymentIntentId ? 'PROCESSING' : 'PENDING',
      },
    })

    // Create order items
    for (const item of input.items) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: multiplyPrice(item.price, item.quantity),
        },
      })

      // Update inventory
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      }
    }

    return newOrder
  })

  // Fetch complete order with relations
  return getOrderById(order.id)
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  input: UpdateOrderStatusInput
): Promise<OrderWithRelations> {
  const { status, adminId } = input

  // Get current order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    throw new OrderNotFoundError(orderId)
  }

  // Validate status transition
  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || []
  if (!allowedTransitions.includes(status)) {
    throw new InvalidOrderStatusTransitionError(orderId, order.status, status)
  }

  // Update order in transaction
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status },
    })

    // Create audit log
    if (adminId) {
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: 'UPDATE_ORDER_STATUS',
          entityType: 'Order',
          entityId: orderId,
          oldValue: { status: order.status },
          newValue: { status },
        },
      })
    }

    return updated
  })

  // Trigger status change notification
  notifyOrderStatusChange({
    orderId,
    previousStatus: order.status,
    newStatus: status,
    changedBy: adminId || 'system',
  }).catch((err) => console.error('Failed to send status change notification:', err))

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/admin/orders')

  return getOrderById(updatedOrder.id)
}

/**
 * Cancel order (user or admin)
 */
export async function cancelOrder(
  orderId: string,
  userId: string,
  reason?: string
): Promise<OrderWithRelations> {
  // Get order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new OrderNotFoundError(orderId)
  }

  // Check if user owns the order or is admin
  // For now, just check ownership
  if (order.userId !== userId) {
    throw new OrderAccessDeniedError(orderId)
  }

  // Check if order can be cancelled
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new OrderCancellationError(
      orderId,
      `Order cannot be cancelled in ${order.status} status`
    )
  }

  // Process cancellation
  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${order.notes || ''}\nCancellation reason: ${reason}` : order.notes,
      },
    })

    // Release inventory
    for (const item of order.items) {
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

    // Process refund if payment was made
    if (order.stripePaymentIntentId && order.paymentStatus === 'SUCCEEDED') {
      try {
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        })

        await tx.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'REFUNDED' },
        })
      } catch (error) {
        console.error('Failed to process refund:', error)
        // Continue with cancellation even if refund fails
        // Admin can handle refund manually
      }
    }
  })

  // Send cancellation notification
  sendOrderCancellationEmail(orderId, reason).catch((err) =>
    console.error('Failed to send cancellation email:', err)
  )

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')

  return getOrderById(orderId)
}

/**
 * Get order summaries for list display
 */
export async function getOrderSummaries(
  userId: string
): Promise<OrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      items: {
        select: { quantity: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  }))
}

/**
 * Notify about order status change (placeholder)
 */
async function notifyOrderStatusChange(event: OrderStatusChangeEvent): Promise<void> {
  // TODO: Integrate with notification service
  console.log(`[Notification] Order ${event.orderId} status changed: ${event.previousStatus} -> ${event.newStatus}`)
}

/**
 * Send cancellation email (placeholder)
 */
async function sendOrderCancellationEmail(orderId: string, reason?: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })

  if (!order) return

  // TODO: Integrate with email service
  console.log(`[Email] Order ${order.orderNumber} cancellation notification`)
  console.log(`[Email] Reason: ${reason || 'Not provided'}`)
}
