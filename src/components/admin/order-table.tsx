'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Package, Eye, MoreHorizontal } from 'lucide-react'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customer: string
  email: string
  date: string
  status: OrderStatus
  items: number
  total: number
}

interface OrderTableProps {
  orders: Order[]
  sortField: keyof Order
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof Order) => void
  selectedOrders: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export function OrderTable({
  orders,
  sortField,
  sortDirection,
  onSort,
  selectedOrders,
  onToggleSelect,
  onToggleSelectAll,
}: OrderTableProps) {
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length

  const SortHeader = ({ field, label }: { field: keyof Order; label: string }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp
          size={12}
          className={`-mb-1 ${
            sortField === field && sortDirection === 'asc' ? 'text-cyan-400' : 'text-slate-600'
          }`}
        />
        <ChevronDown
          size={12}
          className={`${
            sortField === field && sortDirection === 'desc' ? 'text-cyan-400' : 'text-slate-600'
          }`}
        />
      </span>
    </button>
  )

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center backdrop-blur-sm">
        <Package className="mx-auto mb-4 text-slate-500" size={48} />
        <p className="text-slate-400">No orders found</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-4 py-4 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader field="id" label="Order #" />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader field="customer" label="Customer" />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader field="date" label="Date" />
              </th>
              <th className="px-4 py-4 text-left">
                <SortHeader field="status" label="Status" />
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Items
              </th>
              <th className="px-4 py-4 text-right">
                <SortHeader field="total" label="Total" />
              </th>
              <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {orders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`transition-colors hover:bg-slate-700/20 ${
                  index % 2 === 0 ? 'bg-slate-800/20' : ''
                } ${selectedOrders.includes(order.id) ? 'bg-cyan-500/5' : ''}`}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => onToggleSelect(order.id)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                  />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-slate-200">{order.customer}</p>
                    <p className="text-sm text-slate-500">{order.email}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-400">{order.date}</td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-400">{order.items}</td>
                <td className="px-4 py-4 text-right font-medium text-slate-200">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                      title="View Order"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
                      title="More Actions"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
