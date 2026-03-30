'use client'

import { motion } from 'framer-motion'
import { Truck, CreditCard, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { ShippingFormData } from './shipping-form'

interface OrderReviewProps {
  shippingData: ShippingFormData
  cartItems: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  onBack: () => void
  onConfirm: () => void
  isProcessing: boolean
}

export function OrderReview({
  shippingData,
  cartItems,
  subtotal,
  shipping,
  tax,
  total,
  onBack,
  onConfirm,
  isProcessing,
}: OrderReviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">Review Your Order</h3>
      </div>

      {/* Shipping Address */}
      <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6">
        <div className="mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-accent-primary" />
          <h4 className="font-semibold text-white">Shipping Address</h4>
        </div>
        <div className="space-y-1 text-sm text-slate-300">
          <p className="font-medium text-white">
            {shippingData.firstName} {shippingData.lastName}
          </p>
          <p>{shippingData.email}</p>
          <p>{shippingData.phone}</p>
          <p className="pt-2">{shippingData.addressLine1}</p>
          {shippingData.addressLine2 && <p>{shippingData.addressLine2}</p>}
          <p>
            {shippingData.city}, {shippingData.state} {shippingData.postalCode}
          </p>
          <p>{shippingData.country}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-accent-primary" />
          <h4 className="font-semibold text-white">Payment Method</h4>
        </div>
        <div className="text-sm text-slate-300">
          <p>Credit Card</p>
          <p className="mt-1 text-xs text-slate-400">
            Payment will be processed securely via Stripe
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6">
        <h4 className="mb-4 font-semibold text-white">Order Items</h4>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              {item.image && (
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-base">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{item.name}</p>
                <p className="text-sm text-slate-400">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <FormattedPrice
                  amountCents={item.price * item.quantity}
                  className="font-medium text-white"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="border-border-default mt-6 space-y-2 border-t pt-6">
          <div className="flex justify-between text-sm text-slate-300">
            <span>Subtotal</span>
            <FormattedPrice amountCents={subtotal} />
          </div>
          <div className="flex justify-between text-sm text-slate-300">
            <span>Shipping</span>
            {shipping === 0 ? (
              <span className="text-green-400">Free</span>
            ) : (
              <FormattedPrice amountCents={shipping} />
            )}
          </div>
          <div className="flex justify-between text-sm text-slate-300">
            <span>Tax</span>
            <FormattedPrice amountCents={tax} />
          </div>
          <div className="border-border-default flex justify-between border-t pt-2 text-lg font-bold text-white">
            <span>Total</span>
            <FormattedPrice amountCents={total} className="text-accent-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={onConfirm}
          loading={isProcessing}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </Button>
      </div>
    </motion.div>
  )
}
