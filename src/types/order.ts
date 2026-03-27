import type { Order, OrderItem, Product, ProductVariant, User, Address } from '@prisma/client'
import type { OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client'

// Order with relations
export type OrderWithRelations = Order & {
  items: OrderItemWithProduct[]
  user: Pick<User, 'id' | 'email' | 'name'> | null
}

// Order item with product
export type OrderItemWithProduct = OrderItem & {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images'> | null
  variant: Pick<ProductVariant, 'id' | 'name' | 'sku' | 'attributes'> | null
}

// Simplified product for order item
export type OrderItemProductSnapshot = {
  id: string
  name: string
  slug: string
  imageUrl?: string
}

// Order status type (re-export for convenience)
export { OrderStatus, PaymentStatus, PaymentMethod }

// Create order input
export interface CreateOrderInput {
  userId?: string | null
  items: CreateOrderItemInput[]
  shippingAddress: AddressData
  billingAddress: AddressData
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency?: string
  paymentMethod?: PaymentMethod
  stripePaymentIntentId?: string
  idempotencyKey?: string
  notes?: string
}

export interface CreateOrderItemInput {
  productId: string
  variantId?: string | null
  productName: string
  variantName?: string | null
  sku: string
  price: number // In cents (locked at order time)
  quantity: number
}

// Address data for embedded storage
export interface AddressData {
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

// Update order status input
export interface UpdateOrderStatusInput {
  status: OrderStatus
  adminId?: string
}

// Order summary for list view
export interface OrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: Date
}

// Paginated orders response
export interface PaginatedOrdersResponse {
  orders: OrderWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Order status change event
export interface OrderStatusChangeEvent {
  orderId: string
  previousStatus: OrderStatus
  newStatus: OrderStatus
  changedBy: string // admin ID or 'system' or user ID
  reason?: string
}

// Error types
export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`)
    this.name = 'OrderNotFoundError'
  }
}

export class OrderAccessDeniedError extends Error {
  constructor(orderId: string) {
    super(`Access denied to order: ${orderId}`)
    this.name = 'OrderAccessDeniedError'
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(orderId: string, from: OrderStatus, to: OrderStatus) {
    super(
      `Invalid order status transition for ${orderId}: ${from} -> ${to}`
    )
    this.name = 'InvalidOrderStatusTransitionError'
  }
}

export class OrderCancellationError extends Error {
  constructor(orderId: string, reason: string) {
    super(`Cannot cancel order ${orderId}: ${reason}`)
    this.name = 'OrderCancellationError'
  }
}
