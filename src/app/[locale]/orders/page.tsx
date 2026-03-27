'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FormattedPrice } from '@/components/currency/formatted-price'
import { Container } from '@/components/ui/container'

const sampleOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 29999,
    items: 1,
    product: 'Wireless Headphones Pro',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-10',
    status: 'shipped',
    total: 39998,
    items: 2,
    product: 'Minimalist Watch, Leather Wallet',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-05',
    status: 'processing',
    total: 9999,
    items: 1,
    product: 'Smart Speaker',
  },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function OrdersPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen">
      <Container className="py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('orders.title')}</h1>
          <p className="text-slate-400">{t('orders.emptyDesc')}</p>
        </div>

        {/* Orders List */}
        {sampleOrders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-6">&#128230;</div>
              <h2 className="text-2xl font-bold mb-2">{t('orders.empty')}</h2>
              <p className="text-slate-400 mb-8">{t('orders.emptyDesc')}</p>
              <Link href="/products">
                <Button size="lg">{t('common.shop')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sampleOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hoverable className="transition-all hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <Badge className={statusColors[order.status]}>
                            {t(`orders.${order.status}`)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
                          <span>{t('orders.date')}: {order.date}</span>
                          <span>{order.items} {order.items === 1 ? t('cart.item') : t('cart.items')}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                          {order.product}
                        </p>
                      </div>

                      {/* Total & Action */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">{t('orders.total')}</p>
                          <FormattedPrice amountCents={order.total} className="text-xl font-bold text-accent-primary" />
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" className="gap-2">
                            {t('orders.viewDetails')}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
