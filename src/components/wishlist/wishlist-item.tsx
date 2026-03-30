'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
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
  const [isRemoving, setIsRemoving] = React.useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove(item.id)
    } catch (error) {
      setIsRemoving(false)
    }
  }

  const price = item.variant?.price ?? item.product.price
  const compareAtPrice = item.product.compareAtPrice
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0
  const isOutOfStock = (item.variant?.stockQuantity ?? item.product.stockQuantity) <= 0
  const imageUrl = item.product.images[0]?.url

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <div className="hover:bg-white/8 neo-raised-sm flex h-full flex-col overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm transition-all">
        {/* Product Image */}
        <Link
          href={`/products/${item.product.slug}`}
          className="relative aspect-square w-full overflow-hidden bg-white/10"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-16 w-16 text-white/20" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute left-3 top-3 rounded-lg bg-accent-danger px-2 py-1 text-xs font-bold text-white">
              -{discount}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              handleRemove()
            }}
            disabled={isRemoving}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-red-500/80 hover:text-white disabled:opacity-50"
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
          </button>
        </Link>

        {/* Product Details */}
        <div className="flex flex-1 flex-col p-4">
          <Link
            href={`/products/${item.product.slug}`}
            className="mb-2 line-clamp-2 font-semibold text-white transition-colors hover:text-accent-primary"
          >
            {item.product.name}
          </Link>

          {item.variant && <p className="mb-2 text-sm text-white/50">{item.variant.name}</p>}

          {/* Price */}
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-accent text-xl font-bold">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-white/40 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="text-sm font-medium text-red-400">Out of Stock</span>
            ) : (
              <span className="text-sm font-medium text-green-400">In Stock</span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <Button
              onClick={() => onMoveToCart(item.id)}
              disabled={isOutOfStock || isMoving || isRemoving}
              loading={isMoving}
              className="flex-1 gap-2"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              {isMoving ? 'Moving...' : 'Move to Cart'}
            </Button>
          </div>

          {/* Added Date */}
          <p className="mt-3 text-xs text-white/30">
            Added {new Date(item.addedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
