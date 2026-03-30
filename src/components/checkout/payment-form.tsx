'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

interface PaymentFormProps {
  onSubmit: (paymentMethodId: string) => Promise<void>
  onBack: () => void
  isProcessing: boolean
  error?: string | null
}

export function PaymentForm({ onSubmit, onBack, isProcessing, error }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardError, setCardError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setCardError('Card element not found')
      setIsLoading(false)
      return
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (stripeError) {
        setCardError(stripeError.message || 'An error occurred with your card')
        setIsLoading(false)
        return
      }

      if (paymentMethod) {
        await onSubmit(paymentMethod.id)
      }
    } catch (err) {
      setCardError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

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
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">Payment Details</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Card Information</label>
          <div className="relative">
            <div className="border-border-default neo-inset rounded-xl border bg-surface-elevated p-4 transition-colors focus-within:border-accent-primary">
              <CardElement options={cardElementOptions} onChange={() => setCardError(null)} />
            </div>
          </div>
          {cardError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 text-sm text-accent-danger"
            >
              <AlertCircle className="h-4 w-4" />
              {cardError}
            </motion.div>
          )}
        </div>

        {/* Error from props */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent-danger/10 border-accent-danger/20 flex items-start gap-3 rounded-xl border p-4"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-danger" />
            <div>
              <p className="text-sm font-medium text-accent-danger">Payment Error</p>
              <p className="text-accent-danger/70 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="h-3 w-3" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={isProcessing || isLoading}
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={!stripe || isProcessing || isLoading}
            loading={isProcessing || isLoading}
          >
            {isProcessing || isLoading ? 'Processing...' : 'Continue to Review'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
