import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCart } from '@/lib/db-actions/cart'
import { CreateOrderInput } from '@/types/order'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId || !sessionId.startsWith('mock_session_')) {
      return NextResponse.json({ error: 'Invalid mock session' }, { status: 400 })
    }

    // Extract cartId from mock session (stored in URL params during creation)
    // For simplicity, we'll create a mock order from the first available cart or create empty
    const cart = await prisma.cart.findFirst({
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: { include: { images: true } },
          },
        },
        user: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'No cart found' }, { status: 404 })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems: CreateOrderInput['items'] = []
    const shippingCost = 999 // $9.99 default shipping

    for (const item of cart.items) {
      const price = item.variant?.price ?? item.product.price
      subtotal += price * item.quantity
      orderItems.push({
        productId: item.productId!,
        variantId: item.variantId ?? null,
        productName: item.product.name,
        variantName: item.variant?.name ?? null,
        sku: item.variant?.sku ?? item.product.sku ?? '',
        price,
        quantity: item.quantity,
      })
    }

    const tax = Math.round(subtotal * 0.08)
    const total = subtotal + shippingCost + tax

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `MOCK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: cart.userId ?? null,
          status: 'CONFIRMED',
          subtotal,
          shippingCost,
          tax,
          total,
          currency: 'USD',
          paymentStatus: 'SUCCEEDED',
          paymentMethod: 'MOCK_CARD',
          notes: `Mock order from checkout (session: ${sessionId})`,
        },
      })

      // Create order items
      for (const item of orderItems) {
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
            total: item.price * item.quantity,
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

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

      return newOrder
    })

    console.log('[MOCK] Created order:', order.orderNumber)

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber })
  } catch (error) {
    console.error('[MOCK] Order creation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
