'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Skeleton } from '@/components/ui/skeleton'

// Sample cart data
const sampleCart = {
  items: [
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      price: 29999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      variant: 'Black',
    },
    {
      id: '2',
      name: 'Minimalist Watch',
      price: 19999,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
      variant: 'Silver',
    },
  ],
  subtotal: 69997,
  shipping: 0,
  tax: 5600,
  total: 75597,
}

function CartItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: typeof sampleCart.items[0]
  onUpdate: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}) {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-xl bg-white/5 neo-raised"
    >
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{item.name}</h3>
        <p className="text-sm text-slate-400">{item.variant}</p>
        <div className="flex items-center justify-between mt-2">
          <FormattedPrice amountCents={item.price} className="font-bold text-accent-primary" />
          <div className="flex items-center gap-3">
            <div className="flex items-center neo-inset rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdate(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdate(item.id, item.quantity + 1)}
              >
                +
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={() => onRemove(item.id)}
            >
              {t('cart.remove')}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CartSummary({
  cart,
  onCheckout,
  isLoading,
}: {
  cart: typeof sampleCart
  onCheckout: () => void
  isLoading: boolean
}) {
  const t = useTranslations()

  return (
    <Card className="neo-raised sticky top-24">
      <CardHeader>
        <CardTitle>{t('cart.summary')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-400">
            <span>{t('cart.subtotal')}</span>
            <FormattedPrice amountCents={cart.subtotal} />
          </div>
          <div className="flex justify-between text-slate-400">
            <span>{t('cart.shipping')}</span>
            <span className="text-green-400">
              {cart.shipping === 0 ? 'Free' : <FormattedPrice amountCents={cart.shipping} />}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>{t('cart.tax')}</span>
            <FormattedPrice amountCents={cart.tax} />
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>{t('cart.total')}</span>
            <FormattedPrice amountCents={cart.total} className="text-accent-primary" />
          </div>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={onCheckout}
          loading={isLoading}
        >
          {t('cart.checkout')}
        </Button>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          {t('cart.secureCheckout')}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CartPage() {
  const t = useTranslations()
  const router = useRouter()
  const [cart, setCart] = useState(sampleCart)
  const [isLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleUpdate = (id: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      ),
    }))
  }

  const handleRemove = (id: string) => {
    setCart(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }))
  }

  const handleCheckout = () => {
    setIsCheckingOut(true)
    router.push('/checkout')
  }

  const isEmpty = cart.items.length === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f23]/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/products"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{t('common.continueShopping')}</span>
            </Link>
            <h1 className="text-xl font-bold text-white">{t('cart.title')}</h1>
            <div className="w-24 sm:w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5">
                  <Skeleton className="w-24 h-24 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">&#128722;</div>
            <h2 className="text-2xl font-bold mb-2">{t('cart.empty')}</h2>
            <p className="text-slate-400 mb-8">{t('cart.emptyDesc')}</p>
            <Link href="/products">
              <Button size="lg">{t('common.shop')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {cart.items.length} {cart.items.length === 1 ? t('cart.item') : t('cart.items')}
                </h2>
              </div>

              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Benefits */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t('cart.secureCheckout')}</p>
                    <p className="text-xs text-white/50">256-bit SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t('cart.freeReturns')}</p>
                    <p className="text-xs text-white/50">30-day return policy</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Summary */}
            <div className="hidden lg:block">
              <CartSummary
                cart={cart}
                onCheckout={handleCheckout}
                isLoading={isCheckingOut}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
