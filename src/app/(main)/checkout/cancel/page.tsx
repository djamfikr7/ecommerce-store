'use client'

import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20">
                  <XCircle className="h-12 w-12 text-orange-400" />
                </div>
              </motion.div>
              <CardTitle className="mb-2 text-3xl">Checkout Cancelled</CardTitle>
              <p className="text-slate-400">Your order was not completed</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6">
                <h3 className="mb-2 font-semibold text-white">What happened?</h3>
                <p className="text-sm text-slate-400">
                  You cancelled the checkout process. Your cart items are still saved and waiting
                  for you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-4">
                  <h3 className="mb-2 font-semibold text-white">Need Help?</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>• Your cart items are still saved</li>
                    <li>• No charges were made to your account</li>
                    <li>• Contact support if you experienced any issues</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={() => router.push('/cart')}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Return to Cart
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

              <div className="pt-4 text-center">
                <p className="text-sm text-slate-400">
                  Need assistance?{' '}
                  <a
                    href="/contact"
                    className="text-accent-primary transition-colors hover:text-accent-primary-hover"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
