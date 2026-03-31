'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Mail,
  MoreHorizontal,
} from 'lucide-react'
import { OrderTable } from '@/components/admin/order-table'
import type { Order, OrderStatus } from '@/components/admin/order-table'

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    date: '2024-01-15',
    status: 'processing',
    items: 3,
    total: 249.99,
  },
  {
    id: 'ORD-002',
    customer: 'James Wilson',
    email: 'james.w@email.com',
    date: '2024-01-15',
    status: 'shipped',
    items: 1,
    total: 189.5,
  },
  {
    id: 'ORD-003',
    customer: 'Emily Brown',
    email: 'emily.b@email.com',
    date: '2024-01-15',
    status: 'delivered',
    items: 5,
    total: 459.0,
  },
  {
    id: 'ORD-004',
    customer: 'Michael Davis',
    email: 'michael.d@email.com',
    date: '2024-01-14',
    status: 'pending',
    items: 2,
    total: 89.99,
  },
  {
    id: 'ORD-005',
    customer: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    date: '2024-01-14',
    status: 'processing',
    items: 4,
    total: 324.5,
  },
  {
    id: 'ORD-006',
    customer: 'Robert Taylor',
    email: 'robert.t@email.com',
    date: '2024-01-14',
    status: 'delivered',
    items: 1,
    total: 156.0,
  },
  {
    id: 'ORD-007',
    customer: 'Jennifer Martinez',
    email: 'jennifer.m@email.com',
    date: '2024-01-13',
    status: 'shipped',
    items: 2,
    total: 278.99,
  },
  {
    id: 'ORD-008',
    customer: 'David Johnson',
    email: 'david.j@email.com',
    date: '2024-01-13',
    status: 'delivered',
    items: 3,
    total: 99.5,
  },
  {
    id: 'ORD-009',
    customer: 'Amanda White',
    email: 'amanda.w@email.com',
    date: '2024-01-13',
    status: 'processing',
    items: 6,
    total: 445.0,
  },
  {
    id: 'ORD-010',
    customer: 'Christopher Lee',
    email: 'chris.l@email.com',
    date: '2024-01-12',
    status: 'pending',
    items: 2,
    total: 189.99,
  },
  {
    id: 'ORD-011',
    customer: 'Jessica Garcia',
    email: 'jessica.g@email.com',
    date: '2024-01-12',
    status: 'cancelled',
    items: 1,
    total: 79.99,
  },
  {
    id: 'ORD-012',
    customer: 'Daniel Rodriguez',
    email: 'daniel.r@email.com',
    date: '2024-01-12',
    status: 'shipped',
    items: 4,
    total: 312.5,
  },
]

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusSummary = [
  { label: 'Total', value: 'all', color: 'text-white' },
  { label: 'Pending', value: 'pending', color: 'text-amber-400' },
  { label: 'Processing', value: 'processing', color: 'text-blue-400' },
  { label: 'Shipped', value: 'shipped', color: 'text-purple-400' },
  { label: 'Delivered', value: 'delivered', color: 'text-emerald-400' },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState('all')
  const [sortField, setSortField] = useState<keyof Order>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const ITEMS_PER_PAGE = 10

  // Filter and sort orders
  const filteredOrders = mockOrders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === 'asc' ? 1 : -1
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction
      }
      return ((aValue as number) - (bValue as number)) * direction
    })

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id))
    }
  }

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleExportCSV = () => {
    const header = 'Order ID,Customer,Email,Date,Status,Items,Total\n'
    const rows = filteredOrders
      .filter((o) => selectedOrders.includes(o.id))
      .map((o) => `${o.id},${o.customer},${o.email},${o.date},${o.status},${o.items},${o.total}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrintLabels = () => {
    window.print()
  }

  const handleSendNotification = () => {
    // Simulate sending notifications
    alert(`Notification emails sent to ${selectedOrders.length} customers.`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Orders</h1>
          <p className="mt-1 text-slate-400">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={handlePrintLabels}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statusSummary.map((s) => {
          const count =
            s.value === 'all'
              ? mockOrders.length
              : mockOrders.filter((o) => o.status === s.value).length
          const isActive = statusFilter === s.value
          return (
            <button
              key={s.value}
              onClick={() => {
                setStatusFilter(s.value as OrderStatus | 'all')
                setCurrentPage(1)
              }}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                {count}
              </p>
            </button>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | 'all')
                setCurrentPage(1)
              }}
              className="cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Filter
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>

          {/* Date Range */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 pl-4 pr-10 text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <Filter
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3"
          >
            <span className="text-sm text-slate-300">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={handlePrintLabels}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <Printer size={16} />
              Print Labels
            </button>
            <button
              onClick={handleSendNotification}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:text-white"
            >
              <Mail size={16} />
              Notify
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-slate-500 transition-colors hover:text-slate-300"
            >
              Clear
            </button>
          </motion.div>
        )}
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={paginatedOrders}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        selectedOrders={selectedOrders}
        onToggleSelect={toggleSelectOrder}
        onToggleSelectAll={toggleSelectAll}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
