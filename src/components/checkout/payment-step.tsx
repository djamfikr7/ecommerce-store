'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Lock, AlertCircle, ShieldCheck } from 'lucide-react'
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

interface PaymentStepProps {
  onSubmit: (paymentMethodId: string) => Promise<void>
  onBack: () => void
  isProcessing: boolean
  error?: string | null
}

const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': {
        color: 'rgba(255, 255, 255, 0.35)',
      },
      iconColor: '#8b5cf6',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
}

export function PaymentStep({ onSubmit, onBack, isProcessing, error }: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [cardErrors, setCardErrors] = useState<{
    number?: string
    expiry?: string
    cvc?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)
    setCardErrors({})

    const cardNumber = elements.getElement(CardNumberElement)

    if (!cardNumber) {
      setCardErrors({ number: 'Card element not found' })
      setIsLoading(false)
      return
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumber,
      })

      if (stripeError) {
        const field = stripeError.type === 'validation_error' ? 'number' : 'number'
        setCardErrors({ [field]: stripeError.message || 'An error occurred' })
        setIsLoading(false)
        return
      }

      if (paymentMethod) {
        await onSubmit(paymentMethod.id)
      }
    } catch {
      setCardErrors({ number: 'An unexpected error occurred. Please try again.' })
      setIsLoading(false)
    }
  }

  const isDisabled = !stripe || isProcessing || isLoading

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      className="space-y-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-accent-primary/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <CreditCard className="h-5 w-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Payment Details</h3>
          <p className="text-sm text-white/50">All transactions are secure and encrypted</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Card Number <span className="text-accent-danger">*</span>
          </label>
          <div
            className={`neo-flat rounded-xl border-2 bg-surface-elevated px-4 py-3.5 transition-all duration-200 ${
              focusedField === 'number'
                ? 'shadow-accent-primary/10 border-accent-primary shadow-lg'
                : cardErrors.number
                  ? 'border-accent-danger/50'
                  : 'border-white/10'
            }`}
          >
            <CardNumberElement
              options={ELEMENT_STYLE}
              onFocus={() => setFocusedField('number')}
              onBlur={() => setFocusedField(null)}
              onChange={(e) => {
                setCardErrors((prev) => {
                  const next = { ...prev }
                  if (e.error?.message) {
                    next.number = e.error.message
                  } else {
                    delete next.number
                  }
                  return next
                })
              }}
            />
          </div>
          {cardErrors.number && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 flex items-center gap-1.5 text-sm text-accent-danger"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {cardErrors.number}
            </motion.p>
          )}
        </div>

        {/* Expiry + CVC Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Expiry <span className="text-accent-danger">*</span>
            </label>
            <div
              className={`neo-flat rounded-xl border-2 bg-surface-elevated px-4 py-3.5 transition-all duration-200 ${
                focusedField === 'expiry'
                  ? 'shadow-accent-primary/10 border-accent-primary shadow-lg'
                  : cardErrors.expiry
                    ? 'border-accent-danger/50'
                    : 'border-white/10'
              }`}
            >
              <CardExpiryElement
                options={ELEMENT_STYLE}
                onFocus={() => setFocusedField('expiry')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setCardErrors((prev) => {
                    const next = { ...prev }
                    if (e.error?.message) {
                      next.expiry = e.error.message
                    } else {
                      delete next.expiry
                    }
                    return next
                  })
                }}
              />
            </div>
            {cardErrors.expiry && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-sm text-accent-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {cardErrors.expiry}
              </motion.p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              CVC <span className="text-accent-danger">*</span>
            </label>
            <div
              className={`neo-flat rounded-xl border-2 bg-surface-elevated px-4 py-3.5 transition-all duration-200 ${
                focusedField === 'cvc'
                  ? 'shadow-accent-primary/10 border-accent-primary shadow-lg'
                  : cardErrors.cvc
                    ? 'border-accent-danger/50'
                    : 'border-white/10'
              }`}
            >
              <CardCvcElement
                options={ELEMENT_STYLE}
                onFocus={() => setFocusedField('cvc')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => {
                  setCardErrors((prev) => {
                    const next = { ...prev }
                    if (e.error?.message) {
                      next.cvc = e.error.message
                    } else {
                      delete next.cvc
                    }
                    return next
                  })
                }}
              />
            </div>
            {cardErrors.cvc && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-sm text-accent-danger"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {cardErrors.cvc}
              </motion.p>
            )}
          </div>
        </div>

        {/* Server error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-accent-danger/20 bg-accent-danger/10 flex items-start gap-3 rounded-xl border p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-danger" />
              <div>
                <p className="text-sm font-medium text-accent-danger">Payment Error</p>
                <p className="text-accent-danger/70 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Lock className="h-3.5 w-3.5 text-green-400/70" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400/70" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <CreditCard className="h-3.5 w-3.5 text-purple-400/70" />
            <span>Stripe Secured</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={isDisabled}>
            Back
          </Button>
          <Button type="submit" size="lg" className="flex-1" loading={isDisabled}>
            {isProcessing ? 'Processing...' : 'Continue to Review'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default PaymentStep
