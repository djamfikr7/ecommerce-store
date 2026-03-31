'use client'

import { motion } from 'framer-motion'
import { Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/analytics/calculations'

interface TopProduct {
  id: string
  name: string
  revenue: number
  quantity: number
  orders: number
}

interface TopProductsProps {
  products?: TopProduct[]
  currency?: string
}

const MOCK_PRODUCTS: TopProduct[] = [
  { id: '1', name: 'Wireless Headphones Pro', revenue: 15420, quantity: 77, orders: 72 },
  { id: '2', name: 'Smart Watch Series 5', revenue: 12350, quantity: 35, orders: 33 },
  { id: '3', name: 'USB-C Hub 7-in-1', revenue: 8940, quantity: 149, orders: 138 },
  { id: '4', name: 'Bluetooth Speaker Mini', revenue: 7560, quantity: 94, orders: 88 },
  { id: '5', name: 'Portable Charger 20000mAh', revenue: 6240, quantity: 124, orders: 115 },
  { id: '6', name: 'Mechanical Keyboard RGB', revenue: 5890, quantity: 45, orders: 42 },
  { id: '7', name: 'Webcam 4K Ultra', revenue: 4320, quantity: 36, orders: 34 },
]

export function TopProducts({ products, currency = 'USD' }: TopProductsProps) {
  const items = products && products.length > 0 ? products : MOCK_PRODUCTS
  const maxRevenue = Math.max(...items.map((p) => p.revenue))

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Top Products by Revenue</h3>
        <Package size={20} className="text-slate-400" />
      </div>

      <div className="space-y-3">
        {items.map((product, index) => {
          const pct = (product.revenue / maxRevenue) * 100
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group rounded-xl bg-slate-900/40 p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all hover:bg-slate-900/60"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <Link
                      href={`/admin/analytics/products/${product.id}`}
                      className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {product.quantity} units &middot; {product.orders} orders
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp size={14} />
                  <span className="text-sm font-semibold">
                    {formatCurrency(product.revenue, currency)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
