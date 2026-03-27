'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, ExternalLink, Loader2 } from 'lucide-react';

interface StripeCheckoutButtonProps {
  cartId: string;
  shippingData?: Record<string, unknown>;
  successUrl?: string;
  cancelUrl?: string;
}

export function StripeCheckoutButton({
  cartId,
  shippingData,
  successUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/success`,
  cancelUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/cart?cancelled=true`,
}: StripeCheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId,
          shippingData,
          successUrl,
          cancelUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <motion.div className="space-y-4">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Primary Button */}
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Checkout Session...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Proceed to Payment
            <ExternalLink className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-white/40 text-center">
        You will be redirected to Stripe&apos;s secure checkout page
      </p>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-1 text-white/30">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
          <span className="text-xs">Secure</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1 text-white/30">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
          <span className="text-xs">Encrypted</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1 text-white/30">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="text-xs">PCI Compliant</span>
        </div>
      </div>
    </motion.div>
  );
}

export default StripeCheckoutButton;
