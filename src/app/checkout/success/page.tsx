'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail, ArrowRight, ShoppingBag, UserPlus } from 'lucide-react'
import { formatPrice } from '@/lib/currency'

interface OrderDetails {
  id: string
  orderNumber: string
  status: string
  total: number
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
  }>
  estimatedDelivery?: string
  email: string
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')
  const isMock = searchParams.get('mock') === 'true'
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId && !sessionId) {
        setError('No order information found')
        setIsLoading(false)
        return
      }

      try {
        // In mock mode, create order directly
        if (isMock && sessionId) {
          const res = await fetch('/api/checkout/mock-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          if (!res.ok) throw new Error('Failed to create mock order')
          const data = await res.json()

          // Fetch the created order details
          const orderRes = await fetch(`/api/orders/details?orderId=${data.orderId}`)
          if (!orderRes.ok) throw new Error('Failed to fetch order')
          const orderData = await orderRes.json()
          setOrder(orderData)
          setIsLoading(false)
          return
        }

        const params = new URLSearchParams()
        if (orderId) params.set('orderId', orderId)
        if (sessionId) params.set('sessionId', sessionId)

        const response = await fetch(`/api/orders/details?${params}`)
        if (!response.ok) throw new Error('Failed to fetch order')

        const data = await response.json()
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, sessionId, isMock])

  // Confetti animation effect
  useEffect(() => {
    if (!isLoading && order) {
      const canvas = document.createElement('canvas')
      canvas.id = 'confetti'
      canvas.style.position = 'fixed'
      canvas.style.top = '0'
      canvas.style.left = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '1000'
      document.body.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const particles: Array<{
          x: number
          y: number
          color: string
          size: number
          speedX: number
          speedY: number
          opacity: number
        }> = []

        const colors = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']

        for (let i = 0; i < 150; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 3 + 2,
            opacity: 1,
          })
        }

        let animationId: number
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          particles.forEach((p, index) => {
            p.x += p.speedX
            p.y += p.speedY
            p.opacity -= 0.005

            if (p.opacity <= 0) {
              particles.splice(index, 1)
              return
            }

            ctx.save()
            ctx.globalAlpha = p.opacity
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          })

          if (particles.length > 0) {
            animationId = requestAnimationFrame(animate)
          } else {
            document.body.removeChild(canvas)
          }
        }

        animate()

        return () => {
          cancelAnimationFrame(animationId)
          const confettiCanvas = document.getElementById('confetti')
          if (confettiCanvas) document.body.removeChild(confettiCanvas)
        }
      }
    }
  }, [isLoading, order])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          {isMock && (
            <p className="text-yellow-400 text-sm mb-4">Mock Mode - Creating test order</p>
          )}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-white/60 mb-6">{error || 'Unable to load order details'}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
      {/* Mock Mode Banner */}
      {isMock && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/50 py-2 text-center">
          <span className="text-yellow-400 text-sm">Mock Mode - No real payment processed</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Thank You for Your Order!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 max-w-lg mx-auto"
          >
            Your order has been confirmed and will be shipped soon.
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto rounded-2xl bg-white/5 backdrop-blur-sm p-6 sm:p-8"
        >
          {/* Order Number & Status */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
            <div>
              <p className="text-sm text-white/50 mb-1">Order Number</p>
              <p className="text-xl font-bold text-white">#{order.orderNumber}</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-green-500/20">
              <span className="text-sm font-medium text-green-400">{order.status}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-white/70 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-white/70">Total</span>
              <span className="text-2xl font-bold text-white">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Estimated Delivery */}
          {order.estimatedDelivery && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 mb-6">
              <Package className="w-6 h-6 text-accent" />
              <div>
                <p className="text-sm font-medium text-white">Estimated Delivery</p>
                <p className="text-sm text-white/60">{order.estimatedDelivery}</p>
              </div>
            </div>
          )}

          {/* Email Confirmation */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
            <Mail className="w-5 h-5 text-white/50" />
            <p className="text-sm text-white/60">
              Confirmation email sent to <span className="text-white">{order.email}</span>
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto mt-8 grid sm:grid-cols-2 gap-4"
        >
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            View All Orders
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Create Account Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="max-w-2xl mx-auto mt-8"
        >
          <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
            <UserPlus className="w-8 h-8 text-white/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Create an Account</h3>
            <p className="text-sm text-white/50 mb-4">
              Save your order history and get exclusive deals
            </p>
            <button className="px-6 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
