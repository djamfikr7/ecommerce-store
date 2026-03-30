'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItemsProps {
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

export default function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-white">Order Items</h2>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/products/${item.product.id}`}
              className="group flex gap-4 rounded-xl border border-gray-700/50 bg-gray-900/50 p-4 transition-all duration-300 hover:border-gray-600"
            >
              {/* Product Image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                <Image
                  src={item.product.images[0] || '/placeholder.png'}
                  alt={item.product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-white transition-colors group-hover:text-blue-400">
                  {item.product.name}
                </h3>
                <div className="mt-2 flex items-center gap-4">
                  <p className="text-sm text-gray-400">
                    Quantity: <span className="font-medium text-white">{item.quantity}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Price: <span className="font-medium text-white">${item.price.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center">
                <p className="text-lg font-bold text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
