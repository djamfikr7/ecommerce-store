'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Package } from 'lucide-react'

interface LowStockProduct {
  id: string
  name: string
  stock: number
  threshold: number
  sku?: string
}

interface LowStockAlertProps {
  products?: LowStockProduct[]
  maxItems?: number
}

const defaultProducts: LowStockProduct[] = [
  { id: 'P001', name: 'Wireless Headphones Pro', stock: 3, threshold: 10, sku: 'WHP-001' },
  { id: 'P002', name: 'Smart Watch Series 5', stock: 5, threshold: 15, sku: 'SWT-005' },
  { id: 'P003', name: 'Portable Charger 20000mAh', stock: 8, threshold: 20, sku: 'PCH-020' },
  { id: 'P004', name: 'Bluetooth Speaker Mini', stock: 2, threshold: 25, sku: 'BTS-MINI' },
  { id: 'P005', name: 'USB-C Hub 7-in-1', stock: 12, threshold: 30, sku: 'UCH-007' },
]

function getStockSeverity(stock: number, threshold: number): 'critical' | 'warning' | 'low' {
  const ratio = stock / threshold
  if (ratio <= 0.2) return 'critical'
  if (ratio <= 0.5) return 'warning'
  return 'low'
}

const severityColors = {
  critical: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    bar: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    bar: 'bg-amber-500',
  },
  low: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    bar: 'bg-yellow-500',
  },
}

export function LowStockAlert({ products = defaultProducts, maxItems = 5 }: LowStockAlertProps) {
  const displayProducts = products.slice(0, maxItems)
  const criticalCount = products.filter(
    (p) => getStockSeverity(p.stock, p.threshold) === 'critical',
  ).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/30 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 p-2.5">
                <AlertTriangle className="text-amber-400" size={20} />
              </div>
              {criticalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {criticalCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Low Stock Alerts</h3>
              <p className="text-sm text-slate-400">
                {products.length} product{products.length !== 1 ? 's' : ''} below threshold
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="divide-y divide-slate-700/50 p-4">
        {displayProducts.map((product, index) => {
          const severity = getStockSeverity(product.stock, product.threshold)
          const colors = severityColors[severity]
          const stockPercentage = Math.min((product.stock / product.threshold) * 100, 100)

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 * index }}
              className="rounded-xl border border-transparent p-3 transition-colors hover:border-slate-700/50 hover:bg-slate-700/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg ${colors.bg} p-2`}>
                    <Package size={16} className={colors.text} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{product.name}</p>
                    {product.sku && <p className="text-xs text-slate-500">SKU: {product.sku}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${colors.text}`}>{product.stock} left</p>
                  <p className="text-xs text-slate-500">Min: {product.threshold}</p>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stockPercentage}%` }}
                  transition={{ duration: 0.5, delay: 0.2 + 0.1 * index }}
                  className={`h-full rounded-full ${colors.bar}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">
        <Link
          href="/admin/products?filter=low-stock"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700/50 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
        >
          View All Alerts
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
