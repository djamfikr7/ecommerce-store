'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Share2, Check, Twitter, Facebook, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PriceDisplay } from './price-display'
import { RatingStars } from './rating-stars'
import { VariantSelector } from './variant-selector'
import { QuantitySelector } from './quantity-selector'
import { Breadcrumb } from './breadcrumb'
import type { ProductWithRelations, VariantWithInventory } from '@/types/products'

interface ProductInfoProps {
  product: ProductWithRelations
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantWithInventory | null>(
    product.variants[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const isOutOfStock = !product.variants.some((v) => v.stockQuantity > 0) && product.stockQuantity === 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 10

  const stockStatus = isOutOfStock
    ? 'Out of Stock'
    : isLowStock
    ? `Low Stock (${product.stockQuantity} left)`
    : 'In Stock'

  const stockVariant = isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
    { label: product.name, href: `/products/${product.slug}` },
  ]

  const handleShare = async (type: 'twitter' | 'facebook' | 'copy') => {
    const url = window.location.href

    if (type === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(url)}`,
        '_blank'
      )
    } else if (type === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      )
    } else if (type === 'copy') {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    setShowShareMenu(false)
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
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbs} />

      {/* Product header */}
      <div>
        {product.category && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-sm text-accent-primary hover:text-accent-primary-hover transition-colors"
          >
            {product.category.name}
          </Link>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mt-2">{product.name}</h1>
      </div>

      {/* Rating */}
      {product.averageRating !== undefined && (
        <div className="flex items-center gap-3">
          <RatingStars rating={product.averageRating} size="md" />
          <Link
            href={`/products/${product.slug}#reviews`}
            className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            {product.reviewCount} reviews
          </Link>
        </div>
      )}

      {/* Price */}
      <div className="py-4 border-y border-border-subtle">
        <PriceDisplay amount={price} compareAtAmount={compareAtPrice} size="lg" />
      </div>

      {/* Short description */}
      {product.description && (
        <p className="text-slate-300 leading-relaxed">{product.description}</p>
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
      <div className="flex flex-col sm:flex-row gap-4">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={Math.min(10, product.stockQuantity || 10)}
          disabled={isOutOfStock}
        />
        <Button
          size="lg"
          className="flex-1"
          disabled={isOutOfStock}
          aria-label="Add to cart"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsWishlisted(!isWishlisted)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? 'fill-accent-danger text-accent-danger' : ''}`}
          />
        </Button>
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        <Badge variant={stockVariant as 'success' | 'warning' | 'danger'}>
          {stockStatus}
        </Badge>
      </div>

      <Separator />

      {/* SKU */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>SKU:</span>
        <span className="font-mono text-slate-300">{product.sku}</span>
      </div>

      {/* Share */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShareMenu(!showShareMenu)}
          aria-expanded={showShareMenu}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 mt-2 w-48 neo-card p-2 z-10"
          >
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-surface-elevated transition-colors"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-surface-elevated transition-colors"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-surface-elevated transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-accent-success" /> : <Link2 className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
