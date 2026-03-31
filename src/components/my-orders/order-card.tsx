'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Truck, Clock, Check, XCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    createdAt: string
    status: string
    total: number
    itemCount?: number
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
  onUpdate?: () => void
}

const statusConfig: Record<
  string,
  {
    bg: string
    text: string
    border: string
    icon: React.ReactNode
    gradient: string
  }
> = {
  pending: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/50',
    icon: <Clock className="h-4 w-4" />,
    gradient: 'from-yellow-600 to-orange-600',
  },
  confirmed: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    icon: <Check className="h-4 w-4" />,
    gradient: 'from-blue-600 to-cyan-600',
  },
  processing: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    icon: <Package className="h-4 w-4" />,
    gradient: 'from-blue-600 to-purple-600',
  },
  shipped: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/50',
    icon: <Truck className="h-4 w-4" />,
    gradient: 'from-purple-600 to-pink-600',
  },
  delivered: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/50',
    icon: <Check className="h-4 w-4" />,
    gradient: 'from-green-600 to-emerald-600',
  },
  cancelled: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
    icon: <XCircle className="h-4 w-4" />,
    gradient: 'from-red-600 to-rose-600',
  },
  refunded: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/50',
    icon: <RefreshCw className="h-4 w-4" />,
    gradient: 'from-gray-600 to-slate-600',
  },
}

export default function OrderCard({ order, onUpdate: _onUpdate }: OrderCardProps) {
  const router = useRouter()
  const config = statusConfig[order.status.toLowerCase()] ?? statusConfig.pending!
  const totalItems = order.itemCount || order.items.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:border-gray-600"
      onClick={() => router.push(`/my-orders/${order.id}`)}
    >
      {/* Status Gradient Bar */}
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Order Info */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-lg bg-gray-900/50 p-2">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Product Preview */}
            <div className="mt-4 flex items-center gap-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-900/50 ring-2 ring-gray-800"
                  style={{ zIndex: 3 - index, marginLeft: index > 0 ? '-8px' : '0' }}
                >
                  <Image
                    src={item.product.images[0] || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-sm font-medium text-gray-400">
                  +{order.items.length - 3}
                </div>
              )}
              <span className="ml-2 text-sm text-gray-400">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Status and Total */}
          <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 ${config.bg} ${config.text} border ${config.border} text-sm font-semibold capitalize`}
            >
              {config.icon}
              {order.status}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-xl font-bold text-white">{formatCurrency(order.total)}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
