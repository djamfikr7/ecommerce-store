import type { Wishlist, WishlistItem, Product, ProductImage, ProductVariant } from '@prisma/client'

// ============================================
// Input Types
// ============================================

/**
 * Input for adding item to wishlist
 */
export interface WishlistItemInput {
  productId: string
  variantId?: string | null
}

// ============================================
// Wishlist Item with Relations
// ============================================

/**
 * Wishlist item with product details
 */
export interface WishlistItemWithProduct {
  id: string
  wishlistId: string
  productId: string
  variantId: string | null
  addedAt: Date
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    stockQuantity: number
    images: ProductImage[]
    variants: {
      id: string
      name: string
      price: number | null
      stockQuantity: number
    }[]
  }
  variant: (ProductVariant & {
    images: ProductImage[]
  }) | null
}

// ============================================
// Wishlist Output Types
// ============================================

/**
 * Wishlist with all items and product details
 */
export interface WishlistWithItems extends Wishlist {
  items: WishlistItemWithProduct[]
  itemCount: number
}

// ============================================
// Error Types
// ============================================

/**
 * Error thrown when wishlist is not found
 */
export class WishlistNotFoundError extends Error {
  constructor(userId: string) {
    super(`Wishlist not found for user: ${userId}`)
    this.name = 'WishlistNotFoundError'
  }
}

/**
 * Error thrown when wishlist item is not found
 */
export class WishlistItemNotFoundError extends Error {
  constructor(itemId: string) {
    super(`Wishlist item not found: ${itemId}`)
    this.name = 'WishlistItemNotFoundError'
  }
}

/**
 * Error thrown when user doesn't own the wishlist item
 */
export class UnauthorizedWishlistAccessError extends Error {
  constructor() {
    super('You do not have permission to modify this wishlist')
    this.name = 'UnauthorizedWishlistAccessError'
  }
}

/**
 * Error thrown when product is out of stock
 */
export class ProductOutOfStockError extends Error {
  constructor(productId: string) {
    super(`Product is out of stock: ${productId}`)
    this.name = 'ProductOutOfStockError'
  }
}
