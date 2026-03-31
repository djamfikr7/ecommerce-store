'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Calendar, Search, Package } from 'lucide-react'
import OrderCard from '@/components/my-orders/order-card'

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  status: string
  total: number
  itemCount: number
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      images: string[]
    }
  }>
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all')
  const [dateRange, setDateRange] = useState<'all' | '30' | '90' | '365'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/my-orders')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session, statusFilter, dateRange, page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('pageSize', '10')

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()

    const orderDate = new Date(order.createdAt)
    const now = new Date()
    let matchesDate = true

    if (dateRange !== 'all') {
      const daysAgo = new Date(now.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000)
      matchesDate = orderDate >= daysAgo
    }

    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    return matchesStatus && matchesDate && matchesSearch
  })

  const statusOptions: { value: OrderStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' },
  ]

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Order History</h1>
          <p className="text-gray-400">View and manage your orders</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Order number or product name..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900/50 py-3 pl-10 pr-4 text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                <Filter className="mr-1 inline h-4 w-4" />
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-3 text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                <Calendar className="mr-1 inline h-4 w-4" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="w-full rounded-xl border border-gray-700 bg-gray-900/50 px-4 py-3 text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const count =
                option.value === 'all'
                  ? orders.length
                  : orders.filter((o) => o.status.toLowerCase() === option.value).length

              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    statusFilter === option.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'border border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {option.label}
                  {count > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        statusFilter === option.value ? 'bg-white/20' : 'bg-gray-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50">
              <Package className="h-12 w-12 text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No orders found</h3>
            <p className="mb-6 text-gray-400">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/shop')}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50"
              >
                Start Shopping
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <OrderCard order={order} onUpdate={fetchOrders} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex items-center justify-center gap-2"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white transition-all duration-300 hover:border-gray-600 disabled:opacity-50 disabled:hover:border-gray-700"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-10 w-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'border border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2 text-white transition-all duration-300 hover:border-gray-600 disabled:opacity-50 disabled:hover:border-gray-700"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
