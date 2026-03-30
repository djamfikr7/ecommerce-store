'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
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
          setOrderNumber(data.orderNumber)
        }
      } catch (err) {
        console.error('Failed to verify order:', err)
      } finally {
        setIsLoading(false)
      }
    }

    verifyOrder()
  }, [sessionId, router])

  if (isLoading) {
    return (
      <div className="from-background-start to-background-end flex min-h-screen items-center justify-center bg-gradient-to-b">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-accent-primary"></div>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-12 w-12 text-green-400" />
                </div>
              </motion.div>
              <CardTitle className="mb-2 text-3xl">Order Confirmed!</CardTitle>
              <p className="text-slate-400">Thank you for your purchase</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {orderNumber && (
                <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-6 text-center">
                  <p className="mb-2 text-sm text-slate-400">Order Number</p>
                  <p className="text-2xl font-bold text-white">{orderNumber}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="border-border-default neo-flat flex items-start gap-4 rounded-xl border bg-surface-elevated p-4">
                  <div className="bg-accent-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                    <Package className="h-5 w-5 text-accent-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-white">What's Next?</h3>
                    <p className="text-sm text-slate-400">
                      We've sent a confirmation email with your order details. You'll receive
                      another email when your order ships.
                    </p>
                  </div>
                </div>

                <div className="border-border-default neo-flat rounded-xl border bg-surface-elevated p-4">
                  <h3 className="mb-2 font-semibold text-white">Order Details</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>• Confirmation email sent</li>
                    <li>• Estimated delivery: 5-7 business days</li>
                    <li>• Track your order in your account</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={() => router.push('/my-orders')}>
                  View Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>

              <div className="pt-4 text-center">
                <Link
                  href="/shop"
                  className="text-sm text-accent-primary transition-colors hover:text-accent-primary-hover"
                >
                  Continue Shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
