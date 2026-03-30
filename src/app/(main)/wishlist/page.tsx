'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Share2, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '@/components/wishlist/wishlist-context'
import { useCart } from '@/components/cart/cart-context'
import { WishlistItem } from '@/components/wishlist/wishlist-item'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, isLoading } = useWishlist()
  const { addItem } = useCart()
  const router = useRouter()
  const [movingToCart, setMovingToCart] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const handleMoveToCart = async (itemId: string) => {
    const item = wishlist?.items.find((i) => i.id === itemId)
    if (!item) return

    setMovingToCart(itemId)
    try {
      const cartItem: any = {
        productId: item.productId,
        quantity: 1,
        price: item.variant?.price ?? item.product.price,
        name: item.product.name,
        slug: item.product.slug,
      }

      if (item.variantId) cartItem.variantId = item.variantId
      if (item.product.images[0]?.url) cartItem.image = item.product.images[0].url
      if (item.variant?.name) cartItem.variantName = item.variant.name
      if (item.variant?.sku) cartItem.sku = item.variant.sku

      await addItem(cartItem)
      await removeFromWishlist(itemId)
    } catch (error) {
      console.error('Failed to move to cart:', error)
    } finally {
      setMovingToCart(null)
    }
  }

  const handleMoveAllToCart = async () => {
    if (!wishlist?.items.length) return

    for (const item of wishlist.items) {
      try {
        const cartItem: any = {
          productId: item.productId,
          quantity: 1,
          price: item.variant?.price ?? item.product.price,
          name: item.product.name,
          slug: item.product.slug,
        }

        if (item.variantId) cartItem.variantId = item.variantId
        if (item.product.images[0]?.url) cartItem.image = item.product.images[0].url
        if (item.variant?.name) cartItem.variantName = item.variant.name
        if (item.variant?.sku) cartItem.sku = item.variant.sku

        await addItem(cartItem)
      } catch (error) {
        console.error('Failed to move item to cart:', error)
      }
    }
    await clearWishlist()
  }

  const handleShareWishlist = async () => {
    const url = `${window.location.origin}/wishlist/shared/${wishlist?.id}`
    setShareUrl(url)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist',
          text: 'Check out my wishlist!',
          url,
        })
      } catch (error) {
        // User cancelled or share failed
        await navigator.clipboard.writeText(url)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }

    setTimeout(() => setShareUrl(null), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-white/5" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !wishlist || wishlist.items.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/shop"
            className="mb-4 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-accent-danger" />
              <h1 className="text-4xl font-bold text-white">My Wishlist</h1>
              {!isEmpty && (
                <span className="bg-accent-danger/20 rounded-full px-3 py-1 text-sm font-semibold text-accent-danger">
                  {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {!isEmpty && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleShareWishlist} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  {shareUrl ? 'Link Copied!' : 'Share'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMoveAllToCart}
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Move All to Cart
                </Button>
                <Button variant="destructive" size="sm" onClick={clearWishlist} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-white/5 p-12 text-center backdrop-blur-sm"
          >
            <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-white/5">
              <Heart className="h-16 w-16 text-white/30" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">Your wishlist is empty</h2>
            <p className="mb-6 text-white/60">
              Save items you love to your wishlist and shop them later
            </p>
            <Button onClick={() => router.push('/shop')} size="lg">
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {wishlist.items.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromWishlist}
                  onMoveToCart={handleMoveToCart}
                  isMoving={movingToCart === item.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
