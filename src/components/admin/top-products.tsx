'use client'

import { motion } from 'framer-motion'
import { Package, TrendingUp, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/analytics/calculations'

interface TopProduct {
  id: string
  name: string
  revenue: number
  quantity: number
  orders: number
  growth: number
  category: string
}

interface TopProductsProps {
  products?: TopProduct[]
  currency?: string
}

const MOCK_PRODUCTS: TopProduct[] = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    revenue: 15420,
    quantity: 77,
    orders: 72,
    growth: 18.3,
    category: 'Audio',
  },
  {
    id: '2',
    name: 'Smart Watch Series 5',
    revenue: 12350,
    quantity: 35,
    orders: 33,
    growth: 24.1,
    category: 'Wearables',
  },
  {
    id: '3',
    name: 'USB-C Hub 7-in-1',
    revenue: 8940,
    quantity: 149,
    orders: 138,
    growth: 12.7,
    category: 'Accessories',
  },
  {
    id: '4',
    name: 'Bluetooth Speaker Mini',
    revenue: 7560,
    quantity: 94,
    orders: 88,
    growth: -3.2,
    category: 'Audio',
  },
  {
    id: '5',
    name: 'Portable Charger 20000mAh',
    revenue: 6240,
    quantity: 124,
    orders: 115,
    growth: 8.9,
    category: 'Accessories',
  },
  {
    id: '6',
    name: 'Mechanical Keyboard RGB',
    revenue: 5890,
    quantity: 45,
    orders: 42,
    growth: 31.5,
    category: 'Peripherals',
  },
  {
    id: '7',
    name: 'Webcam 4K Ultra',
    revenue: 4320,
    quantity: 36,
    orders: 34,
    growth: 15.2,
    category: 'Video',
  },
  {
    id: '8',
    name: 'Noise Cancelling Earbuds',
    revenue: 3980,
    quantity: 62,
    orders: 58,
    growth: 22.8,
    category: 'Audio',
  },
  {
    id: '9',
    name: 'Laptop Stand Adjustable',
    revenue: 3450,
    quantity: 87,
    orders: 82,
    growth: 5.4,
    category: 'Accessories',
  },
  {
    id: '10',
    name: 'Wireless Mouse Ergonomic',
    revenue: 2870,
    quantity: 95,
    orders: 91,
    growth: -1.8,
    category: 'Peripherals',
  },
]

export function TopProducts({ products, currency = 'USD' }: TopProductsProps) {
  const items = products && products.length > 0 ? products : MOCK_PRODUCTS
  const maxRevenue = Math.max(...items.map((p) => p.revenue))
  const totalRevenue = items.reduce((s, p) => s + p.revenue, 0)

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Top Products by Revenue</h3>
          <p className="mt-1 text-xs text-slate-400">
            Top 10 &middot; {formatCurrency(totalRevenue, currency)} total
          </p>
        </div>
        <Package size={20} className="text-slate-400" />
      </div>

      <div className="space-y-2">
        {items.map((product, index) => {
          const pct = (product.revenue / maxRevenue) * 100
          const shareOfTotal = (product.revenue / totalRevenue) * 100
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group rounded-xl bg-slate-900/40 p-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all hover:bg-slate-900/60"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      index < 3
                        ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <Link
                      href={`/admin/analytics/products/${product.id}`}
                      className="text-sm font-medium text-slate-200 transition-colors hover:text-cyan-400"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {product.quantity} units &middot; {product.orders} orders
                      </span>
                      <span className="rounded-full bg-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-400">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span className="text-sm font-semibold">
                      {formatCurrency(product.revenue, currency)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-end gap-0.5 text-xs ${
                      product.growth >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    <ArrowUpRight size={10} className={product.growth < 0 ? 'rotate-90' : ''} />
                    {product.growth >= 0 ? '+' : ''}
                    {product.growth.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: index * 0.06 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
                <span className="w-10 text-right text-[10px] text-slate-500">
                  {shareOfTotal.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
