'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { CartItem } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'
import { EmptyCart } from '@/components/cart/empty-cart'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { cart, updateItem, removeItem, isLoading } = useCart()
  const router = useRouter()
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>()
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleCheckout = () => {
    router.push('/checkout')
  }

  const handleApplyCoupon = async (code: string) => {
    setIsApplyingCoupon(true)
    try {
      const response = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Invalid coupon code')
      }

      setAppliedCoupon(code)
    } catch (error) {
      throw error
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setIsApplyingCoupon(true)
    try {
      await fetch('/api/cart/coupon', { method: 'DELETE' })
      setAppliedCoupon(undefined)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-surface-base to-surface-elevated py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-white/5" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="neo-flat h-32 rounded-2xl bg-white/5" />
                ))}
              </div>
              <div className="neo-flat h-96 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface-base to-surface-elevated py-12">
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
          <div className="flex items-center gap-4">
            <ShoppingBag className="h-8 w-8 text-accent-primary" />
            <h1 className="text-4xl font-bold text-white">Shopping Cart</h1>
            {!isEmpty && (
              <span className="neo-raised-sm rounded-full bg-accent-primary px-3 py-1 text-sm font-semibold text-white">
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            )}
          </div>
        </motion.div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="neo-flat mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm"
              >
                <h3 className="mb-4 text-lg font-semibold text-white">Need Help?</h3>
                <div className="space-y-3 text-sm text-white/60">
                  <p>
                    <span className="font-medium text-white">Free Shipping:</span> On orders over
                    $100
                  </p>
                  <p>
                    <span className="font-medium text-white">Returns:</span> 30-day return policy
                  </p>
                  <p>
                    <span className="font-medium text-white">Support:</span>{' '}
                    <Link href="/contact" className="text-accent-primary hover:underline">
                      Contact us
                    </Link>{' '}
                    for any questions
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary
                totals={cart.totals}
                showCheckoutButton={true}
                onCheckout={handleCheckout}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
