'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Truck, ShieldCheck, CreditCard } from 'lucide-react'
import { CartTotals } from './cart-context'
import { formatPrice } from '@/lib/currency'
import { CartCoupon } from './cart-coupon'
import { cn } from '@/lib/utils'

interface CartSummaryProps {
  totals: CartTotals
  showCheckoutButton?: boolean
  children?: React.ReactNode
  isLoading?: boolean
  onCheckout?: () => void
  appliedCoupon?: string | undefined
  onApplyCoupon?: (code: string) => Promise<void>
  onRemoveCoupon?: () => void
}

export function CartSummary({
  totals,
  showCheckoutButton = true,
  children,
  isLoading = false,
  onCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CartSummaryProps) {
  const freeShippingThreshold = 100
  const isEligibleForFreeShipping = totals.subtotal >= freeShippingThreshold
  const shippingProgress = Math.min((totals.subtotal / freeShippingThreshold) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-24 rounded-2xl bg-white/5 p-6 backdrop-blur-sm"
    >
      <h3 className="mb-6 text-lg font-bold text-white">Order Summary</h3>

      {/* Line Items */}
      <div className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span className="font-medium text-white">{formatPrice(totals.subtotal)}</span>
        </div>

        <div className="flex justify-between text-white/70">
          <span>Estimated Tax</span>
          <span>{formatPrice(totals.tax)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Truck className="h-4 w-4" />
            <span>Shipping</span>
          </div>
          <span>
            {isEligibleForFreeShipping ? (
              <span className="font-semibold text-green-400">FREE</span>
            ) : totals.shipping === 0 ? (
              <span className="text-white/50">Calculated at checkout</span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Discount</span>
            <span>-{formatPrice(totals.discount)}</span>
          </div>
        )}

        {!isEligibleForFreeShipping && totals.subtotal > 0 && (
          <div className="pt-2">
            <div className="text-sm text-white/50">
              Add {formatPrice(freeShippingThreshold - totals.subtotal)} more for free shipping
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Coupon Code */}
      {onApplyCoupon && (
        <div className="border-b border-white/10 py-6">
          <CartCoupon
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon ?? undefined}
            appliedCode={appliedCoupon}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between py-6">
        <span className="text-lg font-semibold text-white">Total</span>
        <motion.span
          key={totals.total}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-2xl font-bold text-white"
        >
          {formatPrice(totals.total)}
        </motion.span>
      </div>

      {/* Custom Content Slot */}
      {children}

      {/* Checkout Button */}
      {showCheckoutButton && (
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ y: 1, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          onClick={onCheckout}
          disabled={isLoading || totals.subtotal === 0}
          className={cn(
            'w-full rounded-xl py-4 text-lg font-bold transition-all',
            'bg-accent-primary text-white',
            'hover:shadow-accent-primary/25 hover:bg-accent-primary-hover hover:shadow-lg',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
            'flex items-center justify-center gap-2',
          )}
        >
          {isLoading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Proceed to Checkout
            </>
          )}
        </motion.button>
      )}

      {/* Trust Badges */}
      <div className="mt-6 border-t border-white/10 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="h-4 w-4 text-green-400/70" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <CreditCard className="h-4 w-4 text-blue-400/70" />
            <span>Stripe payments</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Truck className="h-4 w-4 text-purple-400/70" />
            <span>Free shipping $100+</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg
              className="h-4 w-4 text-yellow-400/70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Worldwide delivery</span>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
        <Lock className="h-3 w-3" />
        Secure checkout powered by Stripe
      </p>
    </motion.div>
  )
}

export default CartSummary
