'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Truck, CreditCard, Package, Lock, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Button3D } from '@/components/ui/button-3d'
import { formatPrice } from '@/lib/currency'
import type { ShippingFormData } from './shipping-step'

interface ReviewStepProps {
  shippingData: ShippingFormData
  cartItems: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
    variantName?: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  onBack: () => void
  onConfirm: () => void
  isProcessing: boolean
}

export function ReviewStep({
  shippingData,
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  onBack,
  onConfirm,
  isProcessing,
}: ReviewStepProps) {
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
      className="space-y-6"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-accent-primary/20 flex h-10 w-10 items-center justify-center rounded-xl">
          <Package className="h-5 w-5 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Review Your Order</h3>
          <p className="text-sm text-white/50">Confirm details before placing your order</p>
        </div>
      </div>

      {/* Shipping Address Summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-accent-primary" />
          <h4 className="text-sm font-semibold text-white">Shipping Address</h4>
        </div>
        <div className="space-y-0.5 text-sm text-white/70">
          <p className="font-medium text-white">
            {shippingData.firstName} {shippingData.lastName}
          </p>
          <p>{shippingData.email}</p>
          <p>{shippingData.phone}</p>
          <p className="pt-1">
            {shippingData.addressLine1}
            {shippingData.addressLine2 && `, ${shippingData.addressLine2}`}
          </p>
          <p>
            {shippingData.city}, {shippingData.state} {shippingData.postalCode}
          </p>
          <p>{shippingData.country}</p>
        </div>
      </div>

      {/* Payment Method Summary */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-accent-primary" />
          <h4 className="text-sm font-semibold text-white">Payment Method</h4>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <div className="flex h-8 w-12 items-center justify-center rounded-md bg-white/10">
            <CreditCard className="h-4 w-4 text-white/60" />
          </div>
          <div>
            <p className="text-white">Credit Card</p>
            <p className="text-xs text-white/40">Secured by Stripe</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-accent-primary" />
          <h4 className="text-sm font-semibold text-white">
            Order Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})
          </h4>
        </div>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="neo-pressed-sm relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-white/20" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                {item.variantName && <p className="text-xs text-white/40">{item.variantName}</p>}
                <p className="text-xs text-white/50">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-white">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Order Totals */}
        <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
          <div className="flex justify-between text-sm text-white/60">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Shipping</span>
            {shipping === 0 ? (
              <span className="text-green-400">Free</span>
            ) : (
              <span>{formatPrice(shipping)}</span>
            )}
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-white">
            <span>Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-accent-primary"
            >
              {formatPrice(total)}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="space-y-3 pt-2">
        <Button3D
          variant="default"
          size="lg"
          onClick={onConfirm}
          loading={isProcessing}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            'Processing Order...'
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Place Order — {formatPrice(total)}
            </>
          )}
        </Button3D>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isProcessing}
          className="w-full"
        >
          Back to Payment
        </Button>
      </div>

      {/* Trust note */}
      <p className="flex items-center justify-center gap-2 pt-2 text-xs text-white/30">
        <Lock className="h-3 w-3" />
        Your payment is encrypted and secure
      </p>
    </motion.div>
  )
}

export default ReviewStep
