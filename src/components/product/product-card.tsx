'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceDisplay } from './price-display'
import { RatingStars } from './rating-stars'
import { cn } from '@/lib/utils'
import type { ProductCard as ProductCardType } from '@/types/products'

interface ProductCardProps {
  product: ProductCardType
  variant?: 'grid' | 'list' | 'compact'
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const primaryImage = product.images[0]
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price
  const isOutOfStock = !product.variants?.some(v => v.stockQuantity > 0) && product.stockQuantity === 0

  if (variant === 'compact') {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
      >
        <div className="relative w-12 h-12 rounded-lg overflow-hidden neo-raised-sm">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full bg-surface-overlay" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{product.name}</p>
          <PriceDisplay amount={product.price} compareAtAmount={product.compareAtPrice} />
        </div>
      </Link>
    )
  }

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="neo-card p-4 group"
      >
        <Link href={`/products/${product.slug}`} className="flex gap-6">
          <div className="relative w-40 h-40 rounded-xl overflow-hidden neo-raised-sm flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="160px"
              />
            ) : (
              <div className="w-full h-full bg-surface-overlay" />
            )}
            {isOnSale && (
              <Badge variant="danger" className="absolute top-2 left-2">
                Sale
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="absolute top-2 left-2">
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  {product.category && (
                    <span className="text-xs text-slate-400 uppercase tracking-wide">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-100 mt-1 group-hover:text-accent-primary transition-colors">
                    {product.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Add to wishlist
                  }}
                  className="p-2 rounded-full hover:bg-surface-elevated transition-colors"
                  aria-label="Add to wishlist"
                >
                  <Heart className="h-5 w-5 text-slate-400 hover:text-accent-danger" />
                </button>
              </div>

              {product.averageRating !== undefined && (
                <div className="mt-2">
                  <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} size="sm" />
                </div>
              )}

              <p className="text-sm text-slate-400 mt-3 line-clamp-2">
                {product.category?.name} - Premium quality product
              </p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <PriceDisplay amount={product.price} compareAtAmount={product.compareAtPrice} />
              <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Grid variant (default)
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="neo-card p-4 group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-xl overflow-hidden neo-raised-sm mb-4">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
              <span className="text-slate-500">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOnSale && (
              <Badge variant="danger">Sale</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
            {!isOnSale && !isOutOfStock && product.createdAt &&
              new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
              <Badge variant="success">New</Badge>
            )}
          </div>

          {/* Quick actions overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" className="w-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-2">
          {product.category && (
            <span className="text-xs text-slate-400 uppercase tracking-wide">
              {product.category.name}
            </span>
          )}

          <h3 className="font-medium text-slate-100 line-clamp-2 group-hover:text-accent-primary transition-colors">
            {product.name}
          </h3>

          {product.averageRating !== undefined && (
            <RatingStars rating={product.averageRating} reviewCount={product.reviewCount} size="sm" />
          )}

          <PriceDisplay amount={product.price} compareAtAmount={product.compareAtPrice} />
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="neo-card p-4">
        <div className="flex gap-6">
          <Skeleton className="w-40 h-40 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-3/4 mt-2" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
            <div className="flex justify-between items-end">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="neo-card p-4">
      <Skeleton className="aspect-square rounded-xl mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  )
}
