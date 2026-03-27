'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ArrowUpDown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/components/wishlist/wishlist-context'
import { useCart } from '@/components/cart/cart-context'
import { formatPrice } from '@/lib/currency'
import { cn } from '@/lib/utils'
import type { WishlistItemWithProduct } from '@/types/wishlist'

type SortOption = 'date' | 'price-asc' | 'price-desc' | 'name'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date', label: 'Date Added' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
]

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist()
  const { addItem: addToCart } = useCart()
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [movingItems, setMovingItems] = useState<Set<string>>(new Set())

  const items = wishlist?.items ?? []

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      case 'price-asc':
        return (a.variant?.price ?? a.product.price) - (b.variant?.price ?? b.product.price)
      case 'price-desc':
        return (b.variant?.price ?? b.product.price) - (a.variant?.price ?? a.product.price)
      case 'name':
        return a.product.name.localeCompare(b.product.name)
      default:
        return 0
    }
  })

  const handleMoveToCart = async (item: WishlistItemWithProduct) => {
    setMovingItems((prev) => new Set(prev).add(item.id))
    try {
      // Add to cart
      await addToCart({
        productId: item.productId,
        variantId: item.variantId || undefined,
        quantity: 1,
        price: item.variant?.price ?? item.product.price,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images[0]?.url,
        variantName: item.variant?.name,
      })
      // Remove from wishlist
      await removeFromWishlist(item.id)
    } finally {
      setMovingItems((prev) => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  const handleRemove = async (itemId: string) => {
    await removeFromWishlist(itemId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-neo">
          <div className="h-8 w-48 bg-surface-overlay rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="neo-card p-4 animate-pulse">
                <div className="aspect-square rounded-xl bg-surface-overlay mb-4" />
                <div className="h-4 w-3/4 bg-surface-overlay rounded mb-2" />
                <div className="h-3 w-1/2 bg-surface-overlay rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-neo">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-accent-danger" />
            <h1 className="text-3xl font-bold text-slate-100">My Wishlist</h1>
            {items.length > 0 && (
              <span className="px-2 py-1 text-sm bg-surface-overlay text-slate-400 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="neo-inset appearance-none pl-3 pr-8 py-2 text-sm text-slate-300 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                aria-label="Sort wishlist by"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card p-12 text-center max-w-lg mx-auto"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-overlay flex items-center justify-center">
              <Heart className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-slate-400 mb-6">
              Save items you love by clicking the heart icon on any product.
              They will appear here for easy access later.
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="neo-card p-4 group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden neo-raised-sm mb-4">
                    <Link href={`/products/${item.product.slug}`}>
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-overlay flex items-center justify-center">
                          <Heart className="w-12 h-12 text-slate-500" />
                        </div>
                      )}
                    </Link>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Remove ${item.product.name} from wishlist`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Out of stock badge */}
                    {item.product.stockQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-surface-overlay text-white text-sm rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="block"
                    >
                      <h3 className="font-medium text-slate-100 group-hover:text-accent-primary transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>

                    {item.variant && (
                      <p className="text-sm text-slate-400">{item.variant.name}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-accent">
                        {formatPrice(item.variant?.price ?? item.product.price)}
                      </p>
                      {item.product.compareAtPrice && (
                        <p className="text-sm text-slate-500 line-through">
                          {formatPrice(item.product.compareAtPrice)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleMoveToCart(item)}
                        disabled={movingItems.has(item.id) || item.product.stockQuantity === 0}
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        {movingItems.has(item.id) ? (
                          <>
                            <span className="animate-spin">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </span>
                            Moving...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Move to Cart
                          </>
                        )}
                      </Button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 rounded-lg neo-raised-sm text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Date added */}
                  <p className="text-xs text-slate-500 mt-3">
                    Added {new Date(item.addedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
