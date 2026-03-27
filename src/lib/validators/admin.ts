import { z } from 'zod'
import type { OrderStatus, UserRole } from '@prisma/client'

// ============================================
// Pagination Schema
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================
// Admin Product Schemas
// ============================================

export const adminProductListSchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sort: z.enum(['name', 'price', 'stock', 'createdAt', 'updatedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.number().int().min(0, 'Price must be positive'),
  compareAtPrice: z.number().int().min(0).optional(),
  costPrice: z.number().int().min(0).optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  barcode: z.string().max(100).optional(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  trackInventory: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    sortOrder: z.number().optional(),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    price: z.number().int().min(0).optional(),
    stockQuantity: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(3),
    trackInventory: z.boolean().default(true),
    attributes: z.record(z.union([z.string(), z.number(), z.boolean()])),
  })).optional(),
  tags: z.array(z.string()).optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  slug: z.string().optional(),
})

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  reason: z.string().min(1, 'Reason is required'),
})

// ============================================
// Admin Order Schemas
// ============================================

export const adminOrderListSchema = paginationSchema.extend({
  status: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sort: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  note: z.string().max(500).optional(),
})

export const issueRefundSchema = z.object({
  amount: z.number().int().min(1).optional(),
  reason: z.string().min(1, 'Reason is required').max(500),
})

// ============================================
// Admin User Schemas
// ============================================

export const adminUserListSchema = paginationSchema.extend({
  role: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['createdAt', 'totalSpent', 'orderCount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
})

// ============================================
// Admin Analytics Schemas
// ============================================

export const analyticsQuerySchema = paginationSchema.extend({
  type: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
})

export const trackEventSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  variantId: z.string().optional(),
  categoryId: z.string().optional(),
  cartValue: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

export const salesReportSchema = dateRangeSchema.extend({
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
})

// ============================================
// Admin Stripe Schemas
// ============================================

export const stripeTransactionSchema = paginationSchema.extend({
  startingAfter: z.string().optional(),
  endingBefore: z.string().optional(),
})

// ============================================
// Validation Helper Functions
// ============================================

export function validatePagination(params: unknown) {
  return paginationSchema.safeParse(params)
}

export function validateAdminProductList(params: unknown) {
  return adminProductListSchema.safeParse(params)
}

export function validateCreateProduct(data: unknown) {
  return createProductSchema.safeParse(data)
}

export function validateUpdateProduct(data: unknown) {
  return updateProductSchema.safeParse(data)
}

export function validateUpdateInventory(data: unknown) {
  return updateInventorySchema.safeParse(data)
}

export function validateAdminOrderList(params: unknown) {
  return adminOrderListSchema.safeParse(params)
}

export function validateUpdateOrderStatus(data: unknown) {
  return updateOrderStatusSchema.safeParse(data)
}

export function validateIssueRefund(data: unknown) {
  return issueRefundSchema.safeParse(data)
}

export function validateAdminUserList(params: unknown) {
  return adminUserListSchema.safeParse(params)
}

export function validateUpdateUserRole(data: unknown) {
  return updateUserRoleSchema.safeParse(data)
}

export function validateAnalyticsQuery(params: unknown) {
  return analyticsQuerySchema.safeParse(params)
}

export function validateTrackEvent(data: unknown) {
  return trackEventSchema.safeParse(data)
}

export function validateDateRange(params: unknown) {
  return dateRangeSchema.safeParse(params)
}

export function validateSalesReport(params: unknown) {
  return salesReportSchema.safeParse(params)
}

export function validateStripeTransaction(params: unknown) {
  return stripeTransactionSchema.safeParse(params)
}
