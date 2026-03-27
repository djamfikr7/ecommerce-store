'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { addToCart } from '@/lib/db-actions/cart'
import type { WishlistWithItems, WishlistItemInput } from '@/types/wishlist'
import {
  WishlistItemNotFoundError,
  UnauthorizedWishlistAccessError,
  ProductOutOfStockError,
} from '@/types/wishlist'

// ============================================
// Get User Wishlist
// ============================================

/**
 * Get wishlist for a user with all items
 */
export async function getUserWishlist(userId: string): Promise<WishlistWithItems> {
  // Find or create wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
              variants: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  stockQuantity: true,
                },
              },
            },
          },
          variant: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { addedAt: 'desc' },
      },
    },
  })

  // Create wishlist if it doesn't exist
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
                variants: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    stockQuantity: true,
                  },
                },
              },
            },
            variant: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    })
  }

  return {
    ...wishlist,
    itemCount: wishlist.items.length,
  }
}

// ============================================
// Add to Wishlist
// ============================================

/**
 * Add a product to user's wishlist
 * - Returns existing item if already in wishlist
 */
export async function addToWishlist(
  userId: string,
  productId: string,
  variantId?: string | null
): Promise<import('@prisma/client').WishlistItem> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  if (!product.isActive) {
    throw new Error('Product is not available')
  }

  // Get or create wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
  })

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
    })
  }

  // Check if item already exists
  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
      variantId: variantId || null,
    },
  })

  if (existingItem) {
    return existingItem
  }

  // Verify variant exists if provided
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId, productId },
    })

    if (!variant) {
      throw new Error('Product variant not found')
    }
  }

  // Create wishlist item
  const item = await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
      variantId: variantId || null,
    },
  })

  // Revalidate wishlist page
  revalidatePath('/wishlist')
  revalidatePath('/account/wishlist')

  return item
}

// ============================================
// Remove from Wishlist
// ============================================

/**
 * Remove an item from user's wishlist
 */
export async function removeFromWishlist(userId: string, itemId: string): Promise<void> {
  // Verify item exists and belongs to user's wishlist
  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
    include: {
      wishlist: {
        select: { userId: true },
      },
    },
  })

  if (!item) {
    throw new WishlistItemNotFoundError(itemId)
  }

  if (item.wishlist.userId !== userId) {
    throw new UnauthorizedWishlistAccessError()
  }

  // Delete item
  await prisma.wishlistItem.delete({
    where: { id: itemId },
  })

  // Revalidate wishlist page
  revalidatePath('/wishlist')
  revalidatePath('/account/wishlist')
}

// ============================================
// Move to Cart
// ============================================

/**
 * Move a wishlist item to the user's cart
 * - Removes from wishlist
 * - Adds to cart (checks inventory)
 */
export async function moveToCart(
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<import('@prisma/client').CartItem> {
  // Get wishlist item with product info
  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
    include: {
      wishlist: {
        select: { userId: true },
      },
      product: {
        include: {
          variants: {
            where: item.variantId ? { id: item.variantId } : undefined,
          },
        },
      },
      variant: true,
    },
  })

  if (!item) {
    throw new WishlistItemNotFoundError(itemId)
  }

  if (item.wishlist.userId !== userId) {
    throw new UnauthorizedWishlistAccessError()
  }

  // Check inventory
  const stockQuantity = item.variant?.stockQuantity ?? item.product.stockQuantity
  const trackInventory = item.variant?.trackInventory ?? item.product.trackInventory

  if (trackInventory && stockQuantity < quantity) {
    throw new ProductOutOfStockError(item.productId)
  }

  // Get user cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    })
  }

  // Add to cart
  const cartItem = await addToCart(cart.id, {
    productId: item.productId,
    variantId: item.variantId,
    quantity,
  })

  // Remove from wishlist
  await prisma.wishlistItem.delete({
    where: { id: itemId },
  })

  // Revalidate pages
  revalidatePath('/wishlist')
  revalidatePath('/cart')
  revalidatePath('/account/wishlist')

  return cartItem
}

// ============================================
// Check Wishlist Item
// ============================================

/**
 * Check if a product is already in user's wishlist
 */
export async function checkWishlistItem(
  userId: string,
  productId: string
): Promise<boolean> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!wishlist) {
    return false
  }

  const item = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  })

  return item !== null
}

// ============================================
// Get Wishlist Count
// ============================================

/**
 * Get the number of items in user's wishlist
 */
export async function getWishlistCount(userId: string): Promise<number> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { _count: { select: { items: true } } },
  })

  return wishlist?._count.items ?? 0
}

// ============================================
// Clear Wishlist
// ============================================

/**
 * Remove all items from user's wishlist
 */
export async function clearWishlist(userId: string): Promise<void> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!wishlist) {
    return
  }

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id },
  })

  // Revalidate wishlist page
  revalidatePath('/wishlist')
  revalidatePath('/account/wishlist')
}

// ============================================
// Update Wishlist Item Note
// ============================================

/**
 * Update a note on a wishlist item (if needed in future)
 * Currently wishlist items don't have notes, but this could be added
 */
export async function updateWishlistItemNote(
  userId: string,
  itemId: string,
  _note: string
): Promise<void> {
  // Verify item belongs to user
  const item = await prisma.wishlistItem.findUnique({
    where: { id: itemId },
    include: {
      wishlist: {
        select: { userId: true },
      },
    },
  })

  if (!item) {
    throw new WishlistItemNotFoundError(itemId)
  }

  if (item.wishlist.userId !== userId) {
    throw new UnauthorizedWishlistAccessError()
  }

  // Note functionality would go here if added to schema
  // For now, this is a placeholder
}
