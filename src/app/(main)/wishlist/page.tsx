'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '@/components/wishlist/wishlist-context'
import { useCart } from '@/components/cart/cart-context'
import { WishlistItem } from '@/components/wishlist/wishlist-item'
import { EmptyWishlist } from '@/components/wishlist/empty-wishlist'
import { WishlistShare } from '@/components/wishlist/wishlist-share'
import { Button } from '@/components/ui/button'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, isLoading } = useWishlist()
  const { addItem } = useCart()
  const [movingToCart, setMovingToCart] = useState<string | null>(null)
  const [isMovingAll, setIsMovingAll] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleMoveToCart = async (itemId: string) => {
    const item = wishlist?.items.find((i) => i.id === itemId)
    if (!item) return

    setMovingToCart(itemId)
    try {
      const cartItem: {
        productId: string
        quantity: number
        price: number
        name: string
        slug: string
        variantId?: string
        image?: string
        variantName?: string
        sku?: string
      } = {
        productId: item.productId,
        quantity: 1,
        price: item.variant?.price ?? item.product.price,
        name: item.product.name,
        slug: item.product.slug,
      }

      if (item.variantId) cartItem.variantId = item.variantId
      if (item.product.images[0]?.url) cartItem.image = item.product.images[0].url
      if (item.variant?.name) cartItem.variantName = item.variant.name

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

    setIsMovingAll(true)
    try {
      for (const item of wishlist.items) {
        const stockQuantity = item.variant?.stockQuantity ?? item.product.stockQuantity
        if (stockQuantity <= 0) continue

        const cartItem: {
          productId: string
          quantity: number
          price: number
          name: string
          slug: string
          variantId?: string
          image?: string
          variantName?: string
        } = {
          productId: item.productId,
          quantity: 1,
          price: item.variant?.price ?? item.product.price,
          name: item.product.name,
          slug: item.product.slug,
        }

        if (item.variantId) cartItem.variantId = item.variantId
        if (item.product.images[0]?.url) cartItem.image = item.product.images[0].url
        if (item.variant?.name) cartItem.variantName = item.variant.name

        await addItem(cartItem)
      }
      await clearWishlist()
    } catch (error) {
      console.error('Failed to move all to cart:', error)
    } finally {
      setIsMovingAll(false)
    }
  }

  const handleClearWishlist = async () => {
    setIsClearing(true)
    try {
      await clearWishlist()
    } finally {
      setIsClearing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded-xl bg-white/5" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[420px] rounded-2xl bg-white/[0.03]" />
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
            className="mb-4 inline-flex items-center gap-2 text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-accent-danger/10 border-accent-danger/20 flex h-12 w-12 items-center justify-center rounded-2xl border">
                <Heart className="fill-accent-danger/30 h-6 w-6 text-accent-danger" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
                {!isEmpty && (
                  <p className="mt-0.5 text-sm text-white/40">
                    {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} saved
                  </p>
                )}
              </div>
            </div>

            {!isEmpty && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <WishlistShare wishlistId={wishlist.id} />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMoveAllToCart}
                  loading={isMovingAll}
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Move All to Cart
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearWishlist}
                  loading={isClearing}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {isEmpty ? (
          <EmptyWishlist />
        ) : (
          <>
            {/* Wishlist Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {wishlist.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <WishlistItem
                      item={item}
                      onRemove={removeFromWishlist}
                      onMoveToCart={handleMoveToCart}
                      isMoving={movingToCart === item.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Bottom Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Looking for more?</h3>
                  <p className="mt-1 text-sm text-white/40">
                    Discover new arrivals and trending products in our store.
                  </p>
                </div>
                <Link href="/shop">
                  <Button variant="outline" className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Browse Store
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
