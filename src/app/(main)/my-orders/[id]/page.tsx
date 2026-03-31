'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Package, XCircle, RefreshCw, MapPin, CreditCard } from 'lucide-react'
import OrderTimeline from '@/components/my-orders/order-timeline'
import OrderItemsList from '@/components/my-orders/order-items-list'
import TrackingInfo from '@/components/my-orders/tracking-info'

interface OrderDetail {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  status: string
  total: number
  subtotal: number
  tax: number
  shippingCost: number
  currency: string
  trackingNumber?: string
  carrier?: string
  paymentMethod?: string
  paymentStatus?: string
  items: Array<{
    id: string
    quantity: number
    price: number
    total: number
    productName: string
    product: {
      id: string
      name: string
      slug: string
      images: string[]
    } | null
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [reordering, setReordering] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    params.then((p) => setOrderId(p.id))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-orders')
    }
  }, [status, router])

  useEffect(() => {
    if (session && orderId) {
      fetchOrder()
    }
  }, [session, orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else if (response.status === 404) {
        router.push('/my-orders')
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.'))
      return

    try {
      setCancelling(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by customer' }),
      })

      if (response.ok) {
        await fetchOrder()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to cancel order. Please contact support.')
      }
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('Failed to cancel order. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleReorder = async () => {
    if (!order) return

    try {
      setReordering(true)
      for (const item of order.items) {
        if (item.product) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.product.id,
              quantity: item.quantity,
            }),
          })
        }
      }
      router.push('/cart')
    } catch (error) {
      console.error('Failed to reorder:', error)
      alert('Failed to add items to cart. Please try again.')
    } finally {
      setReordering(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${order?.orderNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'from-yellow-600 to-orange-600',
      confirmed: 'from-blue-600 to-cyan-600',
      processing: 'from-blue-600 to-purple-600',
      shipped: 'from-purple-600 to-pink-600',
      delivered: 'from-green-600 to-emerald-600',
      cancelled: 'from-red-600 to-rose-600',
      refunded: 'from-gray-600 to-slate-600',
    }
    return colors[status.toLowerCase()] || 'from-gray-600 to-gray-700'
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100)
  }

  if (status === 'loading' || loading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status.toLowerCase())

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            onClick={() => router.push('/my-orders')}
            className="mb-4 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Orders
          </button>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white">Order #{order.orderNumber}</h1>
                <span
                  className={`rounded-xl bg-gradient-to-r px-4 py-1 text-sm font-semibold capitalize text-white ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-gray-400">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {order.updatedAt !== order.createdAt && (
                <p className="mt-1 text-sm text-gray-500">
                  Last updated:{' '}
                  {new Date(order.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-gray-700/50"
              >
                <Download className="h-4 w-4" />
                Invoice
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReorder}
                disabled={reordering}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50"
              >
                {reordering ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                {reordering ? 'Adding...' : 'Reorder'}
              </motion.button>
              {canCancel && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center gap-2 rounded-xl border border-red-600/50 bg-red-600/20 px-4 py-2 text-red-400 transition-all duration-300 hover:bg-red-600/30 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <OrderTimeline status={order.status} createdAt={order.createdAt} />
            </motion.div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TrackingInfo trackingNumber={order.trackingNumber} carrier={order.carrier} />
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <OrderItemsList items={order.items} currency={order.currency} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
            >
              <h2 className="mb-4 text-xl font-bold text-white">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCost === 0
                      ? 'Free'
                      : formatCurrency(order.shippingCost, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax, order.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-3 text-lg font-bold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Shipping Address</h2>
              </div>
              <div className="space-y-1 text-gray-300">
                <p className="font-semibold text-white">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="pt-2 text-blue-400">{order.shippingAddress.phone}</p>
                )}
              </div>
            </motion.div>

            {/* Payment Method */}
            {order.paymentMethod && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Payment</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300">{order.paymentMethod}</p>
                  {order.paymentStatus && (
                    <p className="text-sm text-gray-400">
                      Status:{' '}
                      <span
                        className={`font-medium ${
                          order.paymentStatus === 'SUCCEEDED'
                            ? 'text-green-400'
                            : order.paymentStatus === 'REFUNDED'
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6"
            >
              <h3 className="mb-2 font-semibold text-white">Need Help?</h3>
              <p className="mb-4 text-sm text-gray-300">
                If you have any questions about your order, our support team is here to help.
              </p>
              <button
                onClick={() => router.push('/support')}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
              >
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
