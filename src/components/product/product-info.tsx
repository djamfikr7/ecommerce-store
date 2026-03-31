'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Check, Truck, Shield, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PriceDisplay } from './price-display'
import { RatingStars } from './rating-stars'
import { VariantSelector } from './variant-selector'
import { QuantitySelector } from './quantity-selector'
import { ShareButton } from '@/components/social/share-button'
import { useCart } from '@/components/cart/cart-context'
import type { ProductWithRelations, VariantWithInventory } from '@/types/products'

interface ProductInfoProps {
  product: ProductWithRelations
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<VariantWithInventory | null>(
    product.variants[0] || null,
  )
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const currentStock = selectedVariant?.stockQuantity ?? product.stockQuantity
  const isOutOfStock = currentStock === 0
  const isLowStock = currentStock > 0 && currentStock <= 10

  const stockStatus = isOutOfStock
    ? 'Out of Stock'
    : isLowStock
      ? `Low Stock (${currentStock} left)`
      : 'In Stock'

  const stockVariant = isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return

    setIsAdding(true)
    try {
      await addItem({
        productId: product.id,
        ...(selectedVariant?.id && { variantId: selectedVariant.id }),
        quantity,
        price,
        name: product.name,
        slug: product.slug,
        ...(product.images[0]?.url && { image: product.images[0].url }),
        ...(selectedVariant?.name && { variantName: selectedVariant.name }),
        ...(selectedVariant?.sku && { sku: selectedVariant.sku }),
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const price = selectedVariant?.price ?? product.price
  const compareAtPrice = product.compareAtPrice

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Category link */}
      {product.category && (
        <Link
          href={`/categories/${product.category.slug}`}
          className="text-sm text-accent-primary transition-colors hover:text-accent-primary-hover"
        >
          {product.category.name}
        </Link>
      )}

      {/* Product name */}
      <h1 className="text-3xl font-bold text-slate-100 md:text-4xl">{product.name}</h1>

      {/* Rating */}
      {product.averageRating !== undefined && (
        <div className="flex items-center gap-3">
          <RatingStars rating={product.averageRating} size="md" />
          <Link
            href={`/shop/${product.slug}#reviews`}
            className="text-sm text-slate-400 transition-colors hover:text-slate-300"
          >
            {product.reviewCount} reviews
          </Link>
        </div>
      )}

      {/* Price */}
      <div className="border-border-subtle border-y py-4">
        <PriceDisplay amount={price} compareAtAmount={compareAtPrice ?? null} size="lg" />
      </div>

      {/* Short description */}
      {product.description && (
        <p className="leading-relaxed text-slate-300">{product.description}</p>
      )}

      {/* Variant selector */}
      {product.variants.length > 0 && (
        <div>
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelect={setSelectedVariant}
          />
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={Math.min(10, currentStock || 10)}
          disabled={isOutOfStock}
        />
        <motion.div className="flex-1" whileTap={{ scale: isOutOfStock ? 1 : 0.97 }}>
          <Button
            size="lg"
            className="relative w-full overflow-hidden"
            disabled={isOutOfStock || isAdding}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={showSuccess ? { x: '100%' } : {}}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isAdding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Adding...
                </>
              ) : showSuccess ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                  Added!
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </span>
            {showSuccess && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-green-500/30"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </Button>
        </motion.div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={`h-5 w-5 transition-all ${isWishlisted ? 'scale-110 fill-accent-danger text-accent-danger' : ''}`}
          />
        </Button>
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        <Badge variant={stockVariant as 'success' | 'warning' | 'danger'}>{stockStatus}</Badge>
      </div>

      <Separator />

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Truck className="h-5 w-5 text-accent-primary" />
          <span>Free Shipping</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Shield className="h-5 w-5 text-accent-primary" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <RotateCcw className="h-5 w-5 text-accent-primary" />
          <span>Easy Returns</span>
        </div>
      </div>

      <Separator />

      {/* SKU */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>SKU:</span>
        <span className="font-mono text-slate-300">{selectedVariant?.sku ?? product.sku}</span>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Share */}
      <ShareButton
        product={{
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0]?.url ?? null,
          ...(product.description && { description: product.description }),
        }}
        variant="default"
        size="md"
      />
    </motion.div>
  )
}
