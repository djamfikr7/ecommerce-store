'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Check, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Container } from '@/components/ui/container'

type Step = 'shipping' | 'payment' | 'review'

const steps: Step[] = ['shipping', 'payment', 'review']

export default function CheckoutPage() {
  const t = useTranslations()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  })

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  })

  const orderSummary = {
    items: [
      { name: 'Wireless Headphones Pro', quantity: 1, price: 29999 },
      { name: 'Minimalist Watch', quantity: 2, price: 19999 },
    ],
    subtotal: 69997,
    shipping: 0,
    tax: 5600,
    total: 75597,
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    router.push('/orders')
  }

  const currentStepIndex = steps.indexOf(currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('checkout.back')}</span>
            </Link>
            <h1 className="text-xl font-bold text-white">{t('checkout.title')}</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b border-white/10 bg-white/5">
        <Container className="py-4">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${index <= currentStepIndex
                    ? 'bg-accent-primary text-white'
                    : 'bg-white/10 text-slate-400'}
                `}>
                  {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`
                  ml-2 text-sm hidden sm:inline
                  ${index <= currentStepIndex ? 'text-white' : 'text-slate-400'}
                `}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {index < steps.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-4
                    ${index < currentStepIndex ? 'bg-accent-primary' : 'bg-white/10'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-accent-primary" />
                      {t('checkout.shipping')}
                    </CardTitle>
                    <CardDescription>
                      Enter your shipping address
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleShippingSubmit}>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={shippingData.firstName}
                          onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                          required
                        />
                        <Input
                          label="Last Name"
                          value={shippingData.lastName}
                          onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Email"
                          type="email"
                          value={shippingData.email}
                          onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                          required
                        />
                        <Input
                          label="Phone"
                          type="tel"
                          value={shippingData.phone}
                          onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <Input
                        label="Address"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="City"
                          value={shippingData.city}
                          onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                          required
                        />
                        <Input
                          label="State"
                          value={shippingData.state}
                          onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="ZIP Code"
                          value={shippingData.zipCode}
                          onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                          required
                        />
                        <Input
                          label="Country"
                          value={shippingData.country}
                          disabled
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" size="lg" className="ml-auto">
                        {t('checkout.continue')}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {currentStep === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent-primary" />
                      {t('checkout.payment')}
                    </CardTitle>
                    <CardDescription>
                      Enter your payment details
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handlePaymentSubmit}>
                    <CardContent className="space-y-4">
                      <Input
                        label="Card Number"
                        placeholder="4242 4242 4242 4242"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        required
                      />
                      <Input
                        label="Cardholder Name"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Expiry Date"
                          placeholder="MM/YY"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                          required
                        />
                        <Input
                          label="CVV"
                          type="password"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400 pt-4">
                        <Lock className="w-4 h-4" />
                        Your payment information is encrypted and secure
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep('shipping')}
                      >
                        {t('checkout.back')}
                      </Button>
                      <Button type="submit" size="lg" className="flex-1">
                        {t('checkout.continue')}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {currentStep === 'review' && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('checkout.review')}</CardTitle>
                    <CardDescription>
                      Review your order details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        {t('checkout.shipping')}
                      </h3>
                      <div className="bg-white/5 rounded-lg p-4 space-y-1 text-sm">
                        <p className="font-medium">
                          {shippingData.firstName} {shippingData.lastName}
                        </p>
                        <p className="text-slate-400">{shippingData.address}</p>
                        <p className="text-slate-400">
                          {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {t('checkout.payment')}
                      </h3>
                      <div className="bg-white/5 rounded-lg p-4 text-sm">
                        <p className="font-medium">**** **** **** {paymentData.cardNumber.slice(-4)}</p>
                        <p className="text-slate-400">{paymentData.cardName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">{t('cart.items')}</h3>
                      <div className="space-y-3">
                        {orderSummary.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-400">
                              {item.name} x{item.quantity}
                            </span>
                            <FormattedPrice amountCents={item.price * item.quantity} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep('payment')}
                    >
                      {t('checkout.back')}
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handlePlaceOrder}
                      loading={isProcessing}
                    >
                      {t('checkout.placeOrder')}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="neo-raised sticky top-24">
              <CardHeader>
                <CardTitle>{t('cart.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {orderSummary.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-slate-400">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <FormattedPrice amountCents={item.price * item.quantity} />
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.subtotal')}</span>
                    <FormattedPrice amountCents={orderSummary.subtotal} />
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.tax')}</span>
                    <FormattedPrice amountCents={orderSummary.tax} />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between font-bold">
                    <span>{t('cart.total')}</span>
                    <FormattedPrice amountCents={orderSummary.total} className="text-accent-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
