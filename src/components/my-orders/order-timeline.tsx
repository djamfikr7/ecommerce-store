'use client'

import { motion } from 'framer-motion'
import { Check, Package, Truck, Home, Clock } from 'lucide-react'

interface OrderTimelineProps {
  status: string
  createdAt: string
}

interface TimelineStep {
  id: string
  label: string
  icon: React.ReactNode
  completed: boolean
  active: boolean
}

export default function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(status.toLowerCase())

  const steps: TimelineStep[] = [
    {
      id: 'pending',
      label: 'Order Placed',
      icon: <Clock className="h-5 w-5" />,
      completed: currentIndex >= 0,
      active: currentIndex === 0,
    },
    {
      id: 'processing',
      label: 'Processing',
      icon: <Package className="h-5 w-5" />,
      completed: currentIndex >= 1,
      active: currentIndex === 1,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      icon: <Truck className="h-5 w-5" />,
      completed: currentIndex >= 2,
      active: currentIndex === 2,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: <Home className="h-5 w-5" />,
      completed: currentIndex >= 3,
      active: currentIndex === 3,
    },
  ]

  // Handle cancelled status
  if (status.toLowerCase() === 'cancelled') {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <h2 className="mb-6 text-xl font-bold text-white">Order Status</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20">
              <span className="text-2xl">✕</span>
            </div>
            <p className="text-xl font-semibold text-red-400">Order Cancelled</p>
            <p className="mt-2 text-gray-400">This order has been cancelled</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-white">Order Status</h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-8 right-8 top-8 h-0.5 bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Icon Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                  step.completed
                    ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                    : step.active
                      ? 'animate-pulse border-blue-500 bg-gray-800 text-blue-400'
                      : 'border-gray-700 bg-gray-800 text-gray-500'
                }`}
              >
                {step.completed && !step.active ? <Check className="h-6 w-6" /> : step.icon}
              </motion.div>

              {/* Label */}
              <p
                className={`mt-3 text-center text-sm font-medium ${
                  step.completed || step.active ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.label}
              </p>

              {/* Date (only for completed steps) */}
              {step.completed && step.id === 'pending' && (
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 rounded-xl border border-gray-700 bg-gray-900/50 p-4"
      >
        <p className="text-center text-gray-300">
          {status.toLowerCase() === 'pending' &&
            'Your order has been received and is awaiting processing.'}
          {status.toLowerCase() === 'processing' && 'Your order is being prepared for shipment.'}
          {status.toLowerCase() === 'shipped' && 'Your order is on its way!'}
          {status.toLowerCase() === 'delivered' &&
            'Your order has been delivered. Enjoy your purchase!'}
        </p>
      </motion.div>
    </div>
  )
}
