'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  customer: string
  date: string
  status: OrderStatus
  total: number
  items: number
}

interface RecentOrdersProps {
  orders?: Order[]
  limit?: number
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const defaultOrders: Order[] = [
  {
    id: 'ORD-7842',
    customer: 'Sarah Mitchell',
    date: '2024-01-15',
    status: 'processing',
    total: 249.99,
    items: 3,
  },
  {
    id: 'ORD-7841',
    customer: 'James Wilson',
    date: '2024-01-15',
    status: 'shipped',
    total: 189.5,
    items: 2,
  },
  {
    id: 'ORD-7840',
    customer: 'Emily Brown',
    date: '2024-01-15',
    status: 'delivered',
    total: 459.0,
    items: 5,
  },
  {
    id: 'ORD-7839',
    customer: 'Michael Davis',
    date: '2024-01-14',
    status: 'pending',
    total: 89.99,
    items: 1,
  },
  {
    id: 'ORD-7838',
    customer: 'Lisa Anderson',
    date: '2024-01-14',
    status: 'processing',
    total: 324.5,
    items: 4,
  },
]

export function RecentOrders({ orders = defaultOrders, limit = 5 }: RecentOrdersProps) {
  const displayOrders = orders.slice(0, limit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/30 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="border-b border-slate-700/50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-2.5">
              <Package className="text-cyan-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <p className="text-sm text-slate-400">Last {displayOrders.length} transactions</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-slate-700/50">
        {displayOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 * index }}
            className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-700/20"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-700/50 p-2">
                <Package size={16} className="text-slate-400" />
              </div>
              <div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  {order.id}
                </Link>
                <p className="text-sm text-slate-400">{order.customer}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-slate-400">
                  {order.items} item{order.items !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-500">{order.date}</p>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                  statusColors[order.status]
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <p className="w-20 text-right font-medium text-slate-200">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">
        <Link
          href="/admin/orders"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700/50 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
        >
          View All Orders
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  )
}
