import { motion } from 'framer-motion'
import { SkeletonBase } from '@/components/ui/skeleton-loaders'

function CartItemSkeleton() {
  return (
    <div className="neo-flat flex flex-col gap-5 rounded-2xl bg-white/5 p-6 backdrop-blur-sm sm:flex-row sm:items-center">
      <SkeletonBase className="h-28 w-28 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <SkeletonBase className="h-3 w-16" />
          <SkeletonBase className="h-5 w-3/4" />
          <SkeletonBase className="h-4 w-24" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-9 w-9 rounded-lg" />
            <SkeletonBase className="h-5 w-8" />
            <SkeletonBase className="h-9 w-9 rounded-lg" />
          </div>
          <SkeletonBase className="h-6 w-20" />
        </div>
      </div>
      <SkeletonBase className="h-8 w-8 shrink-0 rounded-lg" />
    </div>
  )
}

function CartSummarySkeleton() {
  return (
    <div className="neo-card space-y-6 rounded-2xl p-6">
      <SkeletonBase className="h-6 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <SkeletonBase className={`h-4 ${i === 3 ? 'w-12' : 'w-20'}`} />
            <SkeletonBase className={`h-4 ${i === 3 ? 'w-14' : 'w-16'}`} />
          </div>
        ))}
      </div>
      <div className="border-border-subtle border-t pt-4">
        <div className="flex justify-between">
          <SkeletonBase className="h-6 w-16" />
          <SkeletonBase className="h-6 w-20" />
        </div>
      </div>
      <SkeletonBase className="h-12 w-full rounded-xl" />
      <div className="space-y-3">
        <SkeletonBase className="h-10 w-full rounded-xl" />
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-4 w-4" />
          <SkeletonBase className="h-4 w-48" />
        </div>
      </div>
    </div>
  )
}

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface-base to-surface-elevated py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header skeleton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SkeletonBase className="mb-4 h-4 w-32" />
          <div className="flex items-center gap-4">
            <SkeletonBase className="h-8 w-8 rounded-full" />
            <SkeletonBase className="h-10 w-48" />
            <SkeletonBase className="h-6 w-16 rounded-full" />
          </div>
        </motion.div>

        {/* Cart content skeleton */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 lg:col-span-2"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <CartItemSkeleton />
              </motion.div>
            ))}

            {/* Help section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="neo-flat mt-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm"
            >
              <SkeletonBase className="mb-4 h-5 w-24" />
              <div className="space-y-3">
                <SkeletonBase className="h-4 w-64" />
                <SkeletonBase className="h-4 w-48" />
                <SkeletonBase className="h-4 w-56" />
              </div>
            </motion.div>
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <CartSummarySkeleton />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
