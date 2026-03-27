// Order tracking server actions
import { prisma } from '@/lib/prisma'
import { OrderTrackingInfo, TrackingEvent, TrackingUpdateInput, TrackingStatus } from '@/types/tracking'

const SHIPPING_METHOD_DELIVERY_DAYS: Record<string, number> = {
  standard: 5,
  express: 2,
  overnight: 1,
  '2-day': 2,
  international: 10,
  'international-express': 5,
}

const CARRIER_URLS: Record<string, string> = {
  'usps': 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  'ups': 'https://www.ups.com/track?tracknum=',
  'fedex': 'https://www.fedex.com/fedextrack/?trknbr=',
  'dhl': 'https://www.dhl.com/en/express/tracking.html?AWB=',
  'ontrac': 'https://www.ontrac.com/trackingresults.asp?trknbr=',
  'lasership': 'https://www.lasership.com/track',
}

function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const baseUrl = CARRIER_URLS[carrier.toLowerCase()]
  if (!baseUrl) return null
  return `${baseUrl}${trackingNumber}`
}

function getStatusLabel(status: TrackingStatus): string {
  const labels: Record<TrackingStatus, string> = {
    pending: 'Order Placed',
    processing: 'Processing',
    shipped: 'Shipped',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
  }
  return labels[status] || status
}

function simulateTrackingEvents(
  orderId: string,
  orderDate: Date,
  carrier: string | null,
  trackingNumber: string | null
): TrackingEvent[] {
  const events: TrackingEvent[] = []

  // Order placed event
  events.push({
    timestamp: orderDate,
    status: 'pending',
    location: 'Online',
    description: 'Order placed successfully',
  })

  // Payment confirmed
  events.push({
    timestamp: new Date(orderDate.getTime() + 1000 * 60 * 5), // 5 minutes later
    status: 'processing',
    location: 'Payment Processing Center',
    description: 'Payment confirmed, preparing for shipment',
  })

  // Processing complete
  events.push({
    timestamp: new Date(orderDate.getTime() + 1000 * 60 * 60 * 24), // 1 day later
    status: 'processing',
    location: 'Warehouse - Los Angeles, CA',
    description: 'Order packed and ready for shipping',
  })

  if (carrier && trackingNumber) {
    // Shipped
    events.push({
      timestamp: new Date(orderDate.getTime() + 1000 * 60 * 60 * 24 * 2), // 2 days later
      status: 'shipped',
      location: 'Shipping Facility',
      description: `Package picked up by ${carrier}`,
    })

    // In transit
    events.push({
      timestamp: new Date(orderDate.getTime() + 1000 * 60 * 60 * 24 * 3), // 3 days later
      status: 'in_transit',
      location: 'Distribution Center',
      description: 'Package in transit to destination',
    })
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export async function getOrderTracking(
  orderId: string,
  userId?: string
): Promise<OrderTrackingInfo | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shippingAddress: true,
    },
  })

  if (!order) return null

  // Verify ownership if userId provided
  if (userId && order.userId !== userId) {
    return null
  }

  const carrier = order.carrier
  const trackingNumber = order.trackingNumber

  const trackingEvents = simulateTrackingEvents(
    orderId,
    order.createdAt,
    carrier,
    trackingNumber
  )

  const trackingUrl = carrier && trackingNumber
    ? getCarrierTrackingUrl(carrier, trackingNumber)
    : null

  const estimatedDelivery = order.estimatedDelivery
    ? {
        date: order.estimatedDelivery,
        formatted: order.estimatedDelivery.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }
    : null

  const carrierName = carrier
    ? carrier.charAt(0).toUpperCase() + carrier.slice(1).toLowerCase()
    : 'Standard Shipping'

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status as TrackingStatus,
    trackingInfo: trackingNumber
      ? {
          carrier: carrier || 'Standard',
          trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          currentStatus: order.status as TrackingStatus,
          lastUpdated: order.updatedAt,
        }
      : null,
    trackingEvents,
    estimatedDelivery,
    shippingAddress: {
      name: order.shippingAddress.name,
      line1: order.shippingAddress.line1,
      line2: order.shippingAddress.line2 || undefined,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      postalCode: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
    },
    carrierName,
    trackingUrl,
  }
}

export async function getTrackingUpdates(
  orderId: string
): Promise<TrackingEvent[]> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      createdAt: true,
      carrier: true,
      trackingNumber: true,
    },
  })

  if (!order) return []

  return simulateTrackingEvents(
    orderId,
    order.createdAt,
    order.carrier,
    order.trackingNumber
  )
}

export async function updateTrackingInfo(
  orderId: string,
  data: TrackingUpdateInput
): Promise<{ success: boolean; order?: unknown; error?: string }> {
  try {
    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      return { success: false, error: 'Order not found' }
    }

    // Update tracking info
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        status: data.currentStatus || existingOrder.status,
      },
    })

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        trackingNumber: updatedOrder.trackingNumber,
        carrier: updatedOrder.carrier,
        estimatedDelivery: updatedOrder.estimatedDelivery,
      },
    }
  } catch (error) {
    console.error('Error updating tracking info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function getEstimatedDelivery(
  orderId: string
): Promise<{ date: Date; formatted: string } | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      createdAt: true,
      shippingMethod: true,
      estimatedDelivery: true,
    },
  })

  if (!order) return null

  // If already has estimated delivery, return it
  if (order.estimatedDelivery) {
    return {
      date: order.estimatedDelivery,
      formatted: order.estimatedDelivery.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }
  }

  // Calculate from shipping method
  const days = SHIPPING_METHOD_DELIVERY_DAYS[order.shippingMethod] || 5
  const estimatedDate = new Date(order.createdAt)
  estimatedDate.setDate(estimatedDate.getDate() + days)

  // Skip weekends
  while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
    estimatedDate.setDate(estimatedDate.getDate() + 1)
  }

  return {
    date: estimatedDate,
    formatted: estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

export async function getOrderStatusHistory(
  orderId: string
): Promise<Array<{ status: string; timestamp: Date; note?: string }>> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!order) return []

  // In a real implementation, you'd have an OrderStatusHistory table
  // For now, return current status as the only event
  return [
    {
      status: order.status,
      timestamp: order.createdAt,
    },
  ]
}
