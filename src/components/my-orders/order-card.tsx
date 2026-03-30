'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    createdAt: string
    status: string
    total: number
    items: Array<{
      id: string
      quantity: number
      price: number
      product: {
        name: string
        images: string[]
      }
    }>
  }
  onUpdate?: () => void
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  shipped: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  delivered: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
}

export default function OrderCard({ order, onUpdate }: OrderCardProps) {
  const router = useRouter()
  const statusStyle = statusColors[order.status.toLowerCase()] || statusColors.pending
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="cursor-pointer rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
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
                className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-900/50"
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
            <span className="ml-2 text-sm text-gray-400">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Status and Total */}
        <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-2">
          <div
            className={`rounded-xl px-4 py-2 ${statusStyle?.bg} ${statusStyle?.text} border ${statusStyle?.border} text-sm font-semibold capitalize`}
          >
            {order.status}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-xl font-bold text-white">${order.total.toFixed(2)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  )
}
