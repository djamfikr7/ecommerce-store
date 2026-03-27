// Tracking type definitions for order tracking system

export interface TrackingInfo {
  carrier: string
  trackingNumber: string
  estimatedDelivery: Date | null
  currentStatus: TrackingStatus
  lastUpdated: Date
}

export interface TrackingEvent {
  timestamp: Date
  status: TrackingStatus
  location: string
  description: string
}

export interface TrackingUpdateInput {
  carrier: string
  trackingNumber: string
  estimatedDelivery?: Date
  currentStatus?: TrackingStatus
}

export type TrackingStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'

export interface OrderTrackingInfo {
  orderId: string
  orderNumber: string
  status: TrackingStatus
  trackingInfo: TrackingInfo | null
  trackingEvents: TrackingEvent[]
  estimatedDelivery: {
    date: Date
    formatted: string
  } | null
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  carrierName: string
  trackingUrl: string | null
}

export interface TrackingUpdateResult {
  success: boolean
  order?: {
    id: string
    trackingNumber: string | null
    carrier: string | null
    estimatedDelivery: Date | null
  }
  error?: string
}
