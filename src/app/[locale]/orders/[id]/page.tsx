'use client'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, Check, X, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Container } from '@/components/ui/container'

// Sample order data
const sampleOrder = {
  id: 'ORD-2024-001',
  date: '2024-01-15',
  status: 'delivered',
  items: [
    {
      id: '1',
      name: 'Wireless Headphones Pro',
      price: 29999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      variant: 'Black',
    },
  ],
  shipping: {
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
  },
  subtotal: 29999,
  shippingCost: 0,
  tax: 2400,
  total: 32399,
  timeline: [
    { date: '2024-01-15', status: 'ordered', title: 'Order Placed', description: 'Your order has been received' },
    { date: '2024-01-15', status: 'processing', title: 'Processing', description: 'Order is being prepared' },
    { date: '2024-01-16', status: 'shipped', title: 'Shipped', description: 'Package dispatched from warehouse' },
    { date: '2024-01-18', status: 'delivered', title: 'Delivered', description: 'Package delivered to your address' },
  ],
}

const statusIcons: Record<string, React.ReactNode> = {
  ordered: <Clock className="w-4 h-4" />,
  processing: <Package className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <Check className="w-4 h-4" />,
  cancelled: <X className="w-4 w-4" />,
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function OrderDetailPage() {
  const t = useTranslations()
  const params = useParams()
  const order = sampleOrder // In real app, fetch by params.id

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{order.id}</h1>
              <Badge className={statusColors[order.status]}>
                {t(`orders.${order.status}`)}
              </Badge>
            </div>
            <p className="text-slate-400">
              {t('orders.date')}: {order.date}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cart.items')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-slate-400">{item.variant}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-400">
                          {t('product.quantity')}: {item.quantity}
                        </span>
                        <FormattedPrice amountCents={item.price} className="font-bold" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.shipping')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-slate-300">
                  <p>{order.shipping.address}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                  </p>
                  <p>{order.shipping.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6">
                  {order.timeline.map((event, index) => (
                    <motion.div
                      key={event.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full
                        ${event.status === order.status
                          ? 'bg-accent-primary text-white'
                          : 'bg-white/10 text-slate-400'}
                      `}>
                        {statusIcons[event.status]}
                      </div>
                      <div className="flex-1 pb-6 border-b border-white/5 last:border-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className="text-sm text-slate-500">{event.date}</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="neo-raised sticky top-24">
              <CardHeader>
                <CardTitle>{t('cart.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.subtotal')}</span>
                    <FormattedPrice amountCents={order.subtotal} />
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.shipping')}</span>
                    <span className={order.shippingCost === 0 ? 'text-green-400' : ''}>
                      {order.shippingCost === 0 ? 'Free' : <FormattedPrice amountCents={order.shippingCost} />}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t('cart.tax')}</span>
                    <FormattedPrice amountCents={order.tax} />
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between font-bold">
                    <span>{t('cart.total')}</span>
                    <FormattedPrice amountCents={order.total} className="text-accent-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
