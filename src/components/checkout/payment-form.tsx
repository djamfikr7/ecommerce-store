'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  onSubmit: (paymentMethodId: string) => Promise<void>;
  onBack: () => void;
  isProcessing: boolean;
  error?: string | null;
}

export function PaymentForm({ onSubmit, onBack, isProcessing, error }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setCardError('Card element not found');
      setIsLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setCardError(stripeError.message || 'An error occurred with your card');
        setIsLoading(false);
        return;
      }

      if (paymentMethod) {
        await onSubmit(paymentMethod.id);
      }
    } catch (err) {
      setCardError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        iconColor: '#8b5cf6',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-white">Payment Details</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Card Information
          </label>
          <div className="relative">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 focus-within:border-accent transition-colors">
              <CardElement options={cardElementOptions} onChange={() => setCardError(null)} />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <svg className="h-6" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#1A1F71" width="38" height="24" rx="4" />
                <path d="M15.5 16.5L17 8H19.5L18 16.5H15.5Z" fill="white" />
                <path d="M26 8.5L24 13L23.5 8.5H21L21.5 16.5H23.5L24 12L24.5 16.5H27L27.5 8.5H26Z" fill="white" />
                <path d="M10.5 8.5L8.5 13L8 8.5H5.5L5 16.5H7.5L7.75 14.5H10L10.5 16.5H13L13.5 8.5H10.5ZM8.5 12.5L9.75 8.5L11 12.5H8.5Z" fill="white" />
              </svg>
            </div>
          </div>
          {cardError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-sm text-red-400"
            >
              <AlertCircle className="w-4 h-4" />
              {cardError}
            </motion.div>
          )}
        </div>

        {/* Error from props */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400 font-medium">Payment Error</p>
              <p className="text-sm text-red-400/70">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-white/40">
          <Lock className="w-3 h-3" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing || isLoading}
          className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2"
        >
          {isProcessing || isLoading ? (
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
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay Now
            </>
          )}
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          Back to Shipping
        </button>
      </form>
    </motion.div>
  );
}

export default PaymentForm;
