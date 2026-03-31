'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, ArrowRight, Home, Mail, Truck, Clock, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { SuccessAnimation } from '@/components/checkout/success-animation'
import { useCart } from '@/components/cart/cart-context'

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface VerifiedOrder {
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  email: string
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.8 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const [order, setOrder] = useState<VerifiedOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function verifyOrder() {
      if (!sessionId) {
        router.push('/cart')
        return
      }

      try {
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        if (response.ok) {
          const data = await response.json()

          setOrder({
            orderNumber: data.orderNumber || sessionId,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            shipping: data.shipping || 0,
            tax: data.tax || 0,
            total: data.total || 0,
            email: data.email || '',
          })

          // Clear the cart after successful order verification
          await clearCart()
          localStorage.removeItem('guest_cart_id')
        }
      } catch (err) {
        console.error('Failed to verify order:', err)
      } finally {
        setIsLoading(false)
      }
    }

    verifyOrder()
  }, [sessionId, router, clearCart])

  if (isLoading) {
    return (
      <div className="from-background-start to-background-end flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-primary" />
          <p className="text-slate-400">Verifying your order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="from-background-start to-background-end min-h-screen bg-gradient-to-b py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="neo-raised">
            <CardHeader className="pb-6 text-center">
              <SuccessAnimation />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <CardTitle className="mb-2 text-3xl">Order Confirmed!</CardTitle>
                <p className="text-slate-400">Thank you for your purchase</p>
              </motion.div>
            </CardHeader>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <CardContent className="space-y-6">
                {order?.orderNumber && (
                  <motion.div variants={staggerItem}>
                    <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6 text-center">
                      <p className="mb-2 text-sm text-slate-400">Order Number</p>
                      <p className="font-mono text-2xl font-bold tracking-wider text-white">
                        {order.orderNumber}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Order Summary */}
                {order && order.items.length > 0 && (
                  <motion.div variants={staggerItem}>
                    <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-4">
                      <h3 className="mb-3 font-semibold text-white">Order Summary</h3>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {item.image && (
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-base">
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
                      <div className="border-border-default mt-4 space-y-2 border-t pt-4">
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Subtotal</span>
                          <FormattedPrice amountCents={order.subtotal} />
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Shipping</span>
                          {order.shipping === 0 ? (
                            <span className="text-green-400">Free</span>
                          ) : (
                            <FormattedPrice amountCents={order.shipping} />
                          )}
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Tax</span>
                          <FormattedPrice amountCents={order.tax} />
                        </div>
                        <div className="border-border-default flex justify-between border-t pt-2 text-lg font-bold">
                          <span className="text-white">Total</span>
                          <FormattedPrice
                            amountCents={order.total}
                            className="text-accent-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* What's Next */}
                <motion.div variants={staggerItem}>
                  <div className="space-y-4">
                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="bg-accent-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Mail className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">Confirmation Email</h3>
                        <p className="text-sm text-slate-400">
                          We&apos;ve sent a confirmation email with your order details and tracking
                          information.
                        </p>
                      </div>
                    </div>

                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="bg-accent-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Truck className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">Shipping Updates</h3>
                        <p className="text-sm text-slate-400">
                          You&apos;ll receive shipping updates via email once your order is on its
                          way.
                        </p>
                      </div>
                    </div>

                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="bg-accent-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <Clock className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">Estimated Delivery</h3>
                        <p className="text-sm text-slate-400">
                          Your order will arrive within 5-7 business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div variants={staggerItem}>
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <Button size="lg" className="flex-1" onClick={() => router.push('/my-orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      View Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push('/shop')}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </div>
                </motion.div>

                {/* Home link */}
                <motion.div variants={staggerItem} className="pt-2 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Link>
                </motion.div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
