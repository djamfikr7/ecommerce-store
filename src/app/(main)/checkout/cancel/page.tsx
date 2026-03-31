'use client'

import { motion } from 'framer-motion'
import { ShoppingCart, ArrowLeft, HelpCircle, CreditCard, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CancelAnimation } from '@/components/checkout/cancel-animation'

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.6 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function CheckoutCancelPage() {
  const router = useRouter()

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
              <CancelAnimation />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <CardTitle className="mb-2 text-3xl">Checkout Cancelled</CardTitle>
                <p className="text-slate-400">Your order was not completed</p>
              </motion.div>
            </CardHeader>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <CardContent className="space-y-6">
                {/* What happened */}
                <motion.div variants={staggerItem}>
                  <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                        <HelpCircle className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">What happened?</h3>
                        <p className="text-sm text-slate-400">
                          You cancelled the checkout process. No charges were made to your account,
                          and your cart items are still saved.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Help info */}
                <motion.div variants={staggerItem}>
                  <div className="space-y-4">
                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
                        <ShoppingCart className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">Cart Preserved</h3>
                        <p className="text-sm text-slate-400">
                          Your cart items are still saved. You can return to your cart and checkout
                          when you&apos;re ready.
                        </p>
                      </div>
                    </div>

                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
                        <CreditCard className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">No Charges</h3>
                        <p className="text-sm text-slate-400">
                          No charges were made to your payment method. Your financial information
                          remains secure.
                        </p>
                      </div>
                    </div>

                    <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                      <div className="bg-accent-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                        <RefreshCw className="h-5 w-5 text-accent-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-white">Try Again</h3>
                        <p className="text-sm text-slate-400">
                          Experiencing issues? Contact support or try a different payment method.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div variants={staggerItem}>
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <Button size="lg" className="flex-1" onClick={() => router.push('/checkout')}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Checkout
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push('/shop')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </div>
                </motion.div>

                {/* Cart & Support links */}
                <motion.div variants={staggerItem} className="space-y-2 pt-2 text-center">
                  <div>
                    <Link
                      href="/cart"
                      className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Return to Cart
                    </Link>
                  </div>
                  <p className="text-sm text-slate-500">
                    Need assistance?{' '}
                    <Link
                      href="/contact"
                      className="text-accent-primary transition-colors hover:text-accent-primary-hover"
                    >
                      Contact Support
                    </Link>
                  </p>
                </motion.div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
