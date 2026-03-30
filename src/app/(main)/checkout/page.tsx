'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutSteps, type CheckoutStep } from '@/components/checkout/checkout-steps'
import { ShippingForm, type ShippingFormData } from '@/components/checkout/shipping-form'
import { PaymentForm } from '@/components/checkout/payment-form'
import { OrderReview } from '@/components/checkout/order-review'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCart } from '@/components/cart/cart-context'
import { getStripePublishableKeyAction } from '@/lib/db-actions/checkout'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, isLoading: cartLoading } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null)
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stripePromise, setStripePromise] = useState<any>(null)

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

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data)
    setCurrentStep('payment')
    setError(null)
  }

  const handlePaymentSubmit = async (pmId: string) => {
    setPaymentMethodId(pmId)
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

      // Create checkout session with Stripe
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

      // Redirect to Stripe checkout
      window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process order. Please try again.')
      setIsProcessing(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="from-background-start to-background-end flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-primary"></div>
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return null
  }

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    ...(item.image && { image: item.image }),
  }))

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
          <CheckoutSteps currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="neo-raised">
              <CardContent className="p-6">
                {currentStep === 'shipping' && (
                  <ShippingForm
                    onSubmit={handleShippingSubmit}
                    {...(shippingData && { defaultValues: shippingData })}
                    isGuest={!cart.id}
                  />
                )}

                {currentStep === 'payment' && stripePromise && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      onSubmit={handlePaymentSubmit}
                      onBack={() => setCurrentStep('shipping')}
                      isProcessing={isProcessing}
                      error={error}
                    />
                  </Elements>
                )}

                {currentStep === 'review' && shippingData && (
                  <OrderReview
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
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="neo-raised sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.image && (
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-base">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm text-slate-300">
                        <FormattedPrice amountCents={item.price * item.quantity} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-border-default space-y-2 border-t pt-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <FormattedPrice amountCents={cart.totals.subtotal} />
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    {cart.totals.shipping === 0 ? (
                      <span className="text-green-400">Free</span>
                    ) : (
                      <FormattedPrice amountCents={cart.totals.shipping} />
                    )}
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (estimated)</span>
                    <FormattedPrice amountCents={cart.totals.tax} />
                  </div>
                </div>

                <div className="border-border-default border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <FormattedPrice
                      amountCents={cart.totals.total}
                      className="text-accent-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
