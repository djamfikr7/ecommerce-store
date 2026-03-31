'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShoppingBag, Truck, ShieldCheck, CreditCard } from 'lucide-react'
import { formatPrice } from '@/lib/currency'

interface OrderSidebarProps {
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
    variantName?: string
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export function OrderSidebar({ items, subtotal, tax, shipping, total }: OrderSidebarProps) {
  const freeShippingThreshold = 10000 // $100 in cents
  const isFreeShipping = shipping === 0
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
    >
      <h3 className="mb-5 text-lg font-bold text-white">
        Order Summary
        <span className="ml-2 text-sm font-normal text-white/40">
          ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
      </h3>

      {/* Cart Items */}
      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="neo-pressed-sm relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-white/10">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-white/20" />
                </div>
              )}
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white">
                {item.quantity}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{item.name}</p>
              {item.variantName && (
                <p className="truncate text-xs text-white/40">{item.variantName}</p>
              )}
            </div>
            <p className="flex-shrink-0 text-sm font-medium text-white">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-white/10" />

      {/* Totals */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-white/60">
          <span>Subtotal</span>
          <span className="text-white/80">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/60">
          <span>Estimated Tax</span>
          <span className="text-white/80">{formatPrice(tax)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            <span>Shipping</span>
          </div>
          {isFreeShipping ? (
            <span className="font-semibold text-green-400">FREE</span>
          ) : (
            <span className="text-white/80">{formatPrice(shipping)}</span>
          )}
        </div>
      </div>

      {/* Free shipping progress */}
      {!isFreeShipping && subtotal > 0 && subtotal < freeShippingThreshold && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs text-white/40">
            Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-accent-primary to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-white">Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-white"
          >
            {formatPrice(total)}
          </motion.span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400/70" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <CreditCard className="h-3.5 w-3.5 text-blue-400/70" />
            <span>Stripe payments</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Truck className="h-3.5 w-3.5 text-purple-400/70" />
            <span>Free shipping $100+</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <svg
              className="h-3.5 w-3.5 text-yellow-400/70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Worldwide delivery</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderSidebar
