import { motion } from 'framer-motion'
import { SkeletonBase } from '@/components/ui/skeleton-loaders'

function OrderCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.2),0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm"
    >
      {/* Order header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonBase className="h-5 w-32" />
          <SkeletonBase className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-5 w-16" />
        </div>
      </div>

      {/* Order items */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="shrink-0 space-y-2">
            <SkeletonBase className="h-16 w-16 rounded-lg" />
            <SkeletonBase className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Order footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-700/50 pt-4">
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-9 w-28 rounded-xl" />
      </div>
    </motion.div>
  )
}

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header skeleton */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <SkeletonBase className="mb-2 h-10 w-48" />
          <SkeletonBase className="h-5 w-64" />
        </motion.div>

        {/* Filters skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBase className="mb-2 h-4 w-24" />
                <SkeletonBase className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>

          {/* Status pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBase key={i} className="h-9 w-24 rounded-xl" />
            ))}
          </div>
        </motion.div>

        {/* Orders list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderCardSkeleton key={i} index={i} />
          ))}
        </div>

        {/* Pagination skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <SkeletonBase className="h-10 w-24 rounded-xl" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBase key={i} className="h-10 w-10 rounded-xl" />
            ))}
          </div>
          <SkeletonBase className="h-10 w-24 rounded-xl" />
        </motion.div>
      </div>
    </div>
  )
}
