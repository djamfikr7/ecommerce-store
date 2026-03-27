'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlist } from './wishlist-context'
import { formatPrice } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
  onMoveToCart?: (itemId: string) => Promise<void>
}

export function WishlistDrawer({ isOpen, onClose, onMoveToCart }: WishlistDrawerProps) {
  const { wishlist, removeFromWishlist, isLoading } = useWishlist()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const itemCount = wishlist?.itemCount ?? 0
  const items = wishlist?.items ?? []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#16213e] shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-label="Wishlist"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-accent-danger" />
                <h2 className="text-xl font-bold text-white">Wishlist</h2>
                {itemCount > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold bg-accent-danger/20 text-accent-danger rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-white/5" />
                        <div className="h-3 w-1/2 rounded bg-white/5" />
                        <div className="h-3 w-1/4 rounded bg-white/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-white/30" />
                  </div>
                  <p className="text-white/60 mb-4">Your wishlist is empty</p>
                  <Button onClick={onClose} variant="outline">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4" role="list">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur neo-raised-sm"
                      >
                        {/* Product Image */}
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={onClose}
                          className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10"
                        >
                          {item.product.images[0] ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={onClose}
                            className="font-semibold text-white hover:text-accent-primary transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <p className="text-sm text-white/50 mt-0.5">{item.variant.name}</p>
                          )}
                          <p className="text-accent font-semibold mt-1">
                            {formatPrice(item.variant?.price ?? item.product.price)}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onMoveToCart?.(item.id)}
                              className="flex-1 gap-1"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Move to Cart
                            </Button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                              aria-label={`Remove ${item.product.name} from wishlist`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#0f0f23]">
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  View Full Wishlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
