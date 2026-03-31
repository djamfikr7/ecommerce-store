'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { AnimatePresence } from 'framer-motion'
import { CheckoutSteps, type CheckoutStep } from '@/components/checkout/checkout-steps'
import { ShippingStep, type ShippingFormData } from '@/components/checkout/shipping-step'
import { PaymentStep } from '@/components/checkout/payment-step'
import { ReviewStep } from '@/components/checkout/review-step'
import { OrderSidebar } from '@/components/checkout/order-sidebar'
import { useCart } from '@/components/cart/cart-context'
import { getStripePublishableKeyAction } from '@/lib/db-actions/checkout'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: cartLoading } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([])
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    async function loadStripeKey() {
      try {
        const publishableKey = await getStripePublishableKeyAction()
        setStripePromise(loadStripe(publishableKey))
      } catch (err) {
        console.error('Failed to load Stripe:', err)
        setError('Failed to initialize payment system')
      }
    }

    loadStripeKey()
  }, [])

  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push('/cart')
    }
  }, [cart, cartLoading, router])

  const cartItems = useMemo(
    () =>
      cart?.items.map((item) => {
        const base = {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }
        if (item.image) {
          return { ...base, image: item.image }
        }
        if (item.variantName) {
          return { ...base, variantName: item.variantName }
        }
        return base
      }) ?? [],
    [cart?.items],
  )

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data)
    setCompletedSteps((prev) => [...prev.filter((s) => s !== 'shipping'), 'shipping'])
    setCurrentStep('payment')
    setError(null)
  }

  const handlePaymentSubmit = async (pmId: string) => {
    setPaymentMethodId(pmId)
    setCompletedSteps((prev) => [...prev.filter((s) => s !== 'payment'), 'payment'])
    setCurrentStep('review')
    setError(null)
  }

  const handlePlaceOrder = async () => {
    if (!cart || !shippingData) return

    setIsProcessing(true)
    setError(null)

    try {
      const guestCartId =
        typeof window !== 'undefined' ? localStorage.getItem('guest_cart_id') : null

      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart.id,
          guestCartId,
          email: shippingData.email,
          shippingAddress: shippingData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process order. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleStepClick = (step: CheckoutStep) => {
    const stepOrder: CheckoutStep[] = ['shipping', 'payment', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex < currentIndex) {
      setCurrentStep(step)
    }
  }

  if (cartLoading) {
    return (
      <div className="from-background-start to-background-end flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-primary" />
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  return (
    <div className="from-background-start to-background-end min-h-screen bg-gradient-to-b">
      {/* Header */}
      <header className="border-border-default bg-surface-base/80 sticky top-0 z-30 border-b backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Cart</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Checkout</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-border-default bg-surface-elevated/50 border-b">
        <div className="container mx-auto px-4">
          <CheckoutSteps
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="neo-raised rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {currentStep === 'shipping' && (
                  <ShippingStep
                    key="shipping"
                    onSubmit={handleShippingSubmit}
                    {...(shippingData ? { defaultValues: shippingData } : {})}
                    isGuest={!cart?.guestCartId}
                  />
                )}

                {currentStep === 'payment' && stripePromise && (
                  <Elements stripe={stripePromise} key="payment">
                    <PaymentStep
                      onSubmit={handlePaymentSubmit}
                      onBack={() => setCurrentStep('shipping')}
                      isProcessing={isProcessing}
                      error={error}
                    />
                  </Elements>
                )}

                {currentStep === 'review' && shippingData && (
                  <ReviewStep
                    key="review"
                    shippingData={shippingData}
                    cartItems={cartItems}
                    subtotal={cart.totals.subtotal}
                    shipping={cart.totals.shipping}
                    tax={cart.totals.tax}
                    total={cart.totals.total}
                    onBack={() => setCurrentStep('payment')}
                    onConfirm={handlePlaceOrder}
                    isProcessing={isProcessing}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <OrderSidebar
              items={cartItems}
              subtotal={cart.totals.subtotal}
              tax={cart.totals.tax}
              shipping={cart.totals.shipping}
              total={cart.totals.total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
