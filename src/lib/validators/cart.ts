import { z } from 'zod'

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().cuid({ message: 'Invalid product ID' }),
  variantId: z.string().cuid({ message: 'Invalid variant ID' }).optional(),
  quantity: z
    .number()
    .int({ message: 'Quantity must be an integer' })
    .min(1, { message: 'Quantity must be at least 1' })
    .max(10, { message: 'Maximum quantity per item is 10' }),
})

export const updateCartItemSchema = z.object({
  itemId: z.string().cuid({ message: 'Invalid item ID' }),
  quantity: z
    .number()
    .int({ message: 'Quantity must be an integer' })
    .min(0, { message: 'Quantity cannot be negative' })
    .max(10, { message: 'Maximum quantity per item is 10' }),
})

export const removeFromCartSchema = z.object({
  itemId: z.string().cuid({ message: 'Invalid item ID' }),
})

// Checkout validation schemas
export const checkoutDataSchema = z.object({
  shippingAddressId: z.string().cuid({ message: 'Invalid shipping address ID' }).optional(),
  billingAddressId: z.string().cuid({ message: 'Invalid billing address ID' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  notes: z.string().max(500, { message: 'Notes cannot exceed 500 characters' }).optional(),
})

export const checkoutSessionSchema = z.object({
  cartId: z.string().cuid({ message: 'Invalid cart ID' }),
  returnUrl: z.string().url({ message: 'Invalid return URL' }).optional(),
  cancelUrl: z.string().url({ message: 'Invalid cancel URL' }).optional(),
})

// Webhook validation schemas
export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      metadata: z.record(z.string(), z.string()).optional(),
    }),
  }),
})

// Type exports from schemas
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
export type CheckoutDataInput = z.infer<typeof checkoutDataSchema>
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>
export type WebhookEventInput = z.infer<typeof webhookEventSchema>

/**
 * Validate add to cart input
 */
export function validateAddToCart(data: unknown) {
  return addToCartSchema.safeParse(data)
}

/**
 * Validate update cart item input
 */
export function validateUpdateCartItem(data: unknown) {
  return updateCartItemSchema.safeParse(data)
}

/**
 * Validate remove from cart input
 */
export function validateRemoveFromCart(data: unknown) {
  return removeFromCartSchema.safeParse(data)
}

/**
 * Validate checkout data input
 */
export function validateCheckoutData(data: unknown) {
  return checkoutDataSchema.safeParse(data)
}

/**
 * Validate checkout session input
 */
export function validateCheckoutSession(data: unknown) {
  return checkoutSessionSchema.safeParse(data)
}
