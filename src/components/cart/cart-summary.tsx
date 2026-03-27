'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Lock, Truck } from 'lucide-react';
import { CartTotals } from './cart-context';
import { formatPrice } from '@/lib/currency';

interface CartSummaryProps {
  totals: CartTotals;
  showCheckoutButton?: boolean;
  children?: React.ReactNode;
  isLoading?: boolean;
  onCheckout?: () => void;
}

export function CartSummary({
  totals,
  showCheckoutButton = true,
  children,
  isLoading = false,
  onCheckout,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    // TODO: Integrate with promo code API
    setTimeout(() => setIsApplyingPromo(false), 1000);
  };

  const freeShippingThreshold = 100;
  const isEligibleForFreeShipping = totals.subtotal >= freeShippingThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-white/5 backdrop-blur-sm p-6 sticky top-24"
    >
      <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>

      {/* Line Items */}
      <div className="space-y-4 pb-6 border-b border-white/10">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span>{formatPrice(totals.subtotal)}</span>
        </div>

        <div className="flex justify-between text-white/70">
          <span>Estimated Tax</span>
          <span>{formatPrice(totals.tax)}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-white/70">
            <Truck className="w-4 h-4" />
            <span>Shipping</span>
          </div>
          <span>
            {isEligibleForFreeShipping ? (
              <span className="text-green-400 font-semibold">FREE</span>
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
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totals.subtotal / freeShippingThreshold) * 100, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-6">
        <span className="text-lg font-semibold text-white">Total</span>
        <span className="text-2xl font-bold text-white">
          {formatPrice(totals.total)}
        </span>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label htmlFor="promo-code" className="flex items-center gap-2 text-sm text-white/50 mb-2">
          <Tag className="w-4 h-4" />
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            id="promo-code"
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleApplyPromo}
            disabled={isApplyingPromo || !promoCode.trim()}
            className="px-4 py-3 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Custom Content Slot */}
      {children}

      {/* Checkout Button */}
      {showCheckoutButton && (
        <button
          onClick={onCheckout}
          disabled={isLoading || totals.subtotal === 0}
          className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              <Lock className="w-5 h-5" />
              Proceed to Checkout
            </>
          )}
        </button>
      )}

      {/* Security Note */}
      <p className="flex items-center justify-center gap-2 text-xs text-white/40 mt-4">
        <Lock className="w-3 h-3" />
        Secure checkout powered by Stripe
      </p>
    </motion.div>
  );
}

export default CartSummary;
