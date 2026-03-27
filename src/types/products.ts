import { Prisma } from '@prisma/client'

// ============================================
// Product Types
// ============================================

/**
 * Product list query parameters
 */
export interface ProductListParams {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  sort?: ProductSortOption
  page?: number
  pageSize?: number
}

/**
 * Available sort options for product lists
 */
export type ProductSortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'popular'

/**
 * Product list response with pagination
 */
export interface ProductListResponse {
  products: ProductWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Base Product type from Prisma
 */
export type ProductBase = Prisma.ProductGetPayload<{}>

/**
 * ProductImage type from Prisma
 */
export type ProductImageBase = Prisma.ProductImageGetPayload<{}>

/**
 * ProductVariant type from Prisma
 */
export type ProductVariantBase = Prisma.ProductVariantGetPayload<{}>

/**
 * Review type from Prisma
 */
export type ReviewBase = Prisma.ReviewGetPayload<{}>

/**
 * Category type from Prisma
 */
export type CategoryBase = Prisma.CategoryGetPayload<{}>

/**
 * ProductTag type from Prisma
 */
export type ProductTagBase = Prisma.ProductTagGetPayload<{}>

/**
 * Lightweight product card for list views
 */
export interface ProductCard {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: {
    id: string
    url: string
    alt?: string | null
  }[]
  category?: {
    id: string
    name: string
    slug: string
  } | null
  variants?: {
    id: string
    price?: number | null
    stockQuantity: number
  }[]
  reviewCount?: number
  averageRating?: number
}

/**
 * Full product with all relations for detail page
 */
export interface ProductWithRelations {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number
  compareAtPrice?: number | null
  sku: string
  stockQuantity: number
  isFeatured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    slug: string
  } | null
  images: {
    id: string
    url: string
    alt?: string | null
    width?: number | null
    height?: number | null
    sortOrder: number
  }[]
  variants: VariantWithInventory[]
  tags: {
    id: string
    name: string
  }[]
  reviews: {
    id: string
    rating: number
    user: {
      name?: string | null
    }
  }[]
  averageRating?: number
  reviewCount?: number
}

/**
 * Featured product with price range from variants
 */
export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  price: number
  minPrice: number
  maxPrice: number
  compareAtPrice?: number | null
  images: {
    id: string
    url: string
    alt?: string | null
  }[]
  category?: {
    id: string
    name: string
    slug: string
  } | null
  averageRating?: number
  reviewCount: number
}

/**
 * Related product for product detail page
 */
export interface RelatedProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  images: {
    id: string
    url: string
    alt?: string | null
  }[]
  category?: {
    id: string
    name: string
    slug: string
  } | null
  averageRating?: number
  reviewCount: number
}

/**
 * Search result product (lightweight for autocomplete)
 */
export interface ProductSearchResult {
  id: string
  name: string
  slug: string
  price: number
  images: {
    id: string
    url: string
  }[]
}

/**
 * Category with product count
 */
export interface CategoryWithCount {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  isActive: boolean
  productCount: number
  children?: CategoryWithCount[]
}

// ============================================
// Variant Types
// ============================================

/**
 * Variant with inventory information
 */
export interface VariantWithInventory {
  id: string
  name: string
  sku: string
  price?: number | null
  stockQuantity: number
  lowStockThreshold: number
  trackInventory: boolean
  attributes: Record<string, string | number | boolean>
  images?: {
    id: string
    url: string
  }[]
}

// ============================================
// Inventory Types
// ============================================

/**
 * Inventory check result
 */
export interface InventoryStatus {
  available: boolean
  quantity: number
  variantId?: string
  productId: string
}

/**
 * Cart item for inventory operations
 */
export interface CartItem {
  productId: string
  variantId?: string | null
  quantity: number
}

// ============================================
// API Response Types
// ============================================

/**
 * API error response
 */
export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
}

/**
 * API success response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
}
