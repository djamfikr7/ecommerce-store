'use server'

import { prisma } from '@/lib/prisma'
import type { CartItem, InventoryStatus } from '@/types/products'

// ============================================
// Get Variant Inventory
// ============================================

/**
 * Get the current stock quantity for a specific variant
 */
export async function getVariantInventory(variantId: string): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stockQuantity: true, trackInventory: true },
  })

  if (!variant) {
    throw new Error('Variant not found')
  }

  // If inventory tracking is disabled, return a high number
  if (!variant.trackInventory) {
    return 999999
  }

  return variant.stockQuantity
}

// ============================================
// Check Inventory Availability
// ============================================

/**
 * Check if requested quantity is available for a product/variant
 */
export async function checkInventory(
  productId: string,
  variantId?: string,
  quantity: number = 1
): Promise<InventoryStatus> {
  // If specific variant requested
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        stockQuantity: true,
        trackInventory: true,
        productId: true,
      },
    })

    if (!variant) {
      return {
        available: false,
        quantity: 0,
        variantId,
        productId,
      }
    }

    if (!variant.trackInventory) {
      return {
        available: true,
        quantity: 999999,
        variantId,
        productId,
      }
    }

    return {
      available: variant.stockQuantity >= quantity,
      quantity: variant.stockQuantity,
      variantId,
      productId,
    }
  }

  // Check main product stock or aggregate from variants
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      stockQuantity: true,
      trackInventory: true,
      variants: {
        select: {
          stockQuantity: true,
          trackInventory: true,
        },
      },
    },
  })

  if (!product) {
    return {
      available: false,
      quantity: 0,
      productId,
    }
  }

  if (!product.trackInventory) {
    // Check if any variants track inventory
    const trackingVariant = product.variants.find((v) => v.trackInventory)
    if (trackingVariant) {
      const totalStock = product.variants.reduce((sum, v) => sum + (v.trackInventory ? v.stockQuantity : 0), 0)
      return {
        available: totalStock >= quantity,
        quantity: totalStock,
        productId,
      }
    }
    // No tracking anywhere
    return {
      available: true,
      quantity: 999999,
      productId,
    }
  }

  return {
    available: product.stockQuantity >= quantity,
    quantity: product.stockQuantity,
    productId,
  }
}

// ============================================
// Reserve Inventory (for orders)
// ============================================

/**
 * Reserve inventory when an order is placed
 * Decreases stock quantity for the given items
 */
export async function reserveInventory(
  orderId: string,
  items: CartItem[]
): Promise<void> {
  // Use transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      if (item.variantId) {
        // Reserve from specific variant
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            stockQuantity: true,
            trackInventory: true,
            id: true,
          },
        })

        if (!variant) {
          throw new Error(`Variant ${item.variantId} not found`)
        }

        if (variant.trackInventory && variant.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ${item.variantId}. ` +
            `Requested: ${item.quantity}, Available: ${variant.stockQuantity}`
          )
        }

        if (variant.trackInventory) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        }

        // Also update parent product stock if it tracks inventory
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stockQuantity: true, trackInventory: true },
        })

        if (product?.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        }
      } else {
        // Reserve from main product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            stockQuantity: true,
            trackInventory: true,
          },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.trackInventory && product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.productId}. ` +
            `Requested: ${item.quantity}, Available: ${product.stockQuantity}`
          )
        }

        if (product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        }
      }
    }
  })
}

// ============================================
// Release Inventory (for cancelled orders)
// ============================================

/**
 * Release reserved inventory when an order is cancelled
 * Restores stock quantity for the given items
 */
export async function releaseInventory(orderId: string): Promise<void> {
  // Get the order items first
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          productId: true,
          variantId: true,
          quantity: true,
        },
      },
    },
  })

  if (!order) {
    throw new Error(`Order ${orderId} not found`)
  }

  // Use transaction to restore inventory
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.variantId) {
        // Release to specific variant
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            trackInventory: true,
            id: true,
          },
        })

        if (variant?.trackInventory) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          })
        }

        // Also restore to parent product if it tracks inventory
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { trackInventory: true },
        })

        if (product?.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          })
        }
      } else {
        // Release to main product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: {
            trackInventory: true,
          },
        })

        if (product?.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          })
        }
      }
    }
  })
}

// ============================================
// Adjust Inventory (Admin function)
// ============================================

/**
 * Manually adjust inventory for a variant
 * Can be positive (restock) or negative (correction)
 */
export async function adjustInventory(
  variantId: string,
  adjustment: number,
  reason: string
): Promise<void> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: {
      stockQuantity: true,
      trackInventory: true,
      id: true,
      productId: true,
    },
  })

  if (!variant) {
    throw new Error(`Variant ${variantId} not found`)
  }

  if (!variant.trackInventory) {
    throw new Error(`Cannot adjust inventory for variant ${variantId} - tracking is disabled`)
  }

  const newQuantity = variant.stockQuantity + adjustment

  if (newQuantity < 0) {
    throw new Error(
      `Adjustment would result in negative stock. ` +
      `Current: ${variant.stockQuantity}, Adjustment: ${adjustment}`
    )
  }

  // Update variant stock
  await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      stockQuantity: newQuantity,
    },
  })

  // Log the adjustment (you could add an AdminAuditLog entry here)
  console.log(
    `[Inventory Adjustment] Variant: ${variantId}, ` +
    `Change: ${adjustment > 0 ? '+' : ''}${adjustment}, ` +
    `New Quantity: ${newQuantity}, Reason: ${reason}`
  )
}

// ============================================
// Bulk Inventory Check
// ============================================

/**
 * Check inventory availability for multiple items
 */
export async function checkBulkInventory(
  items: CartItem[]
): Promise<{ available: boolean; items: InventoryStatus[] }> {
  const results = await Promise.all(
    items.map((item) =>
      checkInventory(item.productId, item.variantId || undefined, item.quantity)
    )
  )

  const allAvailable = results.every((result) => result.available)

  return {
    available: allAvailable,
    items: results,
  }
}
