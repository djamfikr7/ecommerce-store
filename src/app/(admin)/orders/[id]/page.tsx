'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Printer,
  Mail,
  ExternalLink,
  Copy,
  RefreshCcw,
} from 'lucide-react'
import { OrderStatusSelector } from '@/components/admin/order-status-selector'
import { OrderRefund } from '@/components/admin/order-refund'
import type { OrderStatus } from '@/components/admin/order-table'

interface OrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
}

interface TimelineEvent {
  status: OrderStatus
  timestamp: string
  note?: string
}

const statusConfig: Record<
  OrderStatus,
  { icon: typeof Clock; color: string; bgColor: string; label: string }
> = {
  pending: { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Pending' },
  processing: {
    icon: Package,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    label: 'Processing',
  },
  shipped: { icon: Truck, color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Shipped' },
  delivered: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    label: 'Delivered',
  },
  cancelled: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20', label: 'Cancelled' },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('processing')
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { status: 'pending', timestamp: 'January 15, 2024 at 2:34 PM', note: 'Order placed' },
    { status: 'processing', timestamp: 'January 15, 2024 at 4:00 PM', note: 'Payment confirmed' },
  ])
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)

  const order = {
    id: params.id || 'ORD-001',
    date: 'January 15, 2024 at 2:34 PM',
    customer: {
      name: 'Sarah Mitchell',
      email: 'sarah.m@email.com',
      phone: '+1 (555) 123-4567',
    },
    shippingAddress: {
      line1: '123 Oak Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
    },
    billingAddress: {
      line1: '123 Oak Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'United States',
    },
    payment: {
      method: 'Visa',
      last4: '4242',
      brand: 'stripe',
      transactionId: 'txn_3abc123def456',
    },
    items: [
      {
        id: '1',
        name: 'Wireless Headphones Pro',
        image: '/products/headphones.jpg',
        quantity: 1,
        price: 199.99,
      },
      {
        id: '2',
        name: 'USB-C Charging Cable',
        image: '/products/cable.jpg',
        quantity: 2,
        price: 24.99,
      },
    ] as OrderItem[],
    subtotal: 249.97,
    shipping: 0,
    tax: 20.02,
    total: 269.99,
  }

  const currentConfig = statusConfig[orderStatus]
  const CurrentIcon = currentConfig.icon

  const handleStatusChange = (status: OrderStatus, note: string, tracking?: string) => {
    setOrderStatus(status)
    if (tracking) setTrackingNumber(tracking)
    setTimeline((prev) => [
      ...prev,
      {
        status,
        timestamp: new Date().toLocaleString(),
        note: note || statusConfig[status].label,
      },
    ])
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const handleSendEmail = () => {
    alert(`Notification email sent to ${order.customer.email}`)
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-xl bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white lg:text-3xl">{order.id}</h1>
              <button
                onClick={handleCopyOrderId}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
                title="Copy Order ID"
              >
                <Copy size={14} />
              </button>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${
                  orderStatus === 'pending'
                    ? 'border-amber-500/30 bg-amber-500/20 text-amber-400'
                    : orderStatus === 'processing'
                      ? 'border-blue-500/30 bg-blue-500/20 text-blue-400'
                      : orderStatus === 'shipped'
                        ? 'border-purple-500/30 bg-purple-500/20 text-purple-400'
                        : orderStatus === 'delivered'
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                          : 'border-red-500/30 bg-red-500/20 text-red-400'
                }`}
              >
                <CurrentIcon size={14} />
                {currentConfig.label}
              </span>
            </div>
            <p className="mt-1 text-slate-400">{order.date}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <OrderStatusSelector
            orderId={order.id}
            currentStatus={orderStatus}
            onStatusChange={handleStatusChange}
          />
          <OrderRefund orderId={order.id} orderTotal={order.total} items={order.items} />
          <button
            onClick={handlePrintInvoice}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Printer size={18} />
            Print Invoice
          </button>
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 font-medium text-slate-300 transition-colors hover:bg-slate-700/50"
          >
            <Mail size={18} />
            Send Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl bg-slate-900/50 p-4"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700/50">
                      <Package className="text-slate-500" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{item.name}</p>
                      <p className="text-sm text-slate-500">SKU: SKU-{item.id.padStart(4, '0')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-200">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="min-w-[80px] text-right">
                      <p className="font-semibold text-cyan-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 space-y-3 border-t border-slate-700/50 pt-6">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700/50 pt-3 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold text-white">Order Timeline</h2>
            </div>
            <div className="p-6">
              <div className="relative">
                <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-slate-700" />
                <div className="space-y-6">
                  {[...timeline].reverse().map((event, index) => {
                    const config = statusConfig[event.status]
                    const Icon = config.icon
                    return (
                      <div key={index} className="relative flex gap-4">
                        <div
                          className={`relative z-10 h-8 w-8 rounded-full ${config.bgColor} border-2 ${config.color.replace(
                            'text-',
                            'border-',
                          )} flex items-center justify-center`}
                        >
                          <Icon size={14} className={config.color} />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className={`font-medium ${config.color}`}>
                            {config.label}
                            {event.note && (
                              <span className="ml-2 font-normal text-slate-400">
                                - {event.note}
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{event.timestamp}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="relative flex gap-4">
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-800">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-400">Order Created</p>
                      <p className="mt-1 text-sm text-slate-500">{order.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <User size={18} />
                Customer
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <p className="font-medium text-slate-200">{order.customer.name}</p>
                <p className="text-sm text-slate-400">{order.customer.email}</p>
                <p className="text-sm text-slate-400">{order.customer.phone}</p>
              </div>
              <Link
                href={`/admin/users/${order.customer.email}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              >
                View Customer Profile
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin size={18} />
                Shipping Address
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-200">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="text-slate-400">{order.shippingAddress.line2}</p>
              )}
              <p className="text-slate-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-slate-400">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Tracking Info (shown when shipped) */}
          {trackingNumber && (
            <div className="overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-800/30 backdrop-blur-sm">
              <div className="border-b border-slate-700/50 p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <Truck size={18} className="text-purple-400" />
                  Tracking
                </h2>
              </div>
              <div className="p-6">
                <p className="mb-1 text-sm text-slate-400">Tracking Number</p>
                <p className="font-mono font-medium text-purple-400">{trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
            <div className="border-b border-slate-700/50 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <CreditCard size={18} />
                Payment
              </h2>
            </div>
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-700/50">
                  <CreditCard size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    {order.payment.method} ending in {order.payment.last4}
                  </p>
                  <p className="text-sm text-slate-500">Processed via Stripe</p>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-3">
                <p className="text-xs text-slate-500">Transaction ID</p>
                <p className="font-mono text-sm text-slate-400">{order.payment.transactionId}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {orderStatus !== 'cancelled' && orderStatus !== 'delivered' && (
            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <div className="border-b border-slate-700/50 p-6">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="space-y-3 p-6">
                <button
                  onClick={handleSendEmail}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900/50 px-4 py-3 text-slate-300 transition-colors hover:bg-slate-800"
                >
                  <Mail size={18} />
                  Send Shipping Update
                </button>
                <button
                  onClick={handlePrintInvoice}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-900/50 px-4 py-3 text-slate-300 transition-colors hover:bg-slate-800"
                >
                  <Printer size={18} />
                  Print Packing Slip
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled', 'Order cancelled by admin')}
                  className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <XCircle size={18} />
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
