'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, Package, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WishlistItemWithProduct } from '@/types/wishlist'

interface WishlistItemProps {
  item: WishlistItemWithProduct
  onRemove: (itemId: string) => Promise<void>
  onMoveToCart: (itemId: string) => Promise<void>
  isMoving?: boolean
}

export function WishlistItem({
  item,
  onRemove,
  onMoveToCart,
  isMoving = false,
}: WishlistItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(item.id)
    } catch {
      setIsRemoving(false)
    }
  }

  const price = item.variant?.price ?? item.product.price
  const compareAtPrice = item.product.compareAtPrice
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0
  const stockQuantity = item.variant?.stockQuantity ?? item.product.stockQuantity
  const isOutOfStock = stockQuantity <= 0
  const isLowStock = stockQuantity > 0 && stockQuantity <= 5
  const imageUrl = item.product.images[0]?.url

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20">
        {/* Product Image */}
        <Link
          href={`/shop/${item.product.slug}`}
          className="relative aspect-square w-full overflow-hidden bg-white/[0.03]"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-white/15" />
            </div>
          )}

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          >
            <div className="flex h-full items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? 1 : 0.8 }}
                className="flex items-center gap-2"
              >
                <Eye className="h-5 w-5 text-white" />
                <span className="text-sm font-medium text-white">Quick View</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="shadow-accent-danger/30 absolute left-3 top-3 rounded-lg bg-accent-danger px-2.5 py-1 text-xs font-bold text-white shadow-lg"
            >
              -{discount}%
            </motion.div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Remove Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={isRemoving}
            className="absolute right-3 top-3 rounded-xl bg-black/40 p-2.5 text-white/70 backdrop-blur-md transition-all hover:bg-red-500/80 hover:text-white disabled:opacity-50"
            aria-label={`Remove ${item.product.name} from wishlist`}
          >
            {isRemoving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Heart className="h-4 w-4" />
              </motion.div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </motion.button>
        </Link>

        {/* Product Details */}
        <div className="flex flex-1 flex-col p-4">
          <Link
            href={`/shop/${item.product.slug}`}
            className="mb-1.5 line-clamp-2 text-sm font-semibold text-white transition-colors hover:text-accent-primary"
          >
            {item.product.name}
          </Link>

          {item.variant && <p className="mb-2 text-xs text-white/40">{item.variant.name}</p>}

          {/* Price */}
          <div className="mb-3 flex items-baseline gap-2">
            <span className="bg-gradient-to-r from-accent-primary to-purple-400 bg-clip-text text-lg font-bold text-transparent">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-white/30 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Only {stockQuantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                In Stock
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto">
            <Button
              onClick={() => onMoveToCart(item.id)}
              disabled={isOutOfStock || isMoving || isRemoving}
              loading={isMoving}
              className="w-full gap-2"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {isMoving ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>

          {/* Added Date */}
          <p className="mt-3 text-[11px] text-white/20">
            Added{' '}
            {new Date(item.addedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
