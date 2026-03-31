'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { X, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/currency'
import { QuantitySelector } from './quantity-selector'

export interface CartItemWithRelations {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: number
  name: string
  slug: string
  image?: string
  variantName?: string
  sku?: string
}

interface CartItemProps {
  item: CartItemWithRelations
  onUpdate: (id: string, quantity: number) => Promise<void>
  onRemove: (id: string) => Promise<void>
  isUpdating?: boolean
}

export function CartItem({ item, onUpdate, onRemove, isUpdating = false }: CartItemProps) {
  const handleQuantityChange = async (qty: number) => {
    await onUpdate(item.id, qty)
  }

  const handleRemove = async () => {
    await onRemove(item.id)
  }

  const lineTotal = item.price * item.quantity

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="hover:bg-white/8 neo-flat flex gap-4 rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-colors sm:p-6">
        {/* Product Image */}
        <Link
          href={`/products/${item.slug}`}
          className="neo-pressed-sm relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-32 sm:w-32"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 96px, 128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-white/20" />
            </div>
          )}
        </Link>

        {/* Item Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${item.slug}`}
              className="hover:text-accent line-clamp-2 font-semibold text-white transition-colors"
            >
              {item.name}
            </Link>

            {item.variantName && <p className="mt-1 text-sm text-white/50">{item.variantName}</p>}

            {item.sku && <p className="mt-0.5 text-xs text-white/30">SKU: {item.sku}</p>}

            <div className="mt-3 flex items-center gap-3">
              <span className="text-accent font-semibold">{formatPrice(item.price)}</span>
              <span className="text-white/30">×</span>
              <span className="text-white/60">{item.quantity}</span>
            </div>

            {/* Mobile Quantity Controls */}
            <div className="mt-4 flex items-center justify-between sm:hidden">
              <QuantitySelector
                value={item.quantity}
                onChange={handleQuantityChange}
                min={1}
                max={99}
                size="sm"
              />
              <button
                onClick={handleRemove}
                disabled={isUpdating}
                className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                aria-label={`Remove ${item.name} from cart`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden items-start gap-6 sm:flex">
            {/* Quantity */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-white/40">Qty</span>
              <QuantitySelector
                value={item.quantity}
                onChange={handleQuantityChange}
                min={1}
                max={99}
                size="md"
              />
            </div>

            {/* Line Total */}
            <div className="text-right">
              <span className="text-xs uppercase tracking-wide text-white/40">Total</span>
              <p className="mt-1 text-xl font-bold text-white">{formatPrice(lineTotal)}</p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="rounded-xl bg-white/5 p-3 text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
              aria-label={`Remove ${item.name} from cart`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Line Total */}
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-lg font-bold text-white">{formatPrice(lineTotal)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default CartItem
