import type { Cart, CartItem, Product, ProductVariant, ProductImage } from '@prisma/client'

// Cart with all relations
export type CartWithItems = Cart & {
  items: CartItemWithProduct[]
}

export type CartItemWithProduct = CartItem & {
  product: ProductWithImages | null
  variant: ProductVariantWithImages | null
}

export type ProductWithImages = Product & {
  images: ProductImage[]
}

export type ProductVariantWithImages = ProductVariant & {
  images: ProductImage[]
}

// Cart input types
export interface CartItemInput {
  productId: string
  variantId?: string | null
  quantity: number
}

export interface UpdateCartItemInput {
  itemId: string
  quantity: number
}

export interface RemoveCartItemInput {
  itemId: string
}

// Cart totals
export interface CartTotals {
  subtotal: number // In cents
  itemCount: number
  estimatedTax: number // In cents (8% for now)
  total: number // In cents
}

// Checkout data
export interface CheckoutData {
  shippingAddressId?: string
  billingAddressId?: string
  email?: string
  notes?: string
}

// Checkout session response
export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

// Guest cart merge
export interface GuestCartMergeResult {
  merged: boolean
  cart: CartWithItems
  itemsMerged: number
}

// Cart badge count response
export interface CartItemCountResponse {
  count: number
}

// Error types
export class CartItemNotFoundError extends Error {
  constructor(productId: string, variantId?: string) {
    super(
      variantId
        ? `Product variant not found: ${productId}, ${variantId}`
        : `Product not found: ${productId}`
    )
    this.name = 'CartItemNotFoundError'
  }
}

export class InsufficientInventoryError extends Error {
  constructor(
    productId: string,
    variantId: string | undefined,
    requested: number,
    available: number
  ) {
    super(
      `Insufficient inventory for product ${productId}${variantId ? ` (variant: ${variantId})` : ''}. Requested: ${requested}, Available: ${available}`
    )
    this.name = 'InsufficientInventoryError'
  }
}

export class CartNotFoundError extends Error {
  constructor(cartId: string) {
    super(`Cart not found: ${cartId}`)
    this.name = 'CartNotFoundError'
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super('Cannot checkout with an empty cart')
    this.name = 'EmptyCartError'
  }
}

export class UnauthorizedCartAccessError extends Error {
  constructor() {
    super('Unauthorized access to cart')
    this.name = 'UnauthorizedCartAccessError'
  }
}
