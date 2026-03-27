'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, User, MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/components/cart/cart-context';
import { StepIndicator } from '@/components/checkout/step-indicator';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { StripeCheckoutButton } from '@/components/checkout/stripe-checkout-button';
import { CartSummary } from '@/components/cart/cart-summary';
import { formatPrice } from '@/lib/currency';

// Initialize Stripe (use env variable in production)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// Check for mock mode
const IS_MOCK_STRIPE = process.env.NEXT_PUBLIC_MOCK_STRIPE === 'true';

const CHECKOUT_STEPS = [
  { id: 1, label: 'Information', shortLabel: 'Info' },
  { id: 2, label: 'Shipping', shortLabel: 'Ship' },
  { id: 3, label: 'Payment', shortLabel: 'Pay' },
  { id: 4, label: 'Confirmation', shortLabel: 'Done' },
];

interface CheckoutFormData {
  // Step 1: Information
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  // Step 2: Shipping
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  sameAsBilling: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStripeCheckout, setUseStripeCheckout] = useState(true);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  const handleInformationSubmit = async (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleShippingSubmit = async (data: Partial<CheckoutFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handlePaymentSubmit = async (paymentMethodId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart?.id,
          paymentMethodId,
          shippingData: formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment failed');
      }

      const { orderId } = await response.json();
      setCurrentStep(4);
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Cart not found</h1>
          <Link href="/cart" className="text-accent hover:underline">
            Return to cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Mock Mode Banner */}
      {IS_MOCK_STRIPE && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 py-2 text-center">
          <span className="text-yellow-400 text-sm">
            Mock Mode - No real payments. Set NEXT_PUBLIC_MOCK_STRIPE=false for production.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Cart</span>
            </Link>
            <h1 className="text-xl font-bold text-white">Checkout</h1>
            <div className="w-24 sm:w-32" />
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} steps={CHECKOUT_STEPS} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Area - Left/Top */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Contact Information</h2>
                      <p className="text-sm text-white/50">We&apos;ll use this to send your order confirmation</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  {/* Login Prompt */}
                  <div className="mt-6 p-4 rounded-xl bg-white/5 border border-dashed border-white/10">
                    <p className="text-sm text-white/60 mb-3">
                      Already have an account?
                    </p>
                    <button className="w-full py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors">
                      Sign in for faster checkout
                    </button>
                  </div>

                  <button
                    onClick={() => handleInformationSubmit(formData)}
                    disabled={!formData.email || !formData.phone}
                    className="w-full mt-6 py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Continue to Shipping
                  </button>
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm p-6"
                >
                  <ShippingForm
                    onSubmit={handleShippingSubmit}
                    defaultValues={formData}
                  />
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm p-6"
                >
                  {/* Payment Method Toggle */}
                  <div className="mb-6">
                    <div className="flex rounded-xl bg-white/5 p-1">
                      <button
                        onClick={() => setUseStripeCheckout(true)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          useStripeCheckout ? 'bg-accent text-white' : 'text-white/60'
                        }`}
                      >
                        Stripe Checkout
                      </button>
                      <button
                        onClick={() => setUseStripeCheckout(false)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          !useStripeCheckout ? 'bg-accent text-white' : 'text-white/60'
                        }`}
                      >
                        Card Payment
                      </button>
                    </div>
                  </div>

                  {useStripeCheckout ? (
                    <StripeCheckoutButton
                      cartId={cart.id}
                      shippingData={formData}
                    />
                  ) : (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        onSubmit={handlePaymentSubmit}
                        onBack={handleBack}
                        isProcessing={isProcessing}
                        error={error}
                      />
                    </Elements>
                  )}
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h2>
                  <p className="text-white/60 mb-6">
                    Thank you for your purchase. We&apos;ve sent a confirmation email to {formData.email}.
                  </p>

                  <div className="space-y-3">
                    <Link
                      href="/orders"
                      className="block w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
                    >
                      View Order
                    </Link>
                    <Link
                      href="/products"
                      className="block w-full py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Order Summary - Right/Bottom */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-32">
              <CartSummary
                totals={cart.totals}
                showCheckoutButton={false}
              >
                {/* Order Items Preview */}
                <div className="border-t border-white/10 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-white/70 mb-3">Order Items</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.name}</p>
                          <p className="text-xs text-white/50">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm text-white font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CartSummary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
