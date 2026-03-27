'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProductCard } from '@/types/products'

interface ProductCarouselProps {
  products: ProductCard[]
  title: string
  subtitle?: string
  viewAllHref?: string
  className?: string
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  viewAllHref,
  className,
}: ProductCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScrollability = () => {
    if (!scrollRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    checkScrollability()
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScrollability)
      }
      window.removeEventListener('resize', checkScrollability)
    }
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const scrollAmount = scrollRef.current.clientWidth * 0.8
    const targetScroll =
      scrollRef.current.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount)

    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className={cn('py-8', className)} aria-labelledby={`carousel-${title}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 id={`carousel-${title}`} className="text-2xl font-bold text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:flex items-center gap-1 text-sm text-accent-primary hover:text-accent-primary-hover transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-2 rounded-lg neo-raised-sm transition-all',
                canScrollLeft
                  ? 'hover:bg-surface-elevated text-slate-300 hover:text-white'
                  : 'opacity-30 cursor-not-allowed text-slate-500'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-2 rounded-lg neo-raised-sm transition-all',
                canScrollRight
                  ? 'hover:bg-surface-elevated text-slate-300 hover:text-white'
                  : 'opacity-30 cursor-not-allowed text-slate-500'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-4 sm:px-6 lg:px-8"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product, index) => {
            const primaryImage = product.images[0]
            const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{ scrollSnapAlign: 'start' }}
                className="flex-shrink-0 w-[280px] sm:w-[300px] neo-card p-4 group-hover:neo-card-hover"
              >
                <Link href={`/products/${product.slug}`} className="block">
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden neo-raised-sm mb-4">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.url}
                        alt={primaryImage.alt || product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="300px"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
                        <span className="text-slate-500">No image</span>
                      </div>
                    )}

                    {/* Badges */}
                    {isOnSale && (
                      <span className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold bg-accent-danger text-white rounded-full">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    {product.category && (
                      <span className="text-xs text-slate-400 uppercase tracking-wide">
                        {product.category.name}
                      </span>
                    )}

                    <h3 className="font-medium text-slate-100 line-clamp-2 group-hover:text-accent-primary transition-colors">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    {product.averageRating !== undefined && product.reviewCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={cn(
                                'w-3.5 h-3.5',
                                star <= Math.round(product.averageRating!)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              )}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          ({product.reviewCount})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-accent">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-slate-500 line-through">
                          ${(product.compareAtPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.article>
            )
          })}
        </div>

        {/* Gradient Fade Edges */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        {/* Mobile Scroll Indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1 md:hidden">
          <div className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
        </div>
      </div>
    </section>
  )
}

export function ProductCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8">
        <div className="h-8 w-48 bg-surface-overlay rounded animate-pulse" />
      </div>

      <div className="flex gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px] neo-card p-4">
            <div className="aspect-square rounded-xl bg-surface-overlay mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-surface-overlay rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-surface-overlay rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-surface-overlay rounded animate-pulse" />
              <div className="h-6 w-24 bg-surface-overlay rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
