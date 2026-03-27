'use server'

import { prisma } from '@/lib/prisma'
import { multiplyPrice, addPrices } from '@/lib/currency'
import {
  CartWithItems,
  CartItemInput,
  CartTotals,
  CartItemNotFoundError,
  InsufficientInventoryError,
  CartNotFoundError,
} from '@/types/cart'
import { revalidatePath } from 'next/cache'

const TAX_RATE = 0.08 // 8% tax rate

/**
 * Get or create a cart for a user or guest
 */
export async function getOrCreateCart(userId?: string): Promise<CartWithItems> {
  if (userId) {
    // Find or create cart for logged-in user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: {
              include: { images: true },
            },
          },
        },
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
              variant: {
                include: { images: true },
              },
            },
          },
        },
      })
    }

    return cart as CartWithItems
  }

  // For guest carts, we need a session ID - this is handled by the caller
  throw new Error('Guest cart requires a session ID')
}

/**
 * Get cart by session ID (for guests)
 */
export async function getGuestCart(sessionId: string): Promise<CartWithItems | null> {
  const cart = await prisma.cart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: {
            include: { images: true },
          },
        },
      },
    },
  })

  return cart as CartWithItems | null
}

/**
 * Create a new guest cart
 */
export async function createGuestCart(sessionId: string): Promise<CartWithItems> {
  const cart = await prisma.cart.create({
    data: { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: {
            include: { images: true },
          },
        },
      },
    },
  })

  return cart as CartWithItems
}

/**
 * Get cart by ID with all relations
 */
export async function getCart(cartId: string): Promise<CartWithItems | null> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: {
            include: { images: true },
          },
        },
      },
    },
  })

  return cart as CartWithItems | null
}

/**
 * Get cart for user or guest by their identifiers
 */
export async function getCartByIdentifiers(
  userId?: string,
  sessionId?: string
): Promise<CartWithItems | null> {
  if (userId) {
    return getOrCreateCart(userId)
  }

  if (sessionId) {
    return getGuestCart(sessionId)
  }

  return null
}

/**
 * Add item to cart
 */
export async function addToCart(
  cartId: string,
  data: CartItemInput
): Promise<import('@prisma/client').CartItem> {
  const { productId, variantId, quantity } = data

  // Fetch product with variant to check availability and price
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: variantId ? { where: { id: variantId } } : false,
    },
  })

  if (!product) {
    throw new CartItemNotFoundError(productId, variantId)
  }

  let price = product.price
  let availableStock = product.stockQuantity

  // If variant is specified, use variant data
  if (variantId) {
    const variant = product.variants[0]
    if (!variant) {
      throw new CartItemNotFoundError(productId, variantId)
    }
    price = variant.price ?? product.price
    availableStock = variant.stockQuantity

    // Check variant inventory
    if (product.trackInventory || variant.trackInventory) {
      if (availableStock < quantity) {
        throw new InsufficientInventoryError(productId, variantId, quantity, availableStock)
      }
    }
  } else {
    // Check product inventory
    if (product.trackInventory) {
      if (availableStock < quantity) {
        throw new InsufficientInventoryError(productId, undefined, quantity, availableStock)
      }
    }
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId,
        productId,
        variantId: variantId || null,
      },
    },
  })

  let cartItem: import('@prisma/client').CartItem

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity
    const totalStock = availableStock

    if (product.trackInventory || (variantId && product.variants[0]?.trackInventory)) {
      if (newQuantity > totalStock) {
        throw new InsufficientInventoryError(
          productId,
          variantId,
          newQuantity,
          totalStock
        )
      }
    }

    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
        priceAtAdd: price, // Update price to latest
      },
    })
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
        priceAtAdd: price,
      },
    })
  }

  revalidatePath('/cart')
  revalidatePath('/')

  return cartItem
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  cartId: string,
  itemId: string,
  quantity: number
): Promise<import('@prisma/client').CartItem> {
  // Verify item belongs to cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId,
    },
    include: {
      product: true,
      variant: true,
    },
  })

  if (!existingItem) {
    throw new CartItemNotFoundError(cartId)
  }

  // If quantity is 0 or less, remove the item
  if (quantity <= 0) {
    await removeFromCart(cartId, itemId)
    return existingItem
  }

  // Check inventory
  const stockQuantity = existingItem.variant?.stockQuantity ?? existingItem.product.stockQuantity
  const trackInventory = existingItem.variant?.trackInventory ?? existingItem.product.trackInventory

  if (trackInventory && stockQuantity < quantity) {
    throw new InsufficientInventoryError(
      existingItem.productId,
      existingItem.variantId ?? undefined,
      quantity,
      stockQuantity
    )
  }

  // Update quantity
  const cartItem = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  })

  revalidatePath('/cart')
  revalidatePath('/')

  return cartItem
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartId: string, itemId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId,
    },
  })

  revalidatePath('/cart')
  revalidatePath('/')
}

/**
 * Clear all items from cart
 */
export async function clearCart(cartId: string): Promise<void> {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  })

  revalidatePath('/cart')
  revalidatePath('/')
}

/**
 * Get cart totals
 */
export async function getCartTotals(cartId: string): Promise<CartTotals> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  })

  if (!cart) {
    throw new CartNotFoundError(cartId)
  }

  // Calculate subtotal
  let subtotal = 0
  let itemCount = 0

  for (const item of cart.items) {
    const price = item.variant?.price ?? item.product.price
    subtotal = addPrices(subtotal, multiplyPrice(price, item.quantity))
    itemCount += item.quantity
  }

  // Calculate estimated tax (8%)
  const estimatedTax = Math.round(subtotal * TAX_RATE)

  // Calculate total
  const total = addPrices(subtotal, estimatedTax)

  return {
    subtotal,
    itemCount,
    estimatedTax,
    total,
  }
}

/**
 * Merge guest cart into user cart when guest logs in
 */
export async function mergeGuestCart(
  guestCartId: string,
  userId: string
): Promise<CartWithItems> {
  // Get guest cart
  const guestCart = await prisma.cart.findUnique({
    where: { id: guestCartId },
    include: { items: true },
  })

  if (!guestCart || guestCart.items.length === 0) {
    // Just return user cart if guest cart is empty
    return getOrCreateCart(userId)
  }

  // Get or create user cart
  const userCart = await getOrCreateCart(userId)

  // Merge items
  for (const guestItem of guestCart.items) {
    // Check if user already has this product/variant
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: userCart.id,
          productId: guestItem.productId!,
          variantId: guestItem.variantId,
        },
      },
    })

    if (existingItem) {
      // Update quantity (cap at 10)
      const newQuantity = Math.min(existingItem.quantity + guestItem.quantity, 10)
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Move item to user cart
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: guestItem.productId,
          variantId: guestItem.variantId,
          quantity: Math.min(guestItem.quantity, 10),
          priceAtAdd: guestItem.priceAtAdd,
        },
      })
    }
  }

  // Delete guest cart
  await prisma.cart.delete({
    where: { id: guestCartId },
  })

  revalidatePath('/cart')
  revalidatePath('/')

  // Return updated user cart
  return getOrCreateCart(userId)
}

/**
 * Get total item count in cart (for badge)
 */
export async function getCartItemCount(userId?: string, sessionId?: string): Promise<number> {
  let cart: { items: { quantity: number }[] } | null = null

  if (userId) {
    cart = await prisma.cart.findUnique({
      where: { userId },
      select: { items: { select: { quantity: true } } },
    })
  } else if (sessionId) {
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      select: { items: { select: { quantity: true } } },
    })
  }

  if (!cart) return 0

  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}
