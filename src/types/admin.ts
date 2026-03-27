/**
 * Admin Type Definitions
 * Types for admin dashboard, product management, order management, and analytics
 */

import type {
  Product,
  ProductVariant,
  ProductImage,
  ProductTag,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  User,
  Address,
  AnalyticsEvent,
  UserRole,
  PaymentStatus,
} from '@prisma/client'

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  todayVisitors: number
  pendingOrders: number
  lowStockAlerts: number
  recentOrders: RecentOrder[]
  salesChart: SalesChartData[]
  topProducts: TopProduct[]
}

export interface RecentOrder {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: Date
  user: {
    name: string | null
    email: string
  } | null
}

export interface SalesChartData {
  date: string
  revenue: number
  orderCount: number
}

export interface TopProduct {
  id: string
  name: string
  slug: string
  image: string | null
  orderCount: number
  revenue: number
}

export interface SalesReportParams {
  startDate: string
  endDate: string
  groupBy: 'day' | 'week' | 'month'
}

export interface SalesReport {
  data: SalesReportData[]
  summary: {
    totalRevenue: number
    totalOrders: number
    avgOrderValue: number
    refundAmount: number
  }
}

export interface SalesReportData {
  period: string
  revenue: number
  orderCount: number
  avgOrderValue: number
  refundAmount: number
}

export interface InventoryReportItem {
  id: string
  name: string
  slug: string
  sku: string
  category: {
    id: string
    name: string
    slug: string
  } | null
  variants: VariantInventory[]
  totalStock: number
  soldQuantity: number
  revenue: number
  isLowStock: boolean
  isOutOfStock: boolean
}

export interface VariantInventory {
  id: string
  name: string
  sku: string
  stockQuantity: number
  lowStockThreshold: number
  price: number | null
}

// ============================================
// Product Types
// ============================================

export interface AdminProductListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  status?: 'active' | 'inactive' | 'all'
  sort?: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface AdminProductList {
  products: AdminProductListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  price: number
  compareAtPrice: number | null
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  category: {
    id: string
    name: string
    slug: string
  } | null
  image: string | null
  variantsCount: number
  totalSold: number
  createdAt: Date
  updatedAt: Date
}

export interface AdminProductDetail extends Product {
  category: Category | null
  images: ProductImage[]
  variants: ProductVariant[]
  tags: ProductTag[]
  totalSold: number
  totalRevenue: number
}

export interface CreateProductInput {
  name: string
  description?: string
  categoryId?: string
  price: number
  compareAtPrice?: number
  costPrice?: number
  sku: string
  barcode?: string
  stockQuantity?: number
  lowStockThreshold?: number
  trackInventory?: boolean
  isFeatured?: boolean
  isActive?: boolean
  images?: {
    url: string
    alt?: string
    width?: number
    height?: number
    sortOrder?: number
  }[]
  variants?: {
    name: string
    sku: string
    price?: number
    stockQuantity?: number
    lowStockThreshold?: number
    trackInventory?: boolean
    attributes: Record<string, string | number | boolean>
  }[]
  tags?: string[]
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  slug?: string
}

// ============================================
// Order Types
// ============================================

export interface AdminOrderListParams {
  page?: number
  pageSize?: number
  status?: OrderStatus | 'all'
  search?: string
  dateFrom?: string
  dateTo?: string
  sort?: 'createdAt' | 'total' | 'status'
  order?: 'asc' | 'desc'
}

export interface AdminOrderList {
  orders: AdminOrderSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminOrderSummary {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  total: number
  itemCount: number
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
  } | null
}

export interface AdminOrderDetail extends Order {
  items: (OrderItem & {
    product: Pick<Product, 'id' | 'name' | 'slug'> | null
    variant: Pick<ProductVariant, 'id' | 'name' | 'sku' | 'attributes'> | null
  })[]
  user: Pick<User, 'id' | 'email' | 'name' | 'phone'> | null
  addresses: {
    shipping: AddressData
    billing: AddressData
  }
}

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

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  message: string
  order: Order
}

// ============================================
// User Types
// ============================================

export interface AdminUserListParams {
  page?: number
  pageSize?: number
  role?: UserRole | 'all'
  search?: string
  sort?: 'createdAt' | 'totalSpent' | 'orderCount'
  order?: 'asc' | 'desc'
}

export interface AdminUserList {
  users: AdminUserSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminUserSummary {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  orderCount: number
  totalSpent: number
  createdAt: Date
}

export interface AdminUserDetail extends User {
  addresses: Address[]
  ordersCount: number
  totalSpent: number
  lastOrderAt: Date | null
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsQueryParams {
  type?: string
  dateFrom?: string
  dateTo?: string
  userId?: string
  sessionId?: string
  page?: number
  pageSize?: number
}

export interface TrackEventInput {
  type: string
  userId?: string
  sessionId?: string
  productId?: string
  orderId?: string
  variantId?: string
  categoryId?: string
  cartValue?: number
  currency?: string
  metadata?: Record<string, unknown>
}

export interface ProductAnalytics {
  productId: string
  productName: string
  views: number
  addToCartCount: number
  purchaseCount: number
  conversionRate: number
  revenue: number
  dailyViews: DailyViewData[]
}

export interface DailyViewData {
  date: string
  views: number
}

export interface RevenueAnalytics {
  dateRange: {
    startDate: string
    endDate: string
  }
  revenueByDay: {
    date: string
    revenue: number
    orderCount: number
  }[]
  avgOrderValue: number
  avgOrderValueTrend: number
  topProducts: {
    id: string
    name: string
    revenue: number
    quantity: number
  }[]
}

// ============================================
// Stripe Types
// ============================================

export interface StripeBalance {
  available: number
  pending: number
  currency: string
}

export interface StripePayoutInfo {
  nextPayoutDate: string
  nextPayoutAmount: number
  interval: 'daily' | 'weekly' | 'monthly'
  weekday?: number
  dayOfMonth?: number
}

export interface StripeTransactionParams {
  limit?: number
  startingAfter?: string
  endingBefore?: string
}

export interface StripeTransaction {
  id: string
  type: 'charge' | 'refund' | 'payout' | 'fee'
  amount: number
  currency: string
  status: string
  description?: string
  created: string
  orderId?: string
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}
