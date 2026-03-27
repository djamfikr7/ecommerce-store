'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Package,
  ChevronRight,
  Calendar,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  itemCount: number
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 129.99,
    currency: 'USD',
    itemCount: 3,
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 79.99 },
      { name: 'USB-C Cable', quantity: 2, price: 24.99 },
    ],
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 249.50,
    currency: 'USD',
    itemCount: 2,
    items: [
      { name: 'Smart Watch', quantity: 1, price: 199.50 },
      { name: 'Watch Band', quantity: 1, price: 50.00 },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-22',
    status: 'processing',
    total: 89.99,
    currency: 'USD',
    itemCount: 1,
    items: [
      { name: 'Bluetooth Speaker', quantity: 1, price: 89.99 },
    ],
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-01-23',
    status: 'pending',
    total: 459.00,
    currency: 'USD',
    itemCount: 4,
    items: [
      { name: 'Mechanical Keyboard', quantity: 1, price: 159.00 },
      { name: 'Mouse Pad', quantity: 1, price: 29.99 },
      { name: 'Wrist Rest', quantity: 1, price: 19.99 },
      { name: 'Keycap Set', quantity: 1, price: 250.00 },
    ],
  },
]

const statusConfig = {
  pending: {
    label: 'Pending',
    variant: 'warning' as const,
    icon: Clock,
  },
  processing: {
    label: 'Processing',
    variant: 'info' as const,
    icon: ShoppingBag,
  },
  shipped: {
    label: 'Shipped',
    variant: 'secondary' as const,
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    variant: 'success' as const,
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'danger' as const,
    icon: XCircle,
  },
}

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <Card hoverable className="p-0 overflow-hidden">
      <Link href={`/profile/orders/${order.id}`}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-4">
              <div className="p-2 neo-raised rounded-lg">
                <Package className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="font-medium text-slate-100">{order.orderNumber}</p>
                <p className="text-sm text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant={status.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
              <ChevronRight className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          {/* Items Preview */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">
                  {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-sm text-slate-400">
                  {order.items[0].name}
                  {order.itemCount > 1 && ` +${order.itemCount - 1} more`}
                </span>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold text-slate-100">
                  {order.currency === 'USD' ? '$' : order.currency}
                  {order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders] = useState<Order[]>(mockOrders)

  if (!session) {
    router.push('/login?callbackUrl=/profile/orders')
    return null
  }

  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="container-neo py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Orders</h1>
          <p className="text-slate-400 mt-1">View and track your order history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 neo-raised rounded-lg">
                <Package className="h-5 w-5 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{orders.length}</p>
                <p className="text-sm text-slate-400">Total Orders</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 neo-raised rounded-lg">
                <CheckCircle className="h-5 w-5 text-accent-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{completedOrders}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 neo-raised rounded-lg">
                <CreditCard className="h-5 w-5 text-accent-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">
                  ${totalSpent.toFixed(2)}
                </p>
                <p className="text-sm text-slate-400">Total Spent</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full neo-raised mb-4">
              <ShoppingBag className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-400 mb-4">
              When you place an order, it will appear here
            </p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
