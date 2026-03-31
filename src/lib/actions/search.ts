'use server'

import { searchProducts, getProducts } from '@/lib/db-actions/products'
import type { ProductSearchResult, ProductCard } from '@/types/products'

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
}

export interface SearchResults {
  products: ProductCard[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  query: string
  filters: SearchFilters
}

/**
 * Search products with autocomplete (lightweight)
 */
export async function searchProductsAutocomplete(
  query: string,
  limit: number = 10,
): Promise<ProductSearchResult[]> {
  if (!query.trim()) {
    return []
  }

  return searchProducts(query, limit)
}

/**
 * Full search with filters and pagination
 */
export async function searchProductsFull(
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 20,
): Promise<SearchResults> {
  const { category, minPrice, maxPrice, minRating, inStock, sort = 'relevance' } = filters

  // Map 'relevance' to 'newest' for now (can be enhanced with proper relevance scoring)
  const sortOption = sort === 'relevance' ? 'newest' : sort

  const result = await getProducts({
    search: query,
    ...(category && { category }),
    ...(minPrice !== undefined && { minPrice }),
    ...(maxPrice !== undefined && { maxPrice }),
    ...(minRating !== undefined && { minRating }),
    ...(inStock !== undefined && { inStock }),
    sort: sortOption,
    page,
    pageSize,
  })

  return {
    products: result.products,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: Math.ceil(result.total / result.pageSize),
    query,
    filters,
  }
}

/**
 * Get popular search terms (mock for now - can be enhanced with analytics)
 */
export async function getPopularSearches(limit?: number): Promise<string[]> {
  const maxLimit = limit ?? 5
  // TODO: Implement with analytics tracking
  return ['laptop', 'headphones', 'smartphone', 'camera', 'watch'].slice(0, maxLimit)
}

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query.trim()) {
    return []
  }

  // TODO: Implement with proper search suggestion algorithm
  // For now, return empty array
  return []
}
