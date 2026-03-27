'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductCarousel, ProductCarouselSkeleton } from './product-carousel'
import type { ProductCard } from '@/types/products'

type RecommendationType = 'user' | 'product' | 'trending' | 'recently_viewed'

interface RecommendationsSectionProps {
  type: RecommendationType
  productId?: string
  userId?: string
  limit?: number
  title?: string
  subtitle?: string
  viewAllHref?: string
  className?: string
}

const TYPE_CONFIG: Record<
  RecommendationType,
  { title: string; subtitle?: string }
> = {
  user: {
    title: 'Recommended for You',
    subtitle: 'Based on your browsing history',
  },
  product: {
    title: 'You May Also Like',
    subtitle: 'Customers who viewed this also viewed',
  },
  trending: {
    title: 'Trending Now',
    subtitle: 'Popular among shoppers',
  },
  recently_viewed: {
    title: 'Recently Viewed',
    subtitle: 'Items you have seen',
  },
}

export function RecommendationsSection({
  type,
  productId,
  userId,
  limit = 10,
  title,
  subtitle,
  viewAllHref,
  className,
}: RecommendationsSectionProps) {
  const [products, setProducts] = useState<ProductCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const config = TYPE_CONFIG[type]
  const displayTitle = title || config.title
  const displaySubtitle = subtitle || config.subtitle

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          type,
          limit: limit.toString(),
        })

        if (productId) params.set('productId', productId)
        if (userId) params.set('userId', userId)

        const response = await fetch(`/api/recommendations?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations')
        }

        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations')
        // Provide demo data for development
        setProducts(getDemoProducts(limit))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [type, productId, userId, limit])

  if (isLoading) {
    return (
      <section className={className} aria-busy="true">
        <ProductCarouselSkeleton count={4} />
      </section>
    )
  }

  if (error) {
    // Don't show section if there's an error and no products
    if (products.length === 0) {
      return null
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <ProductCarousel
        products={products}
        title={displayTitle}
        subtitle={displaySubtitle}
        viewAllHref={viewAllHref}
      />
    </section>
  )
}

// Demo products for development/fallback
function getDemoProducts(count: number): ProductCard[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `demo-${i}`,
    name: `Demo Product ${i + 1}`,
    slug: `demo-product-${i + 1}`,
    price: Math.floor(Math.random() * 20000) + 1000,
    compareAtPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 20000) + 15000 : null,
    images: [
      {
        id: `demo-img-${i}`,
        url: `https://picsum.photos/seed/${i}/400/400`,
        alt: `Demo product ${i + 1}`,
      },
    ],
    category: {
      id: 'demo-cat',
      name: 'Demo Category',
      slug: 'demo-category',
    },
    variants: [],
    reviewCount: Math.floor(Math.random() * 100),
    averageRating: Math.random() * 2 + 3,
  }))
}

// Pre-configured recommendation sections
export function RecentlyViewedSection({
  userId,
  limit,
  className,
}: Omit<RecommendationsSectionProps, 'type'>) {
  return (
    <RecommendationsSection
      type="recently_viewed"
      userId={userId}
      limit={limit ?? 8}
      className={className}
    />
  )
}

export function TrendingSection({
  limit,
  className,
}: { limit?: number; className?: string }) {
  return (
    <RecommendationsSection
      type="trending"
      limit={limit ?? 10}
      className={className}
    />
  )
}

export function RelatedProductsSection({
  productId,
  limit,
  className,
}: { productId: string; limit?: number; className?: string }) {
  return (
    <RecommendationsSection
      type="product"
      productId={productId}
      limit={limit ?? 8}
      className={className}
    />
  )
}

export function PersonalizedRecommendationsSection({
  userId,
  limit,
  className,
}: { userId: string; limit?: number; className?: string }) {
  return (
    <RecommendationsSection
      type="user"
      userId={userId}
      limit={limit ?? 12}
      className={className}
    />
  )
}
